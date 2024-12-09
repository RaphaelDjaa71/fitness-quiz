// Service avancé de gestion des rôles et permissions
window.advancedRoleService = {
    // Définition des rôles et permissions
    ROLES: {
        admin: {
            level: 100,
            permissions: [
                'dashboard.view',
                'dashboard.edit',
                'users.manage',
                'users.create',
                'users.delete',
                'programs.manage',
                'quiz.manage',
                'settings.modify'
            ]
        },
        coach: {
            level: 75,
            permissions: [
                'dashboard.view',
                'users.view',
                'programs.view',
                'programs.create',
                'quiz.view',
                'quiz.create'
            ]
        },
        trainer: {
            level: 50,
            permissions: [
                'dashboard.view',
                'programs.view',
                'quiz.view'
            ]
        },
        user: {
            level: 10,
            permissions: [
                'dashboard.view'
            ]
        }
    },

    // Vérification hiérarchique des permissions
    hasPermission(user, requiredPermission) {
        if (!user || !user.role) return false;
        
        const userRole = this.ROLES[user.role];
        if (!userRole) return false;

        return userRole.permissions.includes(requiredPermission);
    },

    // Vérification de niveau d'accès
    hasAccessLevel(user, requiredLevel) {
        if (!user || !user.role) return false;
        
        const userRole = this.ROLES[user.role];
        return userRole && userRole.level >= requiredLevel;
    },

    // Filtrage dynamique des éléments d'interface
    filterUIElements(user) {
        const elementsToFilter = [
            { selector: '#userManagement', requiredPermission: 'users.manage' },
            { selector: '.admin-settings', requiredPermission: 'settings.modify' },
            { selector: '.program-creation', requiredPermission: 'programs.create' }
        ];

        elementsToFilter.forEach(element => {
            const uiElement = document.querySelector(element.selector);
            if (uiElement) {
                uiElement.style.display = this.hasPermission(user, element.requiredPermission) 
                    ? 'block' 
                    : 'none';
            }
        });
    },

    // Journalisation des tentatives d'accès non autorisées
    logUnauthorizedAccess(user, attemptedAction) {
        if (window.activityLogger) {
            window.activityLogger.log('unauthorized_access', {
                userRole: user.role,
                attemptedAction: attemptedAction,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Génération de rapport de sécurité
    generateSecurityReport(user) {
        return {
            role: user.role,
            permissionCount: this.ROLES[user.role].permissions.length,
            accessLevel: this.ROLES[user.role].level,
            lastLogin: user.lastLoginTimestamp,
            activePermissions: this.ROLES[user.role].permissions
        };
    }
};

// Initialisation du service
document.addEventListener('DOMContentLoaded', () => {
    const user = window.sessionManager.getUserFromSession();
    if (user) {
        window.advancedRoleService.filterUIElements(user);
    }
});
