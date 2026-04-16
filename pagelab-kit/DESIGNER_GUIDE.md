# PageLab Kit — 디자이너 가이드

## 이 키트는 무엇인가

PageLab의 섹션 시스템을 실제 프로젝트에 활용하기 위한 최소 파일 묶음입니다.
섹션 갤러리·가이드·빌더(showcase) 도구는 별도 URL에서 참고하고,
이 키트만으로 실제 납품 페이지를 제작합니다.

---

## 파일 구조

```
pagelab-kit/
├── index.html                  ← 실제 랜딩 페이지 (여기에 섹션 조합)
├── tokens/
│   ├── base.css                ← PageLab 시스템 토큰 (수정 금지)
│   └── campaign-project.css    ← 캠페인 시즌 컬러 (시즌마다 교체)
├── styles/
│   ├── sections.css            ← 섹션 스타일 배럴 (수정 금지)
│   ├── sections/               ← 섹션 타입별 CSS (수정 금지)
│   └── components.css          ← 버튼 등 공통 컴포넌트 (수정 금지)
├── scripts/
│   └── components.js           ← pl-section-title Web Component (수정 금지)
├── images/                     ← 실제 프로젝트 이미지 여기에 넣기
└── CLAUDE.md                   ← Claude Code 규칙서
```

> **sections.css, sections/*.css, components.css, components.js, base.css는 수정하지 않습니다.**
> 브랜드 컬러 변경은 Figma 변수로 하거나, brand-override.css를 추가합니다.

---

## 새 프로젝트 시작 순서

### Step 1. Figma 작업

1. PageLab Figma 템플릿 파일 복사
2. **Variables** 패널에서 brand 토큰 컬러를 클라이언트 컬러로 변경
3. 사용할 섹션 컴포넌트에 실제 텍스트 / 이미지 배치
4. 이미지 Export → `pagelab-kit/images/` 폴더에 저장
5. 클라이언트 / 기획자 승인

---

### Step 2. Claude Code 세팅

이 폴더를 열고 Claude Code에게 아래 순서로 요청합니다.

**① 브랜드 컬러 적용**

Figma가 있는 경우:
- Figma Variables에서 brand 토큰 값을 변경 → JSON export → base.css 재생성
- 별도 파일 필요 없음

Figma 없이 직접 지정하는 경우:
```
brand-override.css 파일을 tokens/ 폴더에 만들고
아래 컬러로 브랜드 토큰을 오버라이드해줘.

브랜드 메인: #FF6B35
브랜드 서브: #2D4A52
```
(자세한 방법은 아래 "Figma 없이 브랜드 컬러 변경하기" 참고)

**② 캠페인 컬러 적용**
```
campaign-project.css 파일명을 프로젝트명으로 바꾸고
아래 캠페인 컬러를 적용해줘.

캠페인 포인트: #9B6BF4
캠페인 배경: #F6F2FC
```

**② 섹션 조합**
```
pagelab-showcase의 sections/ 폴더를 참고해서
Hero type-a-split → Intro type-b-textgrid → About type-c-card-slide →
Review type-b-card-grid → CTA type-a-finish 순서로
index.html에 섹션 HTML을 조합해줘.
CLAUDE.md 규칙 따라줘.
```

**③ Figma MCP로 텍스트 주입 (선택)**
```
Figma MCP 연결해서 [파일명/프레임명] 읽어서
각 섹션의 텍스트 내용을 Figma 디자인 기준으로 바꿔줘.
```

**④ 이미지 경로 연결**
```
Hero 섹션 배경 이미지를 images/hero-main.jpg로 바꿔줘.
About 카드 이미지는 images/about-01.jpg, about-02.jpg, about-03.jpg로.
```

---

### Step 3. 기획자 마무리 작업

1. `index.html` 상단 메타태그 실제 내용으로 수정
   - `<title>`, `<meta name="description">`, OG 태그
   - `og:image` → 대표 이미지 경로
   - `og:url` → 실제 배포 URL
2. 최종 검수 후 배포

---

## 섹션 목록 참고

PageLab Showcase에서 섹션 미리보기 확인:
→ [섹션 갤러리 URL]

| 카테고리 | 타입 | JS 필요 |
|---------|------|--------|
| Hero | type-a-split, type-b-center, type-c-full | - |
| Intro | type-a-textblock, type-b-textgrid, type-c-img | - |
| About | type-a-list, type-b-grid, type-c-card-slide, type-d-card-swipe, type-e-tab, type-f-image | type-e만 |
| Benefit | type-a-plus, type-b-img | - |
| Step | type-a-img, type-b-text | - |
| Review | type-a-highlight, type-b-card-grid, type-c-card-slider | - |
| CTA | type-a-finish, type-b-floating, type-c-floating-b | - |
| FAQ | index | O |
| Navigation | type-a-gnb-footer | O |
| ETC | caution | - |

---

## 토큰 구조

### 기본 동작
`base.css`에 모든 시맨틱 토큰이 정의되어 있고, `sections.css`가 이 토큰을 참조합니다.
브랜드 컬러를 바꾸면 전체 UI가 한번에 바뀝니다.

### 캠페인 토큰 (`tokens/campaign-project.css`)
시즌/캠페인마다 교체. 이 파일만 바꾸면 분위기 전환됩니다.

```css
--pl-campaign-primary: #YOUR_COLOR;  /* 탭, 포인트 컬러 */
--pl-campaign-bg:      #YOUR_BG;     /* intro/about 배경 등 넓은 면적 */
```

---

## Figma 없이 브랜드 컬러 변경하기

Figma 변수 파이프라인 없이도 브랜드 컬러를 변경할 수 있습니다.
`tokens/brand-override.css` 파일을 만들고 sections.css **뒤에** 로드합니다.

**index.html 로드 순서:**
```html
<link rel="stylesheet" href="tokens/base.css">
<link rel="stylesheet" href="tokens/campaign-project.css">
<link rel="stylesheet" href="styles/sections.css">
<link rel="stylesheet" href="styles/dark-mode.css">
<link rel="stylesheet" href="styles/components.css">
<link rel="stylesheet" href="tokens/brand-override.css"> <!-- 마지막에 로드 -->
```

**brand-override.css 예시:**
```css
:root {
  /* 브랜드 메인 — 헥스값만 교체 */
  --pl-text-brand:        #E60012;
  --pl-bg-brand:          #E60012;
  --pl-border-brand:      #E60012;
  --pl-icon-brand:        #E60012;
  --pl-bg-brand-light:    #FEF2F3;

  /* 브랜드 서브 */
  --pl-text-brand-sub:    #5A7781;
  --pl-bg-brand-sub:      #5A7781;
  --pl-border-brand-sub:  #5A7781;
  --pl-icon-brand-sub:    #5A7781;

  /* Alpha (브랜드 메인 + 투명도) */
  --pl-alpha-brand-08:    #E6001214;
  --pl-alpha-brand-12:    #E600121e;
  --pl-alpha-brand-24:    #E600123d;
  --pl-alpha-brand-32:    #E6001251;
  --pl-alpha-brand-48:    #E600127a;

  /* Shadow */
  --pl-shadow-brand:      0 4px 20px rgba(230, 0, 18, 0.12);
  --pl-shadow-accent:     0 4px 16px rgba(230, 0, 18, 0.08);
}
```

> alpha 값은 `브랜드 헥스코드 + 투명도 hex`로 구성됩니다.
> 예: `#E60012` + `14`(8%) = `#E6001214`

> `base.css`, `sections.css`, `components.css`는 수정하지 않습니다.

---

## 주의사항

- `sections.css` 직접 수정 금지 — 업데이트 시 덮어씌워집니다
- 이미지는 반드시 `images/` 폴더 안에 정리
- 다크 모드 지원 시 `<html data-theme="dark">` 또는 토글 버튼 추가
- JS 필요 섹션(FAQ, Tab, GNB) 사용 시 Claude Code에게 초기화 코드 요청
