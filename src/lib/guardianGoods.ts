/**
 * 수호 원석 · 행운 굿즈 추천 (guardianGoods.ts)
 * ------------------------------------------------------------------
 * 보완 기운과 원석 이름·색은 lib/stones.ts 한 곳에서만 가져옵니다.
 * (QA 2026-11-24: 1단계·PDF와 4단계 부적이 서로 다른 원석을 보여 주던 문제)
 * 이 파일은 '가장 낮은 궁 지수'를 근거 문장으로 붙이고, 팔찌·키링 같은
 * 굿즈 목록을 고르는 역할만 합니다. 실제 결제·배송은 연결하지 않습니다.
 */
import type { ChartModel } from './chart';
import { palaceScore } from './content';
import { ELEMENTS, needElementInfo, type ElementKey } from './stones';
import { stoneGoods, type StoneGood } from './goodsCatalog';

export type { ElementKey, StoneGood };

/** 리포트 굿즈 카드도 카탈로그와 같은 모양을 씁니다. */
export type GuardianGood = StoneGood;

export type GuardianRecommendation = {
  chartElement: ElementKey;
  chartElementLabel: string;
  weakestArea: string;
  weakestScore: number;
  needElement: ElementKey;
  needLabel: string;
  headline: string;
  reason: string;
  stone: string;
  stoneDetail: string;
  colorHex: string;
  colorSoft: string;
  goods: GuardianGood[];
};

function chartElement(chart: ChartModel): ElementKey {
  const first = chart.fiveElements.trim().charAt(0);
  return (ELEMENTS as string[]).includes(first) ? (first as ElementKey) : '토';
}

export function guardianRecommendation(
  chart: ChartModel,
  theme: 'mystic' | 'character',
): GuardianRecommendation {
  const areas = [
    { name: '금전', palace: '재백궁', element: '금' as ElementKey, score: palaceScore(chart.palaces.find((p) => p.name === '재백궁')) },
    { name: '연애', palace: '부처궁', element: '화' as ElementKey, score: palaceScore(chart.palaces.find((p) => p.name === '부처궁')) },
    { name: '일', palace: '관록궁', element: '목' as ElementKey, score: palaceScore(chart.palaces.find((p) => p.name === '관록궁')) },
  ].sort((a, b) => a.score - b.score);

  const weakest = areas[0];
  /* 보완 기운은 stones.ts 정본 계산만 씁니다 — 부적 카드·PDF와 같은 값이 나옵니다. */
  const need = needElementInfo(chart, theme);
  const stone = need.stone;

  const headline =
    theme === 'character'
      ? `${need.element} 기운을 채워줄 수호 원석이야 — ${weakest.name} 쪽이 ${weakest.score}점으로 가장 흐려서 여기부터 채우면 좋아`
      : `${need.element}의 기운을 채우는 원석을 권합니다. ${weakest.name} 지수가 ${weakest.score}점으로 가장 낮습니다.`;

  const reason =
    theme === 'character'
      ? `오행국은 ${chart.fiveElements}. ${weakest.palace} 지수가 ${weakest.score}점으로 가장 낮고, ${need.reason}`
      : `오행국은 ${chart.fiveElements}. ${weakest.palace} 지수가 ${weakest.score}점으로 가장 낮습니다. ${need.reason}`;

  return {
    chartElement: chartElement(chart),
    chartElementLabel: need.label,
    weakestArea: weakest.name,
    weakestScore: weakest.score,
    needElement: need.element,
    needLabel: need.label,
    headline,
    reason,
    stone: stone.name,
    stoneDetail: theme === 'character' ? stone.detail.c : stone.detail.m,
    colorHex: stone.colorHex,
    colorSoft: stone.colorSoft,
    goods: stoneGoods(stone, theme),
  };
}
