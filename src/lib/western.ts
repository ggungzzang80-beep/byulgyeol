/**
 * 서양 점성술(출생 천궁도) 계산 엔진 (western.ts)
 * ------------------------------------------------------------------
 * 자미두수(동양)와 완전히 다른 체계임을 화면에서 분명히 나누기 위해,
 * 계산·해설·지수 모두 자미두수와 독립된 모듈로 둡니다.
 *
 * - 태양·달·수성~토성의 황경: Meeus 저정밀 급수 + JPL 근사 궤도요소(1800~2050)
 *   → 자리(사인) 판정에는 충분한 정밀도(오차 1° 이내)를 가집니다.
 * - 어센던트(상승궁)·MC: 지방 항성시 + 황도경사 공식
 * - 하우스: 어센던트 자리부터 사인 하나씩 = Whole Sign 하우스
 *   (출생지를 입력받지 않으므로 서울 좌표를 기본값으로 쓰고 화면에 명시합니다)
 */
import type { BirthInput, Gender } from './chart';
import { lunarToSolar } from './chart';

const D2R = Math.PI / 180;
const norm360 = (d: number) => ((d % 360) + 360) % 360;

export type Element = '불' | '흙' | '공기' | '물';

export type SignInfo = {
  index: number;
  name: string;
  glyph: string;
  en: string;
  element: Element;
  ruler: string;
  keyword: string;
  identity: string;
  love: string;
  money: string;
  work: string;
  shadow: string;
};

export const SIGNS: SignInfo[] = [
  {
    index: 0,
    name: '양자리',
    glyph: '♈',
    en: 'Aries',
    element: '불',
    ruler: '화성',
    keyword: '먼저 움직이는 사람',
    identity:
      '생각이 떠오르면 몸이 먼저 움직이는 사람입니다. 시작이 무섭지 않아서 늘 남들보다 반 발짝 앞에 서 있습니다.',
    love:
      '좋아하면 숨기지 못합니다. 연락도 고백도 빠르고, 상대가 망설이면 흥미가 식는 편입니다.',
    money: '돈이 들어오는 길은 새 일을 벌이는 쪽입니다. 대신 벌리는 만큼 씀씀이도 빠릅니다.',
    work: '혼자 끌고 가는 개척 업무에서 강합니다. 반복·정리 업무는 오래 못 버팁니다.',
    shadow: '급하게 결론 내고, 중간에 지루해하는 것.',
  },
  {
    index: 1,
    name: '황소자리',
    glyph: '♉',
    en: 'Taurus',
    element: '흙',
    ruler: '금성',
    keyword: '감각으로 확인하는 사람',
    identity:
      '말보다 감각을 믿는 사람입니다. 좋은 것과 아닌 것을 몸으로 먼저 알고, 한 번 정하면 쉽게 흔들리지 않습니다.',
    love: '천천히, 오래 봅니다. 스킨십과 함께하는 시간이 애정의 언어입니다.',
    money: '돈을 모으는 재주가 있습니다. 대신 맛있는 것·예쁜 것 앞에서는 지갑이 열립니다.',
    work: '결과물의 질을 끝까지 끌어올리는 일에 강합니다. 갑작스러운 변경은 힘들어합니다.',
    shadow: '익숙한 것에 머물다 기회를 놓치는 것.',
  },
  {
    index: 2,
    name: '쌍둥이자리',
    glyph: '♊',
    en: 'Gemini',
    element: '공기',
    ruler: '수성',
    keyword: '말과 정보로 연결되는 사람',
    identity:
      '궁금한 게 많고, 그것을 말로 바꾸는 속도가 빠릅니다. 사람과 사람 사이를 이어주는 자리에 자주 섭니다.',
    love: '대화가 곧 애정입니다. 말이 통하지 않으면 마음도 금방 멀어집니다.',
    money: '여러 갈래의 수입을 동시에 굴리는 쪽입니다. 대신 벌인 곳마다 관리가 필요합니다.',
    work: '기획·글·영업처럼 말과 정보를 다루는 일이 맞습니다.',
    shadow: '벌려놓고 마무리하지 못하는 것.',
  },
  {
    index: 3,
    name: '게자리',
    glyph: '♋',
    en: 'Cancer',
    element: '물',
    ruler: '달',
    keyword: '기억으로 사람을 품는 사람',
    identity:
      '정서의 기억이 오래 남는 사람입니다. 겉은 조용해도 안에서는 늘 누군가를 걱정하고 챙기고 있습니다.',
    love: '한번 마음을 열면 오래갑니다. 안전하다고 느끼는 사람에게만 진짜 모습을 보입니다.',
    money: '집·가족·안전과 연결된 지출이 많습니다. 비상금을 만들어 두면 마음이 놓입니다.',
    work: '돌봄·교육·조직의 살림을 맡는 자리에서 강합니다.',
    shadow: '서운함을 말하지 않고 쌓아두는 것.',
  },
  {
    index: 4,
    name: '사자자리',
    glyph: '♌',
    en: 'Leo',
    element: '불',
    ruler: '태양',
    keyword: '빛나야 움직이는 사람',
    identity:
      '자기 자신을 하나의 작품처럼 다듬는 사람입니다. 인정받을 때 힘이 나고, 무시당할 때 가장 크게 다칩니다.',
    love: '표현이 분명하고 시원합니다. 상대가 자기 자랑을 들어주면 마음이 열립니다.',
    money: '자기 관리와 취향에 쓰는 돈이 많습니다. 대신 그 감각이 수입으로 돌아오는 구조를 만들 수 있습니다.',
    work: '무대가 있는 일, 사람 앞에 서는 일에서 능력이 드러납니다.',
    shadow: '체면 때문에 손해를 감수하는 것.',
  },
  {
    index: 5,
    name: '처녀자리',
    glyph: '♍',
    en: 'Virgo',
    element: '흙',
    ruler: '수성',
    keyword: '고쳐서 완성하는 사람',
    identity:
      '디테일이 눈에 먼저 들어오는 사람입니다. 좋은 의미로는 정확하고, 나쁜 의미로는 스스로를 몰아붙입니다.',
    love: '챙겨주는 방식으로 사랑합니다. 말보다 실제 행동이 많은 편입니다.',
    money: '새는 돈을 정확히 찾아냅니다. 가계부·구독 정리에 강합니다.',
    work: '검토·분석·관리 업무에서 대체 불가능해집니다.',
    shadow: '완벽하지 않으면 시작도 못 하는 것.',
  },
  {
    index: 6,
    name: '천칭자리',
    glyph: '♎',
    en: 'Libra',
    element: '공기',
    ruler: '금성',
    keyword: '균형을 맞추는 사람',
    identity:
      '관계의 온도를 재는 감각이 뛰어난 사람입니다. 누구 편도 들지 않으려다 정작 자기 마음을 미루기도 합니다.',
    love: '함께 있는 시간과 예의를 중요하게 봅니다. 관계가 거칠어지면 가장 먼저 지칩니다.',
    money: '보기 좋은 소비에 약합니다. 대신 사람을 통해 돈이 들어오는 길이 열립니다.',
    work: '협상·중재·디자인처럼 균형이 필요한 일에 맞습니다.',
    shadow: '결정을 미루다 남의 기준에 맞춰버리는 것.',
  },
  {
    index: 7,
    name: '전갈자리',
    glyph: '♏',
    en: 'Scorpio',
    element: '물',
    ruler: '명왕성',
    keyword: '끝까지 파고드는 사람',
    identity:
      '얕게 넘어가지 못하는 사람입니다. 한 번 관심을 두면 속까지 알고 싶어 하고, 그래서 사람을 정확히 봅니다.',
    love: '신뢰가 전부입니다. 한 번 금이 가면 좀처럼 돌아오지 않습니다.',
    money: '남이 모르는 곳에서 자산을 키우는 데 능합니다. 공동 자금·투자 감각이 있습니다.',
    work: '조사·연구·위기 관리에서 강합니다.',
    shadow: '의심이 길어져 혼자 결론 내리는 것.',
  },
  {
    index: 8,
    name: '사수자리',
    glyph: '♐',
    en: 'Sagittarius',
    element: '불',
    ruler: '목성',
    keyword: '더 넓은 곳을 보는 사람',
    identity:
      '지금 자리보다 저 너머를 먼저 보는 사람입니다. 답답한 규칙보다는 스스로 납득할 수 있는 이유를 원합니다.',
    love: '구속을 싫어하고 함께 성장하는 관계를 원합니다. 거짓말은 가장 빨리 알아챕니다.',
    money: '배움과 여행에 쓰고, 그 경험이 다시 수입이 되는 구조를 만듭니다.',
    work: '교육·콘텐츠·해외·기획처럼 시야를 넓히는 일이 맞습니다.',
    shadow: '약속을 가볍게 여기고 시작만 많은 것.',
  },
  {
    index: 9,
    name: '염소자리',
    glyph: '♑',
    en: 'Capricorn',
    element: '흙',
    ruler: '토성',
    keyword: '쌓아서 증명하는 사람',
    identity:
      '감정보다 결과로 말하는 사람입니다. 남보다 늦게 출발해도 결국 가장 높은 곳에 서 있습니다.',
    love: '표현은 느리지만 책임은 확실합니다. 말보다 오래 곁에 있는 쪽입니다.',
    money: '계획적으로 모읍니다. 큰돈은 늘 계산서를 확인하고 움직입니다.',
    work: '조직·관리·장기 프로젝트에서 신뢰를 얻습니다.',
    shadow: '쉬지 못하고 모든 걸 혼자 감당하는 것.',
  },
  {
    index: 10,
    name: '물병자리',
    glyph: '♒',
    en: 'Aquarius',
    element: '공기',
    ruler: '천왕성',
    keyword: '남과 다른 각도로 보는 사람',
    identity:
      '모두가 당연하다고 할 때 "왜?"를 먼저 묻는 사람입니다. 가까운 사람보다 넓은 사람들과 더 잘 통합니다.',
    love: '친구 같은 관계를 원합니다. 감정보다 이해를 먼저 확인합니다.',
    money: '새로운 방식·기술·플랫폼에서 수입을 만듭니다.',
    work: '기술·연구·기획처럼 관성을 깨는 일이 맞습니다.',
    shadow: '가까운 사람의 감정을 뒤로 미루는 것.',
  },
  {
    index: 11,
    name: '물고기자리',
    glyph: '♓',
    en: 'Pisces',
    element: '물',
    ruler: '해왕성',
    keyword: '분위기를 읽는 사람',
    identity:
      '말 이전의 공기를 읽는 사람입니다. 그래서 사람들이 자주 이야기를 꺼내고, 대신 자기 경계를 잃기 쉽습니다.',
    love: '상대에게 스며듭니다. 좋아하면 상대의 하루를 다 알고 싶어 합니다.',
    money: '돈의 경계가 흐려지기 쉽습니다. 자동이체와 한도를 정해두면 훨씬 편해집니다.',
    work: '감성·치유·창작·서비스 업에서 강합니다.',
    shadow: '거절하지 못해 떠안는 것.',
  },
];

export const ELEMENT_MEANING: Record<Element, string> = {
  불: '불 — 밀어붙이는 힘과 열정',
  흙: '흙 — 감각과 현실 감각',
  공기: '공기 — 말과 정보, 연결',
  물: '물 — 감정과 직관',
};

const HOUSE_INFO: Array<{ title: string; desc: string }> = [
  { title: '1하우스 · 나', desc: '첫인상과 몸, 남들이 처음 만나는 나' },
  { title: '2하우스 · 돈', desc: '내가 버는 돈과 소유, 씀씀이' },
  { title: '3하우스 · 말', desc: '말과 글, 형제·이웃과의 왕래' },
  { title: '4하우스 · 집', desc: '집과 가족, 돌아갈 자리' },
  { title: '5하우스 · 연애', desc: '연애와 놀이, 창작' },
  { title: '6하우스 · 일상', desc: '일하는 방식과 루틴, 몸의 리듬' },
  { title: '7하우스 · 관계', desc: '연인·배우자·계약 상대' },
  { title: '8하우스 · 공유', desc: '공동 자금과 깊은 변화' },
  { title: '9하우스 · 배움', desc: '배움과 여행, 신념' },
  { title: '10하우스 · 커리어', desc: '직업과 평판, 사회적 자리' },
  { title: '11하우스 · 사람', desc: '네트워크와 희망, 함께하는 사람들' },
  { title: '12하우스 · 쉼', desc: '혼자만의 세계와 숨은 것' },
];

export type PlanetKey = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';

export const PLANET_INFO: Record<PlanetKey, { name: string; glyph: string; means: string }> = {
  sun: { name: '태양', glyph: '☉', means: '나의 중심과 의지' },
  moon: { name: '달', glyph: '☾', means: '감정과 안전 욕구' },
  mercury: { name: '수성', glyph: '☿', means: '말과 사고 방식' },
  venus: { name: '금성', glyph: '♀', means: '애정과 취향' },
  mars: { name: '화성', glyph: '♂', means: '추진력과 분노' },
  jupiter: { name: '목성', glyph: '♃', means: '확장과 행운' },
  saturn: { name: '토성', glyph: '♄', means: '책임과 제약' },
};

const PLANET_ORDER: PlanetKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

export type WesternPlanet = {
  key: PlanetKey;
  name: string;
  glyph: string;
  longitude: number;
  signIndex: number;
  signName: string;
  glyphSign: string;
  degreeInSign: number;
  house: number;
  retrograde: boolean;
};

export type WesternHouse = {
  index: number;
  title: string;
  desc: string;
  signIndex: number;
  signName: string;
  planets: string[];
};

export type WesternAspect = {
  a: string;
  b: string;
  type: string;
  angle: number;
  orb: number;
  tone: 'flow' | 'tense';
};

export type WesternModel = {
  name: string;
  gender: Gender;
  solarText: string;
  timeText: string;
  timeKnown: boolean;
  birthPlace: string;
  note?: string;
  sun: WesternPlanet;
  moon: WesternPlanet;
  rising: SignInfo;
  risingDegree: number;
  midheaven: SignInfo;
  planets: WesternPlanet[];
  houses: WesternHouse[];
  aspects: WesternAspect[];
  elements: Array<{ element: Element; count: number }>;
  indices: { love: number; money: number; work: number };
  dominantElement: Element;
  seed: number;
};

/* ----------------------------- 천문 계산 ----------------------------- */

function julianDay(year: number, month: number, day: number, hourUT: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5 +
    hourUT / 24
  );
}

function centuries(jd: number): number {
  return (jd - 2451545.0) / 36525;
}

/** 태양 겉보기 황경 (Meeus 저정밀) */
function sunLongitude(jd: number): number {
  const t = centuries(jd);
  const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const m = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m * D2R) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * m * D2R) +
    0.000289 * Math.sin(3 * m * D2R);
  const omega = 125.04 - 1934.136 * t;
  const apparent = l0 + c - 0.00569 - 0.00478 * Math.sin(omega * D2R);
  return norm360(apparent);
}

/** 달 황경 (Meeus 47장 축약) */
function moonLongitude(jd: number): number {
  const t = centuries(jd);
  const lp =
    218.3164477 +
    481267.88123421 * t -
    0.0015786 * t * t +
    (t * t * t) / 538841 -
    (t * t * t * t) / 65194000;
  const d =
    297.8501921 +
    445267.1114034 * t -
    0.0018819 * t * t +
    (t * t * t) / 545868;
  const m = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t;
  const mp =
    134.9633964 +
    477198.8675055 * t +
    0.0087414 * t * t +
    (t * t * t) / 69699;
  const f = 93.2720950 + 483202.0175233 * t - 0.0036539 * t * t;
  const lon =
    lp +
    6.289 * Math.sin(mp * D2R) +
    1.274 * Math.sin((2 * d - mp) * D2R) +
    0.658 * Math.sin(2 * d * D2R) +
    0.214 * Math.sin(2 * mp * D2R) -
    0.186 * Math.sin(m * D2R) -
    0.114 * Math.sin(2 * f * D2R) +
    0.059 * Math.sin((2 * d - 2 * mp) * D2R) +
    0.057 * Math.sin((2 * d - m - mp) * D2R) +
    0.053 * Math.sin((2 * d + mp) * D2R) +
    0.046 * Math.sin((2 * d - m) * D2R) -
    0.041 * Math.sin((m - mp) * D2R) -
    0.035 * Math.sin(d * D2R) -
    0.031 * Math.sin((m + mp) * D2R);
  return norm360(lon);
}

type Orbit = {
  a: number;
  e: number;
  i: number;
  l: number;
  peri: number;
  node: number;
  da: number;
  de: number;
  di: number;
  dl: number;
  dperi: number;
  dnode: number;
};

/** JPL 근사 궤도요소 (1800–2050) */
const ORBITS: Record<'earth' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn', Orbit> = {
  earth: { a: 1.00000261, e: 0.01671123, i: -0.00001531, l: 100.46457166, peri: 102.93768193, node: 0, da: 0.00000562, de: -0.00004392, di: -0.01294668, dl: 35999.37244981, dperi: 0.32327364, dnode: 0 },
  mercury: { a: 0.38709927, e: 0.20563593, i: 7.00497902, l: 252.2503235, peri: 77.45779628, node: 48.33076593, da: 0.00000037, de: 0.00001906, di: -0.00594749, dl: 149472.67411175, dperi: 0.16047689, dnode: -0.12534081 },
  venus: { a: 0.72333566, e: 0.00677672, i: 3.39467605, l: 181.9790995, peri: 131.60246718, node: 76.67984255, da: 0.0000039, de: -0.00004107, di: -0.0007889, dl: 58517.81538729, dperi: 0.00268329, dnode: -0.27769418 },
  mars: { a: 1.52371034, e: 0.0933941, i: 1.84969142, l: -4.55343205, peri: -23.94362959, node: 49.55953891, da: 0.00001847, de: 0.00007882, di: -0.00813131, dl: 19140.30268499, dperi: 0.44441088, dnode: -0.29257343 },
  jupiter: { a: 5.202887, e: 0.04838624, i: 1.30439695, l: 34.39644051, peri: 14.72847983, node: 100.47390909, da: -0.00011607, de: -0.00013253, di: -0.00183714, dl: 3034.74612775, dperi: 0.21252668, dnode: 0.20469106 },
  saturn: { a: 9.53667594, e: 0.05386179, i: 2.48599187, l: 49.95424423, peri: 92.59887831, node: 113.66242448, da: -0.0012506, de: -0.00050991, di: 0.00193609, dl: 1222.49362201, dperi: -0.41897216, dnode: -0.28867794 },
};

type Vec3 = { x: number; y: number; z: number };

function heliocentric(body: keyof typeof ORBITS, t: number): Vec3 {
  const o = ORBITS[body];
  const a = o.a + o.da * t;
  const e = o.e + o.de * t;
  const inc = (o.i + o.di * t) * D2R;
  const l = o.l + o.dl * t;
  const peri = o.peri + o.dperi * t;
  const node = (o.node + o.dnode * t) * D2R;
  const m = norm360(l - peri) * D2R;
  const omega = (peri - o.node - o.dnode * t) * D2R;

  let ecc = m;
  for (let k = 0; k < 8; k += 1) {
    ecc -= (ecc - e * Math.sin(ecc) - m) / (1 - e * Math.cos(ecc));
  }
  const xv = a * (Math.cos(ecc) - e);
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(ecc);

  // 궤도면 → 황도 좌표
  const cw = Math.cos(omega);
  const sw = Math.sin(omega);
  const cn = Math.cos(node);
  const sn = Math.sin(node);
  const ci = Math.cos(inc);
  const si = Math.sin(inc);

  return {
    x: (cw * cn - sw * sn * ci) * xv + (-sw * cn - cw * sn * ci) * yv,
    y: (cw * sn + sw * cn * ci) * xv + (-sw * sn + cw * cn * ci) * yv,
    z: sw * si * xv + cw * si * yv,
  };
}

function geocentricLongitude(body: Exclude<keyof typeof ORBITS, 'earth'>, jd: number): number {
  const t = centuries(jd);
  const e = heliocentric('earth', t);
  const p = heliocentric(body, t);
  return norm360(Math.atan2(p.y - e.y, p.x - e.x) / D2R);
}

function gmstDegrees(jd: number): number {
  const t = centuries(jd);
  return norm360(
    280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t - (t * t * t) / 38710000,
  );
}

/** 시진 index → 대표 시각(KST 정시) */
function hourFromIndex(timeIndex: number, known: boolean): number {
  if (!known) return 12;
  const map = [0.5, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 23.5];
  return map[Math.max(0, Math.min(12, timeIndex))] ?? 12;
}

const SEOUL = { lat: 37.5665, lon: 126.978 };

function signOf(longitude: number): SignInfo {
  return SIGNS[Math.floor(norm360(longitude) / 30) % 12];
}

function aspectOf(a: number, b: number): { type: string; angle: number; orb: number; tone: 'flow' | 'tense' } | null {
  const diff = Math.abs(((a - b) % 360 + 540) % 360 - 180);
  const table: Array<{ angle: number; type: string; orb: number; tone: 'flow' | 'tense' }> = [
    { angle: 0, type: '합', orb: 6, tone: 'flow' },
    { angle: 60, type: '육분', orb: 4, tone: 'flow' },
    { angle: 90, type: '사분', orb: 5, tone: 'tense' },
    { angle: 120, type: '삼분', orb: 5, tone: 'flow' },
    { angle: 180, type: '대립', orb: 6, tone: 'tense' },
  ];
  for (const t of table) {
    const orb = Math.abs(diff - t.angle);
    if (orb <= t.orb) return { type: t.type, angle: t.angle, orb: Number(orb.toFixed(1)), tone: t.tone };
  }
  return null;
}

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 100000;
}

const clampScore = (n: number) => Math.max(42, Math.min(96, Math.round(n)));

/* ------------------------------ 빌드 ------------------------------ */

export async function buildWestern(input: BirthInput): Promise<WesternModel> {
  let solar = { year: input.year, month: input.month, day: input.day };
  let note: string | undefined;

  if (input.calendar === 'lunar') {
    const converted = await lunarToSolar(input.year, input.month, input.day, input.isLeap);
    if (!converted) {
      throw new Error('음력 날짜를 양력으로 변환하지 못했습니다. 날짜를 확인해 주세요.');
    }
    solar = converted;
    note = '한국 음력 기준으로 양력으로 바꾼 뒤 천궁도를 계산했습니다.';
  }

  const localHour = hourFromIndex(input.timeIndex, input.timeKnown);
  const jd = julianDay(solar.year, solar.month, solar.day, localHour - 9); // KST → UT
  const t = centuries(jd);
  const eps = 23.439291 - 0.0130042 * t;

  const lst = norm360(gmstDegrees(jd) + SEOUL.lon);
  const ramc = lst * D2R;
  const ascLon = norm360(
    Math.atan2(
      Math.cos(ramc),
      -(Math.sin(ramc) * Math.cos(eps * D2R) + Math.tan(SEOUL.lat * D2R) * Math.sin(eps * D2R)),
    ) / D2R,
  );
  const mcLon = norm360(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps * D2R)) / D2R);

  const longitudes: Record<PlanetKey, number> = {
    sun: sunLongitude(jd),
    moon: moonLongitude(jd),
    mercury: geocentricLongitude('mercury', jd),
    venus: geocentricLongitude('venus', jd),
    mars: geocentricLongitude('mars', jd),
    jupiter: geocentricLongitude('jupiter', jd),
    saturn: geocentricLongitude('saturn', jd),
  };

  const ascSignIndex = Math.floor(ascLon / 30) % 12;

  const planets: WesternPlanet[] = PLANET_ORDER.map((key) => {
    const lon = longitudes[key];
    const signIndex = Math.floor(lon / 30) % 12;
    const house = ((signIndex - ascSignIndex + 12) % 12) + 1;
    return {
      key,
      name: PLANET_INFO[key].name,
      glyph: PLANET_INFO[key].glyph,
      longitude: lon,
      signIndex,
      signName: SIGNS[signIndex].name,
      glyphSign: SIGNS[signIndex].glyph,
      degreeInSign: Number((lon - signIndex * 30).toFixed(1)),
      house,
      retrograde: key !== 'sun' && key !== 'moon'
        ? (() => {
            const next = key === 'mercury' || key === 'venus' || key === 'mars' || key === 'jupiter' || key === 'saturn'
              ? geocentricLongitude(key, jd + 1)
              : lon;
            const diff = ((next - lon + 540) % 360) - 180;
            return diff < 0;
          })()
        : false,
    };
  });

  const byKey = Object.fromEntries(planets.map((p) => [p.key, p])) as Record<PlanetKey, WesternPlanet>;

  const houses: WesternHouse[] = HOUSE_INFO.map((info, i) => {
    const signIndex = (ascSignIndex + i) % 12;
    return {
      index: i + 1,
      title: info.title,
      desc: info.desc,
      signIndex,
      signName: SIGNS[signIndex].name,
      planets: planets.filter((p) => p.house === i + 1).map((p) => p.name),
    };
  });

  const aspects: WesternAspect[] = [];
  for (let i = 0; i < planets.length; i += 1) {
    for (let j = i + 1; j < planets.length; j += 1) {
      const found = aspectOf(planets[i].longitude, planets[j].longitude);
      if (found) {
        aspects.push({ a: planets[i].name, b: planets[j].name, ...found });
      }
    }
  }
  aspects.sort((a, b) => a.orb - b.orb);

  const elementCount: Record<Element, number> = { 불: 0, 흙: 0, 공기: 0, 물: 0 };
  planets.forEach((p) => {
    elementCount[SIGNS[p.signIndex].element] += 1;
  });
  elementCount[SIGNS[ascSignIndex].element] += 2; // 어센던트는 비중을 조금 더
  const elements = (Object.keys(elementCount) as Element[]).map((element) => ({
    element,
    count: elementCount[element],
  }));
  const dominantElement = elements.reduce((a, b) => (b.count > a.count ? b : a)).element;

  const venus = byKey.venus;
  const moon = byKey.moon;
  const jupiter = byKey.jupiter;
  const mars = byKey.mars;
  const saturn = byKey.saturn;
  const sun = byKey.sun;

  const love =
    50 +
    ([5, 7].includes(venus.house) ? 18 : [2, 8, 11].includes(venus.house) ? 10 : 0) +
    (SIGNS[venus.signIndex].element === SIGNS[ascSignIndex].element ? 7 : 0) +
    ([4, 7, 12].includes(moon.house) ? 5 : 0) +
    (aspects.some((a) => (a.a === '금성' && a.type === '삼분') || (a.b === '금성' && a.type === '삼분')) ? 6 : 0);

  const money =
    52 +
    ([2, 8, 11].includes(jupiter.house) ? 16 : [10, 5].includes(jupiter.house) ? 9 : 0) +
    ([2, 8].includes(venus.house) ? 8 : 0) +
    (saturn.house === 2 ? -6 : 0) +
    (aspects.some((a) => (a.a === '목성' && a.type === '사분') || (a.b === '목성' && a.type === '사분')) ? -4 : 4);

  const work =
    52 +
    ([10, 6].includes(mars.house) ? 14 : [1, 3].includes(mars.house) ? 8 : 0) +
    ([10, 6].includes(saturn.house) ? 11 : 0) +
    ([10, 6].includes(sun.house) ? 8 : 0) +
    (aspects.some((a) => (a.a === '화성' && a.b === '토성') || (a.b === '화성' && a.a === '토성')) ? -5 : 0);

  return {
    name: input.name.trim(),
    gender: input.gender,
    solarText: `${solar.year}. ${solar.month}. ${solar.day}.`,
    timeText: input.timeKnown
      ? `${String(Math.floor(localHour)).padStart(2, '0')}:${String(Math.round((localHour % 1) * 60)).padStart(2, '0')} (KST)`
      : '시간 모름 (정오 기준)',
    timeKnown: input.timeKnown,
    birthPlace: '서울 (37.57°N, 126.98°E)',
    note,
    sun,
    moon,
    rising: SIGNS[ascSignIndex],
    risingDegree: Number((ascLon - ascSignIndex * 30).toFixed(1)),
    midheaven: signOf(mcLon),
    planets,
    houses,
    aspects,
    elements,
    indices: { love: clampScore(love), money: clampScore(money), work: clampScore(work) },
    dominantElement,
    seed: hashSeed(`${solar.year}-${solar.month}-${solar.day}-${localHour}-${input.gender}-w`),
  };
}

/* ------------------------------ 해설 ------------------------------ */

export function westernHeadline(model: WesternModel): string {
  return `태양 ${model.sun.signName} · 달 ${model.moon.signName} · 어센던트 ${model.rising.name}`;
}

export function westernIdentityLines(model: WesternModel): string[] {
  const sunSign = SIGNS[model.sun.signIndex];
  const riseSign = SIGNS[model.rising.index];
  return [
    sunSign.identity,
    `겉으로 보이는 인상은 ${riseSign.name}의 결 — ${riseSign.keyword}. ${riseSign.identity.split('.')[0]}.`,
  ];
}

export function houseReading(model: WesternModel, house: WesternHouse): string {
  const sign = SIGNS[house.signIndex];
  const base = `${house.title}(${house.desc})에는 ${sign.name}의 ${sign.element} 기운이 놓입니다.`;
  if (!house.planets.length) {
    return `${base} 큰 행성은 없지만, 이 자리는 ${sign.keyword} 쪽으로 천천히 채워집니다.`;
  }
  const planetText = house.planets
    .map((name) => {
      const p = model.planets.find((x) => x.name === name);
      if (!p) return name;
      const means = PLANET_INFO[p.key].means;
      return `${name}(${means})`;
    })
    .join(', ');
  return `${base} 여기에 ${planetText}이(가) 앉아 이 영역이 삶에서 자주 다뤄집니다.`;
}

export function aspectText(a: WesternAspect): string {
  const tone =
    a.type === '합'
      ? '두 힘이 한 덩어리로 움직입니다. 강점이자 고집이 됩니다.'
      : a.type === '삼분' || a.type === '육분'
        ? '서로를 밀어주는 각도입니다. 자연스럽게 굴러갑니다.'
        : a.type === '대립'
          ? '정반대의 요구가 부딪힙니다. 균형을 잡으면 가장 큰 추진력이 됩니다.'
          : '마찰이 생기는 각도입니다. 억지로 누르기보다 순서를 나누면 풀립니다.';
  return `${a.a} · ${a.b} ${a.type}(${a.angle}°, 오브 ${a.orb}°) — ${tone}`;
}

export function planetOf(model: WesternModel, key: PlanetKey): WesternPlanet {
  return model.planets.find((p) => p.key === key)!;
}

export function indexHints(model: WesternModel): { love: string; money: string; work: string } {
  const venus = planetOf(model, 'venus');
  const jupiter = planetOf(model, 'jupiter');
  const mars = planetOf(model, 'mars');
  const saturn = planetOf(model, 'saturn');
  return {
    love: `금성 ${venus.signName} · ${venus.house}하우스, 달 ${model.moon.signName}로 계산`,
    money: `목성 ${jupiter.signName} · ${jupiter.house}하우스, 금성 ${venus.house}하우스로 계산`,
    work: `화성 ${mars.signName} · ${mars.house}하우스, 토성 ${saturn.house}하우스로 계산`,
  };
}
