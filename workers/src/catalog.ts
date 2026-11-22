/**
 * 상품표 (catalog.ts)
 * ------------------------------------------------------------------
 * 결제 금액은 절대 브라우저가 보낸 값을 쓰지 않습니다.
 * 웹앱(src/lib/products.ts)과 같은 표를 그대로 가져와 서버가 다시 계산합니다.
 * → 화면에 보인 가격과 실제 청구 금액이 어긋나면 결제를 시작하지 않습니다.
 */
import { PRODUCTS, findProduct, productPrice, type Product, type ProductId } from '../../src/lib/products';
import type { ThemeId } from '../../src/lib/theme';

export type ResolvedProduct = {
  product: Product;
  theme: ThemeId;
  price: number;
};

const PRODUCT_IDS = new Set(PRODUCTS.map((p) => p.id as string));

export function isProductId(value: string): value is ProductId {
  return PRODUCT_IDS.has(value);
}

export function isTheme(value: string): value is ThemeId {
  return value === 'mystic' || value === 'character';
}

/**
 * @param expectedPrice 화면이 표시한 금액 (있으면 대조용으로만 사용)
 */
export function resolveProduct(
  productId: string,
  theme: string,
  expectedPrice?: number,
): { ok: true; value: ResolvedProduct } | { ok: false; reason: string } {
  if (!isProductId(productId)) return { ok: false, reason: '알 수 없는 상품입니다.' };
  if (!isTheme(theme)) return { ok: false, reason: '상품 테마를 확인해 주세요.' };

  const product = findProduct(productId);
  const price = productPrice(product, theme);
  if (price < 1000) return { ok: false, reason: '결제 최소 금액(1,000원)보다 낮은 상품입니다.' };
  if (typeof expectedPrice === 'number' && Number.isFinite(expectedPrice) && expectedPrice !== price) {
    return { ok: false, reason: '화면에 표시된 금액과 서버 금액이 다릅니다. 새로고침 후 다시 시도해 주세요.' };
  }
  return { ok: true, value: { product, theme, price } };
}

/** 페이앱에 표시할 상품명 — 사이트 이름을 붙여 결제 내역에서 알아보기 쉽게 합니다. */
export function goodsName(product: Product, theme: ThemeId): string {
  const brand = theme === 'character' ? '별의 속삭임' : '자미원';
  return `${brand} - ${product.name}`;
}
