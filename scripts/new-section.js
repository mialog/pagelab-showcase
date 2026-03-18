#!/usr/bin/env node
/**
 * new-section.js — PageLab 섹션 스캐폴딩 CLI
 *
 * Usage:
 *   npm run new-section -- --type=about --name=type-g-video
 *   npm run new-section -- --type=benefit --name=type-c-list --label="특징/혜택" --title="리스트형"
 *
 * Options:
 *   --type   섹션 타입 (about|hero|benefit|step|review|cta|intro|navigation|faq|etc)
 *   --name   파일 이름 (예: type-g-video → sections/about/type-g-video.html)
 *   --label  프리뷰 헤더 태그 텍스트 (생략 시 타입별 기본값)
 *   --title  프리뷰 헤더 제목 텍스트 (생략 시 name 기반 자동 생성)
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ── CLI 인수 파싱 ──────────────────────────────────────────
const args = process.argv.slice(2);
const get = (key) => {
  const entry = args.find(a => a.startsWith(`--${key}=`));
  return entry ? entry.split('=').slice(1).join('=') : null;
};

const type  = get('type');
const name  = get('name');
const label = get('label');
const title = get('title');

// ── 유효성 검사 ────────────────────────────────────────────
const VALID_TYPES = ['about', 'hero', 'benefit', 'step', 'review', 'cta', 'intro', 'navigation', 'faq', 'etc'];

if (!type || !name) {
  console.error(`
❌ 사용법: npm run new-section -- --type=<타입> --name=<이름>

  --type   섹션 타입: ${VALID_TYPES.join(' | ')}
  --name   파일 이름: type-g-video, type-c-list 등
  --label  헤더 태그 (선택): "특징/혜택"
  --title  헤더 제목 (선택): "리스트형"

예시:
  npm run new-section -- --type=about --name=type-g-video
  npm run new-section -- --type=benefit --name=type-c-list --title="리스트형"
`);
  process.exit(1);
}

if (!VALID_TYPES.includes(type)) {
  console.error(`❌ 유효하지 않은 타입: "${type}"\n   사용 가능: ${VALID_TYPES.join(', ')}`);
  process.exit(1);
}

// ── 기본값 설정 ────────────────────────────────────────────
const TYPE_DEFAULTS = {
  about:      { label: '콘텐츠 설명',     title: '소개형' },
  hero:       { label: '히어로',          title: '히어로' },
  benefit:    { label: '혜택/특징',       title: '특징형' },
  step:       { label: '단계/프로세스',   title: '단계형' },
  review:     { label: '리뷰/후기',       title: '리뷰형' },
  cta:        { label: 'Call to Action',  title: 'CTA형' },
  intro:      { label: '인트로',          title: '인트로형' },
  navigation: { label: '네비게이션',      title: 'GNB/Footer' },
  faq:        { label: 'FAQ',             title: 'FAQ형' },
  etc:        { label: '기타',            title: '기타형' },
};

const defaults  = TYPE_DEFAULTS[type];
const tagLabel  = label || defaults.label;
const tagTitle  = title || defaults.title;

// ── 파일 경로 설정 ─────────────────────────────────────────
const fileName  = name.endsWith('.html') ? name : `${name}.html`;
const dirPath   = join(ROOT, 'sections', type);
const filePath  = join(dirPath, fileName);

if (existsSync(filePath)) {
  console.error(`❌ 이미 존재하는 파일: sections/${type}/${fileName}`);
  process.exit(1);
}

// ── HTML 템플릿 생성 ───────────────────────────────────────
const sectionClass = `pl-${type}`;
const variantClass = name.replace(/[^a-z0-9-]/g, '-');

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tagTitle} | PageLab Section Showcase</title>
  <link rel="stylesheet" href="./../../tokens/base.css">
  <link rel="stylesheet" href="./../../tokens/campaign.css">
  <link rel="stylesheet" href="./../../styles/sections.css">
  <link rel="stylesheet" href="./../../styles/components.css">
  <link rel="stylesheet" href="./../../styles/dark-mode.css">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">
  <script src="./../../scripts/components.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--pl-font-main);
      background: var(--pl-bg-neutral);
      min-height: 100vh;
    }

    /* Preview Header */
    .preview-header {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--pl-spacing-4) var(--pl-spacing-6);
      background: var(--pl-bg-default);
      border-bottom: 1px solid var(--pl-border-light);
    }

    .preview-header__left {
      display: flex;
      align-items: center;
      gap: var(--pl-spacing-4);
    }

    .preview-header__back {
      display: flex;
      align-items: center;
      gap: var(--pl-spacing-2);
      font-size: var(--pl-font-size-body-sm);
      color: var(--pl-text-tertiary);
      text-decoration: none;
      transition: color 0.2s;
    }

    .preview-header__back:hover {
      color: var(--pl-text-primary);
    }

    .preview-header__back svg {
      width: 16px;
      height: 16px;
    }

    .preview-header__info {
      display: flex;
      align-items: center;
      gap: var(--pl-spacing-3);
    }

    .preview-header__tag {
      padding: var(--pl-spacing-1) var(--pl-spacing-3);
      font-size: var(--pl-font-size-label-sm);
      font-weight: var(--pl-font-weight-bold);
      color: var(--pl-static-green);
      background: var(--pl-green-5);
      border-radius: var(--pl-radius-1);
    }

    .preview-header__title {
      font-size: var(--pl-font-size-title-sm);
      font-weight: var(--pl-font-weight-bold);
      color: var(--pl-text-primary);
    }

    /* Device Switcher */
    .device-switcher {
      display: flex;
      align-items: center;
      gap: var(--pl-spacing-2);
      background: var(--pl-bg-neutral);
      padding: 4px;
      border-radius: var(--pl-radius-2);
    }

    .device-btn {
      display: flex;
      align-items: center;
      gap: var(--pl-spacing-2);
      padding: var(--pl-spacing-2) var(--pl-spacing-4);
      font-size: var(--pl-font-size-label-sm);
      font-weight: var(--pl-font-weight-default);
      color: var(--pl-text-tertiary);
      background: transparent;
      border: none;
      border-radius: var(--pl-radius-1);
      cursor: pointer;
      transition: all 0.2s;
    }

    .device-btn:hover {
      color: var(--pl-text-primary);
    }

    .device-btn.is-active {
      color: var(--pl-text-primary);
      background: var(--pl-bg-default);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      font-weight: var(--pl-font-weight-bold);
    }

    .device-btn__size {
      font-size: 11px;
      color: var(--pl-text-lowest);
    }

    /* Preview Container */
    .preview-container {
      display: flex;
      justify-content: center;
      padding: var(--pl-spacing-8);
      min-height: calc(100vh - 60px);
    }

    .preview-frame {
      background: var(--pl-bg-default);
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      border-radius: var(--pl-radius-3);
      overflow: hidden;
      transition: width 0.3s ease;
    }

    .preview-frame[data-device="pc"]     { width: 1920px; }
    .preview-frame[data-device="tablet"] { width: 720px; }
    .preview-frame[data-device="mobile"] { width: 360px; }

    /* Section Content */
    .preview-content {
      width: 100%;
      container-type: inline-size;
      container-name: section;
    }

    /* Preview Header Right */
    .preview-header__right {
      display: flex;
      align-items: center;
      gap: var(--pl-spacing-3);
    }

    /* Theme Switcher */
    .theme-switcher {
      display: flex;
      align-items: center;
      gap: var(--pl-spacing-2);
      background: var(--pl-bg-neutral);
      padding: 4px;
      border-radius: var(--pl-radius-2);
    }

    .theme-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--pl-spacing-2);
      padding: var(--pl-spacing-3) var(--pl-spacing-5);
      font-size: var(--pl-font-size-label-sm);
      font-weight: var(--pl-font-weight-default);
      color: var(--pl-text-tertiary);
      background: transparent;
      border: none;
      border-radius: var(--pl-radius-1);
      cursor: pointer;
      transition: all 0.2s;
    }

    .theme-btn:hover {
      color: var(--pl-text-primary);
    }

    .theme-btn.is-active {
      color: var(--pl-text-primary);
      background: var(--pl-bg-default);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      font-weight: var(--pl-font-weight-bold);
    }

    /* TODO: 이 섹션 전용 스타일을 여기에 추가하세요 */

  </style>
</head>
<body>

  <!-- Preview Header -->
  <header class="preview-header">
    <div class="preview-header__left">
      <a href="../../index.html" class="preview-header__back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        갤러리
      </a>
      <div class="preview-header__info">
        <span class="preview-header__tag">${tagLabel}</span>
        <h1 class="preview-header__title">${tagTitle}</h1>
      </div>
    </div>

    <div class="preview-header__right">
      <div class="theme-switcher">
        <button class="theme-btn is-active" data-theme="light">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          Light
        </button>
        <button class="theme-btn" data-theme="dark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          Dark
        </button>
      </div>
      <div class="device-switcher">
        <button class="device-btn is-active" data-device="pc">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          PC
          <span class="device-btn__size">1920</span>
        </button>
        <button class="device-btn" data-device="tablet">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
          Tablet
          <span class="device-btn__size">720</span>
        </button>
        <button class="device-btn" data-device="mobile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
          Mobile
          <span class="device-btn__size">360</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Preview Container -->
  <div class="preview-container">
    <div class="preview-frame" data-device="pc">
      <div class="preview-content">
        <!--
          ========================================
          ${tagLabel} - ${tagTitle}
          TODO: Figma 스펙을 여기에 기록하세요
          ========================================
        -->
        <section class="pl-section ${sectionClass} ${sectionClass}--${variantClass}" data-section="${type}">
          <div class="pl-section__container ${sectionClass}__container">

            <!-- Section Title -->
            <pl-section-title
              label="섹션 레이블"
              heading="섹션 제목을 입력하세요"
              description="섹션 설명을 입력하세요">
            </pl-section-title>

            <!-- TODO: 섹션 콘텐츠를 여기에 추가하세요 -->

          </div>
        </section>

      </div>
    </div>
  </div>

  <script>
    // Device Switcher
    const deviceBtns = document.querySelectorAll('.device-btn');
    const previewFrame = document.querySelector('.preview-frame');

    deviceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        deviceBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        previewFrame.dataset.device = btn.dataset.device;
      });
    });

    // Theme Switcher
    const themeBtns = document.querySelectorAll('.theme-btn');
    const previewContent = document.querySelector('.preview-content');

    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        themeBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        if (btn.dataset.theme === 'dark') {
          previewContent.setAttribute('data-theme', 'dark');
        } else {
          previewContent.removeAttribute('data-theme');
        }
      });
    });
  </script>

</body>
</html>
`;

// ── 파일 쓰기 ──────────────────────────────────────────────
mkdirSync(dirPath, { recursive: true });
writeFileSync(filePath, html, 'utf8');

console.log(`
✅ 새 섹션 파일 생성 완료!

   📄 sections/${type}/${fileName}
   🏷️  태그: ${tagLabel}
   📌 제목: ${tagTitle}

다음 단계:
  1. 파일을 열어 TODO 주석 위치에 콘텐츠를 추가하세요
  2. styles/sections.css 에 섹션 전용 CSS를 추가하세요
  3. index.html 갤러리에 링크를 추가하세요
`);
