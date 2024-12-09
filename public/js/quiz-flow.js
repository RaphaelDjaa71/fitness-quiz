class QuizFlow {
    constructor() {
        this.user = null;
        this.quizAnswers = null;
        this.initEventListeners();
    }

    initEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.checkAuthStatus();
        });
    }

    async checkAuthStatus() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                this.redirectToLogin();
                return;
            }

            const response = await fetch('/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Token invalide');
            }

            const userData = await response.json();
            this.user = userData.user;
            this.enableQuizInteraction();
        } catch (error) {
            console.error('Erreur de vérification:', error);
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        window.location.href = '/login.html?redirect=/quiz.html';
    }

    enableQuizInteraction() {
        const startQuizButton = document.getElementById('start-quiz-btn');
        const quizContainer = document.getElementById('quiz-container');
        
        if (startQuizButton) {
            startQuizButton.addEventListener('click', () => {
                quizContainer.classList.remove('hidden');
                startQuizButton.classList.add('hidden');
            });
        }

        // Écouter la fin du quiz
        document.addEventListener('quiz-completed', async (event) => {
            this.quizAnswers = event.detail.answers;
            await this.saveQuizResults();
        });
    }

    async saveQuizResults() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/quiz/save-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: this.user._id,
                    answers: this.quizAnswers,
                    completedAt: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Impossible de sauvegarder les résultats');
            }

            const result = await response.json();
            
            // Stocker les résultats pour la page de résultats
            localStorage.setItem('quizAnswers', JSON.stringify(this.quizAnswers));
            localStorage.setItem('quizResultId', result._id);

            // Rediriger vers la page de résultats
            window.location.href = '/quiz-results.html';
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            alert('Une erreur est survenue. Veuillez réessayer.');
        }
    }

    // Méthode pour générer un programme personnalisé
    async generatePersonalProgram() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/programs/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(this.quizAnswers)
            });

            if (!response.ok) {
                throw new Error('Impossible de générer le programme');
            }

            const program = await response.json();
            return program;
        } catch (error) {
            console.error('Erreur de génération de programme:', error);
            return null;
        }
    }
}

// Initialiser le flux du quiz
const quizFlow = new QuizFlow();
