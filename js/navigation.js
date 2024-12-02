class Navigation {
    static init() {
        this.setupProgressBar();
        this.setupNavigationButtons();
        this.handleBackButton();
        this.setupFormValidation();
    }

    static setupProgressBar() {
        const progressBar = document.querySelector('.progress');
        if (!progressBar) return;

        const currentPage = this.getCurrentPage();
        const progress = quizConfig.getCurrentProgress(currentPage);
        
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }

    static setupNavigationButtons() {
        const currentPage = this.getCurrentPage();
        
        // Bouton précédent
        const prevButton = document.querySelector('.btn-previous');
        if (prevButton) {
            const prevPage = quizConfig.getPreviousPage(currentPage);
            if (prevPage) {
                prevButton.href = prevPage;
                prevButton.classList.remove('hidden');
            } else {
                prevButton.classList.add('hidden');
            }
        }

        // Bouton suivant
        const nextButton = document.querySelector('.btn-next');
        if (nextButton) {
            const nextPage = quizConfig.getNextPage(currentPage);
            if (nextPage) {
                if (nextButton.tagName.toLowerCase() === 'a') {
                    nextButton.href = nextPage;
                }
                nextButton.classList.remove('hidden');
            } else {
                nextButton.classList.add('hidden');
            }
        }
    }

    static handleBackButton() {
        window.addEventListener('popstate', () => {
            this.setupProgressBar();
            this.setupNavigationButtons();
        });
    }

    static getCurrentPage() {
        const path = window.location.pathname;
        return path.substring(path.lastIndexOf('/') + 1);
    }

    static setupFormValidation() {
        const form = document.querySelector('form');
        if (!form) return;

        const submitButton = document.querySelector('.btn-next[type="submit"]');
        if (!submitButton) return;

        // Désactiver la soumission par défaut
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validateForm(form)) {
                const currentPage = this.getCurrentPage();
                const nextPage = quizConfig.getNextPage(currentPage);
                if (nextPage) {
                    window.location.href = nextPage;
                }
            }
        });

        // Validation en temps réel
        form.addEventListener('input', () => {
            submitButton.disabled = !form.checkValidity();
        });
    }

    static validateForm(form) {
        // Validation personnalisée en fonction de la page
        const pageId = quizConfig.getCurrentPageInfo()?.id;
        
        if (!pageId) return true;

        const formData = new FormData(form);
        let isValid = true;

        switch (pageId) {
            case 'age':
                const age = parseInt(formData.get('age'));
                isValid = !isNaN(age) && age >= 16 && age <= 99;
                break;
            case 'taille':
                const taille = parseInt(formData.get('taille'));
                isValid = !isNaN(taille) && taille >= 140 && taille <= 220;
                break;
            case 'poids':
                const poids = parseFloat(formData.get('poids'));
                isValid = !isNaN(poids) && poids >= 40 && poids <= 200;
                break;
            // Ajouter d'autres validations spécifiques ici
        }

        if (isValid) {
            // Sauvegarder les données du formulaire
            for (const [key, value] of formData.entries()) {
                this.saveAnswer(key, value);
            }
        }

        return isValid;
    }

    static validateAndProceed(formId, validationFn) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (validationFn && !validationFn()) {
                return false;
            }

            const currentPage = this.getCurrentPage();
            const nextPage = quizConfig.getNextPage(currentPage);
            if (nextPage) {
                window.location.href = nextPage;
            }
        });

        // Validation en temps réel
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            form.addEventListener('input', () => {
                submitButton.disabled = !form.checkValidity();
            });
        }
    }

    static saveAnswer(key, value) {
        const quizState = this.getQuizState();
        quizState[key] = value;
        localStorage.setItem('fitnessQuizState', JSON.stringify(quizState));
    }

    static getAnswer(key) {
        const quizState = this.getQuizState();
        return quizState[key];
    }

    static getQuizState() {
        return JSON.parse(localStorage.getItem('fitnessQuizState') || '{}');
    }

    static resetQuiz() {
        localStorage.removeItem('fitnessQuizState');
    }

    static isQuizComplete() {
        const quizState = this.getQuizState();
        const requiredFields = [
            'objectif',
            'sexe',
            'age',
            'taille',
            'poids',
            'poignet',
            'objectifPoids',
            'niveauActivite',
            'regime'
        ];
        return requiredFields.every(field => quizState[field] !== undefined);
    }

    static getAllAnswers() {
        const quizState = this.getQuizState();
        
        // Liste exhaustive des champs possibles avec différentes variations
        const allPossibleFields = [
            // Champs personnels
            'sexe', 'sex',
            'age', 
            'taille', 'height',
            'poids', 'weight',
            'poignet', 'wrist',
            
            // Objectifs
            'objectif', 'goal',
            'objectif-poids', 'weight-goal',
            
            // Activité physique
            'niveau-activite', 'activity-level',
            'experience-musculation', 'muscle-experience',
            'frequence-entrainement', 'training-frequency',
            'equipement', 'equipment',
            
            // Nutrition
            'regime-alimentaire', 'diet',
            'restrictions-alimentaires', 'dietary-restrictions'
        ];

        // Créer un nouvel objet avec uniquement les champs présents et non vides
        const filteredAnswers = {};
        allPossibleFields.forEach(field => {
            // Variantes de noms possibles
            const fieldVariants = [
                field,
                field.replace(/-/g, '_'),
                field.replace(/-/g, '')
            ];

            // Chercher la première variante qui existe
            for (const variant of fieldVariants) {
                if (quizState[variant] !== undefined && 
                    quizState[variant] !== null && 
                    quizState[variant] !== '') {
                    // Utiliser le nom standard avec tirets
                    const standardKey = field.includes('-') ? field : field.replace(/_/g, '-');
                    filteredAnswers[standardKey] = quizState[variant];
                    break;
                }
            }
        });

        return filteredAnswers;
    }
}
