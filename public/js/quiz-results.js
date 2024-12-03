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
            { icon: 'fa-bullseye', label: 'Objectif', value: this.getGoalText(this.answers.goal) },
            { icon: 'fa-venus-mars', label: 'Genre', value: this.getGenderText(this.answers.gender) },
            { icon: 'fa-calendar', label: 'Âge', value: `${this.answers.age} ans` },
            { icon: 'fa-ruler-vertical', label: 'Taille', value: `${this.answers.height} cm` },
            { icon: 'fa-weight', label: 'Poids actuel', value: `${this.answers['current-weight']} kg` },
            { icon: 'fa-weight-scale', label: 'Poids cible', value: `${this.answers['target-weight']} kg` },
            { icon: 'fa-running', label: 'Niveau d\'activité', value: this.getActivityText(this.answers['activity-level']) },
            { icon: 'fa-dumbbell', label: 'Expérience musculation', value: this.getExperienceText(this.answers.experience) },
            { icon: 'fa-calendar-check', label: 'Fréquence d\'entraînement', value: this.getFrequencyText(this.answers.frequency) },
            { icon: 'fa-utensils', label: 'Préférences alimentaires', value: this.getDietText(this.answers.diet) }
        ];

        summaryContainer.innerHTML = summaryItems.map(item => `
            <div class="summary-item">
                <div class="summary-icon">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-label">${item.label}</div>
                    <div class="summary-value">${item.value || 'Non spécifié'}</div>
                </div>
            </div>
        `).join('');
    }

    getGoalText(goal) {
        const goals = {
            'weight-loss': 'Perdre du poids',
            'muscle-gain': 'Prendre du muscle',
            'fitness': 'Être en meilleure forme'
        };
        return goals[goal] || goal;
    }

    getGenderText(gender) {
        const genders = {
            'male': 'Homme',
            'female': 'Femme'
        };
        return genders[gender] || gender;
    }

    getActivityText(activity) {
        const activities = {
            'sedentary': 'Sédentaire',
            'light': 'Léger',
            'moderate': 'Modéré',
            'active': 'Actif',
            'very-active': 'Très actif'
        };
        return activities[activity] || activity;
    }

    getExperienceText(experience) {
        const experiences = {
            'beginner': 'Débutant',
            'intermediate': 'Intermédiaire',
            'advanced': 'Avancé'
        };
        return experiences[experience] || experience;
    }

    getFrequencyText(frequency) {
        const frequencies = {
            '2-times': '2 fois par semaine',
            '3-times': '3 fois par semaine',
            '4-times': '4 fois par semaine',
            '5-times': '5+ fois par semaine'
        };
        return frequencies[frequency] || frequency;
    }

    getDietText(diet) {
        const diets = {
            'none': 'Standard',
            'vegetarian': 'Végétarien',
            'vegan': 'Végétalien',
            'keto': 'Keto',
            'paleo': 'Paléo'
        };
        return diets[diet] || diet;
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
        const goal = this.answers.goal;
        const experience = this.answers.experience;
        const equipment = this.answers.equipment || [];
        
        const recommendations = [
            {
                icon: 'fa-heart',
                title: 'Programme personnalisé',
                description: this.getPersonalizedProgram(goal, experience, equipment)
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

        // Add equipment-specific recommendation if needed
        if (equipment.length === 0 || equipment.includes('none')) {
            recommendations.push({
                icon: 'fa-dumbbell',
                title: 'Équipement recommandé',
                description: 'Pour optimiser vos résultats, nous vous recommandons de vous procurer au minimum une paire d\'haltères et un tapis de fitness.'
            });
        }

        return recommendations;
    }

    getPersonalizedProgram(goal, experience, equipment) {
        let baseProgram = '';

        // Determine base program based on goal and experience
        if (goal === 'weight-loss') {
            if (experience === 'beginner') {
                baseProgram = 'Programme de cardio-training progressif avec initiation aux exercices de force';
            } else if (experience === 'intermediate') {
                baseProgram = 'Mix équilibré de HIIT et musculation';
            } else {
                baseProgram = 'Programme intensif alternant cardio haute intensité et musculation';
            }
        } else if (goal === 'muscle-gain') {
            if (experience === 'beginner') {
                baseProgram = 'Programme de base en musculation avec focus sur les mouvements composés';
            } else if (experience === 'intermediate') {
                baseProgram = 'Split training avec progression en charge';
            } else {
                baseProgram = 'Programme de musculation avancé avec périodisation';
            }
        } else { // fitness
            if (experience === 'beginner') {
                baseProgram = 'Programme complet de remise en forme progressive';
            } else if (experience === 'intermediate') {
                baseProgram = 'Programme varié combinant cardio et renforcement';
            } else {
                baseProgram = 'Programme personnalisé haute intensité';
            }
        }

        // Adapt program based on available equipment
        let equipmentNote = '';
        if (equipment.length === 0 || equipment.includes('none')) {
            equipmentNote = ' adapté pour des exercices au poids du corps';
        } else if (equipment.includes('dumbbells')) {
            equipmentNote = ' utilisant des haltères pour une progression optimale';
        } else if (equipment.includes('gym')) {
            equipmentNote = ' optimisé pour une salle de sport complète';
        } else if (equipment.includes('home-gym')) {
            equipmentNote = ' adapté à votre équipement maison';
        }

        return baseProgram + equipmentNote;
    }

    getNutritionRecommendations() {
        const goal = this.answers.goal;
        const diet = this.answers.diet;

        let baseRecommendation = '';
        if (goal === 'weight-loss') {
            baseRecommendation = 'Déficit calorique modéré avec accent sur les protéines et légumes';
        } else if (goal === 'muscle-gain') {
            baseRecommendation = 'Surplus calorique contrôlé avec focus sur les protéines et glucides complexes';
        } else {
            baseRecommendation = 'Alimentation équilibrée adaptée à vos besoins énergétiques';
        }

        // Add diet-specific recommendations
        let dietNote = '';
        if (diet === 'vegetarian') {
            dietNote = '\nSources de protéines recommandées : œufs, produits laitiers, légumineuses';
        } else if (diet === 'vegan') {
            dietNote = '\nSources de protéines recommandées : légumineuses, tofu, seitan, tempeh';
        } else if (diet === 'keto') {
            dietNote = '\nRépartition recommandée : 70% lipides, 25% protéines, 5% glucides';
        } else if (diet === 'paleo') {
            dietNote = '\nFocus sur les aliments non transformés, viandes maigres et légumes';
        }

        return baseRecommendation + dietNote;
    }

    getGoalRecommendations() {
        const currentWeight = parseFloat(this.answers['current-weight']);
        const targetWeight = parseFloat(this.answers['target-weight']);
        const goal = this.answers.goal;

        if (goal === 'weight-loss') {
            const weightDiff = currentWeight - targetWeight;
            return `Objectif de perte de ${weightDiff.toFixed(1)}kg de manière saine et durable`;
        } else if (goal === 'muscle-gain') {
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
                <div class="next-step-card-content">
                    <h3>${step.title}</h3>
                </div>
            </div>
        `).join('');
    }
}

// Initialiser les résultats quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    new QuizResults();
});
