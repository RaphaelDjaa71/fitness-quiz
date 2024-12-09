class SecurityNotificationService {
    constructor() {
        // Configuration des notifications
        this.config = {
            // Types de notifications
            notificationTypes: {
                LOGIN: {
                    title: 'Nouvelle Connexion',
                    icon: '🔐',
                    category: 'security'
                },
                PASSWORD_CHANGE: {
                    title: 'Changement de Mot de Passe',
                    icon: '🔑',
                    category: 'security'
                },
                DEVICE_NEW: {
                    title: 'Nouvel Appareil Détecté',
                    icon: '📱',
                    category: 'device'
                },
                LOCATION_CHANGE: {
                    title: 'Connexion depuis un Nouvel Emplacement',
                    icon: '🌍',
                    category: 'location'
                },
                SECURITY_ALERT: {
                    title: 'Alerte de Sécurité',
                    icon: '⚠️',
                    category: 'critical'
                }
            },
            
            // Canaux de notification
            channels: {
                BROWSER: true,
                EMAIL: true,
                SMS: false,
                PUSH: false
            },
            
            // Configuration de stockage
            storage: {
                key: 'security_notifications',
                maxNotifications: 50
            }
        };

        // Initialiser le stockage des notifications
        this.initNotificationStorage();
    }

    // Initialiser le stockage des notifications
    initNotificationStorage() {
        if (!localStorage.getItem(this.config.storage.key)) {
            localStorage.setItem(
                this.config.storage.key, 
                JSON.stringify([])
            );
        }
    }

    // Créer une notification
    createNotification(type, details = {}) {
        const notificationType = this.config.notificationTypes[type];
        
        if (!notificationType) {
            console.error('Type de notification invalide');
            return null;
        }

        const notification = {
            id: this.generateUniqueId(),
            type: type,
            timestamp: Date.now(),
            read: false,
            ...notificationType,
            ...details
        };

        // Stocker la notification
        this.storeNotification(notification);

        // Envoyer par différents canaux
        this.sendNotification(notification);

        return notification;
    }

    // Générer un ID unique
    generateUniqueId() {
        return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Stocker une notification
    storeNotification(notification) {
        const notifications = this.getStoredNotifications();
        
        // Ajouter la nouvelle notification
        notifications.push(notification);

        // Limiter le nombre de notifications
        if (notifications.length > this.config.storage.maxNotifications) {
            notifications.shift(); // Supprimer la plus ancienne
        }

        // Sauvegarder
        localStorage.setItem(
            this.config.storage.key, 
            JSON.stringify(notifications)
        );
    }

    // Récupérer les notifications stockées
    getStoredNotifications() {
        return JSON.parse(
            localStorage.getItem(this.config.storage.key) || '[]'
        );
    }

    // Envoyer une notification
    sendNotification(notification) {
        // Notification navigateur
        if (this.config.channels.BROWSER && 'Notification' in window) {
            this.sendBrowserNotification(notification);
        }

        // Notification par email
        if (this.config.channels.EMAIL) {
            this.sendEmailNotification(notification);
        }
    }

    // Notification navigateur
    sendBrowserNotification(notification) {
        // Demander la permission
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
            return;
        }

        // Créer la notification
        const browserNotif = new Notification(notification.title, {
            body: this.formatNotificationMessage(notification),
            icon: this.getNotificationIcon(notification),
            tag: notification.id
        });

        // Événements de la notification
        browserNotif.onclick = () => this.handleNotificationClick(notification);
    }

    // Notification par email (simulation)
    sendEmailNotification(notification) {
        // Dans un vrai système, cela déclencherait un appel API
        console.log('Email de notification envoyé', notification);
    }

    // Formater le message de notification
    formatNotificationMessage(notification) {
        switch (notification.type) {
            case 'LOGIN':
                return `Connexion détectée le ${new Date(notification.timestamp).toLocaleString()}`;
            
            case 'PASSWORD_CHANGE':
                return 'Votre mot de passe a été modifié';
            
            case 'DEVICE_NEW':
                return `Nouvel appareil : ${notification.deviceInfo}`;
            
            case 'LOCATION_CHANGE':
                return `Connexion depuis ${notification.location}`;
            
            case 'SECURITY_ALERT':
                return notification.message || 'Activité suspecte détectée';
            
            default:
                return 'Notification de sécurité';
        }
    }

    // Obtenir l'icône de notification
    getNotificationIcon(notification) {
        // Dans un vrai système, utilisez des chemins d'icônes
        return notification.icon || '🔔';
    }

    // Gérer le clic sur une notification
    handleNotificationClick(notification) {
        // Marquer comme lu
        this.markNotificationAsRead(notification.id);

        // Rediriger vers la page de détails
        window.location.href = '/security-notifications.html';
    }

    // Marquer une notification comme lue
    markNotificationAsRead(notificationId) {
        const notifications = this.getStoredNotifications();
        
        const updatedNotifications = notifications.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
        );

        localStorage.setItem(
            this.config.storage.key, 
            JSON.stringify(updatedNotifications)
        );
    }

    // Créer un centre de notifications
    createNotificationCenter() {
        const notificationCenter = document.createElement('div');
        notificationCenter.id = 'security-notification-center';
        notificationCenter.classList.add('notification-center');
        
        notificationCenter.innerHTML = `
            <div class="notification-header">
                <h3>Notifications de Sécurité</h3>
                <span id="unread-count" class="unread-count">0</span>
            </div>
            <div id="notification-list" class="notification-list"></div>
        `;

        // Ajouter au document
        document.body.appendChild(notificationCenter);

        // Mettre à jour la liste des notifications
        this.updateNotificationList();
    }

    // Mettre à jour la liste des notifications
    updateNotificationList() {
        const notificationList = document.getElementById('notification-list');
        const unreadCountElement = document.getElementById('unread-count');
        
        if (!notificationList || !unreadCountElement) return;

        const notifications = this.getStoredNotifications();
        const unreadNotifications = notifications.filter(notif => !notif.read);

        // Mettre à jour le compteur
        unreadCountElement.textContent = unreadNotifications.length;

        // Vider la liste actuelle
        notificationList.innerHTML = '';

        // Ajouter chaque notification
        notifications.reverse().forEach(notification => {
            const notifElement = document.createElement('div');
            notifElement.classList.add('notification-item');
            notifElement.classList.toggle('unread', !notification.read);
            
            notifElement.innerHTML = `
                <div class="notification-icon">${notification.icon}</div>
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${this.formatNotificationMessage(notification)}</p>
                    <small>${new Date(notification.timestamp).toLocaleString()}</small>
                </div>
            `;

            notifElement.addEventListener('click', () => {
                this.markNotificationAsRead(notification.id);
                this.updateNotificationList();
            });

            notificationList.appendChild(notifElement);
        });
    }

    // Initialisation
    init() {
        // Créer le centre de notifications
        this.createNotificationCenter();

        // Exemple de notifications de test
        this.setupTestNotifications();
    }

    // Configuration de notifications de test
    setupTestNotifications() {
        // Exemple de notification de connexion
        this.createNotification('LOGIN', {
            deviceInfo: 'Chrome sur Windows',
            location: 'Paris, France'
        });

        // Exemple de changement de mot de passe
        this.createNotification('PASSWORD_CHANGE');
    }
}

// Instancier et exposer le service de notifications
window.securityNotificationService = new SecurityNotificationService();

// Initialisation lors du chargement du document
document.addEventListener('DOMContentLoaded', () => {
    window.securityNotificationService.init();
});
