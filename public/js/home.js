document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer pour les animations au scroll
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Une fois animé, on arrête d'observer
            }
        });
    }, observerOptions);

    // Observer les sections pour les animations
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Parallax effet sur l'image hero
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        window.addEventListener('scroll', () => {
            if (window.matchMedia('(min-width: 768px)').matches) {
                const scrolled = window.pageYOffset;
                const rate = scrolled * 0.3;
                heroImage.style.transform = `translate3d(0, ${-rate}px, 0)`;
            }
        });
    }

    // Animation smooth scroll pour les ancres
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animation du quiz preview
    const quizAnimation = document.querySelector('.quiz-animation');
    if (quizAnimation) {
        const questions = [
            "Quel est votre niveau d'expérience ?",
            "Quels sont vos objectifs ?",
            "Combien de temps pouvez-vous consacrer à l'entraînement ?",
            "Analysons vos réponses..."
        ];

        let currentQuestion = 0;

        function animateQuestions() {
            if (currentQuestion < questions.length) {
                quizAnimation.innerHTML = `
                    <div class="quiz-question" style="animation: slideIn 0.5s ease-out">
                        <p>${questions[currentQuestion]}</p>
                        <div class="progress-bar">
                            <div style="width: ${(currentQuestion + 1) * 25}%"></div>
                        </div>
                    </div>
                `;
                currentQuestion = (currentQuestion + 1) % questions.length;
            }
        }

        // Démarrer l'animation toutes les 3 secondes
        animateQuestions();
        setInterval(animateQuestions, 3000);
    }

    // Gestion des FAQ
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            const content = item.querySelector('p');
            if (content) {
                content.style.maxHeight = item.open ? `${content.scrollHeight}px` : '0';
            }
        });
    });
});
