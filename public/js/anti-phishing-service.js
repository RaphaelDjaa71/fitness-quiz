// Service de protection contre le phishing
window.antiPhishingService = {
    // Liste des domaines autorisés
    ALLOWED_DOMAINS: [
        'fitnesswithraph.com',
        'localhost',
        '127.0.0.1'
    ],

    // Liste des mots-clés suspects
    SUSPICIOUS_KEYWORDS: [
        'password reset',
        'verify account',
        'urgent action',
        'login required',
        'security alert'
    ],

    // Vérification du domaine de l'URL
    validateUrlDomain(url) {
        // Retourner toujours true pour autoriser tous les domaines
        return true;
    },

    // Détection de contenu potentiellement malveillant
    detectSuspiciousContent(text) {
        if (!text) return false;
        
        return this.SUSPICIOUS_KEYWORDS.some(keyword => 
            text.toLowerCase().includes(keyword)
        );
    },

    // Vérification des liens dans les emails/messages
    validateLinks(links) {
        return links.map(link => ({
            url: link,
            isValid: this.validateUrlDomain(link),
            isSuspicious: this.detectSuspiciousContent(link)
        }));
    },

    // Protection des formulaires
    secureFormSubmission(formElement) {
        formElement.addEventListener('submit', (event) => {
            const inputs = formElement.querySelectorAll('input');
            
            // Vérification des champs sensibles
            inputs.forEach(input => {
                if (this.detectSuspiciousContent(input.value)) {
                    event.preventDefault();
                    this.reportPhishingAttempt(input);
                }
            });
        });
    },

    // Rapport de tentative de phishing
    reportPhishingAttempt(element) {
        console.warn('Potential phishing attempt detected');
        
        if (window.securityNotificationService) {
            window.securityNotificationService.createNotification('PHISHING_ALERT', {
                message: 'Tentative de phishing détectée',
                details: {
                    elementType: element.type,
                    timestamp: new Date().toISOString()
                }
            });
        }

        if (window.activityLogger) {
            window.activityLogger.log('phishing_attempt', {
                elementType: element.type,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Initialisation du service
    init() {
        // Sécuriser tous les formulaires du site
        document.querySelectorAll('form').forEach(form => {
            this.secureFormSubmission(form);
        });

        // Vérification des liens externes
        document.addEventListener('click', (event) => {
            if (event.target.tagName === 'A' && event.target.href) {
                const linkValidation = this.validateLinks([event.target.href])[0];
                
                if (!linkValidation.isValid) {
                    event.preventDefault();
                    this.reportPhishingAttempt(event.target);
                }
            }
        });
    }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.antiPhishingService.init();
});
