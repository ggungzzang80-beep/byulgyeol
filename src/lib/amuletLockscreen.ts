/**
 * 2027 부적 — 폰 잠금화면(9:16) 카드 (amuletLockscreen.ts)
 * ------------------------------------------------------------------
 * 2026-11-25 @kooleumi8 피드백 6번: 부적 카드를 9:16 스마트폰 잠금화면 비율
 * (화면 540×960 · 저장 1080×1920)로 새로 만들었습니다.
 *
 * - 배경: 하온과 오드아이 별빛 고양이가 함께 있는 밤 누각 일러스트(공용 아트)
 * - 위쪽 별하늘에 금박 제목·2027 배지·해의 이름·이름
 * - 아래 한지 띠에 키워드·한 줄 조언·푸터
 * - 굿즈·수호 원석 칸은 넣지 않습니다(피드백 2번).
 *
 * 화면(SVG, AmuletLockscreen2027.tsx)과 저장 이미지(canvas)가 이 파일 하나의
 * 좌표·문구·줄바꿈식을 함께 씁니다.
 */
import type { ChartModel } from './chart';
import type { NewYear2027Content } from './newyear2027';
import { AMULET_FONTS, estimateWidth, wrapByWidth } from './amuletArt';

/** 카드 좌표계 — 화면 SVG 540×960, 저장 이미지는 2배(1080×1920) */
export const LOCK_CARD = { w: 540, h: 960, frame: 24, cx: 270 } as const;

/** 일러스트가 들어가는 창 — 9:16 아트(1080×1683)를 잘림 없이 맞춘 비율 */
export const LOCK_ART = {
  x: 24,
  y: 24,
  w: 492,
  h: 766,
  r: 18,
  url: `${import.meta.env.BASE_URL}art/haon-lockscreen.webp`,
} as const;

export const LOCK_LAYOUT = {
  brand: { y: 70, size: 24, tracking: 2.4 },
  brandRule: { y: 58, edgeX: 60, diamondGap: 13, lineGap: 8, diamondR: 2.8 },
  eyebrow: { y: 92, size: 9.5, tracking: 3 },
  badge: { cy: 138, h: 36, w: 196, font: 19, hanja: 15, gap: 16 },
  yearLine: { y: 206, size: 28, tracking: 1.2 },
  owner: { y: 238, size: 19 },
  star: { y: 262, size: 13 },
  seal: { x: 462, y: 96, box: 40, font: 22 },
  band: { y: 790, h: 146 },
  chips: { y: 806, h: 32, font: 16, padX: 36, gap: 8, dotX: 15, dotR: 2.6, textX: 25, baseline: 21 },
  advice: { y: 862, size: 18, lh: 23, width: 452, maxLines: 2 },
  footer: { lineY: 900, textY: 918, size: 10.5, brandSize: 11, insets: 42 },
  disclaimer: { y: 934, size: 9 },
} as const;

/** 카드 안 문구 — 화면·이미지 공용 (지칭 통일: '님' 없이 이름 + 의) */
export function lockLines(chart: { name: string; primaryStar: string }, content: NewYear2027Content) {
  const owner = chart.name?.trim() ? `${chart.name.trim()}의 2027 부적` : '나의 2027 부적';
  return {
    brand: '별의 속삭임',
    eyebrow: '2027 NEW YEAR AMULET',
    badgeYear: '2027',
    badgeHanja: content.hanja || '丁未',
    yearLine: `${content.stemBranch}년 · ${content.animal}의 해`,
    owner,
    star: `수호별 · ${chart.primaryStar}별`,
    footerDate: '2027. 1. 1 — 12. 31 · 소장용 부적',
    disclaimer: '효능을 보장하지 않는 소장용 콘텐츠야 · 의료·투자 판단의 근거는 아니야',
    seal: '守',
  };
}

/** 조언 두 줄 — 정해진 폭에 맞춰 필요하면 글자를 줄입니다. */
export function lockAdviceLayout(text: string) {
  let size: number = LOCK_LAYOUT.advice.size;
  let lines = wrapByWidth(text, LOCK_LAYOUT.advice.width, size, LOCK_LAYOUT.advice.maxLines);
  while (lines.length > LOCK_LAYOUT.advice.maxLines && size > 14) {
    size = Math.round((size - 0.5) * 10) / 10;
    lines = wrapByWidth(text, LOCK_LAYOUT.advice.width, size, LOCK_LAYOUT.advice.maxLines);
  }
  return { size, lines: lines.slice(0, LOCK_LAYOUT.advice.maxLines) };
}

/** 키워드 칩 배치 — 화면·이미지 공용 */
export function lockChipLayout(keywords: readonly string[]) {
  const maxWidth = LOCK_CARD.w - 110;
  const widthOf = (size: number) => keywords.map((k) => estimateWidth(k, size) + LOCK_LAYOUT.chips.padX);
  const sumOf = (widths: number[]) =>
    widths.reduce((a, b) => a + b, 0) + LOCK_LAYOUT.chips.gap * Math.max(0, keywords.length - 1);

  let font: number = LOCK_LAYOUT.chips.font;
  let widths = widthOf(font);
  let total = sumOf(widths);
  if (total > maxWidth) {
    font = Math.floor(font * (maxWidth / total) * 10) / 10;
    widths = widthOf(font);
    total = sumOf(widths);
  }
  return { font, widths, total, startX: LOCK_CARD.cx - total / 2 };
}

/* ------------------------------------------------ canvas 저장 이미지 */

const S = 2;
const { w: CW, h: CH, cx: CX } = LOCK_CARD;

function ensureFonts(): Promise<void> {
  const L = LOCK_LAYOUT;
  const specs = [
    `600 ${L.brand.size}px ${AMULET_FONTS.serif}`,
    `700 ${L.badge.font}px ${AMULET_FONTS.serif}`,
    `600 ${L.yearLine.size}px ${AMULET_FONTS.serif}`,
    `500 ${L.owner.size}px ${AMULET_FONTS.serif}`,
    `400 ${L.star.size}px ${AMULET_FONTS.sans}`,
    `400 ${L.advice.size}px ${AMULET_FONTS.serif}`,
    `400 ${L.chips.font}px ${AMULET_FONTS.round}`,
    `400 ${L.footer.size}px ${AMULET_FONTS.sans}`,
    `400 ${L.disclaimer.size}px ${AMULET_FONTS.sans}`,
    `700 ${L.seal.font}px ${AMULET_FONTS.serif}`,
  ];
  const sample = '별의 속삭임 정미년 붉은 양 신년 부적 수호별 丁未 2027';
  try {
    return Promise.all(specs.map((s) => document.fonts.load(s, sample).catch(() => undefined))).then(
      () => document.fonts.ready.then(() => undefined),
    );
  } catch {
    return Promise.resolve();
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지를 불러오지 못했습니다: ${src}`));
    img.src = src;
  });
}

function tracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tracking: number, align: 'left' | 'right' | 'center') {
  let total = 0;
  for (const ch of text) total += ctx.measureText(ch).width + tracking;
  total -= tracking;
  let cursor = align === 'right' ? x - total : align === 'center' ? x - total / 2 : x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + tracking;
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * 9:16 부적 카드를 canvas 로 그려 PNG data URL 로 돌려줍니다. (저장용 · 1080×1920)
 */
export async function renderLockscreenAmulet(
  chart: ChartModel,
  content: NewYear2027Content,
): Promise<string> {
  await ensureFonts();
  const L = LOCK_LAYOUT;
  const T = lockLines(chart, content);
  const A = LOCK_ART;

  const canvas = document.createElement('canvas');
  canvas.width = CW * S;
  canvas.height = CH * S;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  ctx.scale(S, S);

  /* 1. 한지 바탕 (일러스트 뒤) */
  const paper = ctx.createLinearGradient(0, 0, CW * 0.2, CH);
  paper.addColorStop(0, '#fdf7ea');
  paper.addColorStop(0.55, '#f7ecd8');
  paper.addColorStop(1, '#eedcc0');
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, CW, CH);

  /* 2. 일러스트 — 둥근 창 안에 꽉 채웁니다 */
  ctx.save();
  roundRect(ctx, A.x, A.y, A.w, A.h, A.r);
  ctx.clip();
  try {
    const img = await loadImage(A.url);
    const scale = Math.max(A.w / img.width, A.h / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    ctx.drawImage(img, A.x + (A.w - iw) / 2, A.y + (A.h - ih) / 2, iw, ih);
  } catch {
    const fallback = ctx.createLinearGradient(0, A.y, 0, A.y + A.h);
    fallback.addColorStop(0, '#1b1633');
    fallback.addColorStop(1, '#3a2f5c');
    ctx.fillStyle = fallback;
    ctx.fillRect(A.x, A.y, A.w, A.h);
  }

  /* 위쪽 별하늘 — 글자가 읽히도록 살짝 어둡게 */
  const topShade = ctx.createLinearGradient(0, A.y, 0, A.y + 300);
  topShade.addColorStop(0, 'rgba(12,9,28,0.62)');
  topShade.addColorStop(0.6, 'rgba(12,9,28,0.30)');
  topShade.addColorStop(1, 'rgba(12,9,28,0)');
  ctx.fillStyle = topShade;
  ctx.fillRect(A.x, A.y, A.w, 300);
  ctx.restore();

  /* 3. 아래 한지 띠 */
  const bandGrad = ctx.createLinearGradient(0, L.band.y, 0, L.band.y + L.band.h);
  bandGrad.addColorStop(0, 'rgba(253,247,234,0.93)');
  bandGrad.addColorStop(0.35, 'rgba(250,241,226,0.97)');
  bandGrad.addColorStop(1, 'rgba(244,232,210,0.99)');
  ctx.fillStyle = bandGrad;
  ctx.fillRect(A.x, L.band.y, A.w, L.band.h);

  /* 한지 섬유 결 */
  ctx.strokeStyle = 'rgba(150,112,58,0.10)';
  ctx.lineWidth = 0.4;
  for (let i = 0; i < 26; i += 1) {
    const x = A.x + ((i * 79 + 23) % A.w);
    const y = L.band.y + 8 + ((i * 37) % (L.band.h - 16));
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 8 + (i % 7), y + ((i % 5) - 2) * 1.2);
    ctx.stroke();
  }

  /* 4. 금박 테두리 + 모서리 */
  const frameGrad = ctx.createLinearGradient(0, 0, CW, CH);
  frameGrad.addColorStop(0, '#f4e1b2');
  frameGrad.addColorStop(0.46, '#b98a34');
  frameGrad.addColorStop(1, '#7d5718');

  ctx.save();
  ctx.strokeStyle = frameGrad;
  ctx.lineWidth = 2.2;
  ctx.shadowColor = 'rgba(20,12,34,0.35)';
  ctx.shadowBlur = 8;
  roundRect(ctx, 14, 14, CW - 28, CH - 28, 20);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = 'rgba(172,130,64,0.5)';
  ctx.lineWidth = 0.7;
  roundRect(ctx, 21, 21, CW - 42, CH - 42, 15);
  ctx.stroke();

  /* 띠 위쪽 금선 */
  ctx.strokeStyle = 'rgba(150,112,58,0.55)';
  ctx.lineWidth = 0.8;
  const dGap = 16;
  ctx.beginPath();
  ctx.moveTo(A.x + 10, L.band.y);
  ctx.lineTo(CX - dGap, L.band.y);
  ctx.moveTo(CX + dGap, L.band.y);
  ctx.lineTo(A.x + A.w - 10, L.band.y);
  ctx.stroke();
  ctx.save();
  ctx.translate(CX, L.band.y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#b9892f';
  ctx.fillRect(-2.8, -2.8, 5.6, 5.6);
  ctx.restore();

  /* 5. 머리글 — 브랜드 */
  const brandW = estimateWidth(T.brand, L.brand.size) + L.brand.tracking * Math.max(0, T.brand.length - 1);
  const dl = CX - brandW / 2 - L.brandRule.diamondGap;
  const dr = CX + brandW / 2 + L.brandRule.diamondGap;
  ctx.strokeStyle = 'rgba(240,214,160,0.7)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(L.brandRule.edgeX, L.brandRule.y);
  ctx.lineTo(dl - L.brandRule.lineGap, L.brandRule.y);
  ctx.moveTo(dr + L.brandRule.lineGap, L.brandRule.y);
  ctx.lineTo(CW - L.brandRule.edgeX, L.brandRule.y);
  ctx.stroke();
  [dl, dr].forEach((x) => {
    ctx.save();
    ctx.translate(x, L.brandRule.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#e9c98a';
    ctx.fillRect(-L.brandRule.diamondR, -L.brandRule.diamondR, L.brandRule.diamondR * 2, L.brandRule.diamondR * 2);
    ctx.restore();
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff7e8';
  ctx.font = `600 ${L.brand.size}px ${AMULET_FONTS.serif}`;
  ctx.shadowColor = 'rgba(16,10,30,0.55)';
  ctx.shadowBlur = 6;
  tracked(ctx, T.brand, CX, L.brand.y, L.brand.tracking, 'center');
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#f0d9a8';
  ctx.font = `400 ${L.eyebrow.size}px ${AMULET_FONTS.sans}`;
  tracked(ctx, T.eyebrow, CX, L.eyebrow.y, L.eyebrow.tracking, 'center');

  /* 6. 2027 · 丁未 배지 */
  const bw = L.badge.w;
  const bh = L.badge.h;
  roundRect(ctx, CX - bw / 2, L.badge.cy - bh / 2, bw, bh, bh / 2);
  ctx.fillStyle = 'rgba(20,14,40,0.52)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(233,201,138,0.85)';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.fillStyle = '#ffeecb';
  ctx.font = `700 ${L.badge.font}px ${AMULET_FONTS.serif}`;
  drawBadgeText(ctx, T.badgeYear, T.badgeHanja);

  /* 7. 해의 이름 · 이름 · 수호별 */
  ctx.fillStyle = '#fff7e8';
  ctx.font = `600 ${L.yearLine.size}px ${AMULET_FONTS.serif}`;
  ctx.shadowColor = 'rgba(16,10,30,0.5)';
  ctx.shadowBlur = 7;
  tracked(ctx, T.yearLine, CX, L.yearLine.y, L.yearLine.tracking, 'center');
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255,247,232,0.92)';
  ctx.font = `500 ${L.owner.size}px ${AMULET_FONTS.serif}`;
  ctx.fillText(T.owner, CX, L.owner.y);

  ctx.fillStyle = 'rgba(255,247,232,0.78)';
  ctx.font = `400 ${L.star.size}px ${AMULET_FONTS.sans}`;
  tracked(ctx, T.star, CX, L.star.y, 0.5, 'center');

  /* 8. 인장 */
  ctx.save();
  ctx.translate(L.seal.x, L.seal.y);
  ctx.rotate((-5 * Math.PI) / 180);
  ctx.fillStyle = '#9d3a33';
  roundRect(ctx, -L.seal.box / 2, -L.seal.box / 2, L.seal.box, L.seal.box, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,236,228,0.7)';
  ctx.lineWidth = 0.9;
  roundRect(ctx, -L.seal.box / 2 + 4, -L.seal.box / 2 + 4, L.seal.box - 8, L.seal.box - 8, 2.5);
  ctx.stroke();
  ctx.fillStyle = '#fdeee6';
  ctx.font = `700 ${L.seal.font}px ${AMULET_FONTS.serif}`;
  ctx.textAlign = 'center';
  ctx.fillText(T.seal, 0, 8);
  ctx.restore();

  /* 9. 키워드 칩 */
  const chip = lockChipLayout(content.keywords);
  ctx.font = `400 ${chip.font}px ${AMULET_FONTS.round}`;
  content.keywords.forEach((k, i) => {
    const w = chip.widths[i];
    const x = chip.startX + chip.widths.slice(0, i).reduce((a, b) => a + b, 0) + L.chips.gap * i;
    roundRect(ctx, x, L.chips.y, w, L.chips.h, L.chips.h / 2);
    ctx.fillStyle = 'rgba(255,252,244,0.7)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(178,138,74,0.55)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.save();
    ctx.translate(x + L.chips.dotX, L.chips.y + L.chips.h / 2);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#b9892f';
    ctx.fillRect(-L.chips.dotR, -L.chips.dotR, L.chips.dotR * 2, L.chips.dotR * 2);
    ctx.restore();
    ctx.fillStyle = '#43304f';
    ctx.textAlign = 'left';
    ctx.fillText(k, x + L.chips.textX, L.chips.y + L.chips.baseline);
    ctx.textAlign = 'center';
  });

  /* 10. 한 줄 조언 */
  const advice = lockAdviceLayout(content.advice);
  ctx.fillStyle = '#43304f';
  ctx.font = `400 ${advice.size}px ${AMULET_FONTS.serif}`;
  advice.lines.forEach((line, i) => ctx.fillText(line, CX, L.advice.y + i * L.advice.lh));

  /* 11. 푸터 */
  ctx.fillStyle = 'rgba(67,48,79,0.72)';
  ctx.font = `400 ${L.footer.size}px ${AMULET_FONTS.sans}`;
  ctx.textAlign = 'left';
  ctx.fillText(T.footerDate, L.footer.insets, L.footer.textY);

  ctx.fillStyle = '#8a6323';
  ctx.font = `600 ${L.footer.brandSize}px ${AMULET_FONTS.serif}`;
  ctx.textAlign = 'right';
  tracked(ctx, T.brand, CW - L.footer.insets, L.footer.textY, 0.8, 'right');

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(67,48,79,0.62)';
  ctx.font = `400 ${L.disclaimer.size}px ${AMULET_FONTS.sans}`;
  ctx.fillText(T.disclaimer, CX, L.disclaimer.y);

  return canvas.toDataURL('image/png');
}

/** 배지 안쪽: 2027 | 丁未 */
function drawBadgeText(ctx: CanvasRenderingContext2D, year: string, hanja: string) {
  const { badge } = LOCK_LAYOUT;
  const yearW = estimateWidth(year, badge.font);
  const hanjaW = estimateWidth(hanja, badge.hanja);
  const total = yearW + badge.gap + hanjaW;
  const startX = LOCK_CARD.cx - total / 2;
  ctx.textAlign = 'left';
  ctx.font = `700 ${badge.font}px ${AMULET_FONTS.serif}`;
  ctx.fillText(year, startX, badge.cy + badge.font * 0.35);
  ctx.fillStyle = 'rgba(233,201,138,0.75)';
  ctx.fillRect(startX + yearW + badge.gap / 2 - 0.4, badge.cy - 8, 0.8, 16);
  ctx.fillStyle = '#ffeecb';
  ctx.font = `500 ${badge.hanja}px ${AMULET_FONTS.serif}`;
  ctx.fillText(hanja, startX + yearW + badge.gap, badge.cy + badge.hanja * 0.35);
  ctx.textAlign = 'center';
}
