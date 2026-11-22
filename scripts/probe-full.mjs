import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ executablePath: '/workspace/.scratch/pw/browsers/chromium-1148/chrome-linux/chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR' });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
for (const q of ['?theme=character&system=western', '?theme=mystic&system=western']) {
  await page.goto('http://127.0.0.1:4173/' + q, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  console.log(q, 'scroll', m.sw, '/', m.cw, m.sw <= m.cw ? 'OK' : 'OVERFLOW');
}
// 서양 결과 진입
await page.goto('http://127.0.0.1:4173/?theme=character&system=western', { waitUntil: 'networkidle' });
const sample = page.getByRole('button', { name: /예시/ }).first();
if (await sample.count()) { await sample.click(); await page.waitForTimeout(2000); }
const m2 = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, txt: document.body.innerText.slice(0, 60).replace(/\n/g, ' | ') }));
console.log('western result', m2.sw, '/', m2.cw, m2.sw <= m2.cw ? 'OK' : 'OVERFLOW', '::', m2.txt);
console.log('console errors:', errors.length, errors.slice(0, 4));
await browser.close();
