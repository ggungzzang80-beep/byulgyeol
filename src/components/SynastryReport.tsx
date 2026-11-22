import { useMemo } from 'react';
import type { WesternModel } from '../lib/western';
import { synastryOf, withJosa } from '../lib/synastry';
import { useTheme } from '../lib/theme';
import { ScoreBar, SectionLabel } from './ui';

type Props = {
  model: WesternModel;
  partner: WesternModel;
  onBack: () => void;
  /** 결제 화면으로 돌아가 다른 상대와 다시 보기 */
  onAgain: () => void;
};

/** 심층 시너스트리 리포트 — 결제 확인 후 열리는 전체 리포트. */
export default function SynastryReport({ model, partner, onBack, onAgain }: Props) {
  const { theme } = useTheme();
  const isCharacter = theme === 'character';
  const syn = useMemo(() => synastryOf(model, partner), [model, partner]);
  const warn = isCharacter ? '#d97d9a' : '#d98a7a';
  const topAspects = syn.aspects.slice(0, 14);

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
            {isCharacter ? '내 천궁도로' : '천궁도로'}
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
              {isCharacter ? '시너스트리 열림' : '잠금 해제됨'}
            </span>
            <span className="t-chip !text-[12.5px]">서양 점성술 · 시너스트리</span>
          </div>
          <h1 className="t-display mt-4 text-[27px] leading-[1.3] sm:text-[33px]">
            {syn.nameA} · {syn.nameB}
            <span className="mt-1 block text-[15px] font-normal t-muted">두 사람의 행성이 만드는 각</span>
          </h1>
        </header>

        {/* 두 사람 */}
        <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
          {[
            { m: model, n: syn.nameA, primary: true },
            { m: partner, n: syn.nameB, primary: false },
          ].map(({ m, n, primary }) => (
            <div key={`${n}-${m.solarText}`} className={primary ? 't-panel p-6' : 't-card p-6'} style={!primary ? { background: 'var(--card-2)' } : undefined}>
              {primary && <div className="t-starfield opacity-30" />}
              <div className="relative">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[12.5px] tracking-[0.2em]" style={{ color: primary ? 'var(--panel-accent)' : 'var(--accent-deep)' }}>
                      {n}
                    </p>
                    <p className={`mt-2 text-[21px] ${primary ? 't-panel-title' : 't-title'}`}>
                      ☉ {m.sun.signName} · ☾ {m.moon.signName}
                    </p>
                  </div>
                  <span className={`text-[12.5px] ${primary ? 't-panel-faint' : 't-faint'}`}>
                    {m.gender === 'female' ? '여성' : '남성'}
                  </span>
                </div>
                <p className={`mt-2 text-[14px] leading-[1.8] ${primary ? 't-panel-body' : 't-muted'}`}>
                  어센던트 {m.rising.name} · {m.dominantElement} 기운 우세. {m.rising.keyword}.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[
                    `☉ ${m.sun.signName}`,
                    `☾ ${m.moon.signName}`,
                    `♀ ${m.planets.find((p) => p.key === 'venus')!.signName}`,
                    `♂ ${m.planets.find((p) => p.key === 'mars')!.signName}`,
                  ].map((k) => (
                    <span
                      key={k}
                      className="rounded-full px-2.5 py-0.5 text-[12.5px]"
                      style={
                        primary
                          ? { background: 'rgba(255,255,255,0.12)', color: 'var(--panel-muted)' }
                          : { background: 'var(--accent-soft)', color: 'var(--accent-deep)' }
                      }
                    >
                      {k}
                    </span>
                  ))}
                </div>
                <p className={`num mt-3 text-[12.5px] ${primary ? 't-panel-faint' : 't-faint'}`}>
                  {m.solarText} · {m.timeKnown ? m.timeText.split(' ')[0] : '시간 모름'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 점수 */}
        <section className="t-card mt-5 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-9">
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <div className="relative flex h-[110px] w-[110px] items-center justify-center">
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
                    strokeDasharray={`${(syn.score / 100) * 327} 327`}
                  />
                </svg>
                <p className="num t-title text-[32px] leading-none">{syn.score}</p>
              </div>
              <p className="text-[12.5px] t-faint">시너스트리 지수</p>
            </div>
            <div>
              <p className="text-[12.5px] tracking-[0.16em]" style={{ color: 'var(--accent-deep)' }}>
                {syn.band.label}
              </p>
              <h2 className="t-title mt-1.5 text-[21px] leading-snug">{syn.headline}</h2>
              <p className="mt-2.5 text-[14.5px] leading-[1.95] t-muted">{syn.summary}</p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 pt-6 sm:grid-cols-3" style={{ borderTop: '1px solid var(--line)' }}>
            <ScoreBar label="감정의 온도" score={syn.temperature} delay={0} hint={`달 ${model.moon.signName} × ${partner.moon.signName}`} />
            <ScoreBar label="끌림의 세기" score={syn.pull} delay={120} hint="금성 · 화성 교차" />
            <ScoreBar label="오래 가는 힘" score={syn.lasting} delay={240} hint="토성 · 수성 교차, 원소 궁합" />
          </div>
        </section>

        {/* 원소 궁합 */}
        <section className="mt-5 t-card p-6">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12.5px] tracking-[0.18em] t-faint">ELEMENT · 원소 궁합</p>
            <span className="t-chip !text-[12.5px]">{syn.element.label}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: 'var(--field-bg)' }}>
              <p className="text-[12.5px] t-faint">{syn.nameA}</p>
              <p className="t-title mt-0.5 text-[16px]">{syn.element.a} 우세</p>
            </div>
            <div className="rounded-xl px-3 py-2.5 text-center" style={{ background: 'var(--field-bg)' }}>
              <p className="text-[12.5px] t-faint">{syn.nameB}</p>
              <p className="t-title mt-0.5 text-[16px]">{syn.element.b} 우세</p>
            </div>
          </div>
          <div className="mt-3 h-[6px] overflow-hidden rounded-full" style={{ background: 'var(--field-bg)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round(syn.element.harmony * 100)}%`, background: 'var(--accent)' }} />
          </div>
          <p className="mt-2 text-[13.5px] leading-[1.85] t-muted">{syn.element.note}</p>
        </section>

        {/* 관계 역학 */}
        <section className="mt-11">
          <SectionLabel index="01">관계 역학</SectionLabel>
          <div className="mt-4 space-y-3">
            {syn.dynamics.map((d) => (
              <div key={d.title} className="t-card p-5">
                <p className="text-[15px] font-semibold t-title">{d.title}</p>
                <p className="mt-1.5 text-[14px] leading-[1.9] t-muted">{d.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 교차 각 */}
        <section className="mt-11">
          <SectionLabel index="02">교차 각</SectionLabel>
          <h2 className="t-display mt-3 text-[23px]">행성끼리 만나는 자리</h2>
          <p className="mt-2 text-[13.5px] leading-[1.85] t-muted">
            {syn.aspects.length > topAspects.length
              ? `두 천궁도에서 찾은 주요 각 ${syn.aspects.length}개 중 영향이 큰 ${topAspects.length}개를 담았습니다.`
              : `두 천궁도에서 찾은 주요 각 ${syn.aspects.length}개를 영향이 큰 순서로 담았습니다.`}{' '}
            합·삼분·육분은 밀어 주는 각, 사분·대립은 부딪히는 각입니다.
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl" style={{ border: '1px solid var(--line)' }}>
            {topAspects.map((asp, i) => (
              <div
                key={`${asp.pair}-${asp.type}-${i}`}
                className="px-4 py-3"
                style={{ background: i % 2 ? 'var(--card-2)' : 'transparent', borderTop: i ? '1px solid var(--line)' : undefined }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[13.5px] font-semibold t-body">
                    내 {asp.a.name} · 상대 {asp.b.name}
                    <span className="ml-1.5 text-[12.5px] t-muted">
                      {asp.type} {asp.angle}°
                    </span>
                  </p>
                  <span
                    className="num shrink-0 rounded-full px-2 py-0.5 text-[12.5px]"
                    style={
                      asp.tone === 'flow'
                        ? { background: 'var(--accent-soft)', color: 'var(--accent-deep)' }
                        : { background: 'transparent', color: warn, border: '1px solid var(--line)' }
                    }
                  >
                    {asp.tone === 'flow' ? '순한 각' : '센 각'} · 오브 {asp.orb}°
                  </span>
                </div>
                <p className="mt-1 text-[13.5px] leading-[1.8] t-muted">{asp.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 갈등 포인트 */}
        <section className="mt-11">
          <SectionLabel index="03">갈등 포인트</SectionLabel>
          <div className="mt-4 space-y-3">
            {syn.conflicts.map((c) => (
              <div key={c.title} className="t-card p-5">
                <p className="text-[12.5px] tracking-[0.14em]" style={{ color: warn }}>
                  {c.title}
                </p>
                <p className="mt-1.5 text-[14px] leading-[1.9] t-body">{c.body}</p>
                <p className="mt-2 border-t pt-2 text-[13.5px] leading-[1.85] t-muted" style={{ borderColor: 'var(--line)' }}>
                  <b style={{ color: 'var(--accent-deep)' }}>넘는 법 </b>
                  {c.fix}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 보완 조언 */}
        <section className="mt-11">
          <SectionLabel index="04">보완 조언</SectionLabel>
          <div className="mt-4 t-card p-6">
            <ol className="space-y-3">
              {syn.advice.map((a, i) => (
                <li key={a} className="flex gap-2.5">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12.5px]"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-[14px] leading-[1.9] t-body">{a}</p>
                </li>
              ))}
            </ol>
            <div className="mt-4 grid gap-2 border-t pt-4 sm:grid-cols-2" style={{ borderColor: 'var(--line)' }}>
              <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--field-bg)' }}>
                <p className="text-[12.5px] t-faint">{syn.nameA}의 자리</p>
                <p className="mt-0.5 text-[13.5px] leading-[1.7] t-body">{syn.roles.a}</p>
              </div>
              <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--field-bg)' }}>
                <p className="text-[12.5px] t-faint">{syn.nameB}의 자리</p>
                <p className="mt-0.5 text-[13.5px] leading-[1.7] t-body">{syn.roles.b}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 정리 */}
        <section className="mt-11">
          <div className="t-panel p-7 sm:p-9">
            <div className="t-starfield opacity-30" />
            <div className="relative">
              <p className="text-[12.5px] tracking-[0.22em] t-panel-accent">BOTTOM LINE</p>
              <p className="t-panel-title mt-4 text-[19px] leading-[1.8] sm:text-[21px]">
                {syn.band.line}
                <br className="hidden sm:block" /> {withJosa(syn.nameA, '과와')} {syn.nameB}의 지수{' '}
                {withJosa(String(syn.score), '은는')} 변하지 않는 값이 아니라, 지금 두 사람이 어디에 힘을 쓰면 좋은지를
                알려주는 좌표입니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5 no-print">
                <button
                  onClick={() => window.print()}
                  className="t-btn !px-4 !py-2.5 text-[13.5px]"
                  style={{ background: 'var(--panel-text)', color: isCharacter ? '#4a3468' : '#14101f' }}
                >
                  PDF로 저장
                </button>
                <button onClick={onAgain} className="t-btn t-btn-onpanel !px-4 !py-2.5 text-[13.5px]">
                  다른 사람으로 다시 보기
                </button>
              </div>
            </div>
          </div>
        </section>

        <p className="mt-9 text-center text-[13px] leading-[1.9] t-faint">
          서양 점성술은 오락과 자기 이해를 위한 콘텐츠입니다. 의료·법률·투자 판단의 근거가 아닙니다. 출생지는 서울
          기준으로 계산했습니다.
        </p>
      </div>
    </div>
  );
}
