class ThreatDetectionService {
    constructor() {
        // Configuration de la détection des menaces
        this.config = {
            // Seuils de risque
            riskThresholds: {
                low: 30,
                medium: 60,
                high: 90
            },
            
            // Facteurs de risque
            riskFactors: {
                // Tentatives de connexion
                loginAttempts: {
                    weight: 20,
                    maxAttempts: 5,
                    cooldownPeriod: 15 * 60 * 1000 // 15 minutes
                },
                
                // Changements de mot de passe
                passwordChange: {
                    weight: 10,
                    frequencyLimit: 24 * 60 * 60 * 1000 // 24 heures
                },
                
                // Localisation géographique
                geoLocation: {
                    weight: 15,
                    allowedCountries: ['FR', 'US', 'CA', 'GB']
                },
                
                // Détection des VPN/Proxy
                networkAnomaly: {
                    weight: 25,
                    suspiciousNetworks: [
                        '192.168.', '10.', '172.16.', 
                        'tor', 'vpn', 'proxy'
                    ]
                },
                
                // Comportement inhabituel
                behaviorAnomaly: {
                    weight: 30,
                    suspiciousPatterns: [
                        'rapid_navigation',
                        'multiple_failed_actions',
                        'unusual_access_time'
                    ]
                }
            },
            
            // Configuration de la journalisation
            logging: {
                enabled: true,
                storageKey: 'threat_detection_log',
                maxLogEntries: 50
            }
        };

        // Initialiser le stockage des logs
        this.initLogging();
    }

    // Initialiser le système de journalisation
    initLogging() {
        if (!localStorage.getItem(this.config.logging.storageKey)) {
            localStorage.setItem(
                this.config.logging.storageKey, 
                JSON.stringify([])
            );
        }
    }

    // Calculer le score de risque
    calculateRiskScore(threatData) {
        let riskScore = 0;

        // Évaluer chaque facteur de risque
        Object.entries(this.config.riskFactors).forEach(([factor, config]) => {
            const factorData = threatData[factor];
            
            if (factorData) {
                // Logique spécifique à chaque facteur
                switch (factor) {
                    case 'loginAttempts':
                        riskScore += this.evaluateLoginAttempts(factorData, config);
                        break;
                    case 'passwordChange':
                        riskScore += this.evaluatePasswordChange(factorData, config);
                        break;
                    case 'geoLocation':
                        riskScore += this.evaluateGeoLocation(factorData, config);
                        break;
                    case 'networkAnomaly':
                        riskScore += this.evaluateNetworkAnomaly(factorData, config);
                        break;
                    case 'behaviorAnomaly':
                        riskScore += this.evaluateBehaviorAnomaly(factorData, config);
                        break;
                }
            }
        });

        return Math.min(riskScore, 100); // Limiter à 100
    }

    // Évaluer les tentatives de connexion
    evaluateLoginAttempts(data, config) {
        if (data.count > config.maxAttempts) {
            return config.weight;
        }
        return 0;
    }

    // Évaluer les changements de mot de passe
    evaluatePasswordChange(data, config) {
        const timeSinceLastChange = Date.now() - data.lastChangeTimestamp;
        return timeSinceLastChange < config.frequencyLimit ? config.weight : 0;
    }

    // Évaluer la localisation géographique
    evaluateGeoLocation(data, config) {
        return config.allowedCountries.includes(data.countryCode) ? 0 : config.weight;
    }

    // Évaluer les anomalies réseau
    evaluateNetworkAnomaly(data, config) {
        const suspiciousMatch = config.suspiciousNetworks.some(network => 
            data.ipAddress.includes(network)
        );
        return suspiciousMatch ? config.weight : 0;
    }

    // Évaluer les anomalies de comportement
    evaluateBehaviorAnomaly(data, config) {
        const suspiciousMatch = config.suspiciousPatterns.some(pattern => 
            data.patterns.includes(pattern)
        );
        return suspiciousMatch ? config.weight : 0;
    }

    // Déterminer la catégorie de risque
    getRiskCategory(riskScore) {
        const { low, medium, high } = this.config.riskThresholds;
        
        if (riskScore < low) return 'low';
        if (riskScore < medium) return 'medium';
        if (riskScore < high) return 'high';
        return 'critical';
    }

    // Réagir en fonction du niveau de risque
    handleRiskResponse(riskScore, riskCategory) {
        switch (riskCategory) {
            case 'low':
                // Surveillance légère
                this.logThreatEvent('low_risk_detected');
                break;
            
            case 'medium':
                // Demander une vérification supplémentaire
                this.requestAdditionalVerification();
                this.logThreatEvent('medium_risk_detected');
                break;
            
            case 'high':
                // Bloquer temporairement
                this.temporaryBlockAccess();
                this.logThreatEvent('high_risk_detected');
                break;
            
            case 'critical':
                // Bloquer et alerter
                this.criticalBlockAccess();
                this.logThreatEvent('critical_risk_detected');
                break;
        }
    }

    // Demander une vérification supplémentaire
    requestAdditionalVerification() {
        // Exemple : vérification par email ou code
        const verificationModal = document.createElement('div');
        verificationModal.innerHTML = `
            <div class="threat-verification-modal">
                <h2>Vérification de sécurité requise</h2>
                <p>Une activité inhabituelle a été détectée. Veuillez confirmer votre identité.</p>
                <button id="send-verification-code">Envoyer un code de vérification</button>
            </div>
        `;
        
        document.body.appendChild(verificationModal);
    }

    // Bloquer temporairement l'accès
    temporaryBlockAccess() {
        // Bloquer pour une durée définie
        localStorage.setItem('access_blocked_until', 
            JSON.stringify(Date.now() + (30 * 60 * 1000)) // 30 minutes
        );
        
        // Rediriger vers une page de sécurité
        window.location.href = '/security-block.html';
    }

    // Bloquer de manière critique
    criticalBlockAccess() {
        // Bloquer complètement
        localStorage.setItem('critical_block', 'true');
        
        // Réinitialiser la session
        this.clearUserSession();
        
        // Rediriger vers une page de sécurité
        window.location.href = '/critical-security-alert.html';
    }

    // Effacer la session utilisateur
    clearUserSession() {
        // Supprimer les tokens et données de session
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_session');
        sessionStorage.clear();
    }

    // Journaliser les événements de menace
    logThreatEvent(eventType, additionalData = {}) {
        if (!this.config.logging.enabled) return;

        const log = JSON.parse(
            localStorage.getItem(this.config.logging.storageKey) || '[]'
        );

        // Ajouter un nouvel événement
        const newEvent = {
            timestamp: Date.now(),
            type: eventType,
            ...additionalData
        };

        log.push(newEvent);

        // Limiter la taille du journal
        if (log.length > this.config.logging.maxLogEntries) {
            log.shift(); // Supprimer le plus ancien
        }

        localStorage.setItem(
            this.config.logging.storageKey, 
            JSON.stringify(log)
        );
    }

    // Analyser les menaces potentielles
    analyzePotentialThreats(userData) {
        // Collecter les données de menace
        const threatData = {
            loginAttempts: {
                count: userData.failedLoginAttempts || 0
            },
            passwordChange: {
                lastChangeTimestamp: userData.lastPasswordChangeTimestamp || 0
            },
            geoLocation: {
                countryCode: userData.currentCountry || ''
            },
            networkAnomaly: {
                ipAddress: userData.ipAddress || ''
            },
            behaviorAnomaly: {
                patterns: userData.behaviorPatterns || []
            }
        };

        // Calculer le score de risque
        const riskScore = this.calculateRiskScore(threatData);
        const riskCategory = this.getRiskCategory(riskScore);

        // Réagir en fonction du risque
        this.handleRiskResponse(riskScore, riskCategory);

        return { riskScore, riskCategory };
    }

    // Initialisation globale
    init() {
        // Surveiller les événements critiques
        this.setupEventListeners();
    }

    // Configurer les écouteurs d'événements
    setupEventListeners() {
        // Surveiller les connexions
        document.addEventListener('login', (event) => {
            this.analyzePotentialThreats(event.detail.userData);
        });

        // Surveiller les changements de mot de passe
        document.addEventListener('passwordChange', (event) => {
            this.analyzePotentialThreats(event.detail.userData);
        });
    }
}

// Instancier et exposer le service de détection des menaces
window.threatDetectionService = new ThreatDetectionService();

// Initialisation lors du chargement du document
document.addEventListener('DOMContentLoaded', () => {
    window.threatDetectionService.init();
});
