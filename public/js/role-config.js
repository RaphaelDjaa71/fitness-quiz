// Configuration centralisée des rôles et permissions

const ROLE_CONFIG = {
    ROLES: {
        ADMIN: 'admin',
        USER: 'user',
        COACH: 'coach',
        TRAINER: 'trainer'
    },
    PERMISSIONS: {
        // Permissions pour le tableau de bord
        DASHBOARD: {
            VIEW_ALL: 'dashboard.view',
            VIEW_LIMITED: 'dashboard.view_limited'
        },
        
        // Permissions pour les utilisateurs
        USERS: {
            MANAGE: 'users.manage',
            TRACK_PROGRESS: 'users.track_progress'
        },
        
        // Permissions pour les quiz
        QUIZ: {
            CREATE: 'quiz.create',
            EDIT: 'quiz.edit',
            DELETE: 'quiz.delete',
            TAKE: 'quiz.take'
        },
        
        // Permissions pour les résultats
        RESULTS: {
            VIEW_ALL: 'results.view_all',
            VIEW_OWN: 'results.view_own'
        },
        
        // Permissions pour les paramètres
        SETTINGS: {
            MANAGE: 'settings.manage'
        }
    },
    
    // Définition des rôles et de leurs permissions par défaut
    ROLE_PERMISSIONS: {
        admin: [
            'dashboard.view',
            'users.manage',
            'quiz.create',
            'quiz.edit',
            'quiz.delete',
            'results.view_all',
            'settings.manage'
        ],
        user: [
            'dashboard.view_limited',
            'quiz.take',
            'results.view_own'
        ],
        coach: [
            'dashboard.view',
            'quiz.create',
            'results.view_all',
            'users.track_progress'
        ],
        trainer: [
            'dashboard.view',
            'quiz.create',
            'results.view_all',
            'users.track_progress'
        ]
    }
};

// Exporter la configuration pour une utilisation globale
window.ROLE_CONFIG = ROLE_CONFIG;

// Fonction utilitaire pour vérifier les permissions
function checkPermission(user, permission) {
    if (!user || !user.role) return false;
    
    const rolePermissions = ROLE_CONFIG.ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
}

// Ajouter la fonction à l'objet global
window.checkPermission = checkPermission;
