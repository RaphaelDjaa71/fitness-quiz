class FitnessQuiz {
    constructor() {
        this.currentStep = 0;
        this.quizData = {
            mainGoal: null
        };
        this.steps = [
            {
                type: 'goal-selection',
                question: 'Quel est votre objectif principal ?',
                options: [
                    {
                        value: 'weight-loss',
                        label: 'Perdre du poids',
                        icon: 'fa-solid fa-weight-scale'
                    },
                    {
                        value: 'muscle-gain',
                        label: 'Prendre du muscle',
                        icon: 'fa-solid fa-dumbbell'
                    },
                    {
                        value: 'fitness',
                        label: 'Être en meilleure forme',
                        icon: 'fa-solid fa-heart-pulse'
                    }
                ]
            }
        ];

        this.initializeQuiz();
    }

    initializeQuiz() {
        this.renderStep();
        this.setupEventListeners();
    }

    renderStep() {
        const quizContainer = document.querySelector('.quiz-container');
        const currentStepData = this.steps[this.currentStep];

        quizContainer.innerHTML = `
            <div class="quiz-content">
                <div class="quiz-progress">
                    <div class="quiz-progress-bar" style="width: ${(this.currentStep + 1) / this.steps.length * 100}%"></div>
                </div>
                <div class="quiz-header">
                    <h2>Évaluation Fitness Personnalisée</h2>
                </div>
                <div class="quiz-question">${currentStepData.question}</div>
                <div class="quiz-options">
                    ${currentStepData.options.map(option => `
                        <div class="quiz-option" data-value="${option.value}">
                            <i class="quiz-option-icon ${option.icon}"></i>
                            <div class="quiz-option-label">${option.label}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="quiz-navigation">
                    <button class="quiz-nav-btn prev-btn" id="prevBtn" ${this.currentStep === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-left"></i> Précédent
                    </button>
                    <button class="quiz-nav-btn next-btn" id="nextBtn" ${this.quizData.mainGoal ? '' : 'disabled'}>
                        Suivant <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;

        this.setupStepEventListeners();
    }

    setupStepEventListeners() {
        const options = document.querySelectorAll('.quiz-option');
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');

        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.quizData.mainGoal = option.dataset.value;
                nextBtn.disabled = false;
            });
        });

        nextBtn.addEventListener('click', () => this.nextStep());
        prevBtn.addEventListener('click', () => this.prevStep());
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.renderStep();
        } else {
            this.finishQuiz();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
        }
    }

    finishQuiz() {
        console.log('Quiz terminé', this.quizData);
        // TODO: Implémenter la logique de fin de quiz
        alert('Quiz terminé ! Résultats : ' + JSON.stringify(this.quizData));
    }

    setupEventListeners() {
        // Événements globaux si nécessaire
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const fitnessQuiz = new FitnessQuiz();
});
