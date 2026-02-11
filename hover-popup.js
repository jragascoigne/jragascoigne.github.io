document.addEventListener('DOMContentLoaded', () => {
    const popups = document.querySelectorAll('.hover-popup');

    popups.forEach(popup => {
        popup.addEventListener('mouseenter', () => {
            const rect = popup.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            if (rect.top < viewportHeight / 2) {
                popup.classList.remove('show-above');
                popup.classList.add('show-below');
            } else {
                popup.classList.remove('show-below');
                popup.classList.add('show-above');
            }
        });
    });
});