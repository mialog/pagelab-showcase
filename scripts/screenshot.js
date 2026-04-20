/**
 * PageLab Section Screenshot Generator
 * AI가 생성한 섹션만 자동으로 스크린샷해서 images/showcase/ 에 저장
 *
 * 사용법:
 *   npm run screenshot       -- AI 섹션 중 누락된 것만 생성
 *   npm run screenshot -- --all -- AI 섹션 전체 재생성
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'images', 'showcase');

const VIEWPORT_WIDTH = 1440;
const VIEWPORT_HEIGHT = 900;
const DEVICE_SCALE_FACTOR = 2; // Retina 품질 (2x)

// AI가 생성한 섹션만 대상 (수동으로 관리하는 썸네일 제외)
const AI_SECTIONS = [
  { filePath: 'sections/about/type-g-feature-alt.html', outputName: 'about G.png' },
  { filePath: 'sections/about/type-h-compare.html',     outputName: 'about H.png' },
  { filePath: 'sections/benefit/type-c-pricing.html',    outputName: 'benefit C.png' },
  { filePath: 'sections/hero/type-d-video.html',        outputName: 'hero D.png'  },
  { filePath: 'sections/cta/type-d-banner.html',           outputName: 'cta D.png', device: 'mobile' },
  { filePath: 'sections/intro/type-d-product-split.html', outputName: 'intro D.png' },
];

async function screenshotSection(page, filePath, device) {
  const url = `file://${path.join(ROOT, filePath)}`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });

  // 디바이스 전환 (mobile/tablet 지정 시 프리뷰 프레임 너비 변경)
  if (device && device !== 'pc') {
    await page.evaluate((d) => {
      const frame = document.querySelector('.preview-frame');
      if (frame) frame.dataset.device = d;
    }, device);
    await new Promise((r) => setTimeout(r, 300)); // 리사이즈 transition 대기
  }

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

  const section = await page.$('section.pl-section');
  if (!section) {
    return await page.$('.preview-content');
  }
  return section;
}

async function main() {
  const forceAll = process.argv.includes('--all');

  const targets = forceAll
    ? AI_SECTIONS
    : AI_SECTIONS.filter((s) => !fs.existsSync(path.join(OUTPUT_DIR, s.outputName)));

  if (targets.length === 0) {
    console.log('✅ AI 섹션 썸네일이 모두 최신 상태입니다. (--all 옵션으로 재생성 가능)');
    return;
  }

  console.log(`📸 AI 섹션 ${targets.length}개 스크린샷 시작...\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT, deviceScaleFactor: DEVICE_SCALE_FACTOR });

  let success = 0;
  let fail = 0;

  for (const { filePath, outputName, device } of targets) {
    const outputPath = path.join(OUTPUT_DIR, outputName);
    try {
      const element = await screenshotSection(page, filePath, device);
      if (!element) {
        console.warn(`  ⚠️  섹션 요소 없음: ${outputName}`);
        fail++;
        continue;
      }

      const box = await element.boundingBox();
      const clipWidth = Math.min(box.width, VIEWPORT_WIDTH);
      const clipHeight = Math.min(Math.round(clipWidth / 2), Math.round(box.height)); // 2:1 또는 섹션 높이 중 작은 값

      await page.screenshot({
        path: outputPath,
        clip: {
          x: box.x,
          y: box.y,
          width: clipWidth,
          height: clipHeight,
        },
      });

      console.log(`  ✓  ${outputName}`);
      success++;
    } catch (err) {
      console.error(`  ✗  ${outputName}: ${err.message}`);
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
