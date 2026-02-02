# PageLab Section Showcase - AI Development Guide

> 이 문서는 AI 어시스턴트가 PageLab Section Showcase 프로젝트를 이해하고 작업할 수 있도록 작성된 가이드입니다.

## 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [디자인 토큰 시스템](#2-디자인-토큰-시스템)
3. [CSS 아키텍처 및 규칙](#3-css-아키텍처-및-규칙)
4. [섹션 구조 표준](#4-섹션-구조-표준)
5. [반응형 디자인 가이드](#5-반응형-디자인-가이드)
6. [네이밍 컨벤션](#6-네이밍-컨벤션)
7. [공통 컴포넌트](#7-공통-컴포넌트)
8. [코드 작성 예시](#8-코드-작성-예시)
9. [AI 작업 체크리스트](#9-ai-작업-체크리스트)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 구조
```
pagelab_showcase/
├── PLtokens.json           # 디자인 토큰 정의 (Figma에서 생성)
├── tokens/
│   └── base.css           # 토큰을 CSS 변수로 변환
├── styles/
│   └── sections.css       # 모든 섹션 스타일
├── sections/
│   ├── hero.json          # Hero 섹션 데이터
│   ├── about.json         # About 섹션 데이터
│   └── review.json        # Review 섹션 데이터
└── index.html             # 메인 HTML
```

### 1.2 핵심 원칙
1. **토큰 우선 (Token-First)**: 모든 스타일 값은 가능한 한 디자인 토큰을 사용
2. **반응형 토큰**: PC/Tablet/Mobile에 따라 자동으로 값이 변경되는 토큰 시스템
3. **일관성**: 모든 섹션은 동일한 구조와 네이밍 규칙을 따름
4. **하드코딩 최소화**: 토큰이 없는 값만 하드코딩 허용

---

## 2. 디자인 토큰 시스템

### 2.1 토큰 파일 구조

**PLtokens.json**은 5개의 카테고리로 구성:
```json
{
  "Responsive": {      // 반응형 토큰 (PC/Ta/Mo 값 다름)
    "Spacing8": { "Pc": 32, "Ta": 30, "Mo": 24 },
    "FontSizeDisplayLarge": { "Pc": 56, "Ta": 44, "Mo": 30 }
  },
  "CoreColor": {},     // 컬러 팔레트
  "SementicColor": {}, // 시맨틱 컬러 (TextPrimary, BgDefault 등)
  "PLONLY": {},        // PageLab 전용
  "Component": {}      // 컴포넌트 전용 토큰
}
```

### 2.2 토큰 카테고리

#### 2.2.1 Spacing (간격)
```json
"Spacing1": { "Pc": 2,   "Ta": 2,   "Mo": 2   },  // --pl-spacing-1
"Spacing2": { "Pc": 4,   "Ta": 4,   "Mo": 3   },  // --pl-spacing-2
"Spacing3": { "Pc": 8,   "Ta": 8,   "Mo": 6   },  // --pl-spacing-3
"Spacing4": { "Pc": 12,  "Ta": 10,  "Mo": 8   },  // --pl-spacing-4
"Spacing5": { "Pc": 16,  "Ta": 14,  "Mo": 12  },  // --pl-spacing-5
"Spacing6": { "Pc": 20,  "Ta": 18,  "Mo": 16  },  // --pl-spacing-6
"Spacing7": { "Pc": 24,  "Ta": 22,  "Mo": 20  },  // --pl-spacing-7
"Spacing8": { "Pc": 32,  "Ta": 30,  "Mo": 24  },  // --pl-spacing-8 ⭐ LayoutBodyTop
"Spacing9": { "Pc": 40,  "Ta": 36,  "Mo": 32  },  // --pl-spacing-9
"Spacing10": { "Pc": 48, "Ta": 44,  "Mo": 40  },  // --pl-spacing-10
"Spacing11": { "Pc": 60, "Ta": 52,  "Mo": 48  },  // --pl-spacing-11
"Spacing12": { "Pc": 68, "Ta": 60,  "Mo": 52  },  // --pl-spacing-12
"Spacing13": { "Pc": 80, "Ta": 80,  "Mo": 60  },  // --pl-spacing-13
"Spacing14": { "Pc": 100, "Ta": 92, "Mo": 80  },  // --pl-spacing-14 ⭐ LayoutBodyBottom
"Spacing15": { "Pc": 120, "Ta": 112, "Mo": 100 }   // --pl-spacing-15
```

#### 2.2.2 Layout (레이아웃)
```json
"LayoutBodyTop": { "Pc": 32, "Ta": 20, "Mo": 16 },      // --pl-layout-body-top ⭐
"LayoutBodyBottom": { "Pc": 100, "Ta": 60, "Mo": 48 },  // --pl-layout-body-bottom ⭐
"LayoutHorPadding": { "Pc": 40, "Ta": 32, "Mo": 20 },   // --pl-layout-padding
"LayoutContainerMaxWidthDefault": { "Pc": 1280, "Ta": 1280, "Mo": 1280 },  // --pl-container-default
"LayoutContainerMaxWidthWide": { "Pc": 1400, "Ta": 1400, "Mo": 1400 }      // --pl-container-wide
```

#### 2.2.3 Font Size (폰트 크기)
```json
"FontSizeDisplayLarge": { "Pc": 56, "Ta": 44, "Mo": 30 },   // --pl-font-size-display-large
"FontSizeDisplayMedium": { "Pc": 48, "Ta": 40, "Mo": 30 },  // --pl-font-size-display-medium
"FontSizeHeaderLarge": { "Pc": 34, "Ta": 32, "Mo": 28 },    // --pl-font-size-header-large
"FontSizeTitleLarge": { "Pc": 24, "Ta": 22, "Mo": 20 },     // --pl-font-size-title-large
"FontSizeBodyMedium": { "Pc": 18, "Ta": 18, "Mo": 16 }      // --pl-font-size-body-medium
```

#### 2.2.4 Radius (둥근 모서리)
```json
"Radius1": { "Pc": 4,  "Ta": 4,  "Mo": 4  },   // --pl-radius-1
"Radius2": { "Pc": 10, "Ta": 8,  "Mo": 8  },   // --pl-radius-2
"Radius3": { "Pc": 18, "Ta": 16, "Mo": 16 },   // --pl-radius-3
"Radius4": { "Pc": 24, "Ta": 24, "Mo": 20 },   // --pl-radius-4
"Radius5": { "Pc": 32, "Ta": 28, "Mo": 24 }    // --pl-radius-5
```

### 2.3 토큰 사용 예시

#### ❌ 잘못된 방법 (하드코딩)
```css
.section {
  padding: 32px 0 100px 0;
  font-size: 24px;
  gap: 20px;
}
```

#### ✅ 올바른 방법 (토큰 사용)
```css
.section {
  padding: var(--pl-layout-body-top) 0 var(--pl-layout-body-bottom) 0;
  font-size: var(--pl-font-size-title-large);
  gap: var(--pl-spacing-6);
}
```

### 2.4 토큰의 반응형 동작

**tokens/base.css**에서 미디어 쿼리로 자동 변경:
```css
/* PC (기본값) */
:root {
  --pl-spacing-8: 32px;
  --pl-layout-body-top: 32px;
}

/* Tablet (max-width: 1199px) */
@media (max-width: 1199px) {
  :root {
    --pl-spacing-8: 30px;
    --pl-layout-body-top: 20px;
  }
}

/* Mobile (max-width: 639px) */
@media (max-width: 639px) {
  :root {
    --pl-spacing-8: 24px;
    --pl-layout-body-top: 16px;
  }
}
```

**결과**: CSS에서 `var(--pl-spacing-8)`를 사용하면 화면 크기에 따라 자동으로 32px → 30px → 24px로 변경됩니다.

---

## 3. CSS 아키텍처 및 규칙

### 3.1 파일 구조

#### tokens/base.css
- PLtokens.json의 값을 CSS 변수로 변환
- 미디어 쿼리로 반응형 토큰 구현
- **절대 수정 금지** (자동 생성 파일)

#### styles/sections.css
- 모든 섹션의 스타일 정의
- BEM 네이밍 컨벤션 사용
- Container Query 사용

### 3.2 CSS 작성 규칙

#### 규칙 1: 토큰 우선 사용
```css
/* ❌ 피해야 할 코드 */
padding: 24px;
font-size: 18px;
border-radius: 16px;

/* ✅ 올바른 코드 */
padding: var(--pl-spacing-7);
font-size: var(--pl-font-size-body-medium);
border-radius: var(--pl-radius-3);
```

#### 규칙 2: 하드코딩 최소화
토큰이 없는 경우에만 하드코딩하고 주석 추가:
```css
.review-card {
  padding: var(--pl-spacing-9) 24px 28px 24px; /* 28px: 토큰 없음 */
  gap: 52px; /* Figma에 52px로 지정, 토큰 없음 */
}
```

#### 규칙 3: 컨테이너 쿼리 사용
섹션별 반응형은 `@container` 사용:
```css
.pl-section {
  container-type: inline-size;
  container-name: section;
}

/* Tablet */
@container section (max-width: 1199px) {
  .pl-hero__content {
    gap: var(--pl-spacing-10);
  }
}

/* Mobile */
@container section (max-width: 639px) {
  .pl-hero__content {
    gap: var(--pl-spacing-9);
  }
}
```

#### 규칙 4: 미디어 쿼리는 base.css에서만
일반 `@media` 쿼리는 tokens/base.css에서만 사용:
```css
/* ❌ sections.css에서 금지 */
@media (max-width: 1199px) {
  :root {
    --pl-spacing-8: 30px;
  }
}

/* ✅ base.css에서만 허용 */
```

---

## 4. 섹션 구조 표준

### 4.1 표준 섹션 HTML 구조

```html
<section class="pl-section pl-[section-type]" data-section="[type]">
  <div class="pl-[section-type]__container">
    <!-- 섹션 타이틀 (공통 컴포넌트) -->
    <div class="pl-section-title">
      <span class="pl-section-title__label">Section Label</span>
      <h2 class="pl-section-title__text">Section Title</h2>
    </div>

    <!-- 섹션별 콘텐츠 -->
    <div class="pl-[section-type]__content">
      <!-- ... -->
    </div>
  </div>
</section>
```

### 4.2 표준 컨테이너 패딩 구조 ⭐

**중요**: 모든 섹션은 이 구조를 따라야 합니다.

```
┌─────────────────────────────────────────┐
│ Container Top Padding                    │  ← var(--pl-layout-body-top)
│   (PC: 32px, Ta: 20px, Mo: 16px)       │     = Spacing8 (PC만 32px, 나머지 다름)
├─────────────────────────────────────────┤
│ Section Title Component                  │
│   - 자체 margin-top: 40px               │  ← Section Title 컴포넌트 내부 간격
│   - Title + Label                        │
├─────────────────────────────────────────┤
│ Content Area                             │
│   (gap으로 Section Title과 간격 조절)   │
├─────────────────────────────────────────┤
│ Container Bottom Padding                 │  ← var(--pl-layout-body-bottom)
│   (PC: 100px, Ta: 60px, Mo: 48px)      │     = Spacing14 (PC만 100px, 나머지 다름)
└─────────────────────────────────────────┘
```

**CSS 구현:**
```css
.pl-[section]__container {
  display: flex;
  flex-direction: column;
  gap: var(--pl-spacing-12); /* Section Title과 콘텐츠 사이 간격 */
  padding: var(--pl-layout-body-top) 0 var(--pl-layout-body-bottom) 0;
  /* ⭐ 항상 이 토큰을 사용! */
}

/* ❌ 잘못된 예시 - 하드코딩 */
.pl-review__container {
  padding: 72px 0 100px 0; /* 72px는 32px + 40px을 합친 것 */
}

/* ✅ 올바른 예시 */
.pl-review__container {
  padding: var(--pl-layout-body-top) 0 var(--pl-layout-body-bottom) 0;
}
```

**왜 72px가 아니라 32px인가?**
- 과거: 컨테이너 top padding을 72px로 하드코딩 (32px 컨테이너 + 40px 섹션 타이틀 = 72px)
- 표준: 컨테이너는 32px만, Section Title 컴포넌트가 자체적으로 40px margin-top 가짐
- 장점: 섹션 타이틀이 없는 섹션도 일관된 패딩 유지

### 4.3 Section Title 컴포넌트

```css
.pl-section-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--pl-spacing-5); /* Label과 Title 사이 간격 */
  margin-top: 40px; /* ⭐ 컨테이너와의 시각적 간격 */
}

.pl-section-title__label {
  font-size: var(--pl-font-size-label-medium);
  color: var(--pl-text-tertiary);
}

.pl-section-title__text {
  font-size: var(--pl-font-size-display-medium);
  font-weight: var(--pl-font-weight-bold);
  text-align: center;
}

/* Tablet */
@container section (max-width: 1199px) {
  .pl-section-title__text {
    font-size: var(--pl-font-size-display-medium); /* 자동으로 40px로 변경됨 */
  }
}

/* Mobile */
@container section (max-width: 639px) {
  .pl-section-title__text {
    font-size: var(--pl-font-size-display-medium); /* 자동으로 30px로 변경됨 */
  }
}
```

---

## 5. 반응형 디자인 가이드

### 5.1 브레이크포인트

```
PC:     1200px 이상
Tablet: 640px ~ 1199px
Mobile: 639px 이하
```

### 5.2 Container Query 사용법

```css
/* 기본 (PC) */
.pl-hero__content {
  gap: var(--pl-spacing-12); /* PC: 68px */
}

/* Tablet */
@container section (max-width: 1199px) {
  .pl-hero__content {
    gap: var(--pl-spacing-11); /* Ta: 52px */
  }
}

/* Mobile */
@container section (max-width: 639px) {
  .pl-hero__content {
    gap: var(--pl-spacing-10); /* Mo: 40px */
  }
}
```

### 5.3 반응형 토큰 vs 하드코딩

#### ✅ 추천: 반응형 토큰 사용
```css
.section {
  padding: var(--pl-spacing-8) 0; /* 자동으로 32px → 30px → 24px */
}
```

#### ⚠️ 필요시: 디바이스별 다른 값
```css
.hero {
  gap: var(--pl-spacing-12);
}

@container section (max-width: 1199px) {
  .hero {
    gap: var(--pl-spacing-10); /* Ta에서 다른 간격 필요 */
  }
}

@container section (max-width: 639px) {
  .hero {
    gap: 52px; /* Mo에서 토큰 없는 특수값 */
  }
}
```

---

## 6. 네이밍 컨벤션

### 6.1 BEM (Block Element Modifier)

```
.block
.block__element
.block--modifier
.block__element--modifier
```

### 6.2 섹션별 네이밍

```css
/* Block: 섹션 타입 */
.pl-hero        /* Hero 섹션 */
.pl-about       /* About 섹션 */
.pl-review      /* Review 섹션 */

/* Element: 섹션 내부 요소 */
.pl-hero__container
.pl-hero__content
.pl-hero__image
.pl-hero__title
.pl-hero__description

/* Modifier: 변형 */
.pl-hero--split          /* Hero Split 타입 */
.pl-hero--center         /* Hero Center 타입 */
.pl-hero--full           /* Hero Full 타입 */
.pl-about--grid          /* About Grid 타입 */
.pl-review--slider       /* Review Slider 타입 */
```

### 6.3 공통 클래스

```css
.pl-section              /* 모든 섹션의 루트 */
.pl-section-title        /* 섹션 타이틀 컴포넌트 */
.pl-section-title__label
.pl-section-title__text
```

### 6.4 네이밍 규칙

1. **접두사**: 모든 클래스는 `pl-`로 시작
2. **구분자**:
   - Block-Element: `__` (더블 언더스코어)
   - Block-Modifier: `--` (더블 하이픈)
3. **케밥 케이스**: 여러 단어는 `-`로 연결 (예: `pl-section-title`)

---

## 7. 공통 컴포넌트

### 7.1 Section Title (Web Component)

섹션 타이틀은 **Web Component**로 구현되어 있습니다. `<pl-section-title>` 태그를 사용하세요.

#### 기본 사용법
```html
<pl-section-title
  label="슬로건 섹션 타이틀"
  heading="섹션 타이틀"
  description="슬로건을 설명할 수 있는 보조 문구<br>전달하고 싶은 메시지 및 부가 설명"
  note="*부가 설명 케이스">
</pl-section-title>
```

#### 속성 (Attributes)
| 속성 | 필수 | 설명 |
|------|------|------|
| `label` | ✅ | 상단 라벨 텍스트 (예: "슬로건 섹션 타이틀") |
| `heading` | ✅ | 메인 타이틀 텍스트 |
| `description` | ❌ | 부가 설명 (HTML `<br>` 태그 사용 가능) |
| `note` | ❌ | 하단 참고 문구 (예: "*부가 설명 케이스") |

#### ⚠️ 주의사항
- **절대로 직접 HTML로 섹션 타이틀을 마크업하지 마세요**
- 반드시 `<pl-section-title>` Web Component를 사용
- 컴포넌트 스크립트: `scripts/components.js`
- HTML `<head>`에 스크립트 포함 필수: `<script src="./../../scripts/components.js"></script>`

---

### 7.2 GNB (Global Navigation Bar)

#### 기본 HTML 구조
```html
<header class="pl-gnb">
  <div class="pl-gnb__container">
    <!-- Logo -->
    <a href="#" class="pl-gnb__logo">
      <svg><!-- 로고 SVG --></svg>
    </a>

    <!-- PC Menu (PC에서만 표시) -->
    <nav class="pl-gnb__nav">
      <a href="#" class="pl-gnb__menu-item">메뉴 명</a>
      <a href="#" class="pl-gnb__menu-item">메뉴 명</a>
      <a href="#" class="pl-gnb__menu-item">메뉴 명</a>
      <a href="#" class="pl-gnb__menu-item">메뉴 명</a>
      <a href="#" class="pl-gnb__menu-item">메뉴 명</a>
    </nav>

    <!-- Mobile Menu Button (Tablet/Mobile에서만 표시) -->
    <button class="pl-gnb__mobile-menu" aria-label="메뉴 열기" onclick="toggleMobileMenu()">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  </div>

  <!-- Mobile Menu Overlay (Tablet/Mobile에서 햄버거 클릭 시 표시) -->
  <div class="pl-gnb__mobile-overlay" id="mobileMenuOverlay">
    <div class="pl-gnb__mobile-overlay-header">
      <a href="#" class="pl-gnb__logo">
        <svg><!-- 로고 SVG --></svg>
      </a>
      <button class="pl-gnb__mobile-close" aria-label="메뉴 닫기" onclick="toggleMobileMenu()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <nav class="pl-gnb__mobile-nav">
      <a href="#" class="pl-gnb__mobile-nav-item">메뉴 명</a>
      <a href="#" class="pl-gnb__mobile-nav-item">메뉴 명</a>
      <a href="#" class="pl-gnb__mobile-nav-item">메뉴 명</a>
      <a href="#" class="pl-gnb__mobile-nav-item">메뉴 명</a>
      <a href="#" class="pl-gnb__mobile-nav-item">메뉴 명</a>
    </nav>
  </div>
</header>
```

#### PC 메뉴 버튼 상태값 (`.pl-gnb__menu-item`)

| 상태 | CSS | 설명 |
|------|-----|------|
| **Default** | `color: #0b0d11; font-weight: 500;` | 기본 상태 |
| **Hover** | `color: #15b2f1;` | 마우스 오버 시 (`:hover`) |
| **Focus** | `color: #15b2f1;` | 키보드 포커스 시 (`:focus`) |
| **Pressed** | `color: #15b2f1; font-weight: 700; background: rgba(21, 178, 241, 0.12);` | 클릭 중 (`:active`) |
| **Current Page** | `color: #15b2f1; font-weight: 700; background: rgba(21, 178, 241, 0.12);` | 현재 페이지 (`.is-active` 클래스) |
| **Disabled** | `color: rgba(11, 13, 17, 0.24); pointer-events: none;` | 비활성화 (`.is-disabled` 클래스) |

```css
/* Default - 기본 스타일로 적용됨 */
.pl-gnb__menu-item {
  color: #0b0d11;
  font-weight: 500;
}

/* Hover - 마우스 오버 */
.pl-gnb__menu-item:hover {
  color: #15b2f1;
}

/* Focus - 키보드 포커스 */
.pl-gnb__menu-item:focus {
  color: #15b2f1;
  outline: none;
}

/* Pressed - 클릭 중 */
.pl-gnb__menu-item:active {
  color: #15b2f1;
  font-weight: 700;
  background: rgba(21, 178, 241, 0.12);
}

/* Current Page - 현재 페이지일 때 클래스 추가 */
.pl-gnb__menu-item.is-active {
  color: #15b2f1;
  font-weight: 700;
  background: rgba(21, 178, 241, 0.12);
}

/* Disabled - 비활성화 메뉴일 때 클래스 추가 */
.pl-gnb__menu-item.is-disabled {
  color: rgba(11, 13, 17, 0.24);
  pointer-events: none;
}
```

#### Tablet/Mobile 아이콘 버튼 상태값 (햄버거/X 버튼)

| 상태 | CSS | 설명 |
|------|-----|------|
| **Default** | `background: transparent;` | 기본 상태 |
| **Hover** | `background: rgba(11, 13, 17, 0.08);` | 마우스 오버 시 (`:hover`) |
| **Focus** | `background: rgba(11, 13, 17, 0.08);` | 키보드 포커스 시 (`:focus`) |
| **Pressed** | `background: rgba(11, 13, 17, 0.12);` | 클릭 중 (`:active`) |

```css
/* Mobile Menu Button */
.pl-gnb__mobile-menu {
  background: transparent;
  border-radius: 999px;
  transition: background 0.2s;
}

.pl-gnb__mobile-menu:hover {
  background: rgba(11, 13, 17, 0.08);
}

.pl-gnb__mobile-menu:focus {
  background: rgba(11, 13, 17, 0.08);
  outline: none;
}

.pl-gnb__mobile-menu:active {
  background: rgba(11, 13, 17, 0.12);
}

/* Mobile Close Button */
.pl-gnb__mobile-close {
  background: transparent;
  border-radius: 999px;
  transition: background 0.2s;
}

.pl-gnb__mobile-close:hover {
  background: rgba(11, 13, 17, 0.08);
}

.pl-gnb__mobile-close:focus {
  background: rgba(11, 13, 17, 0.08);
  outline: none;
}

.pl-gnb__mobile-close:active {
  background: rgba(11, 13, 17, 0.12);
}
```

#### Tablet/Mobile 메뉴 버튼 상태값 (`.pl-gnb__mobile-nav-item`)

PC 메뉴 버튼과 **동일한 상태값**을 사용합니다.

| 상태 | CSS | 설명 |
|------|-----|------|
| **Default** | `color: #0b0d11; font-weight: 500;` | 기본 상태 |
| **Hover** | `color: #15b2f1;` | 마우스 오버 시 (`:hover`) |
| **Focus** | `color: #15b2f1;` | 키보드 포커스 시 (`:focus`) |
| **Pressed** | `color: #15b2f1; font-weight: 700; background: rgba(21, 178, 241, 0.12);` | 클릭 중 (`:active`) |
| **Current Page** | `color: #15b2f1; font-weight: 700; background: rgba(21, 178, 241, 0.12);` | 현재 페이지 (`.is-active` 클래스) |
| **Disabled** | `color: rgba(11, 13, 17, 0.24); pointer-events: none;` | 비활성화 (`.is-disabled` 클래스) |

```css
.pl-gnb__mobile-nav-item {
  color: #0b0d11;
  font-weight: 500;
  border-radius: 10px;
}

.pl-gnb__mobile-nav-item:hover {
  color: #15b2f1;
}

.pl-gnb__mobile-nav-item:focus {
  color: #15b2f1;
  outline: none;
}

.pl-gnb__mobile-nav-item:active {
  color: #15b2f1;
  font-weight: 700;
  background: rgba(21, 178, 241, 0.12);
}

.pl-gnb__mobile-nav-item.is-active {
  color: #15b2f1;
  font-weight: 700;
  background: rgba(21, 178, 241, 0.12);
}

.pl-gnb__mobile-nav-item.is-disabled {
  color: rgba(11, 13, 17, 0.24);
  pointer-events: none;
}
```

#### 필수 JavaScript
```javascript
// Mobile Menu Toggle
function toggleMobileMenu() {
  const overlay = document.getElementById('mobileMenuOverlay');
  overlay.classList.toggle('is-open');
}
```

---

### 7.3 Footer

#### 기본 HTML 구조
```html
<footer class="pl-footer">
  <div class="pl-footer__container">
    <!-- Top: Info + Contact -->
    <div class="pl-footer__top">
      <div class="pl-footer__info">
        <!-- Category Links -->
        <nav class="pl-footer__category">
          <a href="#" class="pl-footer__category-link pl-footer__category-link--bold">개인정보 처리방침</a>
          <a href="#" class="pl-footer__category-link">이용약관</a>
          <a href="#" class="pl-footer__category-link">운영 정책</a>
          <a href="#" class="pl-footer__category-link">고객센터</a>
          <a href="#" class="pl-footer__category-link">회사소개</a>
          <a href="#" class="pl-footer__category-link">법적고지</a>
        </nav>
        <!-- Business Info -->
        <div class="pl-footer__business">
          <div class="pl-footer__logo"><!-- 로고 SVG --></div>
          <div class="pl-footer__company">
            <button class="pl-footer__company-toggle">
              <span>(주) 회사명</span>
              <svg><!-- 화살표 아이콘 --></svg>
            </button>
          </div>
          <div class="pl-footer__address">
            <p>주소</p>
            <p>사업자 정보</p>
          </div>
        </div>
      </div>
      <!-- Right: Contact -->
      <div class="pl-footer__contact">
        <div class="pl-footer__call">
          <p class="pl-footer__call-label">고객센터 대표번호</p>
          <p class="pl-footer__call-number">000-000-0000</p>
          <p class="pl-footer__call-time">운영 시간</p>
        </div>
        <div class="pl-footer__sns">
          <a href="#" class="pl-footer__sns-icon pl-footer__sns-icon--instagram"></a>
          <a href="#" class="pl-footer__sns-icon pl-footer__sns-icon--kakao"></a>
          <!-- 기타 SNS 아이콘 -->
        </div>
      </div>
    </div>
    <!-- Bottom: Certifications + Sites -->
    <div class="pl-footer__bottom">
      <div class="pl-footer__marks">
        <!-- 인증 마크 -->
      </div>
      <div class="pl-footer__sites">
        <!-- 패밀리 사이트 드롭다운 -->
      </div>
    </div>
    <!-- Copyright -->
    <p class="pl-footer__copyright">Copyright © COMPANY. All Rights Reserved</p>
  </div>
</footer>
```

---

### 7.4 GNB + Footer 마크업 체크리스트

새 페이지에 GNB/Footer 적용 시 반드시 확인:

- [ ] `<pl-section-title>` Web Component 사용 (직접 마크업 금지)
- [ ] GNB 메뉴 버튼은 기본 상태로 마크업 (상태값은 CSS로 자동 적용)
- [ ] 현재 페이지 메뉴에만 `.is-active` 클래스 추가
- [ ] Mobile 오버레이에 `id="mobileMenuOverlay"` 필수
- [ ] `toggleMobileMenu()` JavaScript 함수 포함
- [ ] 아이콘 버튼 `aria-label` 접근성 속성 포함

---

## 8. 코드 작성 예시

### 8.1 새로운 섹션 추가하기

**단계 1: HTML 구조**
```html
<section class="pl-section pl-feature" data-section="feature">
  <div class="pl-feature__container">
    <!-- 섹션 타이틀 -->
    <div class="pl-section-title">
      <span class="pl-section-title__label">Features</span>
      <h2 class="pl-section-title__text">주요 기능</h2>
    </div>

    <!-- 기능 그리드 -->
    <div class="pl-feature-grid">
      <div class="pl-feature-card">
        <div class="pl-feature-card__icon">
          <img src="icon1.svg" alt="Feature 1">
        </div>
        <h3 class="pl-feature-card__title">기능 1</h3>
        <p class="pl-feature-card__description">설명</p>
      </div>
      <!-- 더 많은 카드... -->
    </div>
  </div>
</section>
```

**단계 2: CSS 스타일**
```css
/* ============================================
   Feature Section
   ============================================ */

/* 섹션 컨테이너 */
.pl-feature {
  background: var(--pl-bg-default);
  container-type: inline-size;
  container-name: section;
}

.pl-feature__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--pl-spacing-12); /* Section Title과 그리드 사이 간격 */
  padding: var(--pl-layout-body-top) 0 var(--pl-layout-body-bottom) 0; /* ⭐ 표준 패딩 */
}

/* 기능 그리드 */
.pl-feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--pl-spacing-7);
  width: 100%;
  max-width: var(--pl-container-default);
  padding: 0 var(--pl-layout-padding);
}

/* 기능 카드 */
.pl-feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--pl-spacing-6);
  padding: var(--pl-spacing-9);
  background: var(--pl-bg-neutral);
  border-radius: var(--pl-radius-3);
}

.pl-feature-card__icon {
  width: 80px;
  height: 80px;
}

.pl-feature-card__icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pl-feature-card__title {
  font-size: var(--pl-font-size-title-large);
  font-weight: var(--pl-font-weight-bold);
  color: var(--pl-text-primary);
}

.pl-feature-card__description {
  font-size: var(--pl-font-size-body-medium);
  color: var(--pl-text-secondary);
  text-align: center;
}

/* Tablet */
@container section (max-width: 1199px) {
  .pl-feature__container {
    gap: var(--pl-spacing-11);
  }

  .pl-feature-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--pl-spacing-6);
  }
}

/* Mobile */
@container section (max-width: 639px) {
  .pl-feature__container {
    gap: var(--pl-spacing-10);
  }

  .pl-feature-grid {
    grid-template-columns: 1fr;
    gap: var(--pl-spacing-5);
  }

  .pl-feature-card {
    padding: var(--pl-spacing-8);
  }
}
```

### 8.2 기존 섹션 수정하기

**시나리오**: Hero 섹션의 버튼 스타일 변경

**단계 1: 기존 코드 읽기**
```bash
# AI에게 명령
"styles/sections.css에서 pl-hero 관련 버튼 스타일을 찾아줘"
```

**단계 2: 토큰 확인**
```bash
# AI에게 명령
"PLtokens.json에서 버튼 관련 토큰을 확인해줘"
```

**단계 3: 수정**
```css
/* 기존 */
.pl-hero__button {
  padding: 16px 32px;
  border-radius: 999px;
}

/* 수정 후 */
.pl-hero__button {
  padding: var(--pl-button-large-padding-ver) var(--pl-button-large-padding-hor);
  border-radius: var(--pl-button-radius);
}
```

---

## 9. AI 작업 체크리스트

### 9.1 새로운 섹션 추가 전 체크

- [ ] PLtokens.json에서 필요한 토큰이 있는지 확인
- [ ] 유사한 기존 섹션이 있는지 검색 (재사용 가능한 패턴)
- [ ] 섹션 타입 결정 (hero, about, review, feature 등)
- [ ] BEM 네이밍 규칙 준수 확인

### 9.2 CSS 작성 시 체크

- [ ] 모든 스타일 값에 토큰 사용 (`var(--pl-*)`)
- [ ] 하드코딩한 값에 주석 추가 (`/* 토큰 없음 */`)
- [ ] 컨테이너 패딩은 `var(--pl-layout-body-top)` / `var(--pl-layout-body-bottom)` 사용
- [ ] Container Query로 반응형 구현 (`@container section`)
- [ ] BEM 네이밍 컨벤션 준수
- [ ] Tablet(1199px), Mobile(639px) 브레이크포인트 적용

### 9.3 토큰 사용 우선순위

1. **최우선**: Responsive 카테고리의 Layout 토큰
   - `--pl-layout-body-top`
   - `--pl-layout-body-bottom`
   - `--pl-layout-padding`

2. **우선**: Responsive 카테고리의 Spacing/Font 토큰
   - `--pl-spacing-*`
   - `--pl-font-size-*`
   - `--pl-radius-*`

3. **선택**: Component 카테고리의 토큰
   - `--pl-button-*`
   - 특정 컴포넌트 전용

4. **최후**: 하드코딩
   - 토큰이 없는 경우에만
   - 반드시 주석으로 이유 명시

### 9.4 코드 리뷰 체크

작성한 코드를 다시 검토:

```bash
# 하드코딩된 값 찾기
grep -n "padding: [0-9]" sections.css
grep -n "font-size: [0-9]" sections.css
grep -n "gap: [0-9]" sections.css

# var(--pl-) 토큰 사용 확인
grep -n "var(--pl-" sections.css
```

### 9.5 AI에게 작업 요청 시 예시

#### ✅ 좋은 요청
```
"Review 섹션의 Slider 타입을 추가해줘.
- 구조는 Review Grid와 유사하게
- 카드는 좌우 스크롤 가능하게
- 표준 컨테이너 패딩 사용
- 모든 값은 토큰 우선으로
- BEM 네이밍은 .pl-review--slider로"
```

#### ❌ 나쁜 요청
```
"Review 슬라이더 만들어줘"
```

---

## 10. 실제 작업 흐름

### 10.1 시나리오: "CTA(Call-to-Action) 섹션 추가"

**AI와의 대화 예시:**

```
User: CTA 섹션을 추가하고 싶어. 중앙에 큰 제목, 설명, 버튼 2개가 있는 구조야.

AI: 네, CTA 섹션을 추가하겠습니다. 먼저 확인하겠습니다:
1. PLtokens.json 확인
2. 기존 Hero Center 섹션 참고 (유사한 구조)
3. 표준 섹션 구조 적용

[코드 작성]

User: 배경색을 그라데이션으로 변경해줘.

AI: SementicColor에서 적절한 색상을 찾았습니다.
CoreColor의 AlphaBlue32와 AlphaViolet24를 사용한 그라데이션을 적용하겠습니다.

[수정]
```

### 10.2 디버깅 시나리오

**문제**: 섹션 간격이 너무 좁음

**AI 진단 과정:**
1. 컨테이너 패딩 확인: `var(--pl-layout-body-top)` 사용 중?
2. Section Title margin 확인: 40px 적용?
3. Gap 값 확인: 적절한 spacing 토큰 사용?

```css
/* 문제 코드 */
.pl-cta__container {
  padding: var(--pl-spacing-5) 0; /* ❌ 16px는 너무 작음 */
}

/* 수정 */
.pl-cta__container {
  padding: var(--pl-layout-body-top) 0 var(--pl-layout-body-bottom) 0; /* ✅ */
}
```

---

## 11. 자주 묻는 질문 (FAQ)

### Q1: 토큰이 없는 값은 어떻게 처리하나요?
**A**: 하드코딩하되 주석으로 명시합니다.
```css
gap: 52px; /* Figma 스펙: 52px, 토큰 없음 */
padding: 28px 24px; /* 28px: 토큰 없음, 24px: Spacing7 Mo 값 */
```

### Q2: Spacing8과 LayoutBodyTop의 차이는?
**A**:
- `Spacing8`: PC/Ta/Mo 모두 비슷한 값 (32/30/24)
- `LayoutBodyTop`: PC/Ta/Mo 값이 크게 다름 (32/20/16)
- 섹션 컨테이너 상단 패딩은 반드시 `LayoutBodyTop` 사용

### Q3: @media와 @container의 차이는?
**A**:
- `@media`: 뷰포트(화면) 크기 기준, tokens/base.css에서만 사용
- `@container`: 컨테이너 크기 기준, styles/sections.css에서 사용

### Q4: 왜 72px가 아니라 32px + 40px로 나눴나요?
**A**:
- 72px 하드코딩: 유지보수 어려움, 섹션 타이틀 없으면 적용 불가
- 32px(컨테이너) + 40px(타이틀): 일관성, 재사용성, 반응형 대응 쉬움

### Q5: 새로운 토큰이 필요한데 어떻게 하나요?
**A**:
1. Figma 디자이너에게 요청
2. PLtokens.json에 추가
3. tokens/base.css 재생성
4. sections.css에서 사용

---

## 12. 참고 자료

### 12.1 주요 파일 위치

```
/Users/dkmac01/Desktop/pagelab_showcase/
├── PLtokens.json                    # 디자인 토큰 원본
├── tokens/base.css                  # CSS 변수 정의
├── styles/sections.css              # 섹션 스타일
└── AI_GUIDE.md                      # 이 문서
```

### 12.2 토큰 매핑 테이블

| PLtokens.json | base.css | 용도 |
|--------------|----------|------|
| `Spacing8` (Pc: 32) | `--pl-spacing-8` | 일반 간격 |
| `LayoutBodyTop` (Pc: 32) | `--pl-layout-body-top` | 섹션 상단 패딩 ⭐ |
| `LayoutBodyBottom` (Pc: 100) | `--pl-layout-body-bottom` | 섹션 하단 패딩 ⭐ |
| `FontSizeDisplayLarge` (Pc: 56) | `--pl-font-size-display-large` | 큰 제목 |
| `Radius3` (Pc: 18) | `--pl-radius-3` | 둥근 모서리 |

### 12.3 브레이크포인트 요약

| 디바이스 | 범위 | Container Query |
|---------|------|----------------|
| PC | 1200px 이상 | 기본값 |
| Tablet | 640 ~ 1199px | `@container section (max-width: 1199px)` |
| Mobile | 639px 이하 | `@container section (max-width: 639px)` |

---

## 13. 마치며

이 가이드는 AI가 PageLab Section Showcase 프로젝트를 일관성 있게 작업할 수 있도록 작성되었습니다.

### 핵심 원칙 요약:
1. **토큰 우선** - 모든 값은 토큰으로
2. **표준 구조** - 컨테이너 패딩은 `layout-body-*` 토큰
3. **BEM 네이밍** - 일관된 클래스명
4. **Container Query** - 섹션별 반응형
5. **주석 필수** - 하드코딩 시 이유 명시

### AI 작업 시작 명령어:
```
"AI_GUIDE.md를 읽고 [섹션명] 섹션을 표준에 맞게 [작업내용]해줘"
```

---

**문서 버전**: 1.1
**최종 업데이트**: 2026-02-02
**작성자**: PageLab Team
