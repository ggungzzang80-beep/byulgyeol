/**
 * 2026 병오년(丙午) 마무리 운세 콘텐츠 (year2026.ts)
 * ------------------------------------------------------------------
 * 2026-11-25 @kooleumi8 피드백 7번: 2027 신년 운세를 메인으로 두고,
 * 곧 끝나는 2026년 운세는 마감 할인 상품(정가 6,900 → 1,900원)으로 따로 팝니다.
 *
 * 이 리포트는 '한 해를 닫는' 용도라 열두 달 전체가 아니라
 *   · 2026년 유년 별방과 별빛 네 개
 *   · 남은 두 달(11·12월)에 먼저 할 일
 *   · 2027로 넘어가기 전 정리 세 가지
 * 만 담습니다. 숫자·자리는 모두 명반에서 나온 값입니다.
 */
import type { ChartModel, StarView } from './chart';
import { palaceScore } from './content';
import { roomOf } from './friendly';
/** 별빛 하나가 이번 해에 하던 일 */
export type RosyLine = {
  mutagen: string;
  star: string;
  field: string;
  line: string;
  action: string;
};

/** 궁 → 분야 (캐릭터 말투) */
const FIELD: Record<string, string> = {
  명궁: '나',
  형제궁: '가까운 사람',
  부처궁: '연애',
  자녀궁: '창작',
  재백궁: '돈',
  질액궁: '몸',
  천이궁: '바깥일',
  노복궁: '함께하는 사람',
  관록궁: '일',
  전택궁: '집',
  복덕궁: '마음',
  부모궁: '배움',
};

/** 별빛 네 개가 그 분야에서 하는 일 — 캐릭터 테마 반말 */
const LIGHT_COPY: Record<string, { line: (f: string) => string; action: (f: string) => string }> = {
  화록: {
    line: (f) => `${f} 쪽으로 복이 들어온 한 해였어. 먼저 손을 뻗은 만큼 남았어.`,
    action: (f) => `${f}에서 받은 것을 한 줄로 적어 둬. 내년에 그대로 써.`,
  },
  화권: {
    line: (f) => `${f} 쪽에서 주도권을 쥐었어. 세게 밀었던 만큼 반발도 있었고.`,
    action: (f) => `${f}에서 끝내지 못한 결정 하나를 12월 안에 닫아.`,
  },
  화과: {
    line: (f) => `${f} 쪽에서 이름이 남았어. 기록하고 알린 만큼 돌아왔어.`,
    action: (f) => `${f}에서 남긴 기록을 한 군데 모아 둬.`,
  },
  화기: {
    line: (f) => `${f} 쪽에서 같은 문제가 반복됐어. 미련이 제일 무거웠을 거야.`,
    action: (f) => `${f}에서 미련 하나를 내려놓아. 새로 벌이지 말고 정리만.`,
  },
};

function findStarPalace(chart: ChartModel, cn: string) {
  for (const p of chart.palaces) {
    if (p.major.some((s) => s.cn === cn) || p.minor.some((s) => s.cn === cn) || p.adj.some((s) => s.cn === cn)) {
      return p;
    }
  }
  return chart.soulPalace;
}

function score2026(chart: ChartModel, cn: string, fallback: string): number {
  const roles = chart.year2026.palaceRoles;
  const idx = roles.indexOf(cn);
  const palace = idx >= 0 ? chart.palaces[idx] : chart.palaces.find((p) => p.cn === fallback);
  return palaceScore(palace);
}

export type ClosingMonth = { month: number; title: string; body: string; action: string };

export type Year2026Content = {
  year: 2026;
  stemBranch: string;
  hanja: string;
  animal: string;
  age: number;
  stage: { palace: string; field: string };
  headline: string;
  lines: RosyLine[];
  months: ClosingMonth[];
  scores: { love: number; money: number; work: number };
  reset: string[];
  note: string;
};

/** 남은 두 달 — 11월은 사람과 정리, 12월은 결산 */
function closingMonths(chart: ChartModel): ClosingMonth[] {
  const gi = chart.year2026.mutagen.find((m) => m.mutagen === '화기');
  const giField = gi ? FIELD[findStarPalace(chart, gi.cn).name] ?? '마음' : '마음';
  const roku = chart.year2026.mutagen.find((m) => m.mutagen === '화록');
  const rokuField = roku ? FIELD[findStarPalace(chart, roku.cn).name] ?? '나' : '나';

  return [
    {
      month: 11,
      title: '사람에게서 풀리는 달',
      body: `2026년에 도움을 준 사람에게 먼저 고마움을 전해 봐. ${rokuField} 쪽 기회는 사람을 통해 다시 와.`,
      action: '미뤄 둔 연락 세 통, 이번 주 안에.',
    },
    {
      month: 12,
      title: '한 해를 닫는 달',
      body: `${giField} 쪽에 남은 미련을 여기서 정리해. 2026년 계획은 12월에 닫아야 2027년이 가벼워져.`,
      action: '12월 28일까지 결산 한 줄 + 세금·구독 점검.',
    },
  ];
}

export function build2026(chart: ChartModel): Year2026Content {
  const stage = chart.year2026;
  const stageField = FIELD[stage.palaceName] ?? '나';

  const mutagen: StarView[] = stage.mutagen.length
    ? stage.mutagen
    : [
        { name: '태음', cn: '太阴', mutagen: '화록' },
        { name: '천동', cn: '天同', mutagen: '화권' },
        { name: '천기', cn: '天机', mutagen: '화과' },
        { name: '거문', cn: '巨门', mutagen: '화기' },
      ];

  const lines: RosyLine[] = mutagen.map((m) => {
    const palace = findStarPalace(chart, m.cn);
    const field = FIELD[palace.name] ?? '나';
    const copy = LIGHT_COPY[m.mutagen ?? '화록'] ?? LIGHT_COPY['화록'];
    return {
      mutagen: m.mutagen ?? '화록',
      star: m.name,
      field,
      line: copy.line(field),
      action: copy.action(field),
    };
  });

  const gi = mutagen.find((m) => m.mutagen === '화기');
  const giField = gi ? FIELD[findStarPalace(chart, gi.cn).name] ?? '마음' : '마음';

  return {
    year: 2026,
    stemBranch: stage.stemBranch || '병오',
    hanja: stage.hanja || '丙午',
    animal: '붉은 말',
    age: stage.age,
    stage: { palace: stage.palaceName, field: stageField },
    headline: `2026년은 ${roomOf(stage.palaceName)}(${stageField}) 쪽에 불이 들어온 해였어. 남은 두 달은 ${giField} 쪽 미련을 정리하는 데 쓰면 2027년이 훨씬 가벼워져.`,
    lines,
    months: closingMonths(chart),
    scores: {
      love: score2026(chart, '夫妻', '부처궁'),
      money: score2026(chart, '财帛', '재백궁'),
      work: score2026(chart, '官禄', '관록궁'),
    },
    reset: [
      `${giField} 쪽에서 올해 반복된 장면 하나를 적어 봐. 같은 일이 2027년에 또 오면 그때는 다르게.`,
      '2026년에 산 것 중 안 쓴 것 세 개를 정리해. 버린 만큼 2027년 자리가 생겨.',
      '12월에 꼭 끝낼 일 하나만 정해. 여러 개를 잡으면 하나도 안 끝나.',
    ],
    note: '이 리포트는 2026년 한 해만 짚은 마감용 이야기야. 2027년 열두 달은 신년 운세에서 이어져.',
  };
}
