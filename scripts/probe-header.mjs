import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ executablePath: '/workspace/.scratch/pw/browsers/chromium-1148/chrome-linux/chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR' });
const page = await ctx.newPage();
for (const q of ['?theme=character', '?theme=mystic']) {
  await page.goto('http://127.0.0.1:4173/' + q, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const hdr = await page.evaluate(() => {
    const bar = document.querySelector('header, .sticky') || document.body.firstElementChild;
    const out = [];
    document.querySelectorAll('header *').forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.width && el.children.length === 0 && (el.textContent || '').trim()) out.push([el.tagName, (el.textContent || '').trim().slice(0, 12), Math.round(b.left), Math.round(b.right), getComputedStyle(el).fontSize]);
    });
    return out;
  });
  console.log(q, JSON.stringify(hdr));
}
// 결과 화면 헤더
await page.goto('http://127.0.0.1:4173/?theme=character', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /예시 먼저 보기|예시 명반/ }).first().click();
await page.waitForTimeout(1800);
const res = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('body header *, body [class*="sticky"] *').forEach((el) => {
    const b = el.getBoundingClientRect();
    if (b.top < 90 && b.width && el.children.length === 0 && (el.textContent || '').trim()) out.push([(el.textContent || '').trim().slice(0, 10), Math.round(b.left), Math.round(b.right), getComputedStyle(el).fontSize]);
  });
  const btns = [...document.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().top < 70).map((b) => { const r = b.getBoundingClientRect(); return [b.textContent.trim().slice(0, 10), Math.round(r.left), Math.round(r.right)]; });
  return { out: out.slice(0, 20), btns };
});
console.log('result', JSON.stringify(res));
await browser.close();
