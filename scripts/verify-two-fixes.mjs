/**
 * 별의 속삭임 프리뷰 수정 2건 검증 캡처 (390×844 모바일)
 * 1) 캐릭터 테마 보라색 추천 카드 제목 대비
 * 2) 미스틱 테마 히어로 문장 "계산합니다. 성격의" 띄어쓰기
 *
 * 실행: PATH=/workspace/.tools/node/bin:$PATH PLAYWRIGHT_BROWSERS_PATH=/workspace/.scratch/pw/browsers \
 *       LD_LIBRARY_PATH=/workspace/.tools/libs node scripts/verify-two-fixes.mjs
 */
import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';

const BASE = process.env.PREVIEW_BASE ?? 'http://127.0.0.1:4173/byulgyeol/';
const EXE = '/workspace/.scratch/pw/browsers/chromium-1148/chrome-linux/chrome';

const browser = await chromium.launch({
  executablePath: EXE,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});

async function open(url) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'ko-KR',
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  return { ctx, page };
}

// ---------- 1) 캐릭터 테마 추천 카드 ----------
{
  const { ctx, page } = await open(BASE);
  const card = page.locator('h3', { hasText: '프리미엄 12궁 & 운세 풀 리포트' }).first();
  await card.waitFor({ state: 'attached', timeout: 15000 });
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);

  const info = await card.evaluate((el) => {
    const h3 = el;
    const box = h3.closest('div[style]');
    const cs = getComputedStyle(h3);
    const parent = h3.parentElement?.parentElement;
    return {
      text: h3.innerText,
      color: cs.color,
      fontSize: cs.fontSize,
      cardBackground: parent ? getComputedStyle(parent).backgroundImage || getComputedStyle(parent).backgroundColor : null,
    };
  });

  // 카드 전체(배지 포함)를 프레임에 담기
  const cardBox = await card.evaluate((el) => {
    const wrap = el.closest('div[style]');
    const r = wrap.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  await page.evaluate(({ y }) => window.scrollBy(0, y - 120), { y: cardBox.y });
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/workspace/downloads/byulgyeol_ziwei_fix_character.png' });

  console.log('[character]', JSON.stringify(info, null, 2));
  await ctx.close();
}

// ---------- 2) 미스틱 테마 히어로 문장 ----------
{
  const { ctx, page } = await open(`${BASE}?theme=mystic`);
  const target = page.getByText('계산합니다', { exact: false }).first();
  await target.waitFor({ state: 'attached', timeout: 15000 });
  await target.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);

  const text = await target.evaluate((el) => ({
    innerText: el.innerText,
    textContent: el.textContent,
    joined: /계산합니다\.성격의/.test(el.innerText),
  }));

  const box = await target.boundingBox();
  await page.screenshot({
    path: '/workspace/downloads/byulgyeol_ziwei_fix_mystic.png',
    clip: {
      x: 0,
      y: Math.max(0, box.y - 90),
      width: 390,
      height: Math.min(420, 844 - Math.max(0, box.y - 90)),
    },
  });

  console.log('[mystic]', JSON.stringify(text, null, 2));
  await ctx.close();
}

await browser.close();
