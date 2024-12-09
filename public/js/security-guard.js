class SecurityGuard {
    constructor() {
        // Clés de stockage
        this.STORAGE_KEYS = {
            ATTEMPTS: 'security_login_attempts',
            LOCKOUT: 'security_lockout_info'
        };

        // Configuration de sécurité
        this.config = {
            MAX_LOGIN_ATTEMPTS: 5,
            LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
            ATTEMPT_WINDOW: 30 * 60 * 1000, // 30 minutes
            RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
            MAX_REQUESTS_PER_WINDOW: 10
        };

        // Initialiser les mécanismes de sécurité
        this.initSecurityMechanisms();
    }

    // Initialiser les mécanismes de sécurité
    initSecurityMechanisms() {
        this.initCsrfProtection();
        this.initClickjackingProtection();
        this.initRateLimiting();
    }

    // Protection CSRF
    initCsrfProtection() {
        // Générer un token CSRF unique
        const csrfToken = this.generateToken();
        
        // Stocker le token
        localStorage.setItem('csrf_token', csrfToken);

        // Ajouter un intercepteur pour les formulaires
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.tagName === 'FORM') {
                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = 'csrf_token';
                tokenInput.value = csrfToken;
                form.appendChild(tokenInput);
            }
        });
    }

    // Protection contre le clickjacking
    initClickjackingProtection() {
        if (top !== self) {
            // Page chargée dans un iframe - bloquer
            top.location = self.location;
        }

        // En-tête X-Frame-Options
        const metaTag = document.createElement('meta');
        metaTag.httpEquiv = 'X-Frame-Options';
        metaTag.content = 'DENY';
        document.head.appendChild(metaTag);
    }

    // Limitation du taux de requêtes
    initRateLimiting() {
        const requestTracker = JSON.parse(
            localStorage.getItem('request_tracker') || '{}'
        );

        // Nettoyer les anciennes requêtes
        const now = Date.now();
        Object.keys(requestTracker).forEach(key => {
            if (now - key > this.config.RATE_LIMIT_WINDOW) {
                delete requestTracker[key];
            }
        });

        localStorage.setItem('request_tracker', JSON.stringify(requestTracker));
    }

    // Vérifier et enregistrer une tentative de requête
    checkRateLimit() {
        const requestTracker = JSON.parse(
            localStorage.getItem('request_tracker') || '{}'
        );
        const now = Date.now();

        // Compter les requêtes dans la fenêtre
        const requestsInWindow = Object.keys(requestTracker)
            .filter(key => now - key < this.config.RATE_LIMIT_WINDOW)
            .length;

        if (requestsInWindow >= this.config.MAX_REQUESTS_PER_WINDOW) {
            // Trop de requêtes
            throw new Error('Trop de requêtes. Veuillez patienter.');
        }

        // Ajouter la nouvelle requête
        requestTracker[now] = true;
        localStorage.setItem('request_tracker', JSON.stringify(requestTracker));
    }

    // Gestion des tentatives de connexion
    trackLoginAttempt(email) {
        const now = Date.now();
        const attemptsKey = `${this.STORAGE_KEYS.ATTEMPTS}_${email}`;
        
        // Récupérer les tentatives précédentes
        const storedAttempts = JSON.parse(
            localStorage.getItem(attemptsKey) || '[]'
        );

        // Filtrer les tentatives récentes
        const recentAttempts = storedAttempts.filter(
            attempt => now - attempt < this.config.ATTEMPT_WINDOW
        );

        // Ajouter la nouvelle tentative
        recentAttempts.push(now);

        // Vérifier si le nombre de tentatives est dépassé
        if (recentAttempts.length > this.config.MAX_LOGIN_ATTEMPTS) {
            // Verrouiller le compte
            const lockoutInfo = {
                email: email,
                lockedUntil: now + this.config.LOCKOUT_DURATION
            };
            
            localStorage.setItem(
                this.STORAGE_KEYS.LOCKOUT, 
                JSON.stringify(lockoutInfo)
            );

            // Lever une exception
            throw new Error(
                'Trop de tentatives de connexion. Compte verrouillé pendant 15 minutes.'
            );
        }

        // Sauvegarder les tentatives
        localStorage.setItem(
            attemptsKey, 
            JSON.stringify(recentAttempts)
        );
    }

    // Vérifier si un compte est verrouillé
    isAccountLocked(email) {
        const lockoutInfo = JSON.parse(
            localStorage.getItem(this.STORAGE_KEYS.LOCKOUT) || 'null'
        );

        if (lockoutInfo && lockoutInfo.email === email) {
            const now = Date.now();
            if (now < lockoutInfo.lockedUntil) {
                const remainingMinutes = Math.ceil(
                    (lockoutInfo.lockedUntil - now) / (60 * 1000)
                );
                throw new Error(
                    `Compte verrouillé. Réessayez dans ${remainingMinutes} minutes.`
                );
            }
        }

        return false;
    }

    // Générer un token de sécurité
    generateToken(length = 32) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues);
        
        for (let i = 0; i < length; i++) {
            token += charset[randomValues[i] % charset.length];
        }
        
        return token;
    }

    // Nettoyer les données de sécurité
    clearSecurityData(email) {
        // Supprimer les tentatives de connexion
        localStorage.removeItem(`${this.STORAGE_KEYS.ATTEMPTS}_${email}`);
        
        // Supprimer le verrouillage si présent
        const lockoutInfo = JSON.parse(
            localStorage.getItem(this.STORAGE_KEYS.LOCKOUT) || 'null'
        );
        
        if (lockoutInfo && lockoutInfo.email === email) {
            localStorage.removeItem(this.STORAGE_KEYS.LOCKOUT);
        }
    }

    // Méthode de protection globale pour les formulaires
    protectForm(formElement, options = {}) {
        if (!formElement) return;

        // Ajouter une protection CSRF
        const csrfToken = localStorage.getItem('csrf_token') || this.generateToken();
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrf_token';
        csrfInput.value = csrfToken;
        formElement.appendChild(csrfInput);

        // Désactiver la soumission multiple
        let isSubmitting = false;
        formElement.addEventListener('submit', (e) => {
            if (isSubmitting) {
                e.preventDefault();
                return;
            }
            isSubmitting = true;

            // Réactiver après un délai
            setTimeout(() => {
                isSubmitting = false;
            }, 2000);
        });

        // Validation côté client
        if (options.validate) {
            formElement.addEventListener('submit', (e) => {
                if (!options.validate(formElement)) {
                    e.preventDefault();
                }
            });
        }
    }
}

// Instancier et exposer le garde de sécurité
window.securityGuard = new SecurityGuard();
