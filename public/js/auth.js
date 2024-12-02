// Gestionnaire d'authentification
class AuthManager {
    constructor() {
        this.baseUrl = '/api/auth';
        this.setupFormValidation();
        this.setupEventListeners();
    }

    // Configuration de la validation des formulaires
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validateForm(form)) {
                    const formType = form.getAttribute('id');
                    switch (formType) {
                        case 'loginForm':
                            this.handleLogin(form);
                            break;
                        case 'signupForm':
                            this.handleSignup(form);
                            break;
                        case 'profileForm':
                            this.handleProfileUpdate(form);
                            break;
                        case 'passwordResetForm':
                            this.handlePasswordReset(form);
                            break;
                    }
                }
            });
        });
    }

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        // Validation en temps réel des champs
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
            });

            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });

        // Validation spéciale pour la confirmation du mot de passe
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }
    }

    // Validation d'un champ
    validateField(input) {
        const field = input.getAttribute('name');
        const value = input.value.trim();
        let isValid = true;
        let message = '';

        switch (field) {
            case 'name':
                if (value.length < 2) {
                    isValid = false;
                    message = 'Le nom doit contenir au moins 2 caractères';
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    message = 'Email invalide';
                }
                break;

            case 'password':
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
                if (!passwordRegex.test(value)) {
                    isValid = false;
                    message = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre';
                }
                break;
        }

        this.showFieldValidation(input, isValid, message);
        return isValid;
    }

    // Validation de la correspondance des mots de passe
    validatePasswordMatch() {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const isValid = password.value === confirmPassword.value;
        
        this.showFieldValidation(
            confirmPassword,
            isValid,
            isValid ? '' : 'Les mots de passe ne correspondent pas'
        );

        return isValid;
    }

    // Affichage de la validation des champs
    showFieldValidation(input, isValid, message) {
        const container = input.parentElement;
        const existingMessage = container.querySelector('.validation-message');
        
        if (existingMessage) {
            existingMessage.remove();
        }

        if (!isValid && message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'validation-message error';
            messageElement.textContent = message;
            container.appendChild(messageElement);
        }

        input.classList.toggle('is-invalid', !isValid);
        input.classList.toggle('is-valid', isValid);
    }

    // Validation du formulaire complet
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (form.id === 'signupForm' && !this.validatePasswordMatch()) {
            isValid = false;
        }

        return isValid;
    }

    // Gestion de la connexion
    async handleLogin(form) {
        const formData = new FormData(form);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };

        try {
            this.showLoading(form);
            const response = await this.sendRequest('/login', 'POST', data);
            
            if (response.ok) {
                window.location.href = '/profile.html';
            } else {
                const error = await response.json();
                this.showError(form, error.message || 'Erreur de connexion');
            }
        } catch (error) {
            this.showError(form, 'Erreur de connexion au serveur');
        } finally {
            this.hideLoading(form);
        }
    }

    // Gestion de l'inscription
    async handleSignup(form) {
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            this.showLoading(form);
            const response = await this.sendRequest('/signup', 'POST', data);
            
            if (response.ok) {
                window.location.href = '/profile.html';
            } else {
                const error = await response.json();
                this.showError(form, error.message || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            this.showError(form, 'Erreur de connexion au serveur');
        } finally {
            this.hideLoading(form);
        }
    }

    // Gestion de la mise à jour du profil
    async handleProfileUpdate(form) {
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email')
        };

        if (formData.get('currentPassword')) {
            data.currentPassword = formData.get('currentPassword');
            data.newPassword = formData.get('newPassword');
        }

        try {
            this.showLoading(form);
            const response = await this.sendRequest('/profile', 'PUT', data);
            
            if (response.ok) {
                this.showSuccess(form, 'Profil mis à jour avec succès');
            } else {
                const error = await response.json();
                this.showError(form, error.message || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            this.showError(form, 'Erreur de connexion au serveur');
        } finally {
            this.hideLoading(form);
        }
    }

    // Gestion de la réinitialisation du mot de passe
    async handlePasswordReset(form) {
        const formData = new FormData(form);
        const data = {
            email: formData.get('email')
        };

        try {
            this.showLoading(form);
            const response = await this.sendRequest('/forgot-password', 'POST', data);
            
            if (response.ok) {
                this.showSuccess(form, 'Instructions envoyées par email');
                form.reset();
            } else {
                const error = await response.json();
                this.showError(form, error.message || 'Erreur lors de la réinitialisation');
            }
        } catch (error) {
            this.showError(form, 'Erreur de connexion au serveur');
        } finally {
            this.hideLoading(form);
        }
    }

    // Envoi des requêtes API
    async sendRequest(endpoint, method, data) {
        const response = await fetch(this.baseUrl + endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': this.getCsrfToken()
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        return response;
    }

    // Récupération du token CSRF
    getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.content;
    }

    // Affichage du chargement
    showLoading(form) {
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span> Chargement...';
    }

    // Masquage du chargement
    hideLoading(form) {
        const button = form.querySelector('button[type="submit"]');
        button.disabled = false;
        button.textContent = button.getAttribute('data-original-text') || 'Envoyer';
    }

    // Affichage des erreurs
    showError(form, message) {
        const errorDiv = form.querySelector('.alert-error') || document.createElement('div');
        errorDiv.className = 'alert alert-error';
        errorDiv.textContent = message;
        
        if (!form.querySelector('.alert-error')) {
            form.insertBefore(errorDiv, form.firstChild);
        }

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Affichage des succès
    showSuccess(form, message) {
        const successDiv = form.querySelector('.alert-success') || document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.textContent = message;
        
        if (!form.querySelector('.alert-success')) {
            form.insertBefore(successDiv, form.firstChild);
        }

        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
}

// Fonction pour vérifier l'utilisateur actuel
async function checkCurrentUser() {
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Important pour envoyer les cookies
        });

        const data = await response.json();

        if (response.ok) {
            // L'utilisateur est connecté
            return {
                isAuthenticated: true,
                user: data.data.user
            };
        } else {
            // L'utilisateur n'est pas connecté
            return {
                isAuthenticated: false,
                user: null
            };
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', error);
        return {
            isAuthenticated: false,
            user: null,
            error: 'Erreur de connexion'
        };
    }
}

// Fonction pour mettre à jour l'interface utilisateur en fonction de l'état de connexion
async function updateAuthUI() {
    const authStatus = await checkCurrentUser();
    const authContainer = document.getElementById('auth-container');
    const userInfoContainer = document.getElementById('user-info');

    if (authStatus.isAuthenticated && authStatus.user) {
        // Utilisateur connecté
        if (userInfoContainer) {
            userInfoContainer.innerHTML = `
                <div class="user-profile">
                    <h3>Bienvenue, ${authStatus.user.name}</h3>
                    <p>Email: ${authStatus.user.email}</p>
                    <button onclick="logout()" class="btn btn-secondary">Se déconnecter</button>
                </div>
            `;
            userInfoContainer.style.display = 'block';
        }
        if (authContainer) {
            authContainer.style.display = 'none';
        }
    } else {
        // Utilisateur non connecté
        if (userInfoContainer) {
            userInfoContainer.style.display = 'none';
        }
        if (authContainer) {
            authContainer.style.display = 'block';
        }
    }
}

// Vérifier l'état de l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    new AuthManager();
    await updateAuthUI();
});
