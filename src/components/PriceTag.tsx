import type { Product } from '../lib/products';
import { productPriceInfo, won } from '../lib/products';
import { useTheme } from '../lib/theme';

type Variant = 'card' | 'inline' | 'compact';

type Props = {
  product: Product;
  /** card: 랜딩 상품 카드 / inline: 결제·결과 안쪽 / compact: 좁은 줄 */
  variant?: Variant;
  /** 어두운 패널(추천 카드·잠금 패널) 위에서 쓸 때 */
  onDark?: boolean;
  /** '정가 → 할인가 · N원 아껴' 한 줄을 붙일지 */
  showSave?: boolean;
  /** 결제 금액처럼 오른쪽 정렬이 필요한 자리 */
  align?: 'left' | 'right';
};

const SIZES: Record<Variant, { price: string; pill: string; strike: string; save: string }> = {
  card: { price: 'text-[23px]', pill: 'text-[12.5px]', strike: 'text-[12.5px]', save: 'text-[12.5px]' },
  inline: { price: 'text-[19px]', pill: 'text-[12px]', strike: 'text-[12.5px]', save: 'text-[12.5px]' },
  compact: { price: 'text-[15px]', pill: 'text-[12px]', strike: 'text-[12px]', save: 'text-[12px]' },
};

/**
 * 정가 → 할인가 → 할인율(%) → 아끼는 금액을 한 덩어리로 보여 줍니다.
 * 스텔로그가 상품 목록 배지(SALE 50%)와 결제 화면(정가/재화가/멤버십가)을
 * 한눈에 비교되게 둔 방식을, '별의 속삭임' 말투로 옮긴 표기입니다.
 */
export default function PriceTag({ product, variant = 'inline', onDark = false, showSave = true, align = 'left' }: Props) {
  const { theme } = useTheme();
  const info = productPriceInfo(product, theme);
  const size = SIZES[variant];

  const priceColor = onDark ? 'var(--panel-title, #fff9ff)' : 'var(--text)';
  const strikeColor = onDark ? 'rgba(255,249,255,0.66)' : 'var(--faint)';
  const saveColor = onDark ? 'rgba(255,249,255,0.78)' : 'var(--muted)';
  const pillStyle = onDark
    ? { background: 'rgba(255,249,255,0.16)', color: 'var(--panel-title, #fff9ff)', border: '1px solid rgba(255,249,255,0.28)' }
    : { background: 'var(--accent-soft)', color: 'var(--accent-deep)', border: '1px solid var(--line-strong)' };

  return (
    <div className={align === 'right' ? 'text-right' : undefined}>
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {info.discounted && (
          <span
            className={`num shrink-0 rounded-full px-2 py-[3px] font-bold leading-none ${size.pill}`}
            style={pillStyle}
          >
            {info.rate}% 할인
          </span>
        )}
        <span className={`num font-bold leading-none ${size.price}`} style={{ color: priceColor }}>
          {won(info.price)}
          <span className="ml-0.5 text-[0.72em] font-normal" style={{ color: saveColor }}>
            원
          </span>
        </span>
        {info.discounted && (
          <span className={`num leading-none line-through ${size.strike}`} style={{ color: strikeColor }}>
            {won(info.original)}원
          </span>
        )}
      </div>
      {showSave && info.discounted && (
        <p className={`mt-1 leading-[1.6] ${size.save}`} style={{ color: saveColor }}>
          정가 {won(info.original)}원 → 지금 {won(info.price)}원 ·{' '}
          <b className="font-semibold">{won(info.save)}원 아껴</b>
        </p>
      )}
    </div>
  );
}
