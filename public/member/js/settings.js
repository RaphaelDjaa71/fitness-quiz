// Sauvegarder les paramètres
function saveSettings() {
    // Récupération des valeurs
    const settings = {
        language: document.getElementById('language').value,
        units: document.getElementById('units').value,
        timezone: document.getElementById('timezone').value,
        notifications: getNotificationSettings(),
        privacy: {
            profileVisibility: document.getElementById('profileVisibility').value,
            dataSharing: document.querySelector('.privacy-item input[type="checkbox"]').checked
        }
    };

    // Simulation de sauvegarde
    console.log('Sauvegarde des paramètres:', settings);
    
    // Afficher une notification de succès
    showNotification('Paramètres mis à jour avec succès !');
}

// Récupérer les paramètres de notification
function getNotificationSettings() {
    const notifications = {};
    document.querySelectorAll('.notification-item input[type="checkbox"]').forEach((checkbox, index) => {
        const notificationName = checkbox.closest('.notification-item').querySelector('h3').textContent;
        notifications[notificationName] = checkbox.checked;
    });
    return notifications;
}

// Changer le mot de passe
function changePassword() {
    showModal('passwordModal');
}

// Gérer la soumission du formulaire de mot de passe
document.getElementById('passwordForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showNotification('Les mots de passe ne correspondent pas !', 'error');
        return;
    }

    // Simulation de changement de mot de passe
    console.log('Changement de mot de passe');
    closeModal('passwordModal');
    showNotification('Mot de passe modifié avec succès !');
});

// Voir l'historique des connexions
function viewLoginHistory() {
    // Implémenter la logique pour afficher l'historique des connexions
    console.log('Affichage de l\'historique des connexions');
}

// Voir l'historique des paiements
function viewBillingHistory() {
    // Implémenter la logique pour afficher l'historique des paiements
    console.log('Affichage de l\'historique des paiements');
}

// Gérer l'abonnement
function managePlan() {
    // Implémenter la logique pour gérer l'abonnement
    console.log('Gestion de l\'abonnement');
}

// Exporter les données
function exportData() {
    // Implémenter la logique pour exporter les données
    console.log('Export des données');
    showNotification('Préparation de l\'export de vos données...');
}

// Supprimer le compte
function deleteAccount() {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
        // Implémenter la logique de suppression du compte
        console.log('Suppression du compte');
        showNotification('Compte supprimé avec succès');
        // Redirection vers la page d'accueil
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    }
}

// Gestion des modals
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Fermer les modals en cliquant en dehors
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
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
