class DynamicFormValidator {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.options = {
            validateOnInput: true,
            validateOnBlur: true,
            showConditions: true,
            ...options
        };
        
        this.validationRules = {};
        this.validationConditions = {};
        this.init();
    }

    init() {
        if (!this.form) return;
        
        // Ajouter les écouteurs d'événements pour la validation en temps réel
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (this.options.validateOnInput) {
                input.addEventListener('input', () => this.validateField(input));
            }
            if (this.options.validateOnBlur) {
                input.addEventListener('blur', () => this.validateField(input));
            }
        });

        // Ajouter la validation au submit du formulaire
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
            }
        });
    }

    addValidationRule(fieldName, rule) {
        this.validationRules[fieldName] = rule;
    }

    addValidationConditions(fieldName, conditions) {
        this.validationConditions[fieldName] = conditions;
        
        // Créer la liste des conditions si elle n'existe pas déjà
        if (this.options.showConditions) {
            const input = this.form.querySelector(`[name="${fieldName}"]`);
            if (!input) return;

            let conditionsList = input.parentElement.querySelector('.validation-conditions');
            if (!conditionsList) {
                conditionsList = document.createElement('ul');
                conditionsList.className = 'validation-conditions';
                conditions.forEach(condition => {
                    const li = document.createElement('li');
                    li.className = 'validation-condition';
                    li.textContent = condition.message;
                    conditionsList.appendChild(li);
                });
                input.parentElement.appendChild(conditionsList);
            }
        }
    }

    validateField(input) {
        const name = input.name;
        const value = input.value;
        
        // Vérifier si le champ est requis
        if (input.hasAttribute('required') && !value.trim()) {
            this.setInvalid(input, 'Ce champ est obligatoire');
            return false;
        }

        // Appliquer les règles de validation spécifiques
        if (this.validationRules[name]) {
            const result = this.validationRules[name](value);
            if (result !== true) {
                this.setInvalid(input, result);
                return false;
            }
        }

        // Vérifier les conditions si elles existent
        if (this.validationConditions[name]) {
            const conditions = this.validationConditions[name];
            const conditionsList = input.parentElement.querySelector('.validation-conditions');
            
            let allValid = true;
            conditions.forEach((condition, index) => {
                const isValid = condition.test(value);
                if (conditionsList) {
                    const li = conditionsList.children[index];
                    li.className = `validation-condition ${isValid ? 'valid' : 'invalid'}`;
                }
                if (!isValid) allValid = false;
            });

            if (!allValid) {
                this.setInvalid(input, '');
                return false;
            }
        }

        this.setValid(input);
        return true;
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    setValid(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        const feedback = input.parentElement.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    setInvalid(input, message) {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        const feedback = input.parentElement.querySelector('.invalid-feedback');
        if (feedback && message) {
            feedback.textContent = message;
            feedback.style.display = 'block';
        }
    }
}
