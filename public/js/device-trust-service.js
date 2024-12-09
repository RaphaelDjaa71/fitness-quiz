// Service de gestion des appareils de confiance
window.deviceTrustService = {
    // Configuration du service
    CONFIG: {
        maxTrustedDevices: 5,
        deviceTrustDuration: 90 * 24 * 60 * 60 * 1000 // 90 jours
    },

    // Initialisation du service
    init() {
        this._cleanupExpiredDevices();
    },

    // Génération de la signature de l'appareil
    generateDeviceSignature() {
        return btoa([
            navigator.userAgent,
            screen.width,
            screen.height,
            navigator.language,
            navigator.platform,
            // Ajout de plus de données pour une signature plus robuste
            window.screen.colorDepth,
            window.screen.pixelDepth,
            navigator.hardwareConcurrency || 'unknown'
        ].join('|'));
    },

    // Ajouter un appareil de confiance
    addTrustedDevice(name = 'Mon appareil') {
        const deviceSignature = this.generateDeviceSignature();
        const trustedDevices = this._getTrustedDevices();

        // Vérifier si l'appareil existe déjà
        if (this.isDeviceTrusted(deviceSignature)) {
            this._showNotification('Cet appareil est déjà enregistré', 'warning');
            return false;
        }

        // Limiter le nombre d'appareils de confiance
        if (trustedDevices.length >= this.CONFIG.maxTrustedDevices) {
            trustedDevices.shift(); // Supprimer le plus ancien
            this._showNotification('Nombre maximal d\'appareils atteint. Le plus ancien a été supprimé', 'info');
        }

        const newDevice = {
            signature: deviceSignature,
            name: name,
            addedAt: Date.now(),
            lastUsed: Date.now(),
            browserInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform
            }
        };

        trustedDevices.push(newDevice);
        this._storeTrustedDevices(trustedDevices);
        this._showNotification(`Appareil "${name}" ajouté avec succès`, 'success');
        return true;
    },

    // Vérifier si un appareil est de confiance
    isDeviceTrusted(signature) {
        const trustedDevices = this._getTrustedDevices();
        return trustedDevices.some(device => device.signature === signature);
    },

    // Récupérer la liste des appareils de confiance
    getTrustedDevices() {
        return this._getTrustedDevices();
    },

    // Supprimer un appareil de confiance
    removeTrustedDevice(signature) {
        const trustedDevices = this._getTrustedDevices();
        const deviceToRemove = trustedDevices.find(device => device.signature === signature);
        
        const updatedDevices = trustedDevices.filter(
            device => device.signature !== signature
        );

        this._storeTrustedDevices(updatedDevices);
        
        if (deviceToRemove) {
            this._showNotification(`Appareil "${deviceToRemove.name}" supprimé`, 'info');
        }
    },

    // Nettoyer les appareils expirés
    _cleanupExpiredDevices() {
        const trustedDevices = this._getTrustedDevices();
        const currentTime = Date.now();

        const validDevices = trustedDevices.filter(
            device => currentTime - device.addedAt < this.CONFIG.deviceTrustDuration
        );

        if (validDevices.length !== trustedDevices.length) {
            this._storeTrustedDevices(validDevices);
            this._showNotification('Appareils expirés nettoyés', 'info');
        }
    },

    // Récupérer les appareils de confiance stockés
    _getTrustedDevices() {
        const devices = localStorage.getItem('trustedDevices');
        return devices ? JSON.parse(devices) : [];
    },

    // Stocker les appareils de confiance
    _storeTrustedDevices(devices) {
        localStorage.setItem('trustedDevices', JSON.stringify(devices));
    },

    // Afficher une notification
    _showNotification(message, type = 'info') {
        if (window.notificationService) {
            window.notificationService[type](message, { duration: 3000 });
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    },

    // Interface de gestion des appareils
    renderDeviceManagementUI() {
        const container = document.createElement('div');
        container.classList.add('device-trust-container');
        
        const headerHTML = `
            <div class="device-trust-header">
                <h4>Appareils de confiance</h4>
                <button id="addTrustedDeviceBtn" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Ajouter un appareil
                </button>
            </div>
        `;

        const listContainer = document.createElement('div');
        listContainer.id = 'trustedDevicesList';
        listContainer.classList.add('trusted-devices-list');

        container.innerHTML = headerHTML;
        container.appendChild(listContainer);

        // Bouton d'ajout d'appareil
        const addDeviceBtn = container.querySelector('#addTrustedDeviceBtn');
        addDeviceBtn.addEventListener('click', () => {
            const deviceName = prompt('Nom de l\'appareil :');
            if (deviceName) {
                this.addTrustedDevice(deviceName);
                this._renderDeviceList(listContainer);
            }
        });

        // Initialiser la liste des appareils
        this._renderDeviceList(listContainer);

        return container;
    },

    // Rendu de la liste des appareils
    _renderDeviceList(listContainer) {
        const devices = this.getTrustedDevices();
        listContainer.innerHTML = devices.length ? 
            devices.map(device => `
                <div class="trusted-device">
                    <div class="device-info">
                        <strong>${device.name}</strong>
                        <small>${new Date(device.addedAt).toLocaleDateString()}</small>
                        <p class="device-details">
                            ${device.browserInfo.userAgent.substring(0, 50)}...
                        </p>
                    </div>
                    <button class="remove-device" data-signature="${device.signature}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('') : 
            '<p class="no-devices">Aucun appareil de confiance enregistré</p>';

        // Ajout des écouteurs d'événements pour la suppression
        listContainer.querySelectorAll('.remove-device').forEach(button => {
            button.addEventListener('click', (e) => {
                const signature = e.currentTarget.dataset.signature;
                this.removeTrustedDevice(signature);
                this._renderDeviceList(listContainer);
            });
        });
    }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.deviceTrustService.init();
});
