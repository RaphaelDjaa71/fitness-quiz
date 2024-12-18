// Initialisation des graphiques et composants
document.addEventListener('DOMContentLoaded', function() {
    initializeMacrosChart();
    initializeCaloriesGaugeChart();
    initializeHydrationChart();
    initializeFoodJournalChart();
    initializeShoppingChart();
    initializeWeeklyCalendar();
    loadShoppingList();
    loadFoodJournal();
    updateAnalysis('week');
    initializeFullCalendar();
});

// Graphique des macronutriments
function initializeMacrosChart() {
    const options = {
        series: [30, 50, 20],
        labels: ['Protéines', 'Glucides', 'Lipides'],
        chart: {
            type: 'donut',
            height: '100%',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        colors: ['#3b82f6', '#10b981', '#f59e0b'],
        legend: {
            show: false
        },
        dataLabels: {
            enabled: false
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    background: 'transparent',
                    labels: {
                        show: false
                    }
                }
            }
        },
        stroke: {
            show: false
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: function(value) {
                    return value + '%';
                }
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    height: '100%'
                }
            }
        }]
    };

    const chart = new ApexCharts(document.querySelector("#macrosChart"), options);
    chart.render();

    // Update progress bars
    updateProgressBars();
}

function updateProgressBars() {
    const progressBars = {
        protein: 83,
        carbs: 88,
        fats: 87
    };

    Object.entries(progressBars).forEach(([macro, percentage]) => {
        const progressBar = document.querySelector(`.legend-item.${macro} .progress`);
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    });
}

// Graphique des calories
function initializeCaloriesGaugeChart() {
    const options = {
        series: [88],
        chart: {
            height: 150,
            type: 'radialBar',
            sparkline: {
                enabled: true
            }
        },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                track: {
                    background: "#e7e7e7",
                    strokeWidth: '97%',
                    margin: 5,
                    dropShadow: {
                        enabled: true,
                        top: 2,
                        left: 0,
                        blur: 4,
                        opacity: 0.15
                    }
                },
                dataLabels: {
                    name: {
                        show: false
                    },
                    value: {
                        offsetY: -2,
                        fontSize: '22px',
                        fontWeight: 600,
                        formatter: function(val) {
                            return val + '%';
                        }
                    }
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                colorStops: [
                    {
                        offset: 0,
                        color: "#10b981",
                        opacity: 1
                    },
                    {
                        offset: 100,
                        color: "#3b82f6",
                        opacity: 1
                    }
                ]
            }
        },
        stroke: {
            dashArray: 0
        }
    };

    const chart = new ApexCharts(document.querySelector("#caloriesGaugeChart"), options);
    chart.render();
}

// Graphique d'hydratation
function initializeHydrationChart() {
    const options = {
        series: [{
            name: 'Hydratation',
            data: [
                { x: '8h', y: 300 },
                { x: '10h', y: 500 },
                { x: '12h', y: 800 },
                { x: '14h', y: 1200 },
                { x: '16h', y: 1500 },
                { x: '18h', y: 1800 }
            ]
        }],
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
        colors: ['#3b82f6'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.3,
                stops: [0, 100]
            }
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        yaxis: {
            min: 0,
            max: 2500,
            labels: {
                formatter: function(val) {
                    return (val / 1000).toFixed(1) + 'L';
                }
            }
        },
        tooltip: {
            y: {
                formatter: function(value) {
                    return (value / 1000).toFixed(1) + 'L';
                }
            }
        }
    };

    const chart = new ApexCharts(document.querySelector("#hydrationChart"), options);
    chart.render();
}

// Graphique du journal alimentaire
function initializeFoodJournalChart() {
    const options = {
        series: [{
            name: 'Calories',
            data: [
                { x: 'Petit-déjeuner', y: 450 },
                { x: 'Collation', y: 150 },
                { x: 'Déjeuner', y: 530 },
                { x: 'Goûter', y: 200 },
                { x: 'Dîner', y: 520 }
            ]
        }],
        chart: {
            type: 'bar',
            height: 200,
            toolbar: {
                show: false
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 8,
                columnWidth: '60%',
                distributed: true,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'],
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return val + ' kcal';
            },
            offsetY: -20,
            style: {
                fontSize: '12px',
                colors: ["#304758"]
            }
        },
        xaxis: {
            categories: ['Petit-déjeuner', 'Collation', 'Déjeuner', 'Goûter', 'Dîner'],
            position: 'bottom',
            labels: {
                style: {
                    fontSize: '12px'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                formatter: function(val) {
                    return val + ' kcal';
                },
                style: {
                    fontSize: '12px'
                }
            }
        },
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: false
                }
            }
        }
    };

    const chart = new ApexCharts(document.querySelector("#foodJournalChart"), options);
    chart.render();
}

// Graphique de la liste de courses (treemap avec légende)
function initializeShoppingChart() {
    const shoppingOptions = {
        series: [
            {
                data: [
                    { x: 'Fruits & Légumes', y: 25 },
                    { x: 'Protéines', y: 30 },
                    { x: 'Féculents', y: 20 },
                    { x: 'Produits Laitiers', y: 15 },
                    { x: 'Autres', y: 10 }
                ]
            }
        ],
        legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            fontFamily: 'inherit',
            markers: {
                width: 12,
                height: 12,
                radius: 3
            },
            itemMargin: {
                horizontal: 15,
                vertical: 5
            }
        },
        chart: {
            height: 350,
            type: 'treemap',
            toolbar: { show: false }
        },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
        plotOptions: {
            treemap: {
                distributed: true,
                enableShades: false,
                dataLabels: {
                    format: 'value%'
                }
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '14px',
                fontWeight: 600,
                colors: ['#ffffff']
            },
            formatter: function(text, op) {
                return [text, op.value + '%'];
            }
        }
    };

    const shoppingChart = new ApexCharts(document.querySelector("#shoppingChart"), shoppingOptions);
    shoppingChart.render();
}

// Calendrier hebdomadaire
function initializeWeeklyCalendar() {
    const calendarEl = document.querySelector('#weeklyCalendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: false,
        allDaySlot: false,
        slotMinTime: '06:00:00',
        slotMaxTime: '22:00:00',
        height: 'auto',
        events: [
            {
                title: 'Petit-déjeuner',
                start: '2024-12-16T07:00:00',
                end: '2024-12-16T07:30:00',
                backgroundColor: '#3b82f6'
            },
            {
                title: 'Déjeuner',
                start: '2024-12-16T12:30:00',
                end: '2024-12-16T13:30:00',
                backgroundColor: '#10b981'
            },
            {
                title: 'Dîner',
                start: '2024-12-16T19:00:00',
                end: '2024-12-16T20:00:00',
                backgroundColor: '#f59e0b'
            }
        ]
    });
    calendar.render();
}

// Gestion de la liste de courses
function loadShoppingList() {
    const shoppingList = document.querySelector('#shoppingList');
    const categories = [
        {
            name: 'Fruits et Légumes',
            items: [
                { name: 'Bananes', quantity: '6 pièces' },
                { name: 'Épinards', quantity: '200g' },
                { name: 'Avocats', quantity: '3 pièces' }
            ]
        },
        {
            name: 'Protéines',
            items: [
                { name: 'Poulet', quantity: '1kg' },
                { name: 'Œufs', quantity: '12 pièces' },
                { name: 'Saumon', quantity: '400g' }
            ]
        }
    ];

    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'shopping-category';
        categoryElement.innerHTML = `
            <h3>${category.name}</h3>
            <ul class="shopping-items">
                ${category.items.map(item => `
                    <li>
                        <span>${item.name}</span>
                        <span>${item.quantity}</span>
                    </li>
                `).join('')}
            </ul>
        `;
        shoppingList.appendChild(categoryElement);
    });
}

// Gestion du journal alimentaire
function loadFoodJournal() {
    const foodJournal = document.querySelector('#foodJournal');
    const meals = [
        {
            time: '07:30',
            name: 'Petit-déjeuner',
            items: [
                { name: 'Porridge aux fruits', calories: 350, protein: 15, carbs: 45, fats: 12 }
            ]
        },
        {
            time: '12:30',
            name: 'Déjeuner',
            items: [
                { name: 'Salade de quinoa au poulet', calories: 450, protein: 35, carbs: 40, fats: 15 }
            ]
        }
    ];

    meals.forEach(meal => {
        const mealElement = document.createElement('div');
        mealElement.className = 'meal-entry';
        mealElement.innerHTML = `
            <div class="meal-header">
                <h3>${meal.time} - ${meal.name}</h3>
                <button class="btn btn-outline btn-small" onclick="editMeal('${meal.name}')">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <div class="meal-items">
                ${meal.items.map(item => `
                    <div class="food-item">
                        <span>${item.name}</span>
                        <div class="macros">
                            <span>${item.calories} kcal</span>
                            <span>${item.protein}g P</span>
                            <span>${item.carbs}g C</span>
                            <span>${item.fats}g L</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        foodJournal.appendChild(mealElement);
    });
}

// Fonctions d'action
function modifyObjectives() {
    // Redirection vers le quiz
    window.location.href = '/quiz.html';
}

function downloadPlan() {
    // Logique pour générer et télécharger le PDF
    alert('Téléchargement du plan en cours...');
}

function previousWeek() {
    const calendar = document.querySelector('#weeklyCalendar').getApi();
    calendar.prev();
    updateCurrentWeek();
}

function nextWeek() {
    const calendar = document.querySelector('#weeklyCalendar').getApi();
    calendar.next();
    updateCurrentWeek();
}

function updateCurrentWeek() {
    const calendar = document.querySelector('#weeklyCalendar').getApi();
    const start = calendar.view.currentStart;
    const end = calendar.view.currentEnd;
    const weekDisplay = `Semaine du ${start.toLocaleDateString()} au ${end.toLocaleDateString()}`;
    document.querySelector('.current-week').textContent = weekDisplay;
}

function generateList() {
    // Régénérer la liste de courses
    loadShoppingList();
}

function addFoodEntry() {
    // Ouvrir le modal d'ajout de repas
    alert('Fonctionnalité en cours de développement');
}

function editMeal(mealName) {
    // Ouvrir le modal d'édition de repas
    alert(`Modification du repas : ${mealName}`);
}

// Fonctions d'action pour l'hydratation
function addWater(amount) {
    // Mettre à jour la valeur d'hydratation
    const currentHydration = 1800; // en ml
    const newHydration = currentHydration + amount;
    const maxHydration = 2500; // en ml

    // Calculer le nouveau pourcentage
    const percentage = Math.min((newHydration / maxHydration) * 100, 100);

    // Mettre à jour l'affichage
    document.querySelector('.kpi-value').textContent = 
        (newHydration / 1000).toFixed(1) + 'L / ' + (maxHydration / 1000).toFixed(1) + 'L';
    document.querySelector('.kpi-trend').textContent = 
        Math.round(percentage) + '% de l\'objectif';

    // Mettre à jour le graphique
    updateHydrationChart(newHydration);

    // Mettre à jour l'heure du dernier verre d'eau
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');
    document.querySelector('.hydration-stat:last-child span').textContent = 'Dernier: ' + timeString;
}

// Fonctions pour le journal alimentaire
function toggleFavorites() {
    // Implémenter la logique pour afficher/masquer les repas favoris
}

function quickAddMeal(type) {
    switch(type) {
        case 'favorite':
            // Afficher la modal des repas favoris
            showQuickAddModal('Repas Favoris', getFavoriteMeals());
            break;
        case 'recent':
            // Afficher la modal des repas récents
            showQuickAddModal('Repas Récents', getRecentMeals());
            break;
        case 'template':
            // Afficher la modal des modèles de repas
            showQuickAddModal('Modèles de Repas', getMealTemplates());
            break;
    }
}

function showQuickAddModal(title, meals) {
    // Créer la modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${meals.map(meal => `
                    <div class="meal-option" onclick="selectMeal('${meal.id}')">
                        <div class="meal-info">
                            <h4>${meal.name}</h4>
                            <span class="meal-calories">${meal.calories} kcal</span>
                        </div>
                        <div class="meal-macros">
                            <span class="macro">
                                <i class="fas fa-drumstick-bite"></i> ${meal.protein}g
                            </span>
                            <span class="macro">
                                <i class="fas fa-bread-slice"></i> ${meal.carbs}g
                            </span>
                            <span class="macro">
                                <i class="fas fa-cheese"></i> ${meal.fats}g
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Ajouter la modal au document
    document.body.appendChild(modal);
}

function closeModal(button) {
    button.closest('.modal').remove();
}

function selectMeal(mealId) {
    // Implémenter la logique pour ajouter le repas sélectionné au journal
    closeModal(document.querySelector('.modal'));
    updateJournalEntries();
}

// Données mockées pour les repas
function getFavoriteMeals() {
    return [
        {
            id: 'fav1',
            name: 'Petit-déjeuner protéiné',
            calories: 450,
            protein: 25,
            carbs: 65,
            fats: 12
        },
        {
            id: 'fav2',
            name: 'Salade composée',
            calories: 380,
            protein: 22,
            carbs: 45,
            fats: 15
        }
    ];
}

function getRecentMeals() {
    return [
        {
            id: 'rec1',
            name: 'Poulet grillé & légumes',
            calories: 520,
            protein: 35,
            carbs: 45,
            fats: 18
        },
        {
            id: 'rec2',
            name: 'Bowl de quinoa au saumon',
            calories: 480,
            protein: 30,
            carbs: 55,
            fats: 16
        }
    ];
}

function getMealTemplates() {
    return [
        {
            id: 'tmp1',
            name: 'Petit-déjeuner équilibré',
            calories: 400,
            protein: 20,
            carbs: 50,
            fats: 15
        },
        {
            id: 'tmp2',
            name: 'Déjeuner léger',
            calories: 350,
            protein: 25,
            carbs: 40,
            fats: 12
        }
    ];
}

function updateJournalEntries() {
    // Mettre à jour l'affichage du journal alimentaire
    initializeFoodJournalChart();
}

// Fonctions pour l'analyse nutritionnelle
function toggleAnalysisView() {
    // Implémenter la logique pour basculer entre différentes vues d'analyse
}

function updateAnalysis(period) {
    // Mettre à jour les données d'analyse en fonction de la période sélectionnée
    const trends = {
        week: {
            calories: [1800, 2100, 1950, 2000, 1850, 1900, 2050],
            protein: [80, 85, 90, 88, 82, 87, 89],
            carbs: [220, 240, 230, 235, 225, 228, 232],
            fats: [65, 70, 68, 72, 67, 69, 71]
        },
        month: {
            // ... données mensuelles
        },
        year: {
            // ... données annuelles
        }
    };

    // Mettre à jour le graphique des tendances
    updateNutritionTrendsChart(trends[period]);
}

function updateNutritionTrendsChart(data) {
    const options = {
        series: [{
            name: 'Calories',
            data: data.calories
        }],
        chart: {
            height: 250,
            type: 'line',
            toolbar: {
                show: false
            }
        },
        colors: ['#3b82f6'],
        stroke: {
            curve: 'smooth',
            width: 2
        },
        xaxis: {
            categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
        },
        yaxis: {
            title: {
                text: 'Calories'
            }
        },
        tooltip: {
            y: {
                formatter: function(value) {
                    return value + ' kcal';
                }
            }
        }
    };

    const chart = new ApexCharts(document.querySelector("#nutritionTrendsChart"), options);
    chart.render();
}

// Fonctions pour le planning des repas
function toggleMealPlanner() {
    // Implémenter la logique pour basculer l'affichage du planificateur
}

function createMealPlan() {
    // Ouvrir le modal de création de plan
    showMealPlanModal();
}

function showMealPlanModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Créer un Nouveau Plan</h3>
                <button class="close-btn" onclick="closeModal(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="plan-options">
                    <button class="plan-option" onclick="selectPlanType('custom')">
                        <i class="fas fa-pencil-alt"></i>
                        <span>Plan Personnalisé</span>
                    </button>
                    <button class="plan-option" onclick="selectPlanType('template')">
                        <i class="fas fa-clone"></i>
                        <span>Utiliser un Modèle</span>
                    </button>
                    <button class="plan-option" onclick="selectPlanType('ai')">
                        <i class="fas fa-magic"></i>
                        <span>Suggestion IA</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function selectPlanType(type) {
    // Implémenter la logique de sélection du type de plan
    closeModal(document.querySelector('.modal'));
}

// Fonctions pour la liste de courses
function shareList() {
    // Implémenter la logique de partage de la liste
    const shareOptions = {
        title: 'Liste de Courses FitnessWithRaph',
        text: 'Voici ma liste de courses pour la semaine',
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareOptions)
            .then(() => console.log('Liste partagée avec succès'))
            .catch((error) => console.log('Erreur lors du partage:', error));
    } else {
        // Fallback pour les navigateurs qui ne supportent pas l'API de partage
        alert('Le partage n\'est pas disponible sur votre navigateur');
    }
}

function generateList() {
    // Générer la liste de courses basée sur le plan de repas
    updateShoppingList();
}

function updateShoppingList() {
    // Mettre à jour l'affichage de la liste de courses
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        const items = category.querySelectorAll('.checkbox-container input');
        const total = items.length;
        const checked = Array.from(items).filter(item => item.checked).length;
        
        // Mettre à jour le compteur d'articles
        document.querySelector('.summary-stat:first-child .stat-value').textContent = 
            (total - checked) + ' restants';
    });
}

// Initialisation des composants
function initializeFullCalendar() {
    const calendarEl = document.getElementById('mealPlanCalendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
        },
        height: 'auto',
        events: [
            {
                title: 'Petit-déjeuner',
                start: '2024-12-17T08:00:00',
                end: '2024-12-17T08:30:00',
                color: '#3b82f6'
            },
            {
                title: 'Déjeuner',
                start: '2024-12-17T12:30:00',
                end: '2024-12-17T13:30:00',
                color: '#10b981'
            },
            {
                title: 'Collation',
                start: '2024-12-17T16:00:00',
                end: '2024-12-17T16:15:00',
                color: '#f59e0b'
            },
            {
                title: 'Dîner',
                start: '2024-12-17T19:30:00',
                end: '2024-12-17T20:30:00',
                color: '#6366f1'
            }
        ]
    });
    calendar.render();
}
