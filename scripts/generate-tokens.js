#!/usr/bin/env node
/**
 * generate-tokens.js
 * PLtokens.json → tokens/base.css 자동 생성
 *
 * 사용법:
 *   node scripts/generate-tokens.js
 *   npm run tokens
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const json = JSON.parse(readFileSync(join(ROOT, 'PLtokens.json'), 'utf-8'));

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
const px = (v) => (typeof v === 'number' ? `${v}px` : v);
const pct = (v) => (v / 100).toFixed(2).replace(/\.?0+$/, '');  // 168 → 1.68
const fontWeight = (v) => ({ Light: 300, Medium: 500, Bold: 700 }[v] ?? v);
const fontFamily = (v) => `'${v}', sans-serif`;

// 숫자 suffix 패딩: "8" → "08", "12" → "12"
const pad = (n) => String(n).padStart(2, '0');

// ─────────────────────────────────────────────
// CoreColor → CSS 변수명 변환
// AlphaBlack8 → --pl-alpha-black-08
// Neutral100  → --pl-neutral-100
// ─────────────────────────────────────────────
function coreColorVar(key) {
  // Alpha 토큰: AlphaBlack8, AlphaWhite12, AlphaLightblue32 ...
  const alphaMatch = key.match(/^Alpha([A-Za-z]+?)(\d+)$/);
  if (alphaMatch) {
    const color = alphaMatch[1].toLowerCase().replace('lightblue', 'lightblue');
    const num = pad(alphaMatch[2]);
    return `--pl-alpha-${color}-${num}`;
  }

  // 팔레트 토큰: Neutral100, Lightblue50, Red10 ...
  const paletteMatch = key.match(/^([A-Za-z]+?)(\d+)$/);
  if (paletteMatch) {
    const color = camel2kebab(paletteMatch[1]);
    return `--pl-${color}-${paletteMatch[2]}`;
  }

  return null;
}

// CamelCase → kebab-case
function camel2kebab(str) {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

// ─────────────────────────────────────────────
// SementicColor → CSS 변수명 변환
// TextPrimary → --pl-text-primary
// BackgroundBrand → --pl-bg-brand
// BorderBrandLight → --pl-border-brand-light
// ─────────────────────────────────────────────
const SEMANTIC_PREFIX_MAP = {
  'Text':       'text',
  'Background': 'bg',
  'Border':     'border',
  'Icon':       'icon',
  'Static':     'static',
};

function semanticColorVar(key) {
  for (const [prefix, cssPrefix] of Object.entries(SEMANTIC_PREFIX_MAP)) {
    if (key.startsWith(prefix)) {
      const rest = key.slice(prefix.length);
      return `--pl-${cssPrefix}-${camel2kebab(rest)}`;
    }
  }
  // ScaleColor* 등 매핑 안 되는 항목 스킵
  return null;
}

// ─────────────────────────────────────────────
// Responsive 항목별 변환 규칙
// ─────────────────────────────────────────────
function responsiveVar(key, pcVal) {
  // Spacing
  if (/^Spacing\d+$/.test(key)) {
    const n = key.replace('Spacing', '');
    return { name: `--pl-spacing-${n}`, value: px(pcVal) };
  }
  // Border width
  if (/^Border\d+$/.test(key)) {
    const n = key.replace('Border', '');
    return { name: `--pl-border-${n}`, value: px(pcVal) };
  }
  // Radius
  if (key === 'Radius0Circle') return { name: '--pl-radius-circle', value: `${pcVal}px` };
  if (/^Radius\d+$/.test(key)) {
    const n = key.replace('Radius', '');
    return { name: `--pl-radius-${n}`, value: px(pcVal) };
  }
  // Font family
  if (key === 'FontFamilyMain')   return { name: '--pl-font-main',     value: fontFamily(pcVal) };
  if (key === 'FontFamilyPoint')  return { name: '--pl-font-point',    value: fontFamily(pcVal) };
  if (key === 'FontFamilyJaJP')   return { name: '--pl-font-ja',       value: fontFamily(pcVal) };
  if (key === 'FontFamilyZhTW')   return { name: '--pl-font-zh-tw',    value: fontFamily(pcVal) };
  if (key === 'FontFamilyZhCN')   return { name: '--pl-font-zh-cn',    value: fontFamily(pcVal) };
  if (key === 'FontFamilyKids')   return { name: '--pl-font-kids',     value: fontFamily(pcVal) };
  // Font size
  const sizeMap = {
    FontSizeDisplayLarge:  '--pl-font-size-display-lg',
    FontSizeDisplayMedium: '--pl-font-size-display-md',
    FontSizeDisplaySmall:  '--pl-font-size-display-sm',
    FontSizeHeaderLarge:   '--pl-font-size-header-lg',
    FontSizeHeaderMedium:  '--pl-font-size-header-md',
    FontSizeHeaderSmall:   '--pl-font-size-header-sm',
    FontSizeTitleLarge:    '--pl-font-size-title-lg',
    FontSizeTitleMedium:   '--pl-font-size-title-md',
    FontSizeTitleSmall:    '--pl-font-size-title-sm',
    FontSizeBodyLarge:     '--pl-font-size-body-lg',
    FontSizeBodyMedium:    '--pl-font-size-body-md',
    FontSizeBodySmall:     '--pl-font-size-body-sm',
    FontSizeLabelLarge:    '--pl-font-size-label-lg',
    FontSizeLabelMedium:   '--pl-font-size-label-md',
    FontSizeLabelSmall:    '--pl-font-size-label-sm',
  };
  if (sizeMap[key]) return { name: sizeMap[key], value: px(pcVal) };
  // Font weight
  if (key === 'FontWeightLight')   return { name: '--pl-font-weight-light',   value: String(fontWeight(pcVal)) };
  if (key === 'FontWeightDefault') return { name: '--pl-font-weight-default', value: String(fontWeight(pcVal)) };
  if (key === 'FontWeightBold')    return { name: '--pl-font-weight-bold',    value: String(fontWeight(pcVal)) };
  // Line height
  if (key === 'FontLineheightTitle')   return { name: '--pl-line-height-title',   value: pct(pcVal) };
  if (key === 'FontLineheightDefault') return { name: '--pl-line-height-default', value: pct(pcVal) };
  if (key === 'FontLineheightBody')    return { name: '--pl-line-height-body',    value: pct(pcVal) };
  // Letter spacing
  if (key === 'FontLetterspacingNarrow') return { name: '--pl-letter-spacing-narrow', value: px(pcVal) };
  if (key === 'FontLetterspacingNormal') return { name: '--pl-letter-spacing-normal', value: px(pcVal) };
  if (key === 'FontLetterspacingWide')   return { name: '--pl-letter-spacing-wide',   value: px(pcVal) };
  // Layout
  if (key === 'LayoutContainerMaxWidthDefault') return { name: '--pl-container-default', value: px(pcVal) };
  if (key === 'LayoutContainerMaxWidthNarrow')  return { name: '--pl-container-narrow',  value: px(pcVal) };
  if (key === 'LayoutContainerMaxWidthWide')    return { name: '--pl-container-wide',    value: px(pcVal) };
  if (key === 'LayoutContainerMaxWidthCompact') return { name: '--pl-container-compact', value: px(pcVal) };
  if (key === 'LayoutHorPadding')  return { name: '--pl-layout-padding',      value: px(pcVal) };
  if (key === 'LayoutBodyTop')     return { name: '--pl-layout-body-top',     value: px(pcVal) };
  if (key === 'LayoutBodyBottom')  return { name: '--pl-layout-body-bottom',  value: px(pcVal) };
  // Device
  if (key === 'DeviceMinHeight')   return { name: '--pl-device-min-height',   value: px(pcVal) };
  if (key === 'DeviceMinWidth')    return { name: '--pl-device-pc-min',       value: px(pcVal) };
  // 아래 항목들은 특수 처리가 필요하거나 CSS 토큰으로 쓰지 않는 항목 → 스킵
  return null;
}

// ─────────────────────────────────────────────
// Component 토큰 변환
// ─────────────────────────────────────────────
function componentVar(key, pcVal) {
  const map = {
    'Buttonradius':               '--comp-btn-radius',
    'ButtonlargePaddingHor':      '--comp-btn-large-padding-hor',
    'ButtonlargePaddingVer':      '--comp-btn-large-padding-ver',
    'ButtonlargeGap':             '--comp-btn-large-gap',
    'ButtonmediumPaddingHor':     '--comp-btn-medium-padding-hor',
    'ButtonmediumPaddingVer':     '--comp-btn-medium-padding-ver',
    'ButtonmediumGap':            '--comp-btn-medium-gap',
    'ButtonsmallPaddingHor':      '--comp-btn-small-padding-hor',
    'ButtonsmallPaddingVer':      '--comp-btn-small-padding-ver',
    'ButtonsmallGap':             '--comp-btn-small-gap',
    'ButtonxsmallPaddingHor':     '--comp-btn-xsmall-padding-hor',
    'ButtonxsmallPaddingVer':     '--comp-btn-xsmall-padding-ver',
    'ButtonxsmallGap':            '--comp-btn-xsmall-gap',
    'ButtonghostRadius':          '--comp-btn-ghost-radius',
    'ButtonghostLargePaddingHor': '--comp-btn-ghost-large-padding-hor',
    'ButtonghostLargePaddingVer': '--comp-btn-ghost-large-padding-ver',
    'ButtonghostMediumPaddingHor':'--comp-btn-ghost-medium-padding-hor',
    'ButtonghostMediumPaddingVer':'--comp-btn-ghost-medium-padding-ver',
    'ButtonghostSmallPaddingHor': '--comp-btn-ghost-small-padding-hor',
    'ButtonghostSmallPaddingVer': '--comp-btn-ghost-small-padding-ver',
    'ButtonghostXsmallPaddingHor':'--comp-btn-ghost-xsmall-padding-hor',
    'ButtonghostXsmallPaddingVer':'--comp-btn-ghost-xsmall-padding-ver',
    'ButtonbtnIcRadius':          '--comp-btn-ic-radius',
    'ButtonicLargePadding':       '--comp-btn-ic-large-padding',
    'ButtonicMediumPadding':      '--comp-btn-ic-medium-padding',
    'ButtonicSmallPadding':       '--comp-btn-ic-small-padding',
    'ButtonbtnIcGhostRadius':     '--comp-btn-ic-ghost-radius',
    'ButtonicGhostLargePadding':  '--comp-btn-ic-ghost-large-padding',
    'ButtonicGhostMediumPadding': '--comp-btn-ic-ghost-medium-padding',
    'ButtonicGhostSmallPadding':  '--comp-btn-ic-ghost-small-padding',
    'Buttonmax width':            '--comp-btn-max-width',
    'Buttongroup max width':      '--comp-btn-group-max-width',
  };
  if (!map[key]) return null;
  return { name: map[key], value: px(pcVal) };
}

// ─────────────────────────────────────────────
// 반응형 오버라이드 생성
// Responsive 섹션의 Ta, Mo 값이 Pc와 다를 때만 포함
// ─────────────────────────────────────────────
function buildResponsiveOverrides(tokens, breakpoint) {
  const lines = [];
  for (const [key, vals] of Object.entries(tokens)) {
    const pcEntry = responsiveVar(key, vals.Pc);
    if (!pcEntry) continue;
    const overrideVal = vals[breakpoint];
    if (overrideVal === undefined || overrideVal === vals.Pc) continue;

    let cssVal;
    if (key.startsWith('FontWeight')) cssVal = String(fontWeight(overrideVal));
    else if (key.startsWith('FontLineheight')) cssVal = pct(overrideVal);
    else if (key.startsWith('FontLetterspacing')) cssVal = px(overrideVal);
    else if (key.startsWith('FontFamily')) cssVal = fontFamily(overrideVal);
    else cssVal = px(overrideVal);

    lines.push(`    ${pcEntry.name}: ${cssVal};`);
  }
  return lines;
}

// ─────────────────────────────────────────────
// CSS 생성
// ─────────────────────────────────────────────
const lines = [];

lines.push(`/* ============================================`);
lines.push(`   PageLab Design Tokens - Base`);
lines.push(`   ⚠️  이 파일은 PLtokens.json에서 자동 생성됩니다.`);
lines.push(`   직접 수정하지 마세요. 변경은 PLtokens.json에서 하세요.`);
lines.push(`   생성 명령: npm run tokens`);
lines.push(`   ============================================ */`);
lines.push(``);
lines.push(`:root {`);

// ── 1. Responsive (PC 기준)
const R = json.Responsive;

lines.push(`  /* ----------------------------------------`);
lines.push(`     Device Breakpoints`);
lines.push(`     ---------------------------------------- */`);
lines.push(`  --pl-device-pc-min: ${px(R.DeviceMinWidth.Pc)};`);
lines.push(`  --pl-device-tablet-min: ${px(R.DeviceMinWidth.Ta)};`);
lines.push(`  --pl-device-tablet-max: ${px(R.DeviceMaxWidth.Ta)};`);
lines.push(`  --pl-device-mobile-max: ${px(R.DeviceMaxWidth.Mo)};`);
lines.push(``);

lines.push(`  /* ----------------------------------------`);
lines.push(`     Spacing (PC 기준)`);
lines.push(`     ---------------------------------------- */`);
for (const [key, vals] of Object.entries(R)) {
  if (!/^Spacing\d+$/.test(key)) continue;
  const e = responsiveVar(key, vals.Pc);
  if (e) lines.push(`  ${e.name}: ${e.value};`);
}
lines.push(``);

lines.push(`  /* ----------------------------------------`);
lines.push(`     Border Width`);
lines.push(`     ---------------------------------------- */`);
for (const [key, vals] of Object.entries(R)) {
  if (!/^Border\d+$/.test(key)) continue;
  const e = responsiveVar(key, vals.Pc);
  if (e) lines.push(`  ${e.name}: ${e.value};`);
}
lines.push(``);

lines.push(`  /* ----------------------------------------`);
lines.push(`     Border Radius`);
lines.push(`     ---------------------------------------- */`);
const radiusOrder = ['Radius1','Radius2','Radius3','Radius4','Radius5','Radius6','Radius7','Radius0Circle'];
for (const key of radiusOrder) {
  if (!R[key]) continue;
  const e = responsiveVar(key, R[key].Pc);
  if (e) lines.push(`  ${e.name}: ${e.value};`);
}
lines.push(``);

lines.push(`  /* ----------------------------------------`);
lines.push(`     Layout (PC 기준)`);
lines.push(`     ---------------------------------------- */`);
const layoutKeys = [
  'LayoutContainerMaxWidthCompact','LayoutContainerMaxWidthNarrow',
  'LayoutContainerMaxWidthDefault','LayoutContainerMaxWidthWide',
  'LayoutHorPadding','LayoutBodyTop','LayoutBodyBottom','DeviceMinHeight',
];
for (const key of layoutKeys) {
  if (!R[key]) continue;
  const e = responsiveVar(key, R[key].Pc);
  if (e) lines.push(`  ${e.name}: ${e.value};`);
}
lines.push(``);

lines.push(`  /* ----------------------------------------`);
lines.push(`     Typography - Font Family`);
lines.push(`     ---------------------------------------- */`);
for (const key of ['FontFamilyMain','FontFamilyPoint','FontFamilyJaJP','FontFamilyZhTW','FontFamilyZhCN','FontFamilyKids']) {
  if (!R[key]) continue;
  const e = responsiveVar(key, R[key].Pc);
  if (e) lines.push(`  ${e.name}: ${e.value};`);
}
lines.push(``);

lines.push(`  /* ----------------------------------------`);
lines.push(`     Typography - Font Size (PC 기준)`);
lines.push(`     ---------------------------------------- */`);
const fontSizeKeys = [
  'FontSizeDisplayLarge','FontSizeDisplayMedium','FontSizeDisplaySmall',
  'FontSizeHeaderLarge','FontSizeHeaderMedium','FontSizeHeaderSmall',
  'FontSizeTitleLarge','FontSizeTitleMedium','FontSizeTitleSmall',
  'FontSizeBodyLarge','FontSizeBodyMedium','FontSizeBodySmall',
  'FontSizeLabelLarge','FontSizeLabelMedium','FontSizeLabelSmall',
];
for (const key of fontSizeKeys) {
  if (!R[key]) continue;
  const e = responsiveVar(key, R[key].Pc);
  if (e) lines.push(`  ${e.name}: ${e.value};`);
}
lines.push(``);

lines.push(`  /* ----------------------------------------`);
lines.push(`     Typography - Font Weight`);
lines.push(`     ---------------------------------------- */`);
for (const key of ['FontWeightLight','FontWeightDefault','FontWeightBold']) {
  if (!R[key]) continue;
  const e = responsiveVar(key, R[key].Pc);
  if (e) lines.push(`  ${e.name}: ${e.value};`);
}
lines.push(``);

lines.push(`  /* ----------------------------------------`);
lines.push(`     Typography - Line Height`);
lines.push(`     ---------------------------------------- */`);
for (const key of ['FontLineheightTitle','FontLineheightDefault','FontLineheightBody']) {
  if (!R[key]) continue;
  const e = responsiveVar(key, R[key].Pc);
  if (e) lines.push(`  ${e.name}: ${e.value};`);
}
lines.push(``);

lines.push(`  /* ----------------------------------------`);
lines.push(`     Typography - Letter Spacing`);
lines.push(`     ---------------------------------------- */`);
for (const key of ['FontLetterspacingNarrow','FontLetterspacingNormal','FontLetterspacingWide']) {
  if (!R[key]) continue;
  const e = responsiveVar(key, R[key].Pc);
  if (e) lines.push(`  ${e.name}: ${e.value};`);
}
lines.push(``);

// ── 2. CoreColor (팔레트 스케일)
const C = json.CoreColor;

// 색상 그룹 순서 정의
const colorGroups = [
  { label: 'Neutral', prefix: 'Neutral' },
  { label: 'Blue (Accent)', prefix: 'Blue' },
  { label: 'Lightblue (Brand)', prefix: 'Lightblue' },
  { label: 'Green', prefix: 'Green' },
  { label: 'Yellow', prefix: 'Yellow' },
  { label: 'Orange', prefix: 'Orange' },
  { label: 'Red', prefix: 'Red' },
  { label: 'Pink', prefix: 'Pink' },
  { label: 'Violet', prefix: 'Violet' },
];

for (const { label, prefix } of colorGroups) {
  const entries = Object.entries(C)
    .filter(([k]) => k.startsWith(prefix) && !k.startsWith('Alpha'))
    .sort(([a], [b]) => {
      const na = parseInt(a.replace(prefix, '')) || 0;
      const nb = parseInt(b.replace(prefix, '')) || 0;
      return na - nb;
    });
  if (!entries.length) continue;
  lines.push(`  /* ----------------------------------------`);
  lines.push(`     Core Colors - ${label}`);
  lines.push(`     ---------------------------------------- */`);
  for (const [key, val] of entries) {
    const varName = coreColorVar(key);
    if (varName) lines.push(`  ${varName}: ${val.Mode1};`);
  }
  lines.push(``);
}

// ── 3. SementicColor (시맨틱)
const S = json.SementicColor;

const semanticGroups = [
  { label: 'Semantic Colors - Text', prefix: 'Text' },
  { label: 'Semantic Colors - Background', prefix: 'Background' },
  { label: 'Semantic Colors - Border', prefix: 'Border' },
  { label: 'Semantic Colors - Icon', prefix: 'Icon' },
  { label: 'Static Colors (고정 컬러)', prefix: 'Static' },
];

for (const { label, prefix } of semanticGroups) {
  const entries = Object.entries(S).filter(([k]) => k.startsWith(prefix));
  if (!entries.length) continue;
  lines.push(`  /* ----------------------------------------`);
  lines.push(`     ${label}`);
  lines.push(`     ---------------------------------------- */`);
  for (const [key, val] of entries) {
    const varName = semanticColorVar(key);
    if (varName) lines.push(`  ${varName}: ${val.Mode1};`);
  }
  lines.push(``);
}

// ── 4. Alpha (CoreColor에서)
lines.push(`  /* ----------------------------------------`);
lines.push(`     Alpha Colors (Interaction Overlays)`);
lines.push(`     ---------------------------------------- */`);
const alphaOrder = ['AlphaBlack','AlphaWhite','AlphaGray','AlphaLightblue'];
for (const prefix of alphaOrder) {
  const entries = Object.entries(C)
    .filter(([k]) => k.startsWith(prefix))
    .sort(([a], [b]) => parseInt(a.match(/\d+$/)[0]) - parseInt(b.match(/\d+$/)[0]));
  for (const [key, val] of entries) {
    const varName = coreColorVar(key);
    if (varName) lines.push(`  ${varName}: ${val.Mode1};`);
  }
}
lines.push(``);

// ── 5. Component 토큰
lines.push(`  /* ----------------------------------------`);
lines.push(`     Shadow`);
lines.push(`     ---------------------------------------- */`);
lines.push(`  --pl-shadow-sm: 0 1px 3px var(--pl-alpha-black-08);`);
lines.push(`  --pl-shadow-md: 0 4px 16px var(--pl-alpha-black-08);`);
lines.push(`  --pl-shadow-lg: 0 4px 24px var(--pl-alpha-black-12);`);
lines.push(`  --pl-shadow-xl: 0 8px 24px var(--pl-alpha-black-12);`);
lines.push(`  --pl-shadow-float-up: 0 -4px 16px var(--pl-alpha-black-08);`);
lines.push(`  --pl-shadow-brand: 0 4px 20px var(--pl-alpha-lightblue-12);`);
lines.push(`  --pl-shadow-accent: 0 4px 16px var(--pl-alpha-lightblue-08);`);
lines.push(``);
lines.push(`  /* ----------------------------------------`);
lines.push(`     Z-index`);
lines.push(`     ---------------------------------------- */`);
lines.push(`  --pl-z-base: 0;`);
lines.push(`  --pl-z-dropdown: 10;`);
lines.push(`  --pl-z-sticky: 50;`);
lines.push(`  --pl-z-nav: 100;`);
lines.push(`  --pl-z-gnb: 150;`);
lines.push(`  --pl-z-modal: 200;`);
lines.push(`  --pl-z-toast: 300;`);
lines.push(``);
lines.push(`  /* ----------------------------------------`);
lines.push(`     Transition`);
lines.push(`     ---------------------------------------- */`);
lines.push(`  --pl-transition-fast: all 0.15s ease;`);
lines.push(`  --pl-transition-base: all 0.2s ease;`);
lines.push(`  --pl-transition-slow: all 0.3s ease;`);
lines.push(`  --pl-transition-device: max-width 0.3s ease;`);
lines.push(`  --pl-transition-bg: background 0.2s ease;`);
lines.push(`  --pl-transition-opacity: opacity 0.2s ease;`);
lines.push(``);
lines.push(`  /* ----------------------------------------`);
lines.push(`     Layout - GNB / Shell`);
lines.push(`     ---------------------------------------- */`);
lines.push(`  --pl-gnb-height: 56px;`);
lines.push(`  --pl-nav-sidebar-width: 220px;`);
lines.push(``);
lines.push(`  /* ----------------------------------------`);
lines.push(`     PageLab Aliases`);
lines.push(`     (Figma JSON에 없지만 코드에서 사용하는 편의 별칭)`);
lines.push(`     ---------------------------------------- */`);
lines.push(`  /* Brand = Lightblue (디자인 시스템 브랜드 컬러) */`);
lines.push(`  --pl-alpha-brand-08: var(--pl-alpha-lightblue-08);`);
lines.push(`  --pl-alpha-brand-12: var(--pl-alpha-lightblue-12);`);
lines.push(`  --pl-alpha-brand-24: var(--pl-alpha-lightblue-24);`);
lines.push(`  --pl-alpha-brand-32: var(--pl-alpha-lightblue-32);`);
lines.push(`  /* Static white (Dark bg에서 텍스트/아이콘용) */`);
lines.push(`  --pl-static-white: var(--pl-neutral-0);`);
lines.push(`  /* Alpha white 72 (Figma JSON에 없는 단계 — 직접 정의) */`);
lines.push(`  --pl-alpha-white-72: rgba(255, 255, 255, 0.72);`);
lines.push(``);

// Component 토큰은 styles/components.css에서 단독 관리
// (base.css에 중복 정의하지 않음 — Token ↔ Component 레이어 분리)

lines.push(`}`);
lines.push(``);

// ── 6. Dark Theme 오버라이드 (수동 유지 섹션 — JSON에 다크모드 없음)
lines.push(`/* ============================================`);
lines.push(`   Dark Theme (Reverse Mode)`);
lines.push(`   Figma Variable reverse 모드에서 default와 다른 값만 오버라이드`);
lines.push(`   ============================================ */`);
lines.push(`[data-theme="dark"] {`);
lines.push(`  /* Text */`);
lines.push(`  --pl-text-primary: #ffffff;`);
lines.push(`  --pl-text-secondary: #e3e8ed;`);
lines.push(`  --pl-text-tertiary: #c6d0d7;`);
lines.push(`  --pl-text-invert: #0b0d11;`);
lines.push(`  --pl-text-link-sub: #c6d0d7;`);
lines.push(`  --pl-text-brand-light: #06435b;`);
lines.push(`  --pl-text-brand-dark: #8ddaf9;`);
lines.push(`  --pl-text-accent-dark: #b7c8ff;`);
lines.push(`  --pl-text-accent-light: #082271;`);
lines.push(`  --pl-text-positive-dark: #8fd5b0;`);
lines.push(`  --pl-text-positive-light: #167d46;`);
lines.push(`  --pl-text-caution-dark: #fed571;`);
lines.push(`  --pl-text-caution-light: #a37402;`);
lines.push(`  --pl-text-negative-dark: #f68d91;`);
lines.push(`  --pl-text-negative-light: #7e0a0e;`);
lines.push(``);
lines.push(`  /* Background */`);
lines.push(`  --pl-bg-default: #0b0d11;`);
lines.push(`  --pl-bg-invert: #ffffff;`);
lines.push(`  --pl-bg-brand-dark: #d1eefa;`);
lines.push(`  --pl-bg-brand-light: #06435b;`);
lines.push(`  --pl-bg-overlay: rgba(11, 13, 17, 0.80);`);
lines.push(`  --pl-bg-accent-dark: #dae3ff;`);
lines.push(`  --pl-bg-accent-light: #0e2f91;`);
lines.push(`  --pl-bg-positive-dark: #ecf8f2;`);
lines.push(`  --pl-bg-positive-light: #167d46;`);
lines.push(`  --pl-bg-caution-dark: #fff8e7;`);
lines.push(`  --pl-bg-caution-light: #a37402;`);
lines.push(`  --pl-bg-negative-dark: #fef5f5;`);
lines.push(`  --pl-bg-negative-light: #a32428;`);
lines.push(``);
lines.push(`  /* Border */`);
lines.push(`  --pl-border-invert: #0b0d11;`);
lines.push(`  --pl-border-brand-light: #045f84;`);
lines.push(`  --pl-border-brand-dark: #8ddaf9;`);
lines.push(`  --pl-border-accent-dark: #8eabff;`);
lines.push(`  --pl-border-accent-light: #0e2f91;`);
lines.push(`  --pl-border-positive-dark: #8fd5b0;`);
lines.push(`  --pl-border-positive-light: #167d46;`);
lines.push(`  --pl-border-caution-dark: #fee3a0;`);
lines.push(`  --pl-border-caution-light: #a37402;`);
lines.push(`  --pl-border-negative-dark: #f68d91;`);
lines.push(`  --pl-border-negative-light: #7e0a0e;`);
lines.push(``);
lines.push(`  /* Icon */`);
lines.push(`  --pl-icon-primary: #ffffff;`);
lines.push(`  --pl-icon-secondary: #e3e8ed;`);
lines.push(`  --pl-icon-tertiary: #d4dce2;`);
lines.push(`  --pl-icon-invert: #0b0d11;`);
lines.push(`  --pl-icon-brand-light: #06435b;`);
lines.push(`  --pl-icon-brand-dark: #8ddaf9;`);
lines.push(`  --pl-icon-accent-dark: #b7c8ff;`);
lines.push(`  --pl-icon-accent-light: #082271;`);
lines.push(`  --pl-icon-positive-dark: #8fd5b0;`);
lines.push(`  --pl-icon-positive-light: #167d46;`);
lines.push(`  --pl-icon-caution-dark: #fed571;`);
lines.push(`  --pl-icon-caution-light: #a37402;`);
lines.push(`  --pl-icon-negative-dark: #f68d91;`);
lines.push(`  --pl-icon-negative-light: #7e0a0e;`);
lines.push(`}`);
lines.push(``);

// ── 7. Tablet 반응형 오버라이드
const taLines = buildResponsiveOverrides(R, 'Ta');
if (taLines.length) {
  lines.push(`/* ============================================`);
  lines.push(`   Tablet (640px ~ 1199px)`);
  lines.push(`   ============================================ */`);
  lines.push(`@media (max-width: 1199px) {`);
  lines.push(`  :root {`);
  lines.push(...taLines);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
}

// ── 8. Mobile 반응형 오버라이드
const moLines = buildResponsiveOverrides(R, 'Mo');
if (moLines.length) {
  lines.push(`/* ============================================`);
  lines.push(`   Mobile (~ 639px)`);
  lines.push(`   ============================================ */`);
  lines.push(`@media (max-width: 639px) {`);
  lines.push(`  :root {`);
  lines.push(...moLines);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
}

const output = lines.join('\n');
writeFileSync(join(ROOT, 'tokens', 'base.css'), output, 'utf-8');
console.log(`✅ tokens/base.css 생성 완료`);
