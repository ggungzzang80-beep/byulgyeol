import { useState } from 'react';
import type { StoneGood } from '../lib/newyear2027';
import { GOODS_CHECKOUT_ENABLED } from '../config/env';
import { useTheme } from '../lib/theme';

/** 수호 원석 굿즈 — 상세 보기 + 출시 전 장바구니(결제 없음) */
export default function StoneGoods2027({ goods, needLabel, stoneName }: { goods: StoneGood[]; needLabel: string; stoneName: string }) {
  const { theme } = useTheme();
  const isCharacter = theme === 'character';
  const [openId, setOpenId] = useState<string | null>(null);
  const [cart, setCart] = useState<string[]>([]);

  // 1차 결제 심사용 빌드(VITE_ENABLE_GOODS_CHECKOUT=false)에서는 굿즈 코너를 숨깁니다.
  // 2027 무료 운세·부적 카드는 그대로 남습니다.
  if (!GOODS_CHECKOUT_ENABLED) return null;

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));
  const add = (id: string) => setCart((cur) => (cur.includes(id) ? cur : [...cur, id]));
  const inCart = goods.filter((g) => cart.includes(g.id));
  const total = inCart.reduce((sum, g) => sum + g.price, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12.5px] tracking-[0.18em] t-faint">GUARDIAN STONE · 수호 원석 굿즈</p>
          <h3 className="t-display mt-2 text-[21px] leading-[1.5]">
            {isCharacter ? `${needLabel.split(' · ')[0]} 기운을 채우는 작은 것들` : `${needLabel.split(' · ')[0]}의 기운을 곁에 두는 법`}
          </h3>
        </div>
        <span className="t-chip !text-[12.5px]">정식 출시 준비 중</span>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {goods.map((g) => {
          const open = openId === g.id;
          const added = cart.includes(g.id);
          return (
            <div key={g.id} className="t-card flex flex-col p-4">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[12px] tracking-[0.14em] t-faint">{g.label}</span>
                {g.tag && (
                  <span className="rounded-full px-1.5 py-0.5 text-[12px]" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>
                    FIRST
                  </span>
                )}
              </div>
              <p className="t-title mt-2 text-[15px] leading-snug">{g.name}</p>
              <p className="mt-1 text-[12.5px] t-faint">{g.material}</p>
              <p className="mt-1.5 flex-1 text-[13px] leading-[1.7] t-muted">{g.detail}</p>

              {open && (
                <div className="mt-2 rounded-xl p-2.5 text-[13px] leading-[1.75] t-muted" style={{ background: 'var(--field-bg)', border: '1px solid var(--line)' }}>
                  <p>
                    <span className="font-semibold" style={{ color: 'var(--accent-deep)' }}>
                      원석
                    </span>{' '}
                    {stoneName} · {needLabel}
                  </p>
                  <p className="mt-1">{g.care}</p>
                </div>
              )}

              <div className="mt-3 flex items-baseline justify-between gap-1">
                <span className="num text-[15px] font-semibold t-title">{g.price.toLocaleString('ko-KR')}원</span>
                <button type="button" onClick={() => toggle(g.id)} className="text-[12.5px] t-faint underline underline-offset-2">
                  {open ? '접기' : '자세히'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => add(g.id)}
                disabled={added}
                className={`t-btn mt-2 w-full py-2 text-[13px] ${added ? 't-btn-soft' : 't-btn-soft'}`}
                style={added ? { opacity: 0.75 } : undefined}
              >
                {added ? '장바구니에 담김' : '장바구니 담기'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 flex flex-col gap-1.5 rounded-xl px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between" style={{ background: 'var(--field-bg)', border: '1px dashed var(--line-strong)' }}>
        <p className="text-[13px] leading-[1.7] t-muted">
          {inCart.length === 0
            ? isCharacter
              ? '출시 전이라 지금은 장바구니에 담아 두는 단계예요. 결제와 배송은 진행되지 않아요.'
              : '출시 전이라 지금은 장바구니에 담아 두는 단계입니다. 결제와 배송은 진행되지 않습니다.'
            : isCharacter
              ? `장바구니 ${inCart.length}점 · 합계 ${total.toLocaleString('ko-KR')}원 · 지금은 결제가 진행되지 않아.`
              : `장바구니 ${inCart.length}점 · 합계 ${total.toLocaleString('ko-KR')}원 · 지금은 결제가 진행되지 않습니다.`}
        </p>
        <p className="text-[12.5px] t-faint">
          {isCharacter ? '스마트스토어 연동 준비 중 · 출시 알림은 리포트를 열 때 알려 드릴게요' : '스마트스토어 연동 준비 중 · 출시 알림은 리포트 열 때 안내'}
        </p>
      </div>
    </div>
  );
}
