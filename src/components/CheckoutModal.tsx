import { useEffect, useMemo, useState } from 'react';
import type { BirthInput, Gender } from '../lib/chart';
import type { Product, ProductId } from '../lib/products';
import {
  PRODUCTS,
  productPoints,
  productName,
  productPrice,
  productPriceInfo,
  productScopeNote,
  productSystemLabel,
  productTagline,
  won,
} from '../lib/products';
import type { ProductSystem } from '../lib/systems';
import { ZIWEI_ONLY } from '../config/env';
import { TIME_OPTIONS } from '../lib/terms';
import { useTheme } from '../lib/theme';
import { PAYMENTS_LIVE } from '../config/env';
import { LEGAL_LINK_LABEL, LEGAL_ORDER, type LegalDocId } from '../config/legal';
import { normalizePhone, requestPayAppPayment, savePendingOrder } from '../lib/payments';
import PriceTag from './PriceTag';
import LegalModal from './LegalModal';
import { LockIcon } from './ui';

type Props = {
  product: Product;
  chartName: string;
  /** 결제 후 페이앱에서 돌아왔을 때 리포트를 다시 그리기 위한 입력값 */
  birthInput?: BirthInput | null;
  /** 궁합 무료 프리뷰에서 넘어온 상대방 정보 — 있으면 미리 채워 둡니다. */
  initialPartner?: BirthInput | null;
  onClose: () => void;
  onPaid: (partner?: BirthInput) => void;
  /** 결제 모달 안에서 다른 체계·다른 상품으로 갈아탈 때 */
  onSelect: (id: ProductId) => void;
};

const YEARS = Array.from({ length: 2015 - 1930 + 1 }, (_, i) => 2015 - i);

const LANES: Array<{ key: ProductSystem; label: string; sub: string; subChar: string; glyph: string }> = [
  { key: 'ziwei', label: '동양 자미두수', sub: '12궁 명반 · 14주성', subChar: '12개 별방 · 14개의 별', glyph: '☯' },
  { key: 'western', label: '서양 점성술', sub: '출생 천궁도 · 행성 하우스', subChar: '출생 천궁도 · 행성 하우스', glyph: '✶' },
  { key: 'both', label: '통합 (둘 다)', sub: '두 리포트 함께', subChar: '두 별지도 함께', glyph: '✦' },
];

export default function CheckoutModal({ product, chartName, birthInput, initialPartner, onClose, onPaid, onSelect }: Props) {
  const { theme, copy } = useTheme();
  const isCharacter = theme === 'character';
  const [agree, setAgree] = useState(false);
  const [stage, setStage] = useState<'form' | 'processing' | 'done'>('form');
  const [phone, setPhone] = useState('');
  const [policy, setPolicy] = useState<LegalDocId | null>(null);

  const [pName, setPName] = useState(initialPartner?.name ?? '');
  const [pYear, setPYear] = useState(initialPartner ? String(initialPartner.year) : '');
  const [pMonth, setPMonth] = useState(initialPartner ? String(initialPartner.month) : '');
  const [pDay, setPDay] = useState(initialPartner ? String(initialPartner.day) : '');
  const [pTime, setPTime] = useState(
    initialPartner ? (initialPartner.timeKnown ? String(initialPartner.timeIndex) : 'unknown') : 'unknown',
  );
  const [pGender, setPGender] = useState<Gender>(initialPartner?.gender ?? 'male');
  const [error, setError] = useState<string | null>(null);

  const lane = product.system;
  /* 자미두수 단독 프리뷰(VITE_ZIWEI_ONLY) — 다른 체계 상품은 결제 목록에 올리지 않습니다. */
  const laneProducts = useMemo(
    () => PRODUCTS.filter((p) => p.system === lane && (!ZIWEI_ONLY || p.system === 'ziwei')),
    [lane],
  );
  const systemLabel = productSystemLabel(product);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // 결제 동선을 바꾸면 결제 상태만 초기화합니다. (동의 체크는 유지)
  useEffect(() => {
    setStage('form');
    setError(null);
  }, [product.id]);

  const pickLane = (next: ProductSystem) => {
    if (next === lane) return;
    const first = PRODUCTS.find((p) => p.system === next);
    if (first) onSelect(first.id);
  };

  const partnerInput = (): BirthInput | undefined =>
    product.id === 'compat' || product.id === 'synastry'
      ? {
          name: pName,
          year: Number(pYear),
          month: Number(pMonth),
          day: Number(pDay),
          calendar: 'solar',
          isLeap: false,
          timeIndex: pTime === 'unknown' ? 6 : Number(pTime),
          timeKnown: pTime !== 'unknown',
          gender: pGender,
        }
      : undefined;

  const pay = async () => {
    if (!agree) {
      setError(isCharacter ? '동의 체크를 먼저 눌러 주세요!' : '결제 진행에 동의해 주세요.');
      return;
    }
    if ((product.id === 'compat' || product.id === 'synastry') && (!pYear || !pMonth || !pDay)) {
      setError(isCharacter ? '상대방의 태어난 날도 알려 주세요!' : '상대방의 생년월일을 입력해 주세요.');
      return;
    }

    // 실제 결제 빌드: 휴대폰 번호가 있어야 페이앱 결제 요청을 만들 수 있습니다.
    if (PAYMENTS_LIVE) {
      const normalized = normalizePhone(phone);
      if (!normalized) {
        setError(
          isCharacter
            ? '결제 확인에 쓸 휴대폰 번호를 정확히 적어 주세요. (예: 010-1234-5678)'
            : '결제 확인에 필요한 휴대폰 번호를 정확히 입력해 주세요. (예: 010-1234-5678)',
        );
        return;
      }
      setError(null);
      setStage('processing');
      try {
        const started = await requestPayAppPayment({
          productId: product.id,
          theme,
          recvphone: normalized,
          buyerName: chartName || undefined,
        });
        if (birthInput) {
          savePendingOrder({
            orderId: started.orderId,
            productId: product.id,
            theme,
            price: productPrice(product, theme),
            input: birthInput,
            partnerInput: partnerInput() ?? null,
            createdAt: Date.now(),
          });
        }
        window.location.assign(started.payurl);
      } catch (err) {
        setStage('form');
        setError(err instanceof Error ? err.message : '결제를 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
      return;
    }

    // 결제 연동 전 미리보기 빌드 — 화면 흐름만 확인합니다.
    setError(null);
    setStage('processing');
    window.setTimeout(() => {
      setStage('done');
      window.setTimeout(() => {
        onPaid(partnerInput());
      }, 650);
    }, 1100);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      style={{ background: 'rgba(10,8,20,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="결제 확인"
        className="t-card animate-rise max-h-[92vh] w-full max-w-[460px] overflow-y-auto !rounded-b-none sm:!rounded-b-[26px]"
        style={{ background: 'var(--card-2)' }}
      >
        <div className="flex items-start justify-between gap-3 px-6 pb-4 pt-5" style={{ borderBottom: '1px solid var(--line)' }}>
          <div className="min-w-0">
            <p className="eyebrow">{copy.checkout.eyebrow}</p>
            <p
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)', border: '1px solid var(--line-strong)' }}
            >
              <span aria-hidden="true">{lane === 'western' ? '✶' : lane === 'both' ? '✦' : '☯'}</span>
              {systemLabel.title}
            </p>
            <h3 className="t-title mt-2 text-[20px] leading-snug">{productName(product, theme)}</h3>
            <p className="mt-0.5 text-[13.5px] t-muted">{productTagline(product, theme)}</p>
            {isCharacter && product.id === 'basic' && (
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12.5px]" style={{ background: 'rgba(255,214,190,0.5)', color: '#a8648a' }}>
                ☕ 커피 한 잔 값
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="-mr-1 -mt-1 rounded-full p-2 transition t-muted"
            style={{ background: 'var(--field-bg)' }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {/* 결제 동선 — 자미두수 / 서양 점성술 / 통합 (자미두수 단독 빌드에서는 숨김) */}
          <div>
            {!ZIWEI_ONLY && (
              <>
            <p className="mb-2 text-[12.5px] font-semibold tracking-[0.1em] t-muted">
              {isCharacter ? '어떤 리포트를 살까?' : '결제할 리포트 체계'}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {LANES.map((l) => {
                const active = l.key === lane;
                return (
                  <button
                    key={l.key}
                    type="button"
                    onClick={() => pickLane(l.key)}
                    aria-pressed={active}
                    className="rounded-xl px-1.5 py-2 text-center transition"
                    style={
                      active
                        ? { background: 'var(--accent)', color: 'var(--on-accent)', border: '1px solid var(--accent)' }
                        : { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)' }
                    }
                  >
                    <span className="block text-[14px]" aria-hidden="true">
                      {l.glyph}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] font-semibold leading-tight">{l.label}</span>
                    <span className="mt-0.5 block text-[12px] leading-tight opacity-80">{isCharacter ? l.subChar : l.sub}</span>
                  </button>
                );
              })}
            </div>
              </>
            )}

            {/* 같은 체계 안의 상품 */}
            <div className={`${ZIWEI_ONLY ? '' : 'mt-2 '}space-y-1.5`}>
              {laneProducts.map((p) => {
                const active = p.id === product.id;
                const info = productPriceInfo(p, theme);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => !active && onSelect(p.id)}
                    aria-pressed={active}
                    className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition"
                    style={{
                      background: active ? 'var(--field-bg)' : 'transparent',
                      border: active ? '1px solid var(--line-strong)' : '1px dashed var(--line)',
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-medium" style={{ color: active ? 'var(--text)' : 'var(--muted)' }}>
                        {active ? '● ' : '○ '}
                        {productName(p, theme)}
                      </span>
                      <span className="mt-0.5 block truncate text-[12.5px] t-faint">{p.tagline}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      {info.discounted && (
                        <span
                          className="num block text-[12px] font-bold leading-none"
                          style={{ color: active ? 'var(--accent-deep)' : 'var(--muted)' }}
                        >
                          {info.rate}% 할인
                        </span>
                      )}
                      <span
                        className="num mt-0.5 block text-[13.5px] font-semibold leading-none"
                        style={{ color: active ? 'var(--accent-deep)' : 'var(--muted)' }}
                      >
                        {won(info.price)}원
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[12.5px] leading-[1.7] t-faint">{systemLabel.sub}</p>
          </div>

          <div className="mt-4 space-y-2 rounded-2xl p-4 text-[14px]" style={{ background: 'var(--field-bg)' }}>
            <div className="flex justify-between gap-3 t-muted">
              <span>{lane === 'western' ? '천궁도' : lane === 'both' ? '명반 · 천궁도' : copy.checkout.order}</span>
              <span className="truncate t-body">{chartName || '익명'}</span>
            </div>
            <div className="flex justify-between gap-3 t-muted">
              <span>상품</span>
              <span className="truncate t-body">{productName(product, theme)}</span>
            </div>
            <div className="flex justify-between gap-3 t-muted">
              <span>체계</span>
              <span className="truncate t-body">{lane === 'both' ? '동양 + 서양' : lane === 'western' ? '서양 점성술' : '동양 자미두수'}</span>
            </div>
            <div className="flex justify-between gap-3 t-muted">
              <span>{copy.checkout.period}</span>
              <span className="t-body">{copy.checkout.periodValue}</span>
            </div>
            <div className="my-1 h-px" style={{ background: 'var(--line)' }} />
            <div className="flex items-start justify-between gap-3">
              <span className="shrink-0 pt-1 t-muted">{copy.checkout.amount}</span>
              <PriceTag product={product} variant="inline" align="right" />
            </div>
          </div>

          {/* 스텔로그 벤치마킹: 구매 전에 '열면 무엇이 먼저 보이는지' 세 가지로 약속 */}
          <div className="mt-3 rounded-2xl p-4" style={{ background: 'var(--accent-soft)', border: '1px solid var(--line-strong)' }}>
            <p className="text-[13px] font-semibold tracking-[0.06em]" style={{ color: 'var(--accent-deep)' }}>
              {isCharacter ? '열면 이 세 가지가 먼저 보여' : '열면 이 세 가지가 먼저 보입니다'}
            </p>
            <ol className="mt-2 space-y-1.5">
              {productPoints(product, theme).slice(0, 3).map((pt, i) => (
                <li key={pt} className="flex gap-2 text-[13.5px] leading-[1.7] t-body">
                  <span className="num shrink-0 pt-[1px] text-[12.5px] font-semibold" style={{ color: 'var(--accent-deep)' }}>
                    0{i + 1}
                  </span>
                  {pt}
                </li>
              ))}
            </ol>
            <p className="mt-2 text-[12.5px] leading-[1.6] t-faint">
              무료로 본 30%에 이어서, 나머지 70%가 열립니다.
            </p>
          </div>

          {productScopeNote(product, theme) && (
            <div className="mt-3 rounded-2xl px-4 py-3" style={{ border: '1px dashed var(--line-strong)' }}>
              <p className="text-[13px] font-semibold tracking-[0.06em] t-muted">
                {isCharacter ? '이야기 범위' : '리포트 범위'}
              </p>
              <p className="mt-1.5 text-[13.5px] leading-[1.75] t-body">
                {productScopeNote(product, theme)}
              </p>
            </div>
          )}

          {(product.id === 'compat' || product.id === 'synastry') && (
            <div className="mt-4 rounded-2xl p-4" style={{ border: '1px solid var(--line)' }}>
              <p className="mb-3 text-[13px] font-semibold tracking-[0.08em] t-muted">
                {product.id === 'synastry' ? '궁합을 볼 상대방 정보' : copy.checkout.partner}
              </p>
              <input
                className="t-field mb-2 !text-[15px]"
                placeholder="이름 (선택)"
                value={pName}
                onChange={(e) => setPName(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-2">
                <select aria-label="상대방 태어난 해" className="t-field num !text-[15px]" value={pYear} onChange={(e) => setPYear(e.target.value)}>
                  <option value="">YYYY</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select aria-label="상대방 태어난 달" className="t-field num !text-[15px]" value={pMonth} onChange={(e) => setPMonth(e.target.value)}>
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m}월
                    </option>
                  ))}
                </select>
                <select aria-label="상대방 태어난 날" className="t-field num !text-[15px]" value={pDay} onChange={(e) => setPDay(e.target.value)}>
                  <option value="">DD</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}일
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <select aria-label="상대방 태어난 시간" className="t-field !text-[15px]" value={pTime} onChange={(e) => setPTime(e.target.value)}>
                  <option value="unknown">시간 모름</option>
                  {TIME_OPTIONS.map((t) => (
                    <option key={t.index} value={t.index}>
                      {t.label} {t.range}
                    </option>
                  ))}
                </select>
                <select aria-label="상대방 성별" className="t-field !text-[15px]" value={pGender} onChange={(e) => setPGender(e.target.value as Gender)}>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="mb-2 text-[13px] font-semibold tracking-[0.08em] t-muted">{copy.checkout.method}</p>
            <div className="flex flex-wrap gap-1.5">
              {['신용·체크카드', '카카오페이', '네이버페이'].map((m) => (
                <span
                  key={m}
                  className="rounded-full px-2.5 py-1 text-[13px]"
                  style={{ background: 'var(--field-bg)', border: '1px solid var(--line)', color: 'var(--muted)' }}
                >
                  {m}
                </span>
              ))}
            </div>
            <p className="mt-1.5 text-[12.5px] leading-[1.7] t-faint">
              {PAYMENTS_LIVE
                ? '결제 수단은 페이앱(PayApp) 결제창에서 선택합니다.'
                : '결제 수단은 결제 연동 후 페이앱(PayApp) 결제창에서 선택합니다.'}
            </p>
          </div>

          {PAYMENTS_LIVE && (
            <div className="mt-4">
              <label className="mb-2 block text-[13px] font-semibold tracking-[0.08em] t-muted" htmlFor="checkout-phone">
                {isCharacter ? '결제 확인용 휴대폰 번호' : '결제 확인용 휴대폰 번호'}
              </label>
              <input
                id="checkout-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className="t-field num !text-[15px]"
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="mt-1.5 text-[12.5px] leading-[1.7] t-faint">
                {isCharacter
                  ? '결제 확인과 거래 내역 안내에만 써. 광고 문자는 보내지 않아.'
                  : '결제 확인과 거래 내역 안내 목적으로만 사용하며, 광고에는 사용하지 않습니다.'}
              </p>
            </div>
          )}

          <label className="mt-4 flex cursor-pointer items-start gap-2 text-[13px] leading-[1.7] t-muted">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded"
              style={{ accentColor: 'var(--accent)' }}
            />
            <span>{copy.checkout.agree}</span>
          </label>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 pl-6">
            {LEGAL_ORDER.map((id, i) => (
              <span key={id} className="flex items-center gap-2">
                {i > 0 && <span className="text-[12px] t-faint">·</span>}
                <button
                  type="button"
                  onClick={() => setPolicy(id)}
                  className="text-[13px] underline decoration-dotted underline-offset-2 t-faint"
                >
                  {LEGAL_LINK_LABEL[id]}
                </button>
              </span>
            ))}
            <span className="text-[12.5px] t-faint">보기</span>
          </div>

          {error && <p className="mt-2 text-[13.5px]" style={{ color: isCharacter ? '#d97d9a' : '#d98a7a' }}>{error}</p>}

          <div className="mt-4 rounded-xl px-3 py-2.5 text-[13px] leading-[1.7]" style={{ background: 'var(--accent-soft)', border: '1px dashed var(--line-strong)', color: 'var(--accent-deep)' }}>
            {PAYMENTS_LIVE ? copy.checkout.note : copy.checkout.previewNote}
          </div>
        </div>

        <div className="sticky bottom-0 px-6 py-4" style={{ borderTop: '1px solid var(--line)', background: 'var(--card-2)' }}>
          <button onClick={pay} disabled={stage !== 'form'} className="t-btn t-btn-primary w-full py-3.5">
            {stage === 'form' && (
              <>
                <LockIcon className="h-3.5 w-3.5" />
                {product.id === 'synastry'
                  ? `${productPrice(product, theme).toLocaleString('ko-KR')}원 결제하고 심층 시너스트리 보기`
                  : lane === 'western'
                    ? `서양 점성술 리포트 ${productPrice(product, theme).toLocaleString('ko-KR')}원 결제하고 열기`
                    : lane === 'both'
                      ? `통합 리포트 ${productPrice(product, theme).toLocaleString('ko-KR')}원 결제하고 열기`
                      : copy.checkout.pay(productPrice(product, theme).toLocaleString('ko-KR'))}
              </>
            )}
            {stage === 'processing' && (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
                {copy.checkout.processing}
              </span>
            )}
            {stage === 'done' && (
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12.5l4.5 4.5L19 7" />
                </svg>
                {copy.checkout.done}
              </span>
            )}
          </button>
          <button onClick={onClose} className="mt-2 w-full text-center text-[13.5px] t-faint">
            {copy.checkout.cancel}
          </button>
        </div>
      </div>

      {policy && <LegalModal doc={policy} onClose={() => setPolicy(null)} />}
    </div>
  );
}
