/**
 * 별의 속삭임 — 마법사 흐름 캡처 + 겹침 검사
 * 실행:
 *   PATH=/workspace/.tools/node-v22.14.0-linux-x64/bin:$PATH \
 *   PLAYWRIGHT_BROWSERS_PATH=/workspace/.scratch/pw/browsers \
 *   LD_LIBRARY_PATH=/workspace/.scratch/libs/usr/lib/x86_64-linux-gnu \
 *   node scripts/wizard-shots.mjs <outdir>
 */
import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';

const OUT = process.argv[2] ?? '/workspace/downloads/byulgyeol-wizard-2026-11-23';
const BASE = process.env.PREVIEW_BASE ?? 'http://127.0.0.1:4173/byulgyeol/';
const EXE = '/workspace/.scratch/pw/browsers/chromium-1140/chrome-linux/chrome';

const browser = await chromium.launch({
  executablePath: EXE,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});

const errors = [];

async function open(width, height, mobile, theme) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, locale: 'ko-KR' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`[${theme}/${width}] ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${theme}/${width}] ${m.text()}`);
  });
  await page.goto(`${BASE}?theme=${theme}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  return { ctx, page };
}

async function shoot(page, name) {
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('saved', name);
}

/** 화면 안 텍스트 요소끼리 겹치는지 (조상·형제 중첩 제외) */
async function overlaps(page, tag) {
  const res = await page.evaluate(() => {
    const els = [];
    document.querySelectorAll('p,span,li,dd,dt,h1,h2,h3,button,a,label').forEach((el) => {
      const txt = (el.textContent ?? '').trim();
      if (!txt) return;
      // 자식 텍스트까지 합쳐진 중복 측정을 피하려고, 텍스트를 직접 가진 요소만
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own) return;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      els.push({ el, txt: txt.slice(0, 30), r });
    });
    const out = [];
    for (let i = 0; i < els.length; i += 1) {
      for (let j = i + 1; j < els.length; j += 1) {
        const a = els[i];
        const b = els[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (ox > 4 && oy > 4) out.push(`${a.txt} ↔ ${b.txt} (${Math.round(ox)}×${Math.round(oy)})`);
      }
    }
    return out.slice(0, 20);
  });
  if (res.length) console.log(`overlap[${tag}]:`, JSON.stringify(res, null, 1));
  else console.log(`overlap[${tag}]: none`);
  return res;
}

for (const theme of ['character', 'mystic']) {
  for (const [w, h, mobile] of [[390, 844, true], [1280, 900, false]]) {
    const tag = `${theme}-${w}`;
    const { ctx, page } = await open(w, h, mobile, theme);
    await shoot(page, `${tag}-step1-intro`);
    await overlaps(page, `${tag}-intro`);

    // 인트로 → 별 이야기(마지막 단계) 미리보기
    await page.locator('.wizard-step', { hasText: '별 이야기' }).click().catch(() => {});
    await page.waitForTimeout(800);
    await shoot(page, `${tag}-step3-books`);
    await page.locator('.wizard-step', { hasText: '인트로' }).click().catch(() => {});
    await page.waitForTimeout(600);

    // 인트로 → 입력
    await page.locator('.wizard-bar__next').click();
    await page.waitForTimeout(700);
    await shoot(page, `${tag}-step2-form`);

    // 입력 후 다음(폼 제출)
    await page.selectOption('#birth-year', '1990').catch(() => {});
    await page.selectOption('select[aria-label="월"]', '5').catch(() => {});
    await page.selectOption('select[aria-label="일"]', '17').catch(() => {});
    await page.getByRole('button', { name: '여성' }).first().click().catch(() => {});
    await shoot(page, `${tag}-step2-filled`);
    await page.locator('.wizard-bar__next').click();
    await page.waitForTimeout(2600);
    await shoot(page, `${tag}-result-step1-soul`);
    await overlaps(page, `${tag}-soul`);

    // 결과 단계 넘기기
    for (let i = 2; i <= 5; i += 1) {
      const next = page.locator('.wizard-bar__next');
      await next.click().catch(() => {});
      await page.waitForTimeout(900);
      await shoot(page, `${tag}-result-step${i}`);
      await overlaps(page, `${tag}-result-step${i}`);
    }

    // 유년 카드만 크게 (3번째 단계로 이동)
    await page.locator('.wizard-step', { hasText: '올해의 흐름' }).click();
    await page.waitForTimeout(900);
    const card = page.locator('#year-flow').first();
    await card.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(400);
    await card.screenshot({ path: `${OUT}/${tag}-year-card.png` }).catch(() => console.log('year card shot failed', tag));

    await ctx.close();
  }
}

// 데스크톱(1280) 인트로 전체 모습
const { ctx: c2, page: p2 } = await open(1280, 1600, false, 'character');
await shoot(p2, 'character-1280-intro-tall');
await c2.close();

console.log('console/page errors:', errors.length, errors.slice(0, 8));
await browser.close();
