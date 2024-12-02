class ImageOptimizer {
    constructor() {
        this.imageCache = new Map();
        this.observer = null;
        this.initLazyLoading();
    }

    initLazyLoading() {
        // Configuration de l'Intersection Observer
        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, options);

        // Observer toutes les images avec l'attribut data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.observer.observe(img);
        });
    }

    async loadImage(img) {
        const src = img.dataset.src;
        
        try {
            // Vérifier si l'image est déjà en cache
            if (this.imageCache.has(src)) {
                img.src = this.imageCache.get(src);
                return;
            }

            // Charger et optimiser l'image
            const response = await fetch(src);
            const blob = await response.blob();
            
            // Créer un canvas pour l'optimisation
            const bitmap = await createImageBitmap(blob);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Définir les dimensions optimales
            const maxWidth = img.dataset.maxWidth || 800;
            const maxHeight = img.dataset.maxHeight || 600;
            let { width, height } = this.calculateAspectRatioFit(
                bitmap.width,
                bitmap.height,
                maxWidth,
                maxHeight
            );

            canvas.width = width;
            canvas.height = height;

            // Dessiner l'image redimensionnée
            ctx.drawImage(bitmap, 0, 0, width, height);

            // Convertir en format optimisé
            const optimizedDataUrl = canvas.toDataURL('image/webp', 0.85);
            
            // Mettre en cache et afficher l'image
            this.imageCache.set(src, optimizedDataUrl);
            img.src = optimizedDataUrl;

            // Ajouter une classe pour l'animation de fade-in
            img.classList.add('loaded');

        } catch (error) {
            console.error('Erreur lors du chargement de l\'image:', error);
            img.src = src; // Fallback vers l'image originale
        }
    }

    calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return {
            width: srcWidth * ratio,
            height: srcHeight * ratio
        };
    }

    preloadImages(urls) {
        urls.forEach(url => {
            const img = new Image();
            img.src = url;
            this.loadImage(img);
        });
    }
}

window.imageOptimizer = {
    /**
     * Configure les images pour un chargement optimal
     */
    optimizeImages() {
        // Lazy loading pour toutes les images non critiques
        this.setupLazyLoading();
        
        // Préchargement des images critiques
        this.preloadCriticalImages();
        
        // Gestion des erreurs de chargement
        this.handleLoadingErrors();
    },

    /**
     * Configure le lazy loading pour les images
     */
    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback pour les navigateurs plus anciens
            images.forEach(img => this.loadImage(img));
        }
    },

    /**
     * Charge une image en utilisant son attribut data-src
     */
    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        img.src = src;
        img.removeAttribute('data-src');
    },

    /**
     * Précharge les images critiques pour la performance
     */
    preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('img[data-critical="true"]');
        
        criticalImages.forEach(img => {
            const src = img.getAttribute('data-src') || img.src;
            if (src) {
                const preloadLink = document.createElement('link');
                preloadLink.rel = 'preload';
                preloadLink.as = 'image';
                preloadLink.href = src;
                document.head.appendChild(preloadLink);
            }
        });
    },

    /**
     * Gère les erreurs de chargement des images
     */
    handleLoadingErrors() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            img.addEventListener('error', () => {
                // Afficher une image de fallback
                img.src = 'images/placeholder.svg';
                img.classList.add('image-error');
                
                console.warn(`Erreur de chargement de l'image: ${img.src}`);
            });
        });
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.imageOptimizer.optimizeImages();
});
