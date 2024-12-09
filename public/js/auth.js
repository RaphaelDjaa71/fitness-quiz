// Gestionnaire d'authentification
class AuthManager {
    constructor() {
        this.baseUrl = '/api/auth';
        this.setupFormValidation();
        this.setupEventListeners();
        this.checkAuthState();
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

    // Vérifier l'état de l'authentification
    async checkAuthState() {
        const currentPath = window.location.pathname;
        const authPages = ['/login.html', '/signup.html', '/forgot-password.html', '/reset-password.html', '/admin'];
        const publicPages = ['/admin']; // Pages accessibles sans authentification
        const isAuthenticated = await this.verifyAuth();
        
        // Si l'utilisateur est authentifié et essaie d'accéder aux pages d'auth
        if (isAuthenticated && authPages.includes(currentPath) && !publicPages.includes(currentPath)) {
            window.location.href = '/quiz-start.html'; // Rediriger vers la page de démarrage du quiz
            return;
        }
        
        // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une page protégée
        if (!isAuthenticated && !authPages.includes(currentPath) && !publicPages.includes(currentPath) && currentPath !== '/') {
            window.location.href = '/login.html';
        }
    }

    // Gestion des requêtes authentifiées
    async authenticatedRequest(url, options = {}) {
        const token = localStorage.getItem('token');
        
        console.log('🔐 Token récupéré:', !!token);
        
        if (!token) {
            console.error('❌ Aucun token disponible');
            throw new Error('Authentification requise');
        }

        const defaultHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const mergedOptions = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        console.log('📡 Requête authentifiée:', {
            url,
            method: mergedOptions.method,
            hasToken: !!mergedOptions.headers.Authorization
        });

        try {
            const response = await fetch(url, mergedOptions);
            
            console.log('📥 Réponse de la requête:', {
                status: response.status,
                ok: response.ok
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Erreur de requête:', errorData);
                throw new Error(errorData.message || 'Erreur de requête');
            }

            return response.json();
        } catch (error) {
            console.error('❌ Erreur de requête authentifiée:', error);
            throw error;
        }
    }

    // Vérifier l'authentification
    async verifyAuth() {
        try {
            const token = localStorage.getItem('token');
            console.log('🔐 Token de vérification:', !!token);

            if (!token) return false;

            const response = await this.authenticatedRequest('/api/auth/verify', {
                method: 'GET'
            });

            console.log('✅ Vérification réussie:', response);
            return true;
        } catch (error) {
            console.error('❌ Erreur de vérification:', error);
            this.logout(); // Déconnexion automatique en cas d'erreur
            return false;
        }
    }

    // Gérer la déconnexion
    logout() {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        } catch (error) {
            console.error('❌ Erreur de déconnexion:', error);
        }
    }

    // Gestion de la connexion
    async handleLogin(form) {
        try {
            this.showLoading(form);
            
            // Récupérer les données du formulaire
            const formData = new FormData(form);
            const email = formData.get('email');
            const password = formData.get('password');

            console.log('🔐 Tentative de connexion', { email });

            // Envoi de la requête de connexion
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            // Analyser la réponse
            const result = await response.json();
            console.log('📡 Réponse du serveur:', result);

            if (response.ok && result.token) {
                // Stocker le token
                localStorage.setItem('token', result.token);
                
                // Stocker les infos utilisateur
                if (result.user) {
                    localStorage.setItem('user', JSON.stringify(result.user));
                }
                
                // Redirection
                window.location.href = '/quiz-start.html';
            } else {
                // Afficher l'erreur
                this.showError(form, result.message || 'Erreur de connexion');
            }
        } catch (error) {
            console.error('❌ Erreur de connexion:', error);
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
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.showSuccess(form, 'Inscription réussie ! Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre email avant de vous connecter.');
                form.reset();
                
                // Redirection vers la page de connexion après 3 secondes
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 3000);
            } else {
                const signupStatus = document.getElementById('signup-status');
                const errorMessage = document.getElementById('error-message');
                errorMessage.textContent = result.message || 'Erreur lors de l\'inscription';
                errorMessage.style.display = 'block';
                
                // Masquer le message après 5 secondes
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 5000);
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'inscription:', error);
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
            const response = await this.authenticatedRequest('/profile', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            
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
            const response = await this.authenticatedRequest('/forgot-password', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
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
                const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,}$/;
                if (!nameRegex.test(value)) {
                    isValid = false;
                    message = '';
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    message = '';
                }
                break;

            case 'password':
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
                if (!passwordRegex.test(value)) {
                    isValid = false;
                    if (!isValid) {
                        message = '';
                    }
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

    // Envoi des requêtes API
    async sendRequest(endpoint, method, data) {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Ajouter le token d'authentification si disponible
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers,
            body: JSON.stringify(data),
            credentials: 'include' // Inclure les cookies
        });

        return response;
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
        const notificationContainer = document.getElementById('notification-container');
        const errorNotification = notificationContainer.querySelector('.notification.error');
        
        errorNotification.textContent = message;
        errorNotification.style.display = 'block';
        
        setTimeout(() => {
            errorNotification.style.display = 'none';
        }, 5000);
    }

    // Affichage des succès
    showSuccess(form, message) {
        const notificationContainer = document.getElementById('notification-container');
        const successNotification = notificationContainer.querySelector('.notification.success');
        
        successNotification.textContent = message;
        successNotification.style.display = 'block';
        
        setTimeout(() => {
            successNotification.style.display = 'none';
        }, 5000);
    }

    // Récupération des données du formulaire
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }
}

// Fonction pour obtenir le token CSRF depuis les cookies
function getCsrfToken() {
    const name = 'XSRF-TOKEN=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let cookie of cookieArray) {
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return '';
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

// Initialiser le gestionnaire d'authentification
const authManager = new AuthManager();

// Ajouter l'écouteur pour le bouton de déconnexion
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authManager.logout();
        });
    }
});
