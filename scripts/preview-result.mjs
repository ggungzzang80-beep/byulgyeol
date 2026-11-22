/**
 * 별의 속삭임 프리뷰 — 결과 화면·결제창 확인 캡처
 * 실행: PATH=... PLAYWRIGHT_BROWSERS_PATH=... LD_LIBRARY_PATH=... node scripts/preview-result.mjs <prefix>
 */
import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';

const BASE = process.env.PREVIEW_BASE ?? 'http://127.0.0.1:4173/';
const EXE = '/workspace/.scratch/pw/browsers/chromium-1148/chrome-linux/chrome';
const PREFIX = process.argv[2] ?? 'ziwei_only';

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR' });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(`PAGEERROR ${e.message}`));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.getByRole('button', { name: /예시 먼저 보기|예시 명반/ }).first().click();
await page.waitForTimeout(1800);

const info = await page.evaluate(() => ({
  height: document.documentElement.scrollHeight,
  text: document.body.innerText,
}));
console.log('결과 화면 높이:', info.height, 'px');
for (const needle of ['서양', '천궁도', '통합 리포트', '체계 선택', '탭을 누르면']) {
  console.log(`  "${needle}" 노출:`, info.text.includes(needle));
}

for (let y = 0, i = 1; y < info.height; y += 780, i += 1) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `/workspace/downloads/${PREFIX}_result_${i}.png` });
}

// 결제창(자미두수 단일 레인)
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
const cta = page.getByRole('button', { name: /원으로 내 별 읽기|원으로 열기|전체 보기/ }).first();
if (await cta.count()) {
  await cta.click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `/workspace/downloads/${PREFIX}_checkout.png` });
  const modalText = await page.locator('[role="dialog"]').innerText();
  console.log('결제창 — "서양" 노출:', modalText.includes('서양'), '/ "통합" 노출:', modalText.includes('통합'));
  await page.getByRole('button', { name: '닫기' }).first().click().catch(() => {});
}

console.log('콘솔 에러:', errors.length, errors.slice(0, 3));
await browser.close();
