require('dotenv').config();

// Importer la configuration de session
const { sessionMiddleware, debugSessionMiddleware } = require('./middleware/session');
const initPassport = require('./config/passport');

const setupSecurity = require('./config/security');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const passwordRoutes = require('./routes/password'); // Ajouter l'import des routes de mot de passe

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

const app = express();

// Configuration de la base de données
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-quiz', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));
}

// Middleware de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));

// Initialisation des sessions
app.use(sessionMiddleware);

// Initialisation de Passport
initPassport(app);

// Middleware de débogage pour les tests
if (process.env.NODE_ENV === 'test') {
    app.use(debugSessionMiddleware);
    app.use((req, res, next) => {
        console.log(' Requête reçue:', {
            method: req.method,
            path: req.path,
            body: req.body,
            cookies: req.cookies,
            headers: req.headers
        });
        next();
    });

    // Bypass CSRF pour les tests
    app.use((req, res, next) => {
        req.csrfToken = () => 'test-token';
        next();
    });
} else {
    // Configuration CSRF pour production/développement
    const csrfProtection = csrf({ 
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        }
    });

    // Appliquer CSRF à toutes les routes sauf /api/auth/*
    app.use((req, res, next) => {
        if (req.path.startsWith('/api/auth/')) {
            return next();
        }
        csrfProtection(req, res, next);
    });

    // Middleware pour ajouter le token CSRF aux réponses
    app.use((req, res, next) => {
        if (req.csrfToken) {
            res.cookie('XSRF-TOKEN', req.csrfToken(), {
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        }
        next();
    });
}

// Middleware de vérification d'authentification pour le quiz
const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login.html?redirect=/quiz-start.html');
};

// Route protégée pour la page d'accueil
app.get('/', (req, res, next) => {
    // Vérifier si l'utilisateur est authentifié
    if (!req.isAuthenticated()) {
        // Rediriger vers la page de connexion
        return res.redirect('/login.html');
    }
    
    // Si authentifié, servir la page d'accueil
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route protégée pour le quiz
app.get('/quiz-start.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz-start.html'));
});

app.get('/quiz.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordRoutes); // Ajouter les routes de mot de passe
app.use('/api/quiz', quizRoutes);

// Routes pour les pages d'authentification
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route pour vérifier l'état de l'authentification
app.get('/api/auth/status', (req, res) => {
    res.json({ 
        isAuthenticated: req.isAuthenticated(),
        user: req.user,
        csrfToken: req.csrfToken()
    });
});

// Route de déconnexion d'urgence
app.get('/force-logout', (req, res) => {
    console.log('Tentative de déconnexion forcée');
    
    try {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Erreur lors de la destruction de la session:', err);
                    return res.status(500).json({
                        status: 'error',
                        message: 'Erreur lors de la déconnexion'
                    });
                }
                
                // Supprimer tous les cookies
                res.clearCookie('connect.sid', { 
                    path: '/',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax'
                });
                res.clearCookie('XSRF-TOKEN', { 
                    path: '/',
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax'
                });
                
                res.json({
                    status: 'success',
                    message: 'Déconnexion réussie'
                });
            });
        } else {
            res.json({
                status: 'success',
                message: 'Aucune session active'
            });
        }
    } catch (error) {
        console.error('Erreur lors de la déconnexion forcée:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la déconnexion',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Route par défaut pour le SPA
app.get('*', (req, res) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).json({ message: 'Not Found' });
    }
});

// Gestion des erreurs CSRF
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            status: 'error',
            message: 'Session invalide, veuillez rafraîchir la page'
        });
    }
    next(err);
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Une erreur serveur est survenue',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Configuration de la sécurité
setupSecurity(app);

// Démarrer le serveur uniquement si ce n'est pas un test
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
    });
}

module.exports = app;
