import type { ChartModel } from '../lib/chart';
import { build2026 } from '../lib/year2026';
import { build2027 } from '../lib/newyear2027';
import { useTheme } from '../lib/theme';
import { mutagenLight, roomOf } from '../lib/friendly';
import { findProduct, productPrice } from '../lib/products';
import { ScoreBar, SectionLabel } from './ui';

/**
 * 2026 병오년 마무리 운세 리포트 (마감 할인 상품).
 * 2027 신년 운세가 메인이고, 이 리포트는 '한 해를 닫는' 짧은 리포트입니다.
 * (2026-11-25 @kooleumi8 피드백 7번)
 */
export default function Year2026Report({
  chart,
  onBack,
  onOpen2027,
}: {
  chart: ChartModel;
  onBack: () => void;
  onOpen2027: () => void;
}) {
  const { theme } = useTheme();
  const content = build2026(chart);
  const year2027 = build2027(chart, theme);
  const price2027 = productPrice(findProduct('newyear2027'), theme);

  return (
    <div className="min-h-screen pb-24">
      <div
        className="sticky top-0 z-30 no-print"
        style={{
          borderBottom: '1px solid var(--line)',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        <div className="mx-auto flex h-[62px] max-w-4xl items-center justify-between gap-3 px-5 sm:px-8">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[14px] t-muted transition hover:opacity-80">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M19 12H6M11.5 6.5L6 12l5.5 5.5" />
            </svg>
            별지도로
          </button>
          <span className="text-[13.5px] t-muted">2026 병오년 마무리 운세</span>
          <button onClick={() => window.print()} className="t-btn t-btn-ghost !px-3 !py-1.5 text-[13px] no-print">
            저장 / 인쇄
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 pt-8 sm:px-8">
        {/* 표지 */}
        <section className="t-panel p-6 sm:p-9">
          <div className="t-starfield opacity-40" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12.5px] tracking-[0.22em] t-panel-accent">2026 · 마무리 운세</p>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px]"
                style={{ border: '1px solid var(--panel-line)', color: 'var(--panel-accent)' }}
              >
                마감 할인
              </span>
            </div>

            <h1 className="t-panel-title mt-4 text-[25px] leading-[1.42] sm:text-[30px]">
              2026년, 네 별이 남긴 자리
            </h1>
            <p className="mt-2 text-[13.5px] t-panel-faint">
              {chart.name ? chart.name : '나'} · {chart.primaryStar}별 · {content.age}세 · {content.stemBranch}년(
              {content.animal}의 해)
            </p>

            <p className="t-panel-title mt-5 text-[18.5px] leading-[1.72]">{content.headline}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <span
                className="rounded-full px-2.5 py-1 text-[13px]"
                style={{ border: '1px solid var(--panel-rule)', color: 'var(--panel-muted)' }}
              >
                2026년 중심 · {roomOf(content.stage.palace)}
              </span>
              <span
                className="rounded-full px-2.5 py-1 text-[13px]"
                style={{ border: '1px solid var(--panel-rule)', color: 'var(--panel-muted)' }}
              >
                남은 두 달
              </span>
            </div>
          </div>
        </section>

        {/* 지수 */}
        <section className="mt-10">
          <SectionLabel index="01">2026 SCORES · 세 가지 별빛</SectionLabel>
          <div className="t-card mt-4 grid gap-5 p-6 sm:grid-cols-3">
            <ScoreBar label="연애의 별" score={content.scores.love} />
            <ScoreBar label="금전의 별" score={content.scores.money} delay={80} />
            <ScoreBar label="일의 별" score={content.scores.work} delay={160} />
          </div>
          <p className="mt-2 text-[13px] leading-[1.75] t-faint">
            2026년에 돈·사랑·일의 방이 되는 자리의 지수야. 2027년에는 자리가 옮겨가.
          </p>
        </section>

        {/* 별빛 네 개 */}
        <section className="mt-10">
          <SectionLabel index="02">2026 LIGHT · 한 해를 만든 별빛 네 개</SectionLabel>
          <div className="mt-4 space-y-2.5">
            {content.lines.map((m) => (
              <div key={m.mutagen + m.star} className="t-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[13px] font-semibold"
                    style={
                      m.mutagen === '화기'
                        ? { background: 'rgba(217,138,122,0.14)', color: '#c9688a', border: '1px solid rgba(217,138,122,0.3)' }
                        : { background: 'var(--accent-soft)', color: 'var(--accent-deep)', border: '1px solid var(--line-strong)' }
                    }
                  >
                    {m.star} · {mutagenLight(m.mutagen)}
                  </span>
                  <span className="text-[12.5px] t-faint">{m.field}</span>
                </div>
                <p className="mt-2.5 text-[15px] leading-[1.9] t-body">{m.line}</p>
                <p className="mt-2 text-[14px] leading-[1.85] t-muted">
                  <span className="font-semibold" style={{ color: 'var(--accent-deep)' }}>
                    남은 두 달에{' '}
                  </span>
                  {m.action}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 남은 두 달 */}
        <section className="mt-10">
          <SectionLabel index="03">2026 NOVEMBER · DECEMBER</SectionLabel>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {content.months.map((m) => (
              <div key={m.month} className="t-card p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="num text-[14px] font-semibold t-title">{m.month}월</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[12.5px]"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}
                  >
                    {m.title}
                  </span>
                </div>
                <p className="mt-2.5 text-[14.5px] leading-[1.9] t-body">{m.body}</p>
                <p className="mt-2 text-[13.5px] leading-[1.8] t-muted">
                  <span style={{ color: 'var(--accent)' }}>·</span> {m.action}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 정리 세 가지 */}
        <section className="mt-10">
          <SectionLabel index="04">RESET · 2027로 넘어가기 전 정리 세 가지</SectionLabel>
          <div className="t-panel mt-4 p-6">
            <div className="t-starfield opacity-30" />
            <div className="relative">
              <ul className="space-y-3">
                {content.reset.map((r, i) => (
                  <li key={r} className="flex gap-2.5 text-[15px] leading-[1.9] t-panel-body">
                    <span className="num shrink-0 text-[13px] t-panel-accent">0{i + 1}</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 2027 이어가기 */}
        <section className="mt-10">
          <div className="t-card p-6">
            <p className="text-[12.5px] tracking-[0.2em] t-faint">NEXT · 2027 정미년</p>
            <p className="mt-2 text-[15px] leading-[1.9] t-body">{content.note}</p>
            <p className="mt-2 text-[14.5px] leading-[1.9] t-muted">
              2027년 네 별방은 <b className="font-semibold">{roomOf(year2027.stage.palace)}</b>
              이야. 열두 달에 뭘 먼저 할지까지 이어서 볼 수 있어.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={onOpen2027} className="t-btn t-btn-gold px-4 py-2.5 text-[14px]">
                2027 신년 운세 열기 · {price2027.toLocaleString('ko-KR')}원
              </button>
              <button onClick={onBack} className="t-btn t-btn-soft px-4 py-2.5 text-[13.5px]">
                내 별지도로
              </button>
              <button onClick={() => window.print()} className="t-btn t-btn-ghost px-4 py-2.5 text-[13.5px] no-print">
                PDF로 저장 / 인쇄
              </button>
            </div>
          </div>
        </section>

        <p className="mt-9 text-center text-[13px] leading-[1.9] t-faint">
          자미두수는 전통 상담 문화야. 의료·법률·투자 판단의 근거가 아니야. © 2026 별의 속삭임
        </p>
      </div>
    </div>
  );
}
