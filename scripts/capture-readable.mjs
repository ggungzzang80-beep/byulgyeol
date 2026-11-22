/**
 * 별의 속삭임(자미두수 단독) — 가독성 개선 후 모바일(390×844) 캡처·검수
 * 실행: PATH=... LD_LIBRARY_PATH=... node scripts/capture-readable.mjs
 * 서버: python3 -m http.server 4173 --directory dist
 */
import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';

const BASE = process.env.PREVIEW_BASE ?? 'http://127.0.0.1:4173/';
const EXE = '/workspace/.scratch/pw/browsers/chromium-1148/chrome-linux/chrome';
const OUT = '/workspace/downloads';

const errors = [];
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });

const audit = async (page, label) => {
  const m = await page.evaluate(() => {
    const cw = document.documentElement.clientWidth;
    const els = [...document.querySelectorAll('body *')];
    const sizes = [...document.querySelectorAll('p, span, li, button, label, div, a, h1, h2, h3, h4, strong, b, em, td, th')]
      .map((el) => ({ el, size: parseFloat(getComputedStyle(el).fontSize), text: (el.textContent || '').trim() }))
      .filter((x) => x.size > 0 && x.text.length > 1);
    const small = sizes.filter((x) => x.size < 12);
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: cw,
      scrollHeight: document.documentElement.scrollHeight,
      min: Math.min(...sizes.map((x) => x.size)),
      small: [...new Set(small.map((x) => `${x.size}px "${x.text.slice(0, 16)}"`))].slice(0, 10),
      smallCount: small.length,
      overflow: els
        .filter((el) => el.getBoundingClientRect().right > cw + 1)
        .slice(0, 8)
        .map((el) => `${el.tagName}.${(el.className || '').toString().slice(0, 46)}`),
    };
  });
  console.log(
    `[${label}] ${m.scrollWidth}/${m.clientWidth} ${m.scrollWidth <= m.clientWidth ? 'OK(가로넘침 없음)' : 'OVERFLOW'} · 높이 ${m.scrollHeight} · 최소 ${m.min}px · <12px ${m.smallCount}`,
  );
  if (m.small.length) console.log('   small:', m.small.join(' | '));
  if (m.overflow.length) console.log('   overflow:', m.overflow.join(' | '));
  return m;
};

const open = async (query) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR' });
  const page = await ctx.newPage();
  page.on('console', (msg) => msg.type() === 'error' && errors.push(`${query}: ${msg.text()}`));
  page.on('pageerror', (e) => errors.push(`${query}: PAGEERROR ${e.message}`));
  await page.goto(`${BASE}${query}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  return { ctx, page };
};

/* 1·2) 별의 속삭임(달빛/캐릭터 테마) */
{
  const { ctx, page } = await open('?theme=character');
  await audit(page, 'character 상단');
  await page.screenshot({ path: `${OUT}/byulgyeol_ziwei_only_readable_1.png` });

  /* 하단 카드/리딩 영역 — 상품 카드 섹션 */
  const reports = page.locator('#reports');
  await reports.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await audit(page, 'character 리포트 카드');
  await page.screenshot({ path: `${OUT}/byulgyeol_ziwei_only_readable_2.png` });

  /* 검토용: 섹션 이어찍기 */
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0, i = 1; y < h; y += 780, i += 1) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `/workspace/projects/ziwei-app/scripts/out/character_${i}.png` });
  }
  await ctx.close();
}

/* 3) 자미원(미스틱 테마) */
{
  const { ctx, page } = await open('?theme=mystic');
  await audit(page, 'mystic 상단');
  await page.screenshot({ path: `${OUT}/byulgyeol_ziwei_only_readable_mystic.png` });

  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0, i = 1; y < h; y += 780, i += 1) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `/workspace/projects/ziwei-app/scripts/out/mystic_${i}.png` });
  }
  await ctx.close();
}

/* 4) 결과 화면 콘솔 에러·가로넘침 점검 */
{
  const { ctx, page } = await open('?theme=character');
  await page.getByRole('button', { name: /예시 먼저 보기|예시 명반/ }).first().click();
  await page.waitForTimeout(1800);
  await audit(page, '결과 화면');
  await page.screenshot({ path: '/workspace/projects/ziwei-app/scripts/out/result_top.png' });
  await ctx.close();
}

console.log('console errors:', errors.length, errors.slice(0, 5));
await browser.close();
