class FitnessQuiz {
    constructor() {
        this.currentStep = 0;
        this.answers = {};
        this.questions = [
            {
                id: 'goal',
                question: 'Quel est votre objectif ?',
                type: 'choice',
                options: [
                    { id: 'weight-loss', text: 'Perdre du poids', icon: 'fa-weight-scale' },
                    { id: 'muscle-gain', text: 'Prendre du muscle', icon: 'fa-dumbbell' },
                    { id: 'fitness', text: 'Être en meilleure forme', icon: 'fa-heart-pulse' }
                ]
            },
            {
                id: 'gender',
                question: 'Quel est votre sexe ?',
                type: 'choice',
                options: [
                    { id: 'male', text: 'Homme', icon: 'fa-mars' },
                    { id: 'female', text: 'Femme', icon: 'fa-venus' }
                ]
            },
            {
                id: 'age',
                question: 'Quel âge avez-vous ?',
                type: 'slider',
                min: 16,
                max: 80,
                step: 1,
                defaultValue: 30
            },
            {
                id: 'height',
                question: 'Quelle est votre taille ?',
                type: 'slider',
                min: 140,
                max: 220,
                step: 1,
                unit: 'cm',
                defaultValue: 170
            },
            {
                id: 'wristCircumference',
                question: 'Quel est le tour de votre poignet (en cm) ?',
                type: 'slider',
                min: 14,
                max: 21,
                step: 1,
                unit: 'cm',
                defaultValue: 17,
                description: 'Mesurez le tour de votre poignet au niveau le plus fin, sans serrer'
            },
            {
                id: 'current-weight',
                question: 'Quel est votre poids actuel ?',
                type: 'slider',
                min: 40,
                max: 200,
                step: 0.5,
                unit: 'kg',
                defaultValue: 70
            },
            {
                id: 'target-weight',
                question: 'Quel est votre poids cible ?',
                type: 'slider',
                min: 40,
                max: 200,
                step: 0.5,
                unit: 'kg',
                defaultValue: 70,
                dependsOn: 'current-weight'
            },
            {
                id: 'activity-level',
                question: 'Quel est votre niveau d\'activité ?',
                type: 'choice',
                options: [
                    { id: 'sedentary', text: 'Sédentaire', icon: 'fa-couch', description: 'Peu ou pas d\'exercice' },
                    { id: 'light', text: 'Léger', icon: 'fa-person-walking', description: 'Exercice léger 1-3 fois/semaine' },
                    { id: 'moderate', text: 'Modéré', icon: 'fa-person-running', description: 'Exercice modéré 3-5 fois/semaine' },
                    { id: 'active', text: 'Actif', icon: 'fa-person-biking', description: 'Exercice intense 6-7 fois/semaine' },
                    { id: 'very-active', text: 'Très actif', icon: 'fa-fire', description: 'Exercice très intense quotidien' }
                ]
            },
            {
                id: 'experience',
                question: 'Quelle est votre expérience en musculation ?',
                type: 'choice',
                options: [
                    { id: 'beginner', text: 'Débutant', icon: 'fa-dumbbell', description: 'Jamais pratiqué' },
                    { id: 'intermediate', text: 'Intermédiaire', icon: 'fa-dumbbell', description: '1-3 ans de pratique' },
                    { id: 'advanced', text: 'Avancé', icon: 'fa-dumbbell', description: '+3 ans de pratique' }
                ]
            },
            {
                id: 'frequency',
                question: 'Combien de fois par semaine pouvez-vous vous entraîner ?',
                type: 'choice',
                options: [
                    { id: '2-times', text: '2 fois', icon: 'fa-calendar-check' },
                    { id: '3-times', text: '3 fois', icon: 'fa-calendar-check' },
                    { id: '4-times', text: '4 fois', icon: 'fa-calendar-check' },
                    { id: '5-times', text: '5+ fois', icon: 'fa-calendar-check' }
                ]
            },
            {
                id: 'location',
                question: 'Où souhaitez-vous vous entraîner ?',
                type: 'multiple-choice',
                options: [
                    { id: 'gym', text: 'En salle de sport', icon: 'fa-dumbbell' },
                    { id: 'home', text: 'À la maison', icon: 'fa-house' }
                ]
            },
            {
                id: 'diet',
                question: 'Suivez-vous un régime alimentaire particulier ?',
                type: 'choice',
                options: [
                    { id: 'none', text: 'Standard', icon: 'fa-utensils' },
                    { id: 'vegetarian', text: 'Végétarien', icon: 'fa-leaf' },
                    { id: 'vegan', text: 'Végétalien', icon: 'fa-seedling' },
                    { id: 'keto', text: 'Keto', icon: 'fa-bacon' },
                    { id: 'paleo', text: 'Paléo', icon: 'fa-drumstick-bite' }
                ]
            }
        ];
    }

    init() {
        this.renderQuestion();
        this.setupNavigation();
        this.updateProgressBar();
    }

    renderQuestion() {
        const question = this.questions[this.currentStep];
        const container = document.querySelector('.quiz-content');
        
        // Vider le contenu précédent
        container.innerHTML = '';
        
        // Ajouter la question
        const questionElement = document.createElement('h2');
        questionElement.className = 'question-title';
        questionElement.textContent = question.question;
        container.appendChild(questionElement);

        // Rendu selon le type de question
        switch(question.type) {
            case 'choice':
                this.renderChoiceQuestion(question, container);
                break;
            case 'multiple-choice':
                this.renderMultipleChoiceQuestion(question, container);
                break;
            case 'slider':
                this.renderSliderQuestion(question, container);
                break;
        }
    }

    renderChoiceQuestion(question, container) {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';

        question.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'quiz-option';
            optionElement.dataset.value = option.id;

            if (this.answers[question.id] === option.id) {
                optionElement.classList.add('selected');
            }

            optionElement.innerHTML = `
                <i class="fas ${option.icon}"></i>
                <span>${option.text}</span>
                ${option.description ? `<p class="option-description">${option.description}</p>` : ''}
            `;

            optionElement.addEventListener('click', () => this.selectOption(question.id, option.id));
            optionsContainer.appendChild(optionElement);
        });

        container.appendChild(optionsContainer);
    }

    renderMultipleChoiceQuestion(question, container) {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';

        question.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'quiz-option';
            optionElement.dataset.value = option.id;

            if (this.answers[question.id] && this.answers[question.id].includes(option.id)) {
                optionElement.classList.add('selected');
            }

            optionElement.innerHTML = `
                <i class="fas ${option.icon}"></i>
                <span>${option.text}</span>
            `;

            optionElement.addEventListener('click', () => this.toggleOption(question.id, option.id));
            optionsContainer.appendChild(optionElement);
        });

        container.appendChild(optionsContainer);
    }

    renderSliderQuestion(question, container) {
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';

        const value = this.answers[question.id] || question.defaultValue;
        
        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'slider-value';
        valueDisplay.textContent = `${value}${question.unit || ''}`;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = question.min;
        slider.max = question.max;
        slider.step = question.step;
        slider.value = value;

        // Si c'est la question du poids cible et qu'on a déjà le poids actuel
        if (question.id === 'target-weight' && this.answers['current-weight']) {
            const currentWeight = parseFloat(this.answers['current-weight']);
            const goal = this.answers['goal'];

            if (goal === 'weight-loss') {
                // Pour la perte de poids, le poids cible doit être inférieur au poids actuel
                slider.max = currentWeight;
                slider.value = Math.min(value, currentWeight);
                
                // Ajouter un message d'information
                const infoMessage = document.createElement('div');
                infoMessage.className = 'info-message';
                infoMessage.textContent = 'Pour un objectif de perte de poids, votre poids cible doit être inférieur à votre poids actuel.';
                sliderContainer.appendChild(infoMessage);
            } 
            else if (goal === 'muscle-gain') {
                // Pour la prise de muscle, le poids cible doit être supérieur au poids actuel
                slider.min = currentWeight;
                slider.value = Math.max(value, currentWeight);
                
                // Ajouter un message d'information
                const infoMessage = document.createElement('div');
                infoMessage.className = 'info-message';
                infoMessage.textContent = 'Pour un objectif de prise de muscle, votre poids cible doit être supérieur à votre poids actuel.';
                sliderContainer.appendChild(infoMessage);
            }

            // Mettre à jour la valeur affichée
            valueDisplay.textContent = `${slider.value}${question.unit || ''}`;
        }

        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = `${e.target.value}${question.unit || ''}`;
            this.answers[question.id] = parseFloat(e.target.value);
        });

        sliderContainer.appendChild(valueDisplay);
        sliderContainer.appendChild(slider);
        container.appendChild(sliderContainer);

        // Ajouter la description si elle existe
        if (question.description) {
            const descriptionElement = document.createElement('p');
            descriptionElement.className = 'question-description';
            descriptionElement.textContent = question.description;
            container.appendChild(descriptionElement);
        }
    }

    selectOption(questionId, optionId) {
        this.answers[questionId] = optionId;
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.value === optionId) {
                option.classList.add('selected');
            }
        });
    }

    toggleOption(questionId, optionId) {
        if (!this.answers[questionId]) {
            this.answers[questionId] = [];
        }

        const index = this.answers[questionId].indexOf(optionId);
        if (index === -1) {
            this.answers[questionId].push(optionId);
        } else {
            this.answers[questionId].splice(index, 1);
        }

        document.querySelector(`[data-value="${optionId}"]`).classList.toggle('selected');
    }

    setupNavigation() {
        const prevButton = document.querySelector('.prev-button');
        const nextButton = document.querySelector('.next-button');

        prevButton.addEventListener('click', () => this.previousStep());
        nextButton.addEventListener('click', () => this.nextStep());

        // Mise à jour de la visibilité des boutons
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevButton = document.querySelector('.prev-button');
        const nextButton = document.querySelector('.next-button');

        // Afficher le bouton précédent uniquement si on n'est pas à la première question
        prevButton.style.display = this.currentStep > 0 ? 'flex' : 'none';

        // Mettre à jour le texte du bouton suivant
        if (this.currentStep === this.questions.length - 1) {
            nextButton.innerHTML = 'Terminer <i class="fas fa-check"></i>';
        } else {
            nextButton.innerHTML = 'Suivant <i class="fas fa-arrow-right"></i>';
        }
    }

    updateProgressBar() {
        const progress = ((this.currentStep + 1) / this.questions.length) * 100;
        document.querySelector('.quiz-progress-bar').style.width = `${progress}%`;
    }

    validateCurrentStep() {
        const question = this.questions[this.currentStep];
        const answer = this.answers[question.id];

        if (!answer) {
            alert('Veuillez répondre à la question avant de continuer.');
            return false;
        }

        if (question.type === 'multiple-choice' && answer.length === 0) {
            alert('Veuillez sélectionner au moins une option.');
            return false;
        }

        return true;
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderQuestion();
            this.updateNavigationButtons();
            this.updateProgressBar();
        }
    }

    nextStep() {
        if (!this.validateCurrentStep()) {
            return;
        }

        if (this.currentStep < this.questions.length - 1) {
            this.currentStep++;
            this.renderQuestion();
            this.updateNavigationButtons();
            this.updateProgressBar();
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        // Sauvegarder les réponses dans le localStorage
        localStorage.setItem('quizAnswers', JSON.stringify(this.answers));

        // Rediriger vers la page des résultats
        window.location.href = '/quiz-results.html';
    }
}

// Initialisation du quiz
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new FitnessQuiz();
    quiz.init();
});
