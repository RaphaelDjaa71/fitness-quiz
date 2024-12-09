const session = require('express-session');
const MongoStore = require('connect-mongo');

// Configuration de la session
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'test_secret_key',
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        sameSite: 'lax'
    },
    store: process.env.NODE_ENV === 'test'
        ? new session.MemoryStore() // Utiliser MemoryStore pour les tests
        : MongoStore.create({
            mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-quiz',
            ttl: 7 * 24 * 60 * 60, // 7 jours
            autoRemove: 'interval',
            autoRemoveInterval: 10, // En minutes
            touchAfter: 24 * 3600 // 24 heures
        })
});

// Middleware de débogage pour les tests
const debugSessionMiddleware = (req, res, next) => {
    if (process.env.NODE_ENV === 'test') {
        console.log('🔍 Session Debug:', {
            sessionID: req.sessionID,
            session: req.session,
            cookies: req.cookies,
            user: req.user
        });
    }
    next();
};

module.exports = {
    sessionMiddleware,
    debugSessionMiddleware
};
