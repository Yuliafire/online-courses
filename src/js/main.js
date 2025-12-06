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

    const initActiveTab = () => {
        const allTab = document.querySelector('[data-category="all"]');

        if (!allTab) return;

        tabs.forEach(tab => {
            tab.classList.remove('catalog__tabs-tab--active');
            allTab.classList.add('catalog__tabs-tab--active');
        });
    }


    const clearGrid = () => {
        while (grid.firstChild) {
            grid.firstChild.remove();
        }
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
        tag.textContent = course.category.replace(/\b\w/g, char => char.toUpperCase());

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

    const renderCards = (courses) => {
        clearGrid();
        courses.forEach(course => grid.appendChild(createCard(course)));
        displayedCount = courses.length;
        loadMoreBtn.style.display = displayedCount >= getVisibleCourses().length ? 'none' : 'block';
    };

    const updateTabCounts = () => {
        const isSearching = currentSearch !== '';

        tabs.forEach(tab => {
            const categorySlug = tab.dataset.category;
            const sup = tab.querySelector('.catalog__tabs-count');
            if (!sup) return;

            if (categorySlug === currentCategory && isSearching) {
                const visible = getVisibleCourses();
                sup.textContent = visible.length;
            } else if (categorySlug === 'all') {
                sup.textContent = allCourses.length;
            } else {
                const fullCategory = categorySlugMap[categorySlug];
                const total = allCourses.filter(c => c.category === fullCategory).length;
                sup.textContent = total;
            }
        });
    };

    const applyFilters = () => {
        const visible = getVisibleCourses();
        renderCards(visible.slice(0, PER_PAGE));
        updateTabCounts();
    };

    const debounce = (func, delay) => {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(func, delay);
        };
    };

    fetch('/data.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            allCourses = data.courses;
            initActiveTab();
            applyFilters();
        })
        .catch(error => {
            console.error('Error loading courses:', error);
        });

    tabs.forEach(tab => {
        tab.addEventListener('click', e => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('catalog__tabs-tab--active'));
            tab.classList.add('catalog__tabs-tab--active');
            currentCategory = tab.dataset.category;
            currentSearch = '';
            searchInput.value = '';
            displayedCount = 0;
            applyFilters();
        });
    });

    searchInput.addEventListener('input', debounce(() => {
        currentSearch = searchInput.value.trim().toLowerCase();
        displayedCount = 0;
        applyFilters();
    }, 300));

    loadMoreBtn.addEventListener('click', () => {
        const visible = getVisibleCourses();
        const next = visible.slice(displayedCount, displayedCount + PER_PAGE);
        next.forEach(c => grid.appendChild(createCard(c)));
        displayedCount += next.length;

        if (displayedCount >= visible.length) {
            loadMoreBtn.style.display = 'none';
        }
    });

    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    function handleScroll() {
        if (window.innerWidth <= 768) {
            if (window.scrollY > 300) {
                scrollToTopBtn.style.display = "block";
            } else {
                scrollToTopBtn.style.display = "none";
            }
        } else {
            scrollToTopBtn.style.display = "none";
        }
    }

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    scrollToTopBtn.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });

    handleScroll();
});
