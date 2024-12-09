class AuthService {
    constructor() {
        // Utilisateurs prédéfinis pour la simulation
        this.users = [
            {
                email: 'admin@fitness-quiz.com',
                password: 'Admin123!',
                name: 'Administrateur',
                role: 'admin'
            },
            {
                email: 'user@fitness-quiz.com',
                password: 'User123!',
                name: 'Utilisateur',
                role: 'user'
            }
        ];
    }

    // Méthode de connexion simulée
    async login(email, password) {
        return new Promise((resolve, reject) => {
            // Simulation d'un délai de requête
            setTimeout(() => {
                const user = this.users.find(u => 
                    u.email === email && u.password === password
                );

                if (user) {
                    // Générer un token JWT simulé
                    const token = this.generateToken(user);
                    resolve({
                        status: 'success',
                        user: {
                            email: user.email,
                            name: user.name,
                            role: user.role
                        },
                        token: token
                    });
                } else {
                    reject({
                        status: 'error',
                        message: 'Email ou mot de passe incorrect'
                    });
                }
            }, 500); // Délai de 500ms pour simuler une requête réseau
        });
    }

    // Génération d'un token JWT simulé
    generateToken(user) {
        const payload = {
            email: user.email,
            name: user.name,
            role: user.role,
            exp: Date.now() + (24 * 60 * 60 * 1000) // Expiration dans 24h
        };
        
        // Conversion en chaîne base64 pour simuler un token
        return btoa(JSON.stringify(payload));
    }

    // Validation du token
    validateToken(token) {
        try {
            const payload = JSON.parse(atob(token));
            return payload.exp > Date.now();
        } catch (error) {
            return false;
        }
    }

    // Méthode de récupération de mot de passe
    async forgotPassword(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.users.find(u => u.email === email);
                
                if (user) {
                    // Générer un token de réinitialisation
                    const resetToken = this.generateResetToken();
                    resolve({
                        status: 'success',
                        message: 'Un lien de réinitialisation a été envoyé à votre email',
                        resetToken: resetToken
                    });
                } else {
                    reject({
                        status: 'error',
                        message: 'Aucun compte associé à cet email'
                    });
                }
            }, 500);
        });
    }

    // Génération d'un token de réinitialisation
    generateResetToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    // Réinitialisation du mot de passe
    async resetPassword(email, newPassword, resetToken) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const userIndex = this.users.findIndex(u => u.email === email);
                
                if (userIndex !== -1) {
                    // Mettre à jour le mot de passe
                    this.users[userIndex].password = newPassword;
                    resolve({
                        status: 'success',
                        message: 'Mot de passe réinitialisé avec succès'
                    });
                } else {
                    reject({
                        status: 'error',
                        message: 'Impossible de réinitialiser le mot de passe'
                    });
                }
            }, 500);
        });
    }
}

// Instancier le service d'authentification
window.authService = new AuthService();
