# PageLab Section Showcase

프로모션 페이지 제작을 위한 섹션 컴포넌트 라이브러리

**라이브 데모**: [섹션 갤러리](index.html) · [조합 가이드](guide.html) · [GitHub Pages](https://mialog.github.io/pagelab-showcase/)

---

## 빠른 시작

### 1. 필수 파일 포함

```html
<head>
  <link rel="stylesheet" href="tokens/base.css">
  <link rel="stylesheet" href="tokens/campaign.css">
  <link rel="stylesheet" href="styles/components.css">
  <link rel="stylesheet" href="styles/sections.css">
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">
  <script src="scripts/components.js"></script>
</head>
```

### 2. 섹션 HTML 복사

각 섹션 파일에서 `<section>` (또는 `<header>/<footer>`) 태그만 복사 후 이미지 경로 수정

---

## 섹션 목록

> ✦ = AI 자동 생성 섹션

| 카테고리 | 타입 | 설명 | JS 필요 |
|---------|------|------|:-------:|
| **Hero** | type-a-split | 좌우 분할형 | - |
| | type-b-center | 중앙 정렬형 | - |
| | type-c-full | 전면 배경형 | - |
| | type-d-video | 영상 배경형 ✦ | - |
| **Intro** | type-a-textblock | 텍스트 블록 | - |
| | type-b-textgrid | 텍스트 그리드 | - |
| | type-c-img | 이미지형 | - |
| | type-d-product-split | 제품소개형 ✦ | - |
| **About** | type-a-list | 리스트형 | - |
| | type-b-grid | 그리드형 | - |
| | type-c-card-slide | 카드 슬라이드 | - |
| | type-d-card-swipe | 카드 스와이프 | - |
| | type-e-tab | 탭형 | ✅ |
| | type-f-image | 이미지형 | - |
| | type-g-feature-alt | 좌우 교차형 ✦ | - |
| | type-h-compare | 비교형 ✦ | - |
| **Benefit** | type-a-plus | 플러스형 | - |
| | type-b-img | 이미지형 | - |
| | type-c-pricing | 가격표형 ✦ | - |
| **Step** | type-a-img | 이미지형 | - |
| | type-b-text | 텍스트형 | - |
| **Review** | type-a-highlight | 하이라이트형 | - |
| | type-b-card-grid | 카드 그리드 | - |
| | type-c-card-slider | 카드 슬라이더 | - |
| **CTA** | type-a-finish | 마무리형 | - |
| | type-b-floating | 플로팅형 | - |
| | type-c-floating-b | 플로팅 B형 | - |
| | type-d-banner | 띠 배너형 ✦ | - |
| **Etc** | caution | 유의사항 | - |
| **FAQ** | index | 아코디언 | ✅ |
| **Navigation** | type-a-gnb-footer | GNB + Footer | ✅ |

---

## JavaScript 초기화 (JS 필요 섹션)

### FAQ 아코디언

```javascript
document.querySelectorAll('.pl-faq__item').forEach(item => {
  item.querySelector('.pl-faq__header')?.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');
    item.classList.toggle('is-open', !isOpen);
  });
});
```

### About 탭

```javascript
document.querySelectorAll('.pl-tab').forEach(container => {
  const tabs = container.querySelectorAll('.pl-tab__button');
  const panels = container.querySelectorAll('.pl-tab__panel');
  tabs.forEach((tab, i) => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('is-active'));
    panels.forEach(p => p.classList.remove('is-active'));
    tab.classList.add('is-active');
    panels[i]?.classList.add('is-active');
  }));
});
```

### GNB 모바일 메뉴

```javascript
const menuBtn = document.querySelector('.pl-gnb__mobile-menu');
const closeBtn = document.querySelector('.pl-gnb__mobile-close');
const overlay = document.querySelector('.pl-gnb__mobile-overlay');

menuBtn?.addEventListener('click', () => { overlay?.classList.add('is-open'); document.body.style.overflow = 'hidden'; });
closeBtn?.addEventListener('click', () => { overlay?.classList.remove('is-open'); document.body.style.overflow = ''; });
overlay?.addEventListener('click', e => { if (e.target === overlay) { overlay.classList.remove('is-open'); document.body.style.overflow = ''; } });

// 스크롤 시 GNB 상태
window.addEventListener('scroll', () => document.querySelector('.pl-gnb')?.classList.toggle('is-scrolled', window.scrollY > 0));

// Footer 회사정보 토글
document.querySelector('.pl-footer__company-toggle')?.addEventListener('click', function() {
  this.classList.toggle('is-expanded');
  document.querySelector('.pl-footer__address')?.classList.toggle('is-visible');
});
```

---

## 파일 구조

```
pagelab_showcase/
├── tokens/           # 디자인 토큰 (base.css, campaign.css)
├── styles/           # 공통 스타일 (components.css, sections.css, dark-mode.css)
├── scripts/          # 커스텀 엘리먼트 (components.js)
├── sections/         # 섹션 HTML 파일
├── images/           # 이미지 에셋
├── templates/        # 조합 템플릿 프리뷰
├── guide.html        # 조합 가이드
└── index.html        # 섹션 갤러리
```

---

**최종 업데이트**: 2026-04-21
