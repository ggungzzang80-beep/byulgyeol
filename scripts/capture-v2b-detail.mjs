/**
 * 별의 속삭임 부적 테마·공유 카드 정밀 캡처 (v2b)
 * 실행:
 *   node scripts/capture-v2b-detail.mjs <outdir> [base]
 */
import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';

const OUT = process.argv[2] ?? '/workspace/downloads/byulgyeol-renewal-2026-11-25-v2';
const RAW_BASE = process.argv[3] ?? 'http://127.0.0.1:4173/byulgyeol/';
const SEP = RAW_BASE.includes('?') ? '&' : '?';
const url = (params = '') => (params ? `${RAW_BASE}${SEP}${params}` : RAW_BASE);
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
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot', name);
};
const shotAt = async (text, name) => {
  const el = page.getByText(text, { exact: false }).first();
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(500);
  await shot(name);
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

const step = async (label) => {
  await page.getByRole('button', { name: new RegExp(label) }).first().click();
  await page.waitForTimeout(900);
};

/* ---------- 1) 기본 명반 — 공유 카드 다시 ---------- */
await fillBirth({ name: '박진영', year: 1980, month: 12, day: 1, time: 6 });
/* 별지도 카드가 다 그려질 때까지 */
await page.waitForTimeout(1200);
{
  const dl = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
  await page.getByRole('button', { name: /카드 저장/ }).first().click();
  const d = await dl;
  if (d) {
    await d.saveAs(`${OUT}/04-step1-sharecard-1080x1350.png`);
    console.log('sharecard re-saved');
  }
}

/* ---------- 2) 별방 상세 ---------- */
await step('12개 별방');
const cells = page.locator('.pcell');
const n = await cells.count();
for (let i = 0; i < n; i += 1) {
  const t = await cells.nth(i).innerText();
  if (t.includes('사랑') || t.includes('부처')) {
    await cells.nth(i).click();
    break;
  }
}
await page.waitForTimeout(800);
const detail = page.locator('.thin-scroll').first();
if (await detail.count()) {
  await detail.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(400);
  await detail.screenshot({ path: `${OUT}/06-step2-palace-detail-panel.png` }).catch(() => {});
}
await shot('06-step2-palace-detail');

/* ---------- 3) 2027 부적 — 장면 다섯 + PNG ---------- */
await step('2027 부적');
await page.waitForTimeout(1200);
await shot('08-step4-amulet-auto');
const themeKeys = ['pavilion', 'dawn', 'lotus', 'plum', 'observatory'];
const themeLabels = ['별빛 누각', '금빛 새벽 누각', '달빛 연못', '홍매 봄정원', '천문대의 별'];
for (const [i, label] of themeLabels.entries()) {
  const chip = page.getByRole('button', { name: new RegExp(label.replace(' ', '\\s*')) }).first();
  if (!(await chip.count())) {
    console.log('chip missing', label);
    continue;
  }
  await chip.click();
  await page.waitForTimeout(1000);
  const svg = page.locator('svg[role="img"]').first();
  await svg.screenshot({ path: `${OUT}/11-amulet-preview-${i + 1}-${themeKeys[i]}.png` }).catch(() => {});
  const dl = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
  await page.getByRole('button', { name: /부적 저장/ }).first().click();
  const d = await dl;
  if (d) {
    await d.saveAs(`${OUT}/12-amulet-${i + 1}-${themeKeys[i]}-1080x1920.png`);
    console.log('saved png', themeKeys[i]);
  } else {
    console.log('png FAILED', themeKeys[i]);
  }
  await page.waitForTimeout(400);
}

/* ---------- 4) 유료 리포트 본문 ---------- */
await page.goto(url('sample=paid'), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await shot('15-sample-paid-top');
await shotAt('나라는 별', '15b-sample-paid-personality');
await shotAt('10년 큰 흐름', '15c-sample-paid-year');
await shotAt('12개 별방 이야기', '15d-sample-paid-palaces');
await shotAt('달마다 별 처방', '15e-sample-paid-months');
await shotAt('PINPOINT', '15f-sample-paid-pinpoint');

await page.goto(url('sample=paid2027'), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await shot('17-sample-paid-2027-top');
await shotAt('별빛 네 개', '17b-sample-paid-2027-light');
await shotAt('열두 달', '17c-sample-paid-2027-months');

await page.goto(url('sample=paid2026'), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await shot('19-sample-paid-2026-top');
await shotAt('남은 두 달', '19b-sample-paid-2026-months');

/* ---------- 5) 부적 장면 자동 매칭 — 다른 수호별 ---------- */
const samples = [
  { name: '강하늘', year: 1994, month: 5, day: 17, time: 6, tag: 'b' },
  { name: '도윤', year: 1975, month: 8, day: 23, time: 9, tag: 'd' },
  { name: '서연', year: 1990, month: 2, day: 14, time: 4, tag: 'e' },
];
for (const s of samples) {
  await fillBirth(s);
  const star = await page.locator('h2').filter({ hasText: /별$/ }).first().innerText().catch(() => '');
  const img = await page.locator('img[alt*="가디언"]').first().getAttribute('src').catch(() => '');
  console.log('sample', s.tag, star.replace(/\s+/g, ''), img);
  await shot(`20-star-${s.tag}-step1`);
  await step('2027 부적');
  await page.waitForTimeout(1100);
  await shot(`21-star-${s.tag}-amulet`);
}

console.log('ERRORS', JSON.stringify(errors, null, 2));
await browser.close();
