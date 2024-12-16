document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les mini-graphiques des KPI
    initCaloriesChart();
    initSessionsChart();
    initWeightMiniChart();
    initGoalsMiniChart();
    
    // Initialiser les graphiques
    initWeightChart();
    initExerciseDistributionChart();
    initGoalsChart();
    
    // Gestionnaire d'événements pour les boutons de période
    const periodButtons = document.querySelectorAll('.chart-period');
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Retirer la classe active de tous les boutons
            periodButtons.forEach(btn => btn.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            // Mettre à jour le graphique avec la nouvelle période
            updateWeightChart(this.textContent.toLowerCase());
        });
    });
});

// Mini-graphique des calories
function initCaloriesChart() {
    const options = {
        series: [{
            name: 'Calories',
            data: [1800, 2100, 1950, 2300, 2150, 2450, 2300]
        }],
        chart: {
            type: 'area',
            height: 80,
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
                opacityFrom: 0.7,
                opacityTo: 0.3
            }
        },
        colors: ['#28a745']
    };

    new ApexCharts(document.querySelector("#calories-chart"), options).render();
}

// Mini-graphique des séances
function initSessionsChart() {
    const options = {
        series: [{
            name: 'Séances',
            data: [3, 4, 2, 4, 3, 5, 4]
        }],
        chart: {
            type: 'bar',
            height: 80,
            sparkline: {
                enabled: true
            }
        },
        plotOptions: {
            bar: {
                columnWidth: '60%',
                borderRadius: 3
            }
        },
        colors: ['#007bff']
    };

    new ApexCharts(document.querySelector("#sessions-chart"), options).render();
}

// Mini-graphique du poids
function initWeightMiniChart() {
    const options = {
        series: [{
            name: 'Poids',
            data: [77.8, 77.2, 76.5, 76.1, 75.8, 75.5, 75.5]
        }],
        chart: {
            type: 'line',
            height: 80,
            sparkline: {
                enabled: true
            }
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        colors: ['#dc3545']
    };

    new ApexCharts(document.querySelector("#weight-mini-chart"), options).render();
}

// Mini-graphique des objectifs
function initGoalsMiniChart() {
    const options = {
        series: [66.67], // 4/6 * 100
        chart: {
            type: 'radialBar',
            height: 80,
            sparkline: {
                enabled: true
            }
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '60%'
                },
                track: {
                    background: '#e7e7e7'
                },
                dataLabels: {
                    show: false
                }
            }
        },
        colors: ['#ffc107']
    };

    new ApexCharts(document.querySelector("#goals-mini-chart"), options).render();
}

// Graphique de progression du poids
function initWeightChart() {
    const weightData = {
        semaine: {
            dates: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            values: [76.2, 76.0, 75.8, 75.7, 75.5, 75.5, 75.5]
        },
        mois: {
            dates: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            values: [77.0, 76.5, 76.0, 75.5]
        },
        année: {
            dates: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
            values: [80, 79, 78.5, 78, 77.5, 77, 76.5, 76, 75.8, 75.5, null, null]
        }
    };

    const options = {
        series: [{
            name: 'Poids (kg)',
            data: weightData.semaine.values
        }],
        chart: {
            type: 'line',
            height: 350,
            toolbar: {
                show: false
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        colors: ['#007bff'],
        xaxis: {
            categories: weightData.semaine.dates
        },
        yaxis: {
            title: {
                text: 'Poids (kg)'
            },
            min: function(min) { return min - 1; },
            max: function(max) { return max + 1; }
        },
        markers: {
            size: 5
        },
        tooltip: {
            y: {
                formatter: function(value) {
                    return value + ' kg';
                }
            }
        }
    };

    const weightChart = new ApexCharts(document.querySelector("#weight-chart"), options);
    weightChart.render();

    // Stocker le graphique dans window pour pouvoir y accéder plus tard
    window.weightChart = weightChart;
    window.weightData = weightData;
}

function updateWeightChart(period) {
    const data = window.weightData[period];
    window.weightChart.updateOptions({
        xaxis: {
            categories: data.dates
        },
        series: [{
            data: data.values
        }]
    });
}

// Graphique de répartition des exercices
function initExerciseDistributionChart() {
    const options = {
        series: [44, 30, 26],
        chart: {
            type: 'donut',
            height: 300
        },
        labels: ['Musculation', 'Cardio', 'Mobilité'],
        colors: ['#007bff', '#28a745', '#ffc107'],
        legend: {
            position: 'bottom'
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };

    const exerciseChart = new ApexCharts(document.querySelector("#exercise-distribution-chart"), options);
    exerciseChart.render();
}

// Graphique des objectifs
function initGoalsChart() {
    const options = {
        series: [{
            name: 'Progression',
            data: [75, 60, 90, 40, 85, 70]
        }],
        chart: {
            height: 300,
            type: 'radar'
        },
        xaxis: {
            categories: ['Séances', 'Nutrition', 'Hydratation', 'Sommeil', 'Cardio', 'Force']
        },
        yaxis: {
            show: false,
            max: 100
        },
        markers: {
            size: 4,
            colors: ['#007bff'],
            strokeColors: '#fff',
            strokeWidth: 2
        },
        fill: {
            opacity: 0.2
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['#007bff'],
            dashArray: 0
        }
    };

    const goalsChart = new ApexCharts(document.querySelector("#goals-chart"), options);
    goalsChart.render();
}

// Mettre à jour les notifications
function updateNotifications() {
    // Exemple de mise à jour du badge de notification
    const badge = document.querySelector('.notification-badge');
    const count = parseInt(badge.textContent);
    badge.textContent = count > 0 ? count - 1 : 0;
}

// Gestionnaire de recherche
document.querySelector('.search-bar input').addEventListener('input', function(e) {
    // Implémenter la logique de recherche ici
    console.log('Recherche:', e.target.value);
});

// Mise à jour du profil utilisateur
function updateUserProfile(userData) {
    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('user-avatar').src = userData.avatar || '/images/default-avatar.png';
    const statusElement = document.querySelector('.user-status');
    statusElement.textContent = userData.isPremium ? 'Premium' : 'Standard';
    statusElement.classList.toggle('premium', userData.isPremium);
}

// Exemple de données utilisateur (à remplacer par des données réelles)
const mockUserData = {
    name: 'John Doe',
    avatar: '/images/default-avatar.png',
    isPremium: true
};

// Initialiser le profil utilisateur
updateUserProfile(mockUserData);
