/**
 * PageLab Section Screenshot Generator
 * 모든 섹션 HTML 파일을 자동으로 스크린샷해서 images/showcase/ 에 저장
 *
 * 사용법:
 *   npm run screenshot          -- 누락된 것만 생성
 *   npm run screenshot -- --all -- 전체 재생성
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SECTIONS_DIR = path.join(ROOT, 'sections');
const OUTPUT_DIR = path.join(ROOT, 'images', 'showcase');

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 800;

// 카테고리 디렉토리 → 출력 파일명 prefix 매핑
const CATEGORY_MAP = {
  hero: 'hero',
  intro: 'intro',
  about: 'about',
  review: 'review',
  benefit: 'benefit',
  step: 'step',
  etc: 'etc',
  cta: 'cta',
  navigation: 'navi',
  faq: 'faq',
};

/**
 * 섹션 파일 목록과 출력 파일명 매핑을 반환
 */
function getSectionFiles() {
  const files = [];

  for (const category of fs.readdirSync(SECTIONS_DIR)) {
    const categoryDir = path.join(SECTIONS_DIR, category);
    if (!fs.statSync(categoryDir).isDirectory()) continue;

    const prefix = CATEGORY_MAP[category] || category;

    for (const file of fs.readdirSync(categoryDir).sort()) {
      if (!file.endsWith('.html')) continue;

      let outputName;

      // type-{letter}-*.html 패턴
      const typeMatch = file.match(/^type-([a-z])-/);
      if (typeMatch) {
        const letter = typeMatch[1].toUpperCase();
        outputName = `${prefix} ${letter}.png`;
      } else if (file === 'index.html') {
        outputName = `${prefix}.png`;
      } else {
        // caution.html 등 기타 파일 → 파일명 그대로
        const name = file.replace('.html', '');
        outputName = `${prefix} ${name}.png`;
      }

      files.push({
        filePath: path.join(categoryDir, file),
        outputPath: path.join(OUTPUT_DIR, outputName),
        label: outputName.replace('.png', ''),
      });
    }
  }

  return files;
}

async function screenshotSection(page, filePath) {
  const url = `file://${filePath}`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });

  // 프리뷰 헤더 숨기기 + 배경 정리
  await page.evaluate(() => {
    const header = document.querySelector('.preview-header');
    if (header) header.remove();

    const container = document.querySelector('.preview-container');
    if (container) {
      container.style.padding = '0';
      container.style.background = 'transparent';
    }

    const frame = document.querySelector('.preview-frame');
    if (frame) {
      frame.style.borderRadius = '0';
      frame.style.boxShadow = 'none';
    }

    document.body.style.background = '#fff';
    document.body.style.minHeight = 'unset';
  });

  // 섹션 요소 찾기
  const section = await page.$('section.pl-section');
  if (!section) {
    // fallback: preview-content 전체
    const content = await page.$('.preview-content');
    return content;
  }
  return section;
}

async function main() {
  const forceAll = process.argv.includes('--all');
  const files = getSectionFiles();

  // 스킵할 파일 필터링
  const targets = forceAll
    ? files
    : files.filter((f) => !fs.existsSync(f.outputPath));

  if (targets.length === 0) {
    console.log('✅ 모든 썸네일이 최신 상태입니다. (--all 옵션으로 전체 재생성 가능)');
    return;
  }

  console.log(`📸 ${targets.length}개 섹션 스크린샷 시작...\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });

  let success = 0;
  let fail = 0;

  for (const { filePath, outputPath, label } of targets) {
    try {
      const element = await screenshotSection(page, filePath);
      if (!element) {
        console.warn(`  ⚠️  섹션 요소 없음: ${label}`);
        fail++;
        continue;
      }

      // 섹션 높이를 2:1 비율로 클리핑
      const box = await element.boundingBox();
      const clipHeight = Math.round(VIEWPORT_WIDTH / 2); // 2:1

      await page.screenshot({
        path: outputPath,
        clip: {
          x: box.x,
          y: box.y,
          width: Math.min(box.width, VIEWPORT_WIDTH),
          height: Math.min(box.height, clipHeight),
        },
      });

      console.log(`  ✓  ${label}`);
      success++;
    } catch (err) {
      console.error(`  ✗  ${label}: ${err.message}`);
      fail++;
    }
  }

  await browser.close();

  console.log(`\n완료: ${success}개 성공, ${fail}개 실패`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
