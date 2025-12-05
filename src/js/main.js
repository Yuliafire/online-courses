import '../scss/style.scss';

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.catalog__tabs-tab');
    const cards = document.querySelectorAll('.card');

    function filterCards(category) {
        cards.forEach(card => {
            const cardCategory = card.dataset.category;
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('catalog__tabs-tab--active'));
            tab.classList.add('catalog__tabs-tab--active');

            const category = tab.dataset.category;
            filterCards(category);
        });
    });

    filterCards('all');

    const allTab = document.querySelector('[data-category="all"]');
    if (allTab) {
        allTab.classList.add('catalog__tabs-tab--active');
    }
});
