/**
 * 별의 속삭임 프리뷰 검증 (자미두수 단독 / 원래 화면)
 * 실행: PATH=... PLAYWRIGHT_BROWSERS_PATH=... LD_LIBRARY_PATH=... node scripts/verify-ziwei-only.mjs [only|full]
 */
import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';

const BASE = process.env.PREVIEW_BASE ?? 'http://127.0.0.1:4173/';
const EXE = '/workspace/.scratch/pw/browsers/chromium-1148/chrome-linux/chrome';
const MODE = process.argv[2] ?? 'only';

let pass = 0;
let fail = 0;
const check = (name, ok, extra = '') => {
  if (ok) {
    pass += 1;
    console.log(`  ✓ ${name}`);
  } else {
    fail += 1;
    console.log(`  ✗ ${name} ${extra}`);
  }
};

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR' });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(`PAGEERROR ${e.message}`));

console.log(`\n=== ${MODE} ===`);
const url = MODE === 'only' ? `${BASE}?system=western&theme=character` : `${BASE}?theme=character`;
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const tabCount = await page.locator('[aria-label="점술 체계 선택"]').count();
const bodyText = await page.locator('body').innerText();
const hasTab = tabCount > 0;
const hasWestern = /서양 점성술|출생 천궁도|시너스트리|통합 리포트/.test(bodyText);

if (MODE === 'only') {
  check('체계 탭 없음', !hasTab, `tab=${tabCount}`);
  check('서양 관련 문구 없음', !hasWestern);
  check('?system=western 이어도 자미두수 화면', bodyText.includes('동양 전통 자미두수') || bodyText.includes('별의 속삭임'));
  check('상품 세 권 표기', bodyText.includes('별 이야기 세 권'));
} else {
  check('체계 탭 있음', hasTab);
  check('서양 상품 노출', bodyText.includes('출생 천궁도 리포트') || bodyText.includes('두 사람 시너스트리'));
}

await page.getByRole('button', { name: /예시 먼저 보기|예시 명반/ }).first().click();
await page.waitForTimeout(1600);
const chartText = await page.locator('body').innerText();
check('결과 화면 진입', chartText.includes('수호별') || chartText.includes('명궁'));
if (MODE === 'only') {
  check('결과 화면에 서양 문구 없음', !/서양|천궁도|시너스트리/.test(chartText));
}

console.log(`\n결과: ${pass} 통과 / ${fail} 실패 · 콘솔 에러 ${errors.length}건`);
if (errors.length) console.log(errors.slice(0, 5));
await browser.close();
process.exit(fail ? 1 : 0);
