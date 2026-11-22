/**
 * 페이앱(PayApp) 결제 연동 (payments.ts)
 * ------------------------------------------------------------------
 * 흐름
 *   1) 결제 버튼 → POST {worker}/api/payapp/request
 *        · 상품 ID·테마만 보냅니다. 금액은 Worker 가 자기 상품표에서 다시 계산합니다.
 *   2) 응답의 payurl 로 이동 → 페이앱 결제창 → 결제
 *   3) 페이앱이 서버(Worker)로 결과를 통보(feedback) → HMAC 서명된 해금 토큰 발급
 *   4) 이용자는 returnurl 로 돌아오고, 이 화면이 주문 상태를 조회해 토큰을 받아
 *      리포트를 엽니다. (창을 닫았더라도 다음 방문 때 이어서 확인합니다)
 *
 * Worker 주소가 설정되지 않은 미리보기 빌드에서는 이 모듈을 쓰지 않습니다.
 */
import type { BirthInput } from '../lib/chart';
import type { ProductId } from '../lib/products';
import type { ThemeId } from '../lib/theme';
import { PAYAPP_WORKER_URL, PAYMENTS_LIVE } from '../config/env';

const PENDING_KEY = 'byulgyeol.pendingOrder.v1';

export type PendingOrder = {
  orderId: string;
  productId: ProductId;
  theme: ThemeId;
  price: number;
  /** 리포트를 다시 그리기 위한 입력값 (브라우저에만 저장) */
  input: BirthInput;
  partnerInput?: BirthInput | null;
  createdAt: number;
};

export type RequestResult = {
  payurl: string;
  mulNo: string;
  orderId: string;
};

export type OrderStatus = {
  status: 'requested' | 'paid' | 'canceled';
  productId: ProductId | null;
  token?: string;
  paidAt?: string;
};

export type VerifyResult = {
  valid: boolean;
  productId: ProductId | null;
  orderId?: string;
  paidAt?: string;
};

function endpoint(path: string): string {
  return `${PAYAPP_WORKER_URL}${path}`;
}

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text.slice(0, 200) || `결제 서버 응답을 읽지 못했습니다. (${res.status})`);
  }
}

export function isPaymentLive(): boolean {
  return PAYMENTS_LIVE;
}

/** 결제 요청 — 서버가 금액을 확정하고 페이앱 결제창 주소를 돌려줍니다. */
export async function requestPayAppPayment(params: {
  productId: ProductId;
  theme: ThemeId;
  recvphone: string;
  buyerName?: string;
}): Promise<RequestResult> {
  const res = await fetch(endpoint('/api/payapp/request'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await readJson<{ state: string; errorMessage?: string; payurl?: string; mulNo?: string; orderId?: string; price?: number }>(res);
  if (!res.ok || data.state !== '1' || !data.payurl || !data.orderId) {
    throw new Error(data.errorMessage || '결제 요청을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
  return { payurl: data.payurl, mulNo: data.mulNo ?? '', orderId: data.orderId };
}

/** 주문 상태 조회 — feedback 이 도착해야 'paid' 가 됩니다. */
export async function fetchOrderStatus(orderId: string): Promise<OrderStatus> {
  const res = await fetch(endpoint(`/api/payapp/status?orderId=${encodeURIComponent(orderId)}`), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('주문 상태를 확인하지 못했습니다.');
  return readJson<OrderStatus>(res);
}

/** 발급된 해금 토큰 검증 — 위조·만료 여부를 서버에서 확인합니다. */
export async function verifyUnlockToken(token: string, productId: ProductId): Promise<VerifyResult> {
  const res = await fetch(
    endpoint(`/api/payapp/verify?token=${encodeURIComponent(token)}&productId=${encodeURIComponent(productId)}`),
    { headers: { Accept: 'application/json' } },
  );
  if (!res.ok) return { valid: false, productId: null };
  return readJson<VerifyResult>(res);
}

/* ---------------------------------------------------------------- */
/* 브라우저에 남기는 결제 대기 정보                                    */
/* ---------------------------------------------------------------- */

export function savePendingOrder(order: PendingOrder): void {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(order));
  } catch {
    /* 저장 공간이 막힌 브라우저는 무시 — 화면 이동은 그대로 진행합니다. */
  }
}

export function readPendingOrder(): PendingOrder | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingOrder;
    if (!parsed?.orderId || !parsed.productId || !parsed.input) return null;
    // 하루가 지난 대기 주문은 스스로 정리합니다.
    if (Date.now() - (parsed.createdAt ?? 0) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(PENDING_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingOrder(): void {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* noop */
  }
}

/** returnurl 로 돌아왔을 때 주소창에 남은 pay_order 값을 읽습니다. */
export function readReturnedOrderId(): string | null {
  if (typeof window === 'undefined') return null;
  const id = new URLSearchParams(window.location.search).get('pay_order');
  return id && id.length > 0 ? id : null;
}

/** 결제 확인 후 주소창에서 결제 관련 파라미터를 지웁니다. */
export function cleanReturnUrl(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has('pay_order')) return;
  url.searchParams.delete('pay_order');
  url.searchParams.delete('pay_status');
  window.history.replaceState({}, '', url.toString());
}

/** 휴대폰 번호 입력값 검사 (페이앱 결제 요청 필수 항목) */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[^0-9]/g, '');
  if (/^01[016789]\d{7,8}$/.test(digits)) return digits;
  return null;
}
