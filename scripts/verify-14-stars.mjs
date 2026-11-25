/**
 * 14 수호별 검증(엔진 레벨) — 개발 서버에서 chart·shareCard 모듈을 직접 불러
 * 1) 14개 별 각각의 명반을 만들고
 * 2) Step1 가디언 이미지(starGuardian)와 공유카드(renderShareCard)를 실제로 렌더해
 *    아치 창 안 고양이가 별마다 다른지 해시로 확인합니다.
 *
 * 실행(개발 서버 필요):
 *   node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5199 &
 *   node scripts/verify-14-stars.mjs http://127.0.0.1:5199/byulgyeol/
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';

const BASE = process.argv[2] ?? 'http://127.0.0.1:5199/byulgyeol/';
const OUT = '/workspace/downloads/byulgyeol-renewal-2026-11-25-v2/_verify';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/workspace/.scratch/pw/browsers/chromium-1148/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1400 }, locale: 'ko-KR' });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const result = await page.evaluate(async () => {
  const base = new URL('.', location.href).pathname;
  const chartMod = await import(`${base}src/lib/chart.ts`);
  const palette = await import(`${base}src/lib/starPalette.ts`);
  const share = await import(`${base}src/lib/shareCard.ts`);

  const stars = ['자미', '천기', '태양', '무곡', '천동', '염정', '천부', '태음', '탐랑', '거문', '천상', '천량', '칠살', '파군'];
  const found = {};
  /* 충분히 다양한 생년월일로 14개 별을 모두 모읍니다. */
  outer: for (let year = 1962; year <= 2004; year += 3) {
    for (let month = 1; month <= 12; month += 1) {
      for (const day of [3, 11, 19, 27]) {
        const input = {
          name: '검증',
          year,
          month,
          day,
          calendar: 'solar',
          isLeap: false,
          timeIndex: (month + day) % 12,
          timeKnown: true,
          gender: month % 2 ? 'female' : 'male',
        };
        const chart = await chartMod.buildChart(input);
        const star = chart.primaryStar;
        if (stars.includes(star) && !found[star]) {
          const g = palette.starGuardian(star);
          found[star] = { chart, guardian: { image: g.image, name: g.name } };
        }
        if (Object.keys(found).length === stars.length) break outer;
      }
    }
  }

  const rows = [];
  for (const star of stars) {
    const hit = found[star];
    if (!hit) {
      rows.push({ star, missing: true });
      continue;
    }
    const dataUrl = await share.renderShareCard(hit.chart, 'character');
    rows.push({
      star,
      guardianFile: hit.guardian.image,
      guardianName: hit.guardian.name,
      dataUrlHead: dataUrl.slice(0, 24),
      dataUrl,
      birth: `${hit.chart.solarText}`,
    });
  }
  return rows;
});

const lines = ['star\tguardian\tname\tbirth\tsharecard_png_sha256'];
const hashes = new Map();
for (const r of result) {
  if (r.missing) {
    lines.push(`${r.star}\tMISSING`);
    continue;
  }
  const buf = Buffer.from(r.dataUrl.split(',')[1], 'base64');
  fs.writeFileSync(`${OUT}/sharecard-${r.star}.png`, buf);
  const h = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
  hashes.set(h, (hashes.get(h) ?? []).concat(r.star));
  lines.push(`${r.star}\t${r.guardianFile.split('/').pop()}\t${r.guardianName}\t${r.birth}\t${h}`);
}
console.log(lines.join('\n'));
const dup = [...hashes.entries()].filter(([, s]) => s.length > 1);
console.log('\ncards:', hashes.size, '/ 14 · duplicate cards:', dup.length ? JSON.stringify(dup) : 'none');
console.log('unique guardian files:', new Set(result.filter((r) => !r.missing).map((r) => r.guardianFile)).size);
console.log('result:', result.every((r) => !r.missing) && dup.length === 0 ? 'PASS' : 'FAIL');
console.log('page errors:', JSON.stringify(errs));
await browser.close();
