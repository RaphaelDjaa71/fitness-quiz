const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');

// Configuration des options de session
const sessionOptions = {
    secret: process.env.SESSION_SECRET || 'votre_secret_de_session_par_defaut',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60, // Durée de vie de la session : 24 heures
        autoRemove: 'interval',
        autoRemoveInterval: 60 // Nettoyer les sessions expirées toutes les heures
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en production
        httpOnly: true, // Empêche l'accès au cookie côté client
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        sameSite: 'lax' // Protection contre les attaques CSRF
    }
};

// Middleware de gestion des sessions
const sessionMiddleware = session(sessionOptions);

// Initialisation de Passport
const initPassport = (app) => {
    // Configuration de Passport
    require('./passport'); // S'assurer que la configuration de Passport est chargée

    // Initialisation des middlewares Passport
    app.use(sessionMiddleware);
    app.use(passport.initialize());
    app.use(passport.session());

    // Middleware personnalisé pour ajouter isAuthenticated à req
    app.use((req, res, next) => {
        req.isAuthenticated = () => {
            return req.session && req.session.passport && req.session.passport.user;
        };
        next();
    });
};

module.exports = {
    sessionOptions,
    sessionMiddleware,
    initPassport
};
