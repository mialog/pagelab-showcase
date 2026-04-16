# PageLab Kit — Claude Code 규칙

## 토큰 파일 구조

```
tokens/
├── base.css              ← PageLab 시스템 (수정 금지)
├── brand-[project].css   ← 브랜드 메인/서브 (여기만 수정)
└── campaign-[name].css   ← 캠페인 시즌색 (시즌마다 교체)
```

## 수정 가능 범위

| 파일 | 수정 |
|------|------|
| `brand-[project].css` | ✅ 브랜드 색상 변경 |
| `campaign-[name].css` | ✅ 캠페인 색상 변경 |
| `sections/*.html` | ✅ 섹션 HTML 편집 |
| `index.html` | ✅ 페이지 구성 |
| `base.css` / `sections.css` / `sections/*.css` / `components.css` / `components.js` | ❌ 수정 금지 |

## 핵심 규칙

- 색상은 반드시 `var(--pl-*)` 또는 `var(--brand-*)` / `var(--pl-campaign-*)` 토큰 사용
- `sections.css` / `sections/*.css` / `components.css` / `components.js` 수정 금지
- 브랜드 색상 변경은 `brand-[project].css`에서만
- 캠페인 색상 변경은 `campaign-[name].css`에서만
- `base.css` 직접 수정 금지

---

## 토큰 시스템

### 토큰 계층 및 CSS 로드 순서

```
base.css (시스템) → brand-[project].css (브랜드) → campaign-[name].css (캠페인)
```

```html
<link href="tokens/base.css">
<link href="tokens/brand-[project].css">
<link href="tokens/campaign-[name].css">
<link href="styles/sections.css">
<link href="styles/dark-mode.css">
<link href="styles/components.css">
```

### 브랜드 토큰 변경

`brand-[project].css`에서 이 값만 수정:

```css
--brand-main:       #YOUR_MAIN;
--brand-main-light: #YOUR_LIGHT;
--brand-main-dark:  #YOUR_DARK;
--brand-sub:        #YOUR_SUB;
--brand-sub-light:  #YOUR_LIGHT;
--brand-sub-dark:   #YOUR_DARK;
```

PL 토큰 매핑과 sections.css 오버라이드는 자동 적용됨.

### 캠페인 토큰 변경

`campaign-[name].css`에서 이 값만 수정:

```css
--pl-campaign-primary: #YOUR_COLOR;
--pl-campaign-bg:      #YOUR_BG;
```

### 주요 토큰 값

#### Spacing
```
--pl-spacing-1:  2px          --pl-spacing-9:  40px
--pl-spacing-2:  4px          --pl-spacing-10: 48px
--pl-spacing-3:  8px          --pl-spacing-11: 60px
--pl-spacing-4:  12px         --pl-spacing-12: 68px
--pl-spacing-5:  16px         --pl-spacing-13: 80px
--pl-spacing-6:  20px         --pl-spacing-14: 100px
--pl-spacing-7:  24px         --pl-spacing-15: 120px
--pl-spacing-8:  32px
```
(위 값은 PC 기준. Tablet/Mobile에서 자동으로 소폭 감소)

#### Layout ⭐
```
--pl-layout-body-top:    PC:32 / Ta:20 / Mo:16
--pl-layout-body-bottom: PC:100 / Ta:60 / Mo:48
--pl-layout-padding:     PC:40 / Ta:32 / Mo:20
--pl-container-default:  1280px
--pl-container-wide:     1400px
```

#### Font Size
```
--pl-font-size-display-large:  PC:56 / Ta:44 / Mo:30
--pl-font-size-display-medium: PC:48 / Ta:40 / Mo:30
--pl-font-size-header-large:   PC:34 / Ta:32 / Mo:28
--pl-font-size-title-large:    PC:24 / Ta:22 / Mo:20
--pl-font-size-body-medium:    PC:18 / Ta:18 / Mo:16
```

#### Radius
```
--pl-radius-1: 4px   --pl-radius-4: 24px
--pl-radius-2: 10px  --pl-radius-5: 32px
--pl-radius-3: 18px
```

### 시맨틱 컬러와 다크 모드

배경·텍스트·아이콘·보더는 **반드시 시맨틱 토큰** 사용.

```css
/* ❌ */ background: var(--pl-lightblue-10);    /* 다크 모드 미대응 */
/* ✅ */ background: var(--pl-bg-brand-light);  /* 자동 전환 */
```

다크 모드에서 `-light`↔`-dark` 값이 서로 교환됨:
```css
/* 라이트 */ --pl-bg-brand-light: #d1eefa;  --pl-bg-brand-dark: #06435b;
/* 다크   */ --pl-bg-brand-light: #06435b;  --pl-bg-brand-dark: #d1eefa;
```

적용 카테고리: **brand**, **accent**, **positive**, **caution**, **negative** — 각각 `text`, `bg`, `border`, `icon` 접두사에 동일 적용.

다크 모드 적용:
```html
<div data-theme="dark">...</div>
```

---

## CSS 규칙

```css
/* ❌ */ padding: 24px; font-size: 18px;
/* ✅ */ padding: var(--pl-spacing-7); font-size: var(--pl-font-size-body-medium);
```

하드코딩 시 주석 필수:
```css
gap: 52px; /* Figma: 52px, 토큰 없음 */
```

`@media` 금지, Container Query 사용:
```css
.pl-section { container-type: inline-size; container-name: section; }

@container section (max-width: 1199px) { /* Tablet */ }
@container section (max-width: 639px)  { /* Mobile */ }
```

토큰 우선순위: Layout → Spacing/Font/Radius → Component → 하드코딩(주석 필수)

---

## 섹션 구조

### HTML 구조

```html
<section class="pl-section pl-[type]" data-section="[type]">
  <div class="pl-section__container pl-[type]__container">
    <pl-section-title label="라벨" heading="제목"></pl-section-title>
    <div class="pl-[type]__content">...</div>
  </div>
</section>
```

### 표준 컨테이너 패딩

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

## 네이밍 컨벤션

BEM 규칙: `.pl-block` / `.pl-block__element` / `.pl-block--modifier`

- 접두사: `pl-`  /  구분자: `__`(element), `--`(modifier)  /  케밥 케이스

```css
.pl-hero              /* Block */
.pl-hero__container   /* Element */
.pl-hero--split       /* Modifier */
```

---

## 공통 컴포넌트

### `<pl-section-title>`

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

### `<pl-review-card>`

```html
<!-- highlight (기본) — 사진 없음 -->
<pl-review-card stars="5" name="김이름" info="초3 학부모"
  content="아이가 정말 좋아해요!"></pl-review-card>

<!-- grid — 사진 + 리뷰어 정보 상단 -->
<pl-review-card variant="grid" stars="5" name="박소연" info="초2 자녀 엄마"
  photo="./images/reviewer_1.jpg" photo-alt="리뷰어 1"
  content="아이가 정말 좋아해요!"></pl-review-card>

<!-- slider — 사진 + 리뷰어 정보 하단 -->
<pl-review-card variant="slider" stars="4" name="박소연" info="초2 자녀 엄마"
  photo="./images/reviewer_1.jpg" photo-alt="리뷰어 1"
  content="아이가 정말 좋아해요!"></pl-review-card>
```

| 속성 | 필수 | 설명 |
|------|------|------|
| `variant` | ❌ | `grid` \| `slider` (생략 시 highlight) |
| `stars` | ❌ | 별점 1~5 (기본 5) |
| `name` | ✅ | 작성자 이름 |
| `info` | ❌ | 부가 정보 |
| `photo` | ❌ | 작성자 사진 URL |
| `photo-alt` | ❌ | 사진 alt 텍스트 |
| `content` | ✅ | 후기 본문 |

### GNB

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

메뉴 상태값 (`.pl-gnb__menu-item` / `.pl-gnb__mobile-nav-item` 동일):

| 상태 | 스타일 |
|------|--------|
| Default | `color: #0b0d11; font-weight: 500` |
| Hover/Focus | `color: #15b2f1` |
| Pressed / `.is-active` | `color: #15b2f1; font-weight: 700; background: rgba(21,178,241,0.12)` |
| `.is-disabled` | `color: rgba(11,13,17,0.24); pointer-events: none` |

아이콘 버튼(햄버거/닫기): `hover/focus: rgba(11,13,17,0.08)` / `active: rgba(11,13,17,0.12)`

필수 JS:
```javascript
function toggleMobileMenu() {
  document.getElementById('mobileMenuOverlay').classList.toggle('is-open');
}
```

### Footer

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

### GNB/Footer 체크리스트

- `<pl-section-title>` Web Component 사용 (직접 마크업 금지)
- 현재 페이지 메뉴에 `.is-active` 클래스
- Mobile 오버레이에 `id="mobileMenuOverlay"` 필수
- `toggleMobileMenu()` JS 함수 포함
- 아이콘 버튼 `aria-label` 포함

---

## CSS 작성 체크리스트

- 모든 값에 토큰 사용 (`var(--pl-*)`)
- 하드코딩 값에 주석 추가 (`/* Figma: 52px, 토큰 없음 */`)
- 컨테이너 패딩은 `layout-body-top` / `layout-body-bottom`
- `@container section`으로 반응형 (Tablet:1199px, Mobile:639px)
- 컬러는 시맨틱 토큰 (스케일 토큰 직접 사용 금지)
- 브랜드 색상은 `brand-[project].css`에서만
- 캠페인 색상은 `campaign-[name].css`에서만
