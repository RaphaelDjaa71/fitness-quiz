// Configuration
const CONFIG = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0,
    users: []
};

// DOM Elements
const elements = {
    userModal: document.getElementById('userModal'),
    userForm: document.getElementById('userForm'),
    userSearch: document.querySelector('.header-search input'),
    roleFilter: document.getElementById('roleFilter'),
    statusFilter: document.getElementById('statusFilter'),
    usersTableBody: document.getElementById('usersTableBody'),
    paginationNumbers: document.getElementById('paginationNumbers'),
    prevPage: document.getElementById('prevPage'),
    nextPage: document.getElementById('nextPage'),
    startRange: document.getElementById('startRange'),
    endRange: document.getElementById('endRange'),
    totalItems: document.getElementById('totalItems'),
    totalUsersCount: document.getElementById('totalUsersCount'),
    activeUsersCount: document.getElementById('activeUsersCount'),
    premiumUsersCount: document.getElementById('premiumUsersCount'),
    newUsersCount: document.getElementById('newUsersCount')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadUsers();
    updateStatistics();
});

// Event Listeners
function initializeEventListeners() {
    elements.userSearch.addEventListener('input', debounce(handleSearch, 300));
    elements.roleFilter.addEventListener('change', handleFilters);
    elements.statusFilter.addEventListener('change', handleFilters);
    elements.userForm.addEventListener('submit', handleUserSubmit);
    elements.prevPage.addEventListener('click', () => changePage(CONFIG.currentPage - 1));
    elements.nextPage.addEventListener('click', () => changePage(CONFIG.currentPage + 1));
}

// API Calls
async function loadUsers() {
    try {
        const searchQuery = document.getElementById('userSearch').value;
        const roleFilter = document.getElementById('roleFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        const response = await fetch(`/api/admin/users?page=${CONFIG.currentPage}&search=${searchQuery}&role=${roleFilter}&status=${statusFilter}`);
        const data = await response.json();

        CONFIG.users = data.users;
        CONFIG.totalItems = data.totalItems;
        
        updateTable();
        updatePagination();
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Erreur lors du chargement des utilisateurs', 'error');
    }
}

async function updateStatistics() {
    try {
        // Simuler un appel API pour les statistiques
        const stats = {
            total: 2845,
            active: 2156,
            premium: 892,
            new: 145
        };
        
        elements.totalUsersCount.textContent = stats.total;
        elements.activeUsersCount.textContent = stats.active;
        elements.premiumUsersCount.textContent = stats.premium;
        elements.newUsersCount.textContent = stats.new;
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

// Table Management
function updateTable() {
    const startIndex = (CONFIG.currentPage - 1) * CONFIG.itemsPerPage;
    const endIndex = startIndex + CONFIG.itemsPerPage;
    const filteredUsers = getFilteredUsers();
    
    elements.usersTableBody.innerHTML = '';
    
    filteredUsers.slice(startIndex, endIndex).forEach(user => {
        const row = createUserRow(user);
        elements.usersTableBody.appendChild(row);
    });
    
    updateTableInfo(startIndex, endIndex, filteredUsers.length);
}

function createUserRow(user) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="checkbox" class="user-select" value="${user._id}"></td>
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
        <td><span class="badge badge-${getRoleBadgeClass(user.role)}">${user.role}</span></td>
        <td><span class="badge badge-${getStatusBadgeClass(user.status)}">${user.status}</span></td>
        <td>${formatDate(user.lastLogin)}</td>
        <td>
            <div class="action-buttons">
                <button class="btn-icon" onclick="editUser('${user._id}')" title="Éditer">
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
    `;
    return tr;
}

// Pagination
function updatePagination() {
    const totalPages = Math.ceil(CONFIG.totalItems / CONFIG.itemsPerPage);
    elements.paginationNumbers.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `btn-page ${i === CONFIG.currentPage ? 'active' : ''}`;
        button.textContent = i;
        button.addEventListener('click', () => changePage(i));
        elements.paginationNumbers.appendChild(button);
    }
    
    elements.prevPage.disabled = CONFIG.currentPage === 1;
    elements.nextPage.disabled = CONFIG.currentPage === totalPages;
}

function changePage(page) {
    const totalPages = Math.ceil(CONFIG.totalItems / CONFIG.itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        CONFIG.currentPage = page;
        loadUsers();
        updatePagination();
    }
}

// Filters and Search
function handleSearch(event) {
    CONFIG.currentPage = 1;
    loadUsers();
    updatePagination();
}

function handleFilters() {
    CONFIG.currentPage = 1;
    loadUsers();
    updatePagination();
}

function getFilteredUsers() {
    let filtered = [...CONFIG.users];
    
    const searchTerm = elements.userSearch.value.toLowerCase();
    const roleFilter = elements.roleFilter.value;
    const statusFilter = elements.statusFilter.value;
    
    if (searchTerm) {
        filtered = filtered.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }
    
    if (roleFilter !== 'all') {
        filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    return filtered;
}

// Modal Management
function openAddUserModal() {
    elements.userModal.classList.add('show');
    elements.userForm.reset();
    document.getElementById('modalTitle').textContent = 'Ajouter un Utilisateur';
}

function closeUserModal() {
    elements.userModal.classList.remove('show');
}

async function handleUserSubmit(event) {
    event.preventDefault();
    
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value
    };
    
    try {
        const url = document.getElementById('userId').value 
            ? `/api/admin/users/${document.getElementById('userId').value}`
            : '/api/admin/users';
        
        const method = document.getElementById('userId').value ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            showNotification(
                document.getElementById('userId').value ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès',
                'success'
            );
            closeUserModal();
            loadUsers();
        } else {
            const error = await response.json();
            showNotification(error.message, 'error');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showNotification('Erreur lors de la sauvegarde', 'error');
    }
}

// Utility Functions
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

function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getRoleBadgeClass(role) {
    const classes = {
        admin: 'primary',
        trainer: 'success',
        user: 'secondary'
    };
    return classes[role] || 'secondary';
}

function getStatusBadgeClass(status) {
    const classes = {
        active: 'success',
        inactive: 'danger',
        pending: 'warning'
    };
    return classes[status] || 'secondary';
}

function updateTableInfo(start, end, total) {
    elements.startRange.textContent = Math.min(start + 1, total);
    elements.endRange.textContent = Math.min(end, total);
    elements.totalItems.textContent = total;
}

function showNotification(message, type) {
    // Implement notification system
    console.log(`${type}: ${message}`);
}

// Delete User
function showDeleteModal(userId) {
    document.getElementById('deleteModal').classList.add('show');
    document.getElementById('deleteUserId').value = userId;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
}

async function confirmDelete() {
    const userId = document.getElementById('deleteUserId').value;
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
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
        console.error('Error deleting user:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}

// Impersonate User
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
        console.error('Error impersonating user:', error);
        showNotification('Erreur lors de l\'impersonation', 'error');
    }
}

// Edit User
async function editUser(userId) {
    try {
        const user = CONFIG.users.find(u => u._id === userId);
        if (user) {
            document.getElementById('modalTitle').textContent = 'Modifier l\'Utilisateur';
            document.getElementById('userId').value = user._id;
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userStatus').value = user.status;
            elements.userModal.classList.add('show');
        }
    } catch (error) {
        console.error('Error loading user details:', error);
        showNotification('Erreur lors du chargement des détails', 'error');
    }
}
