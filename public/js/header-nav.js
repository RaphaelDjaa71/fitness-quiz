// Éléments du DOM
const navMenu = document.getElementById('nav-menu');
const authContainer = document.getElementById('auth-container');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

// Fonction pour vérifier si l'utilisateur est connecté
async function checkAuthStatus() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showAuthButtons();
            return;
        }

        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showUserMenu();
        } else {
            showAuthButtons();
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        showAuthButtons();
    }
}

// Afficher le menu utilisateur
function showUserMenu() {
    if (navMenu) {
        navMenu.style.display = 'flex';
    }
    if (authContainer) {
        authContainer.style.display = 'none';
    }
    if (mobileMenuBtn) {
        mobileMenuBtn.style.display = 'block';
    }
}

// Afficher les boutons d'authentification
function showAuthButtons() {
    if (navMenu) {
        navMenu.style.display = 'none';
    }
    if (authContainer) {
        authContainer.style.display = 'flex';
    }
    if (mobileMenuBtn) {
        mobileMenuBtn.style.display = 'none';
    }
}

// Gérer le menu mobile
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Fermer le menu mobile lors du clic sur un lien
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            navMenu.classList.remove('active');
        }
    });
});

// Vérifier l'état de l'authentification au chargement
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Écouter les changements de stockage pour mettre à jour le menu
window.addEventListener('storage', (event) => {
    if (event.key === 'token') {
        checkAuthStatus();
    }
});
