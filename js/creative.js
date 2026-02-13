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

  // Custom confirm modal
  showConfirmModal(message, title = '삭제 확인') {
    return new Promise((resolve) => {
      // Create modal if it doesn't exist
      let modal = document.getElementById('customConfirmModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customConfirmModal';
        modal.className = 'creative__modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = `
          <div class="creative__modal">
            <h3 class="creative__modal-title"></h3>
            <p class="creative__modal-message"></p>
            <div class="creative__modal-actions">
              <button class="creative__modal-btn creative__modal-btn--cancel">취소</button>
              <button class="creative__modal-btn creative__modal-btn--confirm">삭제</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        // Event listeners
        const cancelBtn = modal.querySelector('.creative__modal-btn--cancel');
        const confirmBtn = modal.querySelector('.creative__modal-btn--confirm');

        cancelBtn.addEventListener('click', () => {
          this.hideConfirmModal(modal, false, resolve);
        });

        confirmBtn.addEventListener('click', () => {
          this.hideConfirmModal(modal, true, resolve);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.hideConfirmModal(modal, false, resolve);
          }
        });
      }

      // Set content
      modal.querySelector('.creative__modal-title').textContent = title;
      modal.querySelector('.creative__modal-message').textContent = message;

      // Show modal
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('is-visible'), 10);
    });
  }

  hideConfirmModal(modal, result, resolve) {
    modal.classList.remove('is-visible');
    setTimeout(() => {
      modal.style.display = 'none';
      resolve(result);
    }, 200);
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
          isFixed: isHeader || isFooter,
          // Add card count for benefit plus type
          cardCount: (type === 'benefit' && variant === 'type-a-plus') ? 4 : undefined,
          // Add card functionality for about card types
          hasAddCard: type === 'about' && ['type-b-grid', 'type-c-card-slide', 'type-d-card-swipe'].includes(variant),
          // Add card style selection for grid, swipe, and tab types
          hasStyleControl: type === 'about' && ['type-b-grid', 'type-d-card-swipe', 'type-e-tab'].includes(variant),
          cardStyle: (type === 'about' && variant === 'type-b-grid') ? 'image-top' :
                     (type === 'about' && variant === 'type-d-card-swipe') ? 'card-a' :
                     (type === 'about' && variant === 'type-e-tab') ? 'style-a' : undefined
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
      } else if (type === 'about' && variant === 'type-b-grid') {
        // For card grid, get all card type sections
        const cardTypeSections = doc.querySelectorAll('.card-type-section');
        if (cardTypeSections.length > 0) {
          const wrapper = document.createElement('div');
          wrapper.className = 'creative__grid-wrapper';
          cardTypeSections.forEach(section => {
            wrapper.appendChild(section.cloneNode(true));
          });
          return this.adjustImagePaths(wrapper.innerHTML);
        }
      } else if (type === 'about' && variant === 'type-d-card-swipe') {
        // For card swipe, get all card type sections
        const cardTypeSections = doc.querySelectorAll('.card-type-section');
        if (cardTypeSections.length > 0) {
          const wrapper = document.createElement('div');
          wrapper.className = 'creative__swipe-wrapper';
          cardTypeSections.forEach(section => {
            wrapper.appendChild(section.cloneNode(true));
          });
          return this.adjustImagePaths(wrapper.innerHTML);
        }
      } else if (type === 'about' && variant === 'type-e-tab') {
        // For tab, get all tab style sections
        const tabStyleSections = doc.querySelectorAll('.tab-style-section');
        if (tabStyleSections.length > 0) {
          const wrapper = document.createElement('div');
          wrapper.className = 'creative__tab-wrapper';
          tabStyleSections.forEach(section => {
            wrapper.appendChild(section.cloneNode(true));
          });
          return this.adjustImagePaths(wrapper.innerHTML);
        }
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

    // Set initial card style visibility
    if (section.hasStyleControl) {
      this.setCardStyleVisibility(wrapper, section.variant, section.cardStyle);
    }

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
      '.pl-slide-card',
      '.pl-benefit__card',
      '.pl-step-card',
      '.pl-review__card',
      '.pl-faq__item'
    ];

    // Card types where only the card itself can be deleted (not inner text)
    const cardOnlyDeleteTypes = [
      '.pl-list-card'
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
      deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (await this.showConfirmModal('이 요소를 삭제하시겠습니까?')) {
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
      // Skip benefit small cards (they are controlled via card count selector)
      // But allow deletion of large banner card
      if (el.classList.contains('pl-benefit__card') && !el.classList.contains('pl-benefit__card--large')) {
        return;
      }

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
      deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (await this.showConfirmModal('이 카드를 삭제하시겠습니까?')) {
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

    // Special handling for slide cards (카드 슬라이드형)
    const slideCards = wrapper.querySelectorAll('.pl-slide-card');
    slideCards.forEach(card => {
      // Title: editable only (no delete button)
      const title = card.querySelector('.pl-slide-card__title');
      if (title && !title.hasAttribute('contenteditable')) {
        title.setAttribute('contenteditable', 'true');
        title.style.cursor = 'text';
        title.style.outline = 'none';
      }

      // Description: editable + deletable
      const desc = card.querySelector('.pl-slide-card__desc');
      if (desc && !desc.hasAttribute('contenteditable')) {
        desc.setAttribute('contenteditable', 'true');
        desc.style.position = 'relative';
        desc.style.cursor = 'text';
        desc.style.outline = 'none';

        // Add delete button to description
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'creative__text-delete';
        deleteBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
        deleteBtn.title = '설명 삭제';
        deleteBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (await this.showConfirmModal('이 설명을 삭제하시겠습니까?')) {
            desc.remove();
          }
        });

        desc.appendChild(deleteBtn);
      }
    });

    // Special handling for tabs (탭형)
    const tabButtons = wrapper.querySelectorAll('.pl-tab-btn, .pl-tab-nav button');
    tabButtons.forEach(btn => {
      if (btn.hasAttribute('contenteditable')) return;

      // Store original position style
      const originalPosition = window.getComputedStyle(btn).position;

      // Make tab button text editable
      btn.setAttribute('contenteditable', 'true');
      if (originalPosition === 'static' || !originalPosition) {
        btn.style.position = 'relative';
      }

      // Add delete button to tab
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'creative__tab-delete';
      deleteBtn.innerHTML = `×`;
      deleteBtn.title = '탭 삭제';
      deleteBtn.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        width: 20px;
        height: 20px;
        background: #ef4444;
        border: 2px solid white;
        border-radius: 50%;
        color: white;
        font-size: 14px;
        font-weight: bold;
        line-height: 1;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10;
        pointer-events: auto;
      `;

      deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (await this.showConfirmModal('이 탭을 삭제하시겠습니까?')) {
          // Find associated panel
          const tabId = btn.dataset.tab;
          if (tabId) {
            const panel = wrapper.querySelector(`[data-tab="${tabId}"]`);
            if (panel && panel.classList.contains('pl-tab-panel')) {
              panel.remove();
            }
          }
          btn.remove();
        }
      });

      btn.appendChild(deleteBtn);

      // Show delete button on hover
      btn.addEventListener('mouseenter', () => {
        deleteBtn.style.display = 'flex';
      });
      btn.addEventListener('mouseleave', () => {
        deleteBtn.style.display = 'none';
      });

      // Prevent default tab switching when editing
      btn.addEventListener('click', (e) => {
        if (document.activeElement === btn) {
          e.preventDefault();
          e.stopPropagation();
        }
      });

      // Prevent line breaks in tab buttons
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

      // Initialize swipe functionality
      wrapper.querySelectorAll('.pl-swipe-btn--prev').forEach(btn => {
        btn.addEventListener('click', () => {
          const track = btn.closest('.pl-swipe-container').querySelector('.pl-swipe-track');
          if (track) {
            track.scrollBy({
              left: -384, // 360 + 24
              behavior: 'smooth'
            });
          }
        });
      });

      wrapper.querySelectorAll('.pl-swipe-btn--next').forEach(btn => {
        btn.addEventListener('click', () => {
          const track = btn.closest('.pl-swipe-container').querySelector('.pl-swipe-track');
          if (track) {
            track.scrollBy({
              left: 384,
              behavior: 'smooth'
            });
          }
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
      const hasCardControl = section.cardCount !== undefined;
      const hasAddCard = section.hasAddCard || false;
      const hasStyleControl = section.hasStyleControl || false;

      // Generate style buttons based on section type
      let styleButtons = '';
      if (hasStyleControl) {
        if (section.variant === 'type-b-grid') {
          styleButtons = `
            <div class="creative__layer-control creative__layer-control--style">
              <span class="creative__layer-control-label">카드 스타일</span>
              <button class="creative__card-style-btn ${section.cardStyle === 'image-top' ? 'is-active' : ''}" data-style="image-top">이미지 상단</button>
              <button class="creative__card-style-btn ${section.cardStyle === 'text-top' ? 'is-active' : ''}" data-style="text-top">텍스트 상단</button>
            </div>
          `;
        } else if (section.variant === 'type-d-card-swipe') {
          styleButtons = `
            <div class="creative__layer-control creative__layer-control--style">
              <span class="creative__layer-control-label">카드 스타일</span>
              <button class="creative__card-style-btn ${section.cardStyle === 'card-a' ? 'is-active' : ''}" data-style="card-a">타입 A</button>
              <button class="creative__card-style-btn ${section.cardStyle === 'card-b' ? 'is-active' : ''}" data-style="card-b">타입 B</button>
              <button class="creative__card-style-btn ${section.cardStyle === 'card-c' ? 'is-active' : ''}" data-style="card-c">타입 C</button>
            </div>
          `;
        } else if (section.variant === 'type-e-tab') {
          styleButtons = `
            <div class="creative__layer-control creative__layer-control--style">
              <span class="creative__layer-control-label">탭 스타일</span>
              <button class="creative__card-style-btn ${section.cardStyle === 'style-a' ? 'is-active' : ''}" data-style="style-a">탭 A</button>
              <button class="creative__card-style-btn ${section.cardStyle === 'style-b' ? 'is-active' : ''}" data-style="style-b">탭 B</button>
            </div>
          `;
        }
      }

      layer.innerHTML = `
        <div class="creative__layer-main">
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
        </div>
        ${hasCardControl ? `
        <div class="creative__layer-control">
          <button class="creative__card-count-btn ${section.cardCount === 4 ? 'is-active' : ''}" data-count="4">4개</button>
          <button class="creative__card-count-btn ${section.cardCount === 3 ? 'is-active' : ''}" data-count="3">3개</button>
          <button class="creative__card-count-btn ${section.cardCount === 2 ? 'is-active' : ''}" data-count="2">2개</button>
        </div>
        ` : ''}
        ${styleButtons}
        ${hasAddCard ? `
        <div class="creative__layer-control">
          <button class="creative__add-card-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            카드 추가
          </button>
        </div>
        ` : ''}
      `;
    }

    // Delete button
    layer.querySelector('.creative__layer-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeSection(section.id, isFixed);
    });

    // Card count buttons (for benefit sections)
    if (section.cardCount !== undefined) {
      layer.querySelectorAll('.creative__card-count-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const count = parseInt(btn.dataset.count);
          this.updateBenefitCardCount(section.id, count);
        });
      });
    }

    // Add card button (for about sections)
    if (section.hasAddCard) {
      const addCardBtn = layer.querySelector('.creative__add-card-btn');
      if (addCardBtn) {
        addCardBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.addCardToSection(section.id);
        });
      }
    }

    // Card style buttons (for grid and swipe sections)
    if (section.hasStyleControl) {
      layer.querySelectorAll('.creative__card-style-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const style = btn.dataset.style;
          this.updateCardStyle(section.id, style);
        });
      });
    }

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

  updateBenefitCardCount(sectionId, count) {
    // Find the section
    const section = this.sections.find(s => s.id === sectionId);
    if (!section || section.cardCount === undefined) return;

    // Update card count
    section.cardCount = count;

    // Find the section wrapper in DOM
    const wrapper = this.mainContent.querySelector(`[data-section-id="${sectionId}"]`);
    if (!wrapper) return;

    // Find the benefit grid
    const grid = wrapper.querySelector('.pl-benefit__grid');
    if (!grid) return;

    // Update grid class
    grid.className = `pl-benefit__grid pl-benefit__grid--${count}col`;

    // Get all cards and plus icons
    const allItems = Array.from(grid.children);

    // Find the large banner card (always last item)
    const bannerIndex = allItems.findIndex(item => item.classList.contains('pl-benefit__card--large'));

    // Calculate how many items to show (cards + plus icons, excluding banner)
    // For N cards, we need N cards + (N-1) plus icons = 2N-1 items
    const itemsToShow = count * 2 - 1;

    // Show/hide items (always keep banner visible)
    allItems.forEach((item, index) => {
      if (index === bannerIndex) {
        // Always show banner
        item.style.display = '';
      } else if (index < itemsToShow) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });

    // Refresh layers list to update active button
    this.updateLayersList();
  }

  updateCardStyle(sectionId, style) {
    // Find the section
    const section = this.sections.find(s => s.id === sectionId);
    if (!section || !section.hasStyleControl) return;

    // Update style
    section.cardStyle = style;

    // Find the section wrapper in DOM
    const wrapper = this.mainContent.querySelector(`[data-section-id="${sectionId}"]`);
    if (!wrapper) return;

    // Update visibility
    this.setCardStyleVisibility(wrapper, section.variant, style);

    // Refresh layers list to update active button
    this.updateLayersList();
  }

  setCardStyleVisibility(wrapper, variant, style) {
    if (variant === 'type-b-grid') {
      // Handle grid type - show/hide card type sections
      const cardTypeSections = wrapper.querySelectorAll('.card-type-section');
      cardTypeSections.forEach(section => {
        const sectionType = section.dataset.cardType;
        if (sectionType === style) {
          section.classList.add('is-active');
          section.style.display = '';
        } else {
          section.classList.remove('is-active');
          section.style.display = 'none';
        }
      });
    } else if (variant === 'type-d-card-swipe') {
      // Handle swipe type - show/hide card type sections
      const cardTypeSections = wrapper.querySelectorAll('.card-type-section');
      cardTypeSections.forEach(section => {
        const sectionType = section.dataset.cardType;
        if (sectionType === style) {
          section.classList.add('is-active');
          section.style.display = '';
        } else {
          section.classList.remove('is-active');
          section.style.display = 'none';
        }
      });
    } else if (variant === 'type-e-tab') {
      // Handle tab type - show/hide tab style sections
      const tabStyleSections = wrapper.querySelectorAll('.tab-style-section');
      tabStyleSections.forEach(section => {
        const sectionType = section.dataset.tabStyle;
        if (sectionType === style) {
          section.classList.add('is-active');
          section.style.display = '';
        } else {
          section.classList.remove('is-active');
          section.style.display = 'none';
        }
      });
    }
  }

  addCardToSection(sectionId) {
    // Find the section
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return;

    // Find the section wrapper in DOM
    const wrapper = this.mainContent.querySelector(`[data-section-id="${sectionId}"]`);
    if (!wrapper) return;

    let container, templateCard, newCard;

    // Handle different section types
    if (section.variant === 'type-b-grid') {
      // Card grid type - get the active card type section
      const currentStyle = section.cardStyle || 'image-top';
      const activeSection = wrapper.querySelector(`.card-type-section[data-card-type="${currentStyle}"]`);

      if (activeSection) {
        if (currentStyle === 'image-top') {
          // Image-top variant (large cards)
          const largeRow = activeSection.querySelector('.pl-card-grid__row--large');
          if (largeRow) {
            container = largeRow;
            templateCard = container.querySelector('.pl-grid-card');
          }
        } else if (currentStyle === 'text-top') {
          // Text-top variant (small cards)
          const smallRow = activeSection.querySelector('.pl-card-grid__row--small');
          if (smallRow) {
            container = smallRow;
            templateCard = container.querySelector('.pl-grid-card--small');
          }
        }

        if (templateCard) {
          newCard = templateCard.cloneNode(true);
          // Reset text content to default
          const title = newCard.querySelector('.pl-grid-card__title');
          const desc = newCard.querySelector('.pl-grid-card__desc');
          if (title) title.textContent = '새 카드 타이틀';
          if (desc) desc.textContent = '새 카드 설명을 입력하세요.';
        }
      }
    } else if (section.variant === 'type-d-card-swipe') {
      // Card swipe type - get the active card type section
      const currentStyle = section.cardStyle || 'card-a';
      const activeSection = wrapper.querySelector(`.card-type-section[data-card-type="${currentStyle}"]`);

      if (activeSection) {
        const trackInner = activeSection.querySelector('.pl-swipe-track__inner');
        if (trackInner) {
          container = trackInner;
          // Get the first card as template
          templateCard = container.querySelector('.pl-swipe-card');

          if (templateCard) {
            newCard = templateCard.cloneNode(true);
            // Reset text content to default
            const title = newCard.querySelector('.pl-swipe-card__title');
            const desc = newCard.querySelector('.pl-swipe-card__desc');
            if (title) title.textContent = '새 카드 타이틀';
            if (desc) desc.textContent = '새 카드 설명을 입력하세요.';
          }
        }
      }
    } else if (section.variant === 'type-c-card-slide') {
      // Card slide type (auto-sliding)
      const trackInner = wrapper.querySelector('.pl-card-track__inner');
      if (trackInner) {
        container = trackInner;
        // Get the first card as template (before duplicates)
        const allCards = Array.from(container.querySelectorAll('.pl-slide-card'));
        // Assume first half is original, second half is duplicate
        const originalCount = Math.floor(allCards.length / 2);
        templateCard = allCards[0];

        if (templateCard) {
          newCard = templateCard.cloneNode(true);
          // Reset text content to default
          const title = newCard.querySelector('.pl-slide-card__title');
          const desc = newCard.querySelector('.pl-slide-card__desc');
          if (title) title.textContent = '새 카드 타이틀';
          if (desc) desc.textContent = '새 카드 설명을 입력하세요.';

          // Add to both original and duplicate sections
          const duplicateCard = newCard.cloneNode(true);

          // Insert before the duplicate section starts
          const insertIndex = originalCount;
          if (allCards[insertIndex]) {
            container.insertBefore(newCard, allCards[insertIndex]);
            // Add duplicate at the end
            container.appendChild(duplicateCard);
          } else {
            // Add to end if no duplicates yet
            container.appendChild(newCard);
            container.appendChild(duplicateCard);
          }

          // Make the new cards editable
          this.makeEditableCard(newCard);
          this.makeEditableCard(duplicateCard);

          return; // Early return for slide type
        }
      }
    }

    // Add the new card to container (for grid and swipe types)
    if (container && newCard) {
      container.appendChild(newCard);

      // Make the new card editable
      this.makeEditableCard(newCard);
    }
  }

  makeEditableCard(card) {
    // Make card deletable
    card.style.position = 'relative';

    // Add delete button to card
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'creative__block-delete';
    deleteBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    deleteBtn.title = '카드 삭제';
    deleteBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (await this.showConfirmModal('이 카드를 삭제하시겠습니까?')) {
        card.remove();
      }
    });

    // Remove existing delete button if any
    const existingDeleteBtn = card.querySelector('.creative__block-delete');
    if (existingDeleteBtn) {
      existingDeleteBtn.remove();
    }

    card.appendChild(deleteBtn);

    // Make text elements editable
    const title = card.querySelector('.pl-grid-card__title, .pl-swipe-card__title, .pl-slide-card__title');
    const desc = card.querySelector('.pl-grid-card__desc, .pl-swipe-card__desc, .pl-slide-card__desc');

    if (title && !title.hasAttribute('contenteditable')) {
      title.setAttribute('contenteditable', 'true');
      title.style.cursor = 'text';
      title.style.outline = 'none';
    }

    if (desc && !desc.hasAttribute('contenteditable')) {
      desc.setAttribute('contenteditable', 'true');
      desc.style.position = 'relative';
      desc.style.cursor = 'text';
      desc.style.outline = 'none';

      // Add delete button to description (for slide cards)
      if (card.classList.contains('pl-slide-card')) {
        const textDeleteBtn = document.createElement('button');
        textDeleteBtn.className = 'creative__text-delete';
        textDeleteBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
        textDeleteBtn.title = '설명 삭제';
        textDeleteBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (await this.showConfirmModal('이 설명을 삭제하시겠습니까?')) {
            desc.remove();
          }
        });

        desc.appendChild(textDeleteBtn);
      }
    }
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

  async reset() {
    const hasContent = this.sections.length > 0 || this.headerSection || this.footerSection;
    if (!hasContent) return;

    if (await this.showConfirmModal('모든 섹션을 초기화하시겠습니까?', '전체 초기화')) {
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
