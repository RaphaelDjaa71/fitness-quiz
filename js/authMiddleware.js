// Middleware d'authentification côté client
class AuthMiddleware {
    static async checkAuth() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.redirectToLogin();
                return false;
            }

            const response = await fetch('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                this.redirectToLogin();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Erreur d\'authentification:', error);
            this.redirectToLogin();
            return false;
        }
    }

    static redirectToLogin() {
        const currentPath = window.location.pathname;
        // Ne pas rediriger si déjà sur une page d'auth
        if (!currentPath.includes('login') && !currentPath.includes('signup')) {
            window.location.href = `/login.html?redirect=${encodeURIComponent(currentPath)}`;
        }
    }

    static async init() {
        // Liste des pages qui ne nécessitent pas d'authentification
        const publicPages = ['/', '/index.html', '/login.html', '/signup.html'];
        const currentPath = window.location.pathname;

        // Vérifier si la page actuelle nécessite une authentification
        if (!publicPages.includes(currentPath)) {
            await this.checkAuth();
        }
    }

    static async saveQuizResult(answers) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Non authentifié');
            }

            const response = await fetch('/api/quiz/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ answers })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde des résultats');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des résultats:', error);
            throw error;
        }
    }

    static async getQuizResults() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Non authentifié');
            }

            const response = await fetch('/api/quiz/results', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des résultats');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des résultats:', error);
            throw error;
        }
    }
}

// Initialiser le middleware d'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    AuthMiddleware.init();
});
