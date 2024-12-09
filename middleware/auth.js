const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Middleware d'authentification principal
const auth = async (req, res, next) => {
    try {
        // Récupérer le token depuis le cookie ou l'en-tête Authorization
        const token = req.cookies.token || 
                      req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentification requise'
            });
        }

        // Vérifier et décoder le token
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'test_secret_key'
        );

        // Rechercher l'utilisateur
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérifier si le compte est actif et vérifié
        if (!user.isActive || !user.isVerified) {
            return res.status(403).json({
                status: 'error',
                message: 'Compte inactif ou non vérifié'
            });
        }

        // Attacher l'utilisateur à la requête
        req.token = token;
        req.user = user;
        next();

    } catch (error) {
        console.error('Erreur d\'authentification:', error);

        // Gestion spécifique des erreurs de token
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token invalide'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token expiré'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Erreur serveur lors de l\'authentification'
        });
    }
};

// Middleware d'authentification optionnel
const optionalAuth = async (req, res, next) => {
    try {
        // Récupérer le token depuis le cookie ou l'en-tête Authorization
        const token = req.cookies.token || 
                      req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            try {
                // Vérifier et décoder le token
                const decoded = jwt.verify(
                    token, 
                    process.env.JWT_SECRET || 'test_secret_key'
                );

                // Rechercher l'utilisateur
                const user = await User.findById(decoded.userId);

                if (user) {
                    req.user = user;
                    req.token = token;
                    req.isAuthenticated = true;
                } else {
                    req.isAuthenticated = false;
                }
            } catch (error) {
                req.isAuthenticated = false;
            }
        } else {
            req.isAuthenticated = false;
        }

        next();
    } catch (error) {
        console.error('Erreur d\'authentification optionnelle:', error);
        next();
    }
};

// Middleware de limitation de requêtes pour prévenir les attaques par force brute
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite de 100 requêtes par fenêtre
    standardHeaders: true, // Retourne les informations de limite dans les en-têtes `RateLimit-*`
    legacyHeaders: false, // Désactiver les en-têtes `X-RateLimit-*`
    message: {
        status: 'error',
        message: 'Trop de tentatives. Veuillez réessayer plus tard.'
    }
});

// Middleware pour les rôles admin
const adminAuth = async (req, res, next) => {
    try {
        // D'abord, passer par l'authentification principale
        await auth(req, res, async () => {
            // Vérifier si l'utilisateur est un admin
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Accès refusé. Droits administrateur requis.'
                });
            }
            next();
        });
    } catch (error) {
        console.error('Erreur d\'authentification admin:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur serveur lors de l\'authentification admin'
        });
    }
};

module.exports = {
    auth,
    optionalAuth,
    adminAuth,
    authLimiter
};
