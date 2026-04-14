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
 * Review Card Component
 * Usage:
 * <pl-review-card stars="5" name="김이름" info="초3 학부모"
 *   content="아이가 정말 좋아해요!"></pl-review-card>
 *
 * <pl-review-card variant="grid" stars="5" name="박소연" info="초2 자녀 엄마"
 *   photo="./images/reviewer_1.jpg" photo-alt="리뷰어 1"
 *   content="아이가 정말 좋아해요!"></pl-review-card>
 *
 * <pl-review-card variant="slider" stars="4" name="박소연" info="초2 자녀 엄마"
 *   photo="./images/reviewer_1.jpg" photo-alt="리뷰어 1"
 *   content="아이가 정말 좋아해요!"></pl-review-card>
 *
 * Attributes:
 * - variant: (none) | grid | slider — 레이아웃 변형
 * - stars: 1~5 — 별점 개수 (default: 5)
 * - content: 후기 본문 (required)
 * - name: 작성자 이름 (required)
 * - info: 작성자 부가 정보 (optional)
 * - photo: 작성자 사진 URL (optional, grid/slider에서 사용)
 * - photo-alt: 사진 alt 텍스트 (optional)
 */
class PLReviewCard extends HTMLElement {
  connectedCallback() {
    const variant = this.getAttribute('variant') || '';
    const stars = parseInt(this.getAttribute('stars') || '5', 10);
    const content = this.getAttribute('content') || '';
    const name = this.getAttribute('name') || '';
    const info = this.getAttribute('info') || '';
    const photo = this.getAttribute('photo') || '';
    const photoAlt = this.getAttribute('photo-alt') || '';

    const starSvg = '<svg class="pl-star-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M13.0483 1.15337C12.6195 0.282209 11.3805 0.282211 10.9517 1.15337L8.14913 6.84682C7.97884 7.19276 7.64968 7.43254 7.26891 7.48801L1.00221 8.401C0.0433404 8.5407 -0.339532 9.72214 0.354315 10.4002L4.88894 14.832C5.16446 15.1013 5.29019 15.4892 5.22515 15.8694L4.15467 22.1272C3.99088 23.0847 4.99325 23.8148 5.85089 23.3628L11.456 20.4083C11.7966 20.2288 12.2034 20.2288 12.544 20.4083L18.1491 23.3628C19.0068 23.8148 20.0091 23.0847 19.8453 22.1272L18.7749 15.8694C18.7098 15.4892 18.8355 15.1013 19.1111 14.832L23.6457 10.4002C24.3395 9.72214 23.9567 8.5407 22.9978 8.401L16.7311 7.48801C16.3503 7.43254 16.0212 7.19276 15.8509 6.84682L13.0483 1.15337Z"/></svg>';

    const starsHtml = `<div class="pl-review-card__stars" role="img" aria-label="별점 ${stars}점">${starSvg.repeat(stars)}</div>`;
    const contentHtml = `<p class="pl-review-card__content">${content}</p>`;

    // variant별 클래스·구조 분기
    const modClass = variant ? ` pl-review-card--${variant}` : '';
    let inner = '';

    if (variant === 'grid') {
      // grid: reviewer → stars → content
      const reviewerHtml = this._buildReviewer(photo, photoAlt, name, info);
      inner = reviewerHtml + starsHtml + contentHtml;
    } else if (variant === 'slider') {
      // slider: stars → content → reviewer
      const reviewerHtml = this._buildReviewer(photo, photoAlt, name, info);
      inner = starsHtml + contentHtml + reviewerHtml;
    } else {
      // highlight (default): stars → content → author
      const authorHtml = `<div class="pl-review-card__author"><span class="pl-review-card__name">${name}</span>${info ? `<span class="pl-review-card__info">${info}</span>` : ''}</div>`;
      inner = starsHtml + contentHtml + authorHtml;
    }

    this.innerHTML = `<article class="pl-review-card${modClass}">${inner}</article>`;
  }

  _buildReviewer(photo, photoAlt, name, info) {
    const photoHtml = photo
      ? `<div class="pl-review-card__photo"><img src="${photo}" alt="${photoAlt}" onerror="this.style.display='none'"></div>`
      : '';
    return `<div class="pl-review-card__reviewer">${photoHtml}<div class="pl-review-card__user"><span class="pl-review-card__user-name">${name}</span>${info ? `<span class="pl-review-card__user-info">${info}</span>` : ''}</div></div>`;
  }
}

customElements.define('pl-review-card', PLReviewCard);
