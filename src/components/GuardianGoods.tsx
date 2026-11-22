import { useState } from 'react';
import type { ChartModel } from '../lib/chart';
import { guardianRecommendation } from '../lib/guardianGoods';
import { GOODS_CHECKOUT_ENABLED } from '../config/env';
import { useTheme } from '../lib/theme';
import { SectionLabel } from './ui';

export default function GuardianGoods({ chart }: { chart: ChartModel }) {
  const { theme } = useTheme();
  const isCharacter = theme === 'character';
  const rec = guardianRecommendation(chart, theme);
  const [saved, setSaved] = useState(false);

  return (
    <section id="goods" className="mt-14 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <SectionLabel index="GOODS">GUARDIAN GOODS · 수호 원석</SectionLabel>
          <h2 className="t-display mt-3 text-[23px] leading-[1.4] sm:text-[26px]">
            {isCharacter ? (
              <>
                부족한 별빛을 채우는
                <br className="sm:hidden" /> 작은 소품
              </>
            ) : (
              '부족한 기운을 채우는 것'
            )}
          </h2>
        </div>
        {GOODS_CHECKOUT_ENABLED && <span className="t-chip !text-[12.5px]">굿즈 커머스 연동 예정</span>}
      </div>

      <div
        className={`mt-4 grid items-start gap-3.5 ${
          GOODS_CHECKOUT_ENABLED ? 'lg:grid-cols-[0.95fr_1.05fr]' : ''
        }`}
      >
        {/* 진단 */}
        <div className="t-panel p-6">
          <div className="t-starfield opacity-30" />
          <div className="relative">
            <p className="text-[12.5px] tracking-[0.22em] t-panel-accent">
              {isCharacter ? "YOUR GUARDIAN STONE" : 'ELEMENTAL PRESCRIPTION'}
            </p>
            <p className="t-panel-title mt-2.5 text-[19px] leading-[1.6]">{rec.headline}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="rounded-full px-2.5 py-1 text-[12.5px]" style={{ border: '1px solid var(--panel-rule)', color: 'var(--panel-muted)' }}>
                오행국 {chart.fiveElements}
              </span>
              <span className="rounded-full px-2.5 py-1 text-[12.5px]" style={{ border: '1px solid var(--panel-rule)', color: 'var(--panel-muted)' }}>
                약한 궁 {rec.weakestArea} {rec.weakestScore}
              </span>
              <span className="rounded-full px-2.5 py-1 text-[12.5px]" style={{ border: '1px solid var(--panel-accent)', color: 'var(--panel-accent)' }}>
                보완 {rec.needElement}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl p-3" style={{ background: 'rgba(9,8,18,0.3)', border: '1px solid var(--panel-rule)' }}>
              <span
                className="h-12 w-12 shrink-0 rounded-full"
                style={{
                  background: `radial-gradient(circle at 32% 28%, #ffffff 0%, ${rec.colorHex} 42%, rgba(0,0,0,0.35) 100%)`,
                  boxShadow: `0 0 24px ${rec.colorHex}66`,
                }}
                aria-hidden="true"
              />
              <div>
                <p className="t-panel-title text-[16px]">{rec.stone}</p>
                <p className="mt-0.5 text-[13px] leading-[1.7] t-panel-body">{rec.stoneDetail}</p>
              </div>
            </div>

            <p className="mt-4 text-[13px] leading-[1.85] t-panel-faint">{rec.reason}</p>
            <p className="mt-2 text-[12.5px] leading-[1.7] t-panel-faint">
              * 원석·굿즈는 효능을 보장하지 않는 자기이해용 소품입니다. 의료·투자 판단의 근거가 아닙니다.
            </p>
          </div>
        </div>

        {/* 굿즈 — 1차 결제 심사용 빌드에서는 추천(처방)만 남기고 상품 진열은 숨깁니다. */}
        {GOODS_CHECKOUT_ENABLED && (
        <div className="grid gap-2.5 sm:grid-cols-3">
          {rec.goods.map((g) => (
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
              <p className="mt-1.5 flex-1 text-[13px] leading-[1.7] t-muted">{g.detail}</p>
              <div className="mt-3 flex items-baseline justify-between gap-1">
                <span className="num text-[15px] font-semibold t-title">{g.price.toLocaleString('ko-KR')}원</span>
                <span className="text-[12px] t-faint">출시 예정</span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {GOODS_CHECKOUT_ENABLED && (
      <div className="mt-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <p className="text-[13px] leading-relaxed t-faint">
          스마트스토어·굿즈 판매 연동을 준비 중입니다. 지금은 출시 알림만 등록할 수 있어요.
        </p>
        <button
          onClick={() => setSaved(true)}
          disabled={saved}
          className={`t-btn !px-4 !py-2.5 text-[13.5px] ${saved ? 't-btn-soft' : 't-btn-primary'}`}
        >
          {saved ? (
            <>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12.5l4.5 4.5L19 7" />
              </svg>
              알림 신청 완료
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z" />
                <path d="M10 18.5a2 2 0 0 0 4 0" />
              </svg>
              출시 알림 받기
            </>
          )}
        </button>
      </div>
      )}
    </section>
  );
}
