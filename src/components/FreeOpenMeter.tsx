import type { Product } from '../lib/products';
import { productUnlockCta } from '../lib/products';
import { useTheme } from '../lib/theme';
import PriceTag from './PriceTag';
import { LockIcon } from './ui';

type Props = {
  /** 무료로 열어 둔 비중(%) — 화면마다 30으로 통일 */
  freePercent?: number;
  /** 지금 그대로 보이는 것 */
  openItems: string[];
  /** 결제하면 추가로 열리는 것 */
  lockedItems: string[];
  /** 분량 약속 (예: '12개 별방 · 달마다 처방 12개') */
  volume?: string;
  /** 결제가·할인율 표기를 붙일 상품 */
  product?: Product;
  /** 있으면 해금 버튼을 이 안에서 렌더 */
  onCta?: () => void;
  ctaLabel?: string;
  /** 버튼 아래 한 줄 (결제·열람 안내 등) */
  note?: string;
  onDark?: boolean;
};

/**
 * '무료 공개 30%'를 눈금으로 보여 주고, 지금 열린 것과 열리면 더 열리는 것을
 * 같은 자리에서 나눠 보여 줍니다.
 * 스텔로그가 무료로는 목차 + 첫 장을 열고 '이어질 이야기 I~IX'를 전부 보여 준 뒤
 * 구매 화면에서 남은 장을 한 번에 여는 구조를, 자미두수 리포트 단위로 옮긴 것입니다.
 */
export default function FreeOpenMeter({
  freePercent = 30,
  openItems,
  lockedItems,
  volume,
  product,
  onCta,
  ctaLabel,
  note,
  onDark = true,
}: Props) {
  const { theme } = useTheme();
  const rest = 100 - freePercent;

  const textStrong = onDark ? 'var(--panel-title, #fff9ff)' : 'var(--text)';
  const textBody = onDark ? 'var(--panel-body, rgba(246,238,224,0.85))' : 'var(--text-2)';
  const textFaint = onDark ? 'var(--panel-faint, rgba(246,238,224,0.58))' : 'var(--faint)';
  const rule = onDark ? 'var(--panel-rule, rgba(255,255,255,0.12))' : 'var(--line)';
  const accent = onDark ? 'var(--panel-accent, #e3c07b)' : 'var(--accent-deep)';
  const track = onDark ? 'rgba(255,255,255,0.14)' : 'var(--field-bg)';

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        border: `1px ${onDark ? 'dashed' : 'solid'} ${onDark ? 'var(--panel-rule, rgba(255,255,255,0.16))' : 'var(--line-strong)'}`,
        background: onDark ? 'rgba(9,8,18,0.24)' : 'var(--field-bg)',
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[13.5px] font-semibold" style={{ color: textStrong }}>
          <LockIcon className="mr-1 inline h-3 w-3 align-[-1px]" />
          무료 공개 {freePercent}%
        </p>
        <p className="num text-[12.5px]" style={{ color: textFaint }}>
          나머지 {rest}% 잠김
        </p>
      </div>

      <div className="mt-2 h-[6px] w-full overflow-hidden rounded-full" style={{ background: track }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${freePercent}%`,
            background:
              theme === 'character'
                ? 'linear-gradient(90deg,#b99bf2,#8f6fe0)'
                : 'linear-gradient(90deg,#c19a56,#e3c07b)',
          }}
        />
      </div>

      <div className="mt-3 grid gap-2">
        <div>
          <p className="text-[12.5px] tracking-[0.14em]" style={{ color: accent }}>
            지금 열려 있어
          </p>
          <ul className="mt-1 space-y-0.5">
            {openItems.map((item) => (
              <li key={item} className="flex gap-1.5 text-[13px] leading-[1.6]" style={{ color: textBody }}>
                <span aria-hidden="true" style={{ color: accent }}>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2" style={{ borderTop: `1px solid ${rule}` }}>
          <p className="flex items-center gap-1 text-[12.5px] tracking-[0.14em]" style={{ color: textFaint }}>
            열면 더 열려
            <span className="num">+{rest}%</span>
          </p>
          <ul className="mt-1 space-y-0.5">
            {lockedItems.map((item) => (
              <li key={item} className="flex gap-1.5 text-[13px] leading-[1.6]" style={{ color: textBody }}>
                <LockIcon className="mt-[3px] h-2.5 w-2.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {(volume || product) && (
        <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1" style={{ borderTop: `1px solid ${rule}`, paddingTop: 10 }}>
          {volume && (
            <p className="text-[12.5px] leading-[1.6]" style={{ color: textFaint }}>
              {volume}
            </p>
          )}
          {product && <PriceTag product={product} variant="compact" onDark={onDark} showSave={false} />}
        </div>
      )}

      {onCta && (
        <button onClick={onCta} className="t-btn t-btn-gold mt-3 w-full py-3 text-[14px]">
          <LockIcon className="h-3.5 w-3.5" />
          {ctaLabel ?? (product ? productUnlockCta(product, theme, freePercent) : '나머지 열기')}
        </button>
      )}

      {note && (
        <p className="mt-1.5 text-[12.5px] leading-[1.6]" style={{ color: textFaint }}>
          {note}
        </p>
      )}
    </div>
  );
}
