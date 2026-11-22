/**
 * 2027 정미년 부적 카드 — 공통 디자인 사양 (amuletArt.ts)
 * ------------------------------------------------------------------
 * 화면(SVG, AmuletCard2027.tsx)과 저장 이미지(canvas, amuletCard.ts)가
 * 같은 팔레트·같은 문양 path 를 쓰도록 한 곳에 모았습니다.
 *
 *  - 한지 결 · 구름문(雲文) · 연꽃 메달리온 · 금박 이중 프레임 · 주름 장식
 *  - 캐릭터(별의 속삭임)  : 달빛 한지(아이보리·금박·연보라)
 *  - 미스틱(자미원)       : 밤 한지(먹빛 남색·금박·별자리 새김)
 */
import type { NewYear2027Content } from './newyear2027';
import { starVisual } from './starPalette';
import type { ThemeId } from './theme';

export type AmuletPalette = {
  /** 한지 바탕 (위 → 중앙 → 아래) */
  paper: [string, string, string];
  /** 위쪽에서 스며드는 빛 */
  paperGlow: string;
  /** 가장자리 어둡게(한지 눌린 결) */
  vignette: string;
  /** 금박 프레임 */
  frame: [string, string, string];
  frameSoft: string;
  /** 본문 잉크 */
  ink: string;
  inkSoft: string;
  inkFaint: string;
  /** 금박 글자 */
  gold: [string, string, string];
  goldSolid: string;
  /** 큰 한자(丁未) 전용 — 더 깊은 금박 */
  hanjaGold: [string, string, string];
  hanjaShadow: string;
  /** 전통 문양 선 */
  pattern: string;
  patternStrong: string;
  /** 메달리온 */
  medallionFill: string;
  medallionLine: string;
  /** 인장 */
  sealBg: string;
  sealLine: string;
  sealText: string;
  /** 한지 섬유 */
  fiber: string;
  /** 주성 기운 (테마별 강조) */
  accent: string;
  starWash: string;
  chipLine: string;
  chipFill: string;
  /** 카드 그림자 (화면용) */
  shadow: string;
};

/** 카드 좌표계 — 화면 SVG 는 540×810, 저장 이미지는 2배(1080×1620) */
export const CARD = { w: 540, h: 810, frame: 26, inner: 40, cx: 270 } as const;

/**
 * 카드 타이포·레이아웃 — 화면(SVG)과 저장 이미지(canvas)가 같은 자리·같은 크기로
 * 그리도록 한 곳에 모았습니다. 모바일 폭(≈350px)에서도 한글 본문이 바로 읽히도록
 * 한글 글자를 크게 잡고, 그만큼 丁未 메달리온을 줄였습니다.
 */
export const LAYOUT = {
  /** 브랜드 이름 (별의 속삭임 / 자미원) */
  brand: { y: 56, size: 26, tracking: 2.5 },
  /** 브랜드 옆 장식선 — 글자 폭에 맞춰 양옆에 붙습니다 */
  brandRule: { y: 47, edgeX: 52, diamondGap: 14, lineGap: 9, diamondR: 3 },
  eyebrow: { y: 80, size: 11, tracking: 3 },
  cloudBand: { y: 104 },
  /** 좌우 세로 한자 (명궁 주성 · 守護符) */
  side: { x: 46, ruleX: 62, size: 19, gap: 29 },
  /** 연꽃 메달리온 — 한글 자리를 내주고 줄였습니다 */
  medal: { cy: 222, r: 92, inner: 80, rayPad: 2, rayLen: 11 },
  hanja: { size: 76, up: -12, down: 62 },
  yearLine: { y: 368, size: 36, tracking: 1.4 },
  owner: { y: 400, size: 25 },
  star: { y: 426, size: 19 },
  chips: { y: 444, h: 40, font: 19, padX: 46, gap: 9, dotX: 19, dotR: 3.1, textX: 31, baseline: 26.6 },
  advice: { y: 514, size: 24, lh: 35, width: 456, maxLines: 3 },
  divider: { y: 610, inset: 64 },
  stoneLabel: { y: 632, size: 13, tracking: 1.8 },
  gem: { x: 146, y: 662, r: 18 },
  stoneName: { x: 180, y: 658, size: 21, maxWidth: 240 },
  stoneNote: { x: 180, y: 680, size: 17, maxWidth: 252 },
  seal: { x: 456, y: 664, box: 46, font: 26 },
  footer: {
    lineY: 700,
    x0: 54,
    x1: 486,
    textY: 720,
    size: 15,
    brandSize: 15,
    disclaimerY: 744,
    disclaimerY2: 762,
    disclaimerSize: 14,
  },
} as const;

/** 丁未 글자를 담는 연꽃 메달리온 */
export const MEDALLION = {
  cy: LAYOUT.medal.cy,
  r: LAYOUT.medal.r,
  inner: LAYOUT.medal.inner,
} as const;

const SERIF = '"Noto Serif KR", "Nanum Myeongjo", "Noto Serif CJK KR", Georgia, serif';
const SANS = 'Pretendard, "Noto Sans KR", "Noto Sans CJK KR", -apple-system, sans-serif';
const ROUND = '"Gowun Dodum", Pretendard, "Noto Sans KR", sans-serif';

export const AMULET_FONTS = { serif: SERIF, sans: SANS, round: ROUND };

export function amuletPalette(theme: ThemeId, star: string): AmuletPalette {
  const v = starVisual(star);
  if (theme === 'character') {
    return {
      paper: ['#fdf7ea', '#f7ecd8', '#eedcc0'],
      paperGlow: 'rgba(255,240,212,0.9)',
      vignette: 'rgba(138,104,62,0.26)',
      frame: ['#f4e1b2', '#b98a34', '#7d5718'],
      frameSoft: 'rgba(172,130,64,0.44)',
      ink: '#43304f',
      inkSoft: 'rgba(67,48,79,0.78)',
      inkFaint: 'rgba(67,48,79,0.54)',
      gold: ['#f8e6b6', '#b9892f', '#7a5315'],
      goldSolid: '#8a6323',
      hanjaGold: ['#f0d191', '#9c7024', '#5b3c0d'],
      hanjaShadow: 'rgba(120,86,30,0.14)',
      pattern: 'rgba(150,112,58,0.24)',
      patternStrong: 'rgba(150,112,58,0.48)',
      medallionFill: 'rgba(255,252,243,0.78)',
      medallionLine: 'rgba(185,143,66,0.46)',
      sealBg: '#9d3a33',
      sealLine: 'rgba(255,236,228,0.72)',
      sealText: '#fdeee6',
      fiber: 'rgba(150,112,58,0.12)',
      accent: v.accent,
      starWash: 'rgba(148,112,228,0.10)',
      chipLine: 'rgba(178,138,74,0.55)',
      chipFill: 'rgba(255,252,244,0.55)',
      shadow: '0 30px 62px -38px rgba(120,88,52,0.55)',
    };
  }
  return {
    paper: ['#17132a', '#0d0a17', '#1b1533'],
    paperGlow: 'rgba(112,90,190,0.42)',
    vignette: 'rgba(0,0,0,0.62)',
    frame: ['#f7e6b9', '#c9a35e', '#8f6a2a'],
    frameSoft: 'rgba(227,192,123,0.36)',
    ink: 'rgba(248,241,228,0.96)',
    inkSoft: 'rgba(246,238,224,0.70)',
    inkFaint: 'rgba(246,238,224,0.46)',
    gold: ['#fbf0d6', '#e3c07b', '#c19a56'],
    goldSolid: '#e3c07b',
    hanjaGold: ['#fff6e0', '#e8c68a', '#a8802f'],
    hanjaShadow: 'rgba(0,0,0,0.28)',
    pattern: 'rgba(227,192,123,0.17)',
    patternStrong: 'rgba(227,192,123,0.34)',
    medallionFill: 'rgba(255,255,255,0.04)',
    medallionLine: 'rgba(227,192,123,0.40)',
    sealBg: 'rgba(150,52,48,0.92)',
    sealLine: 'rgba(240,200,190,0.55)',
    sealText: '#fdeee6',
    fiber: 'rgba(255,250,238,0.055)',
    accent: v.accent,
    starWash: 'rgba(255,255,255,0.0)',
    chipLine: 'rgba(227,192,123,0.46)',
    chipFill: 'rgba(255,255,255,0.05)',
    shadow: '0 30px 64px -36px rgba(9,8,18,0.92)',
  };
}

/* ------------------------------------------------------------ 문양 path */
/* 둘 다 SVG path 문자열입니다. 화면은 <path d>, 저장 이미지는 new Path2D(d). */

/** 구름문 한 칸 (96 × 56, 기준선 y=44) — 타일로 이어 붙여 띠를 만듭니다. */
export const CLOUD_TILE = { w: 96, h: 56, base: 44 } as const;

export function cloudTilePaths(): string[] {
  const b = CLOUD_TILE.base;
  return [
    `M 0 ${b} H 4`,
    `M 4 ${b} A 22 22 0 0 1 48 ${b}`,
    `M 40 ${b} A 14 14 0 0 1 68 ${b}`,
    `M 74 ${b} H 96`,
    // 끝이 말려 올라간 구름 꼬리
    `M 68 ${b} C 81 ${b} 88 ${b - 7} 84 ${b - 15} C 80 ${b - 22} 69 ${b - 20} 69 ${b - 12}`,
    // 안쪽 잔물결
    `M 12 ${b - 10} C 18 ${b - 17} 29 ${b - 17} 35 ${b - 10}`,
    `M 46 ${b - 9} C 50 ${b - 14} 57 ${b - 14} 61 ${b - 9}`,
  ];
}

/** 구름 띠를 놓을 타일 위치와 투명도 — 양끝은 서서히 지워집니다 (화면·이미지 공용) */
export function cloudBandTiles(x0: number, x1: number): Array<{ x: number; alpha: number }> {
  const fade = 64;
  const out: Array<{ x: number; alpha: number }> = [];
  for (let x = x0 - 24; x < x1 - 8; x += CLOUD_TILE.w) {
    const a = Math.min(1, (x + CLOUD_TILE.w - x0) / fade, (x1 - x) / fade);
    out.push({ x, alpha: Math.max(0, Number(a.toFixed(3))) });
  }
  return out;
}

/** 모서리 장식 — (0,0) 모서리에서 안쪽(+x, +y)으로 뻗는 구름 덩굴 */
export function cornerMotifPaths(): string[] {
  return [
    `M 0 30 C 0 13 13 0 30 0`,
    `M 8 32 C 8 19 19 8 32 8`,
    `M 30 0 C 37 0 41 4 39 9 C 37 13 31 12 31 7`,
    `M 0 30 C 0 37 4 41 9 39 C 13 37 12 31 7 31`,
    `M 16 2 C 19 6 22 6 24 3`,
    `M 2 16 C 6 19 6 22 3 24`,
  ];
}

/** 방사형 빛살 — 메달리온 테두리 바깥 */
export function raysPath(cx: number, cy: number, r1: number, r2: number, count: number, offsetDeg = 0): string {
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = ((i * 360) / count + offsetDeg) * (Math.PI / 180);
    const long = i % 5 === 0;
    const outer = long ? r2 : r1 + (r2 - r1) * 0.55;
    parts.push(
      `M ${(cx + Math.cos(a) * r1).toFixed(2)} ${(cy + Math.sin(a) * r1).toFixed(2)} L ${(cx + Math.cos(a) * outer).toFixed(2)} ${(cy + Math.sin(a) * outer).toFixed(2)}`,
    );
  }
  return parts.join(' ');
}

/** 연꽃 꽃잎 고리 — 메달리온 안쪽 */
export function petalsPath(cx: number, cy: number, rIn: number, rOut: number, count: number): string {
  const parts: string[] = [];
  const rMid = rIn + (rOut - rIn) * 0.52;
  for (let i = 0; i < count; i++) {
    const a = (i * 2 * Math.PI) / count;
    const da = (Math.PI / count) * 0.62;
    const p = (r: number, ang: number) => {
      const x = cx + Math.cos(ang) * r;
      const y = cy + Math.sin(ang) * r;
      return `${x.toFixed(2)} ${y.toFixed(2)}`;
    };
    parts.push(
      `M ${p(rIn, a - da)} Q ${p(rMid, a - da * 0.55)} ${p(rOut, a)} Q ${p(rMid, a + da * 0.55)} ${p(rIn, a + da)}`,
    );
  }
  return parts.join(' ');
}

/** 안쪽 물결 테두리 (메달리온과 프레임 사이) */
export function scallopPath(cx: number, cy: number, r: number, count: number): string {
  const parts: string[] = [];
  const step = (2 * Math.PI) / count;
  for (let i = 0; i < count; i++) {
    const a1 = i * step;
    const a2 = (i + 1) * step;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    const x2 = cx + Math.cos(a2) * r;
    const y2 = cy + Math.sin(a2) * r;
    parts.push(`A ${(r * step * 0.62).toFixed(2)} ${(r * step * 0.62).toFixed(2)} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`);
    if (i === 0) parts.unshift(`M ${x1.toFixed(2)} ${y1.toFixed(2)}`);
  }
  return parts.join(' ');
}

/** 별자리 새김 (미스틱 테마) — 결정적(항상 같은) 좌표로 긋습니다 */
export function constellationPaths(): string {
  return [
    'M 78 150 L 104 132 L 132 146 L 126 176 L 96 182 Z',
    'M 104 132 L 96 182',
    'M 404 128 L 430 152 L 462 140',
    'M 430 152 L 424 184 L 452 196',
    'M 72 596 L 96 574 L 118 590',
    'M 96 574 L 104 546',
    'M 430 604 L 458 588 L 470 612',
    'M 458 588 L 452 560',
  ].join(' ');
}

/** 별자리 점 (미스틱 테마) */
export const CONSTELLATION_STARS: Array<[number, number, number]> = [
  [78, 150, 1.6],
  [104, 132, 2.2],
  [132, 146, 1.4],
  [126, 176, 1.8],
  [96, 182, 1.3],
  [404, 128, 1.5],
  [430, 152, 2.4],
  [462, 140, 1.4],
  [424, 184, 1.7],
  [452, 196, 1.3],
  [72, 596, 1.5],
  [96, 574, 2.1],
  [118, 590, 1.4],
  [104, 546, 1.6],
  [430, 604, 1.4],
  [458, 588, 2.0],
  [470, 612, 1.3],
  [452, 560, 1.5],
];

/* ------------------------------------------------- 별빛 고양이 초상 */
/**
 * '하온 + 오드아이 별빛 고양이'의 고양이 — 캐릭터 테마 카드 전용 표식.
 * 순백 털 · 왼쪽 사파이어 / 오른쪽 보라 오드아이 · 이마의 연보라 초승달을
 * 금박 이중 테두리의 작은 수호 초상으로 앉힙니다. (화면·저장 이미지 공용 좌표)
 */
export const CAT_PORTRAIT = {
  cx: 112,
  cy: 189,
  r: 30,
  /** 바깥 테두리 반지름 */
  ring: 4.2,
  url: `${import.meta.env.BASE_URL}art/haon-cat.webp`,
} as const;

/** 카드 전체에 뿌리는 별가루 — 결정적 좌표 (화면·이미지 공용) */
export function stardustDots(): Array<[number, number, number, number]> {
  const out: Array<[number, number, number, number]> = [];
  for (let i = 0; i < 90; i++) {
    const x = ((i * 137.5 + 23) % 500) + 20;
    const y = ((i * 197.3 + 47) % 760) + 25;
    const r = i % 13 === 0 ? 1.7 : i % 5 === 0 ? 1.1 : 0.7;
    const a = 0.14 + ((i * 17) % 40) / 100;
    out.push([Number(x.toFixed(1)), Number(y.toFixed(1)), r, Number(a.toFixed(2))]);
  }
  return out;
}

/** 한지 섬유 — 결정적 좌표 */
export function hanjiFibers(): Array<[number, number, number, number, number]> {
  const out: Array<[number, number, number, number, number]> = [];
  for (let i = 0; i < 60; i++) {
    const x = ((i * 89.7 + 31) % 480) + 30;
    const y = ((i * 151.3 + 67) % 730) + 40;
    const len = 6 + ((i * 7) % 16);
    const rot = ((i * 47) % 60) - 30;
    const a = 0.16 + ((i * 13) % 30) / 100;
    out.push([Number(x.toFixed(1)), Number(y.toFixed(1)), len, rot, Number(a.toFixed(2))]);
  }
  return out;
}

/* ------------------------------------------------------------- 카드 문구 */
export function amuletBrand(theme: ThemeId): string {
  return theme === 'character' ? '별의 속삭임' : '자미원';
}

export function amuletStarWord(theme: ThemeId): string {
  return theme === 'character' ? '별' : '성';
}

/** 카드 안에서 쓰는 문구 묶음 — 화면·이미지가 같은 말을 쓰도록 */
export function amuletLines(chart: { name: string; primaryStar: string }, content: NewYear2027Content, theme: ThemeId) {
  const starWord = amuletStarWord(theme);
  return {
    brand: amuletBrand(theme),
    eyebrow: '2027 NEW YEAR AMULET',
    yearLine: `${content.stemBranch}년 · ${content.animal}의 해`,
    owner: `${chart.name ? `${chart.name} 님의` : '나의'} 신년 부적`,
    star: `명궁 주성 · ${chart.primaryStar}${starWord}`,
    stoneLabel: '보완의 기운 · 수호 원석',
    stoneNote: `보완 · ${content.needLabel}`,
    footerDate: '2027. 1. 1 — 12. 31 · 소장용 부적',
    disclaimer: '효능을 보장하지 않는 소장용 콘텐츠입니다 · 의료·투자 판단의 근거가 아닙니다',
    /** 푸터 면책 문구 — 두 줄로 나눠 크게 읽히도록 */
    disclaimerLines: ['효능을 보장하지 않는 소장용 콘텐츠입니다', '의료·투자 판단의 근거가 아닙니다'] as string[],
    seal: '守',
    sideRight: '守護符',
  };
}

/* ------------------------------------------------------- 글자 폭·줄바꿈 */
/** 폰트 없이도 쓰는 글자 폭 추정 (한글·한자 1em, 라틴 0.52em, 공백 0.3em) */
export function charWidth(ch: string, size: number): number {
  const code = ch.codePointAt(0) ?? 0;
  if (code === 32 || code === 0x3000) return size * 0.3;
  if (code < 0x2e80) return size * 0.53;
  if (code >= 0x3000 && code <= 0x303f) return size * 0.5;
  return size;
}

export function estimateWidth(text: string, size: number): number {
  let total = 0;
  for (const ch of text) total += charWidth(ch, size);
  return total;
}

/**
 * 들어갈 자리보다 긴 글자는 기준 크기를 지키며 필요한 만큼만 줄입니다.
 */
export function fitFont(text: string, maxWidth: number, size: number): number {
  const w = estimateWidth(text, size);
  return w <= maxWidth ? size : Math.floor(size * (maxWidth / w) * 10) / 10;
}

/**
 * 조언 문구 배치 — 정해진 세 줄 안에 다 들어가도록 필요하면 글자를 줄입니다.
 */
export function adviceLayout(text: string) {
  let size: number = LAYOUT.advice.size;
  let lines = wrapByWidth(text, LAYOUT.advice.width, size, 12);
  while (lines.length > LAYOUT.advice.maxLines && size > 17) {
    size = Math.round((size - 0.5) * 10) / 10;
    lines = wrapByWidth(text, LAYOUT.advice.width, size, 12);
  }
  return { size, lines: lines.slice(0, LAYOUT.advice.maxLines) };
}

/**
 * 키워드 칩 배치 — 화면·이미지 공용. 글자 폭 추정식이 같으므로 칩 폭·시작점도 같습니다.
 * 칩 전체가 카드 폭을 넘으면 글자 크기를 함께 줄입니다.
 */
export function chipLayout(keywords: readonly string[]) {
  const maxWidth = CARD.w - 120;
  const widthOf = (size: number) => keywords.map((k) => estimateWidth(k, size) + LAYOUT.chips.padX);
  const sumOf = (widths: number[]) =>
    widths.reduce((a, b) => a + b, 0) + LAYOUT.chips.gap * Math.max(0, keywords.length - 1);

  let font: number = LAYOUT.chips.font;
  let widths = widthOf(font);
  let total = sumOf(widths);
  if (total > maxWidth) {
    font = Math.floor(font * (maxWidth / total) * 10) / 10;
    widths = widthOf(font);
    total = sumOf(widths);
  }
  return { font, widths, total, startX: CARD.cx - total / 2 };
}

/** 카드 안 문장 줄바꿈 — 화면과 저장 이미지가 같은 줄에서 끊기도록 같은 추정식을 씁니다. */
export function wrapByWidth(text: string, maxWidth: number, size: number, maxLines = 3): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  let lineW = 0;
  for (const word of words) {
    const w = estimateWidth(word, size);
    const space = line ? charWidth(' ', size) : 0;
    if (line && lineW + space + w > maxWidth) {
      lines.push(line);
      line = word;
      lineW = w;
      if (lines.length === maxLines) break;
    } else {
      line = line ? `${line} ${word}` : word;
      lineW += space + w;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  return lines.slice(0, maxLines);
}
