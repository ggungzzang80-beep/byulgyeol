/**
 * 수호 원석 · 행운 굿즈 추천 (guardianGoods.ts)
 * ------------------------------------------------------------------
 * 명반의 오행국과 가장 낮은 궁 지수를 근거로 "부족한 기운"을 정하고,
 * 그 기운을 상징하는 원석/소품을 추천합니다.
 * 실제 결제·배송은 연결하지 않고, 스마트스토어 연동을 위한 데이터 구조만
 * 준비해 둡니다. (효능을 보장하지 않는 자기이해용 소품)
 */
import type { ChartModel } from './chart';
import { palaceScore } from './content';

export type ElementKey = '목' | '화' | '토' | '금' | '수';

export type GuardianGood = {
  id: string;
  label: string;
  name: string;
  detail: string;
  price: number;
  tag?: string;
};

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

const ELEMENT_KR: Record<ElementKey, string> = {
  목: '목(木) · 성장과 시작',
  화: '화(火) · 열정과 표현',
  토: '토(土) · 안정과 신뢰',
  금: '금(金) · 결단과 재물',
  수: '수(水) · 회복과 지혜',
};

const STONE: Record<ElementKey, { stone: string; detail: string; color: string; soft: string }> = {
  목: {
    stone: '그린 아벤투린 · 제이드',
    detail: '새싹처럼 자라나는 기운을 상징하는 초록 원석. 아침 햇살 아래 두면 좋습니다.',
    color: '#6fbf9a',
    soft: 'rgba(111,191,154,0.16)',
  },
  화: {
    stone: '카넬리안 · 로즈 쿼츠',
    detail: '심장 가까이 두는 붉은 원석. 말보다 먼저 표정이 밝아지는 기운을 상징합니다.',
    color: '#e98d8d',
    soft: 'rgba(233,141,141,0.16)',
  },
  토: {
    stone: '시트린 · 황옥',
    detail: '노란 빛으로 중심을 잡아주는 원석. 식탁이나 책상처럼 늘 보는 자리에 두세요.',
    color: '#e3b45f',
    soft: 'rgba(227,180,95,0.16)',
  },
  금: {
    stone: '백수정 · 문스톤',
    detail: '흐린 달빛 같은 흰 원석. 결정을 앞둔 날 손목에 차면 마음이 정리됩니다.',
    color: '#c9c3d6',
    soft: 'rgba(201,195,214,0.2)',
  },
  수: {
    stone: '라피스 라줄리 · 아쿠아마린',
    detail: '깊은 물빛 원석. 잠들기 전 손바닥에 올려두면 생각이 가라앉습니다.',
    color: '#7f9fd8',
    soft: 'rgba(127,159,216,0.18)',
  },
};

function chartElement(chart: ChartModel): ElementKey {
  const first = chart.fiveElements.trim().charAt(0);
  return (['목', '화', '토', '금', '수'] as ElementKey[]).includes(first as ElementKey)
    ? (first as ElementKey)
    : '토';
}

/** 가장 낮은 궁 지수 → 보완할 기운 */
export function guardianRecommendation(chart: ChartModel, theme: 'mystic' | 'character'): GuardianRecommendation {
  const areas = [
    { name: '금전', palace: '재백궁', element: '금' as ElementKey, score: palaceScore(chart.palaces.find((p) => p.name === '재백궁')) },
    { name: '연애', palace: '부처궁', element: '화' as ElementKey, score: palaceScore(chart.palaces.find((p) => p.name === '부처궁')) },
    { name: '일', palace: '관록궁', element: '목' as ElementKey, score: palaceScore(chart.palaces.find((p) => p.name === '관록궁')) },
  ].sort((a, b) => a.score - b.score);

  const weakest = areas[0];
  const element = weakest.element;
  const stone = STONE[element];

  const goods: GuardianGood[] =
    theme === 'character'
      ? [
          {
            id: 'bracelet',
            label: '수호 원석 팔찌',
            name: `${stone.stone.split(' · ')[0]} 비즈 팔찌`,
            detail: '가디언이 골라준 원석을 손목에. 6mm 비즈 · 조절 가능',
            price: 19900,
            tag: '가장 먼저 나올 굿즈',
          },
          {
            id: 'sticker',
            label: '행운 부적 스티커',
            name: '별빛 가디언 부적 스티커 6종',
            detail: '다이어리·노트북에 붙이는 손바닥 크기 부적. 방수 코팅',
            price: 5900,
          },
          {
            id: 'keyring',
            label: '별빛 키링',
            name: '수호별 문양 아크릴 키링',
            detail: '내 수호별 이니셜 각인 · 가방·파우치에',
            price: 9900,
          },
        ]
      : [
          {
            id: 'bracelet',
            label: '수호 원석 팔찌',
            name: `${stone.stone.split(' · ')[0]} 수호 원석 팔찌`,
            detail: '8mm 내추럴 스톤 · 실버 조절 고리 · 각인 가능',
            price: 29000,
            tag: '가장 먼저 나올 굿즈',
          },
          {
            id: 'amulet',
            label: '행운 부적 카드',
            name: '紫微垣 금박 부적 카드 3매',
            detail: '지갑에 넣는 명궁 부적 · 금박 압인 · 케이스 포함',
            price: 9900,
          },
          {
            id: 'keyring',
            label: '별자리 키링',
            name: '내 명궁 성좌 키링',
            detail: '명궁 주성의 성좌를 새긴 황동 키링',
            price: 15000,
          },
        ];

  const needLabel = ELEMENT_KR[element];
  const headline =
    theme === 'character'
      ? `${weakest.name}의 별이 조금 흐려. ${element} 기운을 채워줄 수호 원석이야`
      : `${weakest.name} 지수가 ${weakest.score}로 가장 낮습니다. ${element}의 기운을 채우는 원석을 권합니다.`;

  const reason = `오행국은 ${chart.fiveElements}, ${weakest.palace} 지수는 ${weakest.score}입니다. ${needLabel}의 기운을 상징하는 원석과 소품을 곁에 두면 마음이 잡히는 감각을 얻기 좋습니다.`;

  return {
    chartElement: chartElement(chart),
    chartElementLabel: ELEMENT_KR[chartElement(chart)],
    weakestArea: weakest.name,
    weakestScore: weakest.score,
    needElement: element,
    needLabel,
    headline,
    reason,
    stone: stone.stone,
    stoneDetail: stone.detail,
    colorHex: stone.color,
    colorSoft: stone.soft,
    goods,
  };
}
