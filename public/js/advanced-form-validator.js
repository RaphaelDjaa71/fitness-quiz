class AdvancedFormValidator {
    constructor(options = {}) {
        // Configuration par défaut
        this.defaultConfig = {
            // Activer la validation en temps réel
            liveValidation: true,
            
            // Délai avant validation (pour éviter la validation à chaque frappe)
            validationDelay: 300,
            
            // Stratégies de validation personnalisées
            customValidators: {},
            
            // Configuration des règles de validation
            rules: {
                email: {
                    required: true,
                    pattern: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
                    message: 'Veuillez entrer une adresse email valide'
                },
                password: {
                    required: true,
                    minLength: 8,
                    maxLength: 64,
                    complexity: {
                        uppercase: 1,
                        lowercase: 1,
                        numbers: 1,
                        specialChars: 1
                    },
                    message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
                },
                name: {
                    required: true,
                    minLength: 2,
                    maxLength: 50,
                    pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
                    message: 'Veuillez entrer un nom valide'
                }
            }
        };

        // Fusionner la configuration par défaut avec les options personnalisées
        this.config = { ...this.defaultConfig, ...options };
    }

    // Initialiser la validation pour un formulaire
    init(formElement) {
        if (!(formElement instanceof HTMLFormElement)) {
            console.error('L\'élément fourni n\'est pas un formulaire');
            return false;
        }

        // Ajouter des attributs et des écouteurs
        this.setupFormAttributes(formElement);
        this.addEventListeners(formElement);

        return true;
    }

    // Configurer les attributs du formulaire
    setupFormAttributes(formElement) {
        formElement.setAttribute('novalidate', 'true');
        formElement.setAttribute('aria-live', 'polite');
    }

    // Ajouter des écouteurs d'événements
    addEventListeners(formElement) {
        // Validation à la soumission
        formElement.addEventListener('submit', (event) => {
            if (!this.validateForm(formElement)) {
                event.preventDefault();
            }
        });

        // Validation en temps réel si activée
        if (this.config.liveValidation) {
            const inputs = formElement.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                let timeoutId;
                
                input.addEventListener('input', (event) => {
                    // Annuler le timeout précédent
                    clearTimeout(timeoutId);
                    
                    // Nouveau timeout pour validation
                    timeoutId = setTimeout(() => {
                        this.validateField(input);
                    }, this.config.validationDelay);
                });

                // Validation au blur
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        }
    }

    // Valider un champ spécifique
    validateField(input) {
        const fieldName = input.name;
        const value = input.value.trim();
        const rules = this.config.rules[fieldName];

        // Pas de règles définies pour ce champ
        if (!rules) return true;

        // Vérification des règles de validation
        const validationResults = [
            this.validateRequired(value, rules.required),
            this.validateMinLength(value, rules.minLength),
            this.validateMaxLength(value, rules.maxLength),
            this.validatePattern(value, rules.pattern),
            this.validatePasswordComplexity(value, rules.complexity),
            this.runCustomValidators(input, rules.customValidators)
        ];

        // Filtrer les résultats invalides
        const errors = validationResults.filter(result => result !== true);

        // Gérer l'affichage des erreurs
        this.displayFieldErrors(input, errors);

        return errors.length === 0;
    }

    // Valider l'ensemble du formulaire
    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        const validationResults = Array.from(inputs).map(input => this.validateField(input));

        return validationResults.every(result => result === true);
    }

    // Validation : champ requis
    validateRequired(value, isRequired) {
        if (isRequired && (value === '' || value === null || value === undefined)) {
            return 'Ce champ est obligatoire';
        }
        return true;
    }

    // Validation : longueur minimale
    validateMinLength(value, minLength) {
        if (minLength && value.length < minLength) {
            return `Minimum ${minLength} caractères requis`;
        }
        return true;
    }

    // Validation : longueur maximale
    validateMaxLength(value, maxLength) {
        if (maxLength && value.length > maxLength) {
            return `Maximum ${maxLength} caractères autorisés`;
        }
        return true;
    }

    // Validation : expression régulière
    validatePattern(value, pattern) {
        if (pattern && !pattern.test(value)) {
            return 'Format invalide';
        }
        return true;
    }

    // Validation : complexité du mot de passe
    validatePasswordComplexity(value, complexity) {
        if (!complexity) return true;

        const checks = {
            uppercase: /[A-Z]/.test(value),
            lowercase: /[a-z]/.test(value),
            numbers: /[0-9]/.test(value),
            specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
        };

        const failedChecks = Object.entries(complexity)
            .filter(([type, required]) => required && !checks[type])
            .map(([type]) => type);

        if (failedChecks.length > 0) {
            return `Le mot de passe doit contenir : ${failedChecks.join(', ')}`;
        }

        return true;
    }

    // Validation : validateurs personnalisés
    runCustomValidators(input, customValidators) {
        if (!customValidators) return true;

        const errors = customValidators
            .map(validator => validator(input.value))
            .filter(result => result !== true);

        return errors.length > 0 ? errors[0] : true;
    }

    // Afficher les erreurs de validation
    displayFieldErrors(input, errors) {
        // Supprimer les erreurs précédentes
        this.clearFieldErrors(input);

        // S'il y a des erreurs
        if (errors.length > 0) {
            // Créer un élément d'erreur
            const errorElement = document.createElement('div');
            errorElement.classList.add('validation-error');
            errorElement.setAttribute('role', 'alert');
            errorElement.textContent = errors[0];

            // Styles d'erreur
            input.classList.add('invalid');
            input.setAttribute('aria-invalid', 'true');

            // Insérer l'erreur après le champ
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
    }

    // Effacer les erreurs d'un champ
    clearFieldErrors(input) {
        // Supprimer l'élément d'erreur
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('validation-error')) {
            errorElement.remove();
        }

        // Réinitialiser les classes et attributs
        input.classList.remove('invalid');
        input.removeAttribute('aria-invalid');
    }

    // Ajouter un validateur personnalisé
    addCustomValidator(fieldName, validatorFunction) {
        if (!this.config.rules[fieldName].customValidators) {
            this.config.rules[fieldName].customValidators = [];
        }
        this.config.rules[fieldName].customValidators.push(validatorFunction);
    }
}

// Exposer le service globalement
window.advancedFormValidator = new AdvancedFormValidator();

// Initialisation automatique des formulaires
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        window.advancedFormValidator.init(form);
    });
});
