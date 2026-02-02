# PageLab Section Showcase

프로모션 페이지 제작을 위한 섹션 컴포넌트 쇼케이스 사이트입니다.

**디자인 토큰 기반** 반응형 섹션 컴포넌트 라이브러리로, Figma에서 정의한 토큰을 CSS 변수로 자동 변환하여 일관성 있는 디자인 시스템을 제공합니다.

---

## 🎯 주요 특징

- ✅ **디자인 토큰 시스템**: Figma → JSON → CSS 변수 자동 변환
- ✅ **반응형 토큰**: PC/Tablet/Mobile 디바이스별 자동 값 변경
- ✅ **Container Query**: 컨테이너 크기 기반 반응형 구현
- ✅ **표준화된 섹션 구조**: 일관된 패딩 및 레이아웃 규칙
- ✅ **BEM 네이밍**: 체계적인 CSS 클래스 구조
- ✅ **AI 친화적**: AI 개발 가이드 문서 포함

---

## 📁 프로젝트 구조

```
pagelab_showcase/
├── PLtokens.json            # 디자인 토큰 정의 (Figma 생성)
├── AI_GUIDE.md              # AI 개발 가이드 문서
├── index.html               # 메인 갤러리 페이지
│
├── tokens/
│   ├── base.css             # 토큰 → CSS 변수 변환
│   └── campaign.css         # 캠페인 테마
│
├── styles/
│   ├── sections.css         # 모든 섹션 스타일
│   └── showcase.css         # 쇼케이스 UI
│
├── sections/
│   ├── hero.json            # Hero 섹션 데이터
│   ├── about.json           # About 섹션 데이터
│   ├── review.json          # Review 섹션 데이터
│   └── hero/
│       ├── type-a-split.html
│       ├── type-b-center.html
│       └── type-c-full.html
│
├── images/                  # 섹션별 이미지
└── js/
    └── gallery.js           # 갤러리 기능
```

---

## 🎨 디자인 토큰 시스템

### 토큰 흐름

```
Figma Design
    ↓
PLtokens.json (Responsive, CoreColor, SementicColor, Component)
    ↓
tokens/base.css (CSS 변수 + 미디어 쿼리)
    ↓
styles/sections.css (var(--pl-*) 사용)
```

### PLtokens.json 구조

```json
{
  "Responsive": {
    "Spacing8": { "Pc": 32, "Ta": 30, "Mo": 24 },
    "FontSizeDisplayLarge": { "Pc": 56, "Ta": 44, "Mo": 30 },
    "LayoutBodyTop": { "Pc": 32, "Ta": 20, "Mo": 16 },
    "LayoutBodyBottom": { "Pc": 100, "Ta": 60, "Mo": 48 }
  },
  "CoreColor": {
    "Neutral100": { "Mode1": "#0b0d11" }
  },
  "SementicColor": {
    "TextPrimary": { "Mode1": "#0b0d11" },
    "BackgroundBrand": { "Mode1": "#15b1f1" }
  },
  "Component": {
    "ButtonlargePaddingHor": { "Pc": 32, "Ta": 32, "Mo": 32 }
  }
}
```

### 반응형 토큰 예시

```css
/* tokens/base.css - 자동 생성 */
:root {
  --pl-spacing-8: 32px;          /* PC 기본값 */
  --pl-layout-body-top: 32px;
}

@media (max-width: 1199px) {     /* Tablet */
  :root {
    --pl-spacing-8: 30px;
    --pl-layout-body-top: 20px;
  }
}

@media (max-width: 639px) {      /* Mobile */
  :root {
    --pl-spacing-8: 24px;
    --pl-layout-body-top: 16px;
  }
}
```

**결과**: `var(--pl-spacing-8)` 사용 시 디바이스에 따라 자동으로 32px → 30px → 24px 변경

---

## 📐 섹션 구조 표준

### 표준 컨테이너 구조

모든 섹션은 다음 구조를 따릅니다:

```
┌─────────────────────────────────────────┐
│ Container Top Padding                    │  ← var(--pl-layout-body-top)
│   PC: 32px  Ta: 20px  Mo: 16px         │     (디바이스별 자동 변경)
├─────────────────────────────────────────┤
│ Section Title Component                  │
│   - margin-top: 40px (자체 간격)        │
│   - Label + Title                        │
├─────────────────────────────────────────┤
│ Content Area                             │
│   (gap으로 Title과 간격 조절)           │
├─────────────────────────────────────────┤
│ Container Bottom Padding                 │  ← var(--pl-layout-body-bottom)
│   PC: 100px  Ta: 60px  Mo: 48px        │     (디바이스별 자동 변경)
└─────────────────────────────────────────┘
```

### CSS 구현

```css
.pl-section__container {
  display: flex;
  flex-direction: column;
  gap: var(--pl-spacing-12);
  padding: var(--pl-layout-body-top) 0 var(--pl-layout-body-bottom) 0;
  /* ⭐ 모든 섹션은 이 토큰 사용 */
}

.pl-section-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--pl-spacing-5);
  margin-top: 40px; /* 컨테이너와의 시각적 간격 */
}
```

---

## 🎭 섹션 컴포넌트

### Hero 섹션

| Type | 클래스 | 레이아웃 | 용도 |
|------|--------|---------|------|
| **Split** | `.pl-hero--split` | 좌우 분할 | 서비스/제품 소개 |
| **Split Reverse** | `.pl-hero--split-reverse` | 우좌 분할 | 변형 레이아웃 |
| **Center** | `.pl-hero--center` | 중앙 정렬 | 임팩트, 이벤트 |
| **Full** | `.pl-hero--full` | 전면 배경 | 캠페인, 브랜드 감성 |

### Intro 섹션

| Type | 클래스 | 레이아웃 | 용도 |
|------|--------|---------|------|
| **Textblock** | `.pl-intro--textblock` | 중앙 텍스트 블록 | 섹션 인트로, 간단한 메시지 |
| **Textgrid** | `.pl-intro--textgrid` | 텍스트 + 통계 그리드 | 수치/성과 강조 |
| **Image** | `.pl-intro--img` | 텍스트 + 전면 이미지 | 비주얼 임팩트 |

### About 섹션

| Type | 클래스 | 레이아웃 | 용도 |
|------|--------|---------|------|
| **Default** | `.pl-about` | 좌우 구성 | 서비스 설명 |
| **Grid** | `.pl-about--grid` | 그리드 카드 | 기능 나열 |
| **Slide** | `.pl-about--slide` | 수평 슬라이드 | 다수 콘텐츠 |
| **Swipe** | `.pl-about--swipe` | 스와이프 | 모바일 최적화 |
| **Tab** | `.pl-about--tab` | 탭 전환 | 카테고리별 정보 |
| **Image** | `.pl-about--image` | 단일 이미지 | 비주얼 강조 |

### Review 섹션

| Type | 클래스 | 레이아웃 | 용도 |
|------|--------|---------|------|
| **Highlight** | `.pl-review` | 대표 후기 강조 | 신뢰도 강조 |
| **Grid** | `.pl-review--grid` | 그리드 레이아웃 | 다수 후기 |
| **Slider** | `.pl-review--slider` | 슬라이더 | 무한 스크롤 |

---

## 📱 반응형 디자인

### 브레이크포인트

| 디바이스 | 범위 | Container Query |
|---------|------|-----------------|
| **PC** | 1200px 이상 | 기본값 |
| **Tablet** | 640px ~ 1199px | `@container section (max-width: 1199px)` |
| **Mobile** | 639px 이하 | `@container section (max-width: 639px)` |

### Container Query 사용

```css
/* 섹션에 컨테이너 정의 */
.pl-section {
  container-type: inline-size;
  container-name: section;
}

/* 기본 (PC) */
.pl-hero__content {
  gap: var(--pl-spacing-12);
}

/* Tablet */
@container section (max-width: 1199px) {
  .pl-hero__content {
    gap: var(--pl-spacing-11);
  }
}

/* Mobile */
@container section (max-width: 639px) {
  .pl-hero__content {
    flex-direction: column;
    gap: var(--pl-spacing-10);
  }
}
```

### 레이아웃 패딩

| 디바이스 | 좌우 패딩 | CSS 변수 |
|---------|----------|---------|
| PC | 40px | `var(--pl-layout-padding)` |
| Tablet | 32px | 자동 변경 |
| Mobile | 20px | 자동 변경 |

---

## 🎯 주요 디자인 토큰

### Spacing (간격)

```css
--pl-spacing-1: 2px;     /* 최소 간격 */
--pl-spacing-4: 12px;    /* 작은 간격 */
--pl-spacing-7: 24px;    /* 중간 간격 */
--pl-spacing-8: 32px;    /* 큰 간격 */
--pl-spacing-12: 68px;   /* 섹션 내부 간격 */
--pl-spacing-14: 100px;  /* 섹션 하단 패딩 */
```

### Layout (레이아웃)

```css
--pl-layout-body-top: 32px;       /* 섹션 상단 패딩 ⭐ */
--pl-layout-body-bottom: 100px;   /* 섹션 하단 패딩 ⭐ */
--pl-layout-padding: 40px;        /* 좌우 패딩 */
--pl-container-default: 1280px;   /* 기본 컨테이너 너비 */
--pl-container-wide: 1400px;      /* 넓은 컨테이너 */
```

### Font Size (폰트 크기)

```css
--pl-font-size-display-large: 56px;   /* 큰 제목 (PC) */
--pl-font-size-header-large: 34px;    /* 헤더 */
--pl-font-size-title-large: 24px;     /* 타이틀 */
--pl-font-size-body-medium: 18px;     /* 본문 */
```

### Colors (색상)

```css
/* 텍스트 */
--pl-text-primary: #0b0d11;
--pl-text-secondary: #394046;
--pl-text-tertiary: #6a747c;

/* 배경 */
--pl-bg-default: #ffffff;
--pl-bg-neutral: #e3e8ed;
--pl-bg-brand: #15b1f1;

/* 테두리 */
--pl-border-default: #c6cfd6;
--pl-border-light: #d4dce2;
```

### Radius (둥근 모서리)

```css
--pl-radius-1: 4px;
--pl-radius-3: 18px;
--pl-radius-4: 24px;
--pl-radius-5: 32px;
```

---

## 🏗️ HTML 구조 예시

### 기본 섹션 구조

```html
<section class="pl-section pl-hero pl-hero--split" data-section="hero">
  <div class="pl-hero__container">

    <!-- 섹션 타이틀 (공통 컴포넌트) -->
    <div class="pl-section-title">
      <span class="pl-section-title__label">Hero Section</span>
      <h2 class="pl-section-title__text">섹션 제목</h2>
    </div>

    <!-- 콘텐츠 영역 -->
    <div class="pl-hero__content">
      <div class="pl-hero__text">
        <h1 class="pl-hero__title">헤드라인 텍스트</h1>
        <p class="pl-hero__description">설명 텍스트</p>
      </div>
      <div class="pl-hero__actions">
        <a href="#" class="pl-btn pl-btn--primary">버튼</a>
      </div>
    </div>

    <!-- 비주얼 -->
    <div class="pl-hero__image">
      <img src="images/hero.png" alt="Hero Visual">
    </div>

  </div>
</section>
```

---

## 🎨 CSS 클래스 네이밍 규칙

### BEM 방식

```css
/* Block */
.pl-hero

/* Element */
.pl-hero__container
.pl-hero__content
.pl-hero__title

/* Modifier */
.pl-hero--split
.pl-hero--center
.pl-hero--full
```

### 접두사 규칙

| 접두사 | 용도 | 예시 |
|--------|------|------|
| `pl-` | PageLab 공통 컴포넌트 | `.pl-hero`, `.pl-btn` |
| `pl-section-` | 섹션 공통 요소 | `.pl-section-title` |
| `showcase-` | 쇼케이스 사이트 전용 | `.showcase-gallery` |

---

## 💻 개발 가이드

### 토큰 우선 원칙

```css
/* ❌ 하드코딩 금지 */
.section {
  padding: 32px 0 100px 0;
  font-size: 24px;
  gap: 20px;
}

/* ✅ 토큰 사용 */
.section {
  padding: var(--pl-layout-body-top) 0 var(--pl-layout-body-bottom) 0;
  font-size: var(--pl-font-size-title-large);
  gap: var(--pl-spacing-6);
}
```

### 하드코딩이 필요한 경우

토큰이 없는 값만 하드코딩하고 주석으로 명시:

```css
.review-card {
  padding: var(--pl-spacing-9) 24px 28px 24px; /* 28px: 토큰 없음 */
  gap: 52px; /* Figma 스펙: 52px, 토큰 없음 */
}
```

### 새로운 섹션 추가 체크리스트

- [ ] PLtokens.json에서 필요한 토큰 확인
- [ ] BEM 네이밍 규칙 적용
- [ ] 표준 컨테이너 패딩 사용 (`layout-body-*`)
- [ ] Container Query로 반응형 구현
- [ ] 모든 값에 토큰 사용 (하드코딩 최소화)
- [ ] Section Title 컴포넌트 포함

### AI 개발 가이드

AI 어시스턴트와 작업할 때는 **[AI_GUIDE.md](AI_GUIDE.md)** 문서를 참고하세요.

```bash
# AI에게 작업 요청 예시
"AI_GUIDE.md를 읽고 CTA 섹션을 표준에 맞게 추가해줘"
```

---

## 🚀 로컬 실행

### 요구사항

- **브라우저**: Container Query 지원 필요
  - Chrome 105+
  - Safari 16+
  - Firefox 110+

### 실행 방법

```bash
# Live Server 사용
npx serve .

# 또는 Python HTTP 서버
python -m http.server 8000

# 또는 Node.js http-server
npx http-server
```

**접속**: http://localhost:8000

---

## 📚 문서

| 문서 | 설명 |
|------|------|
| **README.md** | 프로젝트 개요 (이 문서) |
| **[AI_GUIDE.md](AI_GUIDE.md)** | AI 개발 가이드 (상세 규칙, 예시) |
| **PLtokens.json** | 디자인 토큰 정의 |
| **tokens/base.css** | CSS 변수 구현 |

---

## 🎯 주요 원칙 요약

1. **토큰 우선**: 모든 스타일 값은 토큰 사용
2. **표준 구조**: 섹션 패딩은 `layout-body-*` 토큰
3. **BEM 네이밍**: 체계적인 클래스명 구조
4. **Container Query**: 섹션별 반응형
5. **일관성**: 모든 섹션은 동일한 패턴

---

## 📝 라이선스

이 프로젝트는 PageLab 내부 사용을 위한 것입니다.

---

**프로젝트 버전**: 2.0
**최종 업데이트**: 2026-01-27
**관리**: PageLab Team
