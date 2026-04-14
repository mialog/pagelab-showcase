# PageLab Section Showcase

## 핵심 원칙

- 모든 색상·간격·폰트: `var(--pl-*)` 토큰 (hex, px 하드코딩 금지)
- 색상: 스케일(`--pl-neutral-*`) 대신 **시맨틱**(`--pl-text-*`, `--pl-bg-*`)
- 반응형: `@container section` (`@media` 금지)

## 절대 금지

- 인라인 `<style>`에 `[data-theme="dark"]` → `styles/dark-mode.css`에만
- `<pl-section-title>` 대신 `<div>` 직접 마크업

## 섹션 HTML 필수 구조

```html
<section class="pl-section pl-[type]" data-section="[type]">
  <div class="pl-section__container pl-[type]__container">
    <pl-section-title heading="제목"></pl-section-title>
  </div>
</section>
```

필수 링크:
- `tokens/base.css` / `styles/sections.css` / `styles/dark-mode.css` / `styles/components.css`
- `scripts/components.js`

## Web Components

| 컴포넌트 | 주요 속성 |
|---------|---------|
| `<pl-section-title>` | `label`, `heading`, `description`, `note` |
| `<pl-button>` | `variant`, `size`, `href`, `disabled` |
| `<pl-card>` | `title`, `description`, `image`, `label` |
| `<pl-review-card>` | `variant`(grid/slider), `stars`, `name`, `info`, `photo`, `content` |

## AI 생성 섹션 배지

AI 생성 섹션은 두 곳에 배지 필수:

**1. index.html 갤러리 카드**
```html
<span class="section-card__ai-badge">
  ✦ AI 생성
  <button class="section-card__ai-help" aria-label="AI 생성 섹션 설명">?</button>
  <span class="section-card__ai-tooltip">PageLab 컴포넌트와 디자인 토큰을 학습한 AI가 자동으로 생성한 섹션입니다.</span>
</span>
```

**2. 섹션 상세 preview-header** — `sections/about/type-g-feature-alt.html`에서 `.preview-ai-badge` CSS+HTML 복사

## 명령어

```bash
npm run new-section -- --type=about --name=type-g-video  # 새 섹션
npm run validate                                          # 구조 검증
npm run tokens:sync                                       # 토큰 재생성+검증
```
