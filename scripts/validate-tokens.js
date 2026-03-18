#!/usr/bin/env node
/**
 * validate-tokens.js
 * CSS 파일에서 존재하지 않는 --pl-* 토큰 참조를 감지합니다.
 *
 * 사용법:
 *   node scripts/validate-tokens.js
 *   npm run tokens:validate
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── 1. 모든 CSS 파일에서 정의된 토큰 목록 추출 ───
// (tokens/base.css 뿐 아니라 sections.css 등 자체 정의 포함)
const CSS_DEFINITION_FILES = [
  'tokens/base.css',
  'styles/sections.css',
];

const definedTokens = new Set();
for (const relPath of CSS_DEFINITION_FILES) {
  const content = readFileSync(join(ROOT, relPath), 'utf-8');
  for (const m of content.matchAll(/^\s*(--pl-[\w-]+)\s*:/gm)) {
    definedTokens.add(m[1]);
  }
}
console.log(`📦 정의된 --pl-* 토큰: ${definedTokens.size}개\n`);

// ─── 2. 검사할 파일 수집 ───
const SCAN_DIRS = ['styles', 'sections', 'tokens'];
const SKIP_FILES = ['tokens/base.css']; // 토큰 정의 파일 자체는 제외

function collectFiles(dir) {
  const result = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) result.push(...collectFiles(full));
    else if (['.css', '.html'].includes(extname(entry))) result.push(full);
  }
  return result;
}

const files = SCAN_DIRS
  .flatMap(d => collectFiles(join(ROOT, d)))
  .filter(f => !SKIP_FILES.some(skip => f.endsWith(skip)));

// ─── 3. 각 파일에서 var(--pl-*) 사용 추출 ───
let totalErrors = 0;
const report = [];

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const used = [...content.matchAll(/var\((--pl-[\w-]+)/g)].map(m => m[1]);
  const unknown = [...new Set(used)].filter(t => !definedTokens.has(t));

  if (!unknown.length) continue;

  const relPath = file.replace(ROOT + '/', '');
  report.push({ file: relPath, tokens: unknown });
  totalErrors += unknown.length;
}

// ─── 4. 결과 출력 ───
if (!report.length) {
  console.log('✅ 모든 토큰 참조가 유효합니다.');
  process.exit(0);
}

console.log(`❌ 존재하지 않는 토큰 참조 발견: ${totalErrors}건\n`);
for (const { file, tokens } of report) {
  console.log(`  📄 ${file}`);
  for (const t of tokens) {
    console.log(`     ✗ ${t}`);
  }
}

console.log(`\n💡 수정 방법:`);
console.log(`  - 토큰이 필요하면 PLtokens.json에 추가 후 npm run tokens 실행`);
console.log(`  - 토큰명이 틀렸으면 올바른 토큰으로 교체`);

process.exit(1);
