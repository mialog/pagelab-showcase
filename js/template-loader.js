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
    this.currentDevice = 'pc';
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

      // 6. Initialize device switcher (both header and sidebar)
      this.initDeviceSwitcher();

      // 7. Initialize GNB menu anchors
      this.initGnbMenu();

      // 8. Initialize scroll spy
      this.initScrollSpy();

      // 9. Initialize top button
      this.initTopButton();

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

    // 1. Load GNB first (with dark option if specified)
    await this.loadGnbFooter(container, 'gnb', this.template.darkGnb);

    // 2. Load all template sections
    for (let i = 0; i < this.template.sections.length; i++) {
      const section = this.template.sections[i];
      try {
        const html = await this.extractSectionFromOriginal(section.type, section.variant, section.cardType);

        if (html) {
          // Adjust image paths
          const adjustedHtml = this.adjustImagePaths(html);

          // Create section wrapper
          const wrapper = document.createElement('div');
          wrapper.className = 'template-section';
          wrapper.dataset.sectionType = section.type;
          wrapper.dataset.sectionVariant = section.variant;
          // 커스텀 라벨이 있으면 인덱스를 붙여서 고유 ID 생성
          wrapper.id = `section-${section.type}-${section.variant}${section.label ? '-' + i : ''}`;
          wrapper.innerHTML = adjustedHtml;

          container.appendChild(wrapper);
          this.loadedSections.push(wrapper);
        }
      } catch (error) {
        console.warn(`Failed to load section: ${section.type}/${section.variant}`, error);
      }
    }

    // 3. Load Footer last (with dark option if specified)
    await this.loadGnbFooter(container, 'footer', this.template.darkFooter);

    // 4. Load Floating CTA if specified
    if (this.template.floatingCta) {
      await this.loadFloatingCta(this.template.floatingCta);
      // Set initial position for PC
      this.updateFloatingCtaPosition('pc');
    }
  }

  /**
   * Load floating CTA component (buttons only)
   */
  async loadFloatingCta(variant) {
    try {
      const path = `../sections/cta/${variant}.html`;
      const response = await fetch(path);
      if (!response.ok) return;

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Try both floating CTA structures:
      // type-b: .pl-cta-floating__buttons
      // type-c: .pl-cta-floating-b (entire bar with text + buttons)
      let floatingElement = doc.querySelector('.pl-cta-floating__buttons');
      let wrapperClass = 'pl-cta pl-cta--floating';

      // If type-b not found, try type-c structure
      if (!floatingElement) {
        floatingElement = doc.querySelector('.pl-cta-floating-b');
        wrapperClass = 'pl-cta pl-cta--floating pl-cta--floating-b';
      }

      if (floatingElement) {
        const adjustedHtml = this.adjustImagePaths(floatingElement.outerHTML);

        // Create wrapper with floating CTA structure
        const wrapper = document.createElement('div');
        wrapper.className = 'template-section template-section--floating';
        wrapper.innerHTML = `<div class="${wrapperClass}">${adjustedHtml}</div>`;

        const frame = document.getElementById('previewFrame');
        if (frame) {
          frame.appendChild(wrapper);
        }
      }
    } catch (error) {
      console.warn(`Failed to load floating CTA: ${variant}`, error);
    }
  }

  /**
   * Load GNB or Footer from navigation section
   * @param {HTMLElement} container - Container element
   * @param {string} type - 'gnb' or 'footer'
   * @param {boolean} dark - Whether to use dark theme
   */
  async loadGnbFooter(container, type, dark = false) {
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
          // Add dark class if specified
          if (dark) {
            element.classList.add('pl-gnb--dark');
            // Update logo to dark version
            const logo = element.querySelector('#gnbLogo');
            if (logo && logo.dataset.dark) {
              logo.src = logo.dataset.dark;
            }
            // Also update mobile overlay logo to dark version
            if (overlay) {
              const overlayLogo = overlay.querySelector('.pl-gnb__logo img');
              if (overlayLogo && logo && logo.dataset.dark) {
                overlayLogo.src = logo.dataset.dark;
              }
            }
          }
          const adjustedHtml = this.adjustImagePaths(element.outerHTML + (overlay ? overlay.outerHTML : ''));
          const wrapper = document.createElement('div');
          wrapper.className = 'template-section template-section--gnb';
          wrapper.innerHTML = adjustedHtml;
          container.appendChild(wrapper);
        }
      } else if (type === 'footer') {
        element = doc.querySelector('.pl-footer');
        if (element) {
          // Add dark class if specified
          if (dark) {
            element.classList.add('pl-footer--dark');
            // Update logo to dark version
            const logo = element.querySelector('#footerLogo');
            if (logo && logo.dataset.dark) {
              logo.src = logo.dataset.dark;
            }
          }
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
  async extractSectionFromOriginal(type, variant, cardType = null) {
    const path = `../sections/${type}/${variant}.html`;

    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();

      // Parse HTML and extract section content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // If cardType is specified, find the specific card type section
      if (cardType) {
        const cardTypeSection = doc.querySelector(`.card-type-section[data-card-type="${cardType}"] > section`);
        if (cardTypeSection) {
          return cardTypeSection.outerHTML;
        }
      }

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
                              doc.querySelector('.pl-faq') ||
                              doc.querySelector('.pl-caution');

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

    nav.innerHTML = this.template.sections.map((section, index) => {
      // 커스텀 라벨 지원: section.label이 있으면 사용, 없으면 sectionLabels에서 가져옴
      const label = section.label || this.sectionLabels[section.type] || section.type;
      return `
      <li class="template-preview__nav-item">
        <a href="#section-${section.type}-${section.variant}${section.label ? '-' + index : ''}"
           class="template-preview__nav-link"
           data-index="${index}">
          <span class="template-preview__nav-number">${index + 1}</span>
          <span class="template-preview__nav-label">${label}</span>
        </a>
      </li>
    `;
    }).join('');

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
    this.initSwipeCarousel();
    this.initResponsiveImages();
    this.initMobileMenu();
    this.initFooterToggle();
    this.initGnbScroll();
    this.initFooterDropdown();
  }

  /**
   * Initialize GNB scroll effect (blur background)
   */
  initGnbScroll() {
    const gnb = document.querySelector('.pl-gnb');
    const previewContent = document.querySelector('.template-preview__content');

    if (!gnb) return;

    const handleScroll = (scrollTop) => {
      if (scrollTop > 0) {
        gnb.classList.add('is-scrolled');
      } else {
        gnb.classList.remove('is-scrolled');
      }
    };

    // Listen to content scroll (for tablet/mobile frame)
    if (previewContent) {
      previewContent.addEventListener('scroll', () => {
        handleScroll(previewContent.scrollTop);
      });
    }

    // Also listen to window scroll (for PC mode)
    window.addEventListener('scroll', () => {
      handleScroll(window.scrollY);
    });
  }

  /**
   * Initialize GNB menu items as section anchors
   */
  initGnbMenu() {
    const gnbMenu = this.template.gnbMenu;
    if (!gnbMenu || !gnbMenu.length) return;

    const desktopItems = document.querySelectorAll('.pl-gnb__menu-item');
    const mobileItems = document.querySelectorAll('.pl-gnb__mobile-nav-item');

    // Build section ID map from gnbMenu config
    gnbMenu.forEach((menuItem, i) => {
      const section = this.template.sections[menuItem.sectionIndex];
      if (!section) return;

      const sectionId = `section-${section.type}-${section.variant}${section.label ? '-' + menuItem.sectionIndex : ''}`;

      // Update desktop menu item
      if (desktopItems[i]) {
        desktopItems[i].textContent = menuItem.label;
        desktopItems[i].setAttribute('href', `#${sectionId}`);
        desktopItems[i].dataset.sectionId = sectionId;
        desktopItems[i].addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.getElementById(sectionId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }

      // Update mobile menu item
      if (mobileItems[i]) {
        mobileItems[i].textContent = menuItem.label;
        mobileItems[i].setAttribute('href', `#${sectionId}`);
        mobileItems[i].dataset.sectionId = sectionId;
        mobileItems[i].addEventListener('click', (e) => {
          e.preventDefault();
          // Close mobile menu first
          if (window.toggleMobileMenu) window.toggleMobileMenu();
          setTimeout(() => {
            const target = document.getElementById(sectionId);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 300);
        });
      }
    });

    // Hide extra menu items if there are fewer than 5
    for (let i = gnbMenu.length; i < desktopItems.length; i++) {
      desktopItems[i].style.display = 'none';
    }
    for (let i = gnbMenu.length; i < mobileItems.length; i++) {
      mobileItems[i].style.display = 'none';
    }
  }

  /**
   * Initialize footer family site dropdown
   */
  initFooterDropdown() {
    const dropdowns = document.querySelectorAll('.pl-footer__dropdown');

    dropdowns.forEach(dropdown => {
      dropdown.addEventListener('click', (e) => {
        e.stopPropagation();

        // Close other dropdowns
        dropdowns.forEach(d => {
          if (d !== dropdown) {
            d.classList.remove('is-open');
          }
        });

        // Toggle current dropdown
        dropdown.classList.toggle('is-open');
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.pl-footer__dropdown-wrapper')) {
        dropdowns.forEach(dropdown => {
          dropdown.classList.remove('is-open');
        });
      }
    });
  }

  /**
   * Initialize mobile menu toggle
   */
  initMobileMenu() {
    const overlay = document.querySelector('.pl-gnb__mobile-overlay');
    const gnb = document.querySelector('.pl-gnb');
    const content = document.querySelector('.template-preview__content');
    const self = this;

    // Define global toggleMobileMenu function for inline onclick handlers
    window.toggleMobileMenu = function() {
      if (!overlay) return;

      const isOpen = overlay.classList.contains('is-open');

      if (!isOpen) {
        // Open menu
        if (content && self.currentDevice !== 'pc') {
          // Sticky GNB section is already at top: 0, so overlay should also be at top: 0
          // Don't set scrollTop - that would push it below the visible area
          overlay.style.top = '0';
          content.classList.add('menu-open');
        }
        overlay.classList.add('is-open');
        if (gnb) gnb.classList.add('is-menu-open');
        document.body.style.overflow = 'hidden';
      } else {
        // Close menu
        if (content) {
          content.classList.remove('menu-open');
        }
        overlay.classList.remove('is-open');
        if (gnb) gnb.classList.remove('is-menu-open');
        document.body.style.overflow = '';
      }
    };

    // Close on overlay background click
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          window.toggleMobileMenu();
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
        toggleBtn.classList.toggle('is-expanded');
        addressEl.classList.toggle('is-open'); // CSS에서 .is-open 사용
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
    const tabContainers = document.querySelectorAll('.pl-tab-container');

    tabContainers.forEach(container => {
      const tabs = container.querySelectorAll('.pl-tab-btn');
      const panels = container.querySelectorAll('.pl-tab-panel');

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const targetTab = tab.dataset.tab;

          // Remove active state from all tabs and panels in this container
          tabs.forEach(t => t.classList.remove('is-active'));
          panels.forEach(p => p.classList.remove('is-active'));

          // Activate clicked tab and corresponding panel
          tab.classList.add('is-active');
          const targetPanel = container.querySelector(`.pl-tab-panel[data-tab="${targetTab}"]`);
          if (targetPanel) {
            targetPanel.classList.add('is-active');
          }

          // Also sync mobile/desktop nav tabs with same data-tab
          container.querySelectorAll(`.pl-tab-btn[data-tab="${targetTab}"]`).forEach(t => {
            t.classList.add('is-active');
          });
        });
      });
    });
  }

  /**
   * Initialize swipe carousel functionality
   */
  initSwipeCarousel() {
    // Prev buttons
    document.querySelectorAll('.pl-swipe-btn--prev').forEach(btn => {
      btn.addEventListener('click', () => {
        const track = btn.closest('.pl-swipe-container').querySelector('.pl-swipe-track');
        if (track) {
          const cardWidth = track.querySelector('.pl-swipe-card')?.offsetWidth || 320;
          track.scrollBy({ left: -cardWidth - 24, behavior: 'smooth' });
        }
      });
    });

    // Next buttons
    document.querySelectorAll('.pl-swipe-btn--next').forEach(btn => {
      btn.addEventListener('click', () => {
        const track = btn.closest('.pl-swipe-container').querySelector('.pl-swipe-track');
        if (track) {
          const cardWidth = track.querySelector('.pl-swipe-card')?.offsetWidth || 320;
          track.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
        }
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
   * Initialize device switcher (both header and sidebar)
   */
  initDeviceSwitcher() {
    const allButtons = document.querySelectorAll('.device-btn');
    const frame = document.getElementById('previewFrame');

    if (!allButtons.length || !frame) return;

    allButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state for ALL device buttons (sync header & sidebar)
        const device = btn.dataset.device;
        this.currentDevice = device;

        allButtons.forEach(b => {
          if (b.dataset.device === device) {
            b.classList.add('is-active');
          } else {
            b.classList.remove('is-active');
          }
        });

        // Update frame device
        frame.dataset.device = device;

        // Update responsive images
        this.updateResponsiveImages(device);

        // Update floating CTA position
        this.updateFloatingCtaPosition(device);
      });
    });

    // Update floating CTA position on window resize
    window.addEventListener('resize', () => {
      this.updateFloatingCtaPosition(this.currentDevice);
    });
  }

  /**
   * Update floating CTA position based on device
   */
  updateFloatingCtaPosition(device) {
    const floatingCta = document.querySelector('.template-section--floating');
    const frame = document.getElementById('previewFrame');
    if (!floatingCta || !frame) return;

    // Remove all device classes
    floatingCta.classList.remove('is-pc', 'is-tablet', 'is-mobile');
    floatingCta.classList.add(`is-${device}`);

    // Calculate and apply inline styles for tablet/mobile
    if (device === 'pc') {
      // PC: full width within container
      floatingCta.style.left = '';
      floatingCta.style.right = '';
      floatingCta.style.maxWidth = '';
    } else {
      // Calculate immediately with current frame size
      this.positionFloatingCtaToFrame(floatingCta, frame, device);
      // Also recalculate after CSS transition completes (300ms in CSS)
      setTimeout(() => {
        this.positionFloatingCtaToFrame(floatingCta, frame, device);
      }, 350);
    }
  }

  /**
   * Position floating CTA to match frame boundaries
   */
  positionFloatingCtaToFrame(floatingCta, frame, device) {
    const frameRect = frame.getBoundingClientRect();

    // Apply inline styles to match frame position
    floatingCta.style.left = `${frameRect.left}px`;
    floatingCta.style.right = `${window.innerWidth - frameRect.right}px`;
    floatingCta.style.maxWidth = `${frameRect.width}px`;
  }

  /**
   * Initialize top button
   */
  initTopButton() {
    const topBtn = document.getElementById('topBtn');
    if (!topBtn) return;

    topBtn.addEventListener('click', () => {
      // Try scrolling the content element first (for tablet/mobile)
      const previewContent = document.querySelector('.template-preview__content');
      if (previewContent && previewContent.scrollTop > 0) {
        previewContent.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /**
   * Initialize scroll spy for navigation
   */
  initScrollSpy() {
    const navLinks = document.querySelectorAll('.template-preview__nav-link');
    const gnbDesktopItems = document.querySelectorAll('.pl-gnb__menu-item[data-section-id]');
    const gnbMobileItems = document.querySelectorAll('.pl-gnb__mobile-nav-item[data-section-id]');
    const sections = this.loadedSections;

    if (!navLinks.length || !sections.length) return;

    // Track currently intersecting sections
    const intersecting = new Set();

    const updateActiveStates = () => {
      // Find the first (topmost in DOM) intersecting section
      let activeSectionId = null;
      for (const section of sections) {
        if (intersecting.has(section.id)) {
          activeSectionId = section.id;
          break;
        }
      }

      if (!activeSectionId) return;

      // Update sidebar nav
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('is-active', href === `#${activeSectionId}`);
      });

      // Update GNB menu items (only if this section is linked to a menu item)
      const hasGnbMatch = Array.from(gnbDesktopItems).some(item => item.dataset.sectionId === activeSectionId);
      if (hasGnbMatch) {
        gnbDesktopItems.forEach(item => {
          item.classList.toggle('is-active', item.dataset.sectionId === activeSectionId);
        });
        gnbMobileItems.forEach(item => {
          item.classList.toggle('is-active', item.dataset.sectionId === activeSectionId);
        });
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          intersecting.add(entry.target.id);
        } else {
          intersecting.delete(entry.target.id);
        }
      });
      updateActiveStates();
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
