// État global
let currentPage = 1;
let totalPages = 1;
let selectedUserId = null;
let users = [];

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    await roleService.initialize();
    if (!roleService.isAdmin()) {
        window.location.href = '/unauthorized.html';
        return;
    }
    initializeUsersPage();
});

async function initializeUsersPage() {
    setupEventListeners();
    await loadUsers();
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Filtres
    document.getElementById('userSearch').addEventListener('input', debounce(loadUsers, 300));
    document.getElementById('roleFilter').addEventListener('change', loadUsers);
    document.getElementById('statusFilter').addEventListener('change', loadUsers);
    document.getElementById('sortFilter').addEventListener('change', loadUsers);

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));

    // Sélection multiple
    document.getElementById('selectAll').addEventListener('change', toggleSelectAll);

    // Formulaire utilisateur
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);
}

// Chargement des utilisateurs
async function loadUsers() {
    try {
        const searchQuery = document.getElementById('userSearch').value;
        const roleFilter = document.getElementById('roleFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const sortBy = document.getElementById('sortFilter').value;

        const response = await fetch(`/api/admin/users?page=${currentPage}&search=${searchQuery}&role=${roleFilter}&status=${statusFilter}&sort=${sortBy}`);
        const data = await response.json();

        users = data.users;
        totalPages = data.totalPages;
        
        updateUsersTable();
        updatePagination();
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        showNotification('Erreur lors du chargement des utilisateurs', 'error');
    }
}

// Mise à jour du tableau des utilisateurs
function updateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <input type="checkbox" class="user-select" value="${user._id}">
            </td>
            <td>
                <div class="user-info">
                    <img src="${user.avatar || '/images/default-avatar.png'}" alt="${user.name}" class="user-avatar">
                    <div>
                        <div class="user-name">${user.name}</div>
                        <div class="user-id">ID: ${user._id}</div>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>
                <span class="badge ${getRoleBadgeClass(user.role)}">${user.role}</span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(user.status)}">${user.status}</span>
            </td>
            <td>${formatDate(user.lastLogin)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editUser('${user._id}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="showDeleteModal('${user._id}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon" onclick="impersonateUser('${user._id}')" title="Se connecter en tant que">
                        <i class="fas fa-user-secret"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Gestion de la pagination
function updatePagination() {
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;

    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function changePage(delta) {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        loadUsers();
    }
}

// Gestion du modal utilisateur
function showAddUserModal() {
    selectedUserId = null;
    document.getElementById('modalTitle').textContent = 'Ajouter un Utilisateur';
    document.getElementById('userForm').reset();
    document.getElementById('userModal').classList.add('show');
}

function editUser(userId) {
    selectedUserId = userId;
    const user = users.find(u => u._id === userId);
    if (!user) return;

    document.getElementById('modalTitle').textContent = 'Modifier l\'Utilisateur';
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    
    document.getElementById('userModal').classList.add('show');
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('show');
    document.getElementById('userForm').reset();
    selectedUserId = null;
}

// Gestion du formulaire utilisateur
async function handleUserSubmit(event) {
    event.preventDefault();

    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value
    };

    try {
        const url = selectedUserId 
            ? `/api/admin/users/${selectedUserId}`
            : '/api/admin/users';
        
        const method = selectedUserId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            showNotification(
                selectedUserId ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès',
                'success'
            );
            closeUserModal();
            loadUsers();
        } else {
            const error = await response.json();
            showNotification(error.message, 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showNotification('Erreur lors de la sauvegarde', 'error');
    }
}

// Gestion de la suppression
function showDeleteModal(userId) {
    selectedUserId = userId;
    document.getElementById('deleteModal').classList.add('show');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    selectedUserId = null;
}

async function confirmDelete() {
    if (!selectedUserId) return;

    try {
        const response = await fetch(`/api/admin/users/${selectedUserId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Utilisateur supprimé avec succès', 'success');
            closeDeleteModal();
            loadUsers();
        } else {
            const error = await response.json();
            showNotification(error.message, 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}

// Fonctionnalité d'impersonation
async function impersonateUser(userId) {
    try {
        const response = await fetch(`/api/admin/users/${userId}/impersonate`, {
            method: 'POST'
        });

        if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('impersonateToken', token);
            window.location.href = '/quiz.html';
        } else {
            const error = await response.json();
            showNotification(error.message, 'error');
        }
    } catch (error) {
        console.error('Erreur lors de l\'impersonation:', error);
        showNotification('Erreur lors de l\'impersonation', 'error');
    }
}

// Fonctions utilitaires
function getRoleBadgeClass(role) {
    const classes = {
        admin: 'badge-danger',
        trainer: 'badge-warning',
        user: 'badge-success'
    };
    return classes[role] || 'badge-secondary';
}

function getStatusBadgeClass(status) {
    const classes = {
        active: 'badge-success',
        inactive: 'badge-secondary',
        pending: 'badge-warning'
    };
    return classes[status] || 'badge-secondary';
}

function formatDate(date) {
    if (!date) return 'Jamais';
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    // Implémenter le système de notification
    alert(message);
}

// Gestion de la sélection multiple
function toggleSelectAll(event) {
    const checkboxes = document.querySelectorAll('.user-select');
    checkboxes.forEach(checkbox => checkbox.checked = event.target.checked);
}

// Gestion de la déconnexion
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('impersonateToken');
    window.location.href = '/login.html';
}
