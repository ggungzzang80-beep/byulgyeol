/**
 * 별의 속삭임 마법사 UX 캡처 — 로컬 프리뷰 (python3 -m http.server 4173 --directory /workspace/.scratch/serve)
 * 실행:
 *   PATH=/workspace/.tools/node-v22.14.0-linux-x64/bin:$PATH \
 *   PLAYWRIGHT_BROWSERS_PATH=/workspace/.scratch/pw/browsers \
 *   LD_LIBRARY_PATH=/workspace/.scratch/libs/usr/lib/x86_64-linux-gnu \
 *   node scripts/shot.mjs <outdir>
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
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
    locale: 'ko-KR',
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`[${theme}/${width}] ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`[${theme}/${width}] ${m.text()}`));
  await page.goto(`${BASE}?theme=${theme}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  return { ctx, page };
}

async function shoot(page, name) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('saved', name);
}

/** 겹침 검사: 텍스트 노드 사각형이 서로 겹치는지 */
async function overlapReport(page, label) {
  const res = await page.evaluate(() => {
    const rects = [];
    const walk = (el) => {
      for (const node of el.children) {
        const st = getComputedStyle(node);
        if (st.display === 'none' || st.visibility === 'hidden') continue;
        const hasText = [...node.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
        if (hasText) {
          const r = node.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            rects.push({
              t: (node.textContent || '').trim().slice(0, 40),
              tag: node.tagName,
              cls: String(node.className).slice(0, 40),
              x: r.x, y: r.y + window.scrollY, w: r.width, h: r.height,
            });
          }
        }
        walk(node);
      }
    };
    walk(document.body);
    const problems = [];
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i];
        const b = rects[j];
        // 한쪽이 다른 쪽의 조상이면 제외 (walk 는 부모-자식 둘 다 넣음)
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (ox > 3 && oy > 3) problems.push(`${a.t} ↔ ${b.t} (${Math.round(ox)}×${Math.round(oy)})`);
      }
    }
    return problems.slice(0, 25);
  });
  console.log(`overlap[${label}]:`, JSON.stringify(res, null, 1));
  return res;
}

for (const theme of ['character', 'mystic']) {
  for (const [w, h, mobile] of [[390, 844, true], [1280, 900, false]]) {
    const tag = `${theme}-${w}`;
    const { ctx, page } = await open(w, h, mobile, theme);
    await shoot(page, `${tag}-01-landing`);
    // 마법사 진행: 생년월일 입력
    await page.selectOption('#birth-year', '1990').catch(() => {});
    await page.selectOption('select[aria-label="월"]', '5').catch(() => {});
    await page.selectOption('select[aria-label="일"]', '17').catch(() => {});
    await shoot(page, `${tag}-02-form-filled`);
    // 다음 버튼이 있으면 눌러 단계 이동
    const next = page.getByRole('button', { name: /다음|별지도 열기|명반 열기/ }).first();
    await next.click().catch(() => {});
    await page.waitForTimeout(2200);
    await shoot(page, `${tag}-03-result-top`);
    // 스텝 이동하며 캡처
    for (let i = 1; i <= 8; i += 1) {
      const btn = page.getByRole('button', { name: /^다음/ }).first();
      const visible = await btn.isVisible().catch(() => false);
      if (!visible)	break;
      await btn.click().catch(() => {});
      await page.waitForTimeout(700);
      await shoot(page, `${tag}-04-step-${i + 1}`);
    }
    // 유년 카드 겹침 검사
    const card = page.locator('text=/유년|올해의 별/').first();
    await card.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(500);
    await shoot(page, `${tag}-05-year-card`);
    const problems = await overlapReport(page, tag);
    await ctx.close();
  }
}

console.log('console/page errors:', errors.length, errors.slice(0, 6));
await browser.close();
