// Initialisation des graphiques
document.addEventListener('DOMContentLoaded', function() {
    initializeWeightChart();
    initializeWorkoutChart();
});

// Graphique de suivi du poids
function initializeWeightChart() {
    const weightChartOptions = {
        series: [{
            name: 'Poids',
            data: [78, 77.5, 76.8, 76.2, 75.5]
        }, {
            name: 'Objectif',
            data: [78, 77, 76, 75, 74],
            type: 'line',
            dashArray: 5
        }],
        chart: {
            height: '100%',
            type: 'area',
            toolbar: {
                show: false
            },
            fontFamily: 'Montserrat, sans-serif',
        },
        stroke: {
            curve: 'smooth',
            width: [3, 2]
        },
        colors: ['#2563eb', '#64748b'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        dataLabels: {
            enabled: false
        },
        grid: {
            borderColor: '#e2e8f0',
            strokeDashArray: 4,
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 10
            }
        },
        xaxis: {
            categories: ['Nov 15', 'Nov 22', 'Nov 29', 'Dec 6', 'Dec 13'],
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                    fontFamily: 'Montserrat, sans-serif',
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
                    return val.toFixed(1) + ' kg';
                },
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                    fontFamily: 'Montserrat, sans-serif',
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            floating: true,
            offsetY: -25,
            offsetX: -5,
            markers: {
                width: 8,
                height: 8,
                strokeWidth: 0,
                radius: 12,
                offsetX: -2
            },
            itemMargin: {
                horizontal: 10
            }
        },
        tooltip: {
            theme: 'light',
            marker: {
                show: true,
            },
            x: {
                show: false
            },
            y: {
                title: {
                    formatter: function(val) {
                        return val + ": ";
                    }
                }
            }
        }
    };

    const weightChart = new ApexCharts(document.querySelector("#weightChart"), weightChartOptions);
    weightChart.render();
}

// Graphique des séances d'entraînement
function initializeWorkoutChart() {
    const workoutChartOptions = {
        series: [{
            name: 'Séances',
            data: [3, 4, 3, 5, 4]
        }],
        chart: {
            height: '100%',
            type: 'bar',
            toolbar: {
                show: false
            },
            fontFamily: 'Montserrat, sans-serif',
        },
        colors: ['#2563eb'],
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '60%',
                dataLabels: {
                    position: 'top'
                }
            }
        },
        dataLabels: {
            enabled: true,
            offsetY: -20,
            style: {
                fontSize: '12px',
                colors: ['#64748b'],
                fontFamily: 'Montserrat, sans-serif',
            }
        },
        grid: {
            borderColor: '#e2e8f0',
            strokeDashArray: 4,
            padding: {
                top: 20,
                right: 0,
                bottom: 0,
                left: 10
            }
        },
        xaxis: {
            categories: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4', 'Semaine 5'],
            position: 'bottom',
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                    fontFamily: 'Montserrat, sans-serif',
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
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            },
            labels: {
                show: false
            }
        },
        tooltip: {
            theme: 'light',
            y: {
                title: {
                    formatter: function() {
                        return 'Séances: ';
                    }
                }
            }
        }
    };

    const workoutChart = new ApexCharts(document.querySelector("#workoutChart"), workoutChartOptions);
    workoutChart.render();
}

// Sauvegarder les modifications du profil
function saveProfile() {
    // Récupération des valeurs
    const profile = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        birthDate: document.getElementById('birthDate').value,
        gender: document.getElementById('gender').value,
        height: document.getElementById('height').value,
        currentWeight: document.getElementById('currentWeight').value,
        targetWeight: document.getElementById('targetWeight').value,
        activityLevel: document.getElementById('activityLevel').value,
        goals: getSelectedGoals()
    };

    // Simulation de sauvegarde
    console.log('Sauvegarde du profil:', profile);
    
    // Afficher une notification de succès
    showNotification('Profil mis à jour avec succès !');
}

// Récupérer les objectifs sélectionnés
function getSelectedGoals() {
    const goals = [];
    document.querySelectorAll('.goal-item input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked) {
            goals.push(checkbox.nextElementSibling.textContent);
        }
    });
    return goals;
}

// Afficher les détails du quiz
function viewQuizDetails() {
    // Implémenter la logique pour afficher les détails du quiz
    console.log('Affichage des détails du quiz');
}

// Refaire le quiz
function retakeQuiz() {
    // Redirection vers la page du quiz
    window.location.href = '/quiz.html';
}

// Afficher une notification
function showNotification(message, type = 'success') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Ajouter des styles pour la notification
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
        z-index: 1000;
    }

    .notification.success {
        background-color: #10b981;
        color: white;
    }

    .notification.error {
        background-color: #ef4444;
        color: white;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
