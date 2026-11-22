/**
 * 두 점술 체계의 구분 정의 (systems.ts)
 * ------------------------------------------------------------------
 * 방문자가 "이게 동양 자미두수인지 서양 점성술인지" 헷갈리지 않도록,
 * 랜딩·결과·결제 화면이 모두 같은 이름·같은 색·같은 설명을 씁니다.
 */

import { ZIWEI_ONLY } from '../config/env';

export type SystemId = 'ziwei' | 'western';
export type ProductSystem = SystemId | 'both';

export type SystemMeta = {
  id: SystemId;
  /** 탭에 쓰는 정식 이름 */
  tab: string;
  /** 좁은 자리에 쓰는 짧은 이름 */
  short: string;
  hanja: string;
  en: string;
  /** 무엇으로 보는 체계인지 한 줄 */
  basis: string;
  /** 무료 체험에서 무엇이 열리는지 */
  freeLine: string;
  /** 결제 동선에서 쓰는 문구 */
  payLine: string;
  glyph: string;
};

export const SYSTEMS: Record<SystemId, SystemMeta> = {
  ziwei: {
    id: 'ziwei',
    tab: '동양 전통 자미두수',
    short: '자미두수',
    hanja: '紫微斗數',
    en: 'ZI WEI DOU SHU',
    basis: '12궁 명반 · 14주성',
    freeLine: '명궁의 주성과 12개 별방, 올해 조심할 별방 하나',
    payLine: '자미두수 리포트 결제',
    glyph: '☯',
  },
  western: {
    id: 'western',
    tab: '서양 점성술',
    short: '점성술',
    hanja: '西洋占星術',
    en: 'WESTERN NATAL',
    basis: '출생 천궁도 · 행성 하우스',
    freeLine: '태양·달·어센던트와 행성 7개의 하우스 배치',
    payLine: '서양 점성술 리포트 결제',
    glyph: '✶',
  },
};

export const SYSTEM_ORDER: SystemId[] = ZIWEI_ONLY ? ['ziwei'] : ['ziwei', 'western'];

export const BOTH_META = {
  tab: '통합 리포트',
  short: '통합',
  basis: '자미두수 12궁 + 서양 천궁도',
  payLine: '통합 리포트(둘 다) 결제',
  glyph: '✦',
};

export function systemOfProduct(system: ProductSystem): SystemMeta | typeof BOTH_META {
  return system === 'both' ? BOTH_META : SYSTEMS[system];
}

/** URL의 ?system= 값을 읽습니다. (기본은 자미두수)
 *  자미두수 단독 빌드(VITE_ZIWEI_ONLY=true)에서는 주소로도 서양 화면에 들어갈 수 없게 막습니다. */
export function readSystemFromUrl(): SystemId {
  if (ZIWEI_ONLY) return 'ziwei';
  const value = new URLSearchParams(window.location.search).get('system');
  return value === 'western' ? 'western' : 'ziwei';
}

export function writeSystemToUrl(system: SystemId) {
  const url = new URL(window.location.href);
  if (system === 'ziwei') url.searchParams.delete('system');
  else url.searchParams.set('system', system);
  window.history.replaceState({}, '', url);
}
