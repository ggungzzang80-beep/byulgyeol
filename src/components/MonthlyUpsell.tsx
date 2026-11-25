import type { ChartModel } from '../lib/chart';
import { useState } from 'react';
import { findProduct, productPrice } from '../lib/products';
import { ZIWEI_ONLY } from '../config/env';
import { useTheme } from '../lib/theme';
import { SectionLabel } from './ui';

export default function MonthlyUpsell({ chart, onBundle }: { chart: ChartModel; onBundle?: () => void }) {
  const { theme } = useTheme();
  const isCharacter = theme === 'character';
  const [joined, setJoined] = useState(false);
  const bundlePrice = productPrice(findProduct('bundle'), theme);

  return (
    <section id="next" className="mt-14 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <SectionLabel index="NEXT">NEXT LINEUP</SectionLabel>
          <h2 className="t-display mt-3 text-[23px] leading-[1.4] sm:text-[26px]">
            {isCharacter ? (
              <>
                곧, 매달 찾아오는
                <br className="sm:hidden" /> 별빛 편지
              </>
            ) : (
              '다음에 열릴 문, 그리고 지금 열린 문'
            )}
          </h2>
        </div>
        <span className="t-chip !text-[12.5px]">
          {ZIWEI_ONLY ? '구독 준비 중' : '구독 준비 중 · 통합 리포트 판매 중'}
        </span>
      </div>

      <div className={`mt-4 grid gap-3.5 ${ZIWEI_ONLY ? '' : 'lg:grid-cols-2'}`}>
        {/* 월간 구독 */}
        <div className="t-card flex flex-col p-6">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12.5px] tracking-[0.2em]" style={{ color: 'var(--accent-deep)' }}>
              MONTHLY · 구독형
            </p>
            <span className="t-chip !text-[12.5px]">출시 예정</span>
          </div>
          <h3 className="t-title mt-2.5 text-[20px] leading-snug">
            {isCharacter ? '월간 별빛 편지' : '월간 명반 편지'}
            <span className="ml-1.5 text-[12.5px] font-normal t-faint">월 1회</span>
          </h3>
          <p className="mt-2 text-[13.5px] leading-[1.9] t-muted">
            {isCharacter
              ? '매달 1일, 그달의 흐름을 세 장으로 정리해 보내줄게. 금전·연애·일의 이달 처방과 조심할 날짜, 그리고 딱 하나의 행동을 담아.'
              : '매달 1일, 그달의 흐름을 세 장으로 정리해 보내드립니다. 금전·연애·일의 이달 처방과 조심할 날짜, 그리고 딱 하나의 행동을 담습니다.'}
          </p>
          <ul className="mt-3 flex-1 space-y-1.5 text-[13px] leading-relaxed t-muted">
            {(isCharacter
              ? ['이번 달 조심할 날 3일 (달력 표시)', '금전·연애·일 3장 처방', '내 별지도 변화와 10년·올해 흐름 업데이트']
              : ['이번 달 조심할 날 3일 (달력 표시)', '금전·연애·일 3장 처방', '내 명반 변화와 대한·유년 업데이트']
            ).map((t) => (
              <li key={t} className="flex gap-1.5">
                <span style={{ color: 'var(--accent)' }}>·</span>
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12.5px] t-faint">가격 미정 · 결제 연동 전</p>
          <button
            onClick={() => setJoined(true)}
            disabled={joined}
            className={`t-btn mt-3 w-full py-2.5 text-[13.5px] ${joined ? 't-btn-soft' : 't-btn-ghost'}`}
          >
            {joined ? '대기 명단 등록됨 ✓' : '월간 리포트 대기 명단 등록'}
          </button>
        </div>

        {/* 동양 + 서양 통합 — 자미두수 단독 빌드에서는 서양 동선을 열지 않습니다. */}
        {!ZIWEI_ONLY && (
        <div className="t-panel flex flex-col p-6">
          <div className="t-starfield opacity-30" />
          <div className="relative flex flex-1 flex-col">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12.5px] tracking-[0.2em] t-panel-accent">EAST × WEST · 통합</p>
              <span className="rounded-full px-2 py-0.5 text-[12px]" style={{ border: '1px solid var(--panel-accent)', color: 'var(--panel-accent)' }}>
                지금 열림
              </span>
            </div>
            <h3 className="t-panel-title mt-2.5 text-[20px] leading-snug">
              {isCharacter ? '동양 별지도 × 서양 천궁도' : '자미두수 12궁 × 서양 천궁도'}
              <br />통합 리포트
            </h3>
            <p className="mt-2 text-[13.5px] leading-[1.9] t-panel-body">
              {isCharacter
                ? '동양 12개 별방과 서양 출생 차트를 함께 놓고 교차해서 읽어. 두 체계가 같은 곳을 가리킬 때 가장 정확한 문장이 나와.'
                : '동양 12궁과 서양 출생 차트를 함께 놓고 교차해서 읽습니다. 두 체계가 같은 지점을 가리킬 때 가장 정확한 문장이 나옵니다.'}
            </p>

            <div className="mt-4 rounded-xl p-3" style={{ background: 'rgba(9,8,18,0.28)', border: '1px solid var(--panel-rule)' }}>
              <p className="text-[12.5px] leading-[1.7] t-panel-faint">
                {isCharacter
                  ? '동양 12개 별방 전체와 서양 천궁도 전체를 한 번에 열어. 이미 결제한 금액은 그대로 쓸 수 있어.'
                  : '자미두수 12궁 전체 + 서양 천궁도 전체를 한 번에 엽니다. 이미 결제한 금액은 그대로 사용됩니다.'}
              </p>
            </div>

            <button
              onClick={onBundle}
              className="t-btn t-btn-gold mt-4 w-full py-2.5 text-[13.5px]"
            >
              통합 리포트 열기 · {bundlePrice.toLocaleString('ko-KR')}원
            </button>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
