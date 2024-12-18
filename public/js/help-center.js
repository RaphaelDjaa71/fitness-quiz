// Search Functionality
const searchInput = document.getElementById('helpSearch');
const searchSuggestions = document.getElementById('searchSuggestions');

// Mock data for search suggestions
const searchData = [
    { title: "Comment modifier mon programme ?", category: "FAQ" },
    { title: "Problèmes de connexion", category: "Support" },
    { title: "Annuler mon abonnement", category: "Compte" },
    { title: "Suivi des progrès", category: "Tutoriels" }
];

searchInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    
    if (value.length > 2) {
        const filteredResults = searchData.filter(item => 
            item.title.toLowerCase().includes(value)
        );
        
        showSuggestions(filteredResults);
    } else {
        searchSuggestions.style.display = 'none';
    }
});

function showSuggestions(results) {
    if (results.length === 0) {
        searchSuggestions.style.display = 'none';
        return;
    }

    searchSuggestions.innerHTML = results.map(result => `
        <div class="suggestion-item">
            <span class="suggestion-title">${result.title}</span>
            <span class="suggestion-category">${result.category}</span>
        </div>
    `).join('');

    searchSuggestions.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function() {
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const currentlyActive = document.querySelector('.faq-item.active');
            if (currentlyActive && currentlyActive !== item) {
                currentlyActive.classList.remove('active');
            }
            item.classList.toggle('active');
        });
    });

    // Search Functionality
    const helpTopics = [
        "Comment personnaliser mon programme",
        "Comment suivre mes progrès",
        "Comment modifier mon abonnement",
        "Comment contacter un coach",
        "Comment accéder à mes séances d'entraînement",
        "Comment mettre à jour mes informations",
        "Comment annuler mon abonnement",
        "Comment réinitialiser mon mot de passe"
    ];

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        searchSuggestions.innerHTML = '';
        
        if (searchTerm.length < 2) {
            searchSuggestions.style.display = 'none';
            return;
        }

        const matches = helpTopics.filter(topic => 
            topic.toLowerCase().includes(searchTerm)
        );

        if (matches.length > 0) {
            matches.forEach(match => {
                const div = document.createElement('div');
                div.className = 'search-suggestion';
                div.textContent = match;
                div.addEventListener('click', () => {
                    searchInput.value = match;
                    searchSuggestions.style.display = 'none';
                });
                searchSuggestions.appendChild(div);
            });
            searchSuggestions.style.display = 'block';
        } else {
            searchSuggestions.style.display = 'none';
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target)) {
            searchSuggestions.style.display = 'none';
        }
    });

    // Category Cards Hover Effect
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});

// Chatbot functionality
const chatbotMessages = document.getElementById('chatbotMessages');
const chatInput = document.querySelector('.chatbot-input input');
const chatSendButton = document.querySelector('.chatbot-input button');
const minimizeBtn = document.querySelector('.minimize-btn');

// Mock responses for the chatbot
const chatbotResponses = {
    default: "Je suis désolé, je ne comprends pas votre question. Pourriez-vous la reformuler ?",
    greeting: ["Bonjour !", "Salut ! Comment puis-je vous aider ?"],
    program: "Pour modifier votre programme, rendez-vous dans la section 'Mon Programme' et cliquez sur 'Personnaliser'.",
    password: "Pour réinitialiser votre mot de passe, cliquez sur 'Mot de passe oublié' sur la page de connexion.",
    subscription: "Vous pouvez gérer votre abonnement dans les paramètres de votre compte."
};

function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = message;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function getBotResponse(message) {
    message = message.toLowerCase();
    
    if (message.includes('bonjour') || message.includes('salut')) {
        return chatbotResponses.greeting[Math.floor(Math.random() * chatbotResponses.greeting.length)];
    } else if (message.includes('programme')) {
        return chatbotResponses.program;
    } else if (message.includes('mot de passe')) {
        return chatbotResponses.password;
    } else if (message.includes('abonnement')) {
        return chatbotResponses.subscription;
    }
    
    return chatbotResponses.default;
}

function handleChatSubmit() {
    const message = chatInput.value.trim();
    if (message) {
        addMessage(message, true);
        chatInput.value = '';
        
        // Simulate typing indicator
        setTimeout(() => {
            const response = getBotResponse(message);
            addMessage(response);
        }, 1000);
    }
}

chatSendButton.addEventListener('click', handleChatSubmit);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleChatSubmit();
    }
});

minimizeBtn.addEventListener('click', () => {
    const chatbotWidget = document.getElementById('chatbotWidget');
    chatbotWidget.classList.toggle('minimized');
});
