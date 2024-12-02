// Fonction globale pour réinitialiser l'interface utilisateur
function resetUserInterface() {
    // Réinitialiser les espaces utilisateur
    const userProfileElements = [
        document.getElementById('user-name'),
        document.getElementById('user-email'),
        document.getElementById('user-quiz-results'),
        document.getElementById('user-profile-image')
    ];

    userProfileElements.forEach(element => {
        if (element) {
            if (element.tagName === 'IMG') {
                element.src = '/images/default-avatar.png'; // Chemin vers une image par défaut
            } else {
                element.textContent = ''; // Vider le contenu texte
            }
        }
    });

    // Masquer les éléments spécifiques à l'utilisateur connecté
    const userSpecificElements = [
        document.getElementById('user-dashboard'),
        document.getElementById('user-stats'),
        document.getElementById('recent-quizzes')
    ];

    userSpecificElements.forEach(element => {
        if (element) {
            element.style.display = 'none';
        }
    });

    // Afficher les éléments génériques
    const genericElements = [
        document.getElementById('welcome-section'),
        document.getElementById('login-prompt')
    ];

    genericElements.forEach(element => {
        if (element) {
            element.style.display = 'block';
        }
    });

    // Nettoyer le stockage local
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// Écouter les événements de déconnexion
document.addEventListener('userLoggedOut', resetUserInterface);

// Exporter la fonction pour une utilisation globale
window.resetUserInterface = resetUserInterface;
