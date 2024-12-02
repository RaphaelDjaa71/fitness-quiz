document.addEventListener('DOMContentLoaded', async () => {
    // Charger le header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        try {
            const response = await fetch('/components/header.html');
            const headerHtml = await response.text();
            headerPlaceholder.innerHTML = headerHtml;

            // Initialiser les éléments du header après l'insertion
            initializeHeader();
        } catch (error) {
            console.error('Erreur lors du chargement du header:', error);
        }
    }
});

function initializeHeader() {
    // Mettre en surbrillance le lien actif
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-container a');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Vérifier l'état de l'authentification
    checkAuthState();
}

async function checkAuthState() {
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
        });

        const userInfo = document.getElementById('user-info');
        const authContainer = document.getElementById('auth-container');

        if (response.ok) {
            const data = await response.json();
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="user-profile">
                        <div class="user-details">
                            <h3>Bienvenue, ${data.user.name}</h3>
                            <p>${data.user.email}</p>
                        </div>
                        <div class="user-actions">
                            <button onclick="logout()" class="btn btn-secondary">
                                <i class="fas fa-sign-out-alt"></i> Déconnexion
                            </button>
                        </div>
                    </div>
                `;
                userInfo.style.display = 'block';
            }
            if (authContainer) {
                authContainer.style.display = 'none';
            }
        } else {
            if (userInfo) {
                userInfo.style.display = 'none';
            }
            if (authContainer) {
                authContainer.style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
    }
}

async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            window.location.reload();
        } else {
            console.error('Erreur lors de la déconnexion');
        }
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }
}
