/**
 * 공유 카드 이미지 생성 (shareCard.ts)
 * ------------------------------------------------------------------
 * 서버 없이 브라우저 canvas 로 1080×1350(인스타그램 4:5) PNG 를 그립니다.
 *
 *   mystic    — 딥 벨벳 + 금박 프레임 + 성좌 궤도
 *   character — 주성별 고유 팔레트의 '타로/부적 카드'
 *               (성좌 배경 + 금박·라벤더 프레임 + 중앙 가디언 + 주성 문양)
 */
import type { ChartModel } from '../lib/chart';
import { palaceScore, profileOf } from '../lib/content';
import { elementLight } from '../lib/friendly';
import { DEFAULT_GUARDIAN_IMAGE, drawStarEmblem, starVisual } from '../lib/starPalette';
import { STAR_HANJA } from '../lib/terms';
import type { ThemeId } from '../lib/theme';

const W = 1080;
const H = 1350;

const SERIF = '"Noto Serif KR", "Nanum Myeongjo", Georgia, serif';
const ROUND = '"Gowun Dodum", Pretendard, "Noto Sans KR", sans-serif';
const SANS = 'Pretendard, "Noto Sans KR", -apple-system, sans-serif';

async function ensureFonts() {
  const specs = [
    `500 34px ${SERIF}`,
    `700 126px ${SERIF}`,
    `700 108px ${SERIF}`,
    `700 100px ${SERIF}`,
    `700 104px ${SERIF}`,
    `500 46px ${SERIF}`,
    `500 44px ${SERIF}`,
    `500 40px ${SERIF}`,
    `500 30px ${SERIF}`,
    `500 26px ${SERIF}`,
    `500 24px ${SERIF}`,
    `400 20px ${SANS}`,
    `500 22px ${SANS}`,
    `500 26px ${SANS}`,
    `500 28px ${SANS}`,
    `500 30px ${SANS}`,
    `400 27px ${SANS}`,
    `400 30px ${SANS}`,
    `400 34px ${ROUND}`,
    `400 64px ${ROUND}`,
    `400 30px ${ROUND}`,
    `400 28px ${ROUND}`,
    `400 27px ${ROUND}`,
    `400 22px ${ROUND}`,
  ];
  const sample = '별결 자미원 별의 속삭임 태양성 강점 주의 재물 연애 직업 명궁 사용설명서 1996 5 21';
  try {
    await Promise.all(specs.map((s) => document.fonts.load(s, sample).catch(() => undefined)));
    await document.fonts.ready;
  } catch {
    /* 폰트 로드 실패 시 폴백 */
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * 좁은 칸에 문장을 넣을 때: 크기를 한 단계씩 줄여가며 maxLines 안에 담는다.
 * 그래도 넘치면 마지막 줄을 말줄임(…)으로 다듬어 문장이 중간에서 끊겨 보이지 않게 한다.
 */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  sizes: number[],
  family: string,
): { size: number; lines: string[] } {
  let lines: string[] = [];
  let size = sizes[sizes.length - 1];
  for (const s of sizes) {
    ctx.font = `400 ${s}px ${family}`;
    lines = wrapText(ctx, text, maxWidth);
    size = s;
    if (lines.length <= maxLines) return { size, lines };
  }
  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1];
  kept[maxLines - 1] = `${last.replace(/[\s,·]+$/, '')}…`;
  return { size, lines: kept };
}

function trackedWidth(ctx: CanvasRenderingContext2D, text: string, tracking: number) {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + tracking;
  return w - tracking;
}

function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  align: 'left' | 'right' | 'center' = 'left',
) {
  const total = trackedWidth(ctx, text, tracking);
  let cursor = align === 'right' ? x - total : align === 'center' ? x - total / 2 : x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + tracking;
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function loadImage(src: string, fallback?: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      if (!fallback) {
        resolve(null);
        return;
      }
      // 주성별 일러스트를 못 불러오면 공용 가디언으로 대체한다
      const alt = new Image();
      alt.onload = () => resolve(alt);
      alt.onerror = () => resolve(null);
      alt.src = fallback;
    };
    img.src = src;
  });
}

function drawStarPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, points = 4) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? r : r * 0.34;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** 둥근 상단(아치) 창 모양 path */
function archPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

/* ------------------------------------------------------------------ mystic */
async function renderMystic(chart: ChartModel): Promise<string> {
  const profile = profileOf(chart.primaryStar);
  const scores: Array<[string, number]> = [
    ['재물', palaceScore(chart.palaces.find((p) => p.name === '재백궁'))],
    ['연애', palaceScore(chart.palaces.find((p) => p.name === '부처궁'))],
    ['직업', palaceScore(chart.palaces.find((p) => p.name === '관록궁'))],
  ];

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');

  // 배경: 딥 벨벳 + 미드나잇 퍼플
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0d0a1a');
  bg.addColorStop(0.45, '#151029');
  bg.addColorStop(1, '#090812');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.78, H * 0.12, 40, W * 0.78, H * 0.12, 620);
  glow.addColorStop(0, 'rgba(124, 88, 190, 0.42)');
  glow.addColorStop(1, 'rgba(124, 88, 190, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(W * 0.16, H * 0.95, 40, W * 0.16, H * 0.95, 560);
  glow2.addColorStop(0, 'rgba(227, 192, 123, 0.16)');
  glow2.addColorStop(1, 'rgba(227, 192, 123, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // 별가루
  for (let i = 0; i < 180; i++) {
    const x = ((i * 137.7) % W + (i % 7) * 3) % W;
    const y = (i * 271.3) % H;
    const r = i % 11 === 0 ? 2.1 : i % 4 === 0 ? 1.4 : 1;
    ctx.fillStyle = i % 5 === 0 ? `rgba(185,155,232,${0.25 + ((i * 7) % 40) / 100})` : `rgba(255,247,230,${0.16 + ((i * 11) % 45) / 100})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 성좌 궤도
  ctx.strokeStyle = 'rgba(227,192,123,0.14)';
  ctx.lineWidth = 1.2;
  [300, 430, 560].forEach((r) => {
    ctx.beginPath();
    ctx.arc(W / 2, 700, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.fillStyle = 'rgba(227,192,123,0.85)';
  [
    [W / 2 + 300 * Math.cos(-0.6), 700 + 300 * Math.sin(-0.6)],
    [W / 2 + 560 * Math.cos(2.1), 700 + 560 * Math.sin(2.1)],
  ].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // 금박 이중 프레임
  ctx.strokeStyle = 'rgba(227,192,123,0.75)';
  ctx.lineWidth = 2.4;
  ctx.strokeRect(44, 44, W - 88, H - 88);
  ctx.strokeStyle = 'rgba(227,192,123,0.28)';
  ctx.lineWidth = 1;
  ctx.strokeRect(60, 60, W - 120, H - 120);

  // 모서리 장식
  ctx.strokeStyle = 'rgba(227,192,123,0.8)';
  ctx.lineWidth = 2;
  const corner = (x: number, y: number, sx: number, sy: number) => {
    ctx.beginPath();
    ctx.moveTo(x + sx * 46, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + sy * 46);
    ctx.stroke();
  };
  corner(44, 44, 1, 1);
  corner(W - 44, 44, -1, 1);
  corner(44, H - 44, 1, -1);
  corner(W - 44, H - 44, -1, -1);

  // 헤더
  const goldGrad = ctx.createLinearGradient(0, 130, 0, 200);
  goldGrad.addColorStop(0, '#f7e7c4');
  goldGrad.addColorStop(1, '#c9a35e');

  ctx.textAlign = 'left';
  ctx.fillStyle = goldGrad;
  ctx.font = `500 38px ${SERIF}`;
  drawTracked(ctx, '자미원', 104, 158, 10);

  ctx.fillStyle = 'rgba(246,238,224,0.62)';
  ctx.font = `400 22px ${SANS}`;
  drawTracked(ctx, '동양 전통 자미두수 · 12궁 명반', W - 104, 156, 1.5, 'right');

  ctx.strokeStyle = 'rgba(227,192,123,0.3)';
  ctx.beginPath();
  ctx.moveTo(104, 196);
  ctx.lineTo(W - 104, 196);
  ctx.stroke();

  // 명궁 라벨
  ctx.fillStyle = 'rgba(227,192,123,0.92)';
  ctx.font = `500 24px ${SANS}`;
  drawTracked(ctx, '命宮 · 명궁의 주성', 104, 258, 5);

  // 주성
  ctx.fillStyle = '#f8f1e4';
  ctx.font = `700 132px ${SERIF}`;
  ctx.fillText(`${chart.primaryStar}성`, 100, 402);

  ctx.fillStyle = 'rgba(227,192,123,0.8)';
  ctx.font = `500 38px ${SERIF}`;
  ctx.textAlign = 'right';
  ctx.fillText(STAR_HANJA[chart.primaryStar] ?? '', W - 108, 396);
  ctx.textAlign = 'left';

  // 별 장식 (주성 옆)
  ctx.strokeStyle = 'rgba(227,192,123,0.55)';
  ctx.lineWidth = 1.4;
  drawStarPath(ctx, W - 210, 300, 26, 4);
  ctx.stroke();

  // 정체성
  ctx.fillStyle = '#f4ead9';
  ctx.font = `500 44px ${SERIF}`;
  const idLines = wrapText(ctx, `“${profile.identity}”`, W - 220).slice(0, 2);
  idLines.forEach((l, i) => ctx.fillText(l, 104, 494 + i * 60));

  // 키워드 칩
  let chipY = 494 + idLines.length * 60 + 14;
  let chipX = 104;
  ctx.font = `500 26px ${SANS}`;
  profile.keywords.forEach((k) => {
    const label = `#${k}`;
    const w = ctx.measureText(label).width + 50;
    if (chipX + w > W - 104) {
      chipX = 104;
      chipY += 64;
    }
    ctx.fillStyle = 'rgba(227,192,123,0.1)';
    ctx.strokeStyle = 'rgba(227,192,123,0.38)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(chipX, chipY, w, 54, 27);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(227,192,123,0.95)';
    ctx.fillText(label, chipX + 25, chipY + 37);
    chipX += w + 12;
  });

  // 구분선
  const rule = chipY + 104;
  ctx.strokeStyle = 'rgba(227,192,123,0.24)';
  ctx.beginPath();
  ctx.moveTo(104, rule);
  ctx.lineTo(W - 104, rule);
  ctx.stroke();

  // 강점 / 주의
  let cy = rule + 58;
  ctx.fillStyle = 'rgba(227,192,123,0.88)';
  ctx.font = `500 22px ${SANS}`;
  drawTracked(ctx, '강점', 104, cy, 5);
  ctx.fillStyle = 'rgba(248,241,228,0.92)';
  ctx.font = `400 30px ${SANS}`;
  const strengthLines = wrapText(ctx, profile.strength, W - 208).slice(0, 3);
  strengthLines.forEach((l, i) => ctx.fillText(l, 104, cy + 44 + i * 42));
  cy += 44 + strengthLines.length * 42 + 34;

  ctx.fillStyle = 'rgba(227,192,123,0.88)';
  ctx.font = `500 22px ${SANS}`;
  drawTracked(ctx, '주의', 104, cy, 5);
  ctx.fillStyle = 'rgba(246,238,224,0.74)';
  ctx.font = `400 30px ${SANS}`;
  const cautionLines = wrapText(ctx, profile.caution, W - 208).slice(0, 2);
  cautionLines.forEach((l, i) => ctx.fillText(l, 104, cy + 44 + i * 42));

  // 지수
  const statsY = 1110;
  ctx.strokeStyle = 'rgba(227,192,123,0.24)';
  ctx.beginPath();
  ctx.moveTo(104, statsY - 84);
  ctx.lineTo(W - 104, statsY - 84);
  ctx.stroke();

  scores.forEach(([label, value], i) => {
    const x = 104 + i * 292;
    ctx.fillStyle = goldGrad;
    ctx.font = `500 50px ${SERIF}`;
    ctx.fillText(String(value), x, statsY);
    ctx.fillStyle = 'rgba(246,238,224,0.68)';
    ctx.font = `400 22px ${SANS}`;
    drawTracked(ctx, label, x, statsY + 36, 4);
    ctx.fillStyle = 'rgba(246,238,224,0.14)';
    ctx.beginPath();
    ctx.roundRect(x, statsY + 56, 232, 5, 2.5);
    ctx.fill();
    ctx.fillStyle = 'rgba(227,192,123,0.95)';
    ctx.beginPath();
    ctx.roundRect(x, statsY + 56, (232 * value) / 100, 5, 2.5);
    ctx.fill();
  });

  // 푸터
  ctx.strokeStyle = 'rgba(227,192,123,0.24)';
  ctx.beginPath();
  ctx.moveTo(104, H - 152);
  ctx.lineTo(W - 104, H - 152);
  ctx.stroke();

  ctx.fillStyle = 'rgba(246,238,224,0.68)';
  ctx.font = `400 24px ${SANS}`;
  ctx.fillText(
    `${chart.solarText}  ·  ${chart.timeText.replace(' (정오 기준)', '')}  ·  ${chart.fiveElements}`,
    104,
    H - 100,
  );

  ctx.fillStyle = 'rgba(227,192,123,0.92)';
  ctx.font = `500 24px ${SERIF}`;
  drawTracked(ctx, '자미원 紫微垣', W - 104, H - 102, 4, 'right');

  return canvas.toDataURL('image/png');
}

/* --------------------------------------------------------------- character */
async function renderCharacter(chart: ChartModel): Promise<string> {
  /* 캐릭터 테마는 '쉬운 말 + 존댓말' 문장(content-casual)을 씁니다. */
  const profile = profileOf(chart.primaryStar, 'casual');
  const v = starVisual(chart.primaryStar);
  const scores: Array<[string, number]> = [
    ['연애의 별', palaceScore(chart.palaces.find((p) => p.name === '부처궁'))],
    ['금전의 별', palaceScore(chart.palaces.find((p) => p.name === '재백궁'))],
    ['일의 별', palaceScore(chart.palaces.find((p) => p.name === '관록궁'))],
  ];

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');

  /* 1. 주성 고유 배경 */
  const bg = ctx.createLinearGradient(0, 0, W * 0.7, H);
  bg.addColorStop(0, v.bg[0]);
  bg.addColorStop(0.52, v.bg[1]);
  bg.addColorStop(1, v.bg[2]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 위에서 아래로 번지는 빛 — 원형 경계가 보이지 않게 세로 그라데이션으로 얹는다
  const auraTop = ctx.createLinearGradient(0, 40, 0, 820);
  auraTop.addColorStop(0, v.aura.replace(/[\d.]+\)$/, '0.5)'));
  auraTop.addColorStop(0.5, v.aura.replace(/[\d.]+\)$/, '0.12)'));
  auraTop.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = auraTop;
  ctx.fillRect(0, 0, W, H);

  const auraBottom = ctx.createRadialGradient(W * 0.2, H * 0.94, 30, W * 0.2, H * 0.94, 620);
  auraBottom.addColorStop(0, v.aura2);
  auraBottom.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = auraBottom;
  ctx.fillRect(0, 0, W, H);

  /* 2. 성좌 배경 */
  for (let i = 0; i < 210; i++) {
    const x = (i * 173.3 + (i % 9) * 11) % W;
    const y = (i * 241.7 + (i % 5) * 17) % H;
    const r = i % 13 === 0 ? 2.4 : i % 5 === 0 ? 1.5 : 0.9;
    ctx.fillStyle = i % 4 === 0 ? hexToRgba(v.accent, 0.28 + ((i * 7) % 40) / 100) : `rgba(255,255,255,${0.14 + ((i * 11) % 42) / 100})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 성좌 연결선 — 위·아래 띠에 흩어진 별을 잇는다
  const constellation: Array<[number, number]> = [];
  for (let i = 0; i < 9; i++) {
    const a = (i * 2.3 + chart.primaryStar.length) % (Math.PI * 2);
    constellation.push([W / 2 + Math.cos(a) * (300 + (i % 3) * 90), 300 + Math.sin(a) * (240 + (i % 4) * 60)]);
  }
  ctx.strokeStyle = hexToRgba(v.accent, 0.22);
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  constellation.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.stroke();

  /* 3. 주성 문양 워터마크 */
  drawStarEmblem(ctx, chart.primaryStar, {
    cx: W / 2,
    cy: 400,
    size: 660,
    color: v.accent,
    fillAlpha: 0.07,
    strokeAlpha: 0.22,
    lineWidth: 1.6,
  });

  /* 4. 금박·라벤더 프레임 */
  const frameGrad = ctx.createLinearGradient(0, 0, W, H);
  frameGrad.addColorStop(0, v.frame);
  frameGrad.addColorStop(0.5, hexToRgba(v.accent, 0.45));
  frameGrad.addColorStop(1, v.frame);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 24;
  ctx.strokeStyle = frameGrad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(38, 38, W - 76, H - 76, 34);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = hexToRgba(v.accent, 0.38);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(56, 56, W - 112, H - 112, 24);
  ctx.stroke();

  // 모서리 장식 (금박 ㄱ자 + 다이아)
  ctx.strokeStyle = frameGrad;
  ctx.lineWidth = 2.4;
  const corner = (x: number, y: number, sx: number, sy: number) => {
    ctx.beginPath();
    ctx.moveTo(x + sx * 58, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + sy * 58);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + sx * 16, y + sy * 10);
    ctx.lineTo(x + sx * 10, y + sy * 16);
    ctx.stroke();
  };
  corner(38, 38, 1, 1);
  corner(W - 38, 38, -1, 1);
  corner(38, H - 38, 1, -1);
  corner(W - 38, H - 38, -1, -1);

  /* 5. 헤더 */
  ctx.fillStyle = hexToRgba(v.light, 0.92);
  ctx.font = `400 36px ${ROUND}`;
  drawTracked(ctx, '별의 속삭임', 108, 118, 2);
  ctx.fillStyle = hexToRgba(v.light, 0.95);
  ctx.font = `500 24px ${SANS}`;
  drawTracked(ctx, '별빛 가디언 · 12개 별방', W - 108, 117, 1.5, 'right');

  /* 6. 수호별 라벨 + 아치 창 */
  const archX = 300;
  const archW = 480;
  const archY = 148;
  const archH = 380;

  const halo = ctx.createRadialGradient(W / 2, archY + archH * 0.5, 40, W / 2, archY + archH * 0.5, 320);
  halo.addColorStop(0, v.aura);
  halo.addColorStop(0.45, v.aura.replace(/[\d.]+\)$/, '0.16)'));
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(W / 2 - 340, archY - 300, 680, archH + 420);

  const img = await loadImage(starVisual(chart.primaryStar).guardianImage, DEFAULT_GUARDIAN_IMAGE);
  if (img) {
    ctx.save();
    archPath(ctx, archX, archY, archW, archH);
    ctx.clip();
    const scale = Math.max(archW / img.width, archH / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    // 아치 창 세로 오프셋 — 0.28 이면 4:5 이미지 상단 약 9%가 잘려 왕관·귀 끝이 아치선에 닿았다.
    // 0.20 으로 낮춰 상단 여백을 살린다(하단은 배경 여백만 잘림).
    ctx.drawImage(img, archX + (archW - dw) / 2, archY + (archH - dh) * 0.2, dw, dh);
    // 창 안쪽 비네트
    const vig = ctx.createLinearGradient(0, archY + archH * 0.6, 0, archY + archH);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, hexToRgba(v.bg[2], 0.55));
    ctx.fillStyle = vig;
    ctx.fillRect(archX, archY, archW, archH);
    ctx.restore();

    ctx.strokeStyle = hexToRgba(v.light, 0.9);
    ctx.lineWidth = 4;
    archPath(ctx, archX, archY, archW, archH);
    ctx.stroke();

    ctx.strokeStyle = hexToRgba(v.accent, 0.8);
    ctx.lineWidth = 1.4;
    archPath(ctx, archX - 12, archY - 12, archW + 24, archH + 24);
    ctx.stroke();

    // 아치 창 아래 — 주성 전용 가디언 이름
    ctx.textAlign = 'center';
    ctx.fillStyle = hexToRgba(v.light, 0.94);
    ctx.font = `400 24px ${ROUND}`;
    drawTracked(ctx, `수호 가디언 · ${v.guardianName}`, W / 2, archY + archH - 34, 4, 'center');
  }

  // 아치 위 작은 문양
  drawStarEmblem(ctx, chart.primaryStar, {
    cx: W / 2,
    cy: archY - 4,
    size: 66,
    color: v.accent,
    fillAlpha: 0.9,
    strokeAlpha: 0.9,
    lineWidth: 2.4,
  });

  /* 7. 주성 이름 */
  ctx.textAlign = 'center';
  ctx.fillStyle = v.light;
  ctx.font = `700 100px ${SERIF}`;
  const nameText = `${chart.primaryStar}별`;
  ctx.fillText(nameText, W / 2, 652);

  ctx.fillStyle = hexToRgba(v.accent, 0.95);
  ctx.font = `500 30px ${SANS}`;
  drawTracked(ctx, `${STAR_HANJA[chart.primaryStar] ?? ''}  ·  ${v.mood}`, W / 2, 690, 3, 'center');

  /* 8. 한 줄 정체성 */
  ctx.fillStyle = hexToRgba(v.light, 0.94);
  ctx.font = `500 40px ${SERIF}`;
  const idLines = wrapText(ctx, `“${profile.identity}”`, W - 240).slice(0, 2);
  idLines.forEach((l, i) => ctx.fillText(l, W / 2, 752 + i * 46));

  /* 9. 키워드 칩 */
  ctx.font = `400 28px ${ROUND}`;
  const chipLabels = profile.keywords.slice(0, 3).map((k) => `✧ ${k}`);
  const chipSizes = chipLabels.map((l) => ctx.measureText(l).width + 52);
  const chipGap = 14;
  const totalChip = chipSizes.reduce((a, b) => a + b, 0) + chipGap * (chipLabels.length - 1);
  let chipX = (W - totalChip) / 2;
  const chipY = 776 + (idLines.length - 1) * 46;
  chipLabels.forEach((label, i) => {
    ctx.fillStyle = hexToRgba(v.light, 0.14);
    ctx.strokeStyle = hexToRgba(v.accent, 0.5);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(chipX, chipY, chipSizes[i], 52, 26);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = hexToRgba(v.light, 0.95);
    ctx.fillText(label, chipX + 26, chipY + 36);
    chipX += chipSizes[i] + chipGap;
  });

  /* 10. 지수 */
  const ruleY = chipY + 84;
  ctx.strokeStyle = hexToRgba(v.accent, 0.32);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(140, ruleY);
  ctx.lineTo(W - 140, ruleY);
  ctx.stroke();

  scores.forEach(([label, value], i) => {
    const x = 236 + i * 304;
    ctx.fillStyle = v.accent;
    ctx.font = `700 56px ${SERIF}`;
    ctx.fillText(String(value), x, ruleY + 74);
    ctx.fillStyle = hexToRgba(v.light, 0.8);
    ctx.font = `400 25px ${SANS}`;
    ctx.fillText(label, x, ruleY + 106);
    ctx.fillStyle = hexToRgba(v.light, 0.2);
    ctx.beginPath();
    ctx.roundRect(x - 70, ruleY + 120, 140, 5, 2.5);
    ctx.fill();
    ctx.fillStyle = hexToRgba(v.accent, 0.95);
    ctx.beginPath();
    ctx.roundRect(x - 70, ruleY + 120, (140 * value) / 100, 5, 2.5);
    ctx.fill();
  });

  /* 11. 강점 / 주의 */
  const blockY = ruleY + 160;
  ctx.strokeStyle = hexToRgba(v.accent, 0.32);
  ctx.beginPath();
  ctx.moveTo(140, blockY - 34);
  ctx.lineTo(W - 140, blockY - 34);
  ctx.stroke();

  const blocks: Array<[string, string, string]> = [
    ['이런 때 빛나요 ✦', profile.strength, hexToRgba(v.light, 0.94)],
    ['이건 조심하세요 ✧', profile.caution, hexToRgba(v.light, 0.8)],
  ];
  blocks.forEach(([label, text, tone], i) => {
    const x = 140 + i * 404;
    const maxW = 380;
    ctx.textAlign = 'left';
    ctx.fillStyle = i === 0 ? hexToRgba(v.accent, 0.95) : hexToRgba(v.light, 0.8);
    ctx.font = `500 25px ${SANS}`;
    drawTracked(ctx, label, x, blockY, 2);
    const fitted = fitText(ctx, text, maxW, i === 0 ? 3 : 3, [28, 26, 24], ROUND);
    ctx.fillStyle = tone;
    ctx.font = `400 ${fitted.size}px ${ROUND}`;
    fitted.lines.forEach((l, li) => ctx.fillText(l, x, blockY + 40 + li * 36));
  });

  /* 12. 푸터 */
  ctx.strokeStyle = hexToRgba(v.accent, 0.3);
  ctx.beginPath();
  ctx.moveTo(140, H - 120);
  ctx.lineTo(W - 140, H - 120);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = hexToRgba(v.light, 0.78);
  ctx.font = `400 26px ${SANS}`;
  ctx.fillText(`${chart.solarText} · ${chart.timeText.replace(' (정오 기준)', '')} · ${elementLight(chart.fiveElements)}`, 140, H - 74);

  ctx.textAlign = 'right';
  ctx.fillStyle = hexToRgba(v.accent, 0.95);
  ctx.font = `400 28px ${ROUND}`;
  ctx.fillText('별의 속삭임 ✦', W - 140, H - 74);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}

export async function renderShareCard(chart: ChartModel, theme: ThemeId = 'mystic'): Promise<string> {
  await ensureFonts();
  return theme === 'character' ? renderCharacter(chart) : renderMystic(chart);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
