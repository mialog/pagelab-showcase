/**
 * Section Creative - Interactive Page Builder
 * Allows users to select, combine, edit, and export sections
 */

const STATE_VERSION = 2; // 버전 올리면 모든 사용자 localStorage 초기화

class SectionCreative {
  constructor() {
    this.sections = [];
    this.sectionId = 0;
    this.currentDevice = 'pc';
    this.currentTheme = 'light';
    this.headerSection = null;
    this.footerSection = null;
    this.floatingCtaSection = null;

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
      'hero-type-d-video': 'sections/hero/type-d-video.html',
      'intro-type-d-product-split': 'sections/intro/type-d-product-split.html',
      'about-type-g-feature-alt': 'sections/about/type-g-feature-alt.html',
      'cta-type-a-finish': 'sections/cta/type-a-finish.html',
      'cta-type-b-floating': 'sections/cta/type-b-floating.html',
      'cta-type-c-floating-b': 'sections/cta/type-c-floating-b.html',
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
    this.floatingCtaSlot = document.getElementById('floatingCtaSlot');
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
  showConfirmModal(message, title = '삭제 확인', confirmLabel = '삭제') {
    return new Promise((resolve) => {
      this._pendingResolve = resolve;

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

        // Event listeners — always use this._pendingResolve to get current resolve
        const cancelBtn = modal.querySelector('.creative__modal-btn--cancel');
        const confirmBtn = modal.querySelector('.creative__modal-btn--confirm');

        cancelBtn.addEventListener('click', () => {
          this.hideConfirmModal(modal, false, this._pendingResolve);
        });

        confirmBtn.addEventListener('click', () => {
          this.hideConfirmModal(modal, true, this._pendingResolve);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.hideConfirmModal(modal, false, this._pendingResolve);
          }
        });
      }

      // Set content
      modal.querySelector('.creative__modal-title').textContent = title;
      modal.querySelector('.creative__modal-message').textContent = message;
      modal.querySelector('.creative__modal-btn--confirm').textContent = confirmLabel;

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

  async loadDefaultFixedSections() {
    // GNB/Footer 로딩 중 auto-save 억제 (타이밍 충돌 방지)
    this._suppressAutoSave = true;
    let changed = false;

    // Auto-load GNB — 슬롯에 실제로 렌더링된 래퍼가 없을 때만 로드
    const headerRendered = this.headerSlot?.querySelector('.creative__section-wrapper');
    if (!headerRendered) {
      this.headerSection = null;
      const gnbItem = document.querySelector('.creative__item[data-type="navigation"][data-variant="gnb"]');
      if (gnbItem) { await this.addSection(gnbItem); changed = true; }
    }

    // Auto-load Footer — 슬롯에 실제로 렌더링된 래퍼가 없을 때만 로드
    const footerRendered = this.footerSlot?.querySelector('.creative__section-wrapper');
    if (!footerRendered) {
      this.footerSection = null;
      const footerItem = document.querySelector('.creative__item[data-type="navigation"][data-variant="footer"]');
      if (footerItem) { await this.addSection(footerItem); changed = true; }
    }

    this._suppressAutoSave = false;

    // GNB/Footer 새로 로드된 경우 한 번만 저장
    if (changed) this.saveState();
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
    if (type === 'cta' && variant === 'type-b-floating' && this.floatingCtaSection) {
      alert('플로팅 CTA는 한 개만 추가할 수 있습니다.');
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
          // Add card functionality for about card types and step image type
          hasAddCard: (type === 'about' && ['type-b-grid', 'type-c-card-slide', 'type-d-card-swipe', 'type-g-feature-alt'].includes(variant)) ||
                      (type === 'step' && ['type-a-img', 'type-b-text'].includes(variant)) ||
                      (type === 'review'),
          // Add card style selection for grid, swipe, tab types, floating CTA, and step-b-text
          hasStyleControl: (type === 'about' && ['type-b-grid', 'type-d-card-swipe', 'type-e-tab'].includes(variant)) ||
                           (type === 'cta' && variant === 'type-b-floating') ||
                           (type === 'step' && variant === 'type-b-text'),
          cardStyle: (type === 'about' && variant === 'type-b-grid') ? 'image-top' :
                     (type === 'about' && variant === 'type-d-card-swipe') ? 'card-a' :
                     (type === 'about' && variant === 'type-e-tab') ? 'style-a' :
                     (type === 'cta' && variant === 'type-b-floating') ? 'style-a' :
                     (type === 'step' && variant === 'type-b-text') ? 'style-a' : undefined,
          btnCount: (type === 'cta' && variant === 'type-b-floating') ? '2btn' : undefined
        };

        const isFloatingCta = type === 'cta' && variant === 'type-b-floating';

        if (isHeader) {
          this.headerSection = section;
          this.renderFixedSection(section, 'header');
        } else if (isFooter) {
          this.footerSection = section;
          this.renderFixedSection(section, 'footer');
        } else if (isFloatingCta) {
          section.isFixed = true;
          this.floatingCtaSection = section;
          this.renderFixedSection(section, 'floating-cta');
        } else {
          this.sections.push(section);
          this.renderSection(section);
        }

        this.updateLayersList();
        this.updateUI();
        this.scheduleAutoSave(); // 섹션 추가 즉시 저장
      }
    } catch (error) {
      console.error('Failed to load section:', error);
    } finally {
      item.classList.remove('is-loading');
    }
  }

  // Replace <pl-section-title> tags with plain HTML in raw text (before any DOM parsing)
  // Uses a mini DOMParser to extract attributes reliably (handles > inside attr values like <br>)
  expandSectionTitlesInText(text) {
    return text.replace(
      /<pl-section-title((?:[^>"']|"[^"]*"|'[^']*')*?)><\/pl-section-title>/g,
      (match) => {
        // Parse just this element with DOMParser to get attributes reliably
        const miniDoc = new DOMParser().parseFromString(
          `<!DOCTYPE html><html><body>${match}</body></html>`, 'text/html'
        );
        const el = miniDoc.body.querySelector('pl-section-title');
        if (!el) return match;

        const label = el.getAttribute('label') || '';
        const heading = el.getAttribute('heading') || '';
        const description = el.getAttribute('description') || '';
        const note = el.getAttribute('note') || '';

        let html = '<div class="pl-section-title">';
        if (label) html += `<span class="pl-section-title__label">${label}</span>`;
        html += '<div class="pl-section-title__text">';
        if (heading) html += `<h2 class="pl-section-title__heading">${heading}</h2>`;
        if (description) html += `<p class="pl-section-title__desc">${description}</p>`;
        if (note) html += `<p class="pl-section-title__note">${note}</p>`;
        html += '</div></div>';
        return html;
      }
    );
  }

  async loadSectionHTML(filePath, type, variant) {
    try {
      const response = await fetch(filePath);
      const rawText = await response.text();

      // Expand pl-section-title to plain HTML before DOMParser sees it
      // (avoids all custom element lifecycle issues)
      const text = this.expandSectionTitlesInText(rawText);
      // Parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      // Extract section content
      let sectionEl;

      if (type === 'navigation' && variant === 'gnb') {
        // Get GNB header — serialize directly from DOMParser doc (no main-doc adoption)
        sectionEl = doc.querySelector('.pl-gnb');
        if (sectionEl) {
          const overlay = doc.querySelector('.pl-gnb__mobile-overlay');
          const combined = sectionEl.outerHTML + (overlay ? overlay.outerHTML : '');
          return this.adjustImagePaths(combined);
        }
      } else if (type === 'navigation' && variant === 'footer') {
        // Get Footer
        sectionEl = doc.querySelector('.pl-footer');
      } else if (type === 'about' && variant === 'type-b-grid') {
        // Serialize each card-type-section directly from DOMParser doc (no main-doc adoption)
        const cardTypeSections = doc.querySelectorAll('.card-type-section');
        if (cardTypeSections.length > 0) {
          let html = '<div class="creative__grid-wrapper">';
          cardTypeSections.forEach(section => { html += section.outerHTML; });
          html += '</div>';
          return this.adjustImagePaths(html);
        }
      } else if (type === 'about' && variant === 'type-d-card-swipe') {
        const cardTypeSections = doc.querySelectorAll('.card-type-section');
        if (cardTypeSections.length > 0) {
          let html = '<div class="creative__swipe-wrapper">';
          cardTypeSections.forEach(section => { html += section.outerHTML; });
          html += '</div>';
          return this.adjustImagePaths(html);
        }
      } else if (type === 'about' && variant === 'type-e-tab') {
        const tabStyleSections = doc.querySelectorAll('.tab-style-section');
        if (tabStyleSections.length > 0) {
          let html = '<div class="creative__tab-wrapper">';
          tabStyleSections.forEach(section => { html += section.outerHTML; });
          html += '</div>';
          return this.adjustImagePaths(html);
        }
      } else if (type === 'cta' && variant === 'type-b-floating') {
        // Floating CTA: load both type-b and type-c, combine as style-a/style-b
        const extractFloatingHtml = (d, isTypeC) => {
          const styleSections = d.querySelectorAll('.section-style');
          let html = '';
          styleSections.forEach(s => {
            const inner = isTypeC
              ? s.querySelector('.pl-cta-floating-b')
              : s.querySelector('.pl-cta-floating__buttons');
            if (inner) {
              const st = s.dataset.style;
              const disp = s.style.display;
              html += `<div class="section-style" data-style="${st}" style="display:${disp || 'block'};">${inner.outerHTML}</div>`;
            }
          });
          return html;
        };

        const styleAHtml = extractFloatingHtml(doc, false);

        let styleBHtml = '';
        try {
          const respC = await fetch('sections/cta/type-c-floating-b.html');
          const rawC = this.expandSectionTitlesInText(await respC.text());
          const docC = new DOMParser().parseFromString(rawC, 'text/html');
          styleBHtml = extractFloatingHtml(docC, true);
        } catch (e) { console.warn('type-c-floating-b load failed', e); }

        const html = `<div class="creative__floating-cta-wrapper">
          <div class="creative__cta-variant" data-cta-variant="style-a">${styleAHtml}</div>
          <div class="creative__cta-variant" data-cta-variant="style-b" style="display:none;">${styleBHtml}</div>
        </div>`;
        return this.adjustImagePaths(html);
      } else if (type === 'step' && variant === 'type-b-text') {
        // Load both style sections (썸네일형 + 텍스트형) into a wrapper
        const styleSections = doc.querySelectorAll('.section-style');
        if (styleSections.length > 0) {
          let html = '<div class="creative__step-b-wrapper">';
          styleSections.forEach(s => { html += s.outerHTML; });
          html += '</div>';
          return this.adjustImagePaths(html);
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

    // Make editable after layout is complete
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
    const slot = position === 'header' ? this.headerSlot
      : position === 'floating-cta' ? this.floatingCtaSlot
      : this.footerSlot;

    if (position === 'floating-cta') {
      slot.style.display = '';
    }

    // Clear placeholder
    const placeholder = slot.querySelector('.creative__fixed-placeholder');
    if (placeholder) {
      placeholder.remove();
    }

    // Add wrapper first
    slot.appendChild(wrapper);

    // Make editable after layout is complete
    requestAnimationFrame(() => {
      this.makeEditable(wrapper);
    });

    // Initialize section-specific JS
    this.initSectionJS(wrapper, section.type);
  }

  stripEditableArtifacts(wrapper) {
    // 저장된 HTML에 포함된 편집 흔적 제거 (이벤트 없는 버튼 + contenteditable)
    wrapper.querySelectorAll(
      '.creative__text-delete, .creative__block-delete, .creative__tab-delete, .creative__btn-delete, .creative__img-placeholder-input'
    ).forEach(el => el.remove());
    // feature-label 텍스트 span 언래핑 (저장 시 이미 처리되지만 안전장치)
    wrapper.querySelectorAll('.creative__feature-label-text').forEach(span => {
      span.replaceWith(document.createTextNode(span.textContent));
    });
    wrapper.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    wrapper.querySelectorAll('.creative__img-placeholder').forEach(el => {
      // 이미지 플레이스홀더는 유지하되 내부 input만 제거 (위에서 이미 처리됨)
    });
  }

  /** Step 아이템에 삭제 버튼 일괄 추가 헬퍼 */
  _addStepDeleteBtns(wrapper, itemSelector, opts = {}) {
    wrapper.querySelectorAll(itemSelector).forEach(item => {
      if (item.querySelector('.creative__block-delete')) return;
      item.style.position = 'relative';
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'creative__block-delete';
      deleteBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      deleteBtn.title = '단계 삭제';
      deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!await this.showConfirmModal('이 단계를 삭제하시겠습니까?')) return;
        if (opts.siblingArrowClass) {
          const next = item.nextElementSibling;
          const prev = item.previousElementSibling;
          if (next?.classList.contains(opts.siblingArrowClass)) next.remove();
          else if (prev?.classList.contains(opts.siblingArrowClass)) prev.remove();
        }
        const container = item.parentElement;
        item.remove();
        opts.afterDelete?.(container);
      });
      item.appendChild(deleteBtn);
    });
  }

  makeEditable(wrapper) {
    // 복원된 HTML의 편집 흔적 먼저 제거
    this.stripEditableArtifacts(wrapper);

    // Detect section type (about/step preserve existing behavior; others get uniform delete)
    const sectionEl = wrapper.querySelector('section[data-section]');
    const sectionType = sectionEl?.dataset?.section;
    const isAboutOrStep = sectionType === 'about' || sectionType === 'step';
    const isFloatingCta = wrapper.dataset.fixed === 'floating-cta';
    const isFooter = wrapper.dataset.fixed === 'footer';

    // All text elements - editable and deletable
    const textSelectors = [
      'h1, h2, h3, h4, h5, h6',
      'p',
      'span',
      '.pl-section-title__heading, .pl-section-title__label, .pl-section-title__desc, .pl-section-title__note',
      '.pl-hero__title, .pl-hero__desc',
      '.pl-label',
      '.pl-about__feature-label, .pl-about__feature-heading, .pl-about__feature-desc',
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
      '.pl-review-card',
      '.pl-faq__item',
      '.pl-about__feature-item'
    ];

    // section-title 선택 삭제 가능 요소 (heading 제외)
    const sectionTitleOptionalSelectors = [
      '.pl-section-title__label',
      '.pl-section-title__desc',
      '.pl-section-title__note',
    ];

    // Make all text elements editable only (no delete button)
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

      // Footer 요소는 아래 전용 코드에서 처리 (중복 방지)
      if (isFooter) {
        return;
      }

      el.setAttribute('contenteditable', 'true');

      // section-title 선택 요소 (label, desc, note) — 삭제 버튼 추가
      const isOptionalTitleEl = sectionTitleOptionalSelectors.some(sel => el.matches(sel));
      // about/step 외 섹션: 카드 블록 밖의 텍스트는 모두 삭제 가능 (heading, 버튼 제외)
      const isInsideBlock = !!el.closest(blockSelectors.join(', '));
      const isSectionHeading = el.matches('.pl-section-title__heading');
      const needsDeleteBtn = !isFloatingCta && (isOptionalTitleEl ||
        (!isAboutOrStep && !isInsideBlock && !isSectionHeading));

      if (needsDeleteBtn) {
        el.style.position = 'relative';
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
      }

      // Prevent default link behavior while editing
      if (el.tagName === 'A') {
        el.addEventListener('click', (e) => {
          if (el.getAttribute('contenteditable') === 'true') {
            e.preventDefault();
          }
        });
      }
    });

    // 텍스트 편집 시 2초 디바운스 자동저장
    wrapper.addEventListener('input', () => this.scheduleAutoSave(2000));

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
          // review-card articles live inside <pl-review-card> custom elements — remove the wrapper too
          const isInsideCustomEl = el.parentElement?.tagName?.toLowerCase() === 'pl-review-card';
          const toRemove = isInsideCustomEl ? el.parentElement : el;
          const parent = toRemove.parentElement;
          toRemove.remove();
          this.recenterCardContainer(parent);
        }
      });

      el.appendChild(deleteBtn);
    });

    // Step image items — deletable (type-a-img)
    this._addStepDeleteBtns(wrapper, '.pl-step__item', {
      afterDelete: (container) => {
        const remaining = container?.querySelectorAll('.pl-step__item');
        if (remaining?.length) {
          remaining.forEach((it, i) => {
            if (i === remaining.length - 1) {
              it.classList.add('pl-step__item--last');
              it.querySelector('.pl-step__arrow')?.remove();
            } else {
              it.classList.remove('pl-step__item--last');
            }
          });
        }
      }
    });

    // Step textonly items — deletable (type-b-text style B)
    this._addStepDeleteBtns(wrapper, '.pl-step-textonly__item', {
      siblingArrowClass: 'pl-step-textonly__arrow'
    });

    // Step text items — deletable (type-b-text style A)
    this._addStepDeleteBtns(wrapper, '.pl-step-text__item', {
      siblingArrowClass: 'pl-step-text__arrow'
    });

    // Make buttons editable + deletable
    const buttons = wrapper.querySelectorAll('.pl-btn, .pl-cta__btn');
    buttons.forEach(btn => {
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
      // Add delete button (span to avoid invalid nested <button>)
      if (!btn.querySelector('.creative__btn-delete')) {
        btn.style.position = 'relative';
        const delSpan = document.createElement('span');
        delSpan.className = 'creative__btn-delete';
        delSpan.setAttribute('role', 'button');
        delSpan.setAttribute('aria-label', '버튼 삭제');
        delSpan.innerHTML = `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        delSpan.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (await this.showConfirmModal('이 버튼을 삭제하시겠습니까?')) {
            // If wrapped in a pl-button host, remove the host; otherwise just the button
            const host = btn.closest('pl-button') || btn;
            host.remove();
          }
        });
        btn.appendChild(delSpan);
      }
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

      // Description: already handled by card desc block below
    });

    // Feature-alt label: SVG + text node → wrap text in editable span
    wrapper.querySelectorAll('.pl-about__feature-label').forEach(label => {
      if (label.querySelector('.creative__feature-label-text')) return;
      // Find text nodes (skip SVG)
      const textNodes = Array.from(label.childNodes).filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (textNodes.length === 0) return;
      const span = document.createElement('span');
      span.className = 'creative__feature-label-text';
      span.setAttribute('contenteditable', 'true');
      span.style.outline = 'none';
      span.style.cursor = 'text';
      span.textContent = textNodes[0].textContent.trim();
      textNodes[0].replaceWith(span);
    });

    // Card body/desc elements — about/step 섹션에서만 카드 내부 텍스트 개별 삭제 가능
    // (그 외 섹션은 카드 블록 전체 삭제 or 위의 일반 텍스트 삭제 로직 적용)
    const cardDescSelectors = [
      // 콘텐츠설명 (About)
      '.pl-grid-card__desc',
      '.pl-slide-card__desc',
      '.pl-list-card__desc',
      '.pl-swipe-card__desc',
      // 기능교대형 (Feature Alt)
      '.pl-about__feature-heading',
      '.pl-about__feature-desc',
      // 이용방법 (Step) — 카드 전체 삭제로 처리하므로 개별 삭제 없음
    ];
    if (isAboutOrStep) wrapper.querySelectorAll(cardDescSelectors.join(', ')).forEach(desc => {
      if (desc.querySelector('.creative__text-delete')) return;

      // stars 같은 non-text 요소는 contenteditable 제외
      if (!desc.classList.contains('pl-review-card__stars')) {
        desc.setAttribute('contenteditable', 'true');
      }
      desc.style.position = 'relative';

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
    }); // end isAboutOrStep cardDescSelectors

    // Feature-alt label text span — deletable
    if (isAboutOrStep) {
      wrapper.querySelectorAll('.creative__feature-label-text').forEach(span => {
        if (span.querySelector('.creative__text-delete')) return;
        span.style.position = 'relative';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'creative__text-delete';
        deleteBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        deleteBtn.title = '라벨 삭제';
        deleteBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (await this.showConfirmModal('이 라벨 텍스트를 삭제하시겠습니까?')) {
            span.remove();
          }
        });
        span.appendChild(deleteBtn);
      });
    }

    // Special handling for tabs (탭형) — 탭 섹션 내부로 스코프 제한
    const tabButtons = wrapper.querySelectorAll('.pl-about--tab .pl-tab-btn, .pl-about--tab .pl-tab-nav button');
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

      deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (await this.showConfirmModal('이 탭을 삭제하시겠습니까?')) {
          const tabId = btn.dataset.tab;
          const styleSection = btn.closest('.tab-style-section');

          // Remove all nav buttons with same data-tab (desktop + mobile)
          if (tabId && styleSection) {
            styleSection.querySelectorAll(`[data-tab="${tabId}"]`).forEach(el => {
              if (el.tagName === 'BUTTON' || el.classList.contains('pl-tab-btn')) el.remove();
              else if (el.classList.contains('pl-tab-panel')) el.remove();
            });
          } else {
            btn.remove();
          }
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

    // Footer: 개별 요소 삭제 가능
    if (isFooter) {
      const footerDeletableSelectors = [
        '.pl-footer__category-link',
        '.pl-footer__address p',
        '.pl-footer__call-label, .pl-footer__call-number, .pl-footer__call-time',
        '.pl-footer__sns-icon',
        '.pl-footer__app-btn',
        '.pl-footer__dropdown-wrapper',
        '.pl-footer__copyright',
      ];
      wrapper.querySelectorAll(footerDeletableSelectors.join(', ')).forEach(el => {
        el.style.position = 'relative';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'creative__block-delete';
        deleteBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        deleteBtn.title = '삭제';
        deleteBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (await this.showConfirmModal('이 요소를 삭제하시겠습니까?')) {
            el.remove();
          }
        });
        el.appendChild(deleteBtn);
      });

      // 푸터 텍스트 요소 편집 가능
      wrapper.querySelectorAll([
        '.pl-footer__category-link',
        '.pl-footer__address p',
        '.pl-footer__call-label, .pl-footer__call-number, .pl-footer__call-time',
        '.pl-footer__copyright',
      ].join(', ')).forEach(el => {
        if (!el.hasAttribute('contenteditable')) {
          el.setAttribute('contenteditable', 'true');
        }
      });
    }

    // Replace images immediately with gray placeholder + text input
    // Skip GNB/Footer logo images — keep them as actual logos
    wrapper.querySelectorAll('img').forEach(img => {
      if (img.closest('.pl-gnb__logo, .pl-gnb__mobile-overlay-header')) return;
      // 리뷰 카드 프로필 이미지 — 회색 원 그대로 노출 (숨김 처리만)
      if (img.closest('.pl-review-card__photo')) { img.style.display = 'none'; return; }
      const w = img.offsetWidth;
      const h = img.offsetHeight;
      const isInsideTabPanel = !!img.closest('.pl-tab-panel');
      const isInsideSlideCard = !!img.closest('.pl-slide-card, .pl-swipe-card');
      const isHeroBg = !!img.closest('.pl-hero__bg, .pl-hero__video');

      const placeholder = document.createElement('div');
      placeholder.className = 'creative__img-placeholder';
      if (w) placeholder.style.width = w + 'px';
      if (h) placeholder.style.minHeight = h + 'px';

      let inputEl = '';
      if (isInsideTabPanel) {
        inputEl = `<textarea class="creative__img-placeholder-input creative__img-placeholder-input--tab" placeholder="설명"></textarea>`;
      } else if (!isInsideSlideCard && !isHeroBg) {
        inputEl = `<input type="text" class="creative__img-placeholder-input" placeholder="설명">`;
      }

      placeholder.innerHTML = `${inputEl}`;

      placeholder.querySelector('input, textarea')?.addEventListener('click', (e) => e.stopPropagation());

      img.replaceWith(placeholder);
    });

    // 복원된 플레이스홀더에 input 다시 추가 (저장 시 input 제거됐으므로)
    wrapper.querySelectorAll('.creative__img-placeholder').forEach(placeholder => {
      if (placeholder.querySelector('input, textarea')) return; // 이미 input 있으면 스킵
      const isInsideTabPanel = !!placeholder.closest('.pl-tab-panel');
      const isInsideSlideCard = !!placeholder.closest('.pl-slide-card, .pl-swipe-card');
      const isHeroBg = !!placeholder.closest('.pl-hero__bg, .pl-hero__video');
      placeholder.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
      let input;
      if (isInsideTabPanel) {
        input = document.createElement('textarea');
        input.className = 'creative__img-placeholder-input creative__img-placeholder-input--tab';
        input.placeholder = '설명';
      } else if (!isInsideSlideCard && !isHeroBg) {
        input = document.createElement('input');
        input.type = 'text';
        input.className = 'creative__img-placeholder-input';
        input.placeholder = '설명';
      }
      if (input) {
        input.addEventListener('click', (e) => e.stopPropagation());
        placeholder.appendChild(input);
      }
    });

    // Add image description input for hero full/video background (below CTA)
    wrapper.querySelectorAll('.pl-hero--full, .pl-hero--video').forEach(hero => {
      const target = hero.querySelector('.pl-hero__actions') || hero.querySelector('.pl-hero__content');
      if (!target || target.querySelector('.creative__img-placeholder-input')) return;
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'creative__img-placeholder-input';
      input.placeholder = '배경 이미지 설명';
      input.style.marginTop = '16px';
      input.addEventListener('click', (e) => e.stopPropagation());
      target.appendChild(input);
    });

    // Add image description input inside slide/swipe cards
    wrapper.querySelectorAll('.pl-slide-card, .pl-swipe-card').forEach(card => {
      if (card.querySelector('.creative__img-placeholder-input')) return;
      const isBgFull = card.classList.contains('pl-slide-card') || card.classList.contains('pl-swipe-card--full');
      const isOverlay = card.classList.contains('pl-swipe-card--overlay');
      const isSplit = card.classList.contains('pl-swipe-card--split');
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'creative__img-placeholder-input';
      input.placeholder = '이미지 설명';
      input.addEventListener('click', (e) => e.stopPropagation());
      if (isSplit || isOverlay) {
        // Position input absolutely inside __image (gray placeholder area)
        const imageEl = card.querySelector('.pl-swipe-card__image');
        if (!imageEl) return;
        imageEl.appendChild(input);
      } else if (isBgFull) {
        // Full-background cards: put in __content (visible above overlay)
        const target = card.querySelector('.pl-slide-card__content, .pl-swipe-card__content');
        if (!target) return;
        input.style.marginTop = '8px';
        target.appendChild(input);
      } else {
        const target = card.querySelector('.pl-swipe-card__image');
        if (!target) return;
        input.style.marginTop = '8px';
        target.appendChild(input);
      }
    });

    // Add image placeholder (icon + input) to feature-alt gray image areas
    wrapper.querySelectorAll('.pl-about__feature-image').forEach(imgArea => {
      if (imgArea.querySelector('.creative__img-placeholder')) return;
      const placeholder = document.createElement('div');
      placeholder.className = 'creative__img-placeholder';
      placeholder.innerHTML = `<input type="text" class="creative__img-placeholder-input" placeholder="설명">`;
      placeholder.querySelector('input').addEventListener('click', (e) => e.stopPropagation());
      imgArea.appendChild(placeholder);
    });
  }

  initSectionJS(wrapper, type) {
    // FAQ: 빌더에서는 모두 펼친 상태 고정 (아코디언 토글 비활성)
    if (type === 'faq') {
      wrapper.querySelectorAll('.pl-faq__item').forEach(item => {
        item.classList.add('is-open');
        const header = item.querySelector('.pl-faq__header');
        if (header) header.setAttribute('aria-expanded', 'true');
        // 클릭으로 접히지 않도록 토글 막기
        header?.addEventListener('click', (e) => e.stopPropagation());
      });
    }

    // Review slider: 애니메이션 중지, 6개 고정 그리드로 표시
    if (type === 'review') {
      // type-c-card-slider: 슬라이더 트랙 펼치기
      const slider = wrapper.querySelector('.pl-review-slider');
      const track = wrapper.querySelector('.pl-review-slider__track');
      if (slider && track) {
        slider.style.overflow = 'visible';
        slider.style.maskImage = 'none';
        slider.style.webkitMaskImage = 'none';
        slider.style.padding = '0';

        track.style.animation = 'none';
        track.style.width = 'auto';
        track.style.flexWrap = 'wrap';
        track.style.justifyContent = 'center';
        track.style.gap = '16px';

        // 루프용 복제 제거 후 6개만 유지
        const cards = Array.from(track.querySelectorAll('.pl-review-card--slider'));
        const half = Math.ceil(cards.length / 2);
        cards.forEach((card, i) => { if (i >= Math.min(6, half)) card.remove(); });
      }

      // type-a-highlight: 마키 애니메이션 중지, 카드 그리드로 펼치기
      const reviewList = wrapper.querySelector('.pl-review-list');
      const reviewTrack = wrapper.querySelector('.pl-review-track');
      if (reviewList && reviewTrack) {
        reviewList.style.overflow = 'visible';
        reviewList.style.maskImage = 'none';
        reviewList.style.webkitMaskImage = 'none';

        reviewTrack.style.animation = 'none';
        reviewTrack.style.width = 'auto';
        reviewTrack.style.flexWrap = 'wrap';
        reviewTrack.style.justifyContent = 'center';

        // 루프용 복제 카드 제거 (원본만 유지)
        const allCards = Array.from(reviewTrack.querySelectorAll('.pl-review-card'));
        const half = Math.ceil(allCards.length / 2);
        allCards.forEach((card, i) => { if (i >= half) card.remove(); });
      }
    }

    // Stop card slide animation and unwrap swipe tracks in builder
    if (type === 'about') {
      wrapper.querySelectorAll('.pl-card-track').forEach(track => {
        track.style.overflow = 'visible';
      });
      wrapper.querySelectorAll('.pl-card-track__inner').forEach(inner => {
        inner.style.animation = 'none';
        inner.style.width = 'auto';
        inner.style.flexWrap = 'wrap';
        inner.style.justifyContent = 'center';
        inner.style.padding = '0 24px';
        // Remove duplicate cards (kept for loop animation)
        const cards = inner.querySelectorAll('.pl-slide-card');
        const half = Math.ceil(cards.length / 2);
        cards.forEach((card, i) => { if (i >= half) card.remove(); });
      });
      wrapper.querySelectorAll('.pl-swipe-track').forEach(track => {
        track.style.overflowX = 'visible';
      });
      wrapper.querySelectorAll('.pl-swipe-track__inner').forEach(inner => {
        inner.style.width = 'auto';
        inner.style.flexWrap = 'wrap';
        inner.style.justifyContent = 'center';
        inner.style.paddingLeft = 'var(--pl-layout-padding)';
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

  recenterCardContainer(container) {
    if (!container) return;

    const computed = window.getComputedStyle(container);

    if (computed.display === 'grid') {
      // 그리드 컬럼 너비 추출 후 flex centering으로 전환
      const cols = computed.gridTemplateColumns.split(' ');
      const colWidth = cols[0]; // e.g. "384px"
      const gap = computed.gap !== 'normal' ? computed.gap : computed.columnGap;

      container.style.display = 'flex';
      container.style.flexWrap = 'wrap';
      container.style.justifyContent = 'center';
      if (gap && gap !== 'normal') container.style.gap = gap;

      Array.from(container.children).forEach(child => {
        child.style.width = colWidth;
        child.style.flexShrink = '0';
      });
    } else if (computed.display === 'flex') {
      container.style.justifyContent = 'center';
      container.style.flexWrap = 'wrap';
    }
  }

  updateLayersList() {
    // Clear existing layers
    this.layersList.innerHTML = '';

    const hasContent = this.sections.length > 0 || this.headerSection || this.footerSection || this.floatingCtaSection;

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

    // Add floating CTA if exists
    if (this.floatingCtaSection) {
      this.layersList.appendChild(this.createLayerItem(this.floatingCtaSection, true));
    }

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
      const isFloatingCta = section.type === 'cta' && section.variant === 'type-b-floating';
      const floatingStyleControl = isFloatingCta ? `
        <div class="creative__layer-control creative__layer-control--style">
          <span class="creative__layer-control-label">스타일</span>
          <button class="creative__card-style-btn ${section.cardStyle === 'style-a' ? 'is-active' : ''}" data-style="style-a">스타일 A</button>
          <button class="creative__card-style-btn ${section.cardStyle === 'style-b' ? 'is-active' : ''}" data-style="style-b">스타일 B</button>
        </div>
        <div class="creative__layer-control creative__layer-control--style">
          <span class="creative__layer-control-label">버튼 수</span>
          <button class="creative__btn-count-btn ${section.btnCount === '2btn' ? 'is-active' : ''}" data-count="2btn">2개</button>
          <button class="creative__btn-count-btn ${section.btnCount === '1btn' ? 'is-active' : ''}" data-count="1btn">1개</button>
        </div>
      ` : '';

      const isNavSection = section.type === 'navigation';
      layer.innerHTML = `
        <div class="creative__layer-main">
          <div class="creative__layer-info">
            <span class="creative__layer-type">${this.sectionNames[section.type] || section.type}</span>
            <span class="creative__layer-name">${section.name} (고정)</span>
          </div>
          ${!isNavSection ? `<button class="creative__layer-delete" title="삭제">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>` : ''}
        </div>
        ${floatingStyleControl}
      `;

      if (isFloatingCta) {
        layer.querySelectorAll('.creative__card-style-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.updateFloatingCtaStyle(section.id, btn.dataset.style);
          });
        });
        layer.querySelectorAll('.creative__btn-count-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.updateFloatingCtaBtnCount(section.id, btn.dataset.count);
          });
        });
      }
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
            <div class="creative__layer-control">
              <button class="creative__storyboard-btn" title="탭별 이미지를 한 번에 모두 표시합니다">
                ⊞ 이미지 전체보기
              </button>
            </div>
          `;
        } else if (section.variant === 'type-b-text') {
          styleButtons = `
            <div class="creative__layer-control">
              <span class="creative__layer-control-label">스타일</span>
              <button class="creative__card-style-btn ${section.cardStyle === 'style-a' ? 'is-active' : ''}" data-style="style-a">썸네일형</button>
              <button class="creative__card-style-btn ${section.cardStyle === 'style-b' ? 'is-active' : ''}" data-style="style-b">텍스트형</button>
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
            ${section.type === 'step' ? '단계 추가' : '카드 추가'}
          </button>
        </div>
        ` : ''}
        ${section.type === 'review' ? `
        <div class="creative__layer-control creative__layer-control--toggles">
          <span class="creative__layer-control-label">옵션</span>
          <div class="creative__layer-control-btns">
            <button class="creative__review-toggle is-active" data-target="stars" title="별점 표시/숨김">★ 별점</button>
            ${section.variant !== 'type-a-highlight' ? `<button class="creative__review-toggle is-active" data-target="photo" title="인물사진 표시/숨김">● 사진</button>` : ''}
            <button class="creative__review-toggle is-active" data-target="info" title="부가정보 표시/숨김">i 정보</button>
          </div>
        </div>
        ` : ''}
      `;
    }

    // Delete button (네비게이션 제외)
    const deleteBtn = layer.querySelector('.creative__layer-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeSection(section.id, isFixed);
      });
    }

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

    // Storyboard toggle button (for type-e-tab sections)
    const storyboardBtn = layer.querySelector('.creative__storyboard-btn');
    if (storyboardBtn) {
      storyboardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrapper = this.mainContent.querySelector(`[data-section-id="${section.id}"]`);
        if (!wrapper) return;

        const isOn = storyboardBtn.classList.toggle('is-active');
        const activeStyleSection = wrapper.querySelector('.tab-style-section.is-active');
        if (!activeStyleSection) return;

        if (isOn) {
          // 패널 순서 번호 부여 (탭 버튼 텍스트 기준)
          const tabBtns = Array.from(activeStyleSection.querySelectorAll('.pl-tab-nav--desktop .pl-tab-btn'));
          activeStyleSection.querySelectorAll('.pl-tab-panel').forEach((panel, i) => {
            const btnClone = tabBtns[i]?.cloneNode(true);
            btnClone?.querySelector('.creative__tab-delete')?.remove();
            const label = btnClone?.textContent?.trim() || String(i + 1);
            panel.setAttribute('data-tab-index', label);
          });
          activeStyleSection.classList.add('is-storyboard');
          storyboardBtn.textContent = '✕ 전체보기 끄기';
        } else {
          activeStyleSection.classList.remove('is-storyboard');
          storyboardBtn.textContent = '⊞ 이미지 전체보기';
        }
      });
    }

    // Review element toggle buttons
    layer.querySelectorAll('.creative__review-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = btn.dataset.target;
        const isActive = btn.classList.toggle('is-active');
        const wrapper = this.mainContent.querySelector(`[data-section-id="${section.id}"]`);
        if (!wrapper) return;

        const selectorMap = {
          stars: '.pl-review-card__stars, .pl-review-highlight__stars',
          photo: '.pl-review-card__photo',
          info:  '.pl-review-card__user-info, .pl-review-card__info'
        };
        wrapper.querySelectorAll(selectorMap[target]).forEach(el => {
          el.style.display = isActive ? '' : 'none';
        });
      });
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
        if (wrapper) wrapper.remove();
      } else if (this.footerSection && this.footerSection.id === id) {
        this.footerSection = null;
        const wrapper = this.footerSlot.querySelector(`[data-section-id="${id}"]`);
        if (wrapper) wrapper.remove();
      } else if (this.floatingCtaSection && this.floatingCtaSection.id === id) {
        this.floatingCtaSection = null;
        const wrapper = this.floatingCtaSlot.querySelector(`[data-section-id="${id}"]`);
        if (wrapper) wrapper.remove();
        this.floatingCtaSlot.style.display = 'none';
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
    this.scheduleAutoSave(); // 섹션 삭제 즉시 저장
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
    this.scheduleAutoSave();
  }

  updateFloatingCtaBtnCount(sectionId, count) {
    if (!this.floatingCtaSection || this.floatingCtaSection.id !== sectionId) return;
    this.floatingCtaSection.btnCount = count;

    const wrapper = this.floatingCtaSlot.querySelector(`[data-section-id="${sectionId}"]`);
    if (!wrapper) return;

    wrapper.querySelectorAll('.section-style').forEach(s => {
      s.style.display = s.dataset.style === count ? 'block' : 'none';
    });

    this.updateLayersList();
    this.scheduleAutoSave();
  }

  updateFloatingCtaStyle(sectionId, style) {
    if (!this.floatingCtaSection || this.floatingCtaSection.id !== sectionId) return;
    this.floatingCtaSection.cardStyle = style;

    const wrapper = this.floatingCtaSlot.querySelector(`[data-section-id="${sectionId}"]`);
    if (!wrapper) return;

    wrapper.querySelectorAll('.creative__cta-variant').forEach(variant => {
      variant.style.display = variant.dataset.ctaVariant === style ? '' : 'none';
    });

    this.updateLayersList();
    this.scheduleAutoSave();
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
      // Also reset storyboard mode when switching styles
      const tabStyleSections = wrapper.querySelectorAll('.tab-style-section');
      tabStyleSections.forEach(section => {
        section.classList.remove('is-storyboard');
        if (section.dataset.tabStyle === style) {
          section.classList.add('is-active');
          section.style.display = '';
        } else {
          section.classList.remove('is-active');
          section.style.display = 'none';
        }
      });
    } else if (variant === 'type-b-text') {
      // style-a → data-style="a" (썸네일형), style-b → data-style="b" (텍스트형)
      const dataStyle = style === 'style-a' ? 'a' : 'b';
      wrapper.querySelectorAll('.section-style').forEach(s => {
        s.style.display = s.dataset.style === dataStyle ? '' : 'none';
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
      // Card slide type — in builder mode duplicates are already removed by initSectionJS
      const trackInner = wrapper.querySelector('.pl-card-track__inner');
      if (trackInner) {
        container = trackInner;
        const allCards = Array.from(container.querySelectorAll('.pl-slide-card'));
        templateCard = allCards[0];

        if (templateCard) {
          newCard = templateCard.cloneNode(true);
          const title = newCard.querySelector('.pl-slide-card__title');
          const desc = newCard.querySelector('.pl-slide-card__desc');
          if (title) title.textContent = '새 카드 타이틀';
          if (desc) desc.textContent = '새 카드 설명을 입력하세요.';

          container.appendChild(newCard);
          this.makeEditableCard(newCard);
          return;
        }
      }
    }

    // Feature-alt type — add new feature item with alternating layout
    if (section.type === 'about' && section.variant === 'type-g-feature-alt') {
      const container = wrapper.querySelector('.pl-about__feature-alt-container');
      if (!container) return;

      const currentItems = container.querySelectorAll('.pl-about__feature-item');
      // Even count (0,2,4...) → next item is at odd index → --reverse
      const isReverse = currentItems.length % 2 === 1;

      const newItem = document.createElement('div');
      newItem.className = 'pl-about__feature-item' + (isReverse ? ' pl-about__feature-item--reverse' : '');
      newItem.style.position = 'relative';

      // Text area
      const textDiv = document.createElement('div');
      textDiv.className = 'pl-about__feature-text';

      const labelDiv = document.createElement('div');
      labelDiv.className = 'pl-about__feature-label';
      labelDiv.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="#7c3aed" stroke-width="2"/><path d="M12 8v4m0 4h.01" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/></svg>`;
      const labelSpan = document.createElement('span');
      labelSpan.className = 'creative__feature-label-text';
      labelSpan.setAttribute('contenteditable', 'true');
      labelSpan.style.cssText = 'outline:none;cursor:text;position:relative;';
      labelSpan.textContent = '새 기능';
      labelDiv.appendChild(labelSpan);

      const heading = document.createElement('h2');
      heading.className = 'pl-about__feature-heading';
      heading.setAttribute('contenteditable', 'true');
      heading.style.cssText = 'position:relative;cursor:text;outline:none;';
      heading.textContent = '새 기능 제목을 입력하세요';

      const desc = document.createElement('p');
      desc.className = 'pl-about__feature-desc';
      desc.setAttribute('contenteditable', 'true');
      desc.style.cssText = 'position:relative;cursor:text;outline:none;';
      desc.textContent = '기능에 대한 설명을 입력하세요.';

      textDiv.appendChild(labelDiv);
      textDiv.appendChild(heading);
      textDiv.appendChild(desc);

      // Image area
      const imageDiv = document.createElement('div');
      imageDiv.className = 'pl-about__feature-image pl-about__feature-image--grey';
      const imgPlaceholder = document.createElement('div');
      imgPlaceholder.className = 'creative__img-placeholder';
      imgPlaceholder.innerHTML = `<input type="text" class="creative__img-placeholder-input" placeholder="설명">`;

      imgPlaceholder.querySelector('input').addEventListener('click', e => e.stopPropagation());
      imageDiv.appendChild(imgPlaceholder);

      newItem.appendChild(textDiv);
      newItem.appendChild(imageDiv);

      // Delete button for item
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'creative__block-delete';
      deleteBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      deleteBtn.title = '항목 삭제';
      deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (await this.showConfirmModal('이 항목을 삭제하시겠습니까?')) {
          newItem.remove();
        }
      });
      newItem.appendChild(deleteBtn);

      // Delete buttons for heading/desc
      const mkDelBtn = (target, msg) => {
        const btn = document.createElement('button');
        btn.className = 'creative__text-delete';
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        btn.title = msg;
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (await this.showConfirmModal(`${msg}을 삭제하시겠습니까?`)) target.remove();
        });
        target.appendChild(btn);
      };
      mkDelBtn(heading, '제목');
      mkDelBtn(desc, '설명');
      mkDelBtn(labelSpan, '라벨');

      container.appendChild(newItem);
      return;
    }

    // Step type-b-text — add new step item (style-a: 썸네일형, style-b: 텍스트형)
    if (section.type === 'step' && section.variant === 'type-b-text') {
      const isStyleA = (section.cardStyle || 'style-a') === 'style-a';
      const dataStyle = isStyleA ? 'a' : 'b';
      const activeSection = wrapper.querySelector(`.section-style[data-style="${dataStyle}"]`);
      if (!activeSection) return;

      const arrowSvg = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M10 24H38M38 24L26 12M38 24L26 36" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

      const mkDeleteBtn = (item, itemsContainer, arrowClass) => {
        const btn = document.createElement('button');
        btn.className = 'creative__block-delete';
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        btn.title = '단계 삭제';
        btn.addEventListener('click', async (e) => {
          e.preventDefault(); e.stopPropagation();
          if (await this.showConfirmModal('이 단계를 삭제하시겠습니까?')) {
            const next = item.nextElementSibling;
            const prev = item.previousElementSibling;
            if (next?.classList.contains(arrowClass)) next.remove();
            else if (prev?.classList.contains(arrowClass)) prev.remove();
            item.remove();
          }
        });
        item.appendChild(btn);
      };

      if (isStyleA) {
        const itemsContainer = activeSection.querySelector('.pl-step-text__items');
        if (!itemsContainer) return;
        const existingItems = itemsContainer.querySelectorAll('.pl-step-text__item');
        const stepNum = String(existingItems.length + 1).padStart(2, '0');

        // Add arrow before new item
        const arrow = document.createElement('div');
        arrow.className = 'pl-step-text__arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.innerHTML = arrowSvg;
        itemsContainer.appendChild(arrow);

        // Create new item
        const newItem = document.createElement('div');
        newItem.className = 'pl-step-text__item';
        newItem.style.position = 'relative';

        const label = document.createElement('span');
        label.className = 'pl-step-text__label';
        label.setAttribute('contenteditable', 'true');
        label.style.cssText = 'outline:none;cursor:text;';
        label.textContent = `Step ${stepNum}`;

        const thumb = document.createElement('div');
        thumb.className = 'pl-step-text__thumb';
        const placeholder = document.createElement('div');
        placeholder.className = 'creative__img-placeholder';
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'creative__img-placeholder-input';
        input.placeholder = '설명';
        input.addEventListener('click', e => e.stopPropagation());
        placeholder.appendChild(input);
        thumb.appendChild(placeholder);

        const content = document.createElement('div');
        content.className = 'pl-step-text__content';
        const title = document.createElement('h3');
        title.className = 'pl-step-text__title';
        title.setAttribute('contenteditable', 'true');
        title.style.cssText = 'outline:none;cursor:text;';
        title.textContent = '새 단계 제목';
        const desc = document.createElement('p');
        desc.className = 'pl-step-text__desc';
        desc.setAttribute('contenteditable', 'true');
        desc.style.cssText = 'outline:none;cursor:text;';
        desc.textContent = '단계 설명을 입력하세요.';
        content.appendChild(title);
        content.appendChild(desc);

        newItem.appendChild(label);
        newItem.appendChild(thumb);
        newItem.appendChild(content);
        mkDeleteBtn(newItem, itemsContainer, 'pl-step-text__arrow');
        itemsContainer.appendChild(newItem);
      } else {
        const itemsContainer = activeSection.querySelector('.pl-step-textonly__items');
        if (!itemsContainer) return;
        const existingItems = itemsContainer.querySelectorAll('.pl-step-textonly__item');
        const stepNum = String(existingItems.length + 1).padStart(2, '0');

        // Add arrow before new item
        const arrow = document.createElement('div');
        arrow.className = 'pl-step-textonly__arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.innerHTML = arrowSvg;
        itemsContainer.appendChild(arrow);

        // Create new item
        const newItem = document.createElement('div');
        newItem.className = 'pl-step-textonly__item';
        newItem.style.position = 'relative';

        const label = document.createElement('span');
        label.className = 'pl-step-textonly__label';
        label.setAttribute('contenteditable', 'true');
        label.style.cssText = 'outline:none;cursor:text;';
        label.textContent = `Step ${stepNum}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'pl-step-textonly__content';
        const title = document.createElement('h3');
        title.className = 'pl-step-textonly__title';
        title.setAttribute('contenteditable', 'true');
        title.style.cssText = 'outline:none;cursor:text;';
        title.textContent = '새 단계 제목';
        const desc = document.createElement('p');
        desc.className = 'pl-step-textonly__desc';
        desc.setAttribute('contenteditable', 'true');
        desc.style.cssText = 'outline:none;cursor:text;';
        desc.textContent = '단계 설명을 입력하세요.';
        contentDiv.appendChild(title);
        contentDiv.appendChild(desc);

        newItem.appendChild(label);
        newItem.appendChild(contentDiv);
        mkDeleteBtn(newItem, itemsContainer, 'pl-step-textonly__arrow');
        itemsContainer.appendChild(newItem);
      }
      return;
    }

    // Step image type — add new step item
    if (section.type === 'step' && section.variant === 'type-a-img') {
      const itemsContainer = wrapper.querySelector('.pl-step__items');
      if (!itemsContainer) return;

      // Remove --last from current last item and add arrow
      const prevLast = itemsContainer.querySelector('.pl-step__item--last');
      if (prevLast) {
        prevLast.classList.remove('pl-step__item--last');
        const arrow = document.createElement('div');
        arrow.className = 'pl-step__arrow';
        arrow.innerHTML = `
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M10 24H38M38 24L26 12M38 24L26 36" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        prevLast.appendChild(arrow);
      }

      // Create new step item
      const newItem = document.createElement('div');
      newItem.className = 'pl-step__item pl-step__item--last';

      // Image placeholder
      const imgDiv = document.createElement('div');
      imgDiv.className = 'pl-step__image';
      imgDiv.style.position = 'relative';
      const placeholder = document.createElement('div');
      placeholder.className = 'creative__img-placeholder';
      placeholder.style.width = '320px';
      placeholder.style.minHeight = '320px';
      placeholder.innerHTML = `<input type="text" class="creative__img-placeholder-input" placeholder="설명">`;
      placeholder.querySelector('input').addEventListener('click', e => e.stopPropagation());
      imgDiv.appendChild(placeholder);
      newItem.appendChild(imgDiv);

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'creative__block-delete';
      deleteBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      deleteBtn.title = '스텝 삭제';
      deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (await this.showConfirmModal('이 스텝을 삭제하시겠습니까?')) {
          newItem.remove();
          // Fix last item: remove arrow, add --last
          const remaining = itemsContainer.querySelectorAll('.pl-step__item');
          const newLastItem = remaining[remaining.length - 1];
          if (newLastItem) {
            newLastItem.classList.add('pl-step__item--last');
            newLastItem.querySelector('.pl-step__arrow')?.remove();
          }
        }
      });
      imgDiv.appendChild(deleteBtn);

      itemsContainer.appendChild(newItem);
      return;
    }

    // Review card types — add new review card
    if (section.type === 'review') {
      let reviewContainer;

      if (section.variant === 'type-b-card-grid') {
        const rows = wrapper.querySelectorAll('.pl-review-grid__row');
        reviewContainer = rows[rows.length - 1] || wrapper.querySelector('.pl-review-grid');
      } else if (section.variant === 'type-c-card-slider') {
        reviewContainer = wrapper.querySelector('.pl-review-slider__track');
      } else if (section.variant === 'type-a-highlight') {
        reviewContainer = wrapper.querySelector('.pl-review-track');
      }

      if (!reviewContainer) return;

      // Clone the custom element (attributes only) and reset content
      const tmplEl = reviewContainer.querySelector('pl-review-card');
      if (tmplEl) {
        const newEl = document.createElement('pl-review-card');
        if (tmplEl.hasAttribute('variant')) newEl.setAttribute('variant', tmplEl.getAttribute('variant'));
        newEl.setAttribute('stars', '5');
        newEl.setAttribute('name', '이름');
        newEl.setAttribute('info', '정보');
        newEl.setAttribute('content', '후기 내용을 입력하세요.');
        reviewContainer.appendChild(newEl);
        const renderedCard = newEl.querySelector('.pl-review-card');
        if (renderedCard) this.makeEditableCard(renderedCard);
      } else {
        // Fallback: clone a rendered article directly
        const tmplCard = reviewContainer.querySelector('.pl-review-card');
        if (!tmplCard) return;
        const newCard = tmplCard.cloneNode(true);
        newCard.querySelector('.creative__block-delete')?.remove();
        const content = newCard.querySelector('.pl-review-card__content');
        const name = newCard.querySelector('.pl-review-card__user-name, .pl-review-card__name');
        const info = newCard.querySelector('.pl-review-card__user-info, .pl-review-card__info');
        if (content) content.textContent = '후기 내용을 입력하세요.';
        if (name) name.textContent = '이름';
        if (info) info.textContent = '정보';
        reviewContainer.appendChild(newCard);
        this.makeEditableCard(newCard);
      }
      return;
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
        const isInsideCustomEl = card.parentElement?.tagName?.toLowerCase() === 'pl-review-card';
        (isInsideCustomEl ? card.parentElement : card).remove();
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
      this.scheduleAutoSave(); // 순서 변경 즉시 저장
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
    const hasContent = this.sections.length > 0 || this.headerSection || this.footerSection || this.floatingCtaSection;
    document.getElementById('exportImageBtn').disabled = !hasContent;
    document.getElementById('exportTextBtn').disabled = !hasContent;
  }

  async reset() {
    const hasContent = this.sections.length > 0 || this.headerSection || this.footerSection || this.floatingCtaSection;
    if (!hasContent) return;

    if (await this.showConfirmModal('모든 섹션이 삭제되고 처음 상태로 돌아갑니다.\n이 작업은 되돌릴 수 없습니다.', '전체 초기화', '초기화')) {
      this.sections = [];
      this.headerSection = null;
      this.footerSection = null;
      this.floatingCtaSection = null;
      localStorage.removeItem('pagelab_creative_state');
      const saveStatus = document.getElementById('saveStatus');
      if (saveStatus) saveStatus.textContent = '';

      // Clear main content
      this.mainContent.innerHTML = '';
      this.mainContent.appendChild(this.emptyState);
      this.emptyState.style.display = 'flex';

      // Reset header/footer slots
      this.headerSlot.innerHTML = '';
      this.footerSlot.innerHTML = '';

      // Reset floating CTA slot
      this.floatingCtaSlot.innerHTML = '';
      this.floatingCtaSlot.style.display = 'none';

      this.updateLayersList();
      this.updateUI();
    }
  }

  extractSectionText(wrapper, sectionType) {
    let text = '';
    const extracted = new Set();

    const isHidden = (el) => !!el.closest('[style*="display: none"], [style*="display:none"]');

    // 단일 셀렉터 → 모두 추출 (그룹 없음)
    const extractText = (selector) => {
      const elements = wrapper.querySelectorAll(selector);
      if (elements.length === 0) return;
      elements.forEach(el => {
        if (extracted.has(el) || isHidden(el)) return;
        extracted.add(el);
        const content = el.textContent.trim();
        if (content) text += `${content}\n`;
      });
      text += '\n';
    };

    // 컨테이너 단위로 묶어서 추출 (title + desc 쌍)
    const extractGrouped = (containerSel, ...fieldSelectors) => {
      const containers = wrapper.querySelectorAll(containerSel);
      if (containers.length === 0) return;
      containers.forEach(container => {
        if (extracted.has(container) || isHidden(container)) return;
        extracted.add(container);
        let itemText = '';
        fieldSelectors.forEach(fieldSel => {
          const field = container.querySelector(fieldSel);
          if (field && !extracted.has(field)) {
            extracted.add(field);
            const content = field.textContent.trim();
            if (content) itemText += `${content}\n`;
          }
        });
        if (itemText) text += itemText + '\n';
      });
    };

    // Section title
    extractText('.pl-section-title__label');
    extractText('.pl-section-title__heading');
    extractText('.pl-section-title__desc');
    extractText('.pl-section-title__note');

    // Hero (라벨 포함)
    extractText('.pl-label');
    extractText('.pl-hero__title');
    extractText('.pl-hero__desc');

    // Intro
    extractText('.pl-intro__product-name');
    extractText('.pl-intro__product-subtitle');
    extractText('.pl-intro__feature-text');

    // Cards: 컨테이너별 그루핑
    extractGrouped('.pl-list-card', '.pl-list-card__title', '.pl-list-card__desc');
    extractGrouped('.pl-grid-card', '.pl-grid-card__title', '.pl-grid-card__desc');
    extractGrouped('.pl-slide-card', '.pl-slide-card__title', '.pl-slide-card__desc');
    extractGrouped('.pl-swipe-card', '.pl-swipe-card__title', '.pl-swipe-card__desc');

    // Benefit
    extractGrouped('.pl-benefit__card', '.pl-benefit__card-title', '.pl-benefit__card-sub');

    // Step
    extractGrouped('.pl-step-text__item', '.pl-step-text__title', '.pl-step-text__desc');
    extractGrouped('.pl-step-textonly__item', '.pl-step-textonly__title', '.pl-step-textonly__desc');

    // About feature
    extractGrouped('.pl-about__feature-item',
      '.pl-about__feature-label', '.pl-about__feature-heading', '.pl-about__feature-desc');

    // Review
    extractText('.pl-review-highlight__desc');
    extractGrouped('.pl-review-card', '.pl-review__name', '.pl-review__text, .pl-review-card__content');

    // FAQ
    extractGrouped('.pl-faq__item', '.pl-faq__question', '.pl-faq__answer-title', '.pl-faq__answer-text');

    // CTA
    extractText('.pl-cta__title');
    extractText('.pl-cta__desc');
    extractText('.pl-cta-floating__label, .pl-cta-floating-b__text');

    // Caution
    extractText('.pl-caution__text');

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

    // Image descriptions
    const imgInputs = wrapper.querySelectorAll('.creative__img-placeholder-input');
    const imgDescs = [];
    imgInputs.forEach(input => {
      const val = input.value.trim();
      if (val) imgDescs.push(val);
    });
    if (imgDescs.length > 0) {
      text += '이미지 설명:\n';
      imgDescs.forEach(desc => {
        text += `- ${desc}\n`;
      });
      text += '\n';
    }

    return text;
  }

  // Export as Image
  async exportImage() {
    const hasContent = this.sections.length > 0 || this.headerSection || this.footerSection || this.floatingCtaSection;
    if (!hasContent) return;

    try {
      // Show loading
      const btn = document.getElementById('exportImageBtn');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="creative__loading"></span>';
      btn.disabled = true;

      // Replace inputs/textareas with visible text spans for capture
      const replacements = [];
      this.previewContent.querySelectorAll('.creative__img-placeholder-input').forEach(input => {
        const val = input.value.trim();
        if (val) {
          const span = document.createElement('span');
          span.textContent = val;
          span.style.cssText = `font-size:15px;color:var(--pl-text-primary);white-space:pre-wrap;word-break:break-word;text-align:center;max-width:${input.classList.contains('creative__img-placeholder-input--tab') ? '640px' : '320px'};display:inline-block;`;
          input.style.display = 'none';
          input.parentNode.insertBefore(span, input.nextSibling);
          replacements.push({ input, span });
        }
      });

      // Capture preview content
      const canvas = await html2canvas(this.previewContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Restore inputs
      replacements.forEach(({ input, span }) => {
        input.style.display = '';
        span.remove();
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
    const hasContent = this.sections.length > 0 || this.headerSection || this.footerSection || this.floatingCtaSection;
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

  // ============================================================
  //  저장 / 복원
  // ============================================================

  serializeState() {
    const getHtml = (slot, id) => {
      const w = slot.querySelector(`[data-section-id="${id}"]`);
      if (!w) return null;
      // 편집 흔적 없는 클린 복사본으로 저장
      const clone = w.cloneNode(true);
      clone.querySelectorAll(
        '.creative__text-delete, .creative__block-delete, .creative__tab-delete, .creative__btn-delete'
      ).forEach(el => el.remove());
      clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
      // feature-label 텍스트 span 제거 — 텍스트 노드만 남김 (null이면 라벨 전체 삭제된 것)
      clone.querySelectorAll('.creative__feature-label-text').forEach(span => {
        span.replaceWith(document.createTextNode(span.textContent));
      });
      // 이미지 플레이스홀더 내부 input 제거 (SVG만 남김)
      clone.querySelectorAll('.creative__img-placeholder-input').forEach(el => el.remove());
      // pl-button 웹 컴포넌트를 렌더링된 .pl-btn으로 교체 (복원 시 중복 렌더링 방지)
      // 호스트 클래스(pl-intro__cta-pc 등)도 함께 이전해야 display:none 규칙이 유지됨
      clone.querySelectorAll('pl-button').forEach(plBtn => {
        const rendered = plBtn.querySelector('.pl-btn');
        if (rendered) {
          const btn = rendered.cloneNode(true);
          plBtn.classList.forEach(cls => btn.classList.add(cls));
          plBtn.replaceWith(btn);
        }
      });
      // pl-card 웹 컴포넌트를 렌더링된 .pl-card로 교체
      clone.querySelectorAll('pl-card').forEach(plCard => {
        const rendered = plCard.querySelector('.pl-card');
        if (rendered) plCard.replaceWith(rendered.cloneNode(true));
      });
      return clone.innerHTML;
    };

    return {
      version: STATE_VERSION,
      savedAt: new Date().toISOString(),
      device: this.currentDevice,
      theme: this.currentTheme,
      headerSection: this.headerSection ? {
        id: this.headerSection.id, type: this.headerSection.type,
        variant: this.headerSection.variant, name: this.headerSection.name,
        html: getHtml(this.headerSlot, this.headerSection.id)
      } : null,
      floatingCtaSection: this.floatingCtaSection ? {
        id: this.floatingCtaSection.id, type: this.floatingCtaSection.type,
        variant: this.floatingCtaSection.variant, name: this.floatingCtaSection.name,
        cardStyle: this.floatingCtaSection.cardStyle, btnCount: this.floatingCtaSection.btnCount,
        html: getHtml(this.floatingCtaSlot, this.floatingCtaSection.id)
      } : null,
      footerSection: this.footerSection ? {
        id: this.footerSection.id, type: this.footerSection.type,
        variant: this.footerSection.variant, name: this.footerSection.name,
        html: getHtml(this.footerSlot, this.footerSection.id)
      } : null,
      sections: this.sections.map(s => ({
        id: s.id, type: s.type, variant: s.variant, name: s.name,
        cardStyle: s.cardStyle, cardCount: s.cardCount, btnCount: s.btnCount,
        hasAddCard: s.hasAddCard, hasStyleControl: s.hasStyleControl,
        html: getHtml(this.mainContent, s.id)
      })),
      sectionId: this.sectionId
    };
  }

  saveState(showToast = false) {
    try {
      localStorage.setItem('pagelab_creative_state', JSON.stringify(this.serializeState()));
      this.updateSaveStatus();
      if (showToast) this.showSaveToast();
    } catch (e) {
      console.warn('저장 실패:', e);
    }
  }

  showSaveToast() {
    let toast = document.getElementById('saveToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'saveToast';
      toast.className = 'creative__save-toast';
      toast.textContent = '저장되었습니다.';
      document.body.appendChild(toast);
    }
    toast.classList.remove('is-visible');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('is-visible');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2000);
      });
    });
  }

  updateSaveStatus() {
    const el = document.getElementById('saveStatus');
    if (!el) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `저장됨 ${hh}:${mm}`;
    el.classList.add('is-saved');
    clearTimeout(this._saveStatusTimer);
    this._saveStatusTimer = setTimeout(() => el.classList.remove('is-saved'), 2000);
  }

  scheduleAutoSave(delay = 0) {
    if (this._suppressAutoSave) return;
    clearTimeout(this._autoSaveTimer);
    this._autoSaveTimer = setTimeout(() => this.saveState(), delay);
  }

  async restoreState() {
    try {
      const raw = localStorage.getItem('pagelab_creative_state');
      if (!raw) return false;
      const state = JSON.parse(raw);
      if (!state) return false;

      // 버전이 다르면 구버전 캐시 무효화
      if ((state.version || 1) < STATE_VERSION) {
        localStorage.removeItem('pagelab_creative_state');
        return false;
      }

      this.sectionId = state.sectionId || 0;

      const renderSaved = (section, slot, position) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'creative__section-wrapper';
        wrapper.dataset.sectionId = section.id;
        wrapper.dataset.fixed = position;
        wrapper.innerHTML = section.html;
        const placeholder = slot.querySelector('.creative__fixed-placeholder');
        if (placeholder) placeholder.remove();
        slot.appendChild(wrapper);
        if (position === 'floating-cta') slot.style.display = '';
        requestAnimationFrame(() => {
          this.makeEditable(wrapper);
          this.initSectionJS(wrapper, section.type);
        });
      };

      if (state.headerSection?.html) {
        this.headerSection = state.headerSection;
        renderSaved(state.headerSection, this.headerSlot, 'header');
      }

      if (state.floatingCtaSection?.html) {
        this.floatingCtaSection = state.floatingCtaSection;
        renderSaved(state.floatingCtaSection, this.floatingCtaSlot, 'floating-cta');
      }

      if (state.footerSection?.html) {
        this.footerSection = state.footerSection;
        renderSaved(state.footerSection, this.footerSlot, 'footer');
      }

      for (const s of (state.sections || [])) {
        if (!s.html) continue;
        this.sections.push(s);
        const wrapper = document.createElement('div');
        wrapper.className = 'creative__section-wrapper';
        wrapper.dataset.sectionId = s.id;
        wrapper.innerHTML = s.html;
        this.emptyState.style.display = 'none';
        this.mainContent.appendChild(wrapper);
        requestAnimationFrame(() => {
          this.makeEditable(wrapper);
          this.initSectionJS(wrapper, s.type);
        });
      }

      if (state.device) this.switchDevice(state.device);
      if (state.theme) this.switchTheme(state.theme);

      this.updateLayersList();
      this.updateUI();
      this.updateSaveStatus();
      return true;
    } catch (e) {
      console.warn('복원 실패:', e);
      return false;
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  window.sectionCreative = new SectionCreative();
  await window.sectionCreative.restoreState();
  await window.sectionCreative.loadDefaultFixedSections();

  // 저장 버튼
  document.getElementById('saveBtn')?.addEventListener('click', () => {
    window.sectionCreative.saveState(true);
  });

  // 페이지 이탈 시 자동저장
  window.addEventListener('beforeunload', () => {
    window.sectionCreative.saveState();
  });

  // 사용법 모달
  function showHelpModal() {
    const modal = document.getElementById('helpModal');
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('is-visible'), 10);
  }

  function hideHelpModal() {
    const modal = document.getElementById('helpModal');
    if (!modal) return;
    modal.classList.remove('is-visible');
    setTimeout(() => modal.style.display = 'none', 200);
  }

  document.getElementById('helpBtn')?.addEventListener('click', showHelpModal);
  document.getElementById('helpClose')?.addEventListener('click', hideHelpModal);
  document.getElementById('helpModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideHelpModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('helpModal')?.classList.contains('is-visible')) {
      hideHelpModal();
    }
  });
});
