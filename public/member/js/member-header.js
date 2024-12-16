document.addEventListener('DOMContentLoaded', function() {
    loadMemberHeader();
});

async function loadMemberHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        try {
            const response = await fetch('/member/components/member-header.html');
            const headerHtml = await response.text();
            headerPlaceholder.innerHTML = headerHtml;
            initializeHeaderEvents();
        } catch (error) {
            console.error('Erreur lors du chargement du header:', error);
        }
    }
}

function initializeHeaderEvents() {
    // Fermer le menu utilisateur quand on clique en dehors
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('user-dropdown');
        const menuBtn = document.querySelector('.user-menu-btn');
        
        if (!event.target.closest('.user-menu-container')) {
            dropdown.classList.remove('active');
        }
    });

    // Initialiser avec des données factices
    const mockUser = {
        name: "Raphaël Dorgans",
        isPremium: true
    };
    
    updateUserInfo(mockUser);
}

function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('active');
}

function updateUserInfo(userData) {
    document.getElementById('user-name-display').textContent = userData.name;
    
    const statusElement = document.querySelector('.user-status');
    if (userData.isPremium) {
        statusElement.classList.add('premium');
        statusElement.textContent = 'Premium';
    } else {
        statusElement.classList.remove('premium');
        statusElement.textContent = 'Standard';
    }
}

function logout() {
    // Redirection simple sans vérification
    window.location.href = '/';
}
