// Services de sécurité pour le tableau de bord admin
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si les services de sécurité sont disponibles
    if (window.threatDetectionService && window.securityNotificationService) {
        // Initialisation des services de sécurité
        window.threatDetectionService.init();
        window.securityNotificationService.init();
        
        // Exemple de simulation d'événement de sécurité
        const simulateSecurityEvent = () => {
            const mockUserData = {
                failedLoginAttempts: 3,
                lastPasswordChangeTimestamp: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 jours
                currentCountry: 'FR',
                ipAddress: '192.168.1.1',
                behaviorPatterns: ['rapid_navigation']
            };

            // Simuler une analyse de menace
            const threatResult = window.threatDetectionService.analyzePotentialThreats(mockUserData);
            
            // Créer une notification basée sur le résultat
            if (threatResult.riskCategory !== 'low') {
                window.securityNotificationService.createNotification('SECURITY_ALERT', {
                    message: `Risque détecté : ${threatResult.riskCategory}`,
                    details: threatResult
                });
            }
        };

        // Exécuter la simulation toutes les minutes
        setInterval(simulateSecurityEvent, 60000);

        // Log de démarrage du service de sécurité
        console.log('Services de sécurité du tableau de bord initialisés');
    } else {
        console.warn('Services de sécurité non disponibles');
    }
});
