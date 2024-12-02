const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        console.log('Vérification de l\'authentification');
        
        // Récupérer le token
        const token = req.cookies.token || 
                     req.header('Authorization')?.replace('Bearer ', '') ||
                     null;

        if (!token) {
            console.log('Aucun token trouvé');
            return res.status(401).json({
                status: 'error',
                message: 'Veuillez vous connecter'
            });
        }

        console.log('Token trouvé, vérification...');

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token décodé pour l\'utilisateur:', decoded._id);
        
        // Vérifier si l'utilisateur existe toujours et est actif
        const user = await User.findOne({ 
            _id: decoded._id,
            isActive: true 
        });

        if (!user) {
            console.log('Utilisateur non trouvé ou inactif:', decoded._id);
            return res.status(401).json({
                status: 'error',
                message: 'Session invalide'
            });
        }

        // Vérifier si le token n'a pas été révoqué
        const isValidToken = user.tokens.includes(token);
        if (!isValidToken) {
            console.log('Token révoqué pour l\'utilisateur:', user._id);
            return res.status(401).json({
                status: 'error',
                message: 'Session expirée'
            });
        }

        console.log('Authentification réussie pour:', user.email);

        // Ajouter l'utilisateur et le token à la requête
        req.token = token;
        req.user = user;
        
        next();
    } catch (error) {
        console.error('Erreur d\'authentification:', {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            path: req.path,
            method: req.method
        });
        
        // Nettoyer le cookie si présent
        res.clearCookie('token');
        
        // Envoyer une réponse appropriée selon le type d'erreur
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Session invalide'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Session expirée'
            });
        }
        
        res.status(401).json({ 
            status: 'error',
            message: 'Veuillez vous connecter',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Middleware pour les routes qui nécessitent une authentification facultative
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || 
                     req.header('Authorization')?.replace('Bearer ', '') ||
                     null;

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ 
                _id: decoded._id,
                isActive: true 
            });

            if (user) {
                req.user = user;
                req.token = token;
            }
        }
        next();
    } catch (error) {
        // En cas d'erreur, on continue sans authentification
        next();
    }
};

// Middleware pour vérifier les rôles
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        next();
    };
};

// Middleware pour la limitation des requêtes
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false
});

// Middleware pour la validation CSRF
const csrf = require('csurf');
const csrfProtection = csrf({ 
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});

module.exports = {
    auth,
    optionalAuth,
    checkRole,
    authLimiter
};
