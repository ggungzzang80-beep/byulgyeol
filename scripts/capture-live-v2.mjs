/**
 * 라이브 검증 + 최종 캡처 — https://ggungzzang80-beep.github.io/byulgyeol/
 * 실행: node scripts/capture-live-v2.mjs [outdir] [base]
 */
import fs from 'node:fs';
import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';

const OUT = process.argv[2] ?? '/workspace/downloads/byulgyeol-renewal-2026-11-25-v2';
const RAW_BASE = process.argv[3] ?? 'https://ggungzzang80-beep.github.io/byulgyeol/';
const SEP = RAW_BASE.includes('?') ? '&' : '?';
const url = (params = '') => (params ? `${RAW_BASE}${SEP}${params}` : RAW_BASE);
const EXE = '/workspace/.scratch/pw/browsers/chromium-1148/chrome-linux/chrome';

fs.mkdirSync(OUT, { recursive: true });

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
const responses = [];
page.on('response', (r) => {
  if (!r.ok() && r.status() >= 400) responses.push(`${r.status()} ${r.url()}`);
});

const shot = async (name) => {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot', name);
};
const shotAt = async (text, name) => {
  const el = page.getByText(text, { exact: false }).first();
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(550);
  await shot(name);
};

const audit = async (label) => {
  const text = await page.evaluate(() => document.body.innerText);
  const banned = ['금사국', '수이국', '목삼국', '토오국', '화육국', '유년', '대한', '신궁', '너의', '네가', '너를', '너는'];
  const hits = banned.filter((w) => text.includes(w));
  const casual = [];
  for (const re of [/[가-힣](해|야|줘|봐|있어|없어|거야|몰라|같아|싶어)[.!?](\s|$)/g, /[가-힣]지[.!?](\s|$)/g]) {
    const found = text.match(re);
    if (found) casual.push(...found.slice(0, 8));
  }
  console.log('AUDIT', label, JSON.stringify({ jargon: hits, casual: casual.slice(0, 10) }));
  return { label, jargon: hits, casual: casual.slice(0, 10) };
};
const audits = [];

const fillBirth = async ({ name, year, month, day, time }) => {
  await page.goto(RAW_BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1100);
  await page.getByRole('button', { name: /내 별지도 열기/ }).first().click();
  await page.waitForTimeout(650);
  await page.fill('#name', name);
  await page.selectOption('#birth-year', String(year));
  await page.locator('select[aria-label="월"]').selectOption(String(month));
  await page.locator('select[aria-label="일"]').selectOption(String(day));
  await page.selectOption('#time', String(time));
  await page.getByRole('button', { name: /내 별지도 열기/ }).last().click();
  await page.waitForTimeout(3000);
};
const step = async (label) => {
  await page.getByRole('button', { name: new RegExp(label) }).first().click();
  await page.waitForTimeout(1000);
};

/* 1) 랜딩 */
await page.goto(RAW_BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1600);
await shot('L01-landing-intro');
audits.push(await audit('landing'));
await page.getByRole('button', { name: /내 별지도 열기/ }).first().click();
await page.waitForTimeout(800);
await shot('L02-landing-birth');

/* 2) 기본 명반 */
await fillBirth({ name: '박진영', year: 1980, month: 12, day: 1, time: 6 });
await shot('L03-step1-soul');
audits.push(await audit('step1'));
{
  const dl = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
  await page.getByRole('button', { name: /카드 저장/ }).first().click();
  const d = await dl;
  if (d) {
    await d.saveAs(`${OUT}/L04-sharecard-yeomjeong-1080x1350.png`);
    console.log('sharecard yeomjeong saved');
  }
}

/* 3) 별방 */
await step('12개 별방');
await shot('L05-step2-board');
audits.push(await audit('step2'));
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
  await page.waitForTimeout(500);
  await detail.screenshot({ path: `${OUT}/L06-step2-palace-detail.png` }).catch(() => {});
}

/* 4) 올해 흐름 */
await step('올해의 흐름');
await shot('L07-step3-year');
audits.push(await audit('step3'));

/* 5) 2027 부적 + 5장면 + PNG */
await step('2027 부적');
await page.waitForTimeout(1300);
await shot('L08-step4-amulet-auto');
const panel = page.getByText('부적 배경 ·', { exact: false }).first();
if (await panel.count()) {
  await panel.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(500);
  await shot('L09-step4-theme-panel');
  console.log('panel:', await panel.innerText());
}
const themeKeys = ['pavilion', 'dawn', 'lotus', 'plum', 'observatory'];
const themeLabels = ['별빛 누각', '금빛 새벽 누각', '달빛 연못', '홍매 봄정원', '천문대의 별'];
for (const [i, label] of themeLabels.entries()) {
  const chip = page.getByRole('button', { name: new RegExp(label.replace(' ', '\\s*')) }).first();
  if (!(await chip.count())) {
    console.log('chip missing', label);
    continue;
  }
  await chip.click();
  await page.waitForTimeout(1100);
  const svg = page.locator('svg[role="img"]').first();
  await svg.screenshot({ path: `${OUT}/L10-amulet-preview-${i + 1}-${themeKeys[i]}.png` }).catch(() => {});
  const dl = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
  await page.getByRole('button', { name: /부적 저장/ }).first().click();
  const d = await dl;
  if (d) {
    await d.saveAs(`${OUT}/L11-amulet-${i + 1}-${themeKeys[i]}-1080x1920.png`);
    console.log('png', themeKeys[i]);
  }
  await page.waitForTimeout(500);
}
audits.push(await audit('step4-amulet'));

/* 6) 별 이야기 */
await step('별 이야기');
await page.waitForTimeout(900);
await shot('L12-step5-books-top');
await page.evaluate(() => window.scrollBy(0, 850));
await page.waitForTimeout(600);
await shot('L13-step5-products');
audits.push(await audit('step5'));

/* 7) 유료 리포트 */
await page.goto(url('sample=paid'), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3500);
await shot('L14-sample-paid-top');
audits.push(await audit('paid-top'));
await shotAt('나라는 별', 'L15-sample-paid-personality');
await shotAt('10년 큰 흐름', 'L16-sample-paid-year');
await shotAt('12개 별방 이야기', 'L17-sample-paid-palaces');
await shotAt('달마다 별 처방', 'L18-sample-paid-months');
await shotAt('PINPOINT', 'L19-sample-paid-pinpoint');
audits.push(await audit('paid'));

await page.goto(url('sample=paid2027'), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3500);
await shot('L20-sample-2027-top');
await shotAt('별빛 네 개', 'L21-sample-2027-light');
await shotAt('열두 달', 'L22-sample-2027-months');
audits.push(await audit('paid2027'));

await page.goto(url('sample=paid2026'), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3500);
await shot('L23-sample-2026-top');
await shotAt('남은 두 달', 'L24-sample-2026-months');
audits.push(await audit('paid2026'));

/* 8) 다른 수호별 — 배경 자동 매칭 */
const samples = [
  { name: '강하늘', year: 1994, month: 5, day: 17, time: 6, tag: 'cheonryang' },
  { name: '도윤', year: 1975, month: 8, day: 23, time: 9, tag: 'taeyang' },
  { name: '서연', year: 1990, month: 2, day: 14, time: 4, tag: 'pagun' },
];
for (const s of samples) {
  await fillBirth(s);
  const star = (await page.locator('h2').filter({ hasText: /별$/ }).first().innerText().catch(() => '')).replace(/\s+/g, '');
  const img = await page.locator('img[alt*="가디언"]').first().getAttribute('src').catch(() => '');
  console.log('sample', s.tag, star, img);
  await shot(`L25-star-${s.tag}-step1`);
  {
    const dl = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
    await page.getByRole('button', { name: /카드 저장/ }).first().click();
    const d = await dl;
    if (d) await d.saveAs(`${OUT}/L26-sharecard-${s.tag}-1080x1350.png`);
  }
  await step('2027 부적');
  await page.waitForTimeout(1200);
  const svg = page.locator('svg[role="img"]').first();
  await svg.screenshot({ path: `${OUT}/L27-amulet-${s.tag}.png` }).catch(() => {});
  const label = await page.getByText('부적 배경 ·', { exact: false }).first().innerText().catch(() => '');
  console.log('matched:', s.tag, label);
}

/* 9) 미스틱 회귀 */
await page.goto(url('theme=mystic'), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1800);
await shot('L28-mystic-landing');

console.log('HTTP_ERRORS', JSON.stringify(responses, null, 2));
console.log('CONSOLE_ERRORS', JSON.stringify(errors, null, 2));
fs.writeFileSync(`${OUT}/audit.json`, JSON.stringify({ audits, responses, errors }, null, 2));
await browser.close();
