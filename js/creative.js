/**
 * Section Creative - Interactive Page Builder
 * Allows users to select, combine, edit, and export sections
 */

class SectionCreative {
  constructor() {
    this.sections = [];
    this.sectionId = 0;
    this.currentDevice = 'pc';
    this.currentTheme = 'light';
    this.headerSection = null;
    this.footerSection = null;

    // Section file mappings
    this.sectionFiles = {
      'navigation-gnb': 'sections/navigation/type-a-gnb-footer.html',
      'navigation-footer': 'sections/navigation/type-a-gnb-footer.html',
      'hero-type-a-split': 'sections/hero/type-a-split.html',
      'hero-type-b-center': 'sections/hero/type-b-center.html',
      'hero-type-c-full': 'sections/hero/type-c-full.html',
      'intro-type-a-textblock': 'sections/intro/type-a-textblock.html',
      'intro-type-b-textgrid': 'sections/intro/type-b-textgrid.html',
      'intro-type-c-img': 'sections/intro/type-c-img.html',
      'about-type-a-list': 'sections/about/type-a-list.html',
      'about-type-b-grid': 'sections/about/type-b-grid.html',
      'about-type-c-card-slide': 'sections/about/type-c-card-slide.html',
      'about-type-d-card-swipe': 'sections/about/type-d-card-swipe.html',
      'about-type-e-tab': 'sections/about/type-e-tab.html',
      'about-type-f-image': 'sections/about/type-f-image.html',
      'benefit-type-a-plus': 'sections/benefit/type-a-plus.html',
      'benefit-type-b-img': 'sections/benefit/type-b-img.html',
      'step-type-a-img': 'sections/step/type-a-img.html',
      'step-type-b-text': 'sections/step/type-b-text.html',
      'review-type-a-highlight': 'sections/review/type-a-highlight.html',
      'review-type-b-card-grid': 'sections/review/type-b-card-grid.html',
      'review-type-c-card-slider': 'sections/review/type-c-card-slider.html',
      'faq-index': 'sections/faq/index.html',
      'cta-type-a-finish': 'sections/cta/type-a-finish.html',
      'cta-type-b-floating': 'sections/cta/type-b-floating.html',
    };

    // Section display names
    this.sectionNames = {
      'navigation': '네비게이션',
      'hero': '메인 비주얼',
      'intro': '인트로',
      'about': '콘텐츠 설명',
      'benefit': '혜택 안내',
      'step': '이용 방법',
      'review': '고객 후기',
      'faq': 'FAQ',
      'cta': '전환 유도',
    };

    this.init();
  }

  init() {
    this.bindElements();
    this.bindEvents();
    this.openAllCategories();
  }

  bindElements() {
    this.previewContent = document.getElementById('previewContent');
    this.mainContent = document.getElementById('mainContent');
    this.headerSlot = document.getElementById('headerSlot');
    this.footerSlot = document.getElementById('footerSlot');
    this.emptyState = document.getElementById('emptyState');
    this.layersList = document.getElementById('layersList');
    this.layersEmpty = document.getElementById('layersEmpty');
    this.sectionCount = document.getElementById('sectionCount');
    this.previewCanvas = document.getElementById('previewCanvas');
  }

  bindEvents() {
    // Category toggle
    document.querySelectorAll('.creative__category-header').forEach(header => {
      header.addEventListener('click', () => this.toggleCategory(header));
    });

    // Section item click - add section
    document.querySelectorAll('.creative__item').forEach(item => {
      item.addEventListener('click', () => this.addSection(item));
    });

    // Device switcher
    document.querySelectorAll('.creative__device-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchDevice(btn.dataset.device));
    });

    // Theme switcher
    document.querySelectorAll('.creative__theme-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTheme(btn.dataset.theme));
    });

    // Reset button
    document.getElementById('resetBtn')?.addEventListener('click', () => this.reset());

    // Export buttons
    document.getElementById('exportImageBtn')?.addEventListener('click', () => this.exportImage());
    document.getElementById('exportTextBtn')?.addEventListener('click', () => this.exportText());
  }

  openAllCategories() {
    document.querySelectorAll('.creative__category').forEach(cat => {
      cat.classList.add('is-open');
    });
  }

  toggleCategory(header) {
    const category = header.closest('.creative__category');
    category.classList.toggle('is-open');
  }

  async addSection(item) {
    const type = item.dataset.type;
    const variant = item.dataset.variant;
    const key = `${type}-${variant}`;
    const filePath = this.sectionFiles[key];

    if (!filePath) {
      console.error('Section file not found:', key);
      return;
    }

    // Check if this is a fixed section (header or footer)
    const isHeader = type === 'navigation' && variant === 'gnb';
    const isFooter = type === 'navigation' && variant === 'footer';

    // Prevent adding if already exists
    if (isHeader && this.headerSection) {
      alert('헤더는 한 개만 추가할 수 있습니다.');
      return;
    }
    if (isFooter && this.footerSection) {
      alert('푸터는 한 개만 추가할 수 있습니다.');
      return;
    }

    try {
      // Show loading state on button
      item.classList.add('is-loading');

      const html = await this.loadSectionHTML(filePath, type, variant);

      if (html) {
        const id = ++this.sectionId;
        const section = {
          id,
          type,
          variant,
          name: item.querySelector('.creative__item-name').textContent,
          html,
          isFixed: isHeader || isFooter
        };

        if (isHeader) {
          this.headerSection = section;
          this.renderFixedSection(section, 'header');
        } else if (isFooter) {
          this.footerSection = section;
          this.renderFixedSection(section, 'footer');
        } else {
          this.sections.push(section);
          this.renderSection(section);
        }

        this.updateLayersList();
        this.updateUI();
      }
    } catch (error) {
      console.error('Failed to load section:', error);
    } finally {
      item.classList.remove('is-loading');
    }
  }

  async loadSectionHTML(filePath, type, variant) {
    try {
      const response = await fetch(filePath);
      const text = await response.text();

      // Parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      // Extract section content
      let sectionEl;

      if (type === 'navigation' && variant === 'gnb') {
        // Get GNB header
        sectionEl = doc.querySelector('.pl-gnb');
        if (sectionEl) {
          // Also get mobile overlay
          const overlay = doc.querySelector('.pl-gnb__mobile-overlay');
          if (overlay) {
            const wrapper = document.createElement('div');
            wrapper.appendChild(sectionEl.cloneNode(true));
            wrapper.appendChild(overlay.cloneNode(true));
            return this.adjustImagePaths(wrapper.innerHTML);
          }
        }
      } else if (type === 'navigation' && variant === 'footer') {
        // Get Footer
        sectionEl = doc.querySelector('.pl-footer');
      } else {
        // Get section element
        sectionEl = doc.querySelector('.pl-section, .pl-faq, .pl-benefit, .pl-step, .pl-cta');
      }

      if (sectionEl) {
        return this.adjustImagePaths(sectionEl.outerHTML);
      }

      return null;
    } catch (error) {
      console.error('Error loading section:', error);
      return null;
    }
  }

  adjustImagePaths(html) {
    // Fix relative image paths
    return html
      .replace(/src="\.\/\.\.\/\.\.\//g, 'src="./')
      .replace(/src="\.\.\/\.\.\//g, 'src="./')
      .replace(/src="\.\.\//g, 'src="./')
      .replace(/src="\.\/\.\.\//g, 'src="./');
  }

  renderSection(section) {
    // Hide empty state
    this.emptyState.style.display = 'none';

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'creative__section-wrapper';
    wrapper.dataset.sectionId = section.id;
    wrapper.innerHTML = section.html;

    // Add to main content area first
    this.mainContent.appendChild(wrapper);

    // Wait for custom elements to render, then make editable
    requestAnimationFrame(() => {
      this.makeEditable(wrapper);
    });

    // Initialize section-specific JS
    this.initSectionJS(wrapper, section.type);
  }

  renderFixedSection(section, position) {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'creative__section-wrapper';
    wrapper.dataset.sectionId = section.id;
    wrapper.dataset.fixed = position;
    wrapper.innerHTML = section.html;

    // Add to appropriate slot
    const slot = position === 'header' ? this.headerSlot : this.footerSlot;

    // Clear placeholder
    const placeholder = slot.querySelector('.creative__fixed-placeholder');
    if (placeholder) {
      placeholder.remove();
    }

    // Add wrapper first
    slot.appendChild(wrapper);

    // Wait for custom elements to render, then make editable
    requestAnimationFrame(() => {
      this.makeEditable(wrapper);
    });

    // Initialize section-specific JS
    this.initSectionJS(wrapper, section.type);
  }

  makeEditable(wrapper) {
    // All text elements - editable and deletable
    const textSelectors = [
      'h1, h2, h3, h4, h5, h6',
      'p',
      'span',
      '.pl-section-title__heading, .pl-section-title__label, .pl-section-title__desc, .pl-section-title__note',
      '.pl-hero__title, .pl-hero__desc',
      '.pl-label',
      '.pl-list-card__title, .pl-list-card__desc',
      '.pl-benefit__card-title, .pl-benefit__card-sub',
      '.pl-step-text__title, .pl-step-text__desc',
      '.pl-faq__question, .pl-faq__answer-title, .pl-faq__answer-text',
      '.pl-review__name, .pl-review__text',
      '.pl-cta__title, .pl-cta__desc',
      '.pl-gnb__menu-item',
      '.pl-footer__link, .pl-footer__title, .pl-footer__text, .pl-footer__info'
    ];

    // Block elements (cards, items) - deletable as whole only
    const blockSelectors = [
      '.pl-list-card',
      '.pl-grid-card',
      '.pl-swipe-card',
      '.pl-benefit__card',
      '.pl-step-card',
      '.pl-review__card',
      '.pl-faq__item'
    ];

    // Card types where only the card itself can be deleted (not inner text)
    const cardOnlyDeleteTypes = [
      '.pl-list-card',
      '.pl-grid-card',
      '.pl-swipe-card'
    ];

    // Make all text elements editable with delete button
    const textElements = wrapper.querySelectorAll(textSelectors.join(', '));
    textElements.forEach(el => {
      // Skip if it has images, SVGs, or already editable
      if (el.querySelector('img, svg') || el.hasAttribute('contenteditable')) {
        return;
      }

      // Skip if it's inside a button (buttons handled separately)
      if (el.closest('.pl-btn, .pl-cta__btn')) {
        return;
      }

      // Skip if it's inside a card that only allows card-level deletion
      const insideCardOnly = cardOnlyDeleteTypes.some(selector => el.closest(selector));
      if (insideCardOnly) {
        return;
      }

      el.setAttribute('contenteditable', 'true');
      el.style.position = 'relative';

      // Add delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'creative__text-delete';
      deleteBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      deleteBtn.title = '삭제';
      deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('이 요소를 삭제하시겠습니까?')) {
          el.remove();
        }
      });

      el.appendChild(deleteBtn);

      // Prevent default link behavior while editing
      if (el.tagName === 'A') {
        el.addEventListener('click', (e) => {
          if (el.getAttribute('contenteditable') === 'true') {
            e.preventDefault();
          }
        });
      }
    });

    // Make block elements deletable (cards, items)
    const blockElements = wrapper.querySelectorAll(blockSelectors.join(', '));
    blockElements.forEach(el => {
      el.style.position = 'relative';

      // Add delete button to block
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'creative__block-delete';
      deleteBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      deleteBtn.title = '카드 삭제';
      deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('이 카드를 삭제하시겠습니까?')) {
          el.remove();
        }
      });

      el.appendChild(deleteBtn);
    });

    // Make buttons editable (but not in card-only-delete cards)
    const buttons = wrapper.querySelectorAll('.pl-btn, .pl-cta__btn');
    buttons.forEach(btn => {
      // Skip buttons inside card-only-delete cards
      const insideCardOnly = cardOnlyDeleteTypes.some(selector => btn.closest(selector));
      if (insideCardOnly) {
        return;
      }

      btn.setAttribute('contenteditable', 'true');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
      });
      // Prevent line breaks in buttons
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      });
    });
  }

  initSectionJS(wrapper, type) {
    // Initialize FAQ accordion
    if (type === 'faq') {
      wrapper.querySelectorAll('.pl-faq__item').forEach(item => {
        const header = item.querySelector('.pl-faq__header');
        header?.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');
          item.classList.toggle('is-open', !isOpen);
          header.setAttribute('aria-expanded', !isOpen);
        });
      });
    }

    // Initialize tabs
    if (type === 'about') {
      wrapper.querySelectorAll('.pl-tab').forEach(container => {
        const tabs = container.querySelectorAll('.pl-tab__button');
        const panels = container.querySelectorAll('.pl-tab__panel');

        tabs.forEach((tab, index) => {
          tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('is-active'));
            panels.forEach(p => p.classList.remove('is-active'));
            tab.classList.add('is-active');
            panels[index]?.classList.add('is-active');
          });
        });
      });
    }
  }

  updateLayersList() {
    // Clear existing layers
    this.layersList.innerHTML = '';

    const hasContent = this.sections.length > 0 || this.headerSection || this.footerSection;

    if (!hasContent) {
      this.layersList.innerHTML = '<div class="creative__layers-empty">추가된 섹션이 없습니다</div>';
      return;
    }

    // Add header if exists
    if (this.headerSection) {
      this.layersList.appendChild(this.createLayerItem(this.headerSection, true));
    }

    // Add regular sections
    this.sections.forEach((section, index) => {
      this.layersList.appendChild(this.createLayerItem(section, false));
    });

    // Add footer if exists
    if (this.footerSection) {
      this.layersList.appendChild(this.createLayerItem(this.footerSection, true));
    }
  }

  createLayerItem(section, isFixed) {
    const layer = document.createElement('div');
    layer.className = isFixed ? 'creative__layer creative__layer--fixed' : 'creative__layer';
    layer.dataset.sectionId = section.id;

    if (!isFixed) {
      layer.draggable = true;
    }

    // Different HTML for fixed vs regular layers
    if (isFixed) {
      layer.innerHTML = `
        <div class="creative__layer-info">
          <span class="creative__layer-type">${this.sectionNames[section.type] || section.type}</span>
          <span class="creative__layer-name">${section.name} (고정)</span>
        </div>
        <button class="creative__layer-delete" title="삭제">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
    } else {
      layer.innerHTML = `
        <div class="creative__layer-drag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="5" r="1"></circle>
            <circle cx="9" cy="12" r="1"></circle>
            <circle cx="9" cy="19" r="1"></circle>
            <circle cx="15" cy="5" r="1"></circle>
            <circle cx="15" cy="12" r="1"></circle>
            <circle cx="15" cy="19" r="1"></circle>
          </svg>
        </div>
        <div class="creative__layer-info">
          <span class="creative__layer-type">${this.sectionNames[section.type] || section.type}</span>
          <span class="creative__layer-name">${section.name}</span>
        </div>
        <button class="creative__layer-delete" title="삭제">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
    }

    // Delete button
    layer.querySelector('.creative__layer-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeSection(section.id, isFixed);
    });

    // Drag events (only for non-fixed sections)
    if (!isFixed) {
      layer.addEventListener('dragstart', (e) => this.handleDragStart(e, section.id));
      layer.addEventListener('dragover', (e) => this.handleDragOver(e));
      layer.addEventListener('drop', (e) => this.handleDrop(e, section.id));
      layer.addEventListener('dragend', () => this.handleDragEnd());
    }

    return layer;
  }

  removeSection(id, isFixed = false) {
    if (isFixed) {
      // Check if it's header or footer
      if (this.headerSection && this.headerSection.id === id) {
        this.headerSection = null;
        const wrapper = this.headerSlot.querySelector(`[data-section-id="${id}"]`);
        if (wrapper) {
          wrapper.remove();
        }
        // Restore placeholder
        this.headerSlot.innerHTML = `
          <div class="creative__fixed-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="4" rx="1"></rect>
            </svg>
            <span>헤더를 추가하려면 네비게이션 카테고리에서 GNB를 선택하세요</span>
          </div>
        `;
      } else if (this.footerSection && this.footerSection.id === id) {
        this.footerSection = null;
        const wrapper = this.footerSlot.querySelector(`[data-section-id="${id}"]`);
        if (wrapper) {
          wrapper.remove();
        }
        // Restore placeholder
        this.footerSlot.innerHTML = `
          <div class="creative__fixed-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="17" width="18" height="4" rx="1"></rect>
            </svg>
            <span>푸터를 추가하려면 푸터 카테고리에서 Footer를 선택하세요</span>
          </div>
        `;
      }
    } else {
      // Remove from array
      const index = this.sections.findIndex(s => s.id === id);
      if (index > -1) {
        this.sections.splice(index, 1);
      }

      // Remove from DOM
      const wrapper = this.mainContent.querySelector(`[data-section-id="${id}"]`);
      if (wrapper) {
        wrapper.remove();
      }
    }

    this.updateLayersList();
    this.updateUI();
  }

  // Drag and Drop
  handleDragStart(e, id) {
    this.draggedId = id;
    e.target.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const layer = e.target.closest('.creative__layer');
    if (layer && layer.dataset.sectionId != this.draggedId) {
      // Remove drag-over from all
      document.querySelectorAll('.creative__layer').forEach(l => l.classList.remove('drag-over'));
      layer.classList.add('drag-over');
    }
  }

  handleDrop(e, targetId) {
    e.preventDefault();

    if (this.draggedId === targetId) return;

    // Reorder sections array
    const draggedIndex = this.sections.findIndex(s => s.id === this.draggedId);
    const targetIndex = this.sections.findIndex(s => s.id === targetId);

    if (draggedIndex > -1 && targetIndex > -1) {
      const [removed] = this.sections.splice(draggedIndex, 1);
      this.sections.splice(targetIndex, 0, removed);

      this.reorderPreview();
      this.updateLayersList();
    }
  }

  handleDragEnd() {
    document.querySelectorAll('.creative__layer').forEach(l => {
      l.classList.remove('is-dragging', 'drag-over');
    });
    this.draggedId = null;
  }

  reorderPreview() {
    // Reorder sections in main content area
    this.sections.forEach(section => {
      const wrapper = this.mainContent.querySelector(`[data-section-id="${section.id}"]`);
      if (wrapper) {
        this.mainContent.appendChild(wrapper);
      }
    });
  }

  switchDevice(device) {
    this.currentDevice = device;

    // Update buttons
    document.querySelectorAll('.creative__device-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.device === device);
    });

    // Update preview width
    this.previewCanvas.dataset.device = device;
  }

  switchTheme(theme) {
    this.currentTheme = theme;

    // Update buttons
    document.querySelectorAll('.creative__theme-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.theme === theme);
    });

    // Update preview theme (both canvas and content for compatibility)
    this.previewCanvas.dataset.theme = theme;
    this.previewContent.dataset.theme = theme;

    // Update logo images for theme
    const logos = this.previewContent.querySelectorAll('img[data-light][data-dark]');
    logos.forEach(logo => {
      if (theme === 'dark') {
        logo.src = logo.dataset.dark;
      } else {
        logo.src = logo.dataset.light;
      }
    });
  }

  updateUI() {
    // Update section count
    this.sectionCount.textContent = `${this.sections.length}개 섹션`;

    // Show/hide empty state
    this.emptyState.style.display = this.sections.length === 0 ? 'flex' : 'none';

    // Enable/disable export buttons
    const hasContent = this.sections.length > 0 || this.headerSection || this.footerSection;
    document.getElementById('exportImageBtn').disabled = !hasContent;
    document.getElementById('exportTextBtn').disabled = !hasContent;
  }

  reset() {
    const hasContent = this.sections.length > 0 || this.headerSection || this.footerSection;
    if (!hasContent) return;

    if (confirm('모든 섹션을 초기화하시겠습니까?')) {
      this.sections = [];
      this.headerSection = null;
      this.footerSection = null;

      // Clear main content
      this.mainContent.innerHTML = '';
      this.mainContent.appendChild(this.emptyState);
      this.emptyState.style.display = 'flex';

      // Reset header slot
      this.headerSlot.innerHTML = `
        <div class="creative__fixed-placeholder">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="4" rx="1"></rect>
          </svg>
          <span>헤더를 추가하려면 네비게이션 카테고리에서 GNB를 선택하세요</span>
        </div>
      `;

      // Reset footer slot
      this.footerSlot.innerHTML = `
        <div class="creative__fixed-placeholder">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="17" width="18" height="4" rx="1"></rect>
          </svg>
          <span>푸터를 추가하려면 푸터 카테고리에서 Footer를 선택하세요</span>
        </div>
      `;

      this.updateLayersList();
      this.updateUI();
    }
  }

  extractSectionText(wrapper, sectionType) {
    let text = '';

    // Extract text content by element type
    const extractText = (selector) => {
      const elements = wrapper.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(el => {
          const content = el.textContent.trim();
          if (content && content.length > 0) {
            text += `${content}\n`;
          }
        });
        text += '\n';
      }
    };

    // Section title
    extractText('.pl-section-title__label');
    extractText('.pl-section-title__heading, h1, h2');
    extractText('.pl-section-title__description');

    // Hero
    extractText('.pl-hero__title');
    extractText('.pl-hero__desc');

    // Cards and items
    extractText('.pl-list-card__title, .pl-benefit__card-title, .pl-step-text__title');
    extractText('.pl-list-card__desc, .pl-benefit__card-sub, .pl-step-text__desc');

    // FAQ
    extractText('.pl-faq__question');
    extractText('.pl-faq__answer-title, .pl-faq__answer-text');

    // CTA
    extractText('.pl-cta__title');
    extractText('.pl-cta__desc');

    // Buttons
    const buttons = wrapper.querySelectorAll('.pl-btn, .pl-cta__btn');
    if (buttons.length > 0) {
      text += '버튼:\n';
      buttons.forEach(btn => {
        const btnText = btn.textContent.trim();
        if (btnText) text += `- ${btnText}\n`;
      });
      text += '\n';
    }

    return text;
  }

  // Export as Image
  async exportImage() {
    if (this.sections.length === 0) return;

    try {
      // Show loading
      const btn = document.getElementById('exportImageBtn');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="creative__loading"></span>';
      btn.disabled = true;

      // Capture preview content
      const canvas = await html2canvas(this.previewContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Download
      const link = document.createElement('a');
      link.download = `pagelab-creative-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      // Restore button
      btn.innerHTML = originalText;
      btn.disabled = false;
    } catch (error) {
      console.error('Export image failed:', error);
      alert('이미지 내보내기에 실패했습니다.');
    }
  }

  // Export as Text
  exportText() {
    const hasContent = this.sections.length > 0 || this.headerSection || this.footerSection;
    if (!hasContent) return;

    let textContent = '=== PageLab Section Creative ===\n';
    textContent += `생성일: ${new Date().toLocaleString('ko-KR')}\n`;
    textContent += `섹션 수: ${this.sections.length}개\n`;
    textContent += '\n';

    // Export header if exists
    if (this.headerSection) {
      const wrapper = this.headerSlot.querySelector(`[data-section-id="${this.headerSection.id}"]`);
      if (wrapper) {
        textContent += `\n${'='.repeat(50)}\n`;
        textContent += `[고정] ${this.sectionNames[this.headerSection.type] || this.headerSection.type} - ${this.headerSection.name}\n`;
        textContent += `${'='.repeat(50)}\n\n`;
        textContent += this.extractSectionText(wrapper, this.headerSection.type);
      }
    }

    // Export regular sections
    this.sections.forEach((section, index) => {
      const wrapper = this.mainContent.querySelector(`[data-section-id="${section.id}"]`);
      if (!wrapper) return;

      textContent += `\n${'='.repeat(50)}\n`;
      textContent += `[${index + 1}] ${this.sectionNames[section.type] || section.type} - ${section.name}\n`;
      textContent += `${'='.repeat(50)}\n\n`;
      textContent += this.extractSectionText(wrapper, section.type);
    });

    // Export footer if exists
    if (this.footerSection) {
      const wrapper = this.footerSlot.querySelector(`[data-section-id="${this.footerSection.id}"]`);
      if (wrapper) {
        textContent += `\n${'='.repeat(50)}\n`;
        textContent += `[고정] ${this.sectionNames[this.footerSection.type] || this.footerSection.type} - ${this.footerSection.name}\n`;
        textContent += `${'='.repeat(50)}\n\n`;
        textContent += this.extractSectionText(wrapper, this.footerSection.type);
      }
    }

    // Create and download file
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.download = `pagelab-creative-${Date.now()}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.sectionCreative = new SectionCreative();
});
