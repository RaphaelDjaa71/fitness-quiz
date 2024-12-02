document.addEventListener('DOMContentLoaded', function() {
    // Charger le footer
    fetch('/components/footer.html')
        .then(response => response.text())
        .then(data => {
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = data;
            }
        })
        .catch(error => console.error('Erreur lors du chargement du footer:', error));
});
