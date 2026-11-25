/**
 * 별의 속삭임 2026-11-25 v2 캡처 (부적 테마 5종 · 존댓말 · 쉬운 용어)
 * 실행:
 *   PATH=/workspace/.tools/node-v22.14.0-linux-x64/bin:$PATH \
 *   LD_LIBRARY_PATH=/workspace/.scratch/libs/usr/lib/x86_64-linux-gnu \
 *   node scripts/capture-v2-themes.mjs <outdir> [base]
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
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot', name);
};

const goStep = async (label) => {
  await page.getByRole('button', { name: new RegExp(label) }).first().click();
  await page.waitForTimeout(800);
};

const fillBirth = async ({ name, year, month, day, time }) => {
  await page.goto(RAW_BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: /내 별지도 열기/ }).first().click();
  await page.waitForTimeout(600);
  await page.fill('#name', name);
  await page.selectOption('#birth-year', String(year));
  await page.locator('select[aria-label="월"]').selectOption(String(month));
  await page.locator('select[aria-label="일"]').selectOption(String(day));
  await page.selectOption('#time', String(time));
  await page.getByRole('button', { name: /내 별지도 열기/ }).last().click();
  await page.waitForTimeout(2400);
};

/* ---------- 1) 랜딩 · 존댓말 ---------- */
await page.goto(RAW_BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await shot('01-landing-intro');
await page.getByRole('button', { name: /내 별지도 열기/ }).first().click();
await page.waitForTimeout(700);
await shot('02-landing-birth-form');

/* ---------- 2) 첫 번째 명반 — 1980-12-01 ---------- */
await fillBirth({ name: '박진영', year: 1980, month: 12, day: 1, time: 6 });
const star1 = (await page.locator('h2').filter({ hasText: /별$/ }).first().innerText().catch(() => '')) || '';
console.log('star1 raw:', JSON.stringify(star1.slice(0, 40)));
await shot('03-step1-soul');

/* 1080×1350 공유 카드 저장 (Step 1) */
{
  const dl = page.waitForEvent('download', { timeout: 25000 }).catch(() => null);
  await page.getByRole('button', { name: /카드 저장/ }).first().click();
  const download = await dl;
  if (download) {
    await download.saveAs(`${OUT}/04-step1-sharecard-1080x1350.png`);
    console.log('sharecard saved:', download.suggestedFilename());
  } else {
    console.log('sharecard download FAILED');
  }
}

/* ---------- 3) 12개 별방 ---------- */
await goStep('12개 별방');
await shot('05-step2-board');
const cells = page.locator('.pcell');
const count = await cells.count();
for (let i = 0; i < count; i += 1) {
  const t = await cells.nth(i).innerText();
  if (t.includes('사랑') || t.includes('부처')) {
    await cells.nth(i).click();
    break;
  }
}
await page.waitForTimeout(700);
await shot('06-step2-palace-detail');

/* ---------- 4) 올해의 흐름 ---------- */
await goStep('올해의 흐름');
await shot('07-step3-year');

/* ---------- 5) 2027 부적 — 자동 매칭 장면 + 다섯 장면 ---------- */
await goStep('2027 부적');
await page.waitForTimeout(1000);
await shot('08-step4-amulet-auto');
const card = page.locator('svg[role="img"]').first();
if (await card.count()) {
  await card.screenshot({ path: `${OUT}/09-amulet-preview-auto.png` }).catch(() => {});
}

/* 자동 저장 (1080×1920) */
{
  const dl = page.waitForEvent('download', { timeout: 25000 }).catch(() => null);
  await page.getByRole('button', { name: /부적 저장/ }).first().click();
  const download = await dl;
  if (download) {
    await download.saveAs(`${OUT}/10-amulet-saved-auto-1080x1920.png`);
    console.log('amulet auto saved:', download.suggestedFilename());
  } else {
    console.log('amulet auto download FAILED');
  }
}

/* 장면 칩 — 다섯 배경 각각 미리보기 + 저장 */
const themeLabels = ['별빛 누각', '금빛 새벽 누각', '달빛 연못', '홍매 봄정원', '천문대의 별'];
for (const [i, label] of themeLabels.entries()) {
  const chip = page.getByRole('button', { name: new RegExp(label.replace(' ', '\\s*')) }).first();
  if (!(await chip.count())) {
    console.log('chip missing:', label);
    continue;
  }
  await chip.click();
  await page.waitForTimeout(900);
  const svg = page.locator('svg[role="img"]').first();
  await svg.screenshot({ path: `${OUT}/11-amulet-theme-${i + 1}-${['pavilion', 'dawn', 'lotus', 'plum', 'observatory'][i]}.png` }).catch(() => {});
  if (i < 3) {
    const dl = page.waitForEvent('download', { timeout: 25000 }).catch(() => null);
    await page.getByRole('button', { name: /부적 저장/ }).first().click();
    const download = await dl;
    if (download) {
      await download.saveAs(`${OUT}/12-amulet-theme-${['pavilion', 'dawn', 'lotus', 'plum', 'observatory'][i]}-1080x1920.png`);
      console.log('theme png saved:', ['pavilion', 'dawn', 'lotus', 'plum', 'observatory'][i]);
    }
  }
}

/* ---------- 6) 별 이야기(상품) ---------- */
await goStep('별 이야기');
await page.waitForTimeout(800);
await shot('13-step5-books-top');
await page.evaluate(() => window.scrollBy(0, 900));
await page.waitForTimeout(500);
await shot('14-step5-products');

/* ---------- 7) 유료 리포트 미리보기 ---------- */
for (const [key, prefix] of [
  ['sample=paid', '15-sample-paid'],
  ['sample=paid2027', '17-sample-paid-2027'],
  ['sample=paid2026', '19-sample-paid-2026'],
]) {
  await page.goto(url(key), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2400);
  await shot(`${prefix}-top`);
  await page.evaluate(() => window.scrollBy(0, 1500));
  await page.waitForTimeout(600);
  await shot(`${prefix}-2`);
}

/* ---------- 8) 다른 수호별 — 부적 장면 자동 매칭 확인 ---------- */
const samples = [
  { name: '강하늘', year: 1994, month: 5, day: 17, time: 6, tag: 'b' },
  { name: '윤서', year: 1988, month: 3, day: 9, time: 2, tag: 'c' },
  { name: '도윤', year: 1975, month: 8, day: 23, time: 9, tag: 'd' },
];
for (const s of samples) {
  await fillBirth(s);
  const starText = await page.locator('h2').filter({ hasText: /별$/ }).first().innerText().catch(() => '');
  const img = await page.locator('img[alt*="가디언"]').first().getAttribute('src').catch(() => '');
  console.log('sample', s.tag, 'star=', JSON.stringify(starText.slice(0, 20)), 'guardian=', img);
  await shot(`20-star-${s.tag}-step1`);
  await goStep('2027 부적');
  await page.waitForTimeout(900);
  await shot(`21-star-${s.tag}-amulet`);
}

/* ---------- 9) 미스틱 테마 그대로인지 ---------- */
await page.goto(url('theme=mystic'), { waitUntil: 'networkidle' });
await page.waitForTimeout(1400);
await shot('22-mystic-landing');

console.log('ERRORS', JSON.stringify(errors, null, 2));
await browser.close();
