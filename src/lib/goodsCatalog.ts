/**
 * 수호 원석 굿즈 카탈로그 정본 (goodsCatalog.ts)
 * ------------------------------------------------------------------
 * QA(2026-11-24) 2번: 같은 원석 팔찌가 1단계(수호 원석 카드)·4단계(2027 부적)·
 * 리포트(굿즈 코너)에서 이름·가격이 서로 달랐습니다. 굿즈 목록을 두 벌로
 * 정의해 두었기 때문입니다.
 * 이제 이 파일의 카탈로그 한 벌을 세 화면이 모두 씁니다.
 *   - 테마별로 말투와 소재·가격대만 다르고, 같은 테마 안에서는 완전히 같은 상품입니다.
 *   - 실제 판매·결제는 아직 연결되어 있지 않습니다(출시 준비 중).
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

/** 원석 이름에서 팔찌 상품명을 만듭니다 (리포트·부적 단계·굿즈 코너 공통) */
export function braceletName(stone: StoneSpec, theme: 'mystic' | 'character'): string {
  return theme === 'character' ? `${stone.main} 비즈 팔찌` : `${stone.main} 수호 원석 팔찌`;
}

/**
 * 보완 기운 → 굿즈 3종.
 * 같은 테마에서는 어느 화면에서든 이 목록 그대로 보입니다.
 */
export function stoneGoods(stone: StoneSpec, theme: 'mystic' | 'character'): StoneGood[] {
  return theme === 'character'
    ? [
        {
          id: 'bracelet',
          label: '수호 원석 팔찌',
          name: braceletName(stone, theme),
          material: '6mm 내추럴 스톤 · 조절 실',
          detail: `${stone.detail.c} 2027년에는 왼손에 차면 좋아.`,
          care: '물에 오래 담그지 말고, 한 달에 한 번 달빛 아래 두면 좋아.',
          price: 19900,
          tag: '가장 먼저 나올 굿즈',
        },
        {
          id: 'charm',
          label: '신년 부적 참',
          name: '2027 정미년 금박 부적 참',
          material: '황동 · 금박 압인 · 4cm',
          detail: '가방이나 파우치에 다는 손바닥 크기 부적. 부적 카드와 같은 문양이 새겨져 있어.',
          care: '물과 땀에 약해. 닦아서 파우치에 넣어 두면 오래가.',
          price: 12900,
        },
        {
          id: 'keyring',
          label: '별빛 키링',
          name: '수호별 문양 아크릴 키링',
          material: '아크릴 3mm · 양면 인쇄 · 이니셜 각인',
          detail: '내 수호별 문양과 이니셜을 새긴 키링. 가방·파우치에 달아 두면 좋아.',
          care: '직사광선을 피해 보관해.',
          price: 9900,
        },
      ]
    : [
        {
          id: 'bracelet',
          label: '수호 원석 팔찌',
          name: braceletName(stone, theme),
          material: '8mm 내추럴 스톤 · 실버 조절 고리',
          detail: `${stone.detail.m} 2027년에는 왼손에 차는 것을 권합니다.`,
          care: '물에 오래 담그지 말고, 한 달에 한 번 달빛 아래 두십시오.',
          price: 29000,
          tag: '가장 먼저 나올 굿즈',
        },
        {
          id: 'charm',
          label: '신년 금박 부적',
          name: '丁未年 금박 부적 카드 3매',
          material: '금박 압인 · 케이스 포함',
          detail: '지갑에 넣는 신년 부적. 부적 카드와 같은 문양과 해의 글자가 새겨집니다.',
          care: '물과 땀에 약합니다. 닦아서 케이스에 넣어 두십시오.',
          price: 9900,
        },
        {
          id: 'keyring',
          label: '성좌 키링',
          name: '내 명궁 성좌 키링',
          material: '황동 각인',
          detail: '명궁 주성의 성좌를 새긴 황동 키링입니다.',
          care: '황동은 시간이 지나며 색이 깊어집니다.',
          price: 15000,
        },
      ];
}
