# PageLab Section Showcase

상세 규칙은 `AI_GUIDE.md`에 있습니다. 작업 전 반드시 참고하세요.

## 핵심 원칙

- 모든 색상·간격·폰트 값은 `var(--pl-*)` 토큰 사용 (hex, px 하드코딩 금지)
- 색상은 스케일 토큰(`--pl-neutral-*`) 대신 **시맨틱 토큰**(`--pl-text-*`, `--pl-bg-*`) 사용
- 섹션 반응형은 `@container section` 사용 (`@media` 금지)

## 절대 금지

- 인라인 `<style>` 안에 `[data-theme="dark"]` 규칙 작성 → `styles/dark-mode.css`에만
- `<pl-section-title>` 대신 `<div class="pl-section-title">` 직접 마크업
- 하드코딩된 hex 색상 (`#xxxxxx`)

## 섹션 HTML 필수 구조

```html
<section class="pl-section pl-[type]" data-section="[type]">
  <div class="pl-section__container pl-[type]__container">
    <pl-section-title heading="제목"></pl-section-title>
  </div>
</section>
```

모든 섹션 HTML에는 다음 링크가 포함되어야 합니다:
- `tokens/base.css` / `styles/sections.css` / `styles/dark-mode.css` / `styles/components.css`
- `scripts/components.js`

## Web Components

| 컴포넌트 | 사용처 | 주요 속성 |
|---------|--------|---------|
| `<pl-section-title>` | 모든 섹션 제목 | `label`, `heading`, `description`, `note` |
| `<pl-button>` | 일반 버튼 | `variant`, `size`, `href`, `disabled` |
| `<pl-card>` | 카드 UI | `title`, `description`, `image`, `label` |

## AI 생성 섹션 규칙

Claude가 직접 생성한 섹션은 **반드시** 두 곳 모두에 AI 배지를 달아야 합니다.

**1. index.html 갤러리 카드**
```html
<div class="section-card__header">
  <span class="section-card__tag">카테고리</span>
  <h3 class="section-card__name">섹션 이름</h3>
  <span class="section-card__ai-badge">
    ✦ AI 생성
    <button class="section-card__ai-help" aria-label="AI 생성 섹션 설명">?</button>
    <span class="section-card__ai-tooltip">PageLab 컴포넌트와 디자인 토큰을 학습한 AI가 자동으로 생성한 섹션입니다.</span>
  </span>
</div>
```

**2. 섹션 상세 HTML의 preview-header** (인라인 `<style>` + 마크업 모두 필요)

`<style>` 블록에 추가:
```css
.preview-ai-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #fff; background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 3px 10px 3px 8px; border-radius: 20px; white-space: nowrap; }
.preview-ai-badge__help { display: inline-flex; align-items: center; justify-content: center; width: 15px; height: 15px; background: rgba(255,255,255,0.25); border-radius: 50%; font-size: 9px; font-weight: 700; cursor: pointer; border: none; color: #fff; padding: 0; position: relative; flex-shrink: 0; }
.preview-ai-badge__help:focus { outline: none; }
.preview-ai-tooltip { display: none; position: absolute; top: calc(100% + 10px); left: 0; width: 260px; background: #1e1b4b; color: #e9d5ff; font-size: 12px; padding: 10px 12px; border-radius: 8px; z-index: 2000; white-space: normal; }
.preview-ai-badge__help:hover .preview-ai-tooltip, .preview-ai-badge__help:focus .preview-ai-tooltip { display: block; }
```

`preview-header__info` 안에 추가:
```html
<span class="preview-ai-badge">
  ✦ AI 생성
  <button class="preview-ai-badge__help" aria-label="AI 생성 섹션 설명">
    ?
    <span class="preview-ai-tooltip" role="tooltip">PageLab 컴포넌트와 디자인 토큰을 학습한 AI가 자동으로 생성한 섹션입니다. 토큰 규칙과 구조 표준을 준수합니다.</span>
  </button>
</span>
```

## 유용한 명령어

```bash
npm run new-section -- --type=about --name=type-g-video  # 새 섹션 생성
npm run validate                                          # 구조 검증
npm run tokens:sync                                       # 토큰 재생성 + 검증
```
