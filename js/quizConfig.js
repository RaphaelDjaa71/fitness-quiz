const quizConfig = {
    pages: [
        {
            id: 'welcome',
            path: 'index.html',
            title: 'Bienvenue',
            progress: 0
        },
        {
            id: 'objectif',
            path: 'objectif.html',
            title: 'Votre Objectif',
            progress: 10
        },
        {
            id: 'sexe',
            path: 'sexe.html',
            title: 'Votre Sexe',
            progress: 15
        },
        {
            id: 'age',
            path: 'age.html',
            title: 'Votre Âge',
            progress: 20
        },
        {
            id: 'taille',
            path: 'taille.html',
            title: 'Votre Taille',
            progress: 25
        },
        {
            id: 'poids',
            path: 'poids.html',
            title: 'Votre Poids',
            progress: 30
        },
        {
            id: 'poignet',
            path: 'poignet.html',
            title: 'Tour de Poignet',
            progress: 35
        },
        {
            id: 'objectif-poids',
            path: 'objectif-poids.html',
            title: 'Objectif de Poids',
            progress: 40
        },
        {
            id: 'niveau-activite',
            path: 'niveau-activite.html',
            title: 'Niveau d\'Activité',
            progress: 50
        },
        {
            id: 'experience-musculation',
            path: 'experience-musculation.html',
            title: 'Expérience en Musculation',
            progress: 60
        },
        {
            id: 'frequence-entrainement',
            path: 'frequence-entrainement.html',
            title: 'Fréquence d\'Entraînement',
            progress: 70
        },
        {
            id: 'equipement',
            path: 'equipement.html',
            title: 'Équipement Disponible',
            progress: 80
        },
        {
            id: 'regime-alimentaire',
            path: 'regime-alimentaire.html',
            title: 'Régime Alimentaire',
            progress: 90
        },
        {
            id: 'resultats',
            path: 'resultats.html',
            title: 'Vos Résultats',
            progress: 100
        }
    ],

    getNextPage(currentPath) {
        const currentIndex = this.pages.findIndex(page => page.path === currentPath);
        return currentIndex < this.pages.length - 1 ? this.pages[currentIndex + 1].path : null;
    },

    getPreviousPage(currentPath) {
        const currentIndex = this.pages.findIndex(page => page.path === currentPath);
        return currentIndex > 0 ? this.pages[currentIndex - 1].path : null;
    },

    getCurrentProgress(currentPath) {
        const page = this.pages.find(page => page.path === currentPath);
        return page ? page.progress : 0;
    },

    isLastPage(currentPath) {
        return currentPath === this.pages[this.pages.length - 1].path;
    },

    isFirstPage(currentPath) {
        return currentPath === this.pages[0].path;
    },

    getCurrentPageInfo() {
        const currentPath = window.location.pathname.split('/').pop();
        return this.pages.find(page => page.path === currentPath);
    }
};

class QuizNavigation {
    static getCurrentPage() {
        const path = window.location.pathname;
        return path.substring(path.lastIndexOf('/') + 1);
    }

    static updateProgressBar() {
        const currentPage = this.getCurrentPage();
        const progress = quizConfig.getCurrentProgress(currentPage);
        const progressBar = document.querySelector('.progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', progress);
        }
    }

    static setupNavigation() {
        const currentPage = this.getCurrentPage();
        
        // Boutons de navigation
        const prevButton = document.querySelector('.btn-previous');
        const nextButton = document.querySelector('.btn-next');

        if (prevButton) {
            const prevPage = quizConfig.getPreviousPage(currentPage);
            if (prevPage) {
                prevButton.href = prevPage;
            } else {
                prevButton.style.display = 'none';
            }
        }

        if (nextButton) {
            const nextPage = quizConfig.getNextPage(currentPage);
            if (nextPage) {
                nextButton.href = nextPage;
            } else {
                nextButton.style.display = 'none';
            }
        }

        // Mise à jour de la barre de progression
        this.updateProgressBar();
    }

    static validateAndProceed(formId, validationFn) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (validationFn && !validationFn()) {
                return false;
            }

            const currentPage = this.getCurrentPage();
            const nextPage = quizConfig.getNextPage(currentPage);
            if (nextPage) {
                window.location.href = nextPage;
            }
        });
    }

    static init() {
        this.setupNavigation();
        
        // Gestion du retour arrière
        window.addEventListener('popstate', () => {
            this.setupNavigation();
        });
    }
}
