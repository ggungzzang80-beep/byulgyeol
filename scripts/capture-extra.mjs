/**
 * 추가 캡처 — 굿즈 카드 없음 / 별마다 줄바꿈 / 2027 메인 상품 카드
 * node scripts/capture-extra.mjs <outdir> <base>
 */
import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';

const OUT = process.argv[2] ?? '/workspace/downloads/byulgyeol-renewal-2026-11-25';
const RAW_BASE = process.argv[3] ?? 'https://ggungzzang80-beep.github.io/byulgyeol/';
const SEP = RAW_BASE.includes('?') ? '&' : '?';
const BASE = RAW_BASE;
/** 쿼리 파라미터를 안전하게 붙입니다 (CDN 캐시 우회용 cb 포함) */
const url = (params = '') => (params ? `${BASE}${SEP}${params}` : BASE);
const EXE = '/workspace/.scratch/pw/browsers/chromium-1148/chrome-linux/chrome';

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'ko-KR',
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await page.getByRole('button', { name: /내 별지도 열기/ }).first().click();
await page.waitForTimeout(600);
await page.fill('#name', '박진영');
await page.selectOption('#birth-year', '1980');
await page.locator('select[aria-label="월"]').selectOption('12');
await page.locator('select[aria-label="일"]').selectOption('1');
await page.selectOption('#time', '6');
await page.getByRole('button', { name: /내 별지도 열기/ }).last().click();
await page.waitForTimeout(2400);

/* 1) 1단계 — 예전에 'GUARDIAN STONE · 수호 원석 (준비 중)' 카드가 있던 자리 */
await page.evaluate(() => window.scrollTo(0, 1180));
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/26-step1-no-goods-card.png` });
await page.evaluate(() => window.scrollTo(0, 2100));
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/27-step1-no-goods-card-2.png` });

/* 2) 2단계 — 보조 별이 두 개 이상인 방을 찾아 상세 카드 캡처 */
await page.getByRole('button', { name: /12개 별방/ }).first().click();
await page.waitForTimeout(800);
const cells = page.locator('.pcell');
const n = await cells.count();
let picked = -1;
for (let i = 0; i < n; i += 1) {
  await cells.nth(i).click();
  await page.waitForTimeout(220);
  const text = await page.locator('.thin-scroll').first().innerText().catch(() => '');
  if ((text.match(/—/g) ?? []).length >= 3) {
    picked = i;
    break;
  }
}
console.log('picked palace index', picked);
await page.waitForTimeout(400);
const detail = page.locator('.thin-scroll').first();
await detail.scrollIntoViewIfNeeded().catch(() => {});
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/28-step2-star-lines-1.png` });
await page.evaluate(() => window.scrollBy(0, 520));
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/29-step2-star-lines-2.png` });
await page.evaluate(() => window.scrollBy(0, 520));
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/30-step2-star-lines-3.png` });

/* 3) 5단계 — 2027 메인 카드 */
await page.getByRole('button', { name: /별 이야기/ }).first().click();
await page.waitForTimeout(800);
await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('section')).find((s) => s.textContent?.includes('별 이야기 5권'));
  el?.scrollIntoView({ block: 'start' });
  window.scrollBy(0, 60);
});
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/31-step5-2027-main-card.png` });

console.log('ERRORS', JSON.stringify(errors));
await browser.close();
