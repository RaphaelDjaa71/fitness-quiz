// Vérification de l'authentification et des rôles
document.addEventListener('DOMContentLoaded', async () => {
    await roleService.initialize();
    if (!roleService.isAdmin()) {
        window.location.href = '/unauthorized.html';
        return;
    }
    initializeDashboard();
});

async function initializeDashboard() {
    await Promise.all([
        loadStats(),
        initializeCharts(),
        loadRecentActivity()
    ]);
}

// Chargement des statistiques
async function loadStats() {
    try {
        const response = await fetch('/api/admin/stats');
        const stats = await response.json();

        document.getElementById('totalUsers').textContent = stats.totalUsers.toLocaleString();
        document.getElementById('totalQuizzes').textContent = stats.totalQuizzes.toLocaleString();
        document.getElementById('totalPrograms').textContent = stats.totalPrograms.toLocaleString();
        document.getElementById('totalRevenue').textContent = `${stats.totalRevenue.toLocaleString()}€`;
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Initialisation des graphiques
function initializeCharts() {
    initializeUserActivityChart();
    initializeQuizDistributionChart();
}

function initializeUserActivityChart() {
    const ctx = document.getElementById('userActivityChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
            datasets: [{
                label: 'Nouveaux Utilisateurs',
                data: [65, 78, 90, 85, 99, 112],
                borderColor: '#4CAF50',
                tension: 0.4,
                fill: false
            }, {
                label: 'Quiz Complétés',
                data: [45, 55, 65, 70, 85, 95],
                borderColor: '#2196F3',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initializeQuizDistributionChart() {
    const ctx = document.getElementById('quizDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Débutant', 'Intermédiaire', 'Avancé'],
            datasets: [{
                data: [30, 45, 25],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FFC107'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Chargement de l'activité récente
async function loadRecentActivity() {
    try {
        const response = await fetch('/api/admin/recent-activity');
        const activities = await response.json();
        
        const activityList = document.getElementById('recentActivityList');
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background-color: ${getActivityColor(activity.type)}">
                    <i class="${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${formatActivityTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erreur lors du chargement de l\'activité récente:', error);
    }
}

// Fonctions utilitaires
function getActivityColor(type) {
    const colors = {
        user: 'rgba(33, 150, 243, 0.1)',
        quiz: 'rgba(76, 175, 80, 0.1)',
        program: 'rgba(255, 193, 7, 0.1)',
        system: 'rgba(244, 67, 54, 0.1)'
    };
    return colors[type] || colors.system;
}

function getActivityIcon(type) {
    const icons = {
        user: 'fas fa-user',
        quiz: 'fas fa-tasks',
        program: 'fas fa-dumbbell',
        system: 'fas fa-cog'
    };
    return icons[type] || icons.system;
}

function formatActivityTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // moins d'une minute
        return 'À l\'instant';
    } else if (diff < 3600000) { // moins d'une heure
        const minutes = Math.floor(diff / 60000);
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diff < 86400000) { // moins d'un jour
        const hours = Math.floor(diff / 3600000);
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Gestion de la déconnexion
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

// Gestion des notifications
document.getElementById('notificationsBtn').addEventListener('click', () => {
    // Implémenter l'affichage des notifications
    alert('Fonctionnalité de notifications à venir');
});
