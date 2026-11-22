/**
 * 2027 정미년 신년 부적 카드 (amuletCard.ts)
 * ------------------------------------------------------------------
 * 브라우저 canvas 로 1080×1620 PNG 를 그립니다. (스토리·세로 저장용)
 *
 * 화면 카드(AmuletCard2027.tsx, SVG)와 같은 팔레트·문양 path·LAYOUT 좌표
 * (amuletArt.ts)를 씁니다. 한지 결 · 구름문 · 연꽃 메달리온 · 금박 이중 프레임 ·
 * 인장이 화면과 저장 이미지에서 같은 자리에 놓입니다.
 *
 * - 캐릭터(별의 속삭임) : 달빛 한지(아이보리·금박·연보라)
 * - 미스틱(자미원)       : 밤 한지(먹빛 남색·금박·별자리 새김)
 */
import type { ChartModel } from './chart';
import type { NewYear2027Content } from './newyear2027';
import { drawStarEmblem, starVisual } from './starPalette';
import { STAR_HANJA } from './terms';
import type { ThemeId } from './theme';
import {
  AMULET_FONTS,
  CARD,
  CAT_PORTRAIT,
  CONSTELLATION_STARS,
  LAYOUT,
  adviceLayout,
  amuletLines,
  amuletPalette,
  chipLayout,
  cloudBandTiles,
  cloudTilePaths,
  constellationPaths,
  cornerMotifPaths,
  estimateWidth,
  fitFont,
  hanjiFibers,
  petalsPath,
  raysPath,
  scallopPath,
  stardustDots,
} from './amuletArt';

const { w: CW, h: CH, cx: CX } = CARD;
/** 카드 좌표(540×810) → 저장 이미지(1080×1620) 배율 */
const S = 2;
const W = CW * S;
const H = CH * S;

const { serif: SERIF, sans: SANS, round: ROUND } = AMULET_FONTS;
const { medal, chips, advice, stoneLabel, gem, stoneName, stoneNote, seal, footer, side, hanja } = LAYOUT;
const CY = medal.cy;

async function ensureFonts() {
  const specs = [
    `700 ${hanja.size}px ${SERIF}`,
    `600 ${LAYOUT.yearLine.size}px ${SERIF}`,
    `600 ${LAYOUT.brand.size}px ${SERIF}`,
    `600 ${stoneName.size}px ${SERIF}`,
    `500 ${LAYOUT.owner.size}px ${SERIF}`,
    `400 ${advice.size}px ${SERIF}`,
    `600 ${footer.brandSize}px ${SERIF}`,
    `400 ${stoneNote.size}px ${SANS}`,
    `500 ${stoneLabel.size}px ${SANS}`,
    `400 ${LAYOUT.star.size}px ${SANS}`,
    `400 ${footer.size}px ${SANS}`,
    `400 ${footer.disclaimerSize}px ${SANS}`,
    `400 ${chips.font}px ${ROUND}`,
  ];
  const sample = '별의 속삭임 자미원 정미년 붉은 양 신년 부적 수호 원석 회복 지혜 丁未 2027';
  try {
    await Promise.all(specs.map((s) => document.fonts.load(s, sample).catch(() => undefined)));
    await document.fonts.ready;
  } catch {
    /* 폰트를 못 받으면 시스템 폰트로 그립니다 */
  }
}

/** 글자 사이를 띄워 그립니다 (자간). */
function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  align: 'left' | 'right' | 'center' = 'left',
) {
  let total = 0;
  for (const ch of text) total += ctx.measureText(ch).width + tracking;
  total -= tracking;
  let cursor = align === 'right' ? x - total : align === 'center' ? x - total / 2 : x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + tracking;
  }
}

function path2d(d: string): Path2D {
  return new Path2D(d);
}

/** 카드 안에서 쓰는 이미지 로더 (초상·문양) */
function loadImageAsset(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지를 불러오지 못했습니다: ${src}`));
    img.src = src;
  });
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export async function renderAmulet2027(
  chart: ChartModel,
  content: NewYear2027Content,
  theme: ThemeId = 'character',
): Promise<string> {
  await ensureFonts();

  const p = amuletPalette(theme, chart.primaryStar);
  const v = starVisual(chart.primaryStar);
  const L = amuletLines(chart, content, theme);
  const isMystic = theme === 'mystic';

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  ctx.scale(S, S);

  /* 1. 한지 바탕 */
  const paper = ctx.createLinearGradient(0, 0, CW * 0.22, CH);
  paper.addColorStop(0, p.paper[0]);
  paper.addColorStop(0.52, p.paper[1]);
  paper.addColorStop(1, p.paper[2]);
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, CW, CH);

  const glow = ctx.createRadialGradient(CX, 170, 0, CX, 170, 330);
  glow.addColorStop(0, p.paperGlow);
  glow.addColorStop(1, isMystic ? 'rgba(112,90,190,0)' : 'rgba(255,240,214,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CW, CH);

  const wash = ctx.createRadialGradient(430, 650, 0, 430, 650, 260);
  wash.addColorStop(0, p.starWash);
  wash.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CW, CH);

  /* 한지 섬유 */
  ctx.lineCap = 'round';
  hanjiFibers().forEach(([x, y, len, rot, a]) => {
    ctx.strokeStyle = p.fiber;
    ctx.globalAlpha = Math.min(0.55, a * 1.6);
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + len * Math.tan((rot * Math.PI) / 180));
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  /* 미스틱 — 별자리 새김 */
  if (isMystic) {
    ctx.strokeStyle = p.pattern;
    ctx.lineWidth = 0.7;
    ctx.lineJoin = 'round';
    ctx.stroke(path2d(constellationPaths()));
    CONSTELLATION_STARS.forEach(([x, y, r]) => {
      ctx.fillStyle = p.gold[1];
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  /* 별빛 고양이 수호 초상 — 캐릭터 테마 (화면 SVG 와 같은 자리·같은 반지름) */
  if (!isMystic) {
    try {
      const img = await loadImageAsset(CAT_PORTRAIT.url);
      const { cx: px, cy: py, r: pr, ring } = CAT_PORTRAIT;
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, pr + ring + 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,252,243,0.5)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.clip();
      const scale = Math.max((pr * 2) / img.width, (pr * 2) / img.height);
      const iw = img.width * scale;
      const ih = img.height * scale;
      ctx.globalAlpha = 0.94;
      ctx.drawImage(img, px - iw / 2, py - ih / 2, iw, ih);
      ctx.globalAlpha = 1;
      const shade = ctx.createRadialGradient(px, py - 10, 0, px, py - 10, pr * 1.4);
      shade.addColorStop(0.55, 'rgba(253,247,234,0)');
      shade.addColorStop(1, 'rgba(253,247,234,0.34)');
      ctx.fillStyle = shade;
      ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
      ctx.restore();

      ctx.strokeStyle = '#e9d8b4';
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = p.frame[1];
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(px, py, pr + ring, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } catch {
      /* 초상을 못 불러와도 부적은 그대로 그립니다 */
    }
  }

  /* 별가루 */
  stardustDots().forEach(([x, y, r, a], i) => {
    ctx.fillStyle = i % 4 === 0 ? p.gold[1] : isMystic ? 'rgba(255,250,238,1)' : '#fffdf6';
    ctx.globalAlpha = isMystic ? Math.min(0.95, a + 0.1) : a;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  /* 2. 구름 띠 — 타일을 직접 배치 (화면 카드와 같은 자리·같은 투명도) */
  const bandY = LAYOUT.cloudBand.y;
  const bandBase = isMystic ? 0.95 : 0.9;
  ctx.strokeStyle = p.pattern;
  ctx.lineWidth = 0.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  cloudBandTiles(46, CW - 46).forEach(({ x, alpha }) => {
    if (alpha <= 0.02) return;
    ctx.save();
    ctx.translate(x, bandY);
    ctx.globalAlpha = alpha * bandBase;
    cloudTilePaths().forEach((d) => ctx.stroke(path2d(d)));
    ctx.restore();
  });
  ctx.globalAlpha = 1;

  /* 3. 가장자리 눌린 결 */
  const vig = ctx.createRadialGradient(CX, 405, 275, CX, 405, 520);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, p.vignette);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, CW, CH);

  /* 4. 금박 이중 프레임 */
  const frameGrad = ctx.createLinearGradient(0, 0, CW, CH);
  frameGrad.addColorStop(0, p.frame[0]);
  frameGrad.addColorStop(0.46, p.frame[1]);
  frameGrad.addColorStop(1, p.frame[2]);

  ctx.save();
  ctx.shadowColor = isMystic ? 'rgba(0,0,0,0.5)' : 'rgba(120,88,44,0.28)';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = frameGrad;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(22, 22, CW - 44, CH - 44, 18);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = p.frameSoft;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(30, 30, CW - 60, CH - 60, 13);
  ctx.stroke();

  ctx.lineWidth = 0.4;
  ctx.setLineDash([1, 5]);
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.roundRect(36, 36, CW - 72, CH - 72, 10);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  /* 모서리 구름 장식 */
  const corners: Array<[number, number, number, number]> = [
    [32, 32, 1, 1],
    [CW - 32, 32, -1, 1],
    [32, CH - 32, 1, -1],
    [CW - 32, CH - 32, -1, -1],
  ];
  ctx.strokeStyle = frameGrad;
  ctx.lineWidth = 1.3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  corners.forEach(([x, y, sx, sy]) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    cornerMotifPaths().forEach((d) => ctx.stroke(path2d(d)));
    ctx.restore();
  });

  /* 5. 머리글 */
  const brandW =
    estimateWidth(L.brand, LAYOUT.brand.size) + LAYOUT.brand.tracking * Math.max(0, L.brand.length - 1);
  const diamondLeft = CX - brandW / 2 - LAYOUT.brandRule.diamondGap;
  const diamondRight = CX + brandW / 2 + LAYOUT.brandRule.diamondGap;

  ctx.strokeStyle = p.frameSoft;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(LAYOUT.brandRule.edgeX, LAYOUT.brandRule.y);
  ctx.lineTo(diamondLeft - LAYOUT.brandRule.lineGap, LAYOUT.brandRule.y);
  ctx.moveTo(diamondRight + LAYOUT.brandRule.lineGap, LAYOUT.brandRule.y);
  ctx.lineTo(CW - LAYOUT.brandRule.edgeX, LAYOUT.brandRule.y);
  ctx.stroke();

  const diamond = (x: number, y: number, r: number, fill: string) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = fill;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  };
  diamond(diamondLeft, LAYOUT.brandRule.y, LAYOUT.brandRule.diamondR, p.gold[1]);
  diamond(diamondRight, LAYOUT.brandRule.y, LAYOUT.brandRule.diamondR, p.gold[1]);

  const goldText = ctx.createLinearGradient(0, 62, 0, 100);
  goldText.addColorStop(0, p.gold[0]);
  goldText.addColorStop(0.46, p.gold[1]);
  goldText.addColorStop(1, p.gold[2]);

  ctx.fillStyle = p.ink;
  ctx.font = `600 ${LAYOUT.brand.size}px ${SERIF}`;
  ctx.textAlign = 'center';
  drawTracked(ctx, L.brand, CX, LAYOUT.brand.y, LAYOUT.brand.tracking, 'center');

  ctx.fillStyle = p.goldSolid;
  ctx.font = `400 ${LAYOUT.eyebrow.size}px ${SANS}`;
  drawTracked(ctx, L.eyebrow, CX, LAYOUT.eyebrow.y, LAYOUT.eyebrow.tracking, 'center');

  /* 6. 세로 한자 — 왼쪽: 명궁 주성 / 오른쪽: 守護符 */
  const starHanja = (STAR_HANJA[chart.primaryStar] ?? '').split('').slice(0, 2);
  const sideRight = L.sideRight.split('');
  const sideY = (count: number, i: number) => CY - ((count - 1) * side.gap) / 2 + i * side.gap;

  ctx.fillStyle = p.gold[1];
  ctx.globalAlpha = 0.9;
  ctx.font = `400 ${side.size}px ${SERIF}`;
  ctx.textAlign = 'center';
  starHanja.forEach((ch, i) => ctx.fillText(ch, side.x, sideY(starHanja.length, i)));
  sideRight.forEach((ch, i) => ctx.fillText(ch, CW - side.x, sideY(sideRight.length, i)));
  ctx.globalAlpha = 1;

  ctx.strokeStyle = p.frameSoft;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(side.ruleX, sideY(starHanja.length, 0) - 16);
  ctx.lineTo(side.ruleX, sideY(starHanja.length, starHanja.length - 1) + 12);
  ctx.moveTo(CW - side.ruleX, sideY(sideRight.length, 0) - 16);
  ctx.lineTo(CW - side.ruleX, sideY(sideRight.length, sideRight.length - 1) + 12);
  ctx.stroke();
  ctx.globalAlpha = 1;

  /* 7. 연꽃 메달리온 */
  const cy = CY;
  ctx.strokeStyle = p.medallionLine;
  ctx.lineWidth = 0.9;
  ctx.stroke(path2d(raysPath(CX, cy, medal.r + medal.rayPad, medal.r + medal.rayLen, 72)));

  const medalFill = ctx.createRadialGradient(CX, cy - 40, 0, CX, cy - 40, medal.r + 24);
  medalFill.addColorStop(0, p.medallionFill);
  medalFill.addColorStop(1, isMystic ? 'rgba(255,255,255,0.02)' : 'rgba(252,244,228,0.9)');
  ctx.fillStyle = medalFill;
  ctx.beginPath();
  ctx.arc(CX, cy, medal.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = p.medallionLine;
  ctx.lineWidth = 1.3;
  ctx.stroke();

  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(CX, cy, medal.r - 7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = p.patternStrong;
  ctx.lineWidth = 0.8;
  ctx.stroke(path2d(petalsPath(CX, cy, medal.inner - 18, medal.r - 10, 14)));

  ctx.strokeStyle = p.pattern;
  ctx.lineWidth = 0.7;
  ctx.stroke(path2d(scallopPath(CX, cy, medal.inner - 30, 26)));
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(CX, cy, medal.inner - 32, 0, Math.PI * 2);
  ctx.stroke();

  /* 주성 문양 워터마크 */
  drawStarEmblem(ctx, chart.primaryStar, {
    cx: CX,
    cy,
    size: 150,
    color: v.accent,
    fillAlpha: isMystic ? 0.06 : 0.04,
    strokeAlpha: isMystic ? 0.12 : 0.08,
    lineWidth: 1.4,
  });

  /* 丁 未 — 금박 음각 */
  const hanjaGrad = ctx.createLinearGradient(0, cy - 66, 0, cy + 84);
  hanjaGrad.addColorStop(0, p.hanjaGold[0]);
  hanjaGrad.addColorStop(0.42, p.hanjaGold[1]);
  hanjaGrad.addColorStop(1, p.hanjaGold[2]);

  ctx.font = `700 ${hanja.size}px ${SERIF}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = p.hanjaShadow;
  ctx.fillText(content.hanja.charAt(0), CX + 0.8, cy + hanja.up + 1);
  ctx.fillText(content.hanja.charAt(1), CX + 0.8, cy + hanja.down + 1);
  ctx.fillStyle = hanjaGrad;
  ctx.fillText(content.hanja.charAt(0), CX, cy + hanja.up);
  ctx.fillText(content.hanja.charAt(1), CX, cy + hanja.down);

  /* 글자 양옆 장식 */
  ctx.strokeStyle = p.frameSoft;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(CX - 72, cy - 34);
  ctx.lineTo(CX - 54, cy - 34);
  ctx.moveTo(CX + 54, cy - 34);
  ctx.lineTo(CX + 72, cy - 34);
  ctx.moveTo(CX - 72, cy + 32);
  ctx.lineTo(CX - 54, cy + 32);
  ctx.moveTo(CX + 54, cy + 32);
  ctx.lineTo(CX + 72, cy + 32);
  ctx.stroke();

  /* 8. 해의 이름 */
  ctx.fillStyle = p.ink;
  ctx.font = `600 ${LAYOUT.yearLine.size}px ${SERIF}`;
  drawTracked(ctx, L.yearLine, CX, LAYOUT.yearLine.y, LAYOUT.yearLine.tracking, 'center');

  ctx.fillStyle = p.inkSoft;
  ctx.font = `500 ${LAYOUT.owner.size}px ${SERIF}`;
  ctx.fillText(L.owner, CX, LAYOUT.owner.y);

  ctx.fillStyle = p.inkSoft;
  ctx.font = `400 ${LAYOUT.star.size}px ${SANS}`;
  drawTracked(ctx, L.star, CX, LAYOUT.star.y, 0.6, 'center');

  /* 9. 키워드 칩 */
  const chip = chipLayout(content.keywords);
  ctx.font = `400 ${chip.font}px ${ROUND}`;
  const chipH = chips.h;
  content.keywords.forEach((k, i) => {
    const w = chip.widths[i];
    const x = chip.startX + chip.widths.slice(0, i).reduce((a, b) => a + b, 0) + chips.gap * i;
    ctx.fillStyle = p.chipFill;
    ctx.strokeStyle = p.chipLine;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(x, chips.y, w, chipH, chipH / 2);
    ctx.fill();
    ctx.stroke();
    diamond(x + chips.dotX, chips.y + chipH / 2, chips.dotR, p.gold[1]);
    ctx.fillStyle = p.ink;
    ctx.textAlign = 'left';
    ctx.fillText(k, x + chips.textX, chips.y + chips.baseline);
    ctx.textAlign = 'center';
  });

  /* 10. 조언 — 두세 줄 */
  ctx.fillStyle = p.ink;
  const adviceFit = adviceLayout(content.advice);
  ctx.font = `400 ${adviceFit.size}px ${SERIF}`;
  adviceFit.lines.forEach((line, i) => ctx.fillText(line, CX, advice.y + i * advice.lh));

  /* 11. 구분선 */
  ctx.strokeStyle = p.frameSoft;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(LAYOUT.divider.inset, LAYOUT.divider.y);
  ctx.lineTo(CX - 18, LAYOUT.divider.y);
  ctx.moveTo(CX + 18, LAYOUT.divider.y);
  ctx.lineTo(CW - LAYOUT.divider.inset, LAYOUT.divider.y);
  ctx.stroke();
  ctx.save();
  ctx.translate(CX, LAYOUT.divider.y);
  ctx.rotate(Math.PI / 4);
  ctx.strokeStyle = p.gold[1];
  ctx.lineWidth = 0.9;
  ctx.strokeRect(-4, -4, 8, 8);
  ctx.fillStyle = p.gold[1];
  ctx.beginPath();
  ctx.arc(0, 0, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* 12. 보완 기운 · 수호 원석 */
  ctx.fillStyle = p.goldSolid;
  ctx.font = `500 ${stoneLabel.size}px ${SANS}`;
  drawTracked(ctx, L.stoneLabel, CX, stoneLabel.y, stoneLabel.tracking, 'center');

  const gemR = gem.r;
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = ((-90 + i * 60) * Math.PI) / 180;
    return [gem.x + Math.cos(a) * gemR, gem.y + Math.sin(a) * gemR * 0.95] as [number, number];
  });
  const gemGrad = ctx.createRadialGradient(gem.x - 5, gem.y - 6, 0, gem.x - 5, gem.y - 6, gemR * 1.6);
  gemGrad.addColorStop(0, '#ffffff');
  gemGrad.addColorStop(0.38, content.stone.colorHex);
  gemGrad.addColorStop(1, isMystic ? 'rgba(8,6,14,0.96)' : 'rgba(86,64,38,0.94)');

  ctx.beginPath();
  hex.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = gemGrad;
  ctx.fill();
  ctx.strokeStyle = p.gold[1];
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = isMystic ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 0.45;
  ctx.beginPath();
  hex.forEach(([x, y]) => {
    ctx.moveTo(gem.x, gem.y);
    ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(gem.x, gem.y - gemR * 0.95);
  ctx.lineTo(hex[1][0], hex[1][1]);
  ctx.lineTo(gem.x, gem.y);
  ctx.lineTo(hex[5][0], hex[5][1]);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.fillStyle = p.ink;
  ctx.font = `600 ${fitFont(content.stone.name, stoneName.maxWidth, stoneName.size)}px ${SERIF}`;
  ctx.fillText(content.stone.name, stoneName.x, stoneName.y);
  ctx.fillStyle = p.inkSoft;
  ctx.font = `400 ${fitFont(L.stoneNote, stoneNote.maxWidth, stoneNote.size)}px ${SANS}`;
  ctx.fillText(L.stoneNote, stoneNote.x, stoneNote.y);
  ctx.textAlign = 'center';

  /* 13. 인장 */
  ctx.save();
  ctx.translate(seal.x, seal.y);
  ctx.rotate((-5 * Math.PI) / 180);
  ctx.fillStyle = p.sealBg;
  ctx.beginPath();
  ctx.roundRect(-seal.box / 2, -seal.box / 2, seal.box, seal.box, 4);
  ctx.fill();
  ctx.strokeStyle = p.sealLine;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.roundRect(-seal.box / 2 + 4, -seal.box / 2 + 4, seal.box - 8, seal.box - 8, 2.5);
  ctx.stroke();
  ctx.fillStyle = p.sealText;
  ctx.font = `700 ${seal.font}px ${SERIF}`;
  ctx.textAlign = 'center';
  ctx.fillText(L.seal, 0, 9);
  ctx.restore();

  /* 14. 푸터 */
  ctx.strokeStyle = p.frameSoft;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(footer.x0, footer.lineY);
  ctx.lineTo(footer.x1, footer.lineY);
  ctx.stroke();

  ctx.fillStyle = p.inkSoft;
  ctx.font = `400 ${footer.size}px ${SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText(L.footerDate, footer.x0, footer.textY);

  ctx.fillStyle = goldText;
  ctx.font = `600 ${footer.brandSize}px ${SERIF}`;
  ctx.textAlign = 'right';
  drawTracked(ctx, L.brand, footer.x1, footer.textY, 1, 'right');

  ctx.textAlign = 'center';
  ctx.fillStyle = p.inkSoft;
  ctx.font = `400 ${footer.disclaimerSize}px ${SANS}`;
  ctx.fillText(L.disclaimerLines[0], CX, footer.disclaimerY);
  ctx.fillText(L.disclaimerLines[1], CX, footer.disclaimerY2);

  return canvas.toDataURL('image/png');
}

/** 카드 이미지를 저장합니다. */
export function downloadAmulet(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* hexToRgba 는 다른 카드(shareCard)와 같은 톤 보정에 쓸 수 있도록 남겨 둡니다. */
export { hexToRgba };
