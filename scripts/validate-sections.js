#!/usr/bin/env node
/**
 * validate-sections.js — PageLab 섹션 HTML 구조 검증기
 *
 * Usage:
 *   npm run validate
 *   npm run validate -- --file=sections/about/type-f-image.html
 *
 * 검사 항목:
 *   🔴 심각  - 반드시 수정해야 하는 구조 오류
 *   🟡 경고  - 권장 사항 위반
 *   🔵 정보  - 개선 제안
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ── 유틸리티 ───────────────────────────────────────────────
function getAllHtmlFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      results.push(...getAllHtmlFiles(fullPath));
    } else if (entry.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ── 검사 규칙 정의 ─────────────────────────────────────────
function validateFile(filePath, content) {
  const issues = [];
  const rel = relative(ROOT, filePath);

  const add = (level, msg) => issues.push({ level, msg, file: rel });

  // ─────────────────────────────────────────
  // 🔴 심각: 필수 구조 검사
  // ─────────────────────────────────────────

  // 1. tokens/base.css 링크 확인
  if (!content.includes('tokens/base.css')) {
    add('error', 'tokens/base.css 링크 누락');
  }

  // 2. styles/sections.css 링크 확인
  if (!content.includes('styles/sections.css')) {
    add('error', 'styles/sections.css 링크 누락');
  }

  // 3. styles/dark-mode.css 링크 확인
  if (!content.includes('styles/dark-mode.css')) {
    add('error', 'styles/dark-mode.css 링크 누락');
  }

  // 4. components.js 링크 확인
  if (!content.includes('scripts/components.js')) {
    add('error', 'scripts/components.js 링크 누락');
  }

  // 5. <section> 태그에 pl-section 클래스 확인
  const sectionTags = [...content.matchAll(/<section\s([^>]+)>/g)];
  const contentSections = sectionTags.filter(m => !m[1].includes('preview'));
  for (const match of contentSections) {
    const attrs = match[1];
    if (!attrs.includes('pl-section')) {
      add('error', `<section> 태그에 pl-section 클래스 누락 → "${match[0].slice(0, 60)}..."`);
    }
    if (!attrs.includes('data-section')) {
      add('error', `<section> 태그에 data-section 속성 누락 → "${match[0].slice(0, 60)}..."`);
    }
  }

  // ─────────────────────────────────────────
  // 🟡 경고: 권장 사항 검사
  // ─────────────────────────────────────────

  // 6. pl-section-title 컴포넌트 사용 여부
  //    섹션에 section-title 관련 div가 있지만 pl-section-title 컴포넌트가 없는 경우
  const hasHardcodedTitle = content.includes('class="pl-section-title"') ||
                            content.includes("class='pl-section-title'");
  const hasComponent = content.includes('<pl-section-title');
  if (hasHardcodedTitle && !hasComponent) {
    add('warn', 'pl-section-title 하드코딩 발견 → <pl-section-title> 컴포넌트 사용 권장');
  }

  // 7. 컨테이너 클래스 사용 여부 (pl-section__container, pl-*__container, pl-*__bg, pl-*__header)
  const hasContainer = /class="[^"]*pl-[-\w]+__(container|header|bg|inner|wrap|body)[^"]*"/.test(content);
  if (contentSections.length > 0 && !hasContainer) {
    add('warn', '섹션 컨테이너 클래스 누락 — pl-section__container 또는 pl-*__container 사용 권장');
  }

  // 8. 인라인 다크모드 스타일 잔존 여부
  if (content.includes('[data-theme="dark"]')) {
    // 버튼의 data-theme="dark" 속성인지 CSS 선택자인지 구분
    const styleBlocks = [...content.matchAll(/<style>([\s\S]*?)<\/style>/g)];
    const hasDarkInStyle = styleBlocks.some(m => m[1].includes('[data-theme="dark"]'));
    if (hasDarkInStyle) {
      add('warn', '인라인 <style>에 [data-theme="dark"] 스타일 잔존 → dark-mode.css로 이동 권장');
    }
  }

  // 9. 하드코딩된 색상 값 확인 (hex 색상)
  const styleBlocks = [...content.matchAll(/<style>([\s\S]*?)<\/style>/g)];
  const ownStyles = styleBlocks.filter(m => {
    // 프리뷰 헤더 전용 스타일 블록은 허용 (rgba 그림자 등)
    const hasPreviewRules = m[1].includes('.preview-') || m[1].includes('.device-') || m[1].includes('.theme-');
    return !hasPreviewRules;
  });
  for (const block of ownStyles) {
    const hexMatches = [...block[1].matchAll(/#[0-9a-fA-F]{3,6}\b/g)];
    const uniqueHex = [...new Set(hexMatches.map(m => m[0]))];
    if (uniqueHex.length > 0) {
      add('warn', `하드코딩된 색상 발견: ${uniqueHex.join(', ')} → var(--pl-*) 토큰 사용 권장`);
    }
  }

  // ─────────────────────────────────────────
  // 🔵 정보: 개선 제안
  // ─────────────────────────────────────────

  // 10. 이미지 alt 텍스트 확인
  const imgTags = [...content.matchAll(/<img\s([^>]+)>/g)];
  for (const match of imgTags) {
    const attrs = match[1];
    // alt가 아예 없거나, alt=""인 경우
    if (!attrs.includes('alt=')) {
      add('info', `alt 속성 없는 img 태그 발견 → "${match[0].slice(0, 50)}..."`);
    } else if (attrs.match(/alt=""/)) {
      // 장식용 이미지는 alt="" 허용 — 섹션 콘텐츠 이미지가 아닌 경우 제외
      if (!attrs.includes('role="presentation"') && !attrs.includes('aria-hidden')) {
        add('info', `alt="" 빈 텍스트 img 발견 — 의미있는 이미지라면 설명 추가 권장`);
      }
    }
  }

  // 11. pl-button 컴포넌트 사용 여부
  //     pl-btn만 단독 사용하는 경우만 권장 (pl-cta__btn 등과 함께 쓰는 경우는 제외)
  const hasStandaloneBtn = /class="pl-btn pl-btn--(?!.*pl-\w+__btn)/.test(content);
  const hasPlButton = content.includes('<pl-button');
  if (hasStandaloneBtn && !hasPlButton) {
    add('info', '원시 pl-btn 클래스 사용 발견 → <pl-button> 컴포넌트 사용 권장');
  }

  // 12. 폰트 링크 확인
  if (!content.includes('pretendard')) {
    add('info', 'Pretendard 폰트 링크 누락');
  }

  return issues;
}

// ── 실행 ───────────────────────────────────────────────────
const args = process.argv.slice(2);
const targetFile = args.find(a => a.startsWith('--file='))?.split('=')[1];

let files;
if (targetFile) {
  files = [join(ROOT, targetFile)];
} else {
  files = getAllHtmlFiles(join(ROOT, 'sections'));
}

let errorCount = 0;
let warnCount  = 0;
let infoCount  = 0;
const results  = [];

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const issues  = validateFile(file, content);
  if (issues.length > 0) {
    results.push({ file: relative(ROOT, file), issues });
    errorCount += issues.filter(i => i.level === 'error').length;
    warnCount  += issues.filter(i => i.level === 'warn').length;
    infoCount  += issues.filter(i => i.level === 'info').length;
  }
}

// ── 결과 출력 ──────────────────────────────────────────────
const ICONS = { error: '🔴', warn: '🟡', info: '🔵' };
const LABELS = { error: '심각', warn: '경고', info: '정보' };

console.log(`\n🔍 PageLab 섹션 구조 검증 결과\n${'─'.repeat(50)}`);
console.log(`   검사 파일: ${files.length}개\n`);

if (results.length === 0) {
  console.log('✅ 모든 섹션이 구조 규칙을 준수합니다.\n');
  process.exit(0);
}

for (const { file, issues } of results) {
  console.log(`📄 ${file}`);
  for (const issue of issues) {
    const icon  = ICONS[issue.level];
    const label = LABELS[issue.level];
    console.log(`   ${icon} [${label}] ${issue.msg}`);
  }
  console.log('');
}

console.log('─'.repeat(50));
console.log(`결과 요약:`);
if (errorCount > 0) console.log(`   🔴 심각: ${errorCount}건`);
if (warnCount  > 0) console.log(`   🟡 경고: ${warnCount}건`);
if (infoCount  > 0) console.log(`   🔵 정보: ${infoCount}건`);
console.log('');

if (errorCount > 0) {
  process.exit(1);
}
