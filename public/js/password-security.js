class PasswordSecurityManager {
    constructor() {
        // Configuration de la sécurité des mots de passe
        this.config = {
            // Longueur minimale du mot de passe
            minLength: 12,
            
            // Complexité requise
            complexity: {
                uppercase: 2,
                lowercase: 2,
                numbers: 2,
                specialChars: 2
            },
            
            // Liste des mots de passe communs à bloquer
            commonPasswords: [
                'password', '123456', 'qwerty', 'azerty', 
                'admin', 'welcome', 'login', 'abc123'
            ],
            
            // Historique des mots de passe (côté client)
            passwordHistory: [],
            
            // Nombre max de mots de passe dans l'historique
            maxPasswordHistory: 5
        };
    }

    // Évaluer la force du mot de passe
    assessPasswordStrength(password) {
        if (!password) return 0;

        let strength = 0;
        const checks = {
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /[0-9]/.test(password),
            specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };

        // Vérifier la longueur
        strength += password.length >= this.config.minLength ? 1 : 0;

        // Vérifier chaque type de caractère
        Object.entries(checks).forEach(([type, passed]) => {
            strength += passed ? 1 : 0;
        });

        return strength;
    }

    // Catégoriser la force du mot de passe
    getPasswordStrengthCategory(strength) {
        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    }

    // Générer un indicateur visuel de force du mot de passe
    createPasswordStrengthMeter(passwordInput) {
        const meterContainer = document.createElement('div');
        meterContainer.classList.add('password-strength-meter');

        const meterFill = document.createElement('div');
        meterFill.classList.add('password-strength-meter-fill');
        meterContainer.appendChild(meterFill);

        // Mise à jour en temps réel
        passwordInput.addEventListener('input', () => {
            const strength = this.assessPasswordStrength(passwordInput.value);
            const category = this.getPasswordStrengthCategory(strength);

            // Réinitialiser les classes
            meterFill.classList.remove('weak', 'medium', 'strong');
            meterFill.classList.add(category);

            // Largeur proportionnelle à la force
            meterFill.style.width = `${(strength / 6) * 100}%`;
        });

        // Insérer après le champ de mot de passe
        passwordInput.parentNode.insertBefore(meterContainer, passwordInput.nextSibling);
    }

    // Vérifier si le mot de passe est trop commun
    isCommonPassword(password) {
        return this.config.commonPasswords.includes(password.toLowerCase());
    }

    // Vérifier si le mot de passe a déjà été utilisé
    isPasswordReused(password) {
        return this.config.passwordHistory.includes(password);
    }

    // Ajouter un mot de passe à l'historique
    addPasswordToHistory(password) {
        // Supprimer le plus ancien si la limite est atteinte
        if (this.config.passwordHistory.length >= this.config.maxPasswordHistory) {
            this.config.passwordHistory.shift();
        }
        
        this.config.passwordHistory.push(password);
    }

    // Générer un mot de passe fort
    generateStrongPassword(length = 16) {
        const charset = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        let password = '';
        let allChars = '';

        // Ajouter au moins un caractère de chaque type
        Object.entries(charset).forEach(([type, chars]) => {
            const randomChar = chars[Math.floor(Math.random() * chars.length)];
            password += randomChar;
            allChars += chars;
        });

        // Compléter avec des caractères aléatoires
        while (password.length < length) {
            const randomChar = allChars[Math.floor(Math.random() * allChars.length)];
            password += randomChar;
        }

        // Mélanger le mot de passe
        return this.shuffleString(password);
    }

    // Mélanger une chaîne de caractères
    shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }

    // Initialisation globale
    init() {
        // Ajouter des écouteurs sur tous les champs de mot de passe
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        
        passwordInputs.forEach(input => {
            // Créer l'indicateur de force
            this.createPasswordStrengthMeter(input);

            // Ajouter des validations personnalisées
            input.addEventListener('input', () => {
                const password = input.value;
                const strength = this.assessPasswordStrength(password);
                
                // Avertissements
                if (this.isCommonPassword(password)) {
                    console.warn('Mot de passe trop commun');
                }
                
                if (this.isPasswordReused(password)) {
                    console.warn('Ce mot de passe a déjà été utilisé');
                }
            });
        });

        // Ajouter un bouton de génération de mot de passe
        this.addPasswordGenerationButton();
    }

    // Ajouter un bouton de génération de mot de passe
    addPasswordGenerationButton() {
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        
        passwordInputs.forEach(input => {
            const generateButton = document.createElement('button');
            generateButton.textContent = '🔐 Générer';
            generateButton.type = 'button';
            generateButton.classList.add('password-generate-btn');
            
            generateButton.addEventListener('click', () => {
                const strongPassword = this.generateStrongPassword();
                input.value = strongPassword;
                
                // Déclencher l'événement input pour mettre à jour l'indicateur
                input.dispatchEvent(new Event('input'));
            });

            // Insérer le bouton après le champ de mot de passe
            input.parentNode.insertBefore(generateButton, input.nextSibling);
        });
    }
}

// Instancier et exposer le gestionnaire de sécurité des mots de passe
window.passwordSecurityManager = new PasswordSecurityManager();

// Initialisation lors du chargement du document
document.addEventListener('DOMContentLoaded', () => {
    window.passwordSecurityManager.init();
});
