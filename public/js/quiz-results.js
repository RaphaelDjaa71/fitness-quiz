class QuizResults {
    constructor() {
        this.answers = this.loadAnswers();
        this.initializeResults();
    }

    loadAnswers() {
        return JSON.parse(localStorage.getItem('quizAnswers')) || {};
    }

    initializeResults() {
        this.displaySummary();
        this.displayRecommendations();
        this.displayNextSteps();
    }

    displaySummary() {
        const summaryContainer = document.querySelector('.summary-grid');
        if (!summaryContainer) return;

        const summaryItems = [
            { icon: 'fa-bullseye', label: 'Objectif', value: this.answers.fitnessGoal },
            { icon: 'fa-venus-mars', label: 'Genre', value: this.answers.gender },
            { icon: 'fa-calendar', label: 'Âge', value: `${this.answers.age} ans` },
            { icon: 'fa-ruler-vertical', label: 'Taille', value: `${this.answers.height} cm` },
            { icon: 'fa-weight', label: 'Poids actuel', value: `${this.answers.currentWeight} kg` },
            { icon: 'fa-weight-scale', label: 'Poids cible', value: `${this.answers.targetWeight} kg` },
            { icon: 'fa-running', label: 'Niveau d\'activité', value: this.answers.activityLevel },
            { icon: 'fa-dumbbell', label: 'Expérience musculation', value: this.answers.musculationExperience },
            { icon: 'fa-calendar-check', label: 'Fréquence d\'entraînement', value: this.answers.trainingFrequency },
            { icon: 'fa-utensils', label: 'Préférences alimentaires', value: this.answers.dietaryPreferences }
        ];

        summaryContainer.innerHTML = summaryItems.map(item => `
            <div class="summary-item">
                <div class="summary-icon">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-label">${item.label}</div>
                    <div class="summary-value">${item.value}</div>
                </div>
            </div>
        `).join('');
    }

    displayRecommendations() {
        const recommendationsContainer = document.querySelector('.recommendations');
        if (!recommendationsContainer) return;

        const recommendations = this.generateRecommendations();
        recommendationsContainer.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="recommendation-icon">
                    <i class="fas ${rec.icon}"></i>
                </div>
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
            </div>
        `).join('');
    }

    generateRecommendations() {
        const goal = this.answers.fitnessGoal;
        const experience = this.answers.musculationExperience;
        
        const recommendations = [
            {
                icon: 'fa-heart',
                title: 'Programme personnalisé',
                description: this.getPersonalizedProgram(goal, experience)
            },
            {
                icon: 'fa-apple-alt',
                title: 'Recommandations nutritionnelles',
                description: this.getNutritionRecommendations()
            },
            {
                icon: 'fa-chart-line',
                title: 'Objectifs recommandés',
                description: this.getGoalRecommendations()
            }
        ];

        return recommendations;
    }

    getPersonalizedProgram(goal, experience) {
        const programs = {
            'Perte de poids': {
                'Débutant': 'Programme de cardio-training progressif avec initiation aux exercices de force',
                'Intermédiaire': 'Mix équilibré de HIIT et musculation',
                'Avancé': 'Programme intensif alternant cardio haute intensité et musculation'
            },
            'Prise de masse': {
                'Débutant': 'Programme de base en musculation avec focus sur les mouvements composés',
                'Intermédiaire': 'Split training avec progression en charge',
                'Avancé': 'Programme de musculation avancé avec périodisation'
            },
            'Remise en forme': {
                'Débutant': 'Programme complet de remise en forme progressive',
                'Intermédiaire': 'Programme varié combinant cardio et renforcement',
                'Avancé': 'Programme personnalisé haute intensité'
            }
        };

        return programs[goal]?.[experience] || 'Programme personnalisé adapté à vos objectifs';
    }

    getNutritionRecommendations() {
        const goal = this.answers.fitnessGoal;
        const diet = this.answers.dietaryPreferences;

        if (goal === 'Perte de poids') {
            return 'Déficit calorique modéré avec accent sur les protéines et légumes';
        } else if (goal === 'Prise de masse') {
            return 'Surplus calorique contrôlé avec focus sur les protéines et glucides complexes';
        }
        return 'Alimentation équilibrée adaptée à vos besoins énergétiques';
    }

    getGoalRecommendations() {
        const currentWeight = parseFloat(this.answers.currentWeight);
        const targetWeight = parseFloat(this.answers.targetWeight);
        const goal = this.answers.fitnessGoal;

        if (goal === 'Perte de poids') {
            const weightDiff = currentWeight - targetWeight;
            return `Objectif de perte de ${weightDiff.toFixed(1)}kg de manière saine et durable`;
        } else if (goal === 'Prise de masse') {
            const weightDiff = targetWeight - currentWeight;
            return `Objectif de prise de ${weightDiff.toFixed(1)}kg de masse musculaire`;
        }
        return 'Amélioration globale de la condition physique et du bien-être';
    }

    displayNextSteps() {
        const nextStepsContainer = document.querySelector('.next-steps');
        if (!nextStepsContainer) return;

        const nextSteps = [
            {
                icon: 'fa-calendar-alt',
                title: 'Planifier votre programme',
                description: 'Commencez par établir un planning d\'entraînement adapté à votre emploi du temps'
            },
            {
                icon: 'fa-clipboard-list',
                title: 'Suivi des progrès',
                description: 'Utilisez notre outil de suivi pour mesurer vos progrès et rester motivé'
            },
            {
                icon: 'fa-users',
                title: 'Rejoindre la communauté',
                description: 'Connectez-vous avec d\'autres membres pour partager vos expériences et vous motiver mutuellement'
            }
        ];

        nextStepsContainer.innerHTML = nextSteps.map(step => `
            <div class="next-step-card">
                <i class="fas ${step.icon}"></i>
                <h3>${step.title}</h3>
                <p>${step.description}</p>
                <button class="btn-primary">${step.title}</button>
            </div>
        `).join('');
    }
}

// Initialiser les résultats quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    new QuizResults();
});
