// Données simulées pour le développement
let mockQuestions = [
    {
        id: 1,
        text: "Quelle est la meilleure façon de commencer sa journée pour maximiser sa forme physique ?",
        category: "lifestyle",
        difficulty: "easy",
        answers: [
            "Boire un café et partir au travail",
            "Faire 10 minutes d'étirements et boire de l'eau",
            "Manger un gros petit-déjeuner sucré",
            "Regarder ses emails au lit"
        ],
        correctAnswer: 1,
        explanation: "Les étirements activent le corps et l'hydratation est essentielle après le sommeil."
    },
    // Ajoutez d'autres questions simulées ici
];

// État de l'application
let currentPage = 1;
const questionsPerPage = 10;
let currentFilters = {
    category: 'all',
    difficulty: 'all',
    search: ''
};

// Fonction pour générer des données aléatoires
function generateData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
}

// Initialisation de la page
document.addEventListener('DOMContentLoaded', function() {
    initializeStats();
    initializeEventListeners();
    loadQuestions();
    initializeCharts();
    initializeScrollButtons();
    initializeCheckboxes();
});

// Initialisation des statistiques
function initializeStats() {
    document.getElementById('totalQuestionsCount').textContent = mockQuestions.length;
    document.getElementById('categoriesCount').textContent = getUniqueCategories().length;
    document.getElementById('completionsCount').textContent = '157'; // Simulé
    document.getElementById('averageAccuracy').textContent = '78%'; // Simulé
}

// Initialisation des écouteurs d'événements
function initializeEventListeners() {
    // Filtres
    document.getElementById('categoryFilter').addEventListener('change', handleFilterChange);
    document.getElementById('difficultyFilter').addEventListener('change', handleFilterChange);
    
    // Recherche
    const searchInput = document.querySelector('.header-search input');
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));

    // Modal
    document.getElementById('questionForm').addEventListener('submit', handleQuestionSubmit);
}

// Gestionnaires d'événements
function handleFilterChange(event) {
    currentFilters[event.target.id.replace('Filter', '')] = event.target.value;
    currentPage = 1;
    loadQuestions();
}

function handleSearch(event) {
    currentFilters.search = event.target.value.toLowerCase();
    currentPage = 1;
    loadQuestions();
}

function handleQuestionSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const questionData = {
        text: formData.get('questionText'),
        category: formData.get('questionCategory'),
        difficulty: formData.get('questionDifficulty'),
        answers: Array.from(document.querySelectorAll('.answer-input')).map(input => input.value),
        correctAnswer: parseInt(formData.get('correctAnswer')),
        explanation: formData.get('questionExplanation')
    };

    // Simulation d'ajout à la base de données
    mockQuestions.unshift({
        id: mockQuestions.length + 1,
        ...questionData
    });

    closeQuestionModal();
    loadQuestions();
    showNotification('Question ajoutée avec succès');
}

// Fonctions utilitaires
function getUniqueCategories() {
    return [...new Set(mockQuestions.map(q => q.category))];
}

function filterQuestions() {
    return mockQuestions.filter(question => {
        const matchesCategory = currentFilters.category === 'all' || question.category === currentFilters.category;
        const matchesDifficulty = currentFilters.difficulty === 'all' || question.difficulty === currentFilters.difficulty;
        const matchesSearch = !currentFilters.search || 
            question.text.toLowerCase().includes(currentFilters.search) ||
            question.answers.some(answer => answer.toLowerCase().includes(currentFilters.search));
        
        return matchesCategory && matchesDifficulty && matchesSearch;
    });
}

// Gestion de l'affichage
function loadQuestions() {
    const filteredQuestions = filterQuestions();
    const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const questionsToShow = filteredQuestions.slice(startIndex, endIndex);

    renderQuestions(questionsToShow);
    updatePagination(totalPages);
    updateStats();
}

function renderQuestions(questions) {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = questions.map(question => `
        <div class="question-card">
            <div class="question-header">
                <span class="question-number">#${question.id}</span>
                <div class="question-badges">
                    <span class="badge badge-${question.category}">${question.category}</span>
                    <span class="badge badge-${question.difficulty}">${question.difficulty}</span>
                </div>
            </div>
            <div class="question-content">
                <p class="question-text">${question.text}</p>
                <div class="answers-list">
                    ${question.answers.map((answer, index) => `
                        <div class="answer ${index === question.correctAnswer ? 'correct' : ''}">
                            <span class="answer-marker">${String.fromCharCode(65 + index)}</span>
                            <span class="answer-text">${answer}</span>
                        </div>
                    `).join('')}
                </div>
                ${question.explanation ? `
                    <div class="question-explanation">
                        <i class="fas fa-info-circle"></i>
                        <span>${question.explanation}</span>
                    </div>
                ` : ''}
            </div>
            <div class="question-actions">
                <button class="btn-icon" onclick="editQuestion(${question.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="deleteQuestion(${question.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
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
            loadQuestions();
        };
        paginationNumbers.appendChild(button);
    }

    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Modal
function openAddQuestionModal() {
    const modal = document.getElementById('questionModal');
    const form = document.getElementById('questionForm');
    form.reset();
    document.getElementById('modalTitle').textContent = 'Ajouter une Question';
    modal.style.display = 'flex';
}

function closeQuestionModal() {
    document.getElementById('questionModal').style.display = 'none';
}

function editQuestion(questionId) {
    const question = mockQuestions.find(q => q.id === questionId);
    if (!question) return;

    const modal = document.getElementById('questionModal');
    const form = document.getElementById('questionForm');
    
    document.getElementById('modalTitle').textContent = 'Modifier la Question';
    document.getElementById('questionText').value = question.text;
    document.getElementById('questionCategory').value = question.category;
    document.getElementById('questionDifficulty').value = question.difficulty;
    document.getElementById('questionExplanation').value = question.explanation || '';

    const answerInputs = document.querySelectorAll('.answer-input');
    const radioInputs = document.querySelectorAll('input[name="correctAnswer"]');
    
    question.answers.forEach((answer, index) => {
        answerInputs[index].value = answer;
        radioInputs[index].checked = index === question.correctAnswer;
    });

    modal.style.display = 'flex';
}

function deleteQuestion(questionId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
        mockQuestions = mockQuestions.filter(q => q.id !== questionId);
        loadQuestions();
        showNotification('Question supprimée avec succès');
    }
}

// Utilitaires
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

function showNotification(message) {
    // Implémentation de notification à ajouter
    console.log(message);
}

function changePage(delta) {
    const newPage = currentPage + delta;
    const totalPages = Math.ceil(filterQuestions().length / questionsPerPage);
    
    if (newPage > 0 && newPage <= totalPages) {
        currentPage = newPage;
        loadQuestions();
    }
}

function updateStats() {
    const filteredQuestions = filterQuestions();
    document.getElementById('totalQuestionsCount').textContent = filteredQuestions.length;
}

// Données pour les graphiques
const quizData = {
    series: [{
        name: 'Quiz actifs',
        data: [10, 8, 12, 14, 9, 12]
    }, {
        name: 'Nouveaux quiz',
        data: [5, 3, 4, 6, 3, 5]
    }],
    categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
};

const completionData = {
    series: [{
        name: 'Taux de complétion',
        data: [75, 78, 82, 80, 85, 87]
    }],
    categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
};

const scoreData = {
    series: [{
        name: 'Score moyen',
        data: [70, 72, 74, 73, 75, 76]
    }],
    categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
};

const timeData = {
    series: [{
        name: 'Temps moyen',
        data: [12, 11, 10, 9.5, 9, 8.5]
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
    // Quiz Chart
    new ApexCharts(document.querySelector("#quizChart"), {
        ...commonOptions,
        series: quizData.series,
        colors: ['#007AFF', '#5856D6']
    }).render();

    // Completion Chart
    new ApexCharts(document.querySelector("#completionChart"), {
        ...commonOptions,
        series: [completionData.series[0]],
        colors: ['#34C759']
    }).render();

    // Score Chart
    new ApexCharts(document.querySelector("#scoreChart"), {
        ...commonOptions,
        series: [scoreData.series[0]],
        colors: ['#FF9500']
    }).render();

    // Time Chart
    new ApexCharts(document.querySelector("#timeChart"), {
        ...commonOptions,
        series: [timeData.series[0]],
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

    headerCheckbox.addEventListener('change', (e) => {
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });

    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const allChecked = Array.from(rowCheckboxes).every(cb => cb.checked);
            const someChecked = Array.from(rowCheckboxes).some(cb => cb.checked);
            headerCheckbox.checked = allChecked;
            headerCheckbox.indeterminate = someChecked && !allChecked;
        });
    });
}
