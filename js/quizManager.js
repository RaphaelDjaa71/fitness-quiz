class QuizManager {
    constructor() {
        this.state = this.loadState() || {
            currentPage: 0,
            answers: {},
            pages: [
                'index.html',
                'objectif.html',
                'sexe.html',
                'age.html',
                'taille.html',
                'poids-actuel.html',
                'objectif-poids.html',
                'niveau-activite.html',
                'experience-musculation.html',
                'frequence-entrainement.html',
                'equipement.html',
                'regime-alimentaire.html',
                'resultats.html'
            ]
        };
        this.initializeProgressBar();
        this.initializePageInteractions();
    }

    // Gestion de l'état
    loadState() {
        const savedState = localStorage.getItem('fitnessQuizState');
        return savedState ? JSON.parse(savedState) : null;
    }

    saveState() {
        localStorage.setItem('fitnessQuizState', JSON.stringify(this.state));
    }

    resetState() {
        localStorage.removeItem('fitnessQuizState');
        this.state = {
            currentPage: 0,
            answers: {},
            pages: this.state.pages
        };
        this.saveState();
    }

    // Navigation
    getCurrentPageIndex() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        return this.state.pages.indexOf(currentPage);
    }

    updateProgressBar() {
        const currentIndex = this.getCurrentPageIndex();
        const progress = (currentIndex / (this.state.pages.length - 1)) * 100;
        const progressBar = document.querySelector('.progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    navigateToPage(page) {
        const currentIndex = this.getCurrentPageIndex();
        const targetIndex = this.state.pages.indexOf(page);
        
        if (targetIndex !== -1) {
            this.state.currentPage = targetIndex;
            this.saveState();
            
            // Animation de transition
            const container = document.querySelector('.container');
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                window.location.href = page;
            }, 300);
        }
    }

    // Gestion des réponses
    saveAnswer(questionId, answer) {
        this.state.answers[questionId] = answer;
        this.saveState();
        this.updateUI();
    }

    getAnswer(questionId) {
        return this.state.answers[questionId];
    }

    // Initialisation de la page
    initializeProgressBar() {
        this.updateProgressBar();
    }

    initializePageInteractions() {
        // Restaurer les réponses précédentes
        const currentPage = window.location.pathname.split('/').pop();
        const questionId = currentPage.replace('.html', '');
        const savedAnswer = this.getAnswer(questionId);

        if (savedAnswer) {
            const options = document.querySelectorAll('.option-card');
            options.forEach(option => {
                if (option.dataset.value === savedAnswer) {
                    option.classList.add('selected');
                }
            });
        }

        // Gérer les clics sur les options
        document.querySelectorAll('.option-card').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.option-card').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.saveAnswer(questionId, option.dataset.value);
            });
        });

        // Animation d'entrée de page
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    // Génération du profil
    generateProfile() {
        const profile = {
            objectif: this.state.answers.objectif,
            sexe: this.state.answers.sexe,
            age: parseInt(this.state.answers.age),
            taille: parseInt(this.state.answers.taille),
            poidsActuel: parseInt(this.state.answers.poidsActuel),
            objectifPoids: parseInt(this.state.answers.objectifPoids),
            niveauActivite: this.state.answers.niveauActivite,
            experienceMusculation: this.state.answers.experienceMusculation,
            frequenceEntrainement: parseInt(this.state.answers.frequenceEntrainement),
            equipement: this.state.answers.equipement,
            regimeAlimentaire: this.state.answers.regimeAlimentaire
        };

        return this.calculateRecommendations(profile);
    }

    calculateRecommendations(profile) {
        // Calcul des besoins caloriques de base (formule de Mifflin-St Jeor)
        let bmr;
        if (profile.sexe === 'homme') {
            bmr = 10 * profile.poidsActuel + 6.25 * profile.taille - 5 * profile.age + 5;
        } else {
            bmr = 10 * profile.poidsActuel + 6.25 * profile.taille - 5 * profile.age - 161;
        }

        // Facteur d'activité
        const activityFactors = {
            sedentaire: 1.2,
            leger: 1.375,
            modere: 1.55,
            actif: 1.725,
            tresActif: 1.9
        };

        const tdee = bmr * activityFactors[profile.niveauActivite];
        
        // Ajustement selon l'objectif
        let calorieTarget;
        switch(profile.objectif) {
            case 'perte-poids':
                calorieTarget = tdee - 500;
                break;
            case 'prise-masse':
                calorieTarget = tdee + 500;
                break;
            default:
                calorieTarget = tdee;
        }

        return {
            calories: Math.round(calorieTarget),
            proteines: Math.round(profile.poidsActuel * 2), // 2g par kg de poids corporel
            glucides: Math.round((calorieTarget * 0.4) / 4), // 40% des calories
            lipides: Math.round((calorieTarget * 0.3) / 9), // 30% des calories
            seancesParSemaine: profile.frequenceEntrainement,
            niveauExperience: profile.experienceMusculation,
            equipementDisponible: profile.equipement
        };
    }
}

// Initialisation
const quizManager = new QuizManager();
window.quizManager = quizManager; // Rendre accessible globalement
