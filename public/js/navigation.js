// Gestionnaire de navigation
document.addEventListener('DOMContentLoaded', () => {
    // Gérer les boutons de navigation
    const setupNavigationButtons = () => {
        const quizButton = document.querySelector('a[href="/quiz.html"]');
        const aboutButton = document.querySelector('a[href="/about.html"]');

        if (quizButton) {
            quizButton.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    // Vérifier l'authentification avant de rediriger
                    const response = await fetch('/auth/check-auth', {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const data = await response.json();

                    if (data.isAuthenticated) {
                        window.location.href = '/quiz.html';
                    } else {
                        // Si non authentifié, rediriger vers la page de connexion
                        window.location.href = '/login.html?redirect=/quiz.html';
                    }
                } catch (error) {
                    console.error('Erreur lors de la vérification de l\'authentification:', error);
                    // En cas d'erreur, rediriger vers la page de connexion
                    window.location.href = '/login.html?redirect=/quiz.html';
                }
            });
        }

        if (aboutButton) {
            aboutButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/about.html';
            });
        }
    };

    setupNavigationButtons();
});
