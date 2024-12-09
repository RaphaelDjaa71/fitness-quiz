class LanguageService {
    constructor() {
        // Clé de stockage pour la langue
        this.STORAGE_KEY = 'fitness_quiz_language';
        
        // Langues supportées
        this.supportedLanguages = {
            'fr': 'Français',
            'en': 'English',
            'es': 'Español',
            'de': 'Deutsch'
        };

        // Dictionnaires de traduction
        this.translations = {
            'fr': {
                // Général
                'welcome': 'Bienvenue',
                'login': 'Connexion',
                'signup': 'Inscription',
                'logout': 'Déconnexion',
                'dashboard': 'Tableau de bord',
                
                // Formulaires
                'email': 'Email',
                'password': 'Mot de passe',
                'confirm_password': 'Confirmer le mot de passe',
                'name': 'Nom',
                
                // Messages d'erreur
                'error.required_fields': 'Veuillez remplir tous les champs',
                'error.invalid_email': 'Format d\'email invalide',
                'error.password_mismatch': 'Les mots de passe ne correspondent pas',
                'error.password_complexity': 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
                
                // Notifications
                'success.login': 'Connexion réussie !',
                'success.signup': 'Inscription réussie !',
                'success.logout': 'Déconnexion réussie',
                
                // Accessibilité
                'aria.menu_toggle': 'Basculer le menu',
                'aria.language_select': 'Sélectionner la langue'
            },
            'en': {
                // General
                'welcome': 'Welcome',
                'login': 'Login',
                'signup': 'Sign Up',
                'logout': 'Logout',
                'dashboard': 'Dashboard',
                
                // Forms
                'email': 'Email',
                'password': 'Password',
                'confirm_password': 'Confirm Password',
                'name': 'Name',
                
                // Error messages
                'error.required_fields': 'Please fill in all fields',
                'error.invalid_email': 'Invalid email format',
                'error.password_mismatch': 'Passwords do not match',
                'error.password_complexity': 'Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character',
                
                // Notifications
                'success.login': 'Login successful!',
                'success.signup': 'Signup successful!',
                'success.logout': 'Logout successful',
                
                // Accessibility
                'aria.menu_toggle': 'Toggle menu',
                'aria.language_select': 'Select language'
            }
        };
    }

    // Obtenir la langue actuelle
    getCurrentLanguage() {
        // Priorité : localStorage > navigateur > défaut
        return localStorage.getItem(this.STORAGE_KEY) || 
               navigator.language.split('-')[0] || 
               'fr';
    }

    // Définir la langue
    setLanguage(languageCode) {
        if (this.supportedLanguages[languageCode]) {
            localStorage.setItem(this.STORAGE_KEY, languageCode);
            this.applyLanguage(languageCode);
            return true;
        }
        return false;
    }

    // Traduire un texte
    translate(key, language = null) {
        language = language || this.getCurrentLanguage();
        
        // Vérifier si la langue existe, sinon utiliser le français
        const translations = this.translations[language] || this.translations['fr'];
        
        return translations[key] || key;
    }

    // Appliquer la langue à toute l'application
    applyLanguage(languageCode) {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const translationKey = element.getAttribute('data-i18n');
            const translation = this.translate(translationKey, languageCode);
            
            // Gérer différents types d'éléments
            if (element.tagName === 'INPUT') {
                element.setAttribute('placeholder', translation);
            } else if (element.tagName === 'BUTTON' || element.tagName === 'A') {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Mettre à jour les attributs aria-label
        const ariaElements = document.querySelectorAll('[data-i18n-aria]');
        ariaElements.forEach(element => {
            const translationKey = element.getAttribute('data-i18n-aria');
            const translation = this.translate(translationKey, languageCode);
            element.setAttribute('aria-label', translation);
        });

        // Événement personnalisé pour permettre des actions supplémentaires
        const event = new CustomEvent('languageChanged', { 
            detail: { language: languageCode } 
        });
        window.dispatchEvent(event);
    }

    // Créer un sélecteur de langue
    createLanguageSelector() {
        const selector = document.createElement('select');
        selector.id = 'language-selector';
        selector.setAttribute('data-i18n-aria', 'aria.language_select');

        // Ajouter les options de langue
        Object.entries(this.supportedLanguages).forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            option.selected = code === this.getCurrentLanguage();
            selector.appendChild(option);
        });

        // Événement de changement de langue
        selector.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });

        return selector;
    }

    // Initialiser le service de langue
    init() {
        const currentLanguage = this.getCurrentLanguage();
        this.applyLanguage(currentLanguage);

        // Ajouter le sélecteur de langue si non existant
        if (!document.getElementById('language-selector')) {
            const selector = this.createLanguageSelector();
            
            // Trouver un endroit approprié pour l'ajouter
            const headerRight = document.querySelector('.header-right') || 
                                document.querySelector('header') || 
                                document.body;
            
            headerRight.appendChild(selector);
        }
    }
}

// Instancier et exposer le service de langue
window.languageService = new LanguageService();

// Initialiser le service lors du chargement du document
document.addEventListener('DOMContentLoaded', () => {
    window.languageService.init();
});
