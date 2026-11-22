import type { WesternModel } from '../lib/western';
import {
  ELEMENT_MEANING,
  PLANET_INFO,
  SIGNS,
  aspectText,
  houseReading,
  indexHints,
  westernIdentityLines,
} from '../lib/western';
import { productPrice, findProduct } from '../lib/products';
import { useTheme } from '../lib/theme';
import NatalWheel from './NatalWheel';
import { ScoreBar, SectionLabel, StarMark } from './ui';

type Props = {
  model: WesternModel;
  onBack: () => void;
  onOpenZiwei: () => void;
  onBundle: () => void;
  hasBundle: boolean;
};

/** 서양 점성술 유료 리포트 — 자미두수 리포트와 다른 화면·다른 상품입니다. */
export default function WesternReport({ model, onBack, onOpenZiwei, onBundle, hasBundle }: Props) {
  const { theme } = useTheme();
  const isCharacter = theme === 'character';
  const sunSign = SIGNS[model.sun.signIndex];
  const moonSign = SIGNS[model.moon.signIndex];
  const hints = indexHints(model);
  const identity = westernIdentityLines(model);

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
            천궁도로
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onOpenZiwei} className="t-btn t-btn-ghost !px-3 !py-2 text-[13px]">
              동양 자미두수
            </button>
            <button onClick={() => window.print()} className="t-btn t-btn-primary !px-3.5 !py-2 text-[13.5px]">
              PDF 저장
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
              <StarMark className="h-3 w-3" />
              잠금 해제됨
            </span>
            <span className="t-chip !text-[12.5px]">서양 점성술 · 출생 천궁도</span>
            <span className="t-chip !text-[12.5px]">행성 7개 · 12하우스</span>
          </div>

          <h1 className="t-display mt-4 text-[27px] leading-[1.3] sm:text-[33px]">
            {model.name ? `${model.name} 님의 ` : '나의 '}출생 천궁도
          </h1>
          <p className="mt-2 text-[14px] t-muted">
            태양 {sunSign.name} · 달 {moonSign.name} · 어센던트 {model.rising.name} — {sunSign.keyword}
          </p>

          <div className="t-card mt-5 grid grid-cols-2 gap-px overflow-hidden !rounded-2xl sm:grid-cols-4" style={{ background: 'var(--line)' }}>
            {[
              ['생년월일', model.solarText],
              ['태어난 시각', model.timeText],
              ['출생지', model.birthPlace],
              ['가장 강한 원소', model.dominantElement],
            ].map(([k, v]) => (
              <div key={k} className="px-4 py-3" style={{ background: 'var(--card-2)' }}>
                <p className="text-[12px] tracking-[0.16em] t-faint">{k}</p>
                <p className="num mt-1 text-[13.5px] t-body">{v}</p>
              </div>
            ))}
          </div>
          {!model.timeKnown && (
            <p className="mt-2 text-[13px] t-faint">
              * 태어난 시간을 몰라 어센던트·하우스를 정오 기준으로 계산했습니다. 시간을 알면 더 정확해집니다.
            </p>
          )}
          {model.note && <p className="mt-1 text-[13px] t-faint">* {model.note}</p>}
          {hasBundle && (
            <div
              className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3"
              style={{ background: 'var(--accent-soft)', border: '1px solid var(--line-strong)' }}
            >
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--accent-deep)' }}>
                통합 리포트로 열었어요 — 동양 자미두수 12궁 전체 해설도 함께 열려 있습니다.
              </p>
              <button onClick={onOpenZiwei} className="t-btn t-btn-soft !px-3 !py-1.5 text-[13px]">
                자미두수 12궁 보기
              </button>
            </div>
          )}
        </header>

        {/* 1. 세 좌표 */}
        <section className="mt-12">
          <SectionLabel index="01">SUN · MOON · RISING</SectionLabel>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="t-card p-6 sm:p-7">
              <h2 className="t-title text-[23px]">
                태양 {sunSign.name}
                <span className="ml-2 text-[14px] font-normal" style={{ color: 'var(--accent-deep)' }}>
                  {sunSign.glyph} · {sunSign.element} · {sunSign.ruler}
                </span>
              </h2>
              {identity.map((line) => (
                <p key={line} className="mt-3 text-[15px] leading-[1.9] t-body">
                  {line}
                </p>
              ))}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl p-4" style={{ background: 'var(--field-bg)' }}>
                  <p className="text-[12.5px] tracking-[0.16em]" style={{ color: 'var(--accent-deep)' }}>
                    사랑할 때
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.8] t-muted">{sunSign.love}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: 'var(--field-bg)' }}>
                  <p className="text-[12.5px] tracking-[0.16em]" style={{ color: isCharacter ? '#d97d9a' : '#d98a7a' }}>
                    조심할 결
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.8] t-muted">{sunSign.shadow}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl p-4" style={{ border: '1px solid var(--line)' }}>
                  <p className="text-[12.5px] tracking-[0.16em] t-faint">돈</p>
                  <p className="mt-1.5 text-[14px] leading-[1.8] t-muted">{sunSign.money}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ border: '1px solid var(--line)' }}>
                  <p className="text-[12.5px] tracking-[0.16em] t-faint">일</p>
                  <p className="mt-1.5 text-[14px] leading-[1.8] t-muted">{sunSign.work}</p>
                </div>
              </div>
            </div>

            <div className="t-card p-6">
              <p className="text-[12.5px] tracking-[0.18em] t-faint">달 · 어센던트</p>
              <p className="t-title mt-2 text-[18px]">
                달 {moonSign.name} · 어센던트 {model.rising.name}
              </p>
              <p className="mt-2 text-[14px] leading-[1.85] t-muted">{moonSign.identity}</p>
              <p className="mt-2 text-[14px] leading-[1.85] t-muted">{model.rising.identity}</p>
              <div className="mt-4 flex justify-center">
                <NatalWheel model={model} size={220} />
              </div>
            </div>
          </div>
        </section>

        {/* 2. 지수 */}
        <section className="mt-12">
          <SectionLabel index="02">INDEX</SectionLabel>
          <div className="t-card mt-4 p-6 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-3">
              <ScoreBar label="연애의 별" score={model.indices.love} hint={hints.love} delay={0} />
              <ScoreBar label="금전의 별" score={model.indices.money} hint={hints.money} delay={120} />
              <ScoreBar label="일의 별" score={model.indices.work} hint={hints.work} delay={240} />
            </div>
            <p className="mt-5 pt-4 text-[13px] leading-[1.8] t-faint" style={{ borderTop: '1px solid var(--line)' }}>
              서양 점성술 동선의 지수입니다. 금성·달·목성·화성·토성이 놓인 하우스로 계산했고, 자미두수 리포트의
              3지수(연애의 별·금전의 별·일의 별)와는 계산 근거가 다릅니다.
            </p>
          </div>
        </section>

        {/* 3. 12하우스 */}
        <section className="mt-12">
          <SectionLabel index="03">TWELVE HOUSES</SectionLabel>
          <h2 className="t-display mt-3 text-[23px] sm:text-[27px]">열두 개의 하우스</h2>
          <p className="mt-2 max-w-[560px] text-[14px] leading-[1.9] t-muted">
            어센던트({model.rising.name}) 자리부터 한 칸씩, 삶의 열두 영역입니다. 행성이 앉은 칸부터 읽으면
            빨라집니다. 하우스는 어센던트 자리부터 사인 하나씩 나누는 Whole Sign 방식입니다.
          </p>
          <div className="mt-5 grid gap-3.5 lg:grid-cols-2">
            {[...model.houses]
              .sort((a, b) => b.planets.length - a.planets.length || a.index - b.index)
              .map((h) => (
                <article key={h.index} className="t-card p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="t-title text-[18px]">
                        {h.index}하우스
                        <span className="ml-2 text-[13px] font-normal t-faint">{h.desc}</span>
                      </h3>
                      <p className="mt-1 text-[12.5px] t-faint">{h.signName} · {SIGNS[h.signIndex].keyword}</p>
                    </div>
                    <span className="num shrink-0 rounded-full px-2 py-0.5 text-[12.5px]" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>
                      {h.planets.length ? `${h.planets.length}개 행성` : '빈 칸'}
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] leading-[1.9] t-body">{houseReading(model, h)}</p>
                  {h.planets.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {h.planets.map((name) => {
                        const p = model.planets.find((x) => x.name === name);
                        return (
                          <span key={name} className="t-chip !text-[12.5px]">
                            {p?.glyph} {name}
                            {p?.retrograde ? ' R' : ''}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </article>
              ))}
          </div>
        </section>

        {/* 4. 행성과 각 */}
        <section className="mt-12">
          <SectionLabel index="04">PLANETS & ASPECTS</SectionLabel>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="t-card overflow-hidden">
              <p className="px-5 pt-5 text-[12.5px] tracking-[0.18em] t-faint">행성 배치</p>
              <div className="mt-2">
                {model.planets.map((p, i) => (
                  <div
                    key={p.key}
                    className="grid grid-cols-[1.1fr_1fr_0.7fr] items-center gap-2 px-5 py-2.5"
                    style={{ borderTop: i ? '1px solid var(--line)' : undefined }}
                  >
                    <p className="text-[13.5px] t-body">
                      <span style={{ color: 'var(--accent)' }}>{p.glyph}</span> {p.name}
                      {p.retrograde && <span className="ml-1 text-[12px] t-faint">역행</span>}
                    </p>
                    <p className="text-[13px] t-muted">{p.signName} {p.degreeInSign}°</p>
                    <p className="num text-right text-[13px] t-faint">{p.house}H</p>
                  </div>
                ))}
              </div>
              <p className="px-5 pb-4 pt-3 text-[12.5px] leading-relaxed t-faint">
                {PLANET_INFO.sun.means} · {PLANET_INFO.moon.means} · {PLANET_INFO.venus.means}
              </p>
            </div>

            <div className="t-card p-5">
              <p className="text-[12.5px] tracking-[0.18em] t-faint">주요 각 (오브 6° 이내)</p>
              <div className="mt-3 space-y-2">
                {model.aspects.length ? (
                  model.aspects.map((a) => (
                    <p key={`${a.a}-${a.b}-${a.type}`} className="text-[13.5px] leading-[1.8] t-muted">
                      {aspectText(a)}
                    </p>
                  ))
                ) : (
                  <p className="text-[13.5px] t-muted">큰 각이 많지 않은 하늘입니다. 행성들이 각자 자리에서 독립적으로 움직입니다.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 5. 원소 */}
        <section className="mt-12">
          <SectionLabel index="05">ELEMENT</SectionLabel>
          <div className="t-card mt-4 p-6">
            <div className="grid gap-4 sm:grid-cols-4">
              {model.elements.map((e) => (
                <div key={e.element}>
                  <p className="text-[13.5px] font-semibold t-body">{ELEMENT_MEANING[e.element]}</p>
                  <div className="mt-2 h-[6px] overflow-hidden rounded-full" style={{ background: 'var(--field-bg)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, e.count * 12)}%`, background: 'var(--accent)' }} />
                  </div>
                  <p className="num mt-1 text-[12.5px] t-faint">{e.count}점</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13.5px] leading-[1.85] t-muted">
              태양·달·어센던트와 행성 7개의 자리를 합산한 원소 분포입니다. 가장 강한 기운은{' '}
              <b style={{ color: 'var(--accent-deep)' }}>{model.dominantElement}</b>이고, 비어 있는 기운은 일부러
              채우는 연습을 하면 균형이 잡힙니다.
            </p>
          </div>
        </section>

        {/* 통합 유도 */}
        {!hasBundle && (
          <section className="mt-12">
            <div className="t-panel p-7 sm:p-9">
              <div className="t-starfield opacity-40" />
              <div className="relative">
                <p className="text-[12.5px] tracking-[0.24em] t-panel-accent">EAST × WEST · 통합</p>
                <h3 className="t-panel-title mt-3 text-[22px] leading-snug">
                  같은 사람을 두 체계로 읽으면
                  <br />
                  겹치는 지점이 보입니다
                </h3>
                <p className="mt-3 max-w-[540px] text-[14px] leading-[1.9] t-panel-body">
                  자미두수 12궁과 서양 천궁도가 같은 말을 할 때가 가장 정확한 순간입니다. 통합 리포트는 두 해설을
                  나란히 놓고 교차해서 읽습니다. 이미 결제한 금액은 그대로 사용됩니다.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button onClick={onBundle} className="t-btn t-btn-gold px-5 py-3 text-[14.5px]">
                    통합 리포트로 확장 · {productPrice(findProduct('bundle'), theme).toLocaleString('ko-KR')}원
                  </button>
                  <span className="text-[13px] t-panel-faint">동양 12궁 + 서양 천궁도</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <p className="mt-9 text-center text-[13px] leading-[1.9] t-faint">
          본 리포트는 서양 점성술 전통 해석을 현대적 언어로 재구성한 콘텐츠입니다. 의료·법률·투자 판단의 근거로
          사용할 수 없습니다. © 2026 자미원 · 별의 속삭임
        </p>
      </div>
    </div>
  );
}
