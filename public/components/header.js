class Header {
    constructor() {
        this.headerElement = document.querySelector('.main-header');
        this.userInfoContainer = document.getElementById('user-info');
        this.authContainer = document.getElementById('auth-container');
        this.init();
    }

    async init() {
        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                this.showUserInfo(data.data.user);
            } else {
                this.showAuthButtons();
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'utilisateur:', error);
            this.showAuthButtons();
        }
    }

    showUserInfo(user) {
        if (this.userInfoContainer) {
            this.userInfoContainer.innerHTML = `
                <div class="user-profile">
                    <div class="user-details">
                        <h3>Bienvenue, ${user.name}</h3>
                        <p>${user.email}</p>
                    </div>
                    <div class="user-actions">
                        <button onclick="header.logout()" class="btn btn-secondary">
                            <i class="fas fa-sign-out-alt"></i> Déconnexion
                        </button>
                    </div>
                </div>
            `;
            this.userInfoContainer.style.display = 'block';
        }
        if (this.authContainer) {
            this.authContainer.style.display = 'none';
        }
    }

    showAuthButtons() {
        if (this.userInfoContainer) {
            this.userInfoContainer.style.display = 'none';
        }
        if (this.authContainer) {
            this.authContainer.style.display = 'flex';
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = '/';
            } else {
                console.error('Erreur lors de la déconnexion');
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    }
}

// Créer une instance globale du header
window.header = new Header();
