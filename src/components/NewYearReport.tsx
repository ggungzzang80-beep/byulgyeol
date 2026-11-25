import type { ChartModel } from '../lib/chart';
import { build2027, type MonthTone } from '../lib/newyear2027';
import { useTheme } from '../lib/theme';
import { mutagenLight, roomOf } from '../lib/friendly';
import StoneGoods2027 from './StoneGoods2027';
import { GOODS_CHECKOUT_ENABLED } from '../config/env';
import { ScoreBar, SectionLabel } from './ui';

const TONE: Record<MonthTone, { label: string; color: string; soft: string }> = {
  open: { label: '열림', color: '#3f9e7c', soft: 'rgba(63,158,124,0.14)' },
  push: { label: '추진', color: '#c98a3f', soft: 'rgba(201,138,63,0.14)' },
  name: { label: '평판', color: '#7c6ad6', soft: 'rgba(124,106,214,0.14)' },
  care: { label: '정리', color: '#c96a86', soft: 'rgba(201,106,134,0.14)' },
  steady: { label: '쌓기', color: '#8a8199', soft: 'rgba(138,129,153,0.14)' },
};

const MUTAGEN_COLOR: Record<string, string> = {
  화록: '#3f9e7c',
  화권: '#c98a3f',
  화과: '#7c6ad6',
  화기: '#c96a86',
};

export default function NewYearReport({ chart, onBack }: { chart: ChartModel; onBack: () => void }) {
  const { theme } = useTheme();
  const isCharacter = theme === 'character';
  const content = build2027(chart, theme);

  return (
    <div className="min-h-screen pb-24">
      <div
        className="sticky top-0 z-30 no-print"
        style={{
          borderBottom: '1px solid var(--line)',
          background: theme === 'character' ? 'rgba(255,255,255,0.92)' : 'rgba(9,8,18,0.92)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        <div className="mx-auto flex h-[62px] max-w-4xl items-center justify-between gap-3 px-5 sm:px-8">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[14px] t-muted transition hover:opacity-80">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M19 12H6M11.5 6.5L6 12l5.5 5.5" />
            </svg>
            {isCharacter ? '별지도로' : '명반으로'}
          </button>
          <span className="text-[13.5px] t-muted">2027 정미년 정밀 운세</span>
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
              <p className="text-[12.5px] tracking-[0.24em] t-panel-accent">
                {isCharacter ? '2027 · 신년 정밀 운세' : '2027 丁未 · 신년 정밀 운세'}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px]" style={{ border: '1px solid var(--panel-line)', color: 'var(--panel-accent)' }}>
                열림
              </span>
            </div>

            <h1 className="t-panel-title mt-4 text-[26px] leading-[1.4] sm:text-[32px]">
              {isCharacter ? '2027년, 나의 별이 오래 타는 해' : '2027년, 오래 타는 불의 해'}
            </h1>
            <p className="mt-2 text-[13.5px] t-panel-faint">
              {chart.name ? (isCharacter ? chart.name : `${chart.name} 님`) : '나'} · {chart.primaryStar}
              {isCharacter ? '별' : '성'} · {content.age}세 · {content.stemBranch}년({content.animal}의 해)
            </p>

            <p className="t-panel-title mt-5 text-[19px] leading-[1.65]">{content.headline}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {content.keywords.map((k) => (
                <span key={k} className="rounded-full px-2.5 py-1 text-[13px]" style={{ border: '1px solid var(--panel-line)', color: 'var(--panel-text)' }}>
                  ✧ {k}
                </span>
              ))}
              <span className="rounded-full px-2.5 py-1 text-[13px]" style={{ border: '1px solid var(--panel-rule)', color: 'var(--panel-muted)' }}>
                {isCharacter ? '올해 흐름' : '유년 명궁'} {isCharacter ? roomOf(content.stage.palace) : content.stage.palace} · {content.stage.domain}
              </span>
            </div>

            <p className="mt-4 text-[14.5px] leading-[1.9] t-panel-body">{content.flow.free}</p>
            <p className="mt-2 text-[14.5px] leading-[1.9] t-panel-body">{content.flow.locked}</p>
            <p className="mt-4 rounded-2xl px-3.5 py-3 text-[14px] leading-[1.85]" style={{ background: 'rgba(9,8,18,0.28)', border: '1px solid var(--panel-rule)', color: 'var(--panel-text)' }}>
              <b style={{ color: 'var(--panel-accent)' }}>한 줄 조언 </b>
              {content.advice}
            </p>
          </div>
        </section>

        {/* 2027 지수 */}
        <section className="mt-10">
          <SectionLabel index="01">2027 SCORES · 세 가지 지수</SectionLabel>
          <div className="t-card mt-4 grid gap-5 p-6 sm:grid-cols-3">
            <ScoreBar label={isCharacter ? '연애의 별' : '연애'} score={content.scores.love} />
            <ScoreBar label={isCharacter ? '금전의 별' : '금전'} score={content.scores.money} delay={80} />
            <ScoreBar label={isCharacter ? '일의 별' : '일'} score={content.scores.work} delay={160} />
          </div>
          <p className="mt-2 text-[13px] leading-[1.75] t-faint">
            {isCharacter
              ? '2027년에 돈·사랑·일의 방이 되는 자리의 지수예요. 해마다 자리가 옮겨가요.'
              : '2027년에 유년 재백·부처·관록 궁이 되는 자리의 지수입니다. 해마다 자리가 옮겨갑니다.'}
          </p>
        </section>

        {/* 사화 */}
        <section className="mt-10">
          <SectionLabel index="02">{isCharacter ? '2027 LIGHT · 별빛 네 개' : '2027 MUTAGEN · 사화 네 개'}</SectionLabel>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {content.mutagen.map((m) => (
              <div key={m.mutagen} className="t-card p-5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold"
                    style={{ background: `${MUTAGEN_COLOR[m.mutagen]}22`, color: MUTAGEN_COLOR[m.mutagen], border: `1px solid ${MUTAGEN_COLOR[m.mutagen]}55` }}
                  >
                    {isCharacter ? `${m.star} · ${mutagenLight(m.mutagen)}` : `${m.mutagen} · ${m.star}`}
                  </span>
                  <span className="text-[12.5px] t-faint">{isCharacter ? roomOf(m.palace) : m.palace}</span>
                </div>
                <p className="mt-2.5 text-[14px] leading-[1.85] t-body">{m.line}</p>
                <p className="mt-2 text-[13.5px] leading-[1.8] t-muted">
                  <span className="font-semibold" style={{ color: 'var(--accent-deep)' }}>
                    할 일{' '}
                  </span>
                  {m.action}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 열두 달 */}
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <SectionLabel index="03">2027 MONTHS · 열두 달</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(TONE) as MonthTone[]).map((t) => (
                <span key={t} className="rounded-full px-2 py-0.5 text-[12.5px]" style={{ background: TONE[t].soft, color: TONE[t].color }}>
                  {TONE[t].label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {content.months.map((m) => {
              const tone = TONE[m.tone];
              return (
                <div key={m.month} className="t-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="num text-[13px] tracking-[0.1em] t-muted">{String(m.month).padStart(2, '0')}월</span>
                    <span className="rounded-full px-2 py-0.5 text-[12px]" style={{ background: tone.soft, color: tone.color }}>
                      {tone.label}
                    </span>
                  </div>
                  <p className="t-title mt-1.5 text-[15px]">{m.title}</p>
                  <p className="mt-1.5 text-[13.5px] leading-[1.8] t-body">{m.body}</p>
                  <p className="mt-1.5 text-[13px] leading-[1.75] t-muted">
                    <span style={{ color: 'var(--accent)' }}>·</span> {m.action}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[13px] leading-[1.75] t-faint">
            {isCharacter
              ? '2027은 화토의 해라 5월에서 7월에 열기가 몰려. 그 석 달은 크게 벌이기보다 한 번 식히는 쪽이 좋아.'
              : '2027은 화토의 해라 5월에서 7월에 열기가 몰립니다. 그 석 달은 크게 벌이기보다 한 번 식히는 편이 좋습니다.'}
          </p>
        </section>

        {/* 보완 처방 */}
        <section className="mt-10">
          <SectionLabel index="04">BALANCE · 보완 처방</SectionLabel>
          <div className="t-panel mt-4 p-6">
            <div className="t-starfield opacity-30" />
            <div className="relative grid gap-5 sm:grid-cols-[0.9fr_1.1fr] sm:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className="h-14 w-14 shrink-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 32% 28%, #ffffff 0%, ${content.stone.colorHex} 44%, rgba(0,0,0,0.42) 100%)`,
                      boxShadow: `0 0 26px ${content.stone.colorHex}66`,
                    }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-[12.5px] tracking-[0.18em] t-panel-accent">보완의 기운</p>
                    <p className="t-panel-title mt-1 text-[18px]">{content.needLabel}</p>
                  </div>
                </div>
                <p className="mt-3 text-[13.5px] leading-[1.85] t-panel-body">{content.needReason}</p>
                {!isCharacter && (
                  <>
                    <p className="mt-2 text-[13.5px] leading-[1.85] t-panel-faint">
                      수호 원석 · <b style={{ color: 'var(--panel-accent)' }}>{content.stone.name}</b>
                    </p>
                    <p className="mt-1 text-[13px] leading-[1.8] t-panel-faint">{content.stone.detail}</p>
                  </>
                )}
              </div>

              <div className="rounded-2xl p-4" style={{ background: 'rgba(9,8,18,0.26)', border: '1px solid var(--panel-rule)' }}>
                <p className="text-[12.5px] tracking-[0.18em] t-panel-accent">2027년에 해볼 세 가지</p>
                <ul className="mt-2.5 space-y-2">
                  {content.habits.map((h, i) => (
                    <li key={h} className="flex gap-2 text-[13.5px] leading-[1.8] t-panel-body">
                      <span className="num shrink-0 text-[12.5px] t-panel-accent">0{i + 1}</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 굿즈 — 1차 결제 심사용 빌드에서는 숨깁니다. */}
        {GOODS_CHECKOUT_ENABLED && !isCharacter && (
          <section className="mt-10">
            <StoneGoods2027 goods={content.goods} needLabel={content.needLabel} stoneName={content.stone.name} />
          </section>
        )}

        <section className="mt-10">
          <div className="t-card p-6">
            <p className="text-[12.5px] tracking-[0.2em] t-faint">NEXT · 이어지는 이야기</p>
            <p className="mt-2 text-[14.5px] leading-[1.9] t-body">
              {isCharacter
                ? '2027년 흐름은 12개 별방 이야기와 함께 볼 때 가장 선명해요. 별방 전체와 달마다 처방은 「전체 별 이야기」에 있어요.'
                : '2027년 흐름은 12궁 전체 해설과 함께 볼 때 가장 선명합니다. 12궁 전체와 월별 가이드는 프리미엄 리포트에 있습니다.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={onBack} className="t-btn t-btn-soft px-4 py-2.5 text-[13.5px]">
                {isCharacter ? '내 별지도로 돌아가기' : '내 명반으로 돌아가기'}
              </button>
              <button onClick={() => window.print()} className="t-btn t-btn-ghost px-4 py-2.5 text-[13.5px] no-print">
                PDF로 저장 / 인쇄
              </button>
            </div>
          </div>
        </section>

        <p className="mt-9 text-center text-[13px] leading-[1.9] t-faint">
          {isCharacter
            ? '자미두수는 전통 상담 문화예요. 의료·법률·투자 판단의 근거가 아니며, 부적은 효능을 보장하지 않는 소장용 콘텐츠예요. © 2027 별의 속삭임'
            : '자미두수는 전통 상담 문화로, 의료·법률·투자 판단의 근거가 아닙니다. 원석·굿즈는 효능을 보장하지 않는 소장용 소품입니다. © 2027 자미원'}
        </p>
      </div>
    </div>
  );
}
