class FormValidation {
    static init() {
        this.setupPasswordStrengthMeter();
        this.setupFormValidation();
    }

    static setupPasswordStrengthMeter() {
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        
        passwordInputs.forEach(input => {
            if (input.id === 'password') {
                // Créer l'indicateur de force
                const strengthMeter = document.createElement('div');
                strengthMeter.className = 'password-strength';
                strengthMeter.innerHTML = '<div class="password-strength-meter"></div>';
                input.parentNode.insertBefore(strengthMeter, input.nextSibling);

                // Créer le message de validation
                const validationMessage = document.createElement('div');
                validationMessage.className = 'validation-message';
                input.parentNode.insertBefore(validationMessage, strengthMeter.nextSibling);

                input.addEventListener('input', (e) => this.checkPasswordStrength(e.target));
            }
        });
    }

    static checkPasswordStrength(input) {
        const password = input.value;
        const meter = input.parentNode.querySelector('.password-strength-meter');
        const message = input.parentNode.querySelector('.validation-message');

        // Critères de force
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);
        const isLongEnough = password.length >= 8;

        let strength = 0;
        let feedback = [];

        if (hasLower) strength++;
        if (hasUpper) strength++;
        if (hasNumber) strength++;
        if (hasSpecial) strength++;
        if (isLongEnough) strength++;

        // Mise à jour du message
        if (!isLongEnough) feedback.push('8 caractères minimum');
        if (!hasLower) feedback.push('une minuscule');
        if (!hasUpper) feedback.push('une majuscule');
        if (!hasNumber) feedback.push('un chiffre');
        if (!hasSpecial) feedback.push('un caractère spécial');

        // Mise à jour visuelle
        meter.className = 'password-strength-meter';
        message.className = 'validation-message';

        if (password.length === 0) {
            meter.style.width = '0';
            message.textContent = '';
        } else if (strength < 3) {
            meter.classList.add('weak');
            message.classList.add('error');
            message.textContent = `Mot de passe faible. Ajoutez : ${feedback.join(', ')}`;
        } else if (strength < 4) {
            meter.classList.add('medium');
            message.classList.add('error');
            message.textContent = `Mot de passe moyen. Ajoutez : ${feedback.join(', ')}`;
        } else {
            meter.classList.add('strong');
            message.classList.add('success');
            message.textContent = 'Mot de passe fort';
        }
    }

    static setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[required]');
            
            inputs.forEach(input => {
                // Créer le message de validation
                const validationMessage = document.createElement('div');
                validationMessage.className = 'validation-message';
                input.parentNode.insertBefore(validationMessage, input.nextSibling);

                input.addEventListener('input', () => this.validateInput(input));
                input.addEventListener('blur', () => this.validateInput(input));
            });

            // Validation à la soumission
            form.addEventListener('submit', (e) => {
                let isValid = true;
                inputs.forEach(input => {
                    if (!this.validateInput(input)) {
                        isValid = false;
                    }
                });

                if (!isValid) {
                    e.preventDefault();
                }
            });
        });
    }

    static validateInput(input) {
        const message = input.parentNode.querySelector('.validation-message');
        let isValid = true;

        // Réinitialiser les messages
        message.textContent = '';
        message.className = 'validation-message';

        // Vérifier si vide
        if (input.value.trim() === '') {
            message.textContent = 'Ce champ est requis';
            message.classList.add('error');
            isValid = false;
        }

        // Validation email
        if (input.type === 'email' && input.value !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                message.textContent = 'Email invalide';
                message.classList.add('error');
                isValid = false;
            }
        }

        // Validation confirmation mot de passe
        if (input.id === 'confirmPassword') {
            const password = document.getElementById('password');
            if (password && input.value !== password.value) {
                message.textContent = 'Les mots de passe ne correspondent pas';
                message.classList.add('error');
                isValid = false;
            }
        }

        return isValid;
    }

    static showLoading(button) {
        const originalText = button.textContent;
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span>';
        return originalText;
    }

    static hideLoading(button, originalText) {
        button.disabled = false;
        button.textContent = originalText;
    }

    static showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.textContent = message;
        
        const form = document.querySelector('form');
        form.parentNode.insertBefore(alert, form);

        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    static showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.textContent = message;
        
        const form = document.querySelector('form');
        form.parentNode.insertBefore(alert, form);

        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Initialiser la validation des formulaires au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    FormValidation.init();
});
