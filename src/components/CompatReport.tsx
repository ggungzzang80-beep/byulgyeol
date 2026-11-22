import type { ChartModel } from '../lib/chart';
import { compatibility, palaceReadings, palaceScore, profileOf } from '../lib/content';
import { STAR_HANJA } from '../lib/terms';
import { useTheme } from '../lib/theme';
import { ScoreBar, SectionLabel } from './ui';

type Props = {
  chart: ChartModel;
  partner: ChartModel;
  onBack: () => void;
  onPremium: () => void;
};

export default function CompatReport({ chart, partner, onBack, onPremium }: Props) {
  const { theme, copy } = useTheme();
  const isCharacter = theme === 'character';
  const compat = compatibility(chart.primaryStar, partner.primaryStar);
  const pa = profileOf(chart.primaryStar);
  const pb = profileOf(partner.primaryStar);

  const pick = (c: ChartModel, name: string) => palaceScore(c.palaces.find((p) => p.name === name));
  const emotion = Math.round((pick(chart, '부처궁') + pick(partner, '부처궁')) / 2);
  const life = Math.round((pick(chart, '전택궁') + pick(partner, '전택궁')) / 2);
  const long = Math.round((pick(chart, '관록궁') + pick(partner, '관록궁') + compat.score) / 3);

  const nameA = chart.name || '나';
  const nameB = partner.name || '상대';
  const warn = isCharacter ? '#d97d9a' : '#d98a7a';

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
          <button onClick={onBack} className="flex items-center gap-1.5 text-[14px] t-muted">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M19 12H6M11.5 6.5L6 12l5.5 5.5" />
            </svg>
            {copy.compat.back}
          </button>
          <button onClick={() => window.print()} className="t-btn t-btn-ghost !px-3.5 !py-2 text-[13.5px]">
            PDF 저장
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 pt-9 sm:px-8">
        <header className="animate-rise">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px]"
              style={{ background: 'var(--accent-soft)', border: '1px solid var(--line-strong)', color: 'var(--accent-deep)' }}
            >
              {copy.compat.unlocked}
            </span>
            <span className="t-chip !text-[12.5px]">{copy.compat.kicker}</span>
          </div>
          <h1 className="t-display mt-4 text-[27px] leading-[1.3] sm:text-[33px]">
            {nameA} · {nameB}
            <span className="mt-1 block text-[15px] font-normal t-muted">{copy.compat.top}</span>
          </h1>
        </header>

        {/* 두 사람 카드 */}
        <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
          {[
            { c: chart, n: nameA, p: pa, primary: true },
            { c: partner, n: nameB, p: pb, primary: false },
          ].map(({ c, n, p, primary }) => (
            <div
              key={n}
              className={primary ? 't-panel p-6' : 't-card p-6'}
              style={!primary ? { background: 'var(--card-2)' } : undefined}
            >
              {primary && <div className="t-starfield opacity-30" />}
              <div className="relative">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[12.5px] tracking-[0.2em]" style={{ color: primary ? 'var(--panel-accent)' : 'var(--accent-deep)' }}>
                      {n}
                    </p>
                    <p className={`mt-2 text-[23px] ${primary ? 't-panel-title' : 't-title'}`}>
                      {c.primaryStar}
                      {isCharacter ? '별' : '성'}
                      <span className="ml-1.5 text-[13px] font-normal opacity-50">{STAR_HANJA[c.primaryStar] ?? ''}</span>
                    </p>
                  </div>
                  <span className={`text-[12.5px] ${primary ? 't-panel-faint' : 't-faint'}`}>
                    {c.gender === 'female' ? '여성' : '남성'}
                  </span>
                </div>
                <p className={`mt-2 text-[14.5px] leading-[1.75] ${primary ? 't-panel-body' : 't-muted'}`}>{p.identity}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.keywords.map((k) => (
                    <span
                      key={k}
                      className="rounded-full px-2.5 py-0.5 text-[12.5px]"
                      style={
                        primary
                          ? { background: 'rgba(255,255,255,0.12)', color: 'var(--panel-muted)' }
                          : { background: 'var(--accent-soft)', color: 'var(--accent-deep)' }
                      }
                    >
                      #{k}
                    </span>
                  ))}
                </div>
                <p className={`num mt-3 text-[12.5px] ${primary ? 't-panel-faint' : 't-faint'}`}>
                  {c.solarText} · {c.timeText.split(' ')[0]}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 궁합 점수 */}
        <section className="t-card mt-5 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-9">
            <div className="relative flex h-[118px] w-[118px] shrink-0 items-center justify-center">
              <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" strokeWidth="6" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(compat.score / 100) * 327} 327`}
                />
              </svg>
              <div className="text-center">
                <p className="num t-title text-[32px] leading-none">{compat.score}</p>
                <p className="mt-1 text-[12.5px] t-faint">{copy.compat.score}</p>
              </div>
            </div>
            <div>
              <h2 className="t-title text-[22px] leading-snug">{compat.headline}</h2>
              <p className="mt-2.5 text-[14.5px] leading-[1.95] t-muted">{compat.body}</p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 pt-6 sm:grid-cols-3" style={{ borderTop: '1px solid var(--line)' }}>
            <ScoreBar label="감정의 온도" score={emotion} delay={0} />
            <ScoreBar label="생활의 리듬" score={life} delay={120} />
            <ScoreBar label="오래 가는 힘" score={long} delay={240} />
          </div>
        </section>

        {/* 부딪히는 지점 */}
        <section className="mt-11">
          <SectionLabel index="01">부딪히는 지점</SectionLabel>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <div className="t-card p-6">
              <p className="text-[12.5px] tracking-[0.18em]" style={{ color: warn }}>
                가장 자주 반복될 갈등
              </p>
              <p className="mt-2 text-[14.5px] leading-[1.9] t-body">
                {nameA} 님은 {pa.caution} {nameB} 님은 {pb.caution} 이 두 가지가 같은 날 겹치면, 사소한 말이 오래
                남습니다.
              </p>
              <p className="mt-3 text-[13.5px] leading-[1.85] t-muted">
                해법은 “그때 이야기하지 않기”입니다. 감정이 올라온 자리에서는 결론을 내리지 말고, 하루 뒤에 다시
                꺼내는 규칙을 만들어 두세요.
              </p>
            </div>
            <div className="t-card p-6">
              <p className="text-[12.5px] tracking-[0.18em]" style={{ color: 'var(--accent-deep)' }}>
                서로를 살리는 지점
              </p>
              <p className="mt-2 text-[14.5px] leading-[1.9] t-body">
                {nameA} 님의 무기는 {pa.style}, {nameB} 님의 무기는 {pb.style}입니다. 이 두 힘이 같은 방향을 볼 때
                관계의 속도가 가장 좋아집니다.
              </p>
              <p className="mt-3 text-[13.5px] leading-[1.85] t-muted">
                결정은 한 사람이, 실행은 다른 한 사람이 맡는 식으로 역할을 나누면 마찰이 크게 줄어듭니다. 두 사람이
                동시에 같은 역할을 하려 할 때 다툼이 시작됩니다.
              </p>
            </div>
          </div>
        </section>

        {/* 각자의 부처궁 */}
        <section className="mt-11">
          <SectionLabel index="02">두 사람의 연애 방식</SectionLabel>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            {[
              { c: chart, n: nameA },
              { c: partner, n: nameB },
            ].map(({ c, n }) => {
              const palace = c.palaces.find((p) => p.name === '부처궁')!;
              return (
                <div key={n} className="t-card p-6">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="t-title text-[18px]">{n}의 부처궁</h3>
                    <span className="num text-[12.5px] t-faint">
                      {palace.stem}
                      {palace.branch} · 지수 {palaceScore(palace)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {palace.major.length ? (
                      palace.major.map((s) => (
                        <span
                          key={s.cn}
                          className="rounded-full px-2 py-0.5 text-[13px]"
                          style={{ background: 'var(--accent-soft)', color: 'var(--text)' }}
                        >
                          {s.name}
                          {s.brightness && <span className="ml-1 text-[12px] t-faint">{s.brightness}</span>}
                        </span>
                      ))
                    ) : (
                      <span className="text-[13px] t-faint">주성 없음</span>
                    )}
                  </div>
                  <p className="mt-3 text-[14px] leading-[1.9] t-muted">{palaceReadings(palace).paragraphs[0]}</p>
                  <p className="mt-2 text-[14px] leading-[1.9] t-body">{n === nameA ? pa.love : pb.love}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-11">
          <div className="t-panel p-7 sm:p-9">
            <div className="t-starfield opacity-30" />
            <div className="relative">
              <p className="text-[12.5px] tracking-[0.22em] t-panel-accent">BOTTOM LINE</p>
              <p className="t-panel-title mt-4 text-[19px] leading-[1.8] sm:text-[21px]">
                이 관계의 성패는 “누가 더 맞는가”가 아니라 “언제 말을 멈출 수 있는가”에 달려 있습니다.
                <br className="hidden sm:block" /> {nameA} 님과 {nameB} 님이 각자의 속도를 인정하는 순간, 궁합 지수는
                숫자보다 훨씬 좋아집니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5 no-print">
                <button
                  onClick={() => window.print()}
                  className="t-btn !px-4 !py-2.5 text-[13.5px]"
                  style={{ background: 'var(--panel-text)', color: isCharacter ? '#4a3468' : '#14101f' }}
                >
                  PDF로 저장
                </button>
                <button onClick={onPremium} className="t-btn t-btn-onpanel !px-4 !py-2.5 text-[13.5px]">
                  내 12궁 프리미엄 보기
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
