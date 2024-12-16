document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    initializeCharts();
    loadExerciseLibrary();
});

// Initialisation du calendrier
function initializeCalendar() {
    const calendarEl = document.getElementById('training-calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        locale: 'fr',
        events: [
            {
                title: 'Haut du corps',
                start: '2023-12-18',
                backgroundColor: '#2563eb',
                borderColor: '#2563eb'
            },
            {
                title: 'Bas du corps',
                start: '2023-12-20',
                backgroundColor: '#2563eb',
                borderColor: '#2563eb'
            },
            {
                title: 'Full body',
                start: '2023-12-22',
                backgroundColor: '#2563eb',
                borderColor: '#2563eb'
            }
        ],
        eventClick: function(info) {
            showWorkoutDetails(info.event);
        }
    });
    calendar.render();
}

// Initialisation des graphiques
function initializeCharts() {
    initializeWeightProgressChart();
    initializeVolumeProgressChart();
}

function initializeWeightProgressChart() {
    const ctx = document.getElementById('weightProgressChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4', 'Semaine 5'],
            datasets: [{
                label: 'Développé couché (kg)',
                data: [60, 62.5, 65, 67.5, 70],
                borderColor: '#2563eb',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Progression en force',
                    color: '#0f172a',
                    font: {
                        size: 16,
                        weight: '600'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

function initializeVolumeProgressChart() {
    const ctx = document.getElementById('volumeProgressChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4', 'Semaine 5'],
            datasets: [{
                label: 'Volume total (kg)',
                data: [3000, 3250, 3500, 3750, 4000],
                backgroundColor: '#2563eb'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Volume d\'entraînement',
                    color: '#0f172a',
                    font: {
                        size: 16,
                        weight: '600'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Gestion de la bibliothèque d'exercices
function showExerciseLibrary() {
    const modal = document.getElementById('exerciseLibraryModal');
    modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

function loadExerciseLibrary() {
    // Simulation du chargement des exercices
    const exercises = [
        {
            name: 'Développé couché',
            muscleGroup: 'chest',
            equipment: 'barbell',
            difficulty: 'intermediate',
            description: 'Exercise classique pour les pectoraux'
        },
        // Ajouter plus d'exercices ici
    ];

    updateExerciseList(exercises);
}

function updateExerciseList(exercises) {
    const container = document.querySelector('.library-exercises');
    container.innerHTML = exercises.map(exercise => `
        <div class="exercise-card">
            <h3>${exercise.name}</h3>
            <p>${exercise.description}</p>
            <div class="exercise-tags">
                <span class="tag">${exercise.muscleGroup}</span>
                <span class="tag">${exercise.equipment}</span>
                <span class="tag">${exercise.difficulty}</span>
            </div>
        </div>
    `).join('');
}

// Gestion des filtres
document.getElementById('muscleGroupFilter')?.addEventListener('change', filterExercises);
document.getElementById('equipmentFilter')?.addEventListener('change', filterExercises);
document.getElementById('difficultyFilter')?.addEventListener('change', filterExercises);

function filterExercises() {
    const muscleGroup = document.getElementById('muscleGroupFilter').value;
    const equipment = document.getElementById('equipmentFilter').value;
    const difficulty = document.getElementById('difficultyFilter').value;

    // Implémenter la logique de filtrage
    console.log('Filtres:', { muscleGroup, equipment, difficulty });
}

// Gestion des entraînements
function startWorkout() {
    // Implémenter la logique de démarrage d'entraînement
    console.log('Démarrage de l\'entraînement');
}

function editWorkout() {
    // Implémenter la logique d'édition d'entraînement
    console.log('Édition de l\'entraînement');
}

function showExerciseVideo(exerciseId) {
    // Implémenter la logique d'affichage des vidéos
    console.log('Affichage de la vidéo pour:', exerciseId);
}

function showWorkoutDetails(event) {
    // Implémenter la logique d'affichage des détails d'entraînement
    console.log('Détails de l\'entraînement:', event.title);
}

// Fermer les modals en cliquant en dehors
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};
