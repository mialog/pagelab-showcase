/* ============================================
   PageLab - Guide Page Script
   (No fetch - works with file:// protocol)
   ============================================ */

// Template data (inline to avoid fetch/CORS issues)
const TEMPLATE_DATA = {
  templates: [
    {
      id: "service-intro",
      name: "서비스 소개",
      description: "서비스의 핵심 가치와 기능을 소개하는 페이지",
      thumbnail: "images/templates/service-intro.png",
      useCase: "앱/서비스 런칭, 회사 소개, 솔루션 소개",
      sections: [
        { type: "hero", variant: "type-a-split" },
        { type: "intro", variant: "type-b-textgrid" },
        { type: "about", variant: "type-a-list" },
        { type: "about", variant: "type-b-grid" },
        { type: "review", variant: "type-b-card-grid" },
        { type: "cta", variant: "type-a-finish" },
        { type: "faq", variant: "index" }
      ]
    },
    {
      id: "product-detail",
      name: "제품 상세",
      description: "제품의 특징과 혜택을 상세히 안내하는 페이지",
      thumbnail: "images/templates/product-detail.png",
      useCase: "신제품 출시, 제품 상세, 기능 안내",
      sections: [
        { type: "hero", variant: "type-b-center" },
        { type: "intro", variant: "type-a-textblock" },
        { type: "about", variant: "type-e-tab" },
        { type: "benefit", variant: "type-a-plus" },
        { type: "step", variant: "type-a-img" },
        { type: "review", variant: "type-c-card-slider" },
        { type: "cta", variant: "type-a-finish" }
      ]
    },
    {
      id: "event-page",
      name: "이벤트 페이지",
      description: "프로모션 및 이벤트 참여를 유도하는 페이지",
      thumbnail: "images/templates/event-page.png",
      useCase: "시즌 이벤트, 프로모션, 캠페인",
      sections: [
        { type: "hero", variant: "type-c-full" },
        { type: "intro", variant: "type-c-img" },
        { type: "benefit", variant: "type-b-img" },
        { type: "step", variant: "type-b-text" },
        { type: "faq", variant: "index" },
        { type: "cta", variant: "type-a-finish" }
      ]
    }
  ],
  sectionLabels: {
    hero: "메인 비주얼",
    intro: "인트로",
    about: "콘텐츠 설명",
    review: "고객 후기",
    benefit: "혜택 안내",
    step: "이용 방법",
    cta: "전환 유도",
    faq: "FAQ",
    navigation: "네비게이션"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderTemplateCards(TEMPLATE_DATA.templates, TEMPLATE_DATA.sectionLabels);
});

/**
 * Render template cards
 */
function renderTemplateCards(templates, sectionLabels) {
  const container = document.getElementById('templateList');

  container.innerHTML = templates.map(template => `
    <a href="templates/${template.id}.html" class="guide__template-card">
      <div class="guide__template-preview">
        <img src="${template.thumbnail}" alt="${template.name}"
             onerror="this.style.display='none'">
      </div>
      <div class="guide__template-info">
        <h3 class="guide__template-name">${template.name}</h3>
        <p class="guide__template-desc">${template.description}</p>
        <div class="guide__template-sections">
          ${template.sections.map(s => `
            <span class="guide__template-section-tag">${sectionLabels[s.type] || s.type}</span>
          `).join('')}
        </div>
        <p class="guide__template-usecase">
          <strong>추천:</strong> ${template.useCase}
        </p>
      </div>
    </a>
  `).join('');
}
