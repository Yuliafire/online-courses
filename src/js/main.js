import '../scss/style.scss';

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.catalog__tabs-tab');
    const cards = document.querySelectorAll('.card');
    const searchInput = document.querySelector('#searchInput'); 

    let currentCategory = 'all'; 

    function filterCards() {
        const searchValue = searchInput.value.trim().toLowerCase();

        cards.forEach(card => {
            const cardCategory = card.dataset.category || '';
            const cardTitle = card.querySelector('.card__title')?.textContent.toLowerCase() || '';

            const matchesCategory = currentCategory === 'all' || cardCategory === currentCategory;
            const matchesSearch = cardTitle.includes(searchValue);

            card.style.display = (matchesCategory && matchesSearch) ? 'flex' : 'none';
        });
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('catalog__tabs-tab--active'));
            tab.classList.add('catalog__tabs-tab--active');

            currentCategory = tab.dataset.category;
            filterCards();
        });
    });

    searchInput.addEventListener('input', filterCards);

    const allTab = document.querySelector('[data-category="all"]');
    if (allTab) allTab.classList.add('catalog__tabs-tab--active');

    currentCategory = 'all';
    filterCards();
});
