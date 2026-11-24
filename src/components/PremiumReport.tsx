import { useEffect, useMemo, useState } from 'react';
import type { ChartModel } from '../lib/chart';
import { buildTeaser, deepProfileOf, monthlyGuide, palaceReadings, palaceScore, profileOf, type Tone } from '../lib/content';
import { build2027 } from '../lib/newyear2027';
import { PALACES, STAR_HANJA } from '../lib/terms';
import { generateAiReport, isAiConfigured } from '../services/aiReport';
import { useTheme } from '../lib/theme';
import { starGuardian } from '../lib/starPalette';
import { findProduct, productPrice } from '../lib/products';
import GuardianGoods from './GuardianGoods';
import MonthlyUpsell from './MonthlyUpsell';
import { ScoreBar, SectionLabel } from './ui';

type Props = {
  chart: ChartModel;
  tier: 'basic' | 'premium';
  focusAi?: boolean;
  onBack: () => void;
  onCompat: () => void;
  onUpgrade: () => void;
  onBundle: () => void;
};

function MarkdownLite({ text }: { text: string }) {
  const blocks = text.split('\n').filter((l) => l.trim().length > 0);
  return (
    <div className="space-y-2.5">
      {blocks.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <h4 key={i} className="t-title pt-2 text-[17px]">
              {line.replace(/^##\s*/, '')}
            </h4>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <p key={i} className="flex gap-2 text-[14.5px] leading-[1.8] t-muted">
              <span style={{ color: 'var(--accent)' }}>·</span>
              {line.replace(/^-\s*/, '')}
            </p>
          );
        }
        return (
          <p key={i} className="text-[14.5px] leading-[1.85] t-body">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function PremiumReport({ chart, tier, focusAi = false, onBack, onCompat, onUpgrade, onBundle }: Props) {
  const { theme, copy } = useTheme();
  const isCharacter = theme === 'character';
  /* 말투 — 별의 속삭임은 반말, 자미원은 합니다체 (QA 2026-11-24 3번) */
  const tone: Tone = isCharacter ? 'casual' : 'formal';
  const profile = profileOf(chart.primaryStar, tone);
  const deep = deepProfileOf(chart.primaryStar, tone);
  const teaser = buildTeaser(chart, tone);
  /* 유료 리포트의 '올해'는 2027 정미년으로 통일 — 본편(2027 부적)과 같은 해를 읽습니다. */
  const year2027 = build2027(chart, theme);
  const reportYear = year2027.year;
  const scores = useMemo(
    () => ({
      금전: palaceScore(chart.palaces.find((p) => p.name === '재백궁')),
      연애: palaceScore(chart.palaces.find((p) => p.name === '부처궁')),
      일: palaceScore(chart.palaces.find((p) => p.name === '관록궁')),
    }),
    [chart],
  );

  const [ai, setAi] = useState<{ loading: boolean; text: string | null; error: string | null }>({
    loading: false,
    text: null,
    error: null,
  });
  const aiReady = isAiConfigured();

  const runAi = async () => {
    setAi({ loading: true, text: null, error: null });
    const result = await generateAiReport({ tier: tier === 'premium' ? 'premium' : 'basic', chart });
    if (result.ok) setAi({ loading: false, text: result.markdown, error: null });
    else setAi({ loading: false, text: null, error: result.reason });
  };

  useEffect(() => {
    if (!focusAi) return;
    const timer = window.setTimeout(() => {
      document.getElementById('pinpoint')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [focusAi]);

  const orderedPalaces = [...PALACES]
    .map((meta) => chart.palaces.find((p) => p.cn === meta.cn))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const decadalList = [...chart.palaces]
    .filter((p) => p.decadalRange[0] >= 0)
    .sort((a, b) => a.decadalRange[0] - b.decadalRange[0])
    .slice(0, 12);

  const decadalPalace =
    chart.palaces.find((p) => p.decadalRange[0] === chart.decadal.range[0]) ?? chart.soulPalace;

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
        <div className="mx-auto flex h-[62px] max-w-5xl items-center justify-between gap-3 px-5 sm:px-8">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[14px] t-muted transition hover:opacity-80">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M19 12H6M11.5 6.5L6 12l5.5 5.5" />
            </svg>
            {copy.compat.back}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="t-btn t-btn-ghost !px-3.5 !py-2 text-[13.5px]">
              PDF 저장
            </button>
            <button onClick={onCompat} className="t-btn t-btn-primary !px-3.5 !py-2 text-[13.5px]">
              궁합 리포트
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 pt-9 sm:px-8">
        <header className="animate-rise">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px]"
              style={{ background: 'var(--accent-soft)', border: '1px solid var(--line-strong)', color: 'var(--accent-deep)' }}
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
                <path d="M8.5 10.5V8a3.5 3.5 0 1 1 7 0v2.5" />
              </svg>
              {copy.report.unlocked}
            </span>
            <span className="t-chip !text-[12.5px]">
              {tier === 'premium' ? '프리미엄 12궁 & 운세 풀 리포트' : '내 인생 사용설명서'}
            </span>
            <span className="t-chip !text-[12.5px]">정밀 엔진 분석</span>
          </div>

          {isCharacter && (
            <div className="mt-5 flex items-end gap-2">
              <span className="guardian-avatar h-9 w-9 shrink-0">
                <img src={starGuardian(chart.primaryStar).image} alt={`${chart.primaryStar}별 가디언`} className="h-full w-full object-cover" />
              </span>
              <p className="bubble px-3 py-2 text-[13px] leading-[1.7]">
                네 별 이야기를 전부 펼쳐봤어. 한 장씩 천천히 읽어봐 ✨
              </p>
            </div>
          )}

          <h1 className="t-display mt-4 text-[28px] leading-[1.3] sm:text-[34px]">{copy.report.title(chart.name)}</h1>
          <p className="mt-2 text-[14px] t-muted">
            {chart.primaryStar}
            {isCharacter ? '별' : '성'} · {profile.identity}
          </p>

          <div className="t-card mt-5 grid grid-cols-2 gap-px overflow-hidden !rounded-2xl sm:grid-cols-4" style={{ background: 'var(--line)' }}>
            {[
              ['양력', chart.solarText],
              [chart.calendar === 'lunar' ? '음력(입력)' : '음력', chart.lunarText.replace('음력 ', '')],
              ['시진', chart.timeText],
              ['오행국', chart.fiveElements],
            ].map(([k, v]) => (
              <div key={k} className="px-4 py-3" style={{ background: 'var(--card-2)' }}>
                <p className="text-[12px] tracking-[0.16em] t-faint">{k}</p>
                <p className="num mt-1 text-[13.5px] t-body">{v}</p>
              </div>
            ))}
          </div>
          {chart.note && <p className="mt-2 text-[13px] t-faint">* {chart.note}</p>}
          {!chart.timeKnown && (
            <p className="mt-1 text-[13px] t-faint">* 태어난 시간을 몰라 정오(오시) 기준으로 계산했습니다.</p>
          )}
        </header>

        {/* 1. 성격 */}
        <section className="mt-12">
          <SectionLabel index="01">{copy.report.sectionPersonality}</SectionLabel>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="t-card p-6 sm:p-7">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="t-title text-[23px]">
                  {chart.primaryStar}
                  {isCharacter ? '별' : '성'}
                  <span className="ml-2 text-[14px] font-normal" style={{ color: 'var(--accent-deep)' }}>
                    {STAR_HANJA[chart.primaryStar] ?? ''}
                  </span>
                </h2>
                <span className="text-[13px] t-faint">
                  명궁 {chart.soulPalace.stem}
                  {chart.soulPalace.branch}
                </span>
              </div>
              <p className="mt-4 text-[15.5px] leading-[1.9] t-body">{palaceReadings(chart.soulPalace, tone).paragraphs[0]}</p>
              <p className="mt-3 text-[15.5px] leading-[1.9] t-body">{palaceReadings(chart.soulPalace, tone).paragraphs[1]}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl p-4" style={{ background: 'var(--field-bg)' }}>
                  <p className="text-[12.5px] tracking-[0.16em]" style={{ color: 'var(--accent-deep)' }}>
                    {copy.chart.strength}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.8] t-muted">{profile.strength}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: 'var(--field-bg)' }}>
                  <p className="text-[12.5px] tracking-[0.16em]" style={{ color: isCharacter ? '#d97d9a' : '#d98a7a' }}>
                    {copy.chart.caution}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.8] t-muted">{profile.caution}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {profile.keywords.map((k) => (
                  <span key={k} className="t-chip !text-[13px]">
                    #{k}
                  </span>
                ))}
              </div>
            </div>

            <div className="t-card p-6">
              <p className="text-[12.5px] tracking-[0.18em] t-faint">잘 맞는 일</p>
              <ul className="mt-3 space-y-2">
                {profile.jobs.map((j, i) => (
                  <li key={j} className="flex items-baseline gap-2.5 text-[14.5px] t-body">
                    <span className="num text-[12.5px]" style={{ color: 'var(--accent)' }}>
                      0{i + 1}
                    </span>
                    {j}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
                <p className="text-[12.5px] tracking-[0.18em] t-faint">몸의 습관</p>
                <p className="mt-2 text-[14px] leading-[1.85] t-muted">{profile.body}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 지수 */}
        <section className="mt-12">
          <SectionLabel index="02">{copy.report.sectionScores}</SectionLabel>
          <div className="t-card mt-4 p-6 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-3">
              <ScoreBar label="연애의 별" score={scores.연애} hint={profile.love} delay={0} />
              <ScoreBar label="금전의 별" score={scores.금전} hint={profile.money} delay={120} />
              <ScoreBar label="일의 별" score={scores.일} hint={profile.work} delay={240} />
            </div>
            <p className="mt-5 pt-4 text-[13px] leading-[1.8] t-faint" style={{ borderTop: '1px solid var(--line)' }}>
              {isCharacter
                ? '지수는 각 방의 주성 밝기·사화·보좌성 배치를 합산한 상대값이야. 모든 화면과 저장 카드에서 같은 세 가지(연애의 별·금전의 별·일의 별)만 보여줘.'
                : '지수는 각 궁의 주성 밝기·사화·보좌성 배치를 합산한 상대값입니다. 모든 화면과 저장 카드에서 같은 세 가지(연애의 별·금전의 별·일의 별)만 보여줍니다.'}
            </p>
          </div>
        </section>

        {/* 3. 올해 */}
        <section className="mt-12">
          <SectionLabel index="03">
            {isCharacter ? `${reportYear}년 · 신년의 흐름` : `${reportYear}년 · 신년 흐름`}
          </SectionLabel>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="t-panel p-6">
              <div className="t-starfield opacity-40" />
              <div className="relative">
                <p className="text-[12.5px] tracking-[0.2em] t-panel-accent">대한 · 10년의 큰 흐름</p>
                <p className="t-panel-title mt-3 text-[23px] leading-snug">
                  {chart.decadal.range[0]}–{chart.decadal.range[1]}세{' '}
                  <span className="ml-2 text-[14px] font-normal opacity-60">
                    {chart.decadal.name} · {decadalPalace.name}
                  </span>
                </p>
                <p className="mt-3 text-[14px] leading-[1.9] t-panel-body">{palaceReadings(decadalPalace, tone).paragraphs[1]}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {decadalList.map((p) => {
                    const active = chart.decadal.range[0] === p.decadalRange[0];
                    return (
                      <span
                        key={p.index}
                        className="num rounded-full px-2.5 py-1 text-[12.5px]"
                        style={
                          active
                            ? { border: '1px solid var(--panel-accent)', background: 'rgba(255,255,255,0.14)', color: 'var(--panel-accent)' }
                            : { border: '1px solid var(--panel-rule)', color: 'var(--panel-faint)' }
                        }
                      >
                        {p.decadalRange[0]}-{p.decadalRange[1]} {p.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="t-card p-6">
              <p className="text-[12.5px] tracking-[0.2em]" style={{ color: 'var(--accent-deep)' }}>
                유년 · {reportYear} {year2027.stemBranch}
              </p>
              <p className="mt-3 text-[14.5px] leading-[1.9] t-body">
                {isCharacter ? (
                  <>
                    {reportYear}년 네 별방은 <b className="font-semibold">{year2027.stage.palace}</b>
                    {year2027.stage.palace.endsWith('궁') ? '이야' : '야'}. 이 해에는 그 방의 주제가 가장 크게
                    움직여.
                  </>
                ) : (
                  <>
                    {reportYear}년 유년 명궁은 <b className="font-semibold">{year2027.stage.palace}</b>입니다. 이 해에는
                    그 자리의 주제가 가장 크게 움직입니다.
                  </>
                )}
              </p>
              <div className="mt-4 space-y-2.5">
                {year2027.mutagen.map((m) => (
                  <div key={m.mutagen + m.star + m.palace} className="flex gap-2 text-[14px] leading-relaxed">
                    <span
                      className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[12.5px]"
                      style={
                        m.mutagen === '화기'
                          ? { background: 'rgba(217,138,122,0.14)', color: isCharacter ? '#d97d9a' : '#d98a7a' }
                          : { background: 'var(--accent-soft)', color: 'var(--accent-deep)' }
                      }
                    >
                      {m.star} {m.mutagen}
                    </span>
                    <span className="t-muted">{m.line}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
                <p className="text-[13px] font-semibold t-muted">재물</p>
                <p className="text-[14px] leading-[1.85] t-body">{teaser.money}</p>
                <p className="mt-2 text-[13px] font-semibold t-muted">연애</p>
                <p className="text-[14px] leading-[1.85] t-body">{teaser.love}</p>
                <p className="mt-2 text-[13px] font-semibold t-muted">{reportYear}년의 중심</p>
                <p className="text-[14px] leading-[1.85] t-body">{year2027.flow.free}</p>
              </div>
            </div>
          </div>
        </section>

        {tier === 'basic' && (
          <section className="mt-12">
            <div className="t-panel p-7 sm:p-9">
              <div className="t-starfield opacity-30" />
              <div className="relative">
                <p className="text-[12.5px] tracking-[0.24em] t-panel-accent">NEXT · 12궁 전체</p>
                <h3 className="t-panel-title mt-3 text-[23px] leading-snug">
                  {isCharacter ? '지금 읽은 건 12분의 1이야' : '지금 읽은 것은 12분의 1입니다'}
                </h3>
                <p className="mt-3 max-w-[540px] text-[14.5px] leading-[1.9] t-panel-body">
                  {isCharacter
                    ? '이 리포트에는 명궁(성격)과 재물·연애·직업의 핵심만 담았어. 전체 별 이야기에서는 나머지 11개 별방(부처·자녀·질액·천이·노복·관록·전택·복덕·부모·형제)의 풀이와 지금의 대한·2027년 별방 흐름, 열두 달 처방까지 이어져.'
                    : '이 리포트에는 명궁(성격)과 재물·연애·직업의 핵심만 담았습니다. 프리미엄에서는 나머지 11개 궁(부처·자녀·질액·천이·노복·관록·전택·복덕·부모·형제)의 풀이와 지금의 대한·2027년 유년 흐름, 12개월 액션 가이드까지 이어집니다.'}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button onClick={onUpgrade} className="t-btn t-btn-gold px-5 py-3 text-[14.5px]">
                    {isCharacter
                      ? `전체 별 이야기로 확장 · ${productPrice(findProduct('premium'), theme).toLocaleString('ko-KR')}원`
                      : `프리미엄 12궁으로 확장 · ${productPrice(findProduct('premium'), theme).toLocaleString('ko-KR')}원`}
                  </button>
                  <span className="text-[13px] t-panel-faint">{copy.report.upgradeNote}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. 12궁 */}
        <section className={`mt-14 ${tier === 'premium' ? '' : 'hidden'}`}>
          <SectionLabel index="04">{copy.report.sectionPalaces}</SectionLabel>
          <h2 className="t-display mt-3 text-[23px] sm:text-[27px]">{copy.report.palacesTitle}</h2>
          <p className="mt-2 max-w-[560px] text-[14px] leading-[1.9] t-muted">{copy.report.palacesDesc}</p>

          <div className="mt-5 grid gap-3.5 lg:grid-cols-2">
            {orderedPalaces.map((p, idx) => {
              const r = palaceReadings(p, tone);
              const score = palaceScore(p);
              return (
                <article key={p.index} className="t-card p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="num text-[12.5px]" style={{ color: 'var(--accent)' }}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="t-title text-[19px]">{p.name}</h3>
                        <span className="text-[12.5px] t-faint">{p.hanja}</span>
                      </div>
                      <p className="mt-1 text-[13px] t-faint">
                        {p.stem}
                        {p.branch} · {p.domain} · 대한 {p.decadalRange[0]}–{p.decadalRange[1]}세
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="num text-[17px] font-semibold t-title">{score}</p>
                      <p className="text-[12px] t-faint">지수</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {p.major.length ? (
                      p.major.map((s) => (
                        <span
                          key={s.cn}
                          className="rounded-full px-2 py-0.5 text-[13px] font-medium"
                          style={{ background: 'var(--accent-soft)', color: 'var(--text)' }}
                        >
                          {s.name}
                          {/* QA 2026-11-24: '천량묘화권' 처럼 붙어 읽히지 않도록 별·밝기·사화 사이를 띄웁니다 */}
                          {s.brightness ? <span className="ml-1 text-[12px] font-normal t-faint">{s.brightness}</span> : null}
                          {s.mutagen ? (
                            <span
                              className="ml-1 text-[12px]"
                              style={{ color: s.mutagen === '화기' ? (isCharacter ? '#d97d9a' : '#d98a7a') : 'var(--accent-deep)' }}
                            >
                              {s.mutagen}
                            </span>
                          ) : null}
                        </span>
                      ))
                    ) : (
                      <span className="text-[13px] t-faint">주성 없음</span>
                    )}
                    {p.minor.slice(0, 3).map((s) => (
                      <span key={s.cn} className="text-[12.5px] t-faint">
                        {s.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {r.paragraphs.map((para, i) => (
                      <p key={i} className="text-[14px] leading-[1.9] t-muted">
                        {para}
                      </p>
                    ))}
                  </div>

                  <p
                    className="mt-4 rounded-r-lg px-3 py-2 text-[13px] leading-relaxed t-muted"
                    style={{ background: 'var(--field-bg)', borderLeft: '2px solid var(--accent)' }}
                  >
                    <span className="font-semibold" style={{ color: 'var(--accent-deep)' }}>
                      할 일{' '}
                    </span>
                    {r.tip}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* 5. 월별 */}
        <section className={`mt-14 ${tier === 'premium' ? '' : 'hidden'}`}>
          <SectionLabel index="05">{copy.report.sectionMonthly}</SectionLabel>
          <h2 className="t-display mt-3 text-[23px] sm:text-[27px]">
            {reportYear}년, {copy.report.monthlyTitle}
          </h2>
          <p className="mt-2 text-[14px] t-muted">{copy.report.monthlyDesc}</p>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {year2027.months.map((m) => (
              <div key={m.month} className="t-card p-4">
                <div className="flex items-center justify-between">
                  <span className="num text-[14px] font-semibold t-title">{m.month}월</span>
                  <span className="rounded-full px-2 py-0.5 text-[12px]" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>
                    {m.title}
                  </span>
                </div>
                <p className="mt-2 text-[13.5px] leading-[1.75] t-muted">{m.body}</p>
                <p className="mt-2 text-[12.5px] t-faint">할 일 · {m.action}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. 핀셋 해설 */}
        <section id="pinpoint" className="mt-14 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionLabel index="AI">PINPOINT · 핀셋 해설</SectionLabel>
              <h2 className="t-display mt-3 text-[23px] sm:text-[27px]">진로 · 전공 · 배우자 · 재물</h2>
              <p className="mt-2 max-w-[560px] text-[14px] leading-[1.9] t-muted">
                {isCharacter
                  ? '“운이 좋다” 대신 실제 학과명과 직함, 배우자의 첫인상, 돈이 새는 장면을 짚었어. 이 리포트 안에서 바로 읽으면 돼.'
                  : '“운이 좋다” 대신 실제 학과명과 직함, 배우자의 첫인상, 돈이 새는 장면을 짚었습니다. 이 리포트 안에서 바로 읽을 수 있습니다.'}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
            <div className="t-card p-5">
              <p className="text-[12.5px] tracking-[0.18em]" style={{ color: 'var(--accent-deep)' }}>어울리는 전공 · 직업군</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {deep.majors.map((m) => (
                  <span key={m} className="t-chip !text-[13px]">{m}</span>
                ))}
              </div>
              <ul className="mt-3 space-y-1.5">
                {deep.careers.map((c, i) => (
                  <li key={c} className="flex items-baseline gap-2 text-[14.5px] t-body">
                    <span className="num text-[12.5px]" style={{ color: 'var(--accent)' }}>0{i + 1}</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="t-card p-5">
              <p className="text-[12.5px] tracking-[0.18em]" style={{ color: 'var(--accent-deep)' }}>끌리는 연애 타입 · 배우자상</p>
              <p className="mt-2.5 text-[14px] leading-[1.9] t-body">{deep.loveType}</p>
              <p className="mt-2 text-[14px] leading-[1.9] t-muted">{deep.spouse}</p>
            </div>

            <div className="t-card p-5">
              <p className="text-[12.5px] tracking-[0.18em]" style={{ color: isCharacter ? '#d97d9a' : '#d98a7a' }}>돈이 새는 구체적 장면</p>
              <p className="mt-2.5 text-[14px] leading-[1.9] t-body">{deep.moneyLeak}</p>
            </div>

            <div className="t-card p-5">
              <p className="text-[12.5px] tracking-[0.18em]" style={{ color: 'var(--accent-deep)' }}>돈이 들어오는 경로</p>
              <p className="mt-2.5 text-[14px] leading-[1.9] t-body">{deep.moneyFlow}</p>
              <p className="mt-3 pt-3 text-[13.5px] leading-[1.85] t-muted" style={{ borderTop: '1px solid var(--line)' }}>
                <b className="font-semibold" style={{ color: 'var(--accent-deep)' }}>결정의 순간 </b>
                {deep.decisive}
              </p>
            </div>
          </div>
        </section>

        {/* 7. AI */}
        <section className="mt-14">
          <div className="t-card p-6 sm:p-8">
            <p className="text-[12.5px] tracking-[0.22em]" style={{ color: 'var(--accent-deep)' }}>
              AI 심층 리포트
            </p>
            <h3 className="t-title mt-2 text-[21px]">
              {isCharacter ? '곧, 가디언과 이야기로' : '곧, 대화형 풀이로'}
            </h3>
            <p className="mt-3 max-w-[620px] text-[13.5px] leading-[1.9] t-muted">
              {isCharacter
                ? '현재 가디언 정밀 엔진으로 분석된 리포트예요. 실시간 AI 대화형 풀이는 곧 연결될 예정이에요.'
                : '현재 정밀 엔진으로 분석된 리포트입니다. 실시간 AI 대화형 풀이는 곧 연결될 예정입니다.'}
            </p>

            {aiReady && (
              <div className="mt-4">
                <button onClick={runAi} disabled={ai.loading} className="t-btn t-btn-primary px-4 py-2.5 text-[13.5px]">
                  {ai.loading ? '생성 중…' : 'AI로 다시 생성'}
                </button>
                {ai.error && (
                  <p className="mt-2 text-[13.5px]" style={{ color: isCharacter ? '#d97d9a' : '#d98a7a' }}>
                    잠시 후 다시 시도해 주세요.
                  </p>
                )}
                {ai.text && (
                  <div className="mt-5 rounded-2xl p-5" style={{ border: '1px solid var(--line)' }}>
                    <MarkdownLite text={ai.text} />
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <GuardianGoods chart={chart} />

        <MonthlyUpsell chart={chart} onBundle={onBundle} />

        {/* 마무리 */}
        <section className="mt-12">
          <div className="t-panel p-7 sm:p-9">
            <div className="t-starfield opacity-40" />
            <div className="relative">
              <p className="text-[12.5px] tracking-[0.24em] t-panel-accent">SUMMARY · {copy.report.summary}</p>
              <p className="t-panel-title mt-4 text-[20px] leading-[1.7] sm:text-[22px]">
                {isCharacter ? (
                  <>
                    {chart.primaryStar}별은 {profile.identity}이야.
                    <br />
                    {reportYear}년의 흐름은 믿되, 결정은 한 번 더 미루고 확인하는 편이 좋아.
                  </>
                ) : (
                  <>
                    {chart.primaryStar}성은 {profile.identity}입니다.
                    <br />
                    {reportYear}년의 흐름은 믿되, 결정은 한 번 더 미루고 확인하는 편이 좋습니다.
                  </>
                )}
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5 no-print">
                <button
                  onClick={() => window.print()}
                  className="t-btn !px-4 !py-2.5 text-[13.5px]"
                  style={{ background: 'var(--panel-text)', color: isCharacter ? '#4a3468' : '#14101f' }}
                >
                  PDF로 저장 / 인쇄
                </button>
                <button onClick={onCompat} className="t-btn t-btn-onpanel !px-4 !py-2.5 text-[13.5px]">
                  두 사람 궁합 보기 · {productPrice(findProduct('compat'), theme).toLocaleString('ko-KR')}원
                </button>
                <button onClick={onBack} className="t-btn !px-4 !py-2.5 text-[13.5px] t-panel-faint">
                  명반으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </section>

        <p className="mt-9 text-center text-[13px] leading-[1.9] t-faint">
          {isCharacter
            ? '이 리포트는 자미두수 전통 해석을 지금의 언어로 다시 쓴 콘텐츠야. 의료·법률·투자 판단의 근거로는 쓸 수 없어. '
            : '본 리포트는 자미두수 전통 해석을 현대적 언어로 재구성한 콘텐츠입니다. 의료·법률·투자 판단의 근거로 사용할 수 없습니다. '}
          © {new Date().getFullYear()} {isCharacter ? '별의 속삭임' : '자미원'}
        </p>
      </div>
    </div>
  );
}
