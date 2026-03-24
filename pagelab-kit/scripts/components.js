/**
 * PageLab Web Components
 * Reusable components for PageLab sections
 */

/**
 * Section Title Component
 * Usage:
 * <pl-section-title
 *   label="Label text"
 *   heading="Main heading"
 *   description="Description text (supports <br> tags)"
 *   note="Optional note text">
 * </pl-section-title>
 */
class PLSectionTitle extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const label = this.getAttribute('label') || '';
    const heading = this.getAttribute('heading') || '';
    const description = this.getAttribute('description') || '';
    const note = this.getAttribute('note') || '';

    // Build HTML structure
    let html = '<div class="pl-section-title">';

    // Label (optional)
    if (label) {
      html += `<span class="pl-section-title__label">${label}</span>`;
    }

    // Text container
    html += '<div class="pl-section-title__text">';

    // Heading
    if (heading) {
      html += `<h2 class="pl-section-title__heading">${heading}</h2>`;
    }

    // Description (optional)
    if (description) {
      html += `<p class="pl-section-title__desc">${description}</p>`;
    }

    // Note (optional)
    if (note) {
      html += `<p class="pl-section-title__note">${note}</p>`;
    }

    html += '</div>'; // Close text container
    html += '</div>'; // Close section-title

    this.innerHTML = html;
  }
}

// Register the custom element
customElements.define('pl-section-title', PLSectionTitle);

/**
 * Button Component
 * Usage:
 * <pl-button variant="primary" size="large">버튼 텍스트</pl-button>
 * <pl-button variant="outline" href="#">링크 버튼</pl-button>
 * <pl-button variant="primary" disabled>비활성 버튼</pl-button>
 *
 * Attributes:
 * - variant: primary | secondary | outline | ghost | filled-secondary | outline-secondary (default: primary)
 * - size: large | medium | small | xsmall (default: medium)
 * - href: renders as <a> tag when set
 * - disabled: disables the button
 * - full: full width button
 * - icon-only: icon-only button (square)
 * - loading: loading state
 * - type: button | submit | reset (default: button, only for <button> element)
 */
class PLButton extends HTMLElement {
  connectedCallback() {
    // setTimeout으로 자식 노드 파싱 완료 후 실행
    setTimeout(() => {
      const variant = this.getAttribute('variant') || 'primary';
      const size = this.getAttribute('size') || '';
      const href = this.getAttribute('href') || '';
      const disabled = this.hasAttribute('disabled');
      const full = this.hasAttribute('full');
      const iconOnly = this.hasAttribute('icon-only');
      const loading = this.hasAttribute('loading');
      const type = this.getAttribute('type') || 'button';
      const ariaLabel = this.getAttribute('aria-label') || '';

      // Preserve inner content
      const content = this.innerHTML;

      // Build class list
      const classes = ['pl-btn', `pl-btn--${variant}`];
      if (size) classes.push(`pl-btn--${size}`);
      if (full) classes.push('pl-btn--full');
      if (iconOnly) classes.push('pl-btn--icon-only');
      if (loading) classes.push('pl-btn--loading');
      const classStr = classes.join(' ');

      const ariaAttr = ariaLabel ? ` aria-label="${ariaLabel}"` : '';

      let html;
      if (href) {
        const disabledAttr = disabled ? ' aria-disabled="true" tabindex="-1"' : '';
        html = `<a href="${href}" class="${classStr}"${disabledAttr}${ariaAttr}>${content}</a>`;
      } else {
        const disabledAttr = disabled ? ' disabled' : '';
        html = `<button type="${type}" class="${classStr}"${disabledAttr}${ariaAttr}>${content}</button>`;
      }

      this.innerHTML = html;
    }, 0);
  }
}

customElements.define('pl-button', PLButton);

/**
 * Card Component
 * Usage:
 * <pl-card title="제목" description="설명"></pl-card>
 * <pl-card label="01" title="제목" description="설명" note="*부가 설명"></pl-card>
 * <pl-card image="./images/img.png" image-alt="이미지 설명" title="제목" description="설명"></pl-card>
 *
 * Attributes:
 * - label: step number or badge text (optional)
 * - image: image src (optional)
 * - image-alt: image alt text (default: '')
 * - title: card title (required)
 * - description: card description (optional)
 * - note: small supplementary text (optional)
 */
class PLCard extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label') || '';
    const image = this.getAttribute('image') || '';
    const imageAlt = this.getAttribute('image-alt') || '';
    const title = this.getAttribute('title') || '';
    const description = this.getAttribute('description') || '';
    const note = this.getAttribute('note') || '';

    let html = '<div class="pl-card">';

    // Label / badge
    if (label) {
      html += `<span class="pl-card__label">${label}</span>`;
    }

    // Image
    if (image) {
      html += `<div class="pl-card__image"><img src="${image}" alt="${imageAlt}" loading="lazy"></div>`;
    }

    // Content
    html += '<div class="pl-card__content">';
    if (title) {
      html += `<h3 class="pl-card__title">${title}</h3>`;
    }
    if (description) {
      html += `<p class="pl-card__desc">${description}</p>`;
    }
    if (note) {
      html += `<p class="pl-card__note">${note}</p>`;
    }
    html += '</div>'; // close content

    html += '</div>'; // close pl-card

    this.innerHTML = html;
  }
}

customElements.define('pl-card', PLCard);


/**
 * PageLab Interactions
 * GNB 스크롤, 탭, 모바일 메뉴 — 키트 standalone 페이지용
 */
document.addEventListener('DOMContentLoaded', () => {

  // ── 1. GNB 스크롤 감지 ──────────────────────────────
  const gnb = document.getElementById('mainGnb');
  if (gnb) {
    window.addEventListener('scroll', () => {
      gnb.classList.toggle('is-scrolled', window.scrollY > 0);
    }, { passive: true });
  }

  // ── 2. 탭 ───────────────────────────────────────────
  document.querySelectorAll('.pl-tab-container').forEach(container => {
    const allBtns   = container.querySelectorAll('.pl-tab-btn');
    const allPanels = container.querySelectorAll('.pl-tab-panel');

    allBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        allBtns.forEach(b => b.classList.toggle('is-active', b.dataset.tab === tabId));
        allPanels.forEach(p => p.classList.toggle('is-active', p.dataset.tab === tabId));
      });
    });
  });

  // ── 3. 모바일 메뉴 ──────────────────────────────────
  window.toggleMobileMenu = function () {
    const overlay = document.getElementById('mobileMenuOverlay');
    const gnb     = document.getElementById('mainGnb');
    if (!overlay) return;

    const isOpen = overlay.classList.contains('is-open');
    overlay.classList.toggle('is-open', !isOpen);
    if (gnb) gnb.classList.toggle('is-menu-open', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  };

  // ── 4. 푸터 드롭다운 ────────────────────────────────
  window.toggleDropdown = function (el) {
    document.querySelectorAll('.pl-footer__dropdown.is-open').forEach(d => {
      if (d !== el) d.classList.remove('is-open');
    });
    el.classList.toggle('is-open');
  };

  document.addEventListener('click', e => {
    if (!e.target.closest('.pl-footer__dropdown-wrapper')) {
      document.querySelectorAll('.pl-footer__dropdown.is-open')
        .forEach(d => d.classList.remove('is-open'));
    }
  });

  // ── 5. 회사 정보 토글 (모바일) ──────────────────────
  window.toggleCompanyInfo = function (btn) {
    btn.classList.toggle('is-open');
    document.getElementById('companyAddress')?.classList.toggle('is-open');
  };

});
