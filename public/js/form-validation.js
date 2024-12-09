class FormValidator {
    constructor() {
        this.messages = {
            name: "",
            required: ""
        };

        this.validationRules = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            name: /^[a-zA-ZÀ-ÿ\s]{2,}$/
        };

        this.init();
        this.setupPasswordToggles();
    }

    init() {
        document.querySelectorAll('form').forEach(form => {
            this.setupForm(form);
        });
    }

    setupForm(form) {
        form.querySelectorAll('input, select, textarea').forEach(field => {
            this.setupField(field);
        });

        form.addEventListener('submit', e => this.handleSubmit(e));
    }

    setupField(field) {
        field.addEventListener('input', () => this.validateField(field));
        field.addEventListener('blur', () => this.validateField(field));
    }

    setupPasswordToggles() {
        document.querySelectorAll('input[type="password"]').forEach(input => {
            const container = document.createElement('div');
            container.className = 'password-toggle-container';
            
            const label = document.createElement('label');
            label.className = 'switch';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            
            const slider = document.createElement('span');
            slider.className = 'slider';
            
            const text = document.createElement('span');
            text.className = 'password-toggle-label';
            text.textContent = 'Afficher le mot de passe';
            
            label.appendChild(checkbox);
            label.appendChild(slider);
            container.appendChild(label);
            container.appendChild(text);
            
            input.parentElement.appendChild(container);
            
            checkbox.addEventListener('change', () => {
                input.type = checkbox.checked ? 'text' : 'password';
            });
        });
    }

    validateField(field) {
        let isValid = true;
        const value = field.value.trim();
        const form = field.closest('form');

        if (field.required && !value) {
            isValid = false;
        } else if (value) {
            // Validation spécifique selon le type et le formulaire
            switch (field.type) {
                case 'email':
                    isValid = this.validationRules.email.test(value);
                    break;
                case 'password':
                    // Pour le formulaire de connexion, on vérifie juste que le champ n'est pas vide
                    if (form.id === 'loginForm') {
                        isValid = value.length > 0;
                    } 
                    // Pour les autres formulaires (inscription, reset password), on applique les règles complètes
                    else {
                        if (field.id === 'confirmPassword') {
                            const password = document.getElementById('password');
                            isValid = password && value === password.value;
                        } else {
                            isValid = this.validationRules.password.test(value);
                        }
                    }
                    break;
                case 'text':
                    if (field.id === 'name') {
                        isValid = this.validationRules.name.test(value);
                    }
                    break;
            }
        }

        field.classList.remove('is-valid', 'is-invalid');
        if (value) {
            field.classList.add(isValid ? 'is-valid' : 'is-invalid');
        }

        return isValid;
    }

    handleSubmit(e) {
        const form = e.target;
        let isValid = true;

        form.querySelectorAll('input, select, textarea').forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            e.preventDefault();
            const firstInvalid = form.querySelector('.is-invalid');
            if (firstInvalid) {
                firstInvalid.focus();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.formValidator = new FormValidator();
});
