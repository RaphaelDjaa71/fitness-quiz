// Données simulées pour le développement
const mockUserPerformanceData = [
    {
        id: 1,
        username: "jean_dupont",
        name: "Jean Dupont",
        quizzesTaken: 12,
        averageScore: 85.5,
        lastActivity: "2024-01-10T14:30:00Z",
        performanceLevel: "top"
    },
    {
        id: 2,
        username: "marie_martin",
        name: "Marie Martin",
        quizzesTaken: 8,
        averageScore: 72.3,
        lastActivity: "2024-01-08T09:15:00Z",
        performanceLevel: "medium"
    },
    // Ajoutez plus de données simulées ici
];

// État de l'application
let currentPage = 1;
const usersPerPage = 10;
let currentFilter = 'all';

// Configuration globale des graphiques
Chart.defaults.global = {
    defaultFontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    defaultFontColor: '#1f2937',
    defaultFontSize: 12,
    layout: {
        padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
        }
    },
    tooltips: {
        backgroundColor: '#1f2937',
        titleFontColor: '#ffffff',
        bodyFontColor: '#ffffff',
        cornerRadius: 4,
        xPadding: 10,
        yPadding: 10
    }
};

// Initialisation de la page
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    initializeEventListeners();
    setupInteractiveElements();
    loadPerformanceData();
});

// Initialisation des graphiques
function initializeCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        },
        hover: {
            animationDuration: 300
        },
        responsiveAnimationDuration: 500,
        elements: {
            line: {
                tension: 0.4
            }
        }
    };

    // Graphique de participation aux quiz avec un design plus élégant
    const quizParticipationCtx = document.getElementById('quizParticipationChart').getContext('2d');
    const quizGradient = quizParticipationCtx.createLinearGradient(0, 0, 0, 300);
    quizGradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)');
    quizGradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');

    new Chart(quizParticipationCtx, {
        type: 'line',
        data: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            datasets: [{
                label: 'Participation',
                data: [120, 190, 150, 220],
                backgroundColor: quizGradient,
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: 'white',
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'white',
                pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: '#6b7280'
                    },
                    gridLines: {
                        color: 'rgba(229, 231, 235, 0.5)',
                        zeroLineColor: 'rgba(229, 231, 235, 0.5)'
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: '#6b7280'
                    },
                    gridLines: {
                        display: false
                    }
                }]
            }
        }
    });

    // Graphique de performance par catégorie avec un design moderne
    const categoryPerformanceCtx = document.getElementById('categoryPerformanceChart').getContext('2d');
    const categoryGradient = categoryPerformanceCtx.createRadialGradient(
        categoryPerformanceCtx.canvas.width / 2, 
        categoryPerformanceCtx.canvas.height / 2, 
        0, 
        categoryPerformanceCtx.canvas.width / 2, 
        categoryPerformanceCtx.canvas.height / 2, 
        categoryPerformanceCtx.canvas.width / 2
    );
    categoryGradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    categoryGradient.addColorStop(1, 'rgba(99, 102, 241, 0.1)');

    new Chart(categoryPerformanceCtx, {
        type: 'radar',
        data: {
            labels: ['Nutrition', 'Entraînement', 'Cardio', 'Musculation', 'Flexibilité'],
            datasets: [{
                label: 'Performance Moyenne',
                data: [75, 68, 82, 65, 70],
                backgroundColor: categoryGradient,
                borderColor: 'rgba(99, 102, 241, 0.8)',
                pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                pointBorderColor: 'white',
                pointHoverRadius: 6,
                pointHoverBackgroundColor: 'white',
                pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            scale: {
                ticks: {
                    beginAtZero: true,
                    max: 100,
                    fontColor: '#6b7280',
                    backdropColor: 'transparent'
                },
                pointLabels: {
                    fontColor: '#6b7280'
                },
                gridLines: {
                    color: 'rgba(229, 231, 235, 0.5)'
                }
            }
        }
    });
}

// Initialisation des écouteurs d'événements
function initializeEventListeners() {
    // Filtres et actions
    document.getElementById('performanceFilter').addEventListener('change', handleFilterChange);
    document.getElementById('applyDateFilter').addEventListener('click', handleDateFilter);
    document.getElementById('quizParticipationTimeframe').addEventListener('change', handleTimeframeChange);

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
}

// Amélioration des interactions utilisateur
function setupInteractiveElements() {
    // Ajout d'effets de survol et d'interaction
    const interactiveElements = document.querySelectorAll('.interactive-element');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            e.target.classList.add('hover-effect');
        });
        element.addEventListener('mouseleave', (e) => {
            e.target.classList.remove('hover-effect');
        });
    });

    // Tooltips personnalisés
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
    tooltipTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = e.target.dataset.tooltip;
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.top = `${rect.bottom + 5}px`;
            tooltip.style.left = `${rect.left}px`;
            
            document.body.appendChild(tooltip);
        });

        trigger.addEventListener('mouseleave', () => {
            const tooltip = document.querySelector('.custom-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Gestionnaires d'événements
function handleFilterChange(event) {
    currentFilter = event.target.value;
    currentPage = 1;
    loadPerformanceData();
}

function handleDateFilter() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Logique de filtrage par date à implémenter
    console.log(`Filtrage de ${startDate} à ${endDate}`);
    
    // Mise à jour des graphiques et des données
    loadPerformanceData();
}

function handleTimeframeChange(event) {
    const timeframe = event.target.value;
    
    // Mise à jour dynamique du graphique de participation
    const quizParticipationChart = Chart.getChart('quizParticipationChart');
    
    const timeframeData = {
        weekly: [120, 190, 150, 220],
        monthly: [480, 620, 550, 700],
        yearly: [5800, 6200, 5900, 6500]
    };

    quizParticipationChart.data.datasets[0].data = timeframeData[timeframe];
    quizParticipationChart.update();
}

// Chargement et affichage des données
function loadPerformanceData() {
    let filteredData = mockUserPerformanceData;

    // Filtrage des données
    if (currentFilter === 'top') {
        filteredData = filteredData.filter(user => user.performanceLevel === 'top');
    } else if (currentFilter === 'bottom') {
        filteredData = filteredData.filter(user => user.performanceLevel === 'bottom');
    }

    // Pagination
    const totalPages = Math.ceil(filteredData.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = filteredData.slice(startIndex, endIndex);

    renderPerformanceTable(usersToShow);
    updatePagination(totalPages);
    updateOverviewStats(filteredData);
}

function renderPerformanceTable(users) {
    const tableBody = document.getElementById('performanceTableBody');
    tableBody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div class="user-info">
                    <div class="user-avatar" style="background-color: ${generateAvatarColor(user.username)}">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <div class="user-details">
                        <span class="user-name">${user.name}</span>
                        <span class="user-username">@${user.username}</span>
                    </div>
                </div>
            </td>
            <td>${user.quizzesTaken}</td>
            <td>${user.averageScore.toFixed(1)}%</td>
            <td>${formatRelativeDate(user.lastActivity)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" onclick="viewUserDetails(${user.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="exportUserData(${user.id})">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePagination(totalPages) {
    const paginationNumbers = document.getElementById('paginationNumbers');
    paginationNumbers.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `page-number ${i === currentPage ? 'active' : ''}`;
        button.textContent = i;
        button.onclick = () => {
            currentPage = i;
            loadPerformanceData();
        };
        paginationNumbers.appendChild(button);
    }

    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function updateOverviewStats(data) {
    document.getElementById('totalUsersCount').textContent = data.length;
    
    const totalQuizzesTaken = data.reduce((sum, user) => sum + user.quizzesTaken, 0);
    document.getElementById('completedQuizzes').textContent = totalQuizzesTaken;
    
    const averageScore = data.reduce((sum, user) => sum + user.averageScore, 0) / data.length;
    document.getElementById('averageScore').textContent = `${averageScore.toFixed(1)}%`;
    
    const activeUsers = data.filter(user => isRecentlyActive(user.lastActivity)).length;
    document.getElementById('activeUsersCount').textContent = activeUsers;
}

// Utilitaires
function generateAvatarColor(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
}

function isRecentlyActive(lastActivityDate, days = 30) {
    const date = new Date(lastActivityDate);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    return diffDays <= days;
}

function changePage(delta) {
    const newPage = currentPage + delta;
    const totalPages = Math.ceil(mockUserPerformanceData.length / usersPerPage);
    
    if (newPage > 0 && newPage <= totalPages) {
        currentPage = newPage;
        loadPerformanceData();
    }
}

// Actions utilisateur
function viewUserDetails(userId) {
    // Simulation d'ouverture des détails utilisateur
    alert(`Affichage des détails pour l'utilisateur ${userId}`);
}

function exportUserData(userId) {
    // Simulation d'exportation des données utilisateur
    alert(`Exportation des données pour l'utilisateur ${userId}`);
}
