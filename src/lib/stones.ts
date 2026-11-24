/**
 * 보완 기운 · 수호 원석 단일 정본 (stones.ts)
 * ------------------------------------------------------------------
 * QA(2026-11-24): 1단계·PDF 리포트는 '목(그린 아벤투린·제이드)', 4단계 부적은
 * '수(라피스 라줄리·자수정)'로 같은 명반에 다른 원석이 나왔습니다.
 * 원인은 계산도, 원석표도 두 벌이었기 때문입니다.
 *   - guardianGoods.ts  : '가장 낮은 궁 지수'의 오행을 보완 기운으로 사용
 *   - newyear2027.ts    : 명반 오행국과 2027 정미년 화(火)의 관계로 보완 기운을 계산
 * 이 파일 하나가 보완 기운 계산과 오행별 원석 표를 모두 가집니다.
 * 화면(1단계 수호 원석 · 4단계 부적 카드 · PDF 리포트)은 전부 이 파일만 씁니다.
 *
 * 규칙(정본): 보완 기운은 '명반 오행국 + 2027 정미년의 불'의 관계로 정합니다.
 *   수 → 목, 목 → 수, 화 → 수, 금 → 토, 토 → 수
 */
import type { ChartModel } from './chart';

export type ElementKey = '목' | '화' | '토' | '금' | '수';

export const ELEMENTS: ElementKey[] = ['목', '화', '토', '금', '수'];

/** 화면·리포트에 쓰는 오행 이름 */
export const ELEMENT_LABEL: Record<ElementKey, string> = {
  목: '목(木) · 성장과 시작',
  화: '화(火) · 열정과 표현',
  토: '토(土) · 안정과 신뢰',
  금: '금(金) · 결단과 재물',
  수: '수(水) · 회복과 지혜',
};

/** 카드 키워드에 끼워 넣는 한 단어 */
export const ELEMENT_KEYWORD: Record<ElementKey, string> = {
  목: '성장',
  화: '표현',
  토: '안정',
  금: '결단',
  수: '회복',
};

export type StoneSpec = {
  /** 화면·카드에 쓰는 정식 이름 */
  name: string;
  /** 팔찌 상품명에 쓰는 대표 원석 */
  main: string;
  /** 테마별 설명 (c = 별의 속삭임 반말 / m = 자미원 합니다체) */
  detail: { c: string; m: string };
  colorHex: string;
  colorSoft: string;
};

/**
 * 오행별 수호 원석 — 이 표가 유일한 정본입니다.
 * (보조 원석까지 한 벌만 씁니다: 목 그린 아벤투린·제이드 / 화 카넬리안·로즈 쿼츠 /
 *  토 시트린·호안석 / 금 문스톤·백수정 / 수 라피스 라줄리·자수정)
 */
export const STONE: Record<ElementKey, StoneSpec> = {
  목: {
    name: '그린 아벤투린 · 제이드',
    main: '그린 아벤투린',
    detail: {
      c: '새싹처럼 자라는 초록 원석. 아침 햇살이 드는 자리에 두면 좋아.',
      m: '새싹처럼 자라나는 기운을 상징하는 초록 원석. 아침 햇살이 드는 자리에 두면 좋습니다.',
    },
    colorHex: '#6fbf9a',
    colorSoft: 'rgba(111,191,154,0.16)',
  },
  화: {
    name: '카넬리안 · 로즈 쿼츠',
    main: '카넬리안',
    detail: {
      c: '심장 가까이 두는 붉은 원석. 표정이 먼저 밝아지는 기운이야.',
      m: '심장 가까이 두는 붉은 원석. 말보다 먼저 표정이 밝아지는 기운을 상징합니다.',
    },
    colorHex: '#e98d8d',
    colorSoft: 'rgba(233,141,141,0.16)',
  },
  토: {
    name: '시트린 · 호안석',
    main: '시트린',
    detail: {
      c: '노란 빛으로 중심을 잡아주는 원석. 늘 보는 책상 위에 두면 좋아.',
      m: '노란 빛으로 중심을 잡아주는 원석. 식탁이나 책상처럼 늘 보는 자리에 두십시오.',
    },
    colorHex: '#e3b45f',
    colorSoft: 'rgba(227,180,95,0.16)',
  },
  금: {
    name: '문스톤 · 백수정',
    main: '문스톤',
    detail: {
      c: '흐린 달빛 같은 흰 원석. 결정을 앞둔 날 손목에 차면 마음이 정리돼.',
      m: '흐린 달빛 같은 흰 원석. 결정을 앞둔 날 손목에 차면 마음이 정리됩니다.',
    },
    colorHex: '#c9c3d6',
    colorSoft: 'rgba(201,195,214,0.2)',
  },
  수: {
    name: '라피스 라줄리 · 자수정',
    main: '라피스 라줄리',
    detail: {
      c: '깊은 물빛 원석. 잠들기 전 손바닥에 올려두면 생각이 가라앉아.',
      m: '깊은 물빛 원석. 잠들기 전 손바닥에 올려두면 생각이 가라앉습니다.',
    },
    colorHex: '#7f9fd8',
    colorSoft: 'rgba(127,159,216,0.18)',
  },
};

/** 보완 기운을 권하는 이유 — 명반 오행국에 따라 달라집니다 */
export const NEED_REASON: Record<ElementKey, { c: string; m: string }> = {
  목: {
    c: '물의 해를 지나오며 불의 기운이 크게 들어와. 물과 불 사이에 나무를 하나 심으면, 부딪히던 기운이 흐름으로 바뀌어.',
    m: '물의 해를 지나오며 불의 기운이 크게 들어옵니다. 물과 불 사이에 나무를 하나 심으면 부딪히던 기운이 흐름으로 바뀝니다.',
  },
  수: {
    c: '정미년의 불은 오래 타는 불이야. 물을 곁에 두면 열기가 마음까지 번지지 않고, 판단이 차분해져.',
    m: '정미년의 불은 오래 타는 불입니다. 물을 곁에 두면 열기가 마음까지 번지지 않고 판단이 차분해집니다.',
  },
  토: {
    c: '불이 쇠를 녹이는 해라, 중간에 흙을 하나 놓아야 해. 흙이 열을 받아 안아주면 결과물이 남아.',
    m: '불이 쇠를 녹이는 해입니다. 그 사이에 흙을 하나 놓아야 합니다. 흙이 열을 받아 안아주면 결과물이 남습니다.',
  },
  화: {
    c: '이미 불이 많은 해라 불을 더할 필요가 없어. 표현할 곳을 하나 정하고, 나머지는 덜어내는 게 좋아.',
    m: '이미 불이 많은 해입니다. 불을 더할 필요가 없습니다. 표현할 곳을 하나 정하고 나머지는 덜어내는 편이 좋습니다.',
  },
  금: {
    c: '불이 불을 만나는 해라 열이 겹쳐. 결론을 내리는 힘을 아껴두면, 결정적인 순간에 한 번에 쓸 수 있어.',
    m: '불이 불을 만나는 해라 열기가 겹칩니다. 결론을 내리는 힘을 아껴두면 결정적인 순간에 한 번에 쓸 수 있습니다.',
  },
};

/** 명반 오행국 문자열('수국', '금국' …)의 첫 글자 */
export function chartElementOf(chart: ChartModel): ElementKey {
  const first = (chart.fiveElements ?? '').trim().charAt(0);
  return (ELEMENTS as string[]).includes(first) ? (first as ElementKey) : '토';
}

/** 2027의 불(丁)과 명반 오행국이 만날 때 메워야 할 기운 — 유일한 계산식 */
export function needElementFor(chartElement: ElementKey): ElementKey {
  // 수 ↔ 화는 목이 사이를 잇고, 화 → 금은 토가 완충합니다.
  switch (chartElement) {
    case '수':
      return '목';
    case '목':
      return '수';
    case '화':
      return '수';
    case '금':
      return '토';
    case '토':
    default:
      return '수';
  }
}

/** 명반 하나에서 보완 기운을 바로 얻습니다 (1단계·4단계·PDF 공통) */
export function needElementOf(chart: ChartModel): ElementKey {
  return needElementFor(chartElementOf(chart));
}

export type NeedElement = {
  element: ElementKey;
  label: string;
  keyword: string;
  stone: StoneSpec;
  reason: string;
};

/** 테마 말투까지 반영한 보완 기운 묶음 */
export function needElementInfo(chart: ChartModel, theme: 'mystic' | 'character'): NeedElement {
  const element = needElementOf(chart);
  return {
    element,
    label: ELEMENT_LABEL[element],
    keyword: ELEMENT_KEYWORD[element],
    stone: STONE[element],
    reason: theme === 'character' ? NEED_REASON[element].c : NEED_REASON[element].m,
  };
}
