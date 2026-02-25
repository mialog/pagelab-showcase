# PageLab Kit — 디자이너 가이드

## 이 키트는 무엇인가

PageLab의 섹션 시스템을 실제 프로젝트에 활용하기 위한 최소 파일 묶음입니다.
섹션 갤러리·가이드·빌더(showcase) 도구는 별도 URL에서 참고하고,
이 키트만으로 실제 납품 페이지를 제작합니다.

---

## 파일 구조

```
pagelab-kit/
├── index.html          ← 실제 랜딩 페이지 (여기에 섹션 조합)
├── tokens/
│   └── base.css        ← 브랜드 컬러 등 디자인 토큰 (여기만 수정)
├── styles/
│   ├── sections.css    ← 섹션 스타일 (수정 금지)
│   └── components.css  ← 버튼 등 공통 컴포넌트 (수정 금지)
├── scripts/
│   └── components.js   ← pl-section-title Web Component (수정 금지)
├── images/             ← 실제 프로젝트 이미지 여기에 넣기
└── AI_GUIDE.md         ← Claude Code 규칙서 (Claude에게 참고시킬 것)
```

> **sections.css, components.css, components.js는 수정하지 않습니다.**
> 커스터마이징은 반드시 `tokens/base.css` 토큰 값 변경으로만 합니다.

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
```
tokens/base.css의 브랜드 토큰을 아래 컬러로 바꿔줘.
- 브랜드 메인: #FF6B35
- 브랜드 라이트: #FFF0EA
AI_GUIDE.md 기준으로 시맨틱 토큰 체계 유지해줘.
```

**② 섹션 조합**
```
pagelab-showcase의 sections/ 폴더를 참고해서
Hero type-a-split → Intro type-b-textgrid → About type-c-card-slide →
Review type-b-card-grid → CTA type-a-finish 순서로
index.html에 섹션 HTML을 조합해줘.
AI_GUIDE.md 규칙 따라줘.
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

## 브랜드 토큰 변경 위치

`tokens/base.css`에서 아래 변수만 수정합니다.

```css
/* 브랜드 컬러 — 여기만 수정 */
--pl-bg-brand-light: #YOUR_COLOR;
--pl-bg-brand-dark:  #YOUR_DARK_COLOR;
--pl-text-brand-light: #YOUR_COLOR;
--pl-text-brand-dark:  #YOUR_DARK_COLOR;
--pl-border-brand-light: #YOUR_COLOR;
--pl-border-brand-dark:  #YOUR_DARK_COLOR;
```

> 스케일 토큰(`--pl-color-*`)은 직접 수정하지 않습니다.

---

## 주의사항

- `sections.css` 직접 수정 금지 — 업데이트 시 덮어씌워집니다
- 이미지는 반드시 `images/` 폴더 안에 정리
- 다크 모드 지원 시 `<html data-theme="dark">` 또는 토글 버튼 추가
- JS 필요 섹션(FAQ, Tab, GNB) 사용 시 Claude Code에게 초기화 코드 요청
