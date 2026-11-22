/**
 * 별의 속삭임 로컬 프리뷰 캡처 + 섹션 길이 측정
 * ------------------------------------------------------------------
 * 실행: PATH=/workspace/.tools/node/bin:$PATH PLAYWRIGHT_BROWSERS_PATH=/workspace/.scratch/pw/browsers \
 *       LD_LIBRARY_PATH=/workspace/.tools/libs node scripts/preview-shots.mjs <prefix>
 * 서버: python3 -m http.server 4173 --directory dist (base '/')
 *
 * 아주 긴 페이지는 fullPage 캡처가 실패하므로 844px 뷰포트를 겹치지 않게 이어 찍습니다.
 */
import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';

const BASE = process.env.PREVIEW_BASE ?? 'http://127.0.0.1:4173/';
const EXE = '/workspace/.scratch/pw/browsers/chromium-1148/chrome-linux/chrome';
const PREFIX = process.argv[2] ?? 'ziwei';

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });

async function shoot(url, name) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  const metrics = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('main section, section').forEach((s) => {
      const r = s.getBoundingClientRect();
      if (r.height > 40) out.push({ id: s.id || '', h: Math.round(r.height), top: Math.round(r.top + window.scrollY) });
    });
    return { docHeight: document.documentElement.scrollHeight, sections: out };
  });

  const shots = [];
  const step = 780;
  for (let y = 0, i = 1; y < metrics.docHeight; y += step, i += 1) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(350);
    const file = `/workspace/downloads/${name}_${i}.png`;
    await page.screenshot({ path: file });
    shots.push(file);
  }

  console.log(`\n[${name}] 문서 높이 ${metrics.docHeight}px (${(metrics.docHeight / 844).toFixed(1)} 화면) · 캡처 ${shots.length}장`);
  metrics.sections.forEach((s) => console.log(`  ${s.id || '(no id)'}  ${s.h}px  @${s.top}`));
  await ctx.close();
  return metrics;
}

const a = await shoot(BASE, `${PREFIX}_character`);
const b = await shoot(`${BASE}?theme=mystic`, `${PREFIX}_mystic`);
console.log('\n합계 — character:', a.docHeight, 'px / mystic:', b.docHeight, 'px');
await browser.close();
