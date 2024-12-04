// Vérification de l'authentification côté client
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Vérifier le statut de l'authentification
        const response = await fetch('/api/auth/status');
        const data = await response.json();

        // Si l'utilisateur n'est pas authentifié
        if (!data.isAuthenticated) {
            // Rediriger vers la page de connexion
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Erreur de vérification d\'authentification:', error);
        // En cas d'erreur, rediriger par précaution
        window.location.href = '/login.html';
    }
});
