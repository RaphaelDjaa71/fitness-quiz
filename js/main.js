// Gestion des données du quiz
class QuizManager {
    constructor() {
        this.answers = {};
        this.currentPage = 1;
        this.totalPages = 13;
        this.loadAnswers();
        this.updateProgressBar();
    }

    // Sauvegarde les réponses dans le localStorage
    saveAnswer(question, answer) {
        this.answers[question] = answer;
        localStorage.setItem('fitnessQuizAnswers', JSON.stringify(this.answers));
        this.updateProgressBar();
    }

    // Charge les réponses depuis le localStorage
    loadAnswers() {
        const savedAnswers = localStorage.getItem('fitnessQuizAnswers');
        if (savedAnswers) {
            this.answers = JSON.parse(savedAnswers);
        }
    }

    // Met à jour la barre de progression
    updateProgressBar() {
        const progress = document.querySelector('.progress');
        if (progress) {
            const percentage = (Object.keys(this.answers).length / (this.totalPages - 1)) * 100;
            progress.style.width = `${percentage}%`;
        }
    }

    // Navigation entre les pages
    navigateToPage(page) {
        window.location.href = page;
    }

    // Réinitialise le quiz
    resetQuiz() {
        localStorage.removeItem('fitnessQuizAnswers');
        this.answers = {};
        this.navigateToPage('index.html');
    }
}

// Initialisation du gestionnaire de quiz
const quizManager = new QuizManager();

// Gestion des animations
document.addEventListener('DOMContentLoaded', () => {
    // Ajoute la classe fade-in aux éléments
    document.querySelectorAll('.fade-in').forEach(element => {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.opacity = '1';
        }, 100);
    });

    // Gestion des boutons de navigation
    const prevBtn = document.querySelector('.btn-prev');
    const nextBtn = document.querySelector('.btn-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            window.history.back();
        });
    }

    // Gestion des options cliquables
    document.querySelectorAll('.option-card').forEach(option => {
        option.addEventListener('click', function() {
            const question = this.closest('.quiz-page').dataset.question;
            const answer = this.dataset.value;
            quizManager.saveAnswer(question, answer);
            
            // Ajoute une classe active à l'option sélectionnée
            document.querySelectorAll('.option-card').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Gestion des curseurs
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        input.addEventListener('input', function() {
            const question = this.closest('.quiz-page').dataset.question;
            quizManager.saveAnswer(question, this.value);
            
            // Met à jour l'affichage de la valeur
            const output = this.nextElementSibling;
            if (output) {
                output.textContent = this.value;
            }
        });
    });
});

// Fonction pour générer le programme personnalisé
function generateProgram() {
    const answers = quizManager.answers;
    let program = {
        workouts: [],
        nutrition: [],
        recommendations: []
    };

    // Logique de génération du programme basée sur les réponses
    if (answers.objectif === 'Perdre du poids') {
        program.workouts.push('Cardio HIIT 3x par semaine');
        program.workouts.push('Musculation full body 2x par semaine');
        program.nutrition.push('Déficit calorique modéré de 20%');
    } else if (answers.objectif === 'Prendre du muscle') {
        program.workouts.push('Musculation split 4x par semaine');
        program.workouts.push('Cardio léger 2x par semaine');
        program.nutrition.push('Surplus calorique de 10%');
    }

    return program;
}

// Fonction pour afficher les résultats
function displayResults() {
    const program = generateProgram();
    const resultsContainer = document.querySelector('.results-container');
    
    if (resultsContainer) {
        let html = '<h2>Votre Programme Personnalisé</h2>';
        
        html += '<h3>Entraînements</h3>';
        program.workouts.forEach(workout => {
            html += `<p>${workout}</p>`;
        });

        html += '<h3>Nutrition</h3>';
        program.nutrition.forEach(tip => {
            html += `<p>${tip}</p>`;
        });

        resultsContainer.innerHTML = html;
    }
}
