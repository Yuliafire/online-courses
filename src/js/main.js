import '../scss/style.scss';

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const loadMoreBtn = document.getElementById('loadMore');
    const tabs = document.querySelectorAll('.catalog__tabs-tab');
    const searchInput = document.getElementById('searchInput');
    const PER_PAGE = 9;

    const categorySlugMap = {
        'all': 'all',
        'marketing': 'marketing',
        'management': 'management',
        'hr-recruiting': 'HR & Recruiting',
        'design': 'design',
        'development': 'development'
    };

    let allCourses = [];
    let displayedCount = 0;
    let currentCategory = 'all';
    let currentSearch = '';
    let isInitialLoad = true;

    const getFiltersFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('category') || 'all';
        const search = params.get('search') || '';

        currentCategory = category;
        currentSearch = search.toLowerCase().trim();
        searchInput.value = search;

        tabs.forEach(t => t.classList.remove('catalog__tabs-tab--active'));
        const targetTab = document.querySelector(`[data-category="${category}"]`) ||
            document.querySelector('[data-category="all"]');
        targetTab.classList.add('catalog__tabs-tab--active');
    };

    const updateURL = (replace = false) => {
        const params = new URLSearchParams();
        if (currentCategory !== 'all') params.set('category', currentCategory);
        if (currentSearch.trim()) params.set('search', currentSearch.trim());

        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;

        const state = {
            category: currentCategory,
            search: currentSearch,
            displayedCount: displayedCount,
            scrollPosition: window.scrollY,
            timestamp: Date.now()
        };

        if (replace) {
            window.history.replaceState(state, '', newUrl);
        } else {
            if (!isInitialLoad) {
                window.history.pushState(state, '', newUrl);
            }
        }
    };

    window.addEventListener('popstate', (e) => {
        if (e.state) {
            currentCategory = e.state.category || 'all';
            currentSearch = (e.state.search || '').toLowerCase().trim();
            displayedCount = e.state.displayedCount || 0;
            searchInput.value = e.state.search || '';
        } else {
            getFiltersFromURL();
            displayedCount = 0;
        }

        tabs.forEach(t => t.classList.remove('catalog__tabs-tab--active'));
        const tab = document.querySelector(`[data-category="${currentCategory}"]`) ||
            document.querySelector('[data-category="all"]');
        if (tab) {
            tab.classList.add('catalog__tabs-tab--active');
        }

        applyFilters(true); 
    });

    const initActiveTab = () => {
        tabs.forEach(t => t.classList.remove('catalog__tabs-tab--active'));
        const allTab = document.querySelector('[data-category="all"]');
        if (allTab) {
            allTab.classList.add('catalog__tabs-tab--active');
        }
    };

    const clearGrid = () => {
        while (grid.firstChild) grid.firstChild.remove();
    };

    const categoryToSlug = (category) => {
        return category
            .toLowerCase()
            .replaceAll('&', 'and')
            .replaceAll(/\s+/g, '-')
            .replaceAll(/[^a-z0-9-]/g, '');
    };

    const createCard = (course) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.dataset.category = categoryToSlug(course.category);

        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'card__image-wrapper';
        const img = document.createElement('img');
        img.src = course.image;
        img.alt = course.instructor;
        img.className = 'card__image';
        img.loading = 'lazy';
        imgWrapper.appendChild(img);

        const content = document.createElement('div');
        content.className = 'card__content';

        const tag = document.createElement('span');
        const slug = categoryToSlug(course.category);
        tag.className = `card__tag card__tag--${slug}`;
        tag.textContent = course.category.replaceAll(/\b\w/g, c => c.toUpperCase());

        const title = document.createElement('h3');
        title.className = 'card__title';
        title.textContent = course.title;

        const footer = document.createElement('div');
        footer.className = 'card__footer';
        const price = document.createElement('p');
        price.className = 'card__price';
        price.textContent = `$${course.price}`;
        const instructor = document.createElement('p');
        instructor.className = 'card__instructor';
        instructor.textContent = `| by ${course.instructor}`;
        footer.append(price, instructor);

        content.append(tag, title, footer);
        card.append(imgWrapper, content);
        return card;
    };

    const getVisibleCourses = () => {
        let filtered = allCourses;

        if (currentCategory !== 'all') {
            const fullCategory = categorySlugMap[currentCategory];
            filtered = filtered.filter(c => c.category === fullCategory);
        }

        if (currentSearch) {
            filtered = filtered.filter(c =>
                c.title.toLowerCase().includes(currentSearch) ||
                c.instructor.toLowerCase().includes(currentSearch) ||
                c.category.toLowerCase().includes(currentSearch)
            );
        }
        return filtered;
    };

    const renderCards = (courses, isPopState = false) => {
        clearGrid();
        courses.forEach(course => grid.appendChild(createCard(course)));

        if (!isPopState) {
            displayedCount = courses.length;
        }

        const visibleCount = getVisibleCourses().length;
        loadMoreBtn.style.display = displayedCount >= visibleCount ? 'none' : 'block';
    };

    const updateTabCounts = () => {
        const isSearching = currentSearch !== '';
        tabs.forEach(tab => {
            const slug = tab.dataset.category;
            const sup = tab.querySelector('.catalog__tabs-count');
            if (!sup) return;

            let count;
            if (slug === 'all') {
                count = allCourses.length;
            } else {
                const full = categorySlugMap[slug];
                count = allCourses.filter(c => c.category === full).length;
            }

            if (isSearching && slug === currentCategory) {
                count = getVisibleCourses().length;
            }
            sup.textContent = count;
        });
    };

    const applyFilters = (isPopState = false) => {
        const visible = getVisibleCourses();

        if (isPopState && displayedCount > PER_PAGE) {
            renderCards(visible.slice(0, displayedCount), true);
        } else {
            renderCards(visible.slice(0, PER_PAGE));
        }

        updateTabCounts();

        if (!isPopState) {
            updateURL(); 
        }
    };

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    fetch('/data.json')
        .then(r => {
            if (!r.ok) throw new Error('Failed to load data');
            return r.json();
        })
        .then(data => {
            allCourses = data.courses;

            if (window.history.state) {
                const state = window.history.state;
                currentCategory = state.category || 'all';
                currentSearch = (state.search || '').toLowerCase().trim();
                displayedCount = state.displayedCount || 0;
                searchInput.value = state.search || '';

                tabs.forEach(t => t.classList.remove('catalog__tabs-tab--active'));
                const tab = document.querySelector(`[data-category="${currentCategory}"]`) ||
                    document.querySelector('[data-category="all"]');
                if (tab) tab.classList.add('catalog__tabs-tab--active');
            } else {
                getFiltersFromURL();

                if (!window.location.search) {
                    initActiveTab();
                }
            }

            applyFilters();

            if (!window.history.state) {
                updateURL(true); 
            }

            isInitialLoad = false;
        })
        .catch(err => console.error('Error loading courses:', err));

    tabs.forEach(tab => {
        tab.addEventListener('click', e => {
            e.preventDefault();

            if (tab.classList.contains('catalog__tabs-tab--active')) return;

            tabs.forEach(t => t.classList.remove('catalog__tabs-tab--active'));
            tab.classList.add('catalog__tabs-tab--active');
            currentCategory = tab.dataset.category;
            currentSearch = '';
            searchInput.value = '';
            displayedCount = 0;
            applyFilters();
        });
    });

    const handleSearch = () => {
        currentSearch = searchInput.value.trim().toLowerCase();
        displayedCount = 0;
        applyFilters();
    };

    searchInput.addEventListener('input', debounce(handleSearch, 300));

    loadMoreBtn.addEventListener('click', () => {
        const visible = getVisibleCourses();
        const next = visible.slice(displayedCount, displayedCount + PER_PAGE);
        next.forEach(c => grid.appendChild(createCard(c)));
        displayedCount += next.length;

        if (displayedCount >= visible.length) {
            loadMoreBtn.style.display = 'none';
        }

        updateURL();
    });

    const scrollBtn = document.getElementById('scrollToTopBtn');
    const handleScroll = () => {
        if (window.innerWidth <= 768) {
            scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
        } else {
            scrollBtn.style.display = 'none';
        }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    handleScroll();
});