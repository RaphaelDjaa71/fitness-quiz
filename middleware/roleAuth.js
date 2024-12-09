const User = require('../models/User');

// Middleware pour vérifier les rôles
const checkRole = (roles) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Non authentifié'
            });
        }

        try {
            const user = await User.findById(req.user._id);
            
            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Utilisateur non trouvé'
                });
            }

            // Vérifier si l'utilisateur a au moins un des rôles requis
            const hasRole = roles.some(role => user.roles.includes(role));
            
            if (!hasRole) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Accès non autorisé'
                });
            }

            // Ajouter les rôles à l'objet req pour utilisation ultérieure
            req.userRoles = user.roles;
            next();
        } catch (error) {
            console.error('Erreur lors de la vérification des rôles:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur serveur'
            });
        }
    };
};

// Middleware pour vérifier les permissions
const checkPermission = (permissions) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Non authentifié'
            });
        }

        try {
            const user = await User.findById(req.user._id);
            
            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Utilisateur non trouvé'
                });
            }

            // Vérifier si l'utilisateur a au moins une des permissions requises
            const hasPermission = permissions.some(permission => 
                user.permissions.includes(permission)
            );
            
            if (!hasPermission) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Permission non accordée'
                });
            }

            // Ajouter les permissions à l'objet req pour utilisation ultérieure
            req.userPermissions = user.permissions;
            next();
        } catch (error) {
            console.error('Erreur lors de la vérification des permissions:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erreur serveur'
            });
        }
    };
};

// Constantes pour les rôles
const ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    TRAINER: 'trainer'
};

module.exports = {
    checkRole,
    checkPermission,
    ROLES
};
