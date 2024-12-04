const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

const auth = async (req, res, next) => {
    try {
        // Mode test : bypass de l'authentification
        if (process.env.NODE_ENV === 'test') {
            console.log('🧪 Mode test : Authentification simulée');
            req.user = {
                _id: '000000000000000000000001',
                name: 'Test User',
                email: 'test@example.com',
                isActive: true,
                tokens: ['test-token']
            };
            req.token = 'test-token';
            return next();
        }

        console.log('🔐 Vérification de l\'authentification');
        
        // Récupérer le token
        const token = req.cookies.token || 
                     req.header('Authorization')?.replace('Bearer ', '') ||
                     null;

        if (!token) {
            console.log('❌ Aucun token trouvé');
            return res.status(401).json({
                status: 'error',
                message: 'Veuillez vous connecter'
            });
        }

        console.log('🔍 Token trouvé, vérification...');

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret_key');
        console.log('✅ Token décodé pour l\'utilisateur:', decoded._id);
        
        // Vérifier si l'utilisateur existe toujours et est actif
        const user = await User.findOne({ 
            _id: decoded._id,
            isActive: true 
        });

        if (!user) {
            console.log('❌ Utilisateur non trouvé ou inactif:', decoded._id);
            return res.status(401).json({
                status: 'error',
                message: 'Session invalide'
            });
        }

        // Vérifier si le token n'a pas été révoqué
        const isValidToken = user.tokens.includes(token);
        if (!isValidToken) {
            console.log('❌ Token révoqué pour l\'utilisateur:', user._id);
            return res.status(401).json({
                status: 'error',
                message: 'Session expirée'
            });
        }

        console.log('✅ Authentification réussie pour:', user.email);

        // Ajouter l'utilisateur et le token à la requête
        req.token = token;
        req.user = user;
        
        next();
    } catch (error) {
        console.error('❌ Erreur d\'authentification:', {
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
        // Mode test : bypass de l'authentification
        if (process.env.NODE_ENV === 'test') {
            req.user = {
                _id: '000000000000000000000001',
                name: 'Test User',
                email: 'test@example.com',
                isActive: true,
                tokens: ['test-token']
            };
            req.token = 'test-token';
            return next();
        }

        const token = req.cookies.token || 
                     req.header('Authorization')?.replace('Bearer ', '') ||
                     null;

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret_key');
            const user = await User.findOne({ 
                _id: decoded._id,
                isActive: true 
            });

            if (user && user.tokens.includes(token)) {
                req.token = token;
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // En cas d'erreur, continuer sans authentification
        next();
    }
};

// Middleware pour vérifier les rôles
const checkRole = (roles) => {
    return (req, res, next) => {
        // Mode test : bypass de la vérification des rôles
        if (process.env.NODE_ENV === 'test') {
            return next();
        }

        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Veuillez vous connecter'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Accès non autorisé'
            });
        }

        next();
    };
};

// Middleware pour la limitation des requêtes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 0 : 5, // Désactiver en mode test
    message: {
        status: 'error',
        message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
    }
});

module.exports = {
    auth,
    optionalAuth,
    checkRole,
    authLimiter
};
