/* ============================================
   PageLab Showcase - Gallery Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const sidebarItems = document.querySelectorAll('.sidebar__item');
  const filterTags = document.querySelectorAll('.filter-tag');
  const sectionCards = document.querySelectorAll('.section-card');
  const searchInput = document.getElementById('searchInput');
  const campaignSelect = document.getElementById('campaignSelect');

  // Restore scroll position if coming back from detail page
  const savedScrollPosition = sessionStorage.getItem('galleryScrollPosition');
  if (savedScrollPosition) {
    window.scrollTo(0, parseInt(savedScrollPosition, 10));
    sessionStorage.removeItem('galleryScrollPosition');
  }

  // Save scroll position when clicking a card link
  sectionCards.forEach(card => {
    if (card.tagName === 'A') {
      card.addEventListener('click', () => {
        sessionStorage.setItem('galleryScrollPosition', window.scrollY.toString());
      });
    }
  });

  // Current filters
  let currentType = 'all';
  let currentLayout = 'all';
  let currentSearch = '';

  // Filter functions
  function filterCards() {
    const visibleCategories = new Set();

    sectionCards.forEach(card => {
      const type = card.dataset.type;
      const layout = card.dataset.layout;
      const name = card.querySelector('.section-card__name').textContent.toLowerCase();
      const tag = card.querySelector('.section-card__tag')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.section-card__desc')?.textContent.toLowerCase() || '';
      const searchText = `${name} ${tag} ${desc}`;

      const matchType = currentType === 'all' || type === currentType;
      const matchLayout = currentLayout === 'all' || layout === currentLayout;
      const matchSearch = currentSearch === '' || searchText.includes(currentSearch.toLowerCase());

      if (matchType && matchLayout && matchSearch) {
        card.style.display = '';
        visibleCategories.add(type);
      } else {
        card.style.display = 'none';
      }
    });

    // Show/hide section dividers based on visible cards
    const sectionDividers = document.querySelectorAll('.section-divider');
    sectionDividers.forEach(divider => {
      const category = divider.dataset.category;
      if (visibleCategories.has(category)) {
        divider.style.display = '';
      } else {
        divider.style.display = 'none';
      }
    });

    updateCounts();
  }

  function updateCounts() {
    const counts = {};
    let total = 0;

    sectionCards.forEach(card => {
      const type = card.dataset.type;
      const isVisible = card.style.display !== 'none';

      if (!counts[type]) counts[type] = 0;

      // Count based on layout and search filter only (for sidebar counts)
      const layout = card.dataset.layout;
      const name = card.querySelector('.section-card__name').textContent.toLowerCase();
      const tag = card.querySelector('.section-card__tag')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.section-card__desc')?.textContent.toLowerCase() || '';
      const searchText = `${name} ${tag} ${desc}`;
      const matchLayout = currentLayout === 'all' || layout === currentLayout;
      const matchSearch = currentSearch === '' || searchText.includes(currentSearch.toLowerCase());

      if (matchLayout && matchSearch) {
        counts[type]++;
        total++;
      }
    });

    // Update sidebar counts
    sidebarItems.forEach(item => {
      const filter = item.dataset.filter;
      const countEl = item.querySelector('.sidebar__count');
      if (countEl) {
        if (filter === 'all') {
          countEl.textContent = total;
        } else {
          countEl.textContent = counts[filter] || 0;
        }
      }
    });
  }

  // Sidebar click handler
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      sidebarItems.forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
      currentType = item.dataset.filter;
      filterCards();
    });
  });

  // Filter tag click handler
  filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
      filterTags.forEach(t => t.classList.remove('is-active'));
      tag.classList.add('is-active');
      currentLayout = tag.dataset.layout;
      filterCards();
    });
  });

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim();
      filterCards();
    });
  }

  // Campaign switcher
  if (campaignSelect) {
    campaignSelect.addEventListener('change', (e) => {
      const value = e.target.value;
      if (value) {
        document.body.setAttribute('data-campaign', value);
      } else {
        document.body.removeAttribute('data-campaign');
      }
    });
  }

  // Section card click handler (navigate to detail)
  sectionCards.forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.type;
      const name = card.querySelector('.section-card__name').textContent;
      const slug = name.toLowerCase().replace(/\s+-\s+/g, '-').replace(/\s+/g, '-');

      // Navigate to section detail page
      // window.location.href = `sections/${type}/${slug}.html`;
      console.log(`Navigate to: sections/${type}/${slug}.html`);
    });
  });

  // Initial filter and count update
  filterCards();

  // ============================================
  // Scroll Spy - Highlight current section in sidebar
  // ============================================
  const sectionDividers = document.querySelectorAll('.section-divider');

  function updateScrollSpy() {
    // Only update if viewing "all" sections
    if (currentType !== 'all') return;

    const scrollPosition = window.scrollY + 150; // Offset for header
    let currentCategory = null;

    // Find the current visible section divider
    sectionDividers.forEach(divider => {
      if (divider.style.display === 'none') return;

      const dividerTop = divider.offsetTop;
      if (scrollPosition >= dividerTop) {
        currentCategory = divider.dataset.category;
      }
    });

    // Update sidebar active state
    if (currentCategory) {
      sidebarItems.forEach(item => {
        if (item.dataset.filter === currentCategory) {
          item.classList.add('is-current');
        } else {
          item.classList.remove('is-current');
        }
      });
    } else {
      // At the top, highlight "All"
      sidebarItems.forEach(item => {
        if (item.dataset.filter === 'all') {
          item.classList.add('is-current');
        } else {
          item.classList.remove('is-current');
        }
      });
    }
  }

  // Throttle scroll event
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
      updateScrollSpy();
      scrollTimeout = null;
    }, 100);
  });

  // Initial scroll spy update
  updateScrollSpy();
});
