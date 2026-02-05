/**
 * Section Creative - Interactive Page Builder
 * Allows users to select, combine, edit, and export sections
 */

class SectionCreative {
  constructor() {
    this.sections = [];
    this.sectionId = 0;
    this.currentDevice = 'pc';

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
          html
        };

        this.sections.push(section);
        this.renderSection(section);
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

    // Make text elements editable
    this.makeEditable(wrapper);

    // Add to preview
    this.previewContent.appendChild(wrapper);

    // Initialize section-specific JS
    this.initSectionJS(wrapper, section.type);
  }

  makeEditable(wrapper) {
    // Find all text elements and make them editable
    const textElements = wrapper.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, span:not(.pl-label):not([class*="icon"]), ' +
      '.pl-hero__title, .pl-hero__desc, ' +
      '.pl-section-title__heading, .pl-section-title__label, .pl-section-title__description, ' +
      '.pl-list-card__title, .pl-list-card__desc, ' +
      '.pl-benefit__card-title, .pl-benefit__card-sub, ' +
      '.pl-step-text__title, .pl-step-text__desc, ' +
      '.pl-faq__question, .pl-faq__answer-title, .pl-faq__answer-text, ' +
      '.pl-cta__title, .pl-cta__desc, ' +
      '.pl-btn, .pl-cta__btn'
    );

    textElements.forEach(el => {
      // Skip if it's an image, icon, or already has contenteditable
      if (el.querySelector('img, svg') || el.hasAttribute('contenteditable')) {
        return;
      }

      // Skip if parent is a link (for buttons)
      if (el.tagName === 'A') {
        el.setAttribute('contenteditable', 'true');
        el.addEventListener('click', (e) => e.preventDefault());
      } else if (!el.closest('a')) {
        el.setAttribute('contenteditable', 'true');
      }
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

    if (this.sections.length === 0) {
      this.layersList.innerHTML = '<div class="creative__layers-empty">추가된 섹션이 없습니다</div>';
      return;
    }

    this.sections.forEach((section, index) => {
      const layer = document.createElement('div');
      layer.className = 'creative__layer';
      layer.dataset.sectionId = section.id;
      layer.draggable = true;
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

      // Delete button
      layer.querySelector('.creative__layer-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeSection(section.id);
      });

      // Drag events
      layer.addEventListener('dragstart', (e) => this.handleDragStart(e, section.id));
      layer.addEventListener('dragover', (e) => this.handleDragOver(e));
      layer.addEventListener('drop', (e) => this.handleDrop(e, section.id));
      layer.addEventListener('dragend', () => this.handleDragEnd());

      this.layersList.appendChild(layer);
    });
  }

  removeSection(id) {
    // Remove from array
    const index = this.sections.findIndex(s => s.id === id);
    if (index > -1) {
      this.sections.splice(index, 1);
    }

    // Remove from DOM
    const wrapper = this.previewContent.querySelector(`[data-section-id="${id}"]`);
    if (wrapper) {
      wrapper.remove();
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
    // Reorder sections in preview
    this.sections.forEach(section => {
      const wrapper = this.previewContent.querySelector(`[data-section-id="${section.id}"]`);
      if (wrapper) {
        this.previewContent.appendChild(wrapper);
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

  updateUI() {
    // Update section count
    this.sectionCount.textContent = `${this.sections.length}개 섹션`;

    // Show/hide empty state
    this.emptyState.style.display = this.sections.length === 0 ? 'flex' : 'none';

    // Enable/disable export buttons
    const hasContent = this.sections.length > 0;
    document.getElementById('exportImageBtn').disabled = !hasContent;
    document.getElementById('exportTextBtn').disabled = !hasContent;
  }

  reset() {
    if (this.sections.length === 0) return;

    if (confirm('모든 섹션을 초기화하시겠습니까?')) {
      this.sections = [];
      this.previewContent.innerHTML = '';
      this.previewContent.appendChild(this.emptyState);
      this.emptyState.style.display = 'flex';
      this.updateLayersList();
      this.updateUI();
    }
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
    if (this.sections.length === 0) return;

    let textContent = '=== PageLab Section Creative ===\n';
    textContent += `생성일: ${new Date().toLocaleString('ko-KR')}\n`;
    textContent += `섹션 수: ${this.sections.length}개\n`;
    textContent += '\n';

    this.sections.forEach((section, index) => {
      const wrapper = this.previewContent.querySelector(`[data-section-id="${section.id}"]`);
      if (!wrapper) return;

      textContent += `\n${'='.repeat(50)}\n`;
      textContent += `[${index + 1}] ${this.sectionNames[section.type] || section.type} - ${section.name}\n`;
      textContent += `${'='.repeat(50)}\n\n`;

      // Extract text content by element type
      const extractText = (selector, label) => {
        const elements = wrapper.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach(el => {
            const text = el.textContent.trim();
            if (text && text.length > 0) {
              textContent += `${text}\n`;
            }
          });
          textContent += '\n';
        }
      };

      // Section title
      extractText('.pl-section-title__label', '라벨');
      extractText('.pl-section-title__heading, h1, h2', '제목');
      extractText('.pl-section-title__description', '설명');

      // Hero
      extractText('.pl-hero__title', '헤드라인');
      extractText('.pl-hero__desc', '설명');

      // Cards and items
      extractText('.pl-list-card__title, .pl-benefit__card-title, .pl-step-text__title', '항목 제목');
      extractText('.pl-list-card__desc, .pl-benefit__card-sub, .pl-step-text__desc', '항목 설명');

      // FAQ
      extractText('.pl-faq__question', '질문');
      extractText('.pl-faq__answer-title, .pl-faq__answer-text', '답변');

      // CTA
      extractText('.pl-cta__title', 'CTA 제목');
      extractText('.pl-cta__desc', 'CTA 설명');

      // Buttons
      const buttons = wrapper.querySelectorAll('.pl-btn, .pl-cta__btn');
      if (buttons.length > 0) {
        textContent += '버튼:\n';
        buttons.forEach(btn => {
          const text = btn.textContent.trim();
          if (text) textContent += `- ${text}\n`;
        });
        textContent += '\n';
      }
    });

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
