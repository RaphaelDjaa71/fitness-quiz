const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Middleware d'authentification principal désactivé
const auth = async (req, res, next) => {
    // Bypass de toutes les vérifications
    next();
};

// Middleware d'authentification optionnel désactivé
const optionalAuth = (req, res, next) => {
    // Bypass de toutes les vérifications
    next();
};

// Middleware de limitation de requêtes désactivé
const authLimiter = (req, res, next) => {
    // Bypass de toutes les limitations
    next();
};

// Middleware pour les rôles admin désactivé
const adminAuth = (req, res, next) => {
    // Bypass de toutes les vérifications de rôle
    next();
};

module.exports = {
    auth,
    optionalAuth,
    adminAuth,
    authLimiter
};
