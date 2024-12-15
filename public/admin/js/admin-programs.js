// Configuration
const CONFIG = {
    itemsPerPage: 8,
    currentPage: 1,
    totalItems: 0,
    programs: []
};

// DOM Elements
const elements = {
    programModal: document.getElementById('programModal'),
    programForm: document.getElementById('programForm'),
    programSearch: document.querySelector('.header-search input'),
    categoryFilter: document.getElementById('categoryFilter'),
    difficultyFilter: document.getElementById('difficultyFilter'),
    programsGrid: document.getElementById('programsGrid'),
    paginationNumbers: document.getElementById('paginationNumbers'),
    prevPage: document.getElementById('prevPage'),
    nextPage: document.getElementById('nextPage'),
    totalProgramsCount: document.getElementById('totalProgramsCount'),
    activeUsersCount: document.getElementById('activeUsersCount'),
    averageRating: document.getElementById('averageRating'),
    completionRate: document.getElementById('completionRate')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadPrograms();
    updateStatistics();
});

// Event Listeners
function initializeEventListeners() {
    elements.programSearch.addEventListener('input', debounce(handleSearch, 300));
    elements.categoryFilter.addEventListener('change', handleFilters);
    elements.difficultyFilter.addEventListener('change', handleFilters);
    elements.programForm.addEventListener('submit', handleProgramSubmit);
    elements.prevPage.addEventListener('click', () => changePage(CONFIG.currentPage - 1));
    elements.nextPage.addEventListener('click', () => changePage(CONFIG.currentPage + 1));
}

// API Calls
async function loadPrograms() {
    try {
        // Simuler un appel API
        const response = await fetch('/api/programs');
        const data = await response.json();
        CONFIG.programs = data;
        CONFIG.totalItems = data.length;
        updateGrid();
        updatePagination();
    } catch (error) {
        console.error('Error loading programs:', error);
        showNotification('Erreur lors du chargement des programmes', 'error');
    }
}

async function updateStatistics() {
    try {
        // Simuler un appel API pour les statistiques
        const stats = {
            total: 156,
            activeUsers: 2845,
            averageRating: 4.5,
            completionRate: 78
        };
        
        elements.totalProgramsCount.textContent = stats.total;
        elements.activeUsersCount.textContent = stats.activeUsers;
        elements.averageRating.textContent = stats.averageRating.toFixed(1);
        elements.completionRate.textContent = `${stats.completionRate}%`;
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

// Grid Management
function updateGrid() {
    const startIndex = (CONFIG.currentPage - 1) * CONFIG.itemsPerPage;
    const endIndex = startIndex + CONFIG.itemsPerPage;
    const filteredPrograms = getFilteredPrograms();
    
    elements.programsGrid.innerHTML = '';
    
    filteredPrograms.slice(startIndex, endIndex).forEach(program => {
        const card = createProgramCard(program);
        elements.programsGrid.appendChild(card);
    });
}

function createProgramCard(program) {
    const card = document.createElement('div');
    card.className = 'program-card';
    card.innerHTML = `
        <div class="program-image">
            <img src="${program.image || '/images/default-program.jpg'}" alt="${program.name}">
            <div class="program-badges">
                <span class="badge badge-${getDifficultyBadgeClass(program.difficulty)}">${program.difficulty}</span>
                <span class="badge badge-${getCategoryBadgeClass(program.category)}">${program.category}</span>
            </div>
        </div>
        <div class="program-content">
            <h3>${program.name}</h3>
            <p>${program.description}</p>
            <div class="program-meta">
                <span><i class="fas fa-clock"></i> ${program.duration} semaines</span>
                <span><i class="fas fa-users"></i> ${program.enrollments} inscrits</span>
                <span><i class="fas fa-star"></i> ${program.rating.toFixed(1)}</span>
            </div>
            <div class="program-price">
                ${program.price > 0 ? `${program.price}€` : 'Gratuit'}
            </div>
        </div>
        <div class="program-actions">
            <button class="btn-icon" onclick="editProgram(${program.id})" title="Éditer">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" onclick="duplicateProgram(${program.id})" title="Dupliquer">
                <i class="fas fa-copy"></i>
            </button>
            <button class="btn-icon" onclick="deleteProgram(${program.id})" title="Supprimer">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return card;
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
        updateGrid();
        updatePagination();
    }
}

// Filters and Search
function handleSearch(event) {
    CONFIG.currentPage = 1;
    updateGrid();
    updatePagination();
}

function handleFilters() {
    CONFIG.currentPage = 1;
    updateGrid();
    updatePagination();
}

function getFilteredPrograms() {
    let filtered = [...CONFIG.programs];
    
    const searchTerm = elements.programSearch.value.toLowerCase();
    const categoryFilter = elements.categoryFilter.value;
    const difficultyFilter = elements.difficultyFilter.value;
    
    if (searchTerm) {
        filtered = filtered.filter(program => 
            program.name.toLowerCase().includes(searchTerm) ||
            program.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(program => program.category === categoryFilter);
    }
    
    if (difficultyFilter !== 'all') {
        filtered = filtered.filter(program => program.difficulty === difficultyFilter);
    }
    
    return filtered;
}

// Modal Management
function openAddProgramModal() {
    elements.programModal.classList.add('show');
    elements.programForm.reset();
    document.getElementById('modalTitle').textContent = 'Ajouter un Programme';
}

function closeProgramModal() {
    elements.programModal.classList.remove('show');
}

async function handleProgramSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const programData = {
        name: formData.get('programName'),
        description: formData.get('programDescription'),
        category: formData.get('programCategory'),
        difficulty: formData.get('programDifficulty'),
        duration: parseInt(formData.get('programDuration')),
        price: parseFloat(formData.get('programPrice'))
    };
    
    try {
        // Simuler un appel API
        await saveProgram(programData);
        closeProgramModal();
        loadPrograms();
        showNotification('Programme sauvegardé avec succès', 'success');
    } catch (error) {
        console.error('Error saving program:', error);
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

function getDifficultyBadgeClass(difficulty) {
    const classes = {
        beginner: 'success',
        intermediate: 'warning',
        advanced: 'danger'
    };
    return classes[difficulty] || 'secondary';
}

function getCategoryBadgeClass(category) {
    const classes = {
        strength: 'primary',
        cardio: 'success',
        flexibility: 'info',
        hiit: 'warning'
    };
    return classes[category] || 'secondary';
}

function showNotification(message, type) {
    // Implement notification system
    console.log(`${type}: ${message}`);
}

// Program Actions
async function editProgram(programId) {
    try {
        const program = CONFIG.programs.find(p => p.id === programId);
        if (program) {
            document.getElementById('modalTitle').textContent = 'Modifier le Programme';
            document.getElementById('programName').value = program.name;
            document.getElementById('programDescription').value = program.description;
            document.getElementById('programCategory').value = program.category;
            document.getElementById('programDifficulty').value = program.difficulty;
            document.getElementById('programDuration').value = program.duration;
            document.getElementById('programPrice').value = program.price;
            elements.programModal.classList.add('show');
        }
    } catch (error) {
        console.error('Error loading program details:', error);
        showNotification('Erreur lors du chargement des détails', 'error');
    }
}

async function duplicateProgram(programId) {
    try {
        // Simuler un appel API
        await fetch(`/api/programs/${programId}/duplicate`, { method: 'POST' });
        loadPrograms();
        showNotification('Programme dupliqué avec succès', 'success');
    } catch (error) {
        console.error('Error duplicating program:', error);
        showNotification('Erreur lors de la duplication', 'error');
    }
}

async function deleteProgram(programId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) {
        try {
            // Simuler un appel API
            await fetch(`/api/programs/${programId}`, { method: 'DELETE' });
            loadPrograms();
            showNotification('Programme supprimé avec succès', 'success');
        } catch (error) {
            console.error('Error deleting program:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

// Mock API Functions (à remplacer par de vrais appels API)
async function saveProgram(programData) {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('Program saved:', programData);
            resolve({ success: true });
        }, 500);
    });
}

// Données pour les graphiques
const programsData = {
    series: [{
        name: 'Programmes actifs',
        data: [18, 20, 22, 21, 24, 24]
    }, {
        name: 'Nouveaux programmes',
        data: [3, 4, 5, 3, 4, 3]
    }],
    categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
};

const usersData = {
    series: [{
        name: 'Utilisateurs actifs',
        data: [800, 950, 1100, 1050, 1200, 1234]
    }],
    categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
};

const ratingData = {
    series: [{
        name: 'Note moyenne',
        data: [4.5, 4.6, 4.5, 4.7, 4.6, 4.8]
    }],
    categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
};

const completionData = {
    series: [{
        name: 'Taux de complétion',
        data: [75, 78, 80, 82, 85, 87]
    }],
    categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
};

// Configuration commune pour les graphiques
const commonOptions = {
    chart: {
        height: 150,
        type: 'area',
        toolbar: {
            show: false
        },
        sparkline: {
            enabled: true
        }
    },
    stroke: {
        curve: 'smooth',
        width: 2
    },
    fill: {
        type: 'gradient',
        gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [50, 100]
        }
    },
    xaxis: {
        labels: {
            show: false
        },
        axisBorder: {
            show: false
        }
    },
    yaxis: {
        show: false
    },
    grid: {
        show: false
    },
    tooltip: {
        theme: 'light',
        x: {
            show: false
        }
    }
};

// Initialisation des graphiques
document.addEventListener('DOMContentLoaded', function() {
    // Programs Chart
    new ApexCharts(document.querySelector("#programsChart"), {
        ...commonOptions,
        series: programsData.series,
        colors: ['#007AFF', '#5856D6']
    }).render();

    // Users Chart
    new ApexCharts(document.querySelector("#usersChart"), {
        ...commonOptions,
        series: [usersData.series[0]],
        colors: ['#34C759']
    }).render();

    // Rating Chart
    new ApexCharts(document.querySelector("#ratingChart"), {
        ...commonOptions,
        series: [ratingData.series[0]],
        colors: ['#FF9500']
    }).render();

    // Completion Chart
    new ApexCharts(document.querySelector("#completionChart"), {
        ...commonOptions,
        series: [completionData.series[0]],
        colors: ['#AF52DE']
    }).render();
});

// Gestion du défilement horizontal
document.addEventListener('DOMContentLoaded', function() {
    const statsGrid = document.querySelector('.stats-grid');
    const scrollLeftBtn = document.querySelector('.scroll-left');
    const scrollRightBtn = document.querySelector('.scroll-right');
    const scrollAmount = 300;

    if (scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.addEventListener('click', () => {
            statsGrid.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        scrollRightBtn.addEventListener('click', () => {
            statsGrid.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        // Mise à jour de la visibilité des boutons
        function updateScrollButtons() {
            const isAtStart = statsGrid.scrollLeft === 0;
            const isAtEnd = statsGrid.scrollLeft + statsGrid.clientWidth >= statsGrid.scrollWidth;

            scrollLeftBtn.style.display = isAtStart ? 'none' : 'flex';
            scrollRightBtn.style.display = isAtEnd ? 'none' : 'flex';
        }

        statsGrid.addEventListener('scroll', updateScrollButtons);
        window.addEventListener('resize', updateScrollButtons);
        updateScrollButtons();
    }
});

// Gestion des cases à cocher
function initializeCheckboxes() {
    const headerCheckbox = document.querySelector('.header-checkbox');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');

    if (headerCheckbox) {
        headerCheckbox.addEventListener('change', function() {
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
}

// Gestion du modal
function openAddProgramModal() {
    document.getElementById('programModal').style.display = 'flex';
}

function closeProgramModal() {
    document.getElementById('programModal').style.display = 'none';
}

// Données de démonstration pour le tableau
const demoPrograms = [
    {
        name: "Programme Full Body",
        description: "Programme complet de musculation pour tout le corps",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80",
        category: "Force",
        difficulty: "Intermédiaire",
        duration: "12 semaines",
        price: "49.99 €",
        rating: "4.8",
        status: "active"
    },
    {
        name: "Cardio Intensif",
        description: "Programme HIIT pour améliorer votre endurance",
        image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=300&q=80",
        category: "Cardio",
        difficulty: "Avancé",
        duration: "8 semaines",
        price: "39.99 €",
        rating: "4.6",
        status: "active"
    },
    {
        name: "Yoga Flow",
        description: "Séances de yoga pour la flexibilité et le bien-être",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=80",
        category: "Flexibilité",
        difficulty: "Débutant",
        duration: "6 semaines",
        price: "29.99 €",
        rating: "4.9",
        status: "active"
    }
];

// Remplissage du tableau avec les données de démonstration
function populateTable() {
    const tbody = document.getElementById('programsTableBody');
    tbody.innerHTML = demoPrograms.map(program => `
        <tr>
            <td>
                <div class="checkbox-wrapper">
                    <input type="checkbox" class="row-checkbox">
                </div>
            </td>
            <td>
                <div class="table-item-info">
                    <img src="${program.image}" alt="${program.name}" class="item-image">
                    <div class="item-details">
                        <h4>${program.name}</h4>
                        <p>${program.description}</p>
                    </div>
                </div>
            </td>
            <td>
                <span class="category-badge ${program.category.toLowerCase()}">${program.category}</span>
            </td>
            <td>
                <span class="difficulty-badge ${program.difficulty.toLowerCase()}">${program.difficulty}</span>
            </td>
            <td>${program.duration}</td>
            <td>
                <span class="price-value">${program.price}</span>
            </td>
            <td>
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <span>${program.rating}</span>
                </div>
            </td>
            <td>
                <div class="table-actions">
                    <button class="action-btn" title="Éditer">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="action-btn" title="Plus d'options">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    populateTable();
    initializeCheckboxes();
});

// Gestion du formulaire
document.getElementById('programForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    // Ici, ajoutez la logique pour sauvegarder le programme
    closeProgramModal();
});
