# PageLab Kit — Claude Code 규칙

상세 규칙은 `AI_GUIDE.md` 참고.

## 토큰 파일 구조

```
tokens/
├── base.css              ← PageLab 시스템 (수정 금지)
├── brand-[project].css   ← 브랜드 메인/서브 (여기만 수정)
└── campaign-[name].css   ← 캠페인 시즌색 (시즌마다 교체)
```

## 핵심 규칙

- 색상은 반드시 `var(--pl-*)` 또는 `var(--brand-*)` / `var(--pl-campaign-*)` 토큰 사용
- `sections.css` / `components.css` / `components.js` 수정 금지
- 브랜드 색상 변경은 `brand-[project].css`에서만
- 캠페인 색상 변경은 `campaign-[name].css`에서만
- `base.css` 직접 수정 금지

## 브랜드 토큰 변경

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

## 캠페인 토큰 변경

`campaign-[name].css`에서 이 값만 수정:

```css
--pl-campaign-primary: #YOUR_COLOR;
--pl-campaign-bg:      #YOUR_BG;
```

## 섹션 반응형

- `@container section` 사용 (`@media` 금지)
- 간격은 `var(--pl-spacing-*)` 토큰 사용

## index.html CSS 로드 순서

```html
<link href="tokens/base.css">
<link href="tokens/brand-[project].css">
<link href="tokens/campaign-[name].css">
<link href="styles/sections.css">
<link href="styles/dark-mode.css">
<link href="styles/components.css">
```
