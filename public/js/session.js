class SessionManager {
    constructor() {
        this.initializeSession();
        this.setupLogoutHandler();
    }

    initializeSession() {
        // Vérifier si l'utilisateur est connecté lors du chargement de la page
        const user = this.getUserFromSession();
        this.updateHeaderBasedOnSession(user);
    }

    getUserFromSession() {
        // Récupérer les informations de l'utilisateur depuis le localStorage
        const userJson = localStorage.getItem('user');
        return userJson ? JSON.parse(userJson) : null;
    }

    login(userData) {
        // Stocker les informations de l'utilisateur dans le localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        this.updateHeaderBasedOnSession(userData);
    }

    logout() {
        // Supprimer les informations de l'utilisateur du localStorage
        localStorage.removeItem('user');
        // Rediriger vers la page de connexion
        window.location.href = '/login.html';
    }

    updateHeaderBasedOnSession(user) {
        const authButtons = document.querySelector('.auth-buttons');
        const userInfoSection = document.querySelector('.user-info-section');

        if (user && authButtons && userInfoSection) {
            // Masquer les boutons de connexion/inscription
            authButtons.style.display = 'none';
            
            // Afficher les informations de l'utilisateur
            userInfoSection.style.display = 'flex';
            
            // Mettre à jour le nom de l'utilisateur
            const userNameElement = userInfoSection.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = user.name || user.email;
            }

            // Configurer le bouton de déconnexion
            const logoutButton = userInfoSection.querySelector('.logout-btn');
            if (logoutButton) {
                logoutButton.addEventListener('click', () => this.logout());
            }
        } else if (authButtons && userInfoSection) {
            // Afficher les boutons de connexion/inscription
            authButtons.style.display = 'flex';
            
            // Masquer les informations de l'utilisateur
            userInfoSection.style.display = 'none';
        }
    }

    setupLogoutHandler() {
        // Ajouter un écouteur global pour la déconnexion
        window.addEventListener('storage', (event) => {
            if (event.key === 'user' && event.newValue === null) {
                this.updateHeaderBasedOnSession(null);
            }
        });
    }
}

// Initialiser le gestionnaire de session
document.addEventListener('DOMContentLoaded', () => {
    window.sessionManager = new SessionManager();
});
