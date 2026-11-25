/**
 * 별의 속삭임 2026-11-25 개편 캡처 — 로컬 프리뷰(127.0.0.1:4173/byulgyeol/)
 * 실행:
 *   PATH=/workspace/.tools/node-v22.14.0-linux-x64/bin:$PATH \
 *   LD_LIBRARY_PATH=/workspace/.scratch/libs/usr/lib/x86_64-linux-gnu \
 *   node scripts/capture-2026-11-25.mjs <outdir> [base]
 */
import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';

const OUT = process.argv[2] ?? '/workspace/downloads/byulgyeol-renewal-2026-11-25';
const RAW_BASE = process.argv[3] ?? 'http://127.0.0.1:4173/byulgyeol/';
const SEP = RAW_BASE.includes('?') ? '&' : '?';
const BASE = RAW_BASE;
/** 쿼리 파라미터를 안전하게 붙입니다 (CDN 캐시 우회용 cb 포함) */
const url = (params = '') => (params ? `${BASE}${SEP}${params}` : BASE);
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

const goStep = async (label) => {
  await page.getByRole('button', { name: new RegExp(label) }).first().click();
  await page.waitForTimeout(700);
};

/* ---------- 1) 랜딩 → 생년월일 입력 → 별지도 ---------- */
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await shot('01-landing-intro');

await page.getByRole('button', { name: /내 별지도 열기/ }).first().click();
await page.waitForTimeout(700);
await page.fill('#name', '박진영');
await page.selectOption('#birth-year', '1980');
await page.locator('select[aria-label="월"]').selectOption('12');
await page.locator('select[aria-label="일"]').selectOption('1');
await page.selectOption('#time', '6');
await shot('02-landing-birth');
await page.getByRole('button', { name: /내 별지도 열기/ }).last().click();
await page.waitForTimeout(2200);
await shot('03-step1-soul');

/* ---------- 2) 12개 별방 ---------- */
await goStep('12개 별방');
await shot('04-step2-board');

/* 별방 하나(사랑·인연) 선택 — 아래 상세 카드까지 */
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
await shot('05-step2-palace-detail');

/* 상세 카드만 크게 */
const detail = page.locator('.thin-scroll').first();
if (await detail.count()) {
  await detail.screenshot({ path: `${OUT}/06-step2-palace-detail-only.png` }).catch(() => {});
}

/* ---------- 3) 올해의 흐름 ---------- */
await goStep('올해의 흐름');
await shot('07-step3-year');

/* ---------- 4) 2027 부적 + 9:16 카드 저장 ---------- */
await goStep('2027 부적');
await page.waitForTimeout(900);
await shot('08-step4-amulet');

const card = page.locator('svg[role="img"]').first();
if (await card.count()) {
  await card.screenshot({ path: `${OUT}/09-amulet-card-preview.png` }).catch(() => {});
}

const dl = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
await page.getByRole('button', { name: /부적 저장/ }).first().click();
const download = await dl;
if (download) {
  await download.saveAs(`${OUT}/10-amulet-saved-1080x1920.png`);
  console.log('download saved:', download.suggestedFilename());
}

/* ---------- 5) 별 이야기(상품) ---------- */
await goStep('별 이야기');
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/11-step5-books-top.png` });
await page.locator('section').filter({ hasText: '별 이야기 5권' }).first().scrollIntoViewIfNeeded().catch(() => {});
await page.waitForTimeout(500);
await shot('12-step5-products');
const grid = page.locator('text=별 이야기 5권').first();
await grid.scrollIntoViewIfNeeded().catch(() => {});
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/13-step5-products-top.png`, fullPage: false });

/* ---------- 6) 유료 리포트 미리보기 ---------- */
await page.goto(url('sample=paid'), { waitUntil: 'networkidle' });
await page.waitForTimeout(2200);
await shot('14-sample-paid-report-top');
await page.evaluate(() => window.scrollBy(0, 1400));
await page.waitForTimeout(600);
await shot('15-sample-paid-report-2');
await page.evaluate(() => window.scrollBy(0, 3200));
await page.waitForTimeout(600);
await shot('16-sample-paid-report-3');

await page.goto(url('sample=paid2027'), { waitUntil: 'networkidle' });
await page.waitForTimeout(2200);
await shot('17-sample-paid-2027-top');
await page.evaluate(() => window.scrollBy(0, 1600));
await page.waitForTimeout(600);
await shot('18-sample-paid-2027-2');

await page.goto(url('sample=paid2026'), { waitUntil: 'networkidle' });
await page.waitForTimeout(2200);
await shot('19-sample-paid-2026-top');
await page.evaluate(() => window.scrollBy(0, 1500));
await page.waitForTimeout(600);
await shot('20-sample-paid-2026-2');

/* ---------- 7) 미스틱 테마 그대로인지 확인 ---------- */
await page.goto(url('theme=mystic'), { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await shot('21-mystic-landing');
await page.getByRole('button', { name: /무료로 명반 보기|명반 열기/ }).first().click().catch(() => {});
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/22-mystic-form.png` });

/* ---------- 8) 2027 부적 단계 아래쪽(30% 패널) ---------- */
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
await page.waitForTimeout(2200);
await goStep('2027 부적');
await page.evaluate(() => window.scrollBy(0, 1100));
await page.waitForTimeout(600);
await shot('23-step4-flow-panel');
await page.evaluate(() => window.scrollBy(0, 900));
await page.waitForTimeout(500);
await shot('24-step4-flow-panel-2');

/* ---------- 9) 랜딩 별 이야기(상품) ---------- */
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await page.getByRole('button', { name: /별 이야기/ }).first().click();
await page.waitForTimeout(800);
await page.evaluate(() => window.scrollBy(0, 700));
await page.waitForTimeout(500);
await shot('25-landing-books');

console.log('ERRORS', JSON.stringify(errors, null, 2));
await browser.close();
