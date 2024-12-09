class ActivityLogger {
    constructor() {
        // Clé de stockage dans localStorage
        this.STORAGE_KEY = 'fitness_quiz_activity_log';
        
        // Initialiser le tableau de logs s'il n'existe pas
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
    }

    // Méthode pour ajouter un log
    log(activity, details = {}) {
        const user = window.sessionManager.getUserFromSession();
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            user: user ? {
                id: user.email,
                name: user.name,
                role: user.role
            } : null,
            activity: activity,
            details: details,
            // Informations supplémentaires de contexte
            context: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height
            }
        };

        // Récupérer les logs existants
        const logs = this.getLogs();
        
        // Ajouter le nouveau log
        logs.push(logEntry);
        
        // Limiter le nombre de logs (par exemple, garder les 100 derniers)
        const MAX_LOGS = 100;
        if (logs.length > MAX_LOGS) {
            logs.splice(0, logs.length - MAX_LOGS);
        }

        // Sauvegarder les logs
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));

        // Événement personnalisé pour permettre d'autres actions
        const event = new CustomEvent('activityLogged', { 
            detail: logEntry 
        });
        window.dispatchEvent(event);

        return logEntry;
    }

    // Méthode pour récupérer tous les logs
    getLogs() {
        const logsString = localStorage.getItem(this.STORAGE_KEY);
        return logsString ? JSON.parse(logsString) : [];
    }

    // Méthode pour filtrer les logs
    filterLogs(filterFn) {
        const logs = this.getLogs();
        return logs.filter(filterFn);
    }

    // Méthode pour effacer les logs
    clearLogs() {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    // Méthodes de log spécifiques
    logLogin(user) {
        return this.log('user.login', {
            email: user.email,
            loginMethod: 'standard'
        });
    }

    logLogout() {
        return this.log('user.logout');
    }

    logPasswordReset(email) {
        return this.log('user.password_reset', { email });
    }

    logQuizStart(quizId) {
        return this.log('quiz.start', { quizId });
    }

    logQuizComplete(quizId, score) {
        return this.log('quiz.complete', { 
            quizId, 
            score 
        });
    }

    // Méthode pour exporter les logs (peut être étendue pour envoyer au serveur)
    exportLogs() {
        const logs = this.getLogs();
        const logsBlob = new Blob([JSON.stringify(logs, null, 2)], {
            type: 'application/json'
        });
        
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(logsBlob);
        downloadLink.download = `activity_logs_${new Date().toISOString().replace(/:/g, '-')}.json`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
}

// Instancier et exposer le logger
window.activityLogger = new ActivityLogger();

// Ajouter des écouteurs globaux
document.addEventListener('DOMContentLoaded', () => {
    // Logs de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                window.activityLogger.logLogin({ 
                    email: emailInput.value 
                });
            }
        });
    }

    // Logs de déconnexion
    const logoutButtons = document.querySelectorAll('[data-logout]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.activityLogger.logLogout();
        });
    });
});
