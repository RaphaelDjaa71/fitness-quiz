const express = require('express');
const mongoose = require('mongoose');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Importer la configuration de session
const { sessionOptions, sessionMiddleware, initPassport } = require('./config/session');

const setupSecurity = require('./config/security');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');

const app = express();

// Configuration de la base de données
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Middleware de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Routes protégées
app.get('/quiz.html', (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login.html?redirect=/quiz.html');
    }
});

// Routes d'authentification publiques
app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/forgot-password.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Initialisation des sessions et de Passport
initPassport(app);

// Middleware de gestion des sessions
app.use(sessionMiddleware);

// Configuration CSRF
const csrfProtection = csrf({ 
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
});

// Routes publiques (sans CSRF)
app.use('/api/auth/signup', (req, res, next) => next());
app.use('/api/auth/login', (req, res, next) => next());

// Appliquer CSRF aux routes protégées
app.use(csrfProtection);

// Middleware pour ajouter le token CSRF aux réponses
app.use((req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    next();
});

// Middleware de vérification d'authentification pour le quiz
const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login.html?redirect=/quiz-start.html');
};

// Route protégée pour le quiz
app.get('/quiz-start.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz-start.html'));
});

app.get('/quiz.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
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

// Configuration de la sécurité
setupSecurity(app);

// Routes API
app.use('/api/auth', authRoutes);
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

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({
        status: 'error',
        message: 'Une erreur serveur est survenue',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
