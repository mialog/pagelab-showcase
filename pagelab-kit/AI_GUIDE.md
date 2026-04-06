# PageLab Kit - AI Development Guide

> 다른 작업자가 AI와 함께 PageLab Kit으로 랜딩페이지를 구현할 때 참고하는 가이드.

## 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [토큰 시스템](#2-토큰-시스템)
3. [CSS 규칙](#3-css-규칙)
4. [섹션 구조](#4-섹션-구조)
5. [네이밍 컨벤션](#5-네이밍-컨벤션)
6. [공통 컴포넌트](#6-공통-컴포넌트)
7. [체크리스트](#7-체크리스트)

---

## 1. 프로젝트 개요

### 1.1 파일 구조
```
pagelab-kit/
├── tokens/
│   ├── base.css              ← PageLab 시스템 (수정 금지)
│   ├── brand-[project].css   ← 브랜드 메인/서브 (여기만 수정)
│   └── campaign-[name].css   ← 캠페인 시즌색 (시즌마다 교체)
├── styles/
│   ├── sections.css          ← 모든 섹션 스타일 (수정 금지)
│   ├── components.css        ← 공통 컴포넌트 (수정 금지)
│   └── dark-mode.css         ← 다크 모드 오버라이드
├── scripts/
│   └── components.js         ← Web Components (수정 금지)
├── sections/                 ← 섹션 HTML 파일들
└── index.html
```

### 1.2 수정 가능 범위

| 파일 | 수정 |
|------|------|
| `brand-[project].css` | ✅ 브랜드 색상 변경 |
| `campaign-[name].css` | ✅ 캠페인 색상 변경 |
| `sections/*.html` | ✅ 섹션 HTML 편집 |
| `index.html` | ✅ 페이지 구성 |
| `base.css` / `sections.css` / `components.css` / `components.js` | ❌ 수정 금지 |

### 1.3 핵심 원칙
1. **토큰 우선**: 모든 스타일 값은 `var(--pl-*)` 토큰 사용
2. **반응형 토큰**: PC/Tablet/Mobile 값이 자동 전환
3. **일관성**: 동일한 구조·네이밍 규칙
4. **하드코딩 최소화**: 토큰 없는 경우만 허용, 주석 필수

---

## 2. 토큰 시스템

### 2.1 토큰 계층

```
base.css (시스템) → brand-[project].css (브랜드) → campaign-[name].css (캠페인)
```

CSS 로드 순서:
```html
<link href="tokens/base.css">
<link href="tokens/brand-[project].css">
<link href="tokens/campaign-[name].css">
<link href="styles/sections.css">
<link href="styles/dark-mode.css">
<link href="styles/components.css">
```

### 2.2 브랜드 토큰

`brand-[project].css`에서 이 값만 수정:
```css
--brand-main:       #YOUR_MAIN;
--brand-main-light: #YOUR_LIGHT;
--brand-main-dark:  #YOUR_DARK;
--brand-sub:        #YOUR_SUB;
--brand-sub-light:  #YOUR_LIGHT;
--brand-sub-dark:   #YOUR_DARK;
```
PL 토큰 매핑과 sections.css 오버라이드는 자동 적용.

### 2.3 캠페인 토큰

`campaign-[name].css`에서 이 값만 수정:
```css
--pl-campaign-primary: #YOUR_COLOR;
--pl-campaign-bg:      #YOUR_BG;
```

### 2.4 주요 토큰 값

#### Spacing
```json
"Spacing1":  { "Pc": 2,   "Ta": 2,   "Mo": 2   },  // --pl-spacing-1
"Spacing2":  { "Pc": 4,   "Ta": 4,   "Mo": 3   },  // --pl-spacing-2
"Spacing3":  { "Pc": 8,   "Ta": 8,   "Mo": 6   },  // --pl-spacing-3
"Spacing4":  { "Pc": 12,  "Ta": 10,  "Mo": 8   },  // --pl-spacing-4
"Spacing5":  { "Pc": 16,  "Ta": 14,  "Mo": 12  },  // --pl-spacing-5
"Spacing6":  { "Pc": 20,  "Ta": 18,  "Mo": 16  },  // --pl-spacing-6
"Spacing7":  { "Pc": 24,  "Ta": 22,  "Mo": 20  },  // --pl-spacing-7
"Spacing8":  { "Pc": 32,  "Ta": 30,  "Mo": 24  },  // --pl-spacing-8
"Spacing9":  { "Pc": 40,  "Ta": 36,  "Mo": 32  },  // --pl-spacing-9
"Spacing10": { "Pc": 48,  "Ta": 44,  "Mo": 40  },  // --pl-spacing-10
"Spacing11": { "Pc": 60,  "Ta": 52,  "Mo": 48  },  // --pl-spacing-11
"Spacing12": { "Pc": 68,  "Ta": 60,  "Mo": 52  },  // --pl-spacing-12
"Spacing13": { "Pc": 80,  "Ta": 80,  "Mo": 60  },  // --pl-spacing-13
"Spacing14": { "Pc": 100, "Ta": 92,  "Mo": 80  },  // --pl-spacing-14
"Spacing15": { "Pc": 120, "Ta": 112, "Mo": 100 }   // --pl-spacing-15
```

#### Layout
```json
"LayoutBodyTop":    { "Pc": 32,   "Ta": 20,   "Mo": 16   },  // --pl-layout-body-top ⭐
"LayoutBodyBottom": { "Pc": 100,  "Ta": 60,   "Mo": 48   },  // --pl-layout-body-bottom ⭐
"LayoutHorPadding": { "Pc": 40,   "Ta": 32,   "Mo": 20   },  // --pl-layout-padding
"LayoutContainerMaxWidthDefault": { "Pc": 1280 },              // --pl-container-default
"LayoutContainerMaxWidthWide":    { "Pc": 1400 }               // --pl-container-wide
```

#### Font Size (주요 항목)
```json
"FontSizeDisplayLarge":  { "Pc": 56, "Ta": 44, "Mo": 30 },  // --pl-font-size-display-large
"FontSizeDisplayMedium": { "Pc": 48, "Ta": 40, "Mo": 30 },  // --pl-font-size-display-medium
"FontSizeHeaderLarge":   { "Pc": 34, "Ta": 32, "Mo": 28 },  // --pl-font-size-header-large
"FontSizeTitleLarge":    { "Pc": 24, "Ta": 22, "Mo": 20 },  // --pl-font-size-title-large
"FontSizeBodyMedium":    { "Pc": 18, "Ta": 18, "Mo": 16 }   // --pl-font-size-body-medium
```

#### Radius
```json
"Radius1": { "Pc": 4,  "Ta": 4,  "Mo": 4  },  // --pl-radius-1
"Radius2": { "Pc": 10, "Ta": 8,  "Mo": 8  },  // --pl-radius-2
"Radius3": { "Pc": 18, "Ta": 16, "Mo": 16 },  // --pl-radius-3
"Radius4": { "Pc": 24, "Ta": 24, "Mo": 20 },  // --pl-radius-4
"Radius5": { "Pc": 32, "Ta": 28, "Mo": 24 }   // --pl-radius-5
```

### 2.5 반응형 동작

`base.css`에서 `@media` 쿼리로 자동 전환:
```css
:root { --pl-spacing-8: 32px; }
@media (max-width: 1199px) { :root { --pl-spacing-8: 30px; } }
@media (max-width: 639px)  { :root { --pl-spacing-8: 24px; } }
```

### 2.6 시맨틱 컬러와 다크 모드

| 구분 | 예시 | 다크 모드 |
|------|------|----------|
| **스케일** | `--pl-neutral-50`, `--pl-lightblue-10` | 값 고정 |
| **시맨틱** | `--pl-text-primary`, `--pl-bg-brand-light` | 자동 전환 |

배경·텍스트·아이콘·보더는 **반드시 시맨틱 토큰** 사용.

```css
/* ❌ */ background: var(--pl-lightblue-10);    /* 다크모드 미대응 */
/* ✅ */ background: var(--pl-bg-brand-light);  /* 자동 전환 */
```

#### `-light`/`-dark` 페어 교환

다크 모드에서 `-light`↔`-dark` 값이 서로 교환:
```css
/* 라이트 */ --pl-bg-brand-light: #d1eefa;  --pl-bg-brand-dark: #06435b;
/* 다크   */ --pl-bg-brand-light: #06435b;  --pl-bg-brand-dark: #d1eefa;
```

적용 카테고리: **brand**(라이트블루), **accent**(블루), **positive**(그린), **caution**(옐로우), **negative**(레드) — 각각 `text`, `bg`, `border`, `icon` 접두사에 동일 적용.

다크 모드 적용:
```html
<div class="preview-content" data-theme="dark">...</div>
```

---

## 3. CSS 규칙

### 3.1 토큰 우선
```css
/* ❌ */ padding: 24px; font-size: 18px;
/* ✅ */ padding: var(--pl-spacing-7); font-size: var(--pl-font-size-body-medium);
```

### 3.2 하드코딩 시 주석 필수
```css
gap: 52px; /* Figma: 52px, 토큰 없음 */
```

### 3.3 Container Query (`@media` 금지)
```css
.pl-section { container-type: inline-size; container-name: section; }

@container section (max-width: 1199px) { /* Tablet */ }
@container section (max-width: 639px)  { /* Mobile */ }
```

### 3.4 브레이크포인트

| 디바이스 | 범위 | Container Query |
|---------|------|----------------|
| PC | 1200px+ | 기본값 |
| Tablet | 640~1199px | `@container section (max-width: 1199px)` |
| Mobile | ~639px | `@container section (max-width: 639px)` |

### 3.5 토큰 사용 우선순위

1. **최우선**: Layout (`--pl-layout-body-top`, `--pl-layout-body-bottom`, `--pl-layout-padding`)
2. **우선**: Spacing/Font/Radius (`--pl-spacing-*`, `--pl-font-size-*`, `--pl-radius-*`)
3. **선택**: Component (`--pl-button-*` 등)
4. **최후**: 하드코딩 (주석 필수)

---

## 4. 섹션 구조

### 4.1 HTML 구조

```html
<section class="pl-section pl-[type]" data-section="[type]">
  <div class="pl-section__container pl-[type]__container">
    <pl-section-title label="라벨" heading="제목"></pl-section-title>
    <div class="pl-[type]__content">...</div>
  </div>
</section>
```

필수 포함:
```html
<link rel="stylesheet" href="tokens/base.css">
<link rel="stylesheet" href="tokens/brand-[project].css">
<link rel="stylesheet" href="tokens/campaign-[name].css">
<link rel="stylesheet" href="styles/sections.css">
<link rel="stylesheet" href="styles/dark-mode.css">
<link rel="stylesheet" href="styles/components.css">
<script src="scripts/components.js"></script>
```

### 4.2 표준 컨테이너 패딩

```
┌──────────────────────────────────────┐
│ var(--pl-layout-body-top)            │  PC:32 / Ta:20 / Mo:16
├──────────────────────────────────────┤
│ Section Title (자체 margin-top:40px) │
├──────────────────────────────────────┤
│ Content Area                         │
├──────────────────────────────────────┤
│ var(--pl-layout-body-bottom)         │  PC:100 / Ta:60 / Mo:48
└──────────────────────────────────────┘
```

```css
.pl-[type]__container {
  display: flex;
  flex-direction: column;
  gap: var(--pl-spacing-12);
  padding: var(--pl-layout-body-top) 0 var(--pl-layout-body-bottom) 0; /* ⭐ */
}
```

컨테이너 top은 32px, Section Title이 자체 40px margin-top 보유. 72px 하드코딩 금지.

---

## 5. 네이밍 컨벤션

### BEM 규칙
```
.pl-block
.pl-block__element
.pl-block--modifier
```

- 접두사: `pl-`
- 구분자: `__`(element), `--`(modifier)
- 케밥 케이스: `pl-section-title`

### 섹션별 예시
```css
.pl-hero                /* Block */
.pl-hero__container     /* Element */
.pl-hero--split         /* Modifier */
```

---

## 6. 공통 컴포넌트

### 6.1 Section Title (`<pl-section-title>`)

```html
<pl-section-title
  label="라벨"
  heading="제목"
  description="설명<br>줄바꿈 가능"
  note="*참고 문구">
</pl-section-title>
```

| 속성 | 필수 | 설명 |
|------|------|------|
| `heading` | ✅ | 메인 타이틀 |
| `label` | ❌ | 상단 라벨 |
| `description` | ❌ | 부가 설명 (`<br>` 가능) |
| `note` | ❌ | 하단 참고 |

⚠️ 직접 HTML 마크업 금지. 반드시 Web Component 사용.

### 6.2 GNB

```html
<header class="pl-gnb">
  <div class="pl-gnb__container">
    <a href="#" class="pl-gnb__logo"><svg>...</svg></a>
    <nav class="pl-gnb__nav">
      <a href="#" class="pl-gnb__menu-item">메뉴</a>
    </nav>
    <button class="pl-gnb__mobile-menu" aria-label="메뉴 열기" onclick="toggleMobileMenu()">
      <svg>...</svg>
    </button>
  </div>
  <div class="pl-gnb__mobile-overlay" id="mobileMenuOverlay">
    <div class="pl-gnb__mobile-overlay-header">
      <a href="#" class="pl-gnb__logo"><svg>...</svg></a>
      <button class="pl-gnb__mobile-close" aria-label="메뉴 닫기" onclick="toggleMobileMenu()">
        <svg>...</svg>
      </button>
    </div>
    <nav class="pl-gnb__mobile-nav">
      <a href="#" class="pl-gnb__mobile-nav-item">메뉴</a>
    </nav>
  </div>
</header>
```

#### 메뉴 상태값

PC(`.pl-gnb__menu-item`)와 Mobile(`.pl-gnb__mobile-nav-item`) 동일:

| 상태 | 스타일 |
|------|--------|
| Default | `color: #0b0d11; font-weight: 500` |
| Hover/Focus | `color: #15b2f1` |
| Pressed/Active | `color: #15b2f1; font-weight: 700; background: rgba(21,178,241,0.12)` |
| `.is-active` | Pressed와 동일 (현재 페이지) |
| `.is-disabled` | `color: rgba(11,13,17,0.24); pointer-events: none` |

아이콘 버튼(햄버거/닫기): `hover/focus: rgba(11,13,17,0.08)`, `active: rgba(11,13,17,0.12)`

필수 JS:
```javascript
function toggleMobileMenu() {
  document.getElementById('mobileMenuOverlay').classList.toggle('is-open');
}
```

### 6.3 Footer

```html
<footer class="pl-footer">
  <div class="pl-footer__container">
    <div class="pl-footer__top">
      <div class="pl-footer__info">
        <nav class="pl-footer__category">
          <a class="pl-footer__category-link pl-footer__category-link--bold">개인정보 처리방침</a>
          <a class="pl-footer__category-link">이용약관</a>
        </nav>
        <div class="pl-footer__business">
          <div class="pl-footer__logo">...</div>
          <div class="pl-footer__company">
            <button class="pl-footer__company-toggle"><span>(주) 회사명</span></button>
          </div>
          <div class="pl-footer__address">...</div>
        </div>
      </div>
      <div class="pl-footer__contact">
        <div class="pl-footer__call">...</div>
        <div class="pl-footer__sns">...</div>
      </div>
    </div>
    <div class="pl-footer__bottom">...</div>
    <p class="pl-footer__copyright">Copyright © COMPANY. All Rights Reserved</p>
  </div>
</footer>
```

### 6.4 GNB/Footer 체크리스트

- `<pl-section-title>` Web Component 사용
- 현재 페이지 메뉴에 `.is-active` 클래스
- Mobile 오버레이에 `id="mobileMenuOverlay"` 필수
- `toggleMobileMenu()` JS 함수 포함
- 아이콘 버튼 `aria-label` 포함

---

## 7. 체크리스트

### CSS 작성 시
- 모든 값에 토큰 사용 (`var(--pl-*)`)
- 하드코딩 값에 주석 추가
- 컨테이너 패딩은 `layout-body-top`/`layout-body-bottom`
- `@container section`으로 반응형 (Tablet:1199px, Mobile:639px)
- 컬러는 시맨틱 토큰 (스케일 토큰 직접 사용 금지)
- 브랜드 색상은 `brand-[project].css`에서만 변경
- 캠페인 색상은 `campaign-[name].css`에서만 변경

### FAQ

**토큰 없는 값은?** → 하드코딩 + 주석 (`/* Figma: 52px, 토큰 없음 */`)

**Spacing8 vs LayoutBodyTop?** → 둘 다 PC 32px이지만 Ta/Mo 값이 다름. 섹션 컨테이너 상단은 반드시 `LayoutBodyTop`.

**@media vs @container?** → `@media`는 `base.css`에서만, `@container`는 섹션 스타일에서 사용.

**새 토큰 필요 시?** → Figma 디자이너 요청 → PLtokens.json 추가 → base.css 재생성.
