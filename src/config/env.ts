/**
 * 빌드 환경 설정 (env.ts)
 * ------------------------------------------------------------------
 * 같은 코드를 GitHub 페이지(/byulgyeol/)·Cloudflare Pages(/)·로컬 프리뷰에서
 * 함께 쓰기 위한 스위치입니다. 값이 없을 때의 기본값은 "지금까지의 동작"을
 * 유지하도록 잡았습니다.
 */

const env = import.meta.env as Record<string, string | undefined>;

function raw(key: string): string {
  const v = env[key];
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * 결제 확인·잠금 해제를 처리하는 Cloudflare Worker 주소.
 * 비어 있으면 미리보기 모드(결제 연동 전)로 동작합니다.
 *   예) VITE_PAYAPP_WORKER_URL=https://byulgyeol-payapp.<계정>.workers.dev
 */
export const PAYAPP_WORKER_URL = raw('VITE_PAYAPP_WORKER_URL').replace(/\/+$/, '');

/** 실제 결제창으로 넘어가는 빌드인지 */
export const PAYMENTS_LIVE = PAYAPP_WORKER_URL.length > 0;

/**
 * 1차 심사용 빌드에서는 VITE_ENABLE_GOODS_CHECKOUT=false 로 두어
 * 2027 수호 원석 굿즈의 유료 장바구니·결제 흐름만 숨깁니다.
 * (무료 운세·무료 부적 카드는 그대로 유지)
 */
const goodsFlag = raw('VITE_ENABLE_GOODS_CHECKOUT');
export const GOODS_CHECKOUT_ENABLED = goodsFlag === '' ? true : goodsFlag !== 'false';

/**
 * 자미두수 단독 오픈 빌드 (2026-11-19 프리뷰)
 * ------------------------------------------------------------------
 * VITE_ZIWEI_ONLY=true 로 빌드하면 서양 점성술 탭·상품·결제 동선만 화면에서 숨깁니다.
 * 계산 코드(`lib/western.ts`)·화면(`WesternView` 등)·상품 데이터는 그대로 남아 있고,
 * 값을 지우고 다시 빌드하면 원래 화면으로 돌아옵니다.
 *   프리뷰 빌드: VITE_ZIWEI_ONLY=true npm run build
 */
const ziweiOnlyFlag = raw('VITE_ZIWEI_ONLY');
export const ZIWEI_ONLY = ziweiOnlyFlag === 'true';

/** 배포 경로 — vite.config.ts 의 base 와 같은 값을 씁니다. */
export const BASE_PATH = env.BASE_URL ?? '/';

/** 저장소의 정식 주소 (배포·공유 안내용) */
export const SITE_ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';
