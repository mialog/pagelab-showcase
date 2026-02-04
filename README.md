# PageLab Section Showcase

프로모션 페이지 제작을 위한 섹션 컴포넌트 라이브러리

---

## 1. 빠른 시작 (섹션 가져다 쓰기)

### Step 1: 필수 파일 포함

```html
<head>
  <!-- CSS (순서 중요!) -->
  <link rel="stylesheet" href="tokens/base.css">
  <link rel="stylesheet" href="tokens/campaign.css">
  <link rel="stylesheet" href="styles/components.css">
  <link rel="stylesheet" href="styles/sections.css">

  <!-- Font -->
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">

  <!-- JS (커스텀 엘리먼트) -->
  <script src="scripts/components.js"></script>
</head>
```

### Step 2: 섹션 HTML 복사

각 섹션 파일에서 `<section>` 또는 `<header>/<footer>` 태그만 복사:

```html
<!-- sections/hero/type-a-split.html 에서 복사 -->
<section class="pl-section pl-hero pl-hero--split">
  <!-- 내용 -->
</section>
```

### Step 3: 이미지 경로 수정

프로젝트 구조에 맞게 `src` 경로 조정

### Step 4: JS 초기화 (인터랙션 섹션만)

아래 "JavaScript 초기화" 섹션 참고

---

## 2. 섹션 목록 & JS 필요 여부

| 카테고리 | 타입 | 설명 | JS 필요 |
|---------|------|------|:-------:|
| **Hero** | type-a-split | 좌우 분할형 | - |
| | type-b-center | 중앙 정렬형 | - |
| | type-c-full | 전면 배경형 | - |
| **Intro** | type-a-textblock | 텍스트 블록 | - |
| | type-b-textgrid | 텍스트 그리드 | - |
| | type-c-img | 이미지형 | - |
| **About** | type-a-list | 리스트형 | - |
| | type-b-grid | 그리드형 | - |
| | type-c-card-slide | 카드 슬라이드 | - |
| | type-d-card-swipe | 카드 스와이프 | - |
| | type-e-tab | 탭형 | ✅ |
| | type-f-image | 이미지형 | - |
| **Benefit** | type-a-plus | 플러스형 | - |
| | type-b-img | 이미지형 | - |
| **Step** | type-a-img | 이미지형 | - |
| | type-b-text | 텍스트형 | - |
| **Review** | type-a-highlight | 하이라이트형 | - |
| | type-b-card-grid | 카드 그리드 | - |
| | type-c-card-slider | 카드 슬라이더 | - |
| **CTA** | type-a-finish | 마무리형 | - |
| | type-b-floating | 플로팅형 | - |
| | type-c-floating-b | 플로팅 B형 | - |
| **FAQ** | index | 아코디언 | ✅ |
| **Navigation** | type-a-gnb-footer | GNB + Footer | ✅ |

---

## 3. JavaScript 초기화 코드

### FAQ 아코디언

```javascript
document.querySelectorAll('.pl-faq__item').forEach(item => {
  const header = item.querySelector('.pl-faq__header');
  header?.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');
    item.classList.toggle('is-open', !isOpen);
    header.setAttribute('aria-expanded', !isOpen);
  });
});
```

### About 탭

```javascript
document.querySelectorAll('.pl-tab').forEach(container => {
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
```

### GNB 모바일 메뉴

```javascript
const menuBtn = document.querySelector('.pl-gnb__mobile-menu');
const closeBtn = document.querySelector('.pl-gnb__mobile-close');
const overlay = document.querySelector('.pl-gnb__mobile-overlay');

menuBtn?.addEventListener('click', () => {
  overlay?.classList.add('is-open');
  document.body.style.overflow = 'hidden';
});

closeBtn?.addEventListener('click', () => {
  overlay?.classList.remove('is-open');
  document.body.style.overflow = '';
});

// 오버레이 배경 클릭 시 닫기
overlay?.addEventListener('click', (e) => {
  if (e.target === overlay) {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
});
```

### GNB 스크롤 상태

```javascript
const gnb = document.querySelector('.pl-gnb');

window.addEventListener('scroll', () => {
  if (window.scrollY > 0) {
    gnb?.classList.add('is-scrolled');
  } else {
    gnb?.classList.remove('is-scrolled');
  }
});
```

### Footer 회사정보 토글

```javascript
const toggleBtn = document.querySelector('.pl-footer__company-toggle');
const addressEl = document.querySelector('.pl-footer__address');

toggleBtn?.addEventListener('click', () => {
  toggleBtn.classList.toggle('is-expanded');
  addressEl?.classList.toggle('is-visible');
});
```

---

## 4. 파일 구조

```
pagelab_showcase/
├── tokens/
│   ├── base.css              # 디자인 토큰 (필수)
│   └── campaign.css          # 캠페인 토큰 (필수)
├── styles/
│   ├── components.css        # 버튼, 라벨 등 (필수)
│   └── sections.css          # 섹션 스타일 (필수)
├── scripts/
│   └── components.js         # 커스텀 엘리먼트 (필수)
├── sections/                 # 섹션 HTML 파일
│   ├── hero/
│   ├── intro/
│   ├── about/
│   ├── benefit/
│   ├── step/
│   ├── review/
│   ├── cta/
│   ├── faq/
│   └── navigation/
├── images/                   # 이미지 에셋
├── templates/                # 조합 템플릿 프리뷰
├── guide.html                # 조합 가이드
└── index.html                # 섹션 갤러리
```

---

## 5. 주요 디자인 토큰

### 컬러

```css
/* 텍스트 */
--pl-text-primary: #0b0d11;
--pl-text-secondary: #394046;
--pl-text-tertiary: #6a747c;
--pl-text-brand: #15b2f1;
--pl-text-invert: #ffffff;

/* 배경 */
--pl-bg-default: #ffffff;
--pl-bg-neutral: #f5f6f7;
--pl-bg-invert: #394046;
--pl-neutral-100: #0b0d11;   /* 가장 어두운 배경 */
```

### 간격

```css
--pl-spacing-4: 12px;
--pl-spacing-6: 20px;
--pl-spacing-8: 32px;
--pl-spacing-10: 48px;
--pl-spacing-15: 120px;
```

### 레이아웃 (반응형 자동 변경)

```css
/* PC → Tablet → Mobile 자동 변경 */
--pl-layout-body-top: 120px / 80px / 60px;
--pl-layout-body-bottom: 100px / 60px / 48px;
--pl-layout-padding: 40px / 32px / 20px;
```

---

## 6. 반응형 브레이크포인트

Container Query 기반:

| 디바이스 | 범위 | Container Query |
|---------|------|-----------------|
| PC | 1200px+ | 기본값 |
| Tablet | 720px ~ 1199px | `@container section (max-width: 1199px)` |
| Mobile | ~719px | `@container section (max-width: 719px)` |

---

## 7. 라이브 데모

- **섹션 갤러리**: [index.html](index.html)
- **조합 가이드**: [guide.html](guide.html)
- **GitHub Pages**: https://mialog.github.io/pagelab-showcase/

---

## 8. CSS 클래스 네이밍 (BEM)

```css
/* Block */
.pl-hero

/* Element */
.pl-hero__container
.pl-hero__title

/* Modifier */
.pl-hero--split
.pl-hero--center
```

### 접두사

| 접두사 | 용도 |
|--------|------|
| `pl-` | PageLab 공통 컴포넌트 |
| `pl-section-` | 섹션 공통 요소 |

---

## 9. 개발 원칙

### 토큰 우선

```css
/* ❌ 하드코딩 금지 */
padding: 32px;

/* ✅ 토큰 사용 */
padding: var(--pl-spacing-8);
```

### 표준 섹션 구조

```css
.pl-section__container {
  padding: var(--pl-layout-body-top) 0 var(--pl-layout-body-bottom) 0;
}
```

---

## 10. AI 개발 가이드

AI 어시스턴트와 작업 시 **[AI_GUIDE.md](AI_GUIDE.md)** 참고

```
"AI_GUIDE.md를 읽고 새 섹션을 표준에 맞게 추가해줘"
```

---

**최종 업데이트**: 2026-02-03
