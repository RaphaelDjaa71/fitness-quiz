class NotificationService {
    constructor() {
        // Clé de stockage pour les notifications
        this.STORAGE_KEY = 'fitness_quiz_notifications';
        
        // Conteneur des notifications
        this.notificationContainer = null;
        
        // Initialiser le stockage des notifications
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
    }

    // Méthode pour créer un conteneur de notifications
    _createNotificationContainer() {
        if (!this.notificationContainer) {
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.id = 'notification-container';
            this.notificationContainer.classList.add('notification-container');
            
            // Styles CSS embarqués
            this.notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 350px;
                width: 100%;
            `;
            
            document.body.appendChild(this.notificationContainer);
        }
        return this.notificationContainer;
    }

    // Méthode pour ajouter une notification
    notify(message, type = 'info', options = {}) {
        const container = this._createNotificationContainer();
        
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);
        
        // Styles de base
        notification.style.cssText = `
            background-color: ${this._getColorForType(type)};
            color: white;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
        `;

        // Icône basée sur le type
        const icon = this._getIconForType(type);
        const iconElement = document.createElement('span');
        iconElement.innerHTML = icon;
        iconElement.style.marginRight = '10px';
        
        // Contenu de la notification
        const messageElement = document.createElement('span');
        messageElement.textContent = message;
        
        // Bouton de fermeture
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            margin-left: auto;
            cursor: pointer;
        `;
        
        // Assembler la notification
        notification.appendChild(iconElement);
        notification.appendChild(messageElement);
        notification.appendChild(closeButton);
        
        // Ajouter au conteneur
        container.appendChild(notification);
        
        // Animation d'entrée
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        // Fermeture de la notification
        closeButton.addEventListener('click', () => this._removeNotification(notification));
        
        // Fermeture automatique
        const duration = options.duration || 5000;
        const timer = setTimeout(() => {
            this._removeNotification(notification);
        }, duration);

        // Stocker la notification
        this._storeNotification({
            message,
            type,
            timestamp: new Date().toISOString()
        });

        return notification;
    }

    // Méthode pour supprimer une notification
    _removeNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    // Méthode pour obtenir la couleur en fonction du type
    _getColorForType(type) {
        const colors = {
            info: '#17a2b8',
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545'
        };
        return colors[type] || colors.info;
    }

    // Méthode pour obtenir l'icône en fonction du type
    _getIconForType(type) {
        const icons = {
            info: '&#128712;',     // Information
            success: '&#9989;',    // Coche verte
            warning: '&#9888;',    // Point d'exclamation
            error: '&#10060;'      // Croix rouge
        };
        return icons[type] || icons.info;
    }

    // Méthode pour stocker les notifications
    _storeNotification(notification) {
        const notifications = this.getStoredNotifications();
        notifications.push(notification);
        
        // Limiter le nombre de notifications stockées
        const MAX_STORED = 50;
        if (notifications.length > MAX_STORED) {
            notifications.splice(0, notifications.length - MAX_STORED);
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
    }

    // Méthode pour récupérer les notifications stockées
    getStoredNotifications() {
        const notificationsString = localStorage.getItem(this.STORAGE_KEY);
        return notificationsString ? JSON.parse(notificationsString) : [];
    }

    // Méthodes de notification spécifiques
    success(message, options = {}) {
        return this.notify(message, 'success', options);
    }

    error(message, options = {}) {
        return this.notify(message, 'error', options);
    }

    warning(message, options = {}) {
        return this.notify(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.notify(message, 'info', options);
    }

    // Méthode pour effacer toutes les notifications
    clearNotifications() {
        localStorage.removeItem(this.STORAGE_KEY);
        if (this.notificationContainer) {
            this.notificationContainer.innerHTML = '';
        }
    }
}

// Instancier et exposer le service de notifications
window.notificationService = new NotificationService();
