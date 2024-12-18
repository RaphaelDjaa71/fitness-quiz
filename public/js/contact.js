// Form Validation and Submission
const contactForm = document.getElementById('contactForm');
const submitButton = contactForm.querySelector('.btn-submit');

function validateForm() {
    let isValid = true;
    const formGroups = contactForm.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        const errorMessage = group.querySelector('.error-message');
        
        if (input && input.required && !input.value.trim()) {
            isValid = false;
            group.classList.add('error');
            
            if (!errorMessage) {
                const error = document.createElement('span');
                error.className = 'error-message';
                error.textContent = 'Ce champ est requis';
                group.appendChild(error);
            }
        } else if (input.type === 'email' && input.value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value)) {
                isValid = false;
                group.classList.add('error');
                
                if (!errorMessage) {
                    const error = document.createElement('span');
                    error.className = 'error-message';
                    error.textContent = 'Adresse email invalide';
                    group.appendChild(error);
                }
            }
        } else {
            group.classList.remove('error');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    });
    
    return isValid;
}

function showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Votre message a été envoyé avec succès !';
    
    contactForm.insertBefore(successMessage, contactForm.firstChild);
    
    setTimeout(() => {
        successMessage.remove();
    }, 5000);
}

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    submitButton.classList.add('loading');
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Reset form and show success message
        contactForm.reset();
        showSuccessMessage();
        
        // Generate ticket number
        const ticketNumber = Math.random().toString(36).substring(2, 10).toUpperCase();
        localStorage.setItem('lastTicket', ticketNumber);
        
    } catch (error) {
        console.error('Error submitting form:', error);
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Une erreur est survenue. Veuillez réessayer.';
        contactForm.insertBefore(errorMessage, contactForm.firstChild);
        
    } finally {
        submitButton.classList.remove('loading');
    }
});

// Real-time form validation
contactForm.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', () => {
        const formGroup = input.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        
        if (input.required && !input.value.trim()) {
            formGroup.classList.add('error');
        } else {
            formGroup.classList.remove('error');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    });
});

// Initialize Google Maps
function initMap() {
    const mapOptions = {
        center: { lat: 48.8566, lng: 2.3522 }, // Paris coordinates
        zoom: 15,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{"color": "#f5f5f5"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#616161"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#f5f5f5"}]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#bdbdbd"}]
            }
        ]
    };
    
    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
    
    // Add marker for office location
    const marker = new google.maps.Marker({
        position: mapOptions.center,
        map: map,
        title: 'FitnessWithRaph'
    });
}

// Chat Widget
const chatToggle = document.querySelector('.chat-toggle');
let chatWindow = null;

function createChatWindow() {
    const chat = document.createElement('div');
    chat.className = 'chat-window';
    chat.innerHTML = `
        <div class="chat-header">
            <h3>Chat en direct</h3>
            <button class="close-chat"><i class="fas fa-times"></i></button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input">
            <input type="text" placeholder="Tapez votre message...">
            <button><i class="fas fa-paper-plane"></i></button>
        </div>
    `;
    
    document.body.appendChild(chat);
    return chat;
}

chatToggle.addEventListener('click', () => {
    if (!chatWindow) {
        chatWindow = createChatWindow();
        
        const closeButton = chatWindow.querySelector('.close-chat');
        closeButton.addEventListener('click', () => {
            chatWindow.remove();
            chatWindow = null;
        });
    }
});

// Initialize map when Google Maps API is loaded
window.initMap = initMap;
