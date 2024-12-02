document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.main-header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Ajoute la classe scrolled quand on défile vers le bas
        if (currentScroll > 0) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
});
