class AdminManager {
    constructor() {
        this.userListElement = document.getElementById('user-list');
        this.authStatusElement = document.getElementById('auth-status');
        this.adminActionsElement = document.getElementById('admin-actions');
        this.init();
    }

    async init() {
        await this.fetchUsers();
        this.checkAuthStatus();
        this.setupLoginForm();
    }

    setupLoginForm() {
        // Ajouter le formulaire de connexion
        const loginSection = document.createElement('div');
        loginSection.className = 'card mt-3';
        loginSection.innerHTML = `
            <div class="card-header">Connexion Admin</div>
            <div class="card-body">
                <form id="loginForm" class="needs-validation" novalidate>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email" required>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Mot de passe</label>
                        <input type="password" class="form-control" id="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Se connecter</button>
                </form>
            </div>
        `;

        // Insérer le formulaire juste après le statut d'authentification
        this.authStatusElement.closest('.card').after(loginSection);

        // Gérer la soumission du formulaire
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.status === 'success' && data.token) {
                localStorage.setItem('token', data.token);
                this.updateAuthStatus(true);
                await this.fetchUsers(); // Rafraîchir la liste des utilisateurs
                
                // Masquer le formulaire de connexion après connexion réussie
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    loginForm.closest('.card').style.display = 'none';
                }
            } else {
                throw new Error(data.message || 'Erreur de connexion');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            alert('Erreur de connexion: ' + error.message);
        }
    }

    async fetchUsers() {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch('/api/admin/users', {
                headers: headers
            });
            
            const data = await response.json();

            if (data.status === 'success') {
                this.displayUsers(data.users);
                this.updateAuthStatus(data.isAuthenticated);
            } else {
                throw new Error(data.message || 'Erreur lors de la récupération des utilisateurs');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.userListElement.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-danger">
                        Erreur lors du chargement des utilisateurs
                    </td>
                </tr>
            `;
        }
    }

    checkAuthStatus() {
        const token = localStorage.getItem('token');
        this.updateAuthStatus(!!token);
    }

    updateAuthStatus(isAuthenticated) {
        if (this.authStatusElement) {
            this.authStatusElement.textContent = isAuthenticated ? 'Authentifié' : 'Invité';
            this.authStatusElement.classList.toggle('bg-success', isAuthenticated);
            this.authStatusElement.classList.toggle('bg-warning', !isAuthenticated);
        }

        if (this.adminActionsElement) {
            this.adminActionsElement.style.display = isAuthenticated ? 'block' : 'none';
        }

        // Afficher/masquer le formulaire de connexion
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.closest('.card').style.display = isAuthenticated ? 'none' : 'block';
        }
    }

    displayUsers(users) {
        if (!this.userListElement || !Array.isArray(users)) return;

        if (users.length === 0) {
            this.userListElement.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">
                        Aucun utilisateur trouvé
                    </td>
                </tr>
            `;
            return;
        }

        this.userListElement.innerHTML = users.map(user => {
            const createdAt = new Date(user.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const lastLogin = user.lastLogin 
                ? new Date(user.lastLogin).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) 
                : 'Jamais connecté';

            return `
                <tr>
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${createdAt}</td>
                    <td>${lastLogin}</td>
                </tr>
            `;
        }).join('');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new AdminManager();
});
