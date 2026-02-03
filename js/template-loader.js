/* ============================================
   PageLab - Template Loader Module
   Dynamically loads and combines sections
   ============================================ */

class TemplateLoader {
  constructor(templateId) {
    this.templateId = templateId;
    this.template = null;
    this.sectionLabels = {};
    this.loadedSections = [];
  }

  /**
   * Initialize the template loader
   */
  async init() {
    try {
      // 1. Load template definition
      const response = await fetch('../data/templates.json');
      if (!response.ok) throw new Error('Failed to load templates.json');

      const data = await response.json();
      this.template = data.templates.find(t => t.id === this.templateId);
      this.sectionLabels = data.sectionLabels;

      if (!this.template) {
        throw new Error(`Template "${this.templateId}" not found`);
      }

      // 2. Update page title
      document.title = `${this.template.name} | PageLab`;
      const titleEl = document.querySelector('.template-preview__title');
      if (titleEl) titleEl.textContent = this.template.name;

      // 3. Render section navigation
      this.renderSectionNav();

      // 4. Load and render all sections
      await this.loadAllSections();

      // 5. Initialize section scripts (FAQ accordion, etc.)
      this.initSectionScripts();

      // 6. Initialize device switcher
      this.initDeviceSwitcher();

      // 7. Initialize scroll spy
      this.initScrollSpy();

    } catch (error) {
      console.error('Template loading failed:', error);
      this.showError(error.message);
    }
  }

  /**
   * Load all sections and render them
   */
  async loadAllSections() {
    const container = document.getElementById('sectionContainer');
    container.innerHTML = ''; // Remove loading indicator

    // 1. Load GNB first
    await this.loadGnbFooter(container, 'gnb');

    // 2. Load all template sections
    for (const section of this.template.sections) {
      try {
        const html = await this.extractSectionFromOriginal(section.type, section.variant);

        if (html) {
          // Adjust image paths
          const adjustedHtml = this.adjustImagePaths(html);

          // Create section wrapper
          const wrapper = document.createElement('div');
          wrapper.className = 'template-section';
          wrapper.dataset.sectionType = section.type;
          wrapper.dataset.sectionVariant = section.variant;
          wrapper.id = `section-${section.type}-${section.variant}`;
          wrapper.innerHTML = adjustedHtml;

          container.appendChild(wrapper);
          this.loadedSections.push(wrapper);
        }
      } catch (error) {
        console.warn(`Failed to load section: ${section.type}/${section.variant}`, error);
      }
    }

    // 3. Load Footer last
    await this.loadGnbFooter(container, 'footer');
  }

  /**
   * Load GNB or Footer from navigation section
   */
  async loadGnbFooter(container, type) {
    try {
      const path = '../sections/navigation/type-a-gnb-footer.html';
      const response = await fetch(path);
      if (!response.ok) return;

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      let element;
      if (type === 'gnb') {
        element = doc.querySelector('.pl-gnb');
        // Also get mobile overlay
        const overlay = doc.querySelector('.pl-gnb__mobile-overlay');
        if (element) {
          const adjustedHtml = this.adjustImagePaths(element.outerHTML + (overlay ? overlay.outerHTML : ''));
          const wrapper = document.createElement('div');
          wrapper.className = 'template-section template-section--gnb';
          wrapper.innerHTML = adjustedHtml;
          container.appendChild(wrapper);
        }
      } else if (type === 'footer') {
        element = doc.querySelector('.pl-footer');
        if (element) {
          const adjustedHtml = this.adjustImagePaths(element.outerHTML);
          const wrapper = document.createElement('div');
          wrapper.className = 'template-section template-section--footer';
          wrapper.innerHTML = adjustedHtml;
          container.appendChild(wrapper);
        }
      }
    } catch (error) {
      console.warn(`Failed to load ${type}:`, error);
    }
  }

  /**
   * Extract section markup from original file
   */
  async extractSectionFromOriginal(type, variant) {
    const path = `../sections/${type}/${variant}.html`;

    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();

      // Parse HTML and extract section content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Find section element within preview-content
      const section = doc.querySelector('.preview-content > section') ||
                      doc.querySelector('.preview-content > .pl-section') ||
                      doc.querySelector('.preview-content > footer') ||
                      doc.querySelector('.preview-content > header');

      if (section) {
        return section.outerHTML;
      }

      // Fallback: try to find any main section element
      const fallbackSection = doc.querySelector('section.pl-section') ||
                              doc.querySelector('.pl-hero') ||
                              doc.querySelector('.pl-about') ||
                              doc.querySelector('.pl-intro') ||
                              doc.querySelector('.pl-review') ||
                              doc.querySelector('.pl-benefit') ||
                              doc.querySelector('.pl-step') ||
                              doc.querySelector('.pl-cta') ||
                              doc.querySelector('.pl-faq');

      return fallbackSection ? fallbackSection.outerHTML : '';

    } catch (error) {
      console.error(`Error loading ${path}:`, error);
      return '';
    }
  }

  /**
   * Adjust image paths for template context
   */
  adjustImagePaths(html) {
    // Convert relative paths to work from templates/ directory
    return html
      .replace(/\.\/\.\.\/\.\.\/images\//g, '../images/')
      .replace(/\.\.\/\.\.\/images\//g, '../images/')
      .replace(/src="images\//g, 'src="../images/')
      .replace(/url\(['"]?\.\/\.\.\/\.\.\/images\//g, "url('../images/")
      .replace(/url\(['"]?\.\.\/\.\.\/images\//g, "url('../images/");
  }

  /**
   * Render section navigation sidebar
   */
  renderSectionNav() {
    const nav = document.getElementById('sectionNav');
    if (!nav) return;

    nav.innerHTML = this.template.sections.map((section, index) => `
      <li class="template-preview__nav-item">
        <a href="#section-${section.type}-${section.variant}"
           class="template-preview__nav-link"
           data-index="${index}">
          <span class="template-preview__nav-number">${index + 1}</span>
          <span class="template-preview__nav-label">${this.sectionLabels[section.type] || section.type}</span>
        </a>
      </li>
    `).join('');

    // Add click handlers for smooth scroll
    nav.querySelectorAll('.template-preview__nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /**
   * Initialize section-specific scripts
   */
  initSectionScripts() {
    this.initFaqAccordion();
    this.initTabs();
    this.initResponsiveImages();
    this.initMobileMenu();
    this.initFooterToggle();
  }

  /**
   * Initialize mobile menu toggle
   */
  initMobileMenu() {
    const menuBtn = document.querySelector('.pl-gnb__mobile-menu');
    const closeBtn = document.querySelector('.pl-gnb__mobile-close');
    const overlay = document.querySelector('.pl-gnb__mobile-overlay');

    if (menuBtn && overlay) {
      menuBtn.addEventListener('click', () => {
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeBtn && overlay) {
      closeBtn.addEventListener('click', () => {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    }

    // Close on overlay background click
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });
    }
  }

  /**
   * Initialize footer company info toggle
   */
  initFooterToggle() {
    const toggleBtn = document.querySelector('.pl-footer__company-toggle');
    const addressEl = document.querySelector('.pl-footer__address');

    if (toggleBtn && addressEl) {
      toggleBtn.addEventListener('click', () => {
        const isExpanded = toggleBtn.classList.contains('is-expanded');
        toggleBtn.classList.toggle('is-expanded');
        addressEl.classList.toggle('is-visible');
      });
    }
  }

  /**
   * Initialize FAQ accordion functionality
   */
  initFaqAccordion() {
    const faqItems = document.querySelectorAll('.pl-faq__item');

    faqItems.forEach(item => {
      const header = item.querySelector('.pl-faq__header');

      if (header) {
        header.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');

          // Close all other items (optional - remove for multi-open)
          // faqItems.forEach(i => i.classList.remove('is-open'));

          if (isOpen) {
            item.classList.remove('is-open');
            header.setAttribute('aria-expanded', 'false');
          } else {
            item.classList.add('is-open');
            header.setAttribute('aria-expanded', 'true');
          }
        });
      }
    });
  }

  /**
   * Initialize tab functionality
   */
  initTabs() {
    const tabContainers = document.querySelectorAll('.pl-tab');

    tabContainers.forEach(container => {
      const tabs = container.querySelectorAll('.pl-tab__button');
      const panels = container.querySelectorAll('.pl-tab__panel');

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
          // Remove active state from all
          tabs.forEach(t => t.classList.remove('is-active'));
          panels.forEach(p => p.classList.remove('is-active'));

          // Activate clicked tab
          tab.classList.add('is-active');
          if (panels[index]) {
            panels[index].classList.add('is-active');
          }
        });
      });
    });
  }

  /**
   * Initialize responsive images based on device
   */
  initResponsiveImages() {
    this.updateResponsiveImages('pc');
  }

  /**
   * Update responsive images for device type
   */
  updateResponsiveImages(device) {
    const images = document.querySelectorAll('.responsive-img, [data-pc], [data-tabmo]');

    images.forEach(img => {
      if (device === 'pc' && img.dataset.pc) {
        img.src = this.adjustImagePaths(img.dataset.pc).replace('../images/', '../images/');
      } else if ((device === 'tablet' || device === 'mobile') && img.dataset.tabmo) {
        img.src = this.adjustImagePaths(img.dataset.tabmo).replace('../images/', '../images/');
      }
    });
  }

  /**
   * Initialize device switcher
   */
  initDeviceSwitcher() {
    const buttons = document.querySelectorAll('.device-btn');
    const frame = document.getElementById('previewFrame');

    if (!buttons.length || !frame) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        buttons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        // Update frame device
        const device = btn.dataset.device;
        frame.dataset.device = device;

        // Update responsive images
        this.updateResponsiveImages(device);
      });
    });
  }

  /**
   * Initialize scroll spy for navigation
   */
  initScrollSpy() {
    const navLinks = document.querySelectorAll('.template-preview__nav-link');
    const sections = this.loadedSections;

    if (!navLinks.length || !sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;

          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
              link.classList.add('is-active');
            } else {
              link.classList.remove('is-active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(section => observer.observe(section));
  }

  /**
   * Show error message
   */
  showError(message) {
    const container = document.getElementById('sectionContainer');
    if (container) {
      container.innerHTML = `
        <div class="template-preview__error">
          <p>템플릿을 불러오는 중 오류가 발생했습니다.</p>
          <p>${message}</p>
          <a href="../guide.html" class="template-preview__error-link">가이드로 돌아가기</a>
        </div>
      `;
    }
  }
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TemplateLoader };
}
