/**
 * 수호 원석 굿즈 카탈로그 정본 (goodsCatalog.ts)
 * ------------------------------------------------------------------
 * 2026-11-24 통일 확정(@kooleumi8): 자미원(미스틱)과 별의 속삭임(캐릭터) 두 테마가
 * **같은 상품 3종·같은 이름·같은 가격**을 씁니다. 말투(반말/합니다체)와 소재 설명만 다릅니다.
 *   · 수호 원석 팔찌 (6mm)          19,900원
 *   · 2027 정미년 금박 부적 참      12,900원
 *   · 수호별 문양 아크릴 키링         9,900원
 * 1단계(수호 원석 카드)·4단계(2027 부적)·리포트(굿즈 코너) 세 화면이 모두 이 한 벌을 씁니다.
 * 실제 판매·결제는 아직 연결되어 있지 않습니다(출시 준비 중).
 */
import type { StoneSpec } from './stones';

export type StoneGood = {
  id: string;
  label: string;
  name: string;
  material: string;
  detail: string;
  care: string;
  price: number;
  tag?: string;
};

/** 원석 이름에서 팔찌 상품명을 만듭니다 (리포트·부적 단계·굿즈 코너 공통, 두 테마 동일) */
export function braceletName(stone: StoneSpec): string {
  return `${stone.main} 수호 원석 팔찌`;
}

/**
 * 보완 기운 → 굿즈 3종.
 * 두 테마가 상품·이름·가격은 같고, 설명 문장의 말투만 다릅니다.
 */
export function stoneGoods(stone: StoneSpec, theme: 'mystic' | 'character'): StoneGood[] {
  const c = theme === 'character';
  return [
    {
      id: 'bracelet',
      label: '수호 원석 팔찌',
      name: braceletName(stone),
      material: '6mm 내추럴 스톤 · 조절 실',
      detail: c
        ? `${stone.detail.c} 2027년에는 왼손에 차면 좋아.`
        : `${stone.detail.m} 2027년에는 왼손에 차는 것을 권합니다.`,
      care: c
        ? '물에 오래 담그지 말고, 한 달에 한 번 달빛 아래 두면 좋아.'
        : '물에 오래 담그지 말고, 한 달에 한 번 달빛 아래 두십시오.',
      price: 19900,
      tag: '가장 먼저 나올 굿즈',
    },
    {
      id: 'charm',
      label: '신년 부적 참',
      name: '2027 정미년 금박 부적 참',
      material: '황동 · 금박 압인 · 4cm',
      detail: c
        ? '가방이나 파우치에 다는 손바닥 크기 부적이에요. 부적 카드와 같은 문양이 새겨져 있어요.'
        : '가방이나 파우치에 다는 손바닥 크기 부적입니다. 부적 카드와 같은 문양이 새겨집니다.',
      care: c
        ? '물과 땀에 약해. 닦아서 파우치에 넣어 두면 오래가.'
        : '물과 땀에 약합니다. 닦아서 파우치에 넣어 두십시오.',
      price: 12900,
    },
    {
      id: 'keyring',
      label: '별빛 키링',
      name: '수호별 문양 아크릴 키링',
      material: '아크릴 3mm · 양면 인쇄 · 이니셜 각인',
      detail: c
        ? '내 수호별 문양과 이니셜을 새긴 키링. 가방·파우치에 달아 두면 좋아.'
        : '내 수호별 문양과 이니셜을 새긴 키링입니다. 가방·파우치에 달아 두십시오.',
      care: c ? '직사광선을 피해 보관해 주세요.' : '직사광선을 피해 보관하십시오.',
      price: 9900,
    },
  ];
}
