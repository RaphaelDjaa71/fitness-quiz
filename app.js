require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');

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

// Configuration des sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 14 * 24 * 60 * 60 // 14 jours
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 1000 // 14 jours
    }
}));

// Protection CSRF
app.use(csrf({ cookie: true }));

// Configuration de la sécurité
setupSecurity(app);

// Initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);

// Route pour vérifier l'état de l'authentification
app.get('/api/auth/status', (req, res) => {
    res.json({ 
        isAuthenticated: req.isAuthenticated(),
        user: req.user ? {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
        } : null
    });
});

// Gestion des erreurs 404
app.use((req, res, next) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'public', '404.html'));
        return;
    }
    res.status(404).json({ error: 'Page non trouvée' });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            error: 'Session expirée, veuillez rafraîchir la page'
        });
    }

    if (req.accepts('html')) {
        res.status(500).sendFile(path.join(__dirname, 'public', '500.html'));
        return;
    }
    
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Une erreur est survenue' 
            : err.message 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
