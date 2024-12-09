// Constantes pour les rôles
const ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    TRAINER: 'trainer',
    COACH: 'coach'
};

class RoleService {
    constructor() {
        // Définition des rôles et de leurs permissions
        this.roles = {
            admin: {
                name: 'Administrateur',
                permissions: [
                    'dashboard.view',
                    'users.manage',
                    'quiz.create',
                    'quiz.edit',
                    'quiz.delete',
                    'results.view_all',
                    'settings.manage'
                ]
            },
            user: {
                name: 'Utilisateur',
                permissions: [
                    'dashboard.view_limited',
                    'quiz.take',
                    'results.view_own'
                ]
            },
            coach: {
                name: 'Coach',
                permissions: [
                    'dashboard.view',
                    'quiz.create',
                    'results.view_all',
                    'users.track_progress'
                ]
            },
            trainer: {
                name: 'Trainer',
                permissions: [
                    'dashboard.view',
                    'quiz.create',
                    'results.view_all',
                    'users.track_progress'
                ]
            }
        };

        this.currentUser = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du service de rôles:', error);
        }

        this.initialized = true;
        this.applyRoleBasedRestrictions();
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.roles.includes(role);
    }

    hasAnyRole(roles) {
        return this.currentUser && roles.some(role => this.currentUser.roles.includes(role));
    }

    hasPermission(permission) {
        return this.currentUser && this.currentUser.permissions.includes(permission);
    }

    applyRoleBasedRestrictions() {
        // Cacher/montrer les éléments basés sur les rôles
        document.querySelectorAll('[data-roles]').forEach(element => {
            const requiredRoles = element.dataset.roles.split(',');
            if (!this.hasAnyRole(requiredRoles)) {
                element.style.display = 'none';
            }
        });

        // Cacher/montrer les éléments basés sur les permissions
        document.querySelectorAll('[data-permissions]').forEach(element => {
            const requiredPermissions = element.dataset.permissions.split(',');
            const hasPermission = requiredPermissions.some(permission => 
                this.hasPermission(permission)
            );
            if (!hasPermission) {
                element.style.display = 'none';
            }
        });

        // Rediriger si la page entière nécessite un rôle spécifique
        const requiredPageRoles = document.body.dataset.requiredRoles;
        if (requiredPageRoles) {
            const roles = requiredPageRoles.split(',');
            if (!this.hasAnyRole(roles)) {
                window.location.href = '/unauthorized.html';
            }
        }
    }

    // Méthode utilitaire pour vérifier si l'utilisateur est admin
    isAdmin() {
        return this.hasRole(ROLES.ADMIN);
    }

    // Méthode utilitaire pour vérifier si l'utilisateur est trainer
    isTrainer() {
        return this.hasRole(ROLES.TRAINER);
    }

    // Vérifier si un utilisateur a une permission spécifique
    hasPermissionUser(user, permission) {
        if (!user || !user.role) return false;
        
        const userRole = this.roles[user.role];
        return userRole && userRole.permissions.includes(permission);
    }

    // Obtenir les permissions d'un rôle
    getRolePermissions(roleName) {
        return this.roles[roleName]?.permissions || [];
    }

    // Obtenir la liste des rôles disponibles
    getAvailableRoles() {
        return Object.keys(this.roles).map(role => ({
            id: role,
            name: this.roles[role].name
        }));
    }

    // Gérer la redirection basée sur les rôles
    handleRoleBasedRedirect(user) {
        if (!user) {
            window.location.href = '/login.html';
            return false;
        }

        switch(user.role) {
            case 'admin':
                window.location.href = '/admin/dashboard.html';
                break;
            case 'coach':
                window.location.href = '/coach/dashboard.html';
                break;
            case 'user':
                window.location.href = '/user/dashboard.html';
                break;
            case 'trainer':
                window.location.href = '/trainer/dashboard.html';
                break;
            default:
                window.location.href = '/login.html';
                return false;
        }
        return true;
    }

    // Restreindre l'accès à une page en fonction du rôle
    restrictPageAccess(requiredPermission) {
        const user = window.sessionManager.getUserFromSession();
        
        if (!user) {
            window.location.href = '/login.html';
            return false;
        }

        if (!this.hasPermissionUser(user, requiredPermission)) {
            // Rediriger vers une page d'accès non autorisé
            window.location.href = '/unauthorized.html';
            return false;
        }

        return true;
    }

    // Filtrer les éléments d'interface en fonction des permissions
    filterUIElements() {
        const user = window.sessionManager.getUserFromSession();
        if (!user) return;

        // Sélectionner tous les éléments avec des attributs de permission
        const permissionElements = document.querySelectorAll('[data-permission]');
        
        permissionElements.forEach(element => {
            const requiredPermission = element.getAttribute('data-permission');
            
            if (!this.hasPermissionUser(user, requiredPermission)) {
                // Masquer ou désactiver l'élément
                element.style.display = 'none';
                element.disabled = true;
            }
        });
    }
}

// Créer et exporter une instance unique
const roleService = new RoleService();

// Initialiser le service quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    roleService.initialize();
});

// Exporter le service
window.roleService = roleService;
