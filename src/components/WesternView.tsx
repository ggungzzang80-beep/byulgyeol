import type { WesternModel } from '../lib/western';
import {
  ELEMENT_MEANING,
  PLANET_INFO,
  SIGNS,
  aspectText,
  houseReading,
  westernIdentityLines,
} from '../lib/western';
import { WESTERN_PRODUCTS, productBadge, productCta, productPoints, productPrice, productShortCta, productTagline, productUnlockCta, won, type ProductId } from '../lib/products';
import { useTheme } from '../lib/theme';
import NatalWheel from './NatalWheel';
import SystemTabs from './SystemTabs';
import FreeOpenMeter from './FreeOpenMeter';
import PriceTag from './PriceTag';
import type { SystemId } from '../lib/systems';
import { LockIcon, SectionLabel, StarMark } from './ui';

type Props = {
  model: WesternModel;
  onSystemChange: (system: SystemId) => void;
  onReset: () => void;
  onUnlock: (id: ProductId) => void;
  /** 두 사람 시너스트리 무료 점수 프리뷰 */
  onSynastry: () => void;
};

/** 서양 점성술 무료 결과 — 자미두수 결과 화면과 완전히 분리된 동선입니다. */
export default function WesternView({ model, onSystemChange, onReset, onUnlock, onSynastry }: Props) {
  const { theme } = useTheme();
  const isCharacter = theme === 'character';
  const sunSign = SIGNS[model.sun.signIndex];
  const moonSign = SIGNS[model.moon.signIndex];
  const identity = westernIdentityLines(model);
  const topAspects = model.aspects.slice(0, 5);

  return (
    <div className="min-h-screen pb-28">
      {/* 상단 바 */}
      <div
        className="sticky top-0 z-30 no-print"
        style={{
          borderBottom: '1px solid var(--line)',
          background: theme === 'character' ? 'rgba(255,255,255,0.92)' : 'rgba(9,8,18,0.92)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        <div className="mx-auto flex h-[62px] max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* 로고·타이틀 = 첫 홈으로 */}
            <button
              type="button"
              onClick={onReset}
              title="첫 화면으로"
              aria-label="첫 화면으로 돌아가기"
              className="group flex min-w-0 cursor-pointer items-center gap-2 rounded-full py-1 pr-1.5 transition hover:opacity-90 active:scale-[0.985]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 shrink-0 t-faint transition group-hover:-translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M14.5 6L8.5 12l6 6" />
              </svg>
              <StarMark className="h-3.5 w-3.5 shrink-0" />
              <span className="t-title shrink-0 text-[17px] tracking-[0.1em] underline decoration-1 underline-offset-4 decoration-transparent transition group-hover:decoration-current">
                서양 점성술
              </span>
            </button>
            <span className="hidden h-3 w-px sm:block" style={{ background: 'var(--line-strong)' }} />
            <span className="hidden truncate text-[13.5px] t-muted sm:inline">
              {model.name ? `${model.name} 님의 ` : ''}출생 천궁도 · {model.solarText}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={onReset} className="t-btn t-btn-ghost !px-3.5 !py-2 text-[13.5px]">
              다시 입력
            </button>
            <button onClick={() => onUnlock('western')} className="t-btn t-btn-primary !px-3.5 !py-2 text-[13.5px]">
              천궁도 리포트
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8 sm:pt-8">
        {/* 지금 보고 있는 체계 */}
        <SystemTabs
          system="western"
          onChange={onSystemChange}
          note="지금 보고 있는 체계: 서양 점성술 · 출생 천궁도 — 탭을 누르면 동양 자미두수로 바뀝니다."
        />

        {/* 태양 · 달 · 어센던트 */}
        <section className="mt-6 animate-rise">
          <SectionLabel index="01">출생 천궁도 · NATAL</SectionLabel>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="t-panel p-6 sm:p-8">
              <div className="t-starfield opacity-40" />
              <div className="relative">
                <p className="text-[13px] tracking-[0.2em] t-panel-accent">서양 점성술 · 출생 천궁도</p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: '태양 자리', sign: sunSign, glyph: '☉' },
                    { label: '달 자리', sign: moonSign, glyph: '☾' },
                    { label: '어센던트', sign: model.rising, glyph: 'ASC' },
                  ].map((c) => (
                    <div key={c.label} className="rounded-2xl px-2 py-3 text-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--panel-rule)' }}>
                      <p className="text-[12px] tracking-[0.12em] t-panel-faint">{c.glyph}</p>
                      <p className="t-panel-title mt-1 text-[17px] leading-tight">{c.sign.name}</p>
                      <p className="mt-1 text-[12.5px] t-panel-faint">{c.label}</p>
                    </div>
                  ))}
                </div>

                <h2 className="t-panel-title mt-5 text-[26px] leading-snug sm:text-[30px]">
                  태양 {sunSign.name}
                  <span className="ml-1.5 text-[22px] font-light opacity-70">{sunSign.glyph}</span>
                </h2>
                <p className="mt-1 text-[13.5px] t-panel-accent">
                  {sunSign.keyword} · {sunSign.element}의 기운 · 수호 행성 {sunSign.ruler}
                </p>

                <div className="mt-4 space-y-2">
                  {identity.map((line) => (
                    <p key={line} className="text-[14.5px] leading-[1.9] t-panel-body">
                      {line}
                    </p>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl px-3 py-4" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--panel-rule)' }}>
                  {[
                    { label: '연애의 별', value: model.indices.love },
                    { label: '금전의 별', value: model.indices.money },
                    { label: '일의 별', value: model.indices.work },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="num text-[26px] font-bold leading-none" style={{ color: 'var(--panel-accent)' }}>
                        {s.value}
                      </p>
                      <p className="mt-1.5 text-[13.5px] t-panel-body">{s.label}</p>
                      <div className="mx-auto mt-2 h-[4px] w-[70%] overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }}>
                        <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: 'var(--panel-accent)' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="num mt-3 text-[12.5px] t-panel-faint">
                  {model.solarText} {model.timeText} · 출생지 {model.birthPlace}
                </p>
                {(!model.timeKnown || model.note) && (
                  <p className="mt-1 text-[12.5px] leading-relaxed t-panel-faint">
                    {!model.timeKnown && '태어난 시간을 몰라 어센던트·하우스를 정오 기준으로 계산했습니다. '}
                    {model.note}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="t-card p-5">
                <p className="text-[12.5px] tracking-[0.18em] t-faint">CHART WHEEL · 천궁도</p>
                <div className="mt-3 flex justify-center">
                  <NatalWheel model={model} size={268} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {model.planets.map((p) => (
                    <div key={p.key} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1" style={{ background: 'var(--field-bg)' }}>
                      <span className="text-[13px] t-muted">
                        <span style={{ color: 'var(--accent)' }}>{p.glyph}</span> {p.name}
                      </span>
                      <span className="num text-[13px] t-body">
                        {p.signName} · {p.house}H
                        {p.retrograde ? ' R' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="t-card p-5">
                <p className="text-[12.5px] tracking-[0.18em] t-faint">ELEMENT · 원소 균형</p>
                <div className="mt-3 space-y-2">
                  {model.elements.map((e) => (
                    <div key={e.element}>
                      <div className="flex justify-between text-[13px] t-muted">
                        <span>{ELEMENT_MEANING[e.element]}</span>
                        <span className="num">{e.count}</span>
                      </div>
                      <div className="mt-1 h-[4px] overflow-hidden rounded-full" style={{ background: 'var(--field-bg)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, e.count * 12)}%`, background: 'var(--accent)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[13px] leading-relaxed t-faint">
                  가장 강한 기운은 <b style={{ color: 'var(--accent-deep)' }}>{model.dominantElement}</b>.{' '}
                  {model.dominantElement === '불' && '추진력은 좋지만 마무리를 옆 사람에게 맡기면 오래갑니다.'}
                  {model.dominantElement === '흙' && '현실 감각이 강합니다. 대신 새로운 시도에 한 박자 늦습니다.'}
                  {model.dominantElement === '공기' && '말과 정보로 길을 엽니다. 감정의 말을 따로 연습해 보세요.'}
                  {model.dominantElement === '물' && '공기를 잘 읽습니다. 대신 경계를 정해두지 않으면 지칩니다.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 세 좌표 해설 */}
        <section className="mt-12">
          <SectionLabel index="02">SUN · MOON · RISING</SectionLabel>
          <h2 className="t-display mt-3 text-[23px] sm:text-[26px]">세 개의 좌표가 말하는 것</h2>
          <div className="mt-4 grid gap-3.5 lg:grid-cols-3">
            {[
              { glyph: '☉', title: `태양 ${sunSign.name}`, means: '나의 중심과 의지', text: sunSign.identity, extra: sunSign.shadow, extraLabel: '그림자' },
              { glyph: '☾', title: `달 ${moonSign.name}`, means: '감정과 안전 욕구', text: moonSign.identity, extra: moonSign.love, extraLabel: '위로받는 방식' },
              { glyph: 'ASC', title: `어센던트 ${model.rising.name}`, means: '첫인상과 시작 방식', text: model.rising.identity, extra: model.rising.work, extraLabel: '일할 때의 인상' },
            ].map((c) => (
              <div key={c.title} className="t-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[20px]" style={{ color: 'var(--accent)' }} aria-hidden="true">
                    {c.glyph}
                  </span>
                  <span className="text-[12px] tracking-[0.16em] t-faint">{c.means}</span>
                </div>
                <p className="t-title mt-3 text-[18px]">{c.title}</p>
                <p className="mt-2 text-[14px] leading-[1.85] t-muted">{c.text}</p>
                <p className="mt-3 border-t pt-3 text-[13px] leading-[1.8] t-faint" style={{ borderColor: 'var(--line)' }}>
                  <b style={{ color: 'var(--accent-deep)' }}>{c.extraLabel} </b>
                  {c.extra}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 행성 배치 */}
        <section className="mt-12">
          <SectionLabel index="03">PLANETS</SectionLabel>
          <h2 className="t-display mt-3 text-[23px] sm:text-[26px]">행성 7개가 앉은 자리</h2>
          <p className="mt-2 text-[13.5px] t-muted">행성 = 무엇이, 자리 = 어떻게, 하우스 = 어느 영역에서.</p>
          <div className="mt-4 overflow-hidden rounded-2xl" style={{ border: '1px solid var(--line)' }}>
            {model.planets.map((p, i) => (
              <div
                key={p.key}
                className="grid grid-cols-[1.05fr_1fr_0.8fr] items-center gap-2 px-3 py-2.5"
                style={{ background: i % 2 ? 'var(--card-2)' : 'transparent', borderTop: i ? '1px solid var(--line)' : undefined }}
              >
                <div>
                  <p className="text-[14px] font-semibold t-body">
                    <span style={{ color: 'var(--accent)' }}>{p.glyph}</span> {p.name}
                    {p.retrograde && <span className="ml-1 text-[12px] t-faint">역행</span>}
                  </p>
                  <p className="mt-0.5 text-[12.5px] t-faint">{PLANET_INFO[p.key].means}</p>
                </div>
                <p className="text-[13.5px] t-body">
                  {p.signName} <span className="num text-[12.5px] t-faint">{p.degreeInSign}°</span>
                </p>
                <p className="num text-right text-[13px] t-muted">{p.house}하우스</p>
              </div>
            ))}
          </div>
        </section>

        {/* 12하우스 요약 */}
        <section className="mt-12">
          <SectionLabel index="04">TWELVE HOUSES</SectionLabel>
          <h2 className="t-display mt-3 text-[23px] sm:text-[26px]">하늘을 나눈 열두 칸</h2>
          <p className="mt-2 max-w-[420px] text-[13.5px] leading-[1.85] t-muted">
            어센던트 자리부터 한 칸씩 — 하우스는 삶의 영역입니다. 행성이 앉은 칸이 유난히 자주 다뤄지는 자리예요.
            하우스는 어센던트 자리부터 사인 하나씩 나누는 Whole Sign 방식으로 계산했습니다.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {model.houses.map((h) => (
              <div
                key={h.index}
                className="rounded-2xl p-3.5"
                style={{
                  background: h.planets.length ? 'var(--accent-soft)' : 'var(--card-2)',
                  border: h.planets.length ? '1px solid var(--line-strong)' : '1px solid var(--line)',
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13.5px] font-semibold t-body">
                    {h.index} · {h.desc}
                  </p>
                  <span className="num text-[12.5px] t-faint">{h.signName}</span>
                </div>
                <p className="mt-1 text-[12.5px] t-faint">
                  {h.planets.length ? h.planets.join(' · ') : '비어 있는 칸'}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 주요 각 */}
        {topAspects.length > 0 && (
          <section className="mt-12">
            <SectionLabel index="05">ASPECTS</SectionLabel>
            <h2 className="t-display mt-3 text-[23px] sm:text-[26px]">행성 사이의 각</h2>
            <div className="mt-4 space-y-2">
              {topAspects.map((a) => (
                <p
                  key={`${a.a}-${a.b}-${a.type}`}
                  className="rounded-xl px-3.5 py-2.5 text-[13.5px] leading-[1.8] t-muted"
                  style={{ background: 'var(--card-2)', border: '1px solid var(--line)' }}
                >
                  {aspectText(a)}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* 시너스트리 궁합 — 두 사람 천궁도 교차 */}
        <section className="mt-12">
          <SectionLabel index="06">SYNASTRY · 두 사람 궁합</SectionLabel>
          <h2 className="t-display mt-3 text-[23px] leading-[1.45] sm:text-[26px]">
            내 하늘과 다른 하늘이
            <br className="sm:hidden" /> 만나는 자리
          </h2>
          <p className="mt-2 max-w-[440px] text-[13.5px] leading-[1.85] t-muted">
            서양 점성술의 궁합은 두 사람의 행성을 서로 맞대어 봅니다. 태양·달·금성·화성·수성과 어센던트가
            어떤 각(합·육분·사분·삼분·대립)으로 만나는지로 사이의 온도를 읽습니다.
          </p>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="t-card p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12.5px] tracking-[0.16em] t-faint">MY SKY</p>
                <span className="t-chip !text-[12.5px]">
                  ☉ {sunSign.name} · ☾ {moonSign.name}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[18px]" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }} aria-hidden="true">
                  ✶
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold t-body">상대방 생년월일만 있으면 바로 점수가 나옵니다</p>
                  <p className="mt-0.5 text-[13px] leading-[1.7] t-faint">
                    무료로 시너스트리 지수와 핵심 각 2개까지 볼 수 있어요.
                  </p>
                </div>
              </div>
              <button onClick={onSynastry} className="t-btn t-btn-primary mt-4 w-full py-3 text-[14px]">
                <StarMark className="h-3.5 w-3.5" />
                {isCharacter ? '두 사람 궁합 점수 보기' : '무료 시너스트리 점수 보기'}
              </button>
              <p className="mt-2 text-center text-[12.5px] t-faint">점수 무료 · 교차 각 전체와 해석은 심층 리포트</p>
            </div>
            <div className="t-card p-5">
              <p className="text-[12.5px] tracking-[0.16em] t-faint">어떻게 계산하나</p>
              <ul className="mt-2.5 space-y-1.5 text-[13px] leading-[1.75] t-muted">
                <li>· 행성 교차 각(합 0° · 육분 60° · 사분 90° · 삼분 120° · 대립 180°)</li>
                <li>· 원소(불·흙·공기·물) 조화</li>
                <li>· 감정·끌림·오래 가는 힘 세 축으로 점수화</li>
              </ul>
              <p className="mt-3 border-t pt-2.5 text-[13px] leading-[1.75] t-faint" style={{ borderColor: 'var(--line)' }}>
                자미두수 궁합(명궁 주성 비교)과는 계산이 완전히 다릅니다.
              </p>
            </div>
          </div>
        </section>

        {/* 잠금 영역 */}
        <section className="mt-12">
          <div className="t-panel p-6 sm:p-8">
            <div className="t-starfield opacity-40" />
            <div className="relative">
              <p className="text-[12.5px] tracking-[0.22em] t-panel-accent">LOCKED · 서양 점성술 리포트</p>
              <h2 className="t-panel-title mt-3 text-[23px] leading-[1.45] sm:text-[25px]">
                하우스별 풀이와 각 해석까지
                <br />
                이어서 읽기
              </h2>
              <p className="mt-3 max-w-[520px] text-[13.5px] leading-[1.85] t-panel-body">
                무료 화면에서는 태양·달·어센던트와 행성의 자리까지만 열립니다. 12개 하우스 풀이, 행성 사이의 각
                전체, 금전·연애·일 지수의 근거는 서양 점성술 리포트에서 이어집니다.
              </p>

              <div className="mt-4">
                <FreeOpenMeter
                  freePercent={30}
                  openItems={['태양 · 달 · 어센던트', '행성 7개의 별자리', '금전·연애·일 지수', '주요 각 하이라이트']}
                  lockedItems={['12하우스별 삶의 영역 풀이', '행성 교차 각 전체 해석', '지수를 만든 근거', '올해 흐름과 월별 가이드']}
                  volume="한 번 결제로 12하우스 전체 · 각 해석까지 열립니다"
                  product={WESTERN_PRODUCTS[0]}
                />
              </div>

              <div className="mt-4 grid gap-2">
                {model.houses.slice(0, 2).map((h) => (
                  <p key={h.index} className="select-none rounded-xl px-3 py-2 text-[13.5px] leading-[1.8] blur-[4px]" style={{ border: '1px solid var(--panel-rule)', color: 'var(--panel-body)' }} aria-hidden="true">
                    {houseReading(model, h)}
                  </p>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button onClick={() => onUnlock('western')} className="t-btn t-btn-gold px-5 py-3 text-[14.5px]">
                  <LockIcon className="h-3.5 w-3.5" />
                  {productUnlockCta(WESTERN_PRODUCTS[0], theme)}
                </button>
                <button onClick={() => onUnlock('bundle')} className="t-btn t-btn-onpanel px-4 py-3 text-[13.5px]">
                  동양 + 서양 통합으로 보기 · {won(productPrice(WESTERN_PRODUCTS.find((p) => p.id === 'bundle')!, theme))}원
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 서양 상품 */}
        <section className="mt-12">
          <SectionLabel index="✶">WESTERN REPORTS</SectionLabel>
          <h2 className="t-display mt-3 text-[23px]">서양 점성술 리포트</h2>
          <p className="mt-2 text-[13.5px] t-muted">
            아래 세 상품은 서양 점성술 동선입니다. 자미두수 리포트는 위쪽 ‘동양 자미두수’ 탭에서 결제할 수 있어요.
          </p>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {WESTERN_PRODUCTS.map((p) => (
              <div key={p.id} className="t-card flex flex-col p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="t-title text-[17px]">{p.name}</h3>
                  {productBadge(p, theme) && <span className="t-chip !text-[12.5px]">{productBadge(p, theme)}</span>}
                </div>
                <p className="mt-1 text-[13px] t-muted">{productTagline(p, theme)}</p>
                <ul className="mt-3 flex-1 space-y-1.5 text-[13.5px] leading-relaxed t-muted">
                  {productPoints(p, theme).slice(0, 3).map((pt) => (
                    <li key={pt} className="flex gap-1.5">
                      <span style={{ color: 'var(--accent)' }}>·</span>
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-end justify-between gap-2">
                  <PriceTag product={p} variant="compact" />
                  <button onClick={() => onUnlock(p.id)} className="t-btn t-btn-soft !px-3.5 !py-2 text-[13.5px]">
                    {productShortCta(p, theme)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-9 text-center text-[13px] leading-[1.9] t-faint">
          {isCharacter ? '서양 점성술' : '西洋占星術'}은 오락과 자기 이해를 위한 콘텐츠입니다. 의료·법률·투자 판단의 근거가 아닙니다.
          출생지는 서울 기준으로 계산했습니다.
        </p>
      </div>
    </div>
  );
}
