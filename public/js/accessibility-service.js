class AccessibilityService {
    constructor() {
        // Clés de stockage
        this.STORAGE_KEYS = {
            HIGH_CONTRAST: 'accessibility_high_contrast',
            FONT_SIZE: 'accessibility_font_size',
            SCREEN_READER: 'accessibility_screen_reader'
        };

        // Configuration par défaut
        this.defaultConfig = {
            highContrast: false,
            fontSize: 'medium',
            screenReaderMode: false
        };
    }

    // Initialiser le service d'accessibilité
    init() {
        // Charger la configuration
        const savedConfig = this.getAccessibilityConfig();
        
        // Appliquer la configuration
        this.applyAccessibilitySettings(savedConfig);
        
        // Créer le panneau d'accessibilité
        this.createAccessibilityPanel();
    }

    // Obtenir la configuration d'accessibilité
    getAccessibilityConfig() {
        const savedConfig = {
            highContrast: localStorage.getItem(this.STORAGE_KEYS.HIGH_CONTRAST) === 'true',
            fontSize: localStorage.getItem(this.STORAGE_KEYS.FONT_SIZE) || this.defaultConfig.fontSize,
            screenReaderMode: localStorage.getItem(this.STORAGE_KEYS.SCREEN_READER) === 'true'
        };

        return { ...this.defaultConfig, ...savedConfig };
    }

    // Appliquer les paramètres d'accessibilité
    applyAccessibilitySettings(config) {
        // Mode contraste élevé
        if (config.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }

        // Taille de police
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${config.fontSize}`);

        // Mode lecteur d'écran
        if (config.screenReaderMode) {
            document.body.setAttribute('aria-busy', 'true');
            this.enhanceScreenReaderExperience();
        } else {
            document.body.removeAttribute('aria-busy');
        }
    }

    // Améliorer l'expérience du lecteur d'écran
    enhanceScreenReaderExperience() {
        // Ajouter des descriptions ARIA
        const elementsToDescribe = document.querySelectorAll('main, section, article');
        elementsToDescribe.forEach(element => {
            if (!element.getAttribute('aria-label')) {
                const heading = element.querySelector('h1, h2, h3');
                if (heading) {
                    element.setAttribute('aria-label', heading.textContent);
                }
            }
        });

        // Ajouter des descriptions pour les images
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            img.setAttribute('alt', 'Image sans description');
        });

        // Améliorer la navigation
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.setAttribute('role', 'main');
            mainContent.setAttribute('aria-label', 'Contenu principal');
        }
    }

    // Créer le panneau d'accessibilité
    createAccessibilityPanel() {
        // Créer le conteneur du panneau
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.classList.add('accessibility-panel');
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-label', 'Paramètres d\'accessibilité');

        // Style CSS embarqué
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 15px;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;

        // Contraste élevé
        const highContrastToggle = this.createToggle(
            'Contraste élevé', 
            this.STORAGE_KEYS.HIGH_CONTRAST,
            'Activer/désactiver le mode contraste élevé'
        );
        panel.appendChild(highContrastToggle);

        // Taille de police
        const fontSizeSelect = this.createFontSizeSelector();
        panel.appendChild(fontSizeSelect);

        // Mode lecteur d'écran
        const screenReaderToggle = this.createToggle(
            'Mode lecteur d\'écran', 
            this.STORAGE_KEYS.SCREEN_READER,
            'Activer/désactiver le mode lecteur d\'écran'
        );
        panel.appendChild(screenReaderToggle);

        // Ajouter au document
        document.body.appendChild(panel);
    }

    // Créer un bouton à bascule
    createToggle(label, storageKey, description) {
        const container = document.createElement('div');
        container.classList.add('accessibility-toggle');
        container.style.marginBottom = '10px';

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.style.marginRight = '10px';

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = localStorage.getItem(storageKey) === 'true';
        toggle.setAttribute('aria-label', description);

        // Événement de changement
        toggle.addEventListener('change', (e) => {
            localStorage.setItem(storageKey, e.target.checked);
            this.init(); // Réappliquer les paramètres
        });

        container.appendChild(labelElement);
        container.appendChild(toggle);

        return container;
    }

    // Créer un sélecteur de taille de police
    createFontSizeSelector() {
        const container = document.createElement('div');
        container.classList.add('accessibility-font-size');
        container.style.marginBottom = '10px';

        const label = document.createElement('label');
        label.textContent = 'Taille de police';
        label.style.marginRight = '10px';

        const select = document.createElement('select');
        select.setAttribute('aria-label', 'Sélectionner la taille de police');

        const sizes = [
            { value: 'small', label: 'Petite' },
            { value: 'medium', label: 'Moyenne' },
            { value: 'large', label: 'Grande' }
        ];

        sizes.forEach(sizeOption => {
            const option = document.createElement('option');
            option.value = sizeOption.value;
            option.textContent = sizeOption.label;
            option.selected = localStorage.getItem(this.STORAGE_KEYS.FONT_SIZE) === sizeOption.value;
            select.appendChild(option);
        });

        // Événement de changement
        select.addEventListener('change', (e) => {
            localStorage.setItem(this.STORAGE_KEYS.FONT_SIZE, e.target.value);
            this.init(); // Réappliquer les paramètres
        });

        container.appendChild(label);
        container.appendChild(select);

        return container;
    }

    // Ajouter des raccourcis clavier
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + C : Basculer le contraste
            if (e.altKey && e.key === 'c') {
                const highContrastToggle = document.querySelector('#accessibility-panel input[type="checkbox"]');
                if (highContrastToggle) {
                    highContrastToggle.click();
                }
            }

            // Alt + F : Changer la taille de police
            if (e.altKey && e.key === 'f') {
                const fontSizeSelect = document.querySelector('#accessibility-panel select');
                if (fontSizeSelect) {
                    const currentIndex = fontSizeSelect.selectedIndex;
                    const nextIndex = (currentIndex + 1) % fontSizeSelect.options.length;
                    fontSizeSelect.selectedIndex = nextIndex;
                    fontSizeSelect.dispatchEvent(new Event('change'));
                }
            }
        });
    }
}

// Instancier et exposer le service d'accessibilité
window.accessibilityService = new AccessibilityService();

// Initialiser le service lors du chargement du document
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityService.init();
    window.accessibilityService.setupKeyboardShortcuts();
});
