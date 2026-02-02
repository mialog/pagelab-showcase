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
