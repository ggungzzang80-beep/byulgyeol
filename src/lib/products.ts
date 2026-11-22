import type { ThemeId } from './theme';
import type { ProductSystem } from './systems';

export type ProductId = 'basic' | 'premium' | 'compat' | 'western' | 'synastry' | 'bundle' | 'newyear2027';

export type Product = {
  id: ProductId;
  /** 어느 체계의 리포트인지 — 결제 동선을 나누는 기준 */
  system: ProductSystem;
  name: string;
  hanja: string;
  price: number;
  originalPrice?: number;
  tagline: string;
  points: string[];
  badge?: string;
  recommended?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: 'basic',
    system: 'ziwei',
    name: '내 인생 사용설명서',
    hanja: '人生使用說明書',
    price: 4900,
    originalPrice: 6900,
    tagline: '명궁 · 배우자상 · 재물 · 진로 핵심만',
    points: ['명궁 주성 심층 해설', '연애 타입 · 배우자상', '직업 적성 3가지', '돈이 새는 구체적 장면', '올해의 주의 한 가지'],
  },
  {
    id: 'premium',
    system: 'ziwei',
    name: '프리미엄 12궁 & 운세 풀 리포트',
    hanja: '十二宮 全解',
    price: 12900,
    originalPrice: 19900,
    tagline: '12궁 전체 + 올해·10년 흐름',
    points: [
      '12궁별 상세 풀이 (궁마다 3문단)',
      '금전·연애·일 3지수',
      '대한(10년) · 유년(올해) 흐름',
      '월별 액션 가이드 12개',
      '사화·보좌성 총정리',
    ],
    badge: '가장 많이 선택',
    recommended: true,
  },
  {
    id: 'compat',
    system: 'ziwei',
    name: '두 사람 자미두수 궁합',
    hanja: '緣分 合婚',
    price: 9900,
    originalPrice: 12900,
    tagline: '우리가 오래 가는 조건',
    points: ['두 사람 명반 비교', '감정·생활·장기 궁합 지수', '부딪히는 지점과 넘는 법', '함께할 때의 최적 역할 분담'],
  },
  {
    id: 'western',
    system: 'western',
    name: '출생 천궁도 리포트',
    hanja: '出生天宮圖',
    price: 4900,
    originalPrice: 6900,
    tagline: '태양 · 달 · 어센던트 + 행성 7개의 하우스',
    points: [
      '태양·달·어센던트 심층 해설',
      '행성 7개의 자리와 하우스',
      '12하우스 삶의 영역 풀이',
      '주요 각(합·삼분·사분) 해석',
      '금전·연애·일 3지수',
    ],
  },
  {
    id: 'synastry',
    system: 'western',
    name: '두 사람 시너스트리 궁합',
    hanja: '合圖 星緣',
    price: 6900,
    originalPrice: 9900,
    tagline: '두 사람의 행성이 만드는 각',
    points: [
      '두 천궁도의 행성 교차 각 전체',
      '감정·끌림·오래 가는 힘 3지수',
      '관계 역학 — 겉으로 보이는 온도와 쉴 때의 모습',
      '갈등 포인트 3개와 넘는 법',
      '역할 나누기와 보완 조언',
    ],
    badge: '시너스트리',
  },
  {
    id: 'newyear2027',
    system: 'ziwei',
    name: '2027 정미년 신년 정밀 운세',
    hanja: '丁未年 年運',
    price: 9900,
    originalPrice: 12900,
    tagline: '2027 열두 달 · 보완 기운 · 수호 원석 처방',
    points: [
      '2027 유년 명궁과 사화 네 개의 자리',
      '열두 달마다 무엇을 먼저 할지',
      '2027년 연애·금전·일 3지수',
      '부족한 기운과 보완 습관 세 가지',
      '수호 원석 처방 — 기운을 곁에 두는 법',
    ],
    badge: '2027 신년',
  },
  {
    id: 'bundle',
    system: 'both',
    name: '동양 × 서양 통합 리포트',
    hanja: '東西統合',
    price: 14900,
    originalPrice: 17800,
    tagline: '자미두수 12궁 + 서양 천궁도를 교차 해석',
    points: [
      '자미두수 12궁 전체 해설',
      '서양 천궁도 전체 해설',
      '두 체계가 같은 지점을 가리킬 때의 교차 해석',
      '올해 흐름과 월별 가이드',
      '금전·연애·일 3지수',
    ],
    badge: '둘 다 한 번에',
  },
];

/** 2027 신년 상품 — 신년 부적 섹션에서만 따로 진입합니다(랜딩 5상품 그리드에는 넣지 않음). */
export const NEWYEAR_PRODUCT = PRODUCTS.find((p) => p.id === 'newyear2027')!;

export const ZIWEI_PRODUCTS = PRODUCTS.filter((p) => p.system === 'ziwei' && p.id !== 'newyear2027');
export const WESTERN_PRODUCTS = PRODUCTS.filter((p) => p.system === 'western' || p.system === 'both');

/**
 * 테마별 판매가.
 * - 자미원(미스틱): 4,900 / 12,900 / 9,900
 * - 별의 속삭임(캐릭터): 첫 상품을 3,900원(커피 한 잔 값)으로 낮춘 소액결제 라인.
 *   계산 엔진·상품 구성은 두 테마가 동일하고, 가격과 카피만 다릅니다.
 */
export const CHARACTER_FIRST_PRICE = 3900;
export const CHARACTER_COMPAT_PRICE = 6900;
export const CHARACTER_WESTERN_PRICE = 3900;
export const CHARACTER_BUNDLE_PRICE = 12900;

export const CHARACTER_NEWYEAR_PRICE = 6900;

export function productPrice(product: Product, theme: ThemeId): number {
  if (theme === 'character') {
    if (product.id === 'newyear2027') return CHARACTER_NEWYEAR_PRICE;
    if (product.id === 'basic') return CHARACTER_FIRST_PRICE;
    if (product.id === 'compat') return CHARACTER_COMPAT_PRICE;
    if (product.id === 'western') return CHARACTER_WESTERN_PRICE;
    if (product.id === 'bundle') return CHARACTER_BUNDLE_PRICE;
  }
  return product.price;
}

export function productOriginalPrice(product: Product, theme: ThemeId): number | undefined {
  if (theme === 'character' && product.id === 'newyear2027') return 9900;
  if (theme === 'character' && product.id === 'compat') return 9900;
  if (theme === 'character' && product.id === 'western') return 6900;
  if (theme === 'character' && product.id === 'bundle') return 16800;
  return product.originalPrice;
}

export type PriceInfo = {
  /** 지금 결제 금액 */
  price: number;
  /** 정가 — 할인가가 없으면 결제 금액과 같습니다 */
  original: number;
  /** 정가 대비 할인율(%) — 소수점은 반올림 */
  rate: number;
  /** 아끼는 금액 */
  save: number;
  /** 할인 표기를 쓸지 (정가 > 결제가) */
  discounted: boolean;
};

/**
 * 스텔로그 벤치마킹(2026-11-17): 상품마다 '정가 → 할인가 → 할인율 → 아끼는 금액'을
 * 한 곳에서 계산해 랜딩·결과·결제 모달이 같은 숫자를 말하게 합니다.
 */
export function productPriceInfo(product: Product, theme: ThemeId): PriceInfo {
  const price = productPrice(product, theme);
  const original = productOriginalPrice(product, theme) ?? price;
  const save = Math.max(0, original - price);
  const discounted = save > 0;
  const rate = discounted ? Math.round((save / original) * 100) : 0;
  return { price, original, rate, save, discounted };
}

/** 숫자 → '3,900' (원 단위 표기는 컴포넌트에서 붙입니다) */
export function won(value: number): string {
  return value.toLocaleString('ko-KR');
}

/**
 * '무료 공개 30%' 뒤에 남은 몫을 여는 결제 버튼 문구.
 * 모든 해금 지점에서 같은 공식을 씁니다: {가격}원으로 나머지 {70}% 열기.
 */
export function productUnlockCta(product: Product, theme: ThemeId, freePercent = 30): string {
  const { price } = productPriceInfo(product, theme);
  return `${won(price)}원으로 나머지 ${100 - freePercent}% 열기`;
}

export function productTagline(product: Product, theme: ThemeId): string {
  if (product.id === 'newyear2027') {
    return theme === 'character'
      ? '열두 달 흐름 · 보완 기운 · 수호 원석까지'
      : '2027년 열두 달의 흐름과 보완 기운, 수호 원석 처방';
  }
  if (product.id === 'synastry') {
    return theme === 'character'
      ? '두 사람 행성이 만드는 각 — 점수는 무료, 해석은 심층에서'
      : '두 천궁도의 행성 교차 각 — 점수는 무료, 해석은 심층에서';
  }
  if (theme === 'character' && product.id === 'basic') return '명궁·연애·재물·진로·배우자상 핵심만, 커피 한 잔 값으로';
  if (theme === 'character' && product.id === 'western') return '네가 태어난 하늘의 좌표 — 태양·달·어센던트';
  if (theme === 'character' && product.id === 'bundle') return '동양 별지도 + 서양 천궁도, 한 번에';
  return product.tagline;
}

export function productPoints(product: Product, theme: ThemeId): string[] {
  if (product.id === 'newyear2027') {
    return theme === 'character'
      ? [
          '2027년 네 명궁과 사화 네 개의 자리',
          '열두 달마다 뭘 먼저 할지',
          '2027년 연애·금전·일 3지수',
          '부족한 기운과 보완 습관 세 가지',
          '수호 원석 처방 — 기운을 곁에 두는 법',
        ]
      : [
          '2027 유년 명궁과 사화 네 개의 자리',
          '열두 달마다 무엇을 먼저 할지',
          '2027년 연애·금전·일 3지수',
          '부족한 기운과 보완 습관 세 가지',
          '수호 원석 처방 — 기운을 곁에 두는 법',
        ];
  }
  if (theme === 'character' && product.id === 'basic') {
    return [
      '내 수호별과 성격의 결 (명궁)',
      '끌리는 연애 타입 · 배우자상',
      '어울리는 진로 · 전공 3가지',
      '돈이 새는 장면 · 들어오는 경로',
      '올해 조심할 별방 하나',
    ];
  }
  if (theme === 'character' && product.id === 'western') {
    return [
      '태양·달·어센던트 세 개의 좌표',
      '행성 7개가 앉은 하우스',
      '12개 하우스별 삶의 영역 풀이',
      '주요 각(합·삼분·사분) 해석',
      '금전·연애·일 3지수',
    ];
  }
  if (product.id === 'synastry') {
    return theme === 'character'
      ? [
          '두 천궁도의 교차 각 전체',
          '감정의 온도 · 끌림의 세기 · 오래 가는 힘',
          '겉으로 보이는 온도와 쉴 때의 모습',
          '부딪히는 장면 3개와 넘는 법',
          '역할 나누기와 보완 조언',
        ]
      : [
          '두 천궁도의 행성 교차 각 전체',
          '감정의 온도 · 끌림의 세기 · 오래 가는 힘 3지수',
          '관계 역학 — 겉으로 보이는 온도와 쉴 때의 모습',
          '갈등 포인트 3개와 넘는 법',
          '역할 나누기와 보완 조언',
        ];
  }
  if (theme === 'character' && product.id === 'bundle') {
    return [
      '동양 별지도 12개 별방 전체',
      '서양 천궁도 12하우스 전체',
      '두 체계가 같은 곳을 가리킬 때의 교차 해석',
      '올해 흐름과 달마다 처방',
      '금전·연애·일 3지수',
    ];
  }
  return product.points;
}

/**
 * 상품 카드에 한 줄로 붙는 포함 범위.
 * 3,900원 핀셋 리포트와 12,900원 전체 리포트의 경계를 오해 없이 보여주기 위한 문구입니다.
 */
export function productScopeShort(product: Product, theme: ThemeId): string | null {
  const premiumPrice = productPrice(findProduct('premium'), theme).toLocaleString('ko-KR');
  if (product.id === 'newyear2027') {
    return '2027년 한 해 한정 · 12궁 전체 해설은 포함되지 않음';
  }
  if (product.id === 'basic') {
    return `핀셋 리포트 · 12궁 전체·월별 가이드 미포함 (프리미엄 ${premiumPrice}원)`;
  }
  if (product.id === 'premium') {
    return '12궁 전체 + 월별 액션 가이드 12개 포함';
  }
  if (product.id === 'western') {
    return '서양 점성술 단독 · 자미두수 12궁은 포함되지 않음';
  }
  if (product.id === 'synastry') {
    return '서양 점성술 궁합 · 두 사람 교차 각 전체 포함';
  }
  if (product.id === 'bundle') {
    const sum =
      productPrice(findProduct('premium'), theme) + productPrice(findProduct('western'), theme);
    const save = sum - productPrice(product, theme);
    return `두 리포트를 따로 결제하면 ${sum.toLocaleString('ko-KR')}원 — ${save.toLocaleString('ko-KR')}원 저렴`;
  }
  return null;
}

/** 결제창에 쓰는 포함 범위 설명 (테마별 말투) */
export function productScopeNote(product: Product, theme: ThemeId): string | null {
  const premiumPrice = productPrice(findProduct('premium'), theme).toLocaleString('ko-KR');
  if (product.id === 'newyear2027') {
    return theme === 'character'
      ? '2027년 한 해만 짚는 신년 리포트야. 유년 명궁과 사화 네 개, 열두 달 처방, 보완 원석까지 들어 있어. 명궁·12개 별방 전체 해설은 담기지 않아.'
      : '2027년 한 해만 짚는 신년 리포트입니다. 유년 명궁과 사화 네 개, 열두 달 처방, 보완 원석까지 포함합니다. 명궁·12궁 전체 해설은 포함되지 않습니다.';
  }
  if (product.id === 'basic') {
    return theme === 'character'
      ? `명궁·재물·연애·진로·배우자상·돈 새는 장면까지만 핵심으로 짚은 핀셋 리포트야. 12개 별방 전체 해설과 달마다 처방은 '전체 별 이야기'(${premiumPrice}원)에 들어 있어.`
      : `명궁·재물·연애·진로·배우자상·돈 새는 장면까지만 핵심으로 짚은 핀셋 리포트입니다. 12궁 전체 해설과 월별 가이드는 프리미엄 리포트(${premiumPrice}원)에 포함됩니다.`;
  }
  if (product.id === 'premium') {
    return theme === 'character'
      ? `12개 별방 전체 해설과 달마다 처방까지 모두 담긴 리포트야. (${premiumPrice}원)`
      : `12궁 전체 해설과 월별 액션 가이드 12개까지 모두 담긴 리포트입니다. (${premiumPrice}원)`;
  }
  if (product.id === 'western') {
    return theme === 'character'
      ? '태양·달·어센던트, 행성 7개의 자리와 하우스, 12개 하우스 풀이까지 담긴 서양 점성술 리포트야. 동양 자미두수 해설은 들어 있지 않아 — 그건 다른 리포트야!'
      : '태양·달·어센던트, 행성 7개의 자리와 하우스, 12하우스 풀이까지 담긴 서양 점성술 리포트입니다. 동양 자미두수 해설은 포함되지 않습니다.';
  }
  if (product.id === 'synastry') {
    return theme === 'character'
      ? '두 사람 천궁도의 행성을 교차로 맞댄 시너스트리 리포트야. 교차 각 전체와 관계 역학, 부딪히는 장면, 역할 나누기까지 담겨 있어. 한 사람 단독 천궁도 해설은 담기지 않아.'
      : '두 사람 천궁도의 행성을 교차로 맞댄 시너스트리 리포트입니다. 교차 각 전체와 관계 역학, 갈등 포인트, 역할 나누기까지 포함합니다. 한 사람 단독 천궁도 해설은 포함되지 않습니다.';
  }
  if (product.id === 'bundle') {
    return theme === 'character'
      ? '동양 자미두수 12개 별방 전체와 서양 천궁도 전체를 한 번에 여는 리포트야. 두 체계가 같은 곳을 가리킬 때의 교차 해석까지 들어 있어.'
      : '동양 자미두수 12궁 전체와 서양 출생 천궁도 전체를 함께 여는 리포트입니다. 두 체계가 같은 지점을 가리킬 때의 교차 해석까지 포함합니다.';
  }
  return null;
}

export function productBadge(product: Product, theme: ThemeId): string | undefined {
  if (product.id === 'newyear2027') return '✦ 2027 신년';
  if (theme === 'character' && product.id === 'basic') return '☕ 커피 한 잔 값';
  if (theme === 'character' && product.id === 'western') return '✶ 서양 점성술';
  if (product.id === 'synastry') return '✶ 시너스트리';
  if (theme === 'character' && product.id === 'bundle') return '✦ 통합';
  return product.badge;
}

export function productCta(product: Product, theme: ThemeId): string {
  if (product.id === 'newyear2027') return '2027 리포트 열기';
  if (product.id === 'synastry') return theme === 'character' ? '두 사람 궁합 점수 보기' : '시너스트리 점수 보기';
  if (theme === 'character') {
    if (product.id === 'basic') return '3,900원으로 내 별 읽기';
    if (product.id === 'premium') return '12개 별방 전부 보기';
    if (product.id === 'western') return '내 천궁도 열기';
    if (product.id === 'bundle') return '동양·서양 둘 다 보기';
    return '두 사람 별 이야기 보기';
  }
  if (product.id === 'compat') return '궁합 보기';
  if (product.id === 'western') return '내 천궁도 열기';
  if (product.id === 'bundle') return '통합 리포트 열기';
  return '명반 입력하고 시작하기';
}

export function productShortCta(product: Product, theme: ThemeId): string {
  if (product.id === 'newyear2027') return '2027 열기';
  if (product.id === 'synastry') return '궁합 보기';
  if (theme === 'character') {
    if (product.id === 'basic') return '3,900원으로 열기';
    if (product.id === 'premium') return '전체 보기';
    if (product.id === 'western') return '천궁도 열기';
    if (product.id === 'bundle') return '둘 다 보기';
    return '궁합 보기';
  }
  if (product.id === 'compat') return '궁합 보기';
  if (product.id === 'western') return '천궁도 열기';
  if (product.id === 'bundle') return '통합 보기';
  return '열기';
}

/** 결제 모달 상단에 붙는 체계 표기 — 어떤 체계를 사는지 한 줄로 못 박습니다. */
export function productSystemLabel(product: Product): { title: string; sub: string } {
  if (product.id === 'synastry') {
    return { title: '서양 점성술 · 시너스트리 궁합', sub: 'SYNASTRY · 두 사람의 행성 교차 각' };
  }
  if (product.system === 'western') {
    return { title: '서양 점성술 · 출생 천궁도', sub: 'WESTERN NATAL CHART · 태양 · 달 · 어센던트 · 행성 하우스' };
  }
  if (product.system === 'both') {
    return { title: '통합 리포트 · 동양 + 서양', sub: 'ZI WEI DOU SHU × WESTERN NATAL · 두 체계 교차 해석' };
  }
  return { title: '동양 전통 자미두수 · 12궁 명반', sub: 'ZI WEI DOU SHU · 12궁 · 14주성 · 사화 · 대한' };
}

export const findProduct = (id: ProductId) => PRODUCTS.find((p) => p.id === id)!;
