// Fonction pour générer des données aléatoires
function generateData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
}

// Configuration des graphiques
function initializeCharts() {
    // Configuration du graphique des utilisateurs
    const usersChartOptions = {
        series: [{
            name: 'Utilisateurs Actifs',
            data: generateData(7, 2000, 3000)
        }, {
            name: 'Nouveaux Utilisateurs',
            data: generateData(7, 100, 500)
        }],
        chart: {
            type: 'area',
            height: 150,
            sparkline: {
                enabled: true
            },
            toolbar: {
                show: false
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
        colors: ['#007AFF', '#FF2D55']
    };

    // Configuration du graphique des revenus
    const revenueChartOptions = {
        series: [{
            name: 'Revenus',
            data: generateData(7, 3000, 5000)
        }, {
            name: 'Objectif',
            data: generateData(7, 4000, 6000)
        }],
        chart: {
            type: 'line',
            height: 150,
            sparkline: {
                enabled: true
            }
        },
        stroke: {
            curve: 'smooth',
            width: [2, 2],
            dashArray: [0, 5]
        },
        colors: ['#00a854', '#faad14']
    };

    // Configuration du graphique des programmes
    const programsChartOptions = {
        series: [{
            name: 'Programmes Complétés',
            data: generateData(7, 800, 1500)
        }, {
            name: 'Programmes En Cours',
            data: generateData(7, 1000, 2000)
        }],
        chart: {
            type: 'bar',
            height: 150,
            sparkline: {
                enabled: true
            }
        },
        plotOptions: {
            bar: {
                columnWidth: '60%'
            }
        },
        colors: ['#fa8c16', '#1890ff']
    };

    // Configuration du graphique de rétention
    const retentionChartOptions = {
        series: [78],
        chart: {
            type: 'radialBar',
            height: 150,
            sparkline: {
                enabled: true
            }
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    margin: 0,
                    size: '70%'
                },
                track: {
                    margin: 0
                },
                dataLabels: {
                    show: false
                }
            }
        },
        colors: ['#52c41a']
    };

    // Initialisation des graphiques
    new ApexCharts(document.querySelector("#usersChart"), usersChartOptions).render();
    new ApexCharts(document.querySelector("#revenueChart"), revenueChartOptions).render();
    new ApexCharts(document.querySelector("#programsChart"), programsChartOptions).render();
    new ApexCharts(document.querySelector("#retentionChart"), retentionChartOptions).render();
}

// Gestion du défilement horizontal
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.stats-grid');
    const leftButton = document.querySelector('.scroll-left');
    const rightButton = document.querySelector('.scroll-right');
    const scrollAmount = 400; // Ajustez cette valeur selon vos besoins

    // Fonction pour vérifier si les boutons doivent être affichés
    function updateScrollButtons() {
        if (container.scrollLeft <= 0) {
            leftButton.style.opacity = '0';
            leftButton.style.pointerEvents = 'none';
        } else {
            leftButton.style.opacity = '1';
            leftButton.style.pointerEvents = 'auto';
        }

        if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
            rightButton.style.opacity = '0';
            rightButton.style.pointerEvents = 'none';
        } else {
            rightButton.style.opacity = '1';
            rightButton.style.pointerEvents = 'auto';
        }
    }

    // Gestionnaires d'événements pour les boutons
    leftButton.addEventListener('click', () => {
        container.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    rightButton.addEventListener('click', () => {
        container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Mettre à jour les boutons lors du défilement
    container.addEventListener('scroll', updateScrollButtons);
    
    // Initialisation
    updateScrollButtons();
    initializeCharts();
});
