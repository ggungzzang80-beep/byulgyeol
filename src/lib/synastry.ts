/**
 * 서양 점성술 시너스트리(Synastry) 궁합 엔진 (synastry.ts)
 * ------------------------------------------------------------------
 * 서양 점성술 동선의 두 사람 궁합입니다. 자미두수 궁합(content.ts의 compatibility)과는
 * 완전히 다른 계산입니다 — 명궁 주성이 아니라 '두 천궁도의 행성 교차 각'을 봅니다.
 *
 * 계산 기준
 * - 각 사람의 태양·달·수성·금성·화성·목성·토성 + 어센던트를 점(point)으로 세웁니다.
 * - A의 행성 × B의 행성을 모두 맞대어 주요 각(합 0° · 육분 60° · 사분 90° · 삼분 120° · 대립 180°)을 찾습니다.
 * - 행성 쌍마다 무게를 다르게 둡니다(달×달, 금성×화성, 태양×달이 가장 무겁습니다).
 * - 원소(불·흙·공기·물) 궁합과 세 축(감정의 온도 · 끌림의 세기 · 오래 가는 힘)으로 점수를 냅니다.
 * - 무료 프리뷰는 전체 각 중 가장 강한 흐름 1개와 가장 강한 마찰 1개만 엽니다(30%).
 */
import type { Element, PlanetKey, WesternModel } from './western';
import { PLANET_INFO, SIGNS } from './western';

const D2R = Math.PI / 180;
const norm360 = (d: number) => ((d % 360) + 360) % 360;

export type SynPointKey = PlanetKey | 'asc';

type Point = {
  key: SynPointKey;
  name: string;
  glyph: string;
  longitude: number;
  signIndex: number;
  signName: string;
  element: Element;
};

export type SynastryAspect = {
  /** 정렬된 행성 쌍 키 (예: 'moon-venus') */
  pair: string;
  a: Point;
  b: Point;
  type: string;
  angle: number;
  orb: number;
  tone: 'flow' | 'tense';
  /** 관계 점수에 미치는 영향(절댓값이 클수록 핵심) */
  influence: number;
  /** 이 각이 점수에 더한 값 (음수 = 마찰) */
  contribution: number;
  title: string;
  body: string;
};

export type SynastryModel = {
  a: WesternModel;
  b: WesternModel;
  nameA: string;
  nameB: string;
  score: number;
  /** 감정의 온도 */
  temperature: number;
  /** 끌림의 세기 */
  pull: number;
  /** 오래 가는 힘 */
  lasting: number;
  band: { label: string; line: string };
  element: {
    a: Element;
    b: Element;
    harmony: number;
    label: string;
    note: string;
  };
  /** 모든 교차 각 — 영향이 큰 순서 */
  aspects: SynastryAspect[];
  /** 무료 공개분 (가장 강한 흐름 1 + 가장 강한 마찰 1) */
  core: SynastryAspect[];
  /** 유료로 여는 나머지 */
  locked: SynastryAspect[];
  headline: string;
  oneLine: string;
  summary: string;
  dynamics: Array<{ title: string; body: string }>;
  conflicts: Array<{ title: string; body: string; fix: string }>;
  advice: string[];
  roles: { a: string; b: string };
};

/* ---------------------------- 점 세우기 ---------------------------- */

const POINT_WEIGHT: Record<SynPointKey, number> = {
  sun: 1,
  moon: 1,
  mercury: 0.62,
  venus: 0.95,
  mars: 0.85,
  jupiter: 0.48,
  saturn: 0.6,
  asc: 0.78,
};

const POINT_ORDER: SynPointKey[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'asc'];

function pointsOf(model: WesternModel): Point[] {
  const planets: Point[] = model.planets.map((p) => ({
    key: p.key,
    name: p.name,
    glyph: p.glyph,
    longitude: p.longitude,
    signIndex: p.signIndex,
    signName: p.signName,
    element: SIGNS[p.signIndex].element,
  }));
  const ascLon = norm360(model.rising.index * 30 + model.risingDegree);
  const asc: Point = {
    key: 'asc',
    name: '어센던트',
    glyph: 'ASC',
    longitude: ascLon,
    signIndex: model.rising.index,
    signName: model.rising.name,
    element: model.rising.element,
  };
  return [...planets, asc].sort(
    (x, y) => POINT_ORDER.indexOf(x.key) - POINT_ORDER.indexOf(y.key),
  );
}

/* ---------------------------- 각 찾기 ---------------------------- */

const ASPECT_TABLE: Array<{ angle: number; type: string; orb: number; tone: 'flow' | 'tense'; factor: number }> = [
  { angle: 0, type: '합', orb: 8, tone: 'flow', factor: 1 },
  { angle: 60, type: '육분', orb: 4, tone: 'flow', factor: 0.6 },
  { angle: 90, type: '사분', orb: 6, tone: 'tense', factor: -0.85 },
  { angle: 120, type: '삼분', orb: 6, tone: 'flow', factor: 0.95 },
  { angle: 180, type: '대립', orb: 8, tone: 'tense', factor: -0.6 },
];

function findAspect(a: number, b: number) {
  const diff = Math.abs((((a - b) % 360) + 540) % 360 - 180);
  for (const t of ASPECT_TABLE) {
    const orb = Math.abs(diff - t.angle);
    if (orb <= t.orb) {
      return {
        type: t.type,
        angle: t.angle,
        orb: Number(orb.toFixed(1)),
        tone: t.tone,
        factor: t.factor,
        maxOrb: t.orb,
      };
    }
  }
  return null;
}

const pairKey = (x: SynPointKey, y: SynPointKey) => [x, y].sort().join('-');

/** 행성 쌍마다 다른 무게 — 관계에서 실제로 크게 작동하는 조합을 더 무겁게 둡니다. */
const PAIR_BIAS: Record<string, number> = {
  'moon-moon': 1.4,
  'moon-sun': 1.35,
  'mars-venus': 1.55,
  'venus-venus': 1.25,
  'sun-sun': 1.2,
  'mercury-mercury': 1.15,
  'moon-venus': 1.2,
  'moon-saturn': 1.15,
  'saturn-sun': 1.1,
  'saturn-venus': 1.1,
  'asc-sun': 1.15,
  'asc-moon': 1.15,
  'asc-venus': 1.1,
  'mars-mars': 1.05,
  'mars-sun': 1.05,
  'mercury-moon': 1.05,
};

/* ------------------------- 각 해설 (행성 쌍) ------------------------- */

type Body = { title: string; flow: string; tense: string; tenseTitle?: string };

/** 각의 제목 — 마찰 각은 그 각에 맞는 제목을 따로 씁니다. */
export function titleOf(asp: SynastryAspect): string {
  if (asp.tone === 'tense') {
    return PAIR_TEXT[asp.pair]?.tenseTitle ?? PAIR_TEXT[asp.pair]?.title ?? asp.title;
  }
  return asp.title;
}

const PAIR_TEXT: Record<string, Body> = {
  'sun-sun': {
    title: '중심이 만나는 각',
    flow: '두 사람이 되려는 모습이 같은 방향을 봅니다. 함께 있을 때 서로의 자리를 빼앗지 않고 각자의 빛을 인정합니다.',
    tense: '두 사람의 중심이 같은 자리를 두고 겨룹니다. 원하는 것은 비슷한데 방식이 달라, 결정 앞에서 주도권 다툼이 생깁니다.',
    tenseTitle: '중심을 두고 겨루는 각',
  },
  'moon-sun': {
    title: '서로를 채우는 각',
    flow: '한 사람의 의지가 다른 사람의 마음을 편하게 합니다. 말하지 않아도 "이 사람은 나를 지지한다"는 감각이 먼저 옵니다.',
    tense: '마음과 중심이 어긋나 애정은 있는데 이해가 늦습니다. 상대의 결론이 내 감정보다 먼저 나오면 서운해집니다.',
    tenseTitle: '마음과 중심이 어긋나는 각',
  },
  'mercury-sun': {
    title: '의지와 말',
    flow: '생각을 꺼내면 상대가 바로 알아듣습니다. 길게 설명하지 않아도 통하는 편입니다.',
    tense: '말이 의도를 앞서거나 뒤처집니다. 같은 말을 다르게 받아들여, 사소한 표현에서 오해가 생깁니다.',
  },
  'sun-venus': {
    title: '호감의 방향',
    flow: '한 사람의 존재가 다른 사람에게 호감으로 읽힙니다. 상대가 나를 "좋은 사람"으로 먼저 기억합니다.',
    tense: '좋아하는 마음은 있는데 표현이 어긋납니다. 애정을 쏟는 방식이 달라 상대는 덜 좋아한다고 느낍니다.',
  },
  'mars-sun': {
    title: '추진력의 방향',
    flow: '한 사람이 방향을 정하면 다른 사람이 힘을 보탭니다. 결정과 실행이 자연스럽게 이어집니다.',
    tense: '속도가 달라 한 사람이 앞서가고 한 사람이 지칩니다. 재촉이 잦아지면 애정이 아니라 압박으로 남습니다.',
  },
  'asc-sun': {
    title: '첫인상과 중심',
    flow: '처음 만난 인상과 실제 중심이 잘 맞습니다. 상대는 내가 보여준 그대로를 오래 믿습니다.',
    tense: '첫인상과 실제 모습의 온도가 다릅니다. 가까워질수록 "처음과 다르다"는 말이 나옵니다.',
  },
  'moon-moon': {
    title: '감정의 온도',
    flow: '기분의 파도가 비슷해서 말하지 않아도 지금의 마음을 짐작합니다. 위로의 방식도 크게 다르지 않습니다.',
    tense: '마음이 가라앉는 방식이 다릅니다. 한 사람은 붙어 있어야 안심하고, 한 사람은 혼자 있어야 정리됩니다.',
    tenseTitle: '감정이 엇갈리는 자리',
  },
  'mercury-moon': {
    title: '마음을 말로 옮기는 일',
    flow: '감정을 말로 꺼내면 상대가 정확히 받습니다. 서운한 것을 그날 안에 정리할 수 있습니다.',
    tense: '느낌을 설명하려다 말이 길어지고, 상대는 분석으로 받아들입니다. 위로를 원했는데 조언이 돌아옵니다.',
  },
  'moon-venus': {
    title: '위로와 애정',
    flow: '애정 표현이 상대의 마음에 정확히 닿습니다. 함께 있는 시간 자체가 위로가 됩니다.',
    tense: '애정을 주는 방식과 받고 싶은 방식이 어긋납니다. 정성은 있는데 상대는 부족하다고 느낍니다.',
  },
  'mars-moon': {
    title: '감정의 속도',
    flow: '한 사람이 망설일 때 다른 사람이 등을 밀어 줍니다. 감정이 행동으로 이어지는 속도가 좋습니다.',
    tense: '감정이 올라오면 말이 날카로워집니다. 한 사람의 화가 다른 사람에게 옮겨 붙어 다툼이 커집니다.',
  },
  'jupiter-moon': {
    title: '마음이 편해지는 자리',
    flow: '함께 있으면 마음이 넓어집니다. 사소한 일에 덜 상하고 웃을 일이 많아집니다.',
    tense: '편안함이 늘어지기 쉽습니다. 서로 봐주다 보면 해야 할 말을 미루게 됩니다.',
    tenseTitle: '편안함이 늘어지는 자리',
  },
  'moon-saturn': {
    title: '감정에 지는 무게',
    flow: '한 사람의 마음이 다른 사람에게 안정을 줍니다. 오래 곁에 있고 싶은 마음이 여기서 생깁니다.',
    tense: '한 사람이 다른 사람의 감정을 무겁게 누릅니다. 서운함을 말하지 못하고 참다가 한 번에 터집니다.',
  },
  'asc-moon': {
    title: '겉과 속의 온도',
    flow: '보여주는 인상과 상대가 느끼는 마음의 온도가 맞습니다. 가까워지는 속도가 자연스럽습니다.',
    tense: '겉으로는 괜찮다고 하는데 속마음이 다릅니다. 상대는 그 차이를 늦게 알아챕니다.',
  },
  'mercury-mercury': {
    title: '말이 통하는가',
    flow: '대화의 속도와 관심사가 비슷합니다. 이야기가 길어져도 서로 지루하지 않습니다.',
    tense: '말의 속도와 정리 방식이 다릅니다. 한 사람은 결론부터, 한 사람은 배경부터 꺼내 답답해집니다.',
  },
  'mercury-venus': {
    title: '말과 애정',
    flow: '말이 부드럽게 오가고 칭찬이 자연스럽습니다. 대화 자체가 애정 표현이 됩니다.',
    tense: '표현이 어긋나 애정이 오해로 남습니다. 농담이 무례하게 들리거나 침묵이 무관심으로 읽힙니다.',
  },
  'mars-mercury': {
    title: '말의 날카로움',
    flow: '할 말을 분명히 하고 그 뒤에 남기지 않습니다. 논쟁이 오래 끌리지 않습니다.',
    tense: '말이 칼이 됩니다. 맞는 말이어도 타이밍이 틀리면 상처로 남습니다.',
  },
  'jupiter-mercury': {
    title: '대화의 넓이',
    flow: '이야기가 잘 확장됩니다. 함께 계획을 세우면 실제로 커집니다.',
    tense: '말이 앞서 약속이 커집니다. 벌여 놓고 지키지 못하는 일이 생깁니다.',
    tenseTitle: '말이 약속을 앞서는 자리',
  },
  'mercury-saturn': {
    title: '말의 무게',
    flow: '중요한 이야기를 미루지 않고 꺼낼 수 있습니다. 대화가 관계의 기준이 됩니다.',
    tense: '하고 싶은 말이 목에서 멈춥니다. 한 사람의 침묵을 다른 사람은 거절로 받아들입니다.',
  },
  'asc-mercury': {
    title: '말의 첫인상',
    flow: '말투와 인상이 잘 맞아 대화가 빨리 편해집니다.',
    tense: '말투가 인상과 어긋나 오해를 만듭니다. 진심은 한참 뒤에 전달됩니다.',
  },
  'venus-venus': {
    title: '취향의 방향',
    flow: '좋아하는 것과 싫어하는 것이 비슷합니다. 같이 고르는 일이 즐겁습니다.',
    tense: '취향과 애정 표현이 다릅니다. 각자 맞는 방식을 요구하면 서로 부족하다고 느낍니다.',
  },
  'mars-venus': {
    title: '끌림의 각',
    flow: '끌리는 마음과 움직이는 힘이 같은 방향을 봅니다. 다가가는 속도가 맞아 자연스럽게 가까워집니다.',
    tense: '끌림은 분명한데 방식이 어긋납니다. 한 사람은 밀고 한 사람은 물러서서 같은 마음이 엇갈립니다.',
    tenseTitle: '끌림이 어긋나는 각',
  },
  'jupiter-venus': {
    title: '함께 넉넉해지는 자리',
    flow: '함께 있으면 씀씀이와 마음이 넉넉해집니다. 둘이 무언가를 시작할 때 운이 붙습니다.',
    tense: '즐거움이 앞서 지출과 약속이 커집니다. 기분 좋은 결정이 나중에 부담이 됩니다.',
    tenseTitle: '넉넉함이 지출이 되는 자리',
  },
  'saturn-venus': {
    title: '애정의 무게',
    flow: '애정이 오래갑니다. 쉽게 흔들리지 않고 책임으로 남습니다.',
    tense: '애정이 무게로 느껴집니다. 표현이 적어 상대는 사랑받지 못한다고 여깁니다.',
  },
  'asc-venus': {
    title: '호감의 첫인상',
    flow: '상대의 첫인상이 내 취향에 정확히 맞습니다. 만나자마자 호감이 생기는 자리입니다.',
    tense: '첫인상과 취향이 미묘하게 어긋납니다. 좋아지는 데 시간이 걸립니다.',
  },
  'mars-mars': {
    title: '부딪히는 속도',
    flow: '행동의 속도가 비슷합니다. 같이 움직일 때 리듬이 맞습니다.',
    tense: '둘 다 멈추지 않으려 합니다. 같은 일을 두 번 하거나, 한 사람이 포기하는 쪽으로 끝납니다.',
  },
  'jupiter-mars': {
    title: '밀고 나가는 힘',
    flow: '한 사람이 밀면 다른 사람이 판을 넓힙니다. 새 일을 시작할 때 힘이 붙습니다.',
    tense: '욕심이 겹칩니다. 계획 없이 벌였다가 둘이 같이 지칩니다.',
    tenseTitle: '욕심이 겹치는 자리',
  },
  'mars-saturn': {
    title: '밀고 당기는 힘',
    flow: '속도를 조절하며 오래 갑니다. 급하지 않게 결과를 만듭니다.',
    tense: '한 사람이 밀면 한 사람이 브레이크를 겁니다. 의욕이 반복해서 꺾이면 무기력해집니다.',
  },
  'asc-mars': {
    title: '몸의 온도',
    flow: '행동하는 방식이 인상과 맞아, 함께 움직일 때 편합니다.',
    tense: '행동이 앞서 인상이 거칠게 남습니다. 의도와 다르게 급한 사람으로 보입니다.',
  },
  'jupiter-jupiter': {
    title: '넉넉함의 방향',
    flow: '기회를 보는 방향이 비슷합니다. 함께 결정하면 판이 커집니다.',
    tense: '낙관이 겹쳐 위험을 가볍게 봅니다. 둘 다 괜찮다고 넘긴 일이 나중에 문제가 됩니다.',
  },
  'jupiter-sun': {
    title: '서로를 키우는 각',
    flow: '한 사람 곁에서 다른 사람이 더 자신감을 냅니다. 응원이 실제 성장으로 이어집니다.',
    tense: '기대가 커져 실망도 커집니다. 내 기준을 상대에게 대신 맡기게 됩니다.',
    tenseTitle: '기대가 커지는 각',
  },
  'saturn-sun': {
    title: '책임과 무게',
    flow: '관계에 기준이 생깁니다. 말보다 약속으로 오래 가는 자리입니다.',
    tense: '한 사람의 존재가 다른 사람에게 부담이 됩니다. 인정을 받지 못한다고 느끼면 마음이 닫힙니다.',
  },
  'jupiter-saturn': {
    title: '확장과 제동',
    flow: '벌이는 사람과 지키는 사람이 나뉘어 균형이 잡힙니다.',
    tense: '한 사람은 키우자 하고, 한 사람은 줄이자 합니다. 결정마다 힘이 빠집니다.',
  },
  'saturn-saturn': {
    title: '시간의 각',
    flow: '오래 봐야 가치가 보이는 관계입니다. 시간이 지날수록 단단해집니다.',
    tense: '관계의 속도가 느리게 느껴집니다. 시작은 늦지만 급하게 서두르면 오히려 흔들립니다.',
  },
  'asc-saturn': {
    title: '첫인상의 무게',
    flow: '상대에게 신뢰를 줍니다. 처음부터 오래 볼 사람으로 인식됩니다.',
    tense: '상대가 나를 어렵게 느낍니다. 거리감이 좀처럼 줄지 않습니다.',
  },
  'asc-jupiter': {
    title: '기회의 문',
    flow: '상대에게 열린 인상을 줍니다. 소개와 연결이 잘 붙습니다.',
    tense: '인상은 좋은데 실제 약속이 가볍습니다. 기대만 키우고 지키지 못합니다.',
    tenseTitle: '약속이 가벼운 자리',
  },
  'asc-asc': {
    title: '사는 속도',
    flow: '하루의 리듬과 대응 속도가 비슷합니다. 함께 있을 때 피로가 적습니다.',
    tense: '하루를 사는 속도가 다릅니다. 한 사람은 기다리고, 한 사람은 재촉합니다.',
  },
};

const FALLBACK_TEXT: Body = {
  title: '두 힘의 각',
  flow: '두 사람의 힘이 서로를 밀어 주는 자리입니다. 이 각이 닿는 영역에서는 일이 막히지 않고 자연스럽게 풀립니다.',
  tense: '두 사람의 힘이 서로 다른 방향을 봅니다. 이 각이 닿는 영역에서는 같은 일이 두 번 반복되기 쉽습니다.',
};

function textOf(pair: string): Body {
  return PAIR_TEXT[pair] ?? FALLBACK_TEXT;
}

/* ---------------------------- 조사 처리 ---------------------------- */

const JOSA_PAIRS: Record<string, [string, string]> = {
  은는: ['은', '는'],
  이가: ['이', '가'],
  을를: ['을', '를'],
  과와: ['과', '와'],
  으로로: ['으로', '로'],
};

/** 이름·단어 끝의 받침을 보고 조사를 붙입니다. (한글 이름·영문 이름 모두 처리) */
export function withJosa(word: string, kind: keyof typeof JOSA_PAIRS): string {
  const w = (word ?? '').trim();
  if (!w) return '';
  const last = w[w.length - 1];
  const code = last.charCodeAt(0);
  const pair = JOSA_PAIRS[kind] ?? ['', ''];
  if (code < 0xac00 || code > 0xd7a3) {
    // 한글이 아니면 숫자만 받침 판정(0·1·3·6·7·8), 나머지는 받침 없음으로 봅니다.
    const hasBatchim = /[013678]$/.test(last);
    return w + (hasBatchim ? pair[0] : pair[1]);
  }
  const hasBatchim = (code - 0xac00) % 28 !== 0;
  return w + (hasBatchim ? pair[0] : pair[1]);
}

/** 어느 사람의 행성인지 — 무료 프리뷰·리포트가 같은 표기를 씁니다. */
export function ownerLabel(asp: SynastryAspect): string {
  return `내 ${asp.a.name} · 상대 ${asp.b.name}`;
}

/* ---------------------------- 원소 궁합 ---------------------------- */

const ELEMENT_KEY = (a: Element, b: Element) => [a, b].sort().join('-');

const ELEMENT_HARMONY: Record<string, number> = {
  '불-불': 0.8,
  '공기-불': 0.94,
  '불-흙': 0.5,
  '물-불': 0.42,
  '흙-흙': 0.82,
  '물-흙': 0.92,
  '공기-흙': 0.5,
  '공기-공기': 0.8,
  '공기-물': 0.48,
  '물-물': 0.82,
};

const ELEMENT_NOTE: Record<string, { label: string; note: string }> = {
  '불-불': {
    label: '같은 불',
    note: '둘 다 먼저 움직이는 쪽입니다. 시작은 빠르지만, 쉬는 법을 함께 정해야 오래 갑니다.',
  },
  '공기-불': {
    label: '불과 공기',
    note: '공기가 불을 키우는 조합입니다. 말이 잘 통하고, 한 사람의 아이디어에 다른 사람이 바람을 넣어 줍니다.',
  },
  '불-흙': {
    label: '불과 흙',
    note: '불은 빨리 달리고 흙은 단단히 붙잡습니다. 속도가 달라 조급함이 생기지만, 그 차이가 결과를 현실로 만듭니다.',
  },
  '물-불': {
    label: '불과 물',
    note: '열정은 강한데 진정되는 방식이 정반대입니다. 불은 밀어붙이고 물은 스며들어, 화해의 타이밍이 늘 어긋납니다.',
  },
  '흙-흙': {
    label: '같은 흙',
    note: '현실 감각이 비슷합니다. 돈과 생활의 기준이 잘 맞아, 살림이 흔들리지 않습니다.',
  },
  '물-흙': {
    label: '흙과 물',
    note: '물이 흙을 적시는 조합입니다. 감정과 현실이 서로를 받쳐 주어, 생활이 안정되기 쉽습니다.',
  },
  '공기-흙': {
    label: '흙과 공기',
    note: '공기는 이야기하고 흙은 확인합니다. 말과 실행 사이에 늘 한 박자 차이가 생깁니다.',
  },
  '공기-공기': {
    label: '같은 공기',
    note: '대화가 끊기지 않습니다. 다만 감정보다 이해가 앞서, 마음이 필요한 순간에 말만 오갈 수 있습니다.',
  },
  '공기-물': {
    label: '공기와 물',
    note: '공기는 설명하고 물은 느낍니다. 같은 일을 두고도 서로 다른 것을 보고 있다고 느끼기 쉽습니다.',
  },
  '물-물': {
    label: '같은 물',
    note: '분위기를 읽는 감각이 비슷합니다. 말하지 않아도 통하지만, 둘 다 가라앉으면 빠져나오기 어렵습니다.',
  },
};

/* ------------------------------ 점수 ------------------------------ */

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(n)));

type Group = 'temp' | 'pull' | 'last';

function groupsOf(pair: string): Group[] {
  const [x, y] = pair.split('-');
  const has = (p: string) => x === p || y === p;
  const g: Group[] = [];
  if (has('moon')) g.push('temp');
  if ((has('venus') || has('mars')) && (has('sun') || has('asc') || has('venus') || has('mars'))) g.push('pull');
  if (has('saturn') || has('mercury') || x === y) g.push('last');
  if (!g.length) g.push('last');
  return g;
}

const GROUP_MULTIPLIER: Record<Group, number> = { temp: 11, pull: 10.5, last: 9.5 };
const GROUP_BASE: Record<Group, number> = { temp: 63, pull: 62, last: 61 };

const BAND = [
  {
    min: 84,
    label: '한 번에 맞물리는 각',
    line: '같은 계절을 사는 두 사람입니다. 설명하지 않아도 통하는 부분이 많습니다.',
  },
  {
    min: 76,
    label: '오래 이어지는 각',
    line: '끌림과 안정이 같이 있습니다. 속도를 맞추는 일만 남았습니다.',
  },
  {
    min: 66,
    label: '노력이 값어치 있는 각',
    line: '맞는 부분과 어긋나는 부분이 뚜렷합니다. 어긋나는 자리를 미리 알면 훨씬 편해집니다.',
  },
  {
    min: 56,
    label: '속도를 맞춰야 하는 각',
    line: '끌림은 있지만 생활의 리듬이 다릅니다. 규칙을 정하는 쪽이 유리합니다.',
  },
  {
    min: 0,
    label: '서로 다른 계절을 사는 각',
    line: '같은 것을 원해도 표현과 속도가 다릅니다. 이해보다 양보가 먼저 필요한 관계입니다.',
  },
];

function bandOf(score: number) {
  const found = BAND.find((b) => score >= b.min) ?? BAND[BAND.length - 1];
  return { label: found.label, line: found.line };
}

/* ------------------------------ 빌드 ------------------------------ */

export function synastryOf(a: WesternModel, b: WesternModel): SynastryModel {
  const pa = pointsOf(a);
  const pb = pointsOf(b);

  const aspects: SynastryAspect[] = [];
  for (const x of pa) {
    for (const y of pb) {
      const found = findAspect(x.longitude, y.longitude);
      if (!found) continue;
      const pair = pairKey(x.key, y.key);
      const weight = POINT_WEIGHT[x.key] * POINT_WEIGHT[y.key] * (PAIR_BIAS[pair] ?? 1);
      const falloff = 1 - (found.orb / found.maxOrb) * 0.6;
      const contribution = weight * found.factor * falloff;
      const text = textOf(pair);
      aspects.push({
        pair,
        a: x,
        b: y,
        type: found.type,
        angle: found.angle,
        orb: found.orb,
        tone: found.tone,
        influence: Number(Math.abs(contribution).toFixed(3)),
        contribution: Number(contribution.toFixed(3)),
        title: text.title,
        body: found.tone === 'flow' ? text.flow : text.tense,
      });
    }
  }

  aspects.sort((x, y) => y.influence - x.influence);

  const sums: Record<Group, number> = { temp: 0, pull: 0, last: 0 };
  for (const asp of aspects) {
    for (const g of groupsOf(asp.pair)) sums[g] += asp.contribution;
  }

  /* 원소 궁합 */
  const elA = a.dominantElement;
  const elB = b.dominantElement;
  const elKey = ELEMENT_KEY(elA, elB);
  const harmony = ELEMENT_HARMONY[elKey] ?? 0.6;
  const elNote = ELEMENT_NOTE[elKey] ?? {
    label: `${elA}과 ${elB}`,
    note: '서로 다른 기운이 만나는 조합입니다.',
  };
  const harmonyBonus = (harmony - 0.68) * 34;

  /* 세 축 — 달·금성·화성·토성의 원소도 조금 반영합니다. */
  const moonElA = SIGNS[a.moon.signIndex].element;
  const moonElB = SIGNS[b.moon.signIndex].element;
  const moonHarmony = ELEMENT_HARMONY[ELEMENT_KEY(moonElA, moonElB)] ?? 0.6;
  const tempBonus = (moonHarmony - 0.68) * 26;
  const venusElA = SIGNS[a.planets.find((p) => p.key === 'venus')!.signIndex].element;
  const venusElB = SIGNS[b.planets.find((p) => p.key === 'venus')!.signIndex].element;
  const pullBonus = ((ELEMENT_HARMONY[ELEMENT_KEY(venusElA, venusElB)] ?? 0.6) - 0.68) * 26;

  const temperature = clamp(GROUP_BASE.temp + sums.temp * GROUP_MULTIPLIER.temp + tempBonus, 30, 97);
  const pull = clamp(GROUP_BASE.pull + sums.pull * GROUP_MULTIPLIER.pull + pullBonus, 30, 97);
  const lasting = clamp(GROUP_BASE.last + sums.last * GROUP_MULTIPLIER.last + harmonyBonus, 30, 97);
  const score = clamp(temperature * 0.36 + pull * 0.34 + lasting * 0.3, 44, 97);

  const flowTop = aspects.filter((x) => x.tone === 'flow').sort((x, y) => y.contribution - x.contribution)[0];
  const tenseTop = [...aspects].filter((x) => x.tone === 'tense').sort((x, y) => x.contribution - y.contribution)[0];
  const core = [flowTop, tenseTop].filter(Boolean) as SynastryAspect[];
  const coreKeys = new Set(core.map((c) => `${c.pair}-${c.type}-${c.orb}`));
  const locked = aspects.filter((x) => !coreKeys.has(`${x.pair}-${x.type}-${x.orb}`));

  const nameA = a.name?.trim() || '나';
  const nameB = b.name?.trim() || '상대';

  const sunA = SIGNS[a.sun.signIndex];
  const sunB = SIGNS[b.sun.signIndex];
  const moonA = SIGNS[a.moon.signIndex];
  const moonB = SIGNS[b.moon.signIndex];

  const corePair = (asp?: SynastryAspect) =>
    asp ? `내 ${asp.a.name} · 상대의 ${asp.b.name} ${asp.type}` : '';

  /* 요약 — 3문장 (원소 이야기는 아래 원소 궁합 카드가 따로 맡습니다) */
  const summary = [
    `${withJosa(nameA, '은는')} ${elA}, ${withJosa(nameB, '은는')} ${elB} 기운이 강합니다.`,
    flowTop
      ? `가장 강하게 붙는 자리는 '${corePair(flowTop)}'입니다. ${flowTop.body}`
      : '두 천궁도에서 강하게 붙는 각은 많지 않습니다. 대신 생활의 규칙이 관계를 지탱합니다.',
    tenseTop
      ? `가장 조심할 자리는 '${corePair(tenseTop)}'입니다. ${tenseTop.body}`
      : '크게 부딪히는 각은 없습니다. 다만 서로 다른 속도를 무시하면 서운함이 쌓입니다.',
  ].join(' ');

  const oneLine = flowTop
    ? `${bandOf(score).line} ${corePair(flowTop)}이 이 관계의 힘입니다.`
    : bandOf(score).line;

  /* 관계 역학 3개 */
  const dynamics = [
    {
      title: '관계를 굴러가게 하는 힘',
      body: flowTop
        ? `내 ${flowTop.a.name} · 상대의 ${flowTop.b.name} ${withJosa(flowTop.type, '으로로')} 이어집니다. ${flowTop.body}`
        : '눈에 띄게 강한 각은 없습니다. 이 관계는 감정의 파도보다 함께 쌓는 습관으로 굴러갑니다.',
    },
    {
      title: '겉으로 보이는 온도',
      body: `${withJosa(nameA, '은는')} 어센던트 ${withJosa(a.rising.name, '으로로')} 먼저 다가가고, ${withJosa(
        nameB,
        '은는',
      )} ${withJosa(b.rising.name, '으로로')} 받습니다. ${a.rising.name}의 인상은 "${a.rising.keyword}", ${b.rising.name}의 인상은 "${b.rising.keyword}"입니다. ${sunA.name}의 중심과 ${sunB.name}의 중심이 만나는 방식이 여기서 결정됩니다.`,
    },
    {
      title: '쉴 때의 모습',
      body:
        moonA.name === moonB.name
          ? `두 사람의 달이 모두 ${moonA.name}입니다. ${moonA.love} 기분이 가라앉는 방식까지 비슷해서, 한 사람이 조용해지면 다른 한 사람도 같이 내려앉기 쉽습니다.`
          : `${nameA}의 달은 ${moonA.name} — ${moonA.love} ${nameB}의 달은 ${moonB.name} — ${moonB.love}`,
    },
  ];

  /* 갈등 포인트 3개 */
  const conflicts: Array<{ title: string; body: string; fix: string }> = [
    {
      title: tenseTop ? `${titleOf(tenseTop)} — ${tenseTop.type} ${tenseTop.angle}°` : '속도의 차이',
      body: tenseTop
        ? `'${corePair(tenseTop)}'의 각입니다. ${tenseTop.body}`
        : '두 천궁도에 강한 마찰 각은 없습니다. 대신 원소가 달라 하루를 보내는 속도가 다릅니다.',
      fix: tenseTop
        ? `'${corePair(tenseTop)}' 이야기가 나올 때는 그 자리에서 정리하려 하지 않기. 하루 뒤에 다시 꺼내면 같은 말이 훨씬 부드럽게 전달됩니다.`
        : '중요한 결정은 두 사람이 모두 쉬는 시간에 하기. 피곤한 상태의 결론은 서로에게 오래 남습니다.',
    },
    {
      title: `${elNote.label} — 생활의 리듬`,
      body: `${withJosa(nameA, '은는')} ${elA} 기운이 강하고, ${withJosa(nameB, '은는')} ${elB} 기운이 강합니다. ${elNote.note}`,
      fix:
        elA === elB
          ? `같은 ${elA} 기운이라 나누기보다 속도를 정하는 쪽이 낫습니다. 누가 시작을 맡고 언제 쉴지를 미리 정해 두면, 같은 기운이 서로를 밀어내지 않습니다.`
          : `집안일·약속·연락처럼 매일 반복되는 일은 '누가 먼저' 대신 '무엇을' 기준으로 나누기. ${elA} 쪽은 시작을, ${elB} 쪽은 마무리를 맡기면 마찰이 줄어듭니다.`,
    },
    {
      title: `${moonA.name}의 달 × ${moonB.name}의 달 — 위로의 방식`,
      body:
        moonA.name === moonB.name
          ? `두 사람의 달이 같은 ${moonA.name}이라 상처의 지점도 같습니다. ${withJosa(nameA, '은는')} ${moonA.shadow.replace(/\.$/, '')} 쪽에서, ${withJosa(
              nameB,
              '은는',
            )} 같은 지점에서 다칩니다. 그래서 같은 말이 한 사람에게는 위로, 다른 사람에게는 지적으로 들립니다.`
          : `${withJosa(nameA, '은는')} ${moonA.shadow.replace(/\.$/, '')} 쪽에서 상처를 받고, ${withJosa(
              nameB,
              '은는',
            )} ${moonB.shadow.replace(/\.$/, '')} 쪽에서 서운함을 느낍니다. 같은 날 두 가지가 겹치면 사소한 말이 오래 남습니다.`,
      fix: '감정이 올라온 날에는 결론을 내지 않기. "지금은 정리하고 내일 이야기하자"는 한 문장을 미리 정해 두면 그 문장이 관계를 지켜 줍니다.',
    },
  ];

  /* 보완 조언 3개 */
  const marsA = SIGNS[a.planets.find((p) => p.key === 'mars')!.signIndex];
  const marsB = SIGNS[b.planets.find((p) => p.key === 'mars')!.signIndex];
  const advice = [
    `결정은 ${marsA.name}의 속도를 가진 ${withJosa(nameA, '이가')} 먼저 꺼내고, 실행은 ${marsB.name}의 방식으로 움직이는 ${withJosa(nameB, '이가')} 맡기. ${marsA.work.split('.')[0]}. ${marsB.work.split('.')[0]}.`,
    `한 주에 한 번은 ${flowTop ? `'${corePair(flowTop)}'` : '서로 잘 맞는 영역'}이 살아나는 일을 함께 하기. 잘 맞는 자리를 일부러 반복하면 어긋나는 자리가 덜 아픕니다.`,
    `${harmony >= 0.8 ? '두 사람의 원소가 잘 맞는 편입니다. 편안함에 기대어 말을 미루지만 않으면 됩니다.' : '원소가 다른 편입니다. 상대가 지금 어떤 속도로 살고 있는지 한 달에 한 번은 물어보기. 이 한 번의 질문이 오해를 크게 줄입니다.'}`,
  ];

  const roles = {
    a: `${marsA.name}의 방식으로 밀고, ${sunA.name}의 중심으로 방향을 잡는 쪽`,
    b: `${marsB.name}의 방식으로 움직이고, ${sunB.name}의 중심으로 버티는 쪽`,
  };

  return {
    a,
    b,
    nameA,
    nameB,
    score,
    temperature,
    pull,
    lasting,
    band: bandOf(score),
    element: {
      a: elA,
      b: elB,
      harmony,
      label: elNote.label,
      note: elNote.note,
    },
    aspects,
    core,
    locked,
    headline: `태양 ${sunA.name} · 달 ${moonA.name} × 태양 ${sunB.name} · 달 ${moonB.name}`,
    oneLine,
    summary,
    dynamics,
    conflicts,
    advice,
    roles,
  };
}
