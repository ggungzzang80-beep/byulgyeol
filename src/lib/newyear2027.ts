/**
 * 2027 정미년(丁未) 신년 운세 콘텐츠 엔진 (newyear2027.ts)
 * ------------------------------------------------------------------
 * 무료 부적 → 2027 정밀 리포트 → 수호 원석 굿즈로 이어지는 퍼널의 재료를
 * 한 곳에서 만듭니다.
 *
 * - 해의 값은 고정입니다: 2027년은 정미년(丁未), 丁(음화)이 未(토)에 앉은
 *   '붉은 양의 해'. 화토(火土)의 기운이 한 해를 덮습니다.
 * - 사용자별 값은 명반에서 나옵니다: 2027 유년 명궁, 2027 유년 사화 4개,
 *   2027 기준 재백·부처·관록 궁의 지수. (숫자를 지어내지 않습니다.)
 * - 문장은 테마별 말투(캐릭터=해요체 존댓말 / 자미원=합니다체)로 각각 준비합니다.
 */
import type { ChartModel, PalaceView } from './chart';
import { palaceScore, profileOf } from './content';
import {
  ELEMENT_KEYWORD,
  ELEMENT_LABEL,
  NEED_REASON,
  STONE,
  chartElementOf,
  needElementFor,
  type ElementKey,
} from './stones';
import { stoneGoods, type StoneGood } from './goodsCatalog';
import type { ThemeId } from './theme';
import { roomOf } from './friendly';

export type { ElementKey };
export type MonthTone = 'open' | 'push' | 'name' | 'care' | 'steady';

export type Year2027Mutagen = {
  mutagen: string; // 화록 · 화권 · 화과 · 화기
  star: string; // 태음 · 천동 …
  palace: string; // 앉은 명반 궁 이름
  field: string; // 돈 · 연애 · 일 …
  line: string;
  action: string;
};

export type Year2027Month = {
  month: number;
  tone: MonthTone;
  title: string;
  body: string;
  action: string;
};

export type { StoneGood };

export type NewYear2027Content = {
  year: 2027;
  hanja: string; // 丁未
  stemBranch: string; // 정미
  animal: string; // 붉은 양
  yearElement: string; // 화토
  age: number;
  stage: { palace: string; domain: string; field: string };
  headline: string;
  keywords: [string, string, string];
  advice: string;
  flow: { free: string; locked: string };
  scores: { love: number; money: number; work: number };
  mutagen: Year2027Mutagen[];
  needElement: ElementKey;
  needLabel: string;
  needReason: string;
  stone: { name: string; detail: string; colorHex: string; colorSoft: string };
  habits: string[];
  months: Year2027Month[];
  goods: StoneGood[];
  note: string;
};

/* --------------------------------------------------------------- 기본 표 */

/** 궁 → 한 단어 분야 (문장에 끼워 넣는 용도) */
const FIELD: Record<string, { field: string; keyword: string }> = {
  명궁: { field: '나', keyword: '나' },
  형제궁: { field: '가까운 사람', keyword: '동료' },
  부처궁: { field: '연애', keyword: '인연' },
  자녀궁: { field: '창작', keyword: '창작' },
  재백궁: { field: '돈', keyword: '돈' },
  질액궁: { field: '몸', keyword: '회복' },
  천이궁: { field: '바깥일', keyword: '이동' },
  노복궁: { field: '사람', keyword: '협력' },
  관록궁: { field: '일', keyword: '일' },
  전택궁: { field: '집', keyword: '터전' },
  복덕궁: { field: '마음', keyword: '마음' },
  부모궁: { field: '배움', keyword: '배움' },
};


const HABITS: Record<ElementKey, { c: string[]; m: string[] }> = {
  목: {
    c: ['아침에 창문을 열고 5분 서 있어 보세요 — 나무가 자라는 쪽이에요.', '새로 시작하는 일은 3월과 9월에 몰아두세요.', '계획을 말로 꺼내는 습관 하나를 들여 보세요. 말한 계획만 남아요.'],
    m: ['아침에 창문을 열고 5분 서 있기 — 나무의 기운을 받는 자리입니다.', '새로 시작하는 일은 3월과 9월에 몰아두기.', '계획을 말로 꺼내는 습관 하나. 말한 계획만 남습니다.'],
  },
  수: {
    c: ['잠들기 전 30분은 화면을 끄고 물 한 잔 — 이게 제일 큰 보완이에요.', '결정은 열이 오른 낮보다 저녁에 해 보세요.', '월말에 돈과 일정을 한 장에 정리해 보세요.'],
    m: ['잠들기 전 30분은 화면을 끄고 물 한 잔 — 가장 확실한 보완입니다.', '결정은 열이 오른 낮보다 저녁에.', '월말에 돈과 일정을 한 장에 정리하기.'],
  },
  토: {
    c: ['큰 결정 전에 3일을 두세요. 흙은 급하지 않아요.', '식탁·책상처럼 늘 보는 자리를 먼저 정리해 보세요.', '한 번 정한 약속은 시간까지 적어 두세요.'],
    m: ['큰 결정 전에 3일을 두기. 흙은 급하지 않습니다.', '식탁·책상처럼 늘 보는 자리를 먼저 정리하기.', '한 번 정한 약속은 시간까지 적어두기.'],
  },
  화: {
    c: ['화를 낼 일이 생기면 그 자리에서 말하지 말고 한 시간 뒤에 말하세요.', '표현할 곳을 하나만 정하고 거기에 집중해 보세요.', '물을 자주 마시고, 밤보다 아침에 쓰세요.'],
    m: ['화가 나면 그 자리에서 말하지 말고 한 시간 뒤에.', '표현할 곳을 하나만 정하고 거기에 집중하기.', '물을 자주 마시고, 밤보다 아침에 쓰기.'],
  },
  금: {
    c: ['한 달에 한 번, 결제 내역을 소리 내서 읽어 보세요.', '결론을 미루는 일은 날짜를 정해 두세요.', '물건을 사기 전 하루 재워 두세요.'],
    m: ['한 달에 한 번, 결제 내역을 소리 내어 확인하기.', '결론을 미루는 일은 날짜를 정해 두기.', '물건을 사기 전 하루 재우기.'],
  },
};

/** 사화가 앉은 자리에서 읽는 한 해의 문장 */
const MUTAGEN_COPY: Record<string, { c: (f: string) => string; m: (f: string) => string; action: { c: (f: string) => string; m: (f: string) => string } }> = {
  화록: {
    c: (f) => `${f} 쪽으로 복이 들어와요. 먼저 손을 뻗으면 남는 것이 커져요.`,
    m: (f) => `${f} 쪽으로 복이 들어옵니다. 먼저 손을 뻗을수록 남는 것이 큽니다.`,
    action: {
      c: (f) => `${f}에 쓸 시간과 돈을 1월에 미리 떼어 두세요.`,
      m: (f) => `${f}에 쓸 시간과 돈을 1월에 미리 떼어두십시오.`,
    },
  },
  화권: {
    c: (f) => `${f} 쪽에서 주도권이 붙어요. 다만 밀수록 반발도 함께 와요.`,
    m: (f) => `${f} 쪽에서 주도권이 붙습니다. 다만 밀수록 반발도 함께 옵니다.`,
    action: {
      c: (f) => `${f} 일은 상반기에 결론을 내세요.`,
      m: (f) => `${f} 일은 상반기에 결론을 내십시오.`,
    },
  },
  화과: {
    c: (f) => `${f} 쪽에서 이름이 남아요. 기록하고 알린 만큼 돌아와요.`,
    m: (f) => `${f} 쪽에서 이름이 남습니다. 기록하고 알린 만큼 돌아옵니다.`,
    action: {
      c: () => '지원서·원고·제안서처럼 남는 문서를 한 번에 정리해 보세요.',
      m: () => '지원서·원고·제안서처럼 남는 문서를 한 번에 정리하십시오.',
    },
  },
  화기: {
    c: (f) => `${f} 쪽에서 같은 문제가 반복돼요. 미련을 남기면 그것이 제일 무거워요.`,
    m: (f) => `${f} 쪽에서 같은 문제가 반복됩니다. 미련을 남기면 그것이 가장 무겁습니다.`,
    action: {
      c: () => '이 자리는 새로 벌이지 말고 정리만 하세요. 9월 전에 끝내는 편이 좋아요.',
      m: () => '이 자리는 새로 벌이지 말고 정리만 하십시오. 9월 전에 끝내는 편이 좋습니다.',
    },
  },
};

/** 열두 달의 기본 결 — 달마다 다른 계절·일정을 짚습니다 (반복 문장 금지) */
const MONTH_BASE: Array<{
  title: string;
  body: { c: string; m: string };
  action: { c: string; m: string };
}> = [
  {
    title: '해가 바뀌는 달',
    body: {
      c: '새 달력에 먼저 적을 한 가지만 정해 보세요. 그것이 한 해의 기준이 돼요.',
      m: '새 달력에 먼저 적을 한 가지만 정하십시오. 그것이 한 해의 기준이 됩니다.',
    },
    action: { c: '1월 5일까지 올해 목표 한 줄.', m: '1월 5일까지 올해 목표 한 줄.' },
  },
  {
    title: '몸을 깨우는 달',
    body: {
      c: '시작하기 전에 잠과 식사부터 챙기세요. 몸이 돌아와야 판단이 서요.',
      m: '시작하기 전에 잠과 식사부터. 몸이 돌아와야 판단이 섭니다.',
    },
    action: { c: '잠드는 시간 30분 당기기.', m: '잠드는 시간 30분 당기기.' },
  },
  {
    title: '사람이 넓어지는 달',
    body: {
      c: '새 인연과 제안은 이 달에 와요. 받는 쪽이 유리해요.',
      m: '새 인연과 제안은 이 달에 옵니다. 받는 쪽이 유리합니다.',
    },
    action: { c: '연락처 세 개는 그 자리에서 저장.', m: '연락처 세 개는 그 자리에서 저장.' },
  },
  {
    title: '보여주는 달',
    body: {
      c: '준비한 것을 꺼내 보이는 달이에요. 미루면 열기가 식어요.',
      m: '준비한 것을 꺼내 보이는 달입니다. 미루면 열기가 식습니다.',
    },
    action: { c: '원고·포트폴리오 하나는 이 달에 공개.', m: '원고·포트폴리오 하나는 이 달에 공개.' },
  },
  {
    title: '열기가 오르는 달',
    body: {
      c: '하고 싶은 일이 확 늘어나요. 그중 두 개만 골라 보세요.',
      m: '하고 싶은 일이 확 늘어납니다. 그중 두 개만 고르십시오.',
    },
    action: { c: '새로 시작하는 것은 두 개까지로 정해 보세요.', m: '새로 시작하는 것은 두 개까지.' },
  },
  {
    title: '속도가 붙는 달',
    body: {
      c: '한 번 잡은 일은 여기서 끝까지 가 보세요. 끊으면 다시 오지 않아요.',
      m: '한 번 잡은 일은 여기서 끝까지. 끊으면 다시 오지 않습니다.',
    },
    action: { c: '6월 안에 끝낼 일 하나를 정해 두세요.', m: '6월 안에 끝낼 일 하나를 정하십시오.' },
  },
  {
    title: '식히는 달',
    body: {
      c: '2027년은 이 달이 제일 뜨거워요. 큰 결정은 미루고 몸을 먼저 챙기세요.',
      m: '2027년은 이 달이 가장 뜨겁습니다. 큰 결정은 미루고 몸을 먼저.',
    },
    action: { c: '큰 지출과 계약은 8월로.', m: '큰 지출과 계약은 8월로.' },
  },
  {
    title: '정리하는 달',
    body: {
      c: '벌인 일 중 하나는 접으세요. 남길 것만 남겨 보세요.',
      m: '벌인 일 중 하나는 접으십시오. 남길 것만 남기십시오.',
    },
    action: { c: '구독·멤버십 두 개 정리.', m: '구독·멤버십 두 개 정리.' },
  },
  {
    title: '다시 세는 달',
    body: {
      c: '돈과 일정을 한 장에 적어 보세요. 숫자가 보이면 판단이 빨라져요.',
      m: '돈과 일정을 한 장에 적으십시오. 숫자가 보이면 판단이 빨라집니다.',
    },
    action: { c: '수입·지출 한 장으로 정리.', m: '수입·지출 한 장으로 정리.' },
  },
  {
    title: '사람으로 풀리는 달',
    body: {
      c: '혼자 하던 일을 한 사람에게 넘겨 보세요. 그것이 내년을 만들어요.',
      m: '혼자 하던 일을 한 사람에게 넘기십시오. 그것이 내년을 만듭니다.',
    },
    action: { c: '넘길 일 하나를 정해 부탁.', m: '넘길 일 하나를 정해 부탁.' },
  },
  {
    title: '값을 매기는 달',
    body: {
      c: '수고한 만큼 요구해도 되는 달이에요. 미루면 그냥 지나가요.',
      m: '수고한 만큼 요구해도 되는 달입니다. 미루면 그냥 지나갑니다.',
    },
    action: { c: '인상·단가 이야기를 이 달에.', m: '인상·단가 이야기를 이 달에.' },
  },
  {
    title: '닫는 달',
    body: {
      c: '올해 계획은 여기서 닫으세요. 내년 몫은 한 줄만 적어 두세요.',
      m: '올해 계획은 여기서 닫으십시오. 내년 몫은 한 줄만 적으십시오.',
    },
    action: { c: '12월 28일까지 결산 한 줄.', m: '12월 28일까지 결산 한 줄.' },
  },
];

/** 열두 달의 결 — 사화 넷이 앉은 달 + 남은 달 */
const MONTH_COPY: Record<
  MonthTone,
  { title: string; body: { c: (f: string) => string; m: (f: string) => string }; action: { c: string; m: string } }
> = {
  open: {
    title: '문이 열리는 달',
    body: {
      c: (f) => `${f} 쪽에서 연락이나 제안이 먼저 와요. 기다리지 말고 답해 주세요.`,
      m: (f) => `${f} 쪽에서 연락이나 제안이 먼저 옵니다. 기다리지 말고 답하십시오.`,
    },
    action: { c: '이 달에만 잡히는 자리는 그 달에 잡아 두세요.', m: '이 달에만 잡히는 자리는 그 달에 잡으십시오.' },
  },
  push: {
    title: '밀어붙이는 달',
    body: {
      c: (f) => `${f} 쪽에서 미루면 다음 사람에게 넘어가요. 세게, 짧게 밀어 보세요.`,
      m: (f) => `${f} 쪽에서 미루면 다음 사람에게 넘어갑니다. 세게, 짧게 미십시오.`,
    },
    action: { c: '결론 낼 일 하나만 정해서 이 달에 끝내 보세요.', m: '결론 낼 일 하나만 정해 이 달에 끝내십시오.' },
  },
  name: {
    title: '이름이 남는 달',
    body: {
      c: (f) => `${f} 쪽에서 기록·발표·지원이 실제 결과로 이어져요.`,
      m: (f) => `${f} 쪽에서 기록·발표·지원이 실제 결과로 이어집니다.`,
    },
    action: { c: '지원서·원고처럼 남는 문서를 이 달에 마무리해 보세요.', m: '지원서·원고처럼 남는 문서를 이 달에 마무리하십시오.' },
  },
  care: {
    title: '숨을 고르는 달',
    body: {
      c: (f) => `${f} 쪽에서 같은 문제가 다시 올라와요. 새로 벌이지 마세요.`,
      m: (f) => `${f} 쪽에서 같은 문제가 다시 올라옵니다. 새로 벌이지 마십시오.`,
    },
    action: { c: '정리와 마무리만 하세요. 큰돈은 이 달에 쓰지 마세요.', m: '정리와 마무리만. 큰돈은 이 달에 쓰지 마십시오.' },
  },
  steady: {
    title: '흐름을 타는 달',
    body: {
      c: (f) => `${f}에서 큰 변화보다 쌓는 쪽이 남아요. 매일 조금씩이면 충분해요.`,
      m: (f) => `${f}에서 큰 변화보다 쌓는 쪽이 남습니다. 매일 조금씩.`,
    },
    action: { c: '하루 한 가지, 같은 시간에 하기.', m: '하루 한 가지, 같은 시간에 하기.' },
  },
};

const BRANCH_MONTH: Record<string, number> = {
  자: 12,
  축: 1,
  인: 2,
  묘: 3,
  진: 4,
  사: 5,
  오: 6,
  미: 7,
  신: 8,
  유: 9,
  술: 10,
  해: 11,
};

/* ------------------------------------------------------------- 계산 유틸 */

function josa(word: string, withBatchim: string, withoutBatchim: string) {
  const code = word.charCodeAt(word.length - 1);
  if (Number.isNaN(code) || code < 0xac00 || code > 0xd7a3) return withoutBatchim;
  return (code - 0xac00) % 28 > 0 ? withBatchim : withoutBatchim;
}

function findStarPalace(palaces: PalaceView[], cn: string): PalaceView | null {
  for (const p of palaces) {
    if (p.major.some((s) => s.cn === cn) || p.minor.some((s) => s.cn === cn) || p.adj.some((s) => s.cn === cn)) {
      return p;
    }
  }
  return null;
}

/** 2027년 그 궁(재백·부처·관록)이 되는 명반 궁의 지수 */
function score2027(chart: ChartModel, cn: string, fallback: string): number {
  const roles = chart.year2027.palaceRoles;
  const idx = roles.indexOf(cn);
  const palace = idx >= 0 ? chart.palaces[idx] : chart.palaces.find((p) => p.cn === fallback);
  return palaceScore(palace);
}

/* ------------------------------------------------------------------ 본문 */

export function build2027(chart: ChartModel, theme: ThemeId): NewYear2027Content {
  const isC = theme === 'character';
  const stage = chart.year2027;
  const profile = profileOf(chart.primaryStar);
  const stageField = FIELD[stage.palaceName] ?? { field: '나', keyword: '나' };

  const mutagen: Year2027Mutagen[] = (stage.mutagen.length
    ? stage.mutagen
    : [
        { name: '태음', cn: '太阴', mutagen: '화록' },
        { name: '천동', cn: '天同', mutagen: '화권' },
        { name: '천기', cn: '天机', mutagen: '화과' },
        { name: '거문', cn: '巨门', mutagen: '화기' },
      ]
  ).map((m) => {
    const palace = findStarPalace(chart.palaces, m.cn) ?? chart.soulPalace;
    const field = (FIELD[palace.name] ?? { field: '나' }).field;
    const copy = MUTAGEN_COPY[m.mutagen ?? '화록'] ?? MUTAGEN_COPY['화록'];
    return {
      mutagen: m.mutagen ?? '화록',
      star: m.name,
      palace: palace.name,
      field,
      line: isC ? copy.c(field) : copy.m(field),
      action: isC ? copy.action.c(field) : copy.action.m(field),
    };
  });

  const roku = mutagen.find((m) => m.mutagen === '화록') ?? mutagen[0];
  const gi = mutagen.find((m) => m.mutagen === '화기') ?? mutagen[mutagen.length - 1];

  const needElement = needElementFor(chartElementOf(chart));
  const stone = STONE[needElement];

  /* 열두 달 — 사화 넷이 앉은 궁의 지지(地支)를 달로 바꿔 표시합니다. */
  const toneByMonth = new Map<number, { tone: MonthTone; field: string }>();
  const toneOrder: Array<[string, MonthTone]> = [
    ['화록', 'open'],
    ['화권', 'push'],
    ['화과', 'name'],
    ['화기', 'care'],
  ];
  toneOrder.forEach(([key, tone]) => {
    const item = mutagen.find((m) => m.mutagen === key);
    if (!item) return;
    const palace = chart.palaces.find((p) => p.name === item.palace);
    const month = palace ? BRANCH_MONTH[palace.branch] : undefined;
    if (month && !toneByMonth.has(month)) toneByMonth.set(month, { tone, field: item.field });
  });

  const months: Year2027Month[] = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const base = MONTH_BASE[i];
    const hit = toneByMonth.get(month);
    if (!hit) {
      return {
        month,
        tone: 'steady',
        title: base.title,
        body: isC ? base.body.c : base.body.m,
        action: isC ? base.action.c : base.action.m,
      };
    }
    const copy = MONTH_COPY[hit.tone];
    return {
      month,
      tone: hit.tone,
      title: copy.title,
      body: isC ? copy.body.c(hit.field) : copy.body.m(hit.field),
      action: isC ? copy.action.c : copy.action.m,
    };
  });

  const keywords: [string, string, string] = (() => {
    const first = profile.keywords[0];
    const second = stageField.keyword;
    let third: string = ELEMENT_KEYWORD[needElement];
    if (third === first || third === second) third = '한 걸음';
    return [first, second, third];
  })();

  const headline = isC
    ? `2027년은 ${roomOf(stage.palaceName)}에 불이 들어오는 해예요. ${roku.field}${josa(roku.field, '이', '가')} 먼저 움직이고, 그 뒤로 나머지가 따라와요.`
    : `2027년은 ${stage.palaceName}에 불이 들어오는 해입니다. ${roku.field}${josa(roku.field, '이', '가')} 먼저 움직이고, 그 뒤로 나머지가 따라옵니다.`;

  const advice = isC
    ? `${roomOf(gi.palace)}${josa(roomOf(gi.palace), '은', '는')} 2027년에 가장 예민한 자리예요. 여기서만큼은 서두르지 말고 한 번 더 확인해 보세요.`
    : `${gi.palace}${josa(gi.palace, '은', '는')} 올해 가장 예민한 자리입니다. 여기서만큼은 서두르지 말고 한 번 더 확인하세요.`;

  const flowFree = isC
    ? `한 해의 중심은 ${roomOf(stage.palaceName)}(${stage.palaceDomain})으로 옮겨가요. 정미년의 불은 크게 타오르기보다 오래 타는 불이라, 한 번에 벌이기보다 열두 달에 나눠 쌓는 쪽이 남아요.`
    : `한 해의 중심은 ${stage.palaceName}(${stage.palaceDomain})으로 옮겨갑니다. 정미년의 불은 크게 타오르기보다 오래 타는 불이라, 한 번에 벌이기보다 열두 달에 나눠 쌓는 쪽이 남습니다.`;

  const flowLocked = isC
    ? `별빛 네 개가 어느 자리에 앉았는지에 따라 상반기와 하반기의 문이 갈려요. 달마다 무엇을 미루고 무엇을 먼저 할지, 어느 달에 큰돈을 쓰지 말아야 하는지가 리포트에 담겨 있어요.`
    : `사화 네 개가 어느 자리에 앉았는지에 따라 상반기와 하반기의 문이 갈립니다. 달마다 무엇을 미루고 무엇을 먼저 할지, 어느 달에 큰돈을 쓰지 말아야 하는지가 리포트에 담깁니다.`;

  /* 굿즈 목록은 lib/goodsCatalog.ts 한 벌만 씁니다 — 리포트와 같은 상품·같은 가격 */
  const goods: StoneGood[] = stoneGoods(stone, theme);

  return {
    year: 2027,
    hanja: stage.hanja || '丁未',
    stemBranch: stage.stemBranch || '정미',
    animal: '붉은 양',
    yearElement: '화토',
    age: stage.age,
    stage: { palace: stage.palaceName, domain: stage.palaceDomain, field: stageField.field },
    headline,
    keywords,
    advice,
    flow: { free: flowFree, locked: flowLocked },
    scores: {
      love: score2027(chart, '夫妻', '부처궁'),
      money: score2027(chart, '财帛', '재백궁'),
      work: score2027(chart, '官禄', '관록궁'),
    },
    mutagen,
    needElement,
    needLabel: ELEMENT_LABEL[needElement],
    needReason: isC ? NEED_REASON[needElement].c : NEED_REASON[needElement].m,
    stone: {
      name: stone.name,
      detail: isC ? stone.detail.c : stone.detail.m,
      colorHex: stone.colorHex,
      colorSoft: stone.colorSoft,
    },
    habits: isC ? HABITS[needElement].c : HABITS[needElement].m,
    months,
    goods,
    note: isC
      ? '이 부적은 소장용이에요. 효능을 보장하지 않으며, 의료·투자 판단의 근거가 아니에요.'
      : '이 부적은 소장용입니다. 효능을 보장하지 않으며 의료·투자 판단의 근거가 아닙니다.',
  };
}

/** 공유 문구 (부적 카드 저장·공유 버튼) */
export function amuletShareText(chart: ChartModel, content: NewYear2027Content): string {
  const who = chart.name ? `${chart.name} 님의 ` : '';
  return [
    `${who}2027 정미년 신년 부적`,
    `#${content.keywords.join(' #')}`,
    content.advice,
    '',
    '별의 속삭임 — 2027 신년 운세 무료 부적',
  ].join('\n');
}
