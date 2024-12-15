// Gestionnaire de navigation
document.addEventListener('DOMContentLoaded', () => {
    // Gérer les boutons de navigation
    const setupNavigationButtons = () => {
        const quizButton = document.querySelector('a[href="/quiz.html"]');
        const aboutButton = document.querySelector('a[href="/about.html"]');

        if (quizButton) {
            quizButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/quiz.html';
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
