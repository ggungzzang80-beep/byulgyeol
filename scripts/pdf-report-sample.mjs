/**
 * 유료 리포트 미리보기(?sample=paid)를 인쇄용 PDF로 저장합니다.
 * node scripts/pdf-report-sample.mjs <out.pdf> <baseUrl>
 */
import { chromium } from '/workspace/.scratch/pw/node_modules/playwright/index.mjs';

const OUT = process.argv[2] ?? '/workspace/downloads/byulgyeol-renewal-2026-11-25/paid-report-sample-print.pdf';
const BASE = process.argv[3] ?? 'https://ggungzzang80-beep.github.io/byulgyeol/?sample=paid';

const browser = await chromium.launch({
  executablePath: '/workspace/.scratch/pw/browsers/chromium-1148/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});
const ctx = await browser.newContext({ viewport: { width: 900, height: 1200 }, locale: 'ko-KR' });
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(600);
await page.pdf({ path: OUT, format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' } });
console.log('pdf saved', OUT);
await browser.close();
