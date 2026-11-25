/**
 * v2c — 공유 카드(수호별별) · 부적 장면 패널 최종 캡처
 * 실행: node scripts/capture-v2c-cards.mjs <outdir> [base]
 */
import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';

const OUT = process.argv[2] ?? '/workspace/downloads/byulgyeol-renewal-2026-11-25-v2';
const RAW_BASE = process.argv[3] ?? 'http://127.0.0.1:4173/byulgyeol/';
const EXE = '/workspace/.scratch/pw/browsers/chromium-1148/chrome-linux/chrome';

const browser = await chromium.launch({
  executablePath: EXE,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});
const errors = [];
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'ko-KR',
  acceptDownloads: true,
});
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
page.on('console', (m) => m.type() === 'error' && errors.push(`[console] ${m.text()}`));

const shot = async (name) => {
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot', name);
};

const fillBirth = async ({ name, year, month, day, time }) => {
  await page.goto(RAW_BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: /내 별지도 열기/ }).first().click();
  await page.waitForTimeout(600);
  await page.fill('#name', name);
  await page.selectOption('#birth-year', String(year));
  await page.locator('select[aria-label="월"]').selectOption(String(month));
  await page.locator('select[aria-label="일"]').selectOption(String(day));
  await page.selectOption('#time', String(time));
  await page.getByRole('button', { name: /내 별지도 열기/ }).last().click();
  await page.waitForTimeout(2600);
};

const samples = [
  { name: '박진영', year: 1980, month: 12, day: 1, time: 6, tag: 'yeomjeong' },
  { name: '강하늘', year: 1994, month: 5, day: 17, time: 6, tag: 'cheonryang' },
  { name: '도윤', year: 1975, month: 8, day: 23, time: 9, tag: 'taeyang' },
  { name: '서연', year: 1990, month: 2, day: 14, time: 4, tag: 'pagun' },
];

for (const s of samples) {
  await fillBirth(s);
  await page.waitForTimeout(1200);
  const star = (await page.locator('h2').filter({ hasText: /별$/ }).first().innerText().catch(() => '')).replace(/\s+/g, '');
  console.log('---', s.tag, star);
  await shot(`30-${s.tag}-step1`);
  const dl = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
  await page.getByRole('button', { name: /카드 저장/ }).first().click();
  const d = await dl;
  if (d) {
    await d.saveAs(`${OUT}/31-${s.tag}-sharecard-1080x1350.png`);
    console.log('sharecard', s.tag, d.suggestedFilename());
  } else {
    console.log('sharecard FAILED', s.tag);
  }
  /* 2027 부적 — 장면 패널까지 */
  await page.getByRole('button', { name: /2027 부적/ }).first().click();
  await page.waitForTimeout(1300);
  const panel = page.getByText('부적 배경 ·', { exact: false }).first();
  if (await panel.count()) {
    await panel.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(500);
    await shot(`32-${s.tag}-amulet-theme-panel`);
    console.log('theme panel:', (await panel.innerText().catch(() => '')) || '');
  }
  const svg = page.locator('svg[role="img"]').first();
  await svg.screenshot({ path: `${OUT}/33-${s.tag}-amulet-preview.png` }).catch(() => {});
}

console.log('ERRORS', JSON.stringify(errors, null, 2));
await browser.close();
