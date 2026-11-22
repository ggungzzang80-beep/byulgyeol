import type { BirthInput } from '../lib/chart';
import { WESTERN_PRODUCTS, ZIWEI_PRODUCTS, productScopeShort, type ProductId } from '../lib/products';
import type { SystemId } from '../lib/systems';
import { THEME_ART, useTheme } from '../lib/theme';
import { ZIWEI_ONLY } from '../config/env';
import type { MutableRefObject } from 'react';
import BirthForm, { type BirthDraft } from './BirthForm';
import SystemTabs from './SystemTabs';
import WesternLanding from './WesternLanding';
import NewYearBanner from './NewYearBanner';
import PriceTag from './PriceTag';
import { SectionLabel, StarMark } from './ui';

type Props = {
  onSubmit: (input: BirthInput) => void;
  onSample: () => void;
  draftRef?: MutableRefObject<BirthDraft | null>;
  onProduct: (id: ProductId) => void;
  /** 랜딩의 2027 신년 부적 배너 */
  onNewYear: () => void;
  system: SystemId;
  onSystemChange: (system: SystemId) => void;
};

function MysticHeader({ onHome, system }: { onHome?: () => void; system: SystemId }) {
  const { copy } = useTheme();
  const western = system === 'western';
  return (
    <header
      className="sticky top-0 z-30 no-print"
      style={{
        borderBottom: '1px solid var(--line)',
        background: 'rgba(9,8,18,0.9)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <div className="mx-auto flex h-[66px] max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <button onClick={onHome} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ border: '1px solid var(--line-strong)' }}>
            <StarMark className="h-4 w-4" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="t-title text-[20px] tracking-[0.16em]">{copy.brand.name}</span>
            <span className="mt-1 text-[12px] tracking-[0.3em] t-faint">{copy.brand.hanja}</span>
          </span>
        </button>

        <nav className="hidden items-center gap-8 text-[14.5px] t-muted md:flex">
          {western ? (
            <>
              <a href="#western-chart" className="transition hover:text-[#e3c07b]">
                천궁도
              </a>
              <a href="#western-reports" className="transition hover:text-[#e3c07b]">
                서양 리포트
              </a>
            </>
          ) : (
            <>
              <a href="#chart" className="transition hover:text-[#e3c07b]">
                {copy.nav.chart}
              </a>
              <a href="#reports" className="transition hover:text-[#e3c07b]">
                {copy.nav.reports}
              </a>
              <a href="#faq" className="transition hover:text-[#e3c07b]">
                {copy.nav.guide}
              </a>
            </>
          )}
        </nav>

        <a href={western ? '#western-chart' : '#chart'} className="t-btn t-btn-ghost px-4 py-2.5 text-[14px] sm:px-5">
          {western ? '내 천궁도 보기' : copy.headerCta}
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="t-starfield opacity-70" />
      <div className="pointer-events-none absolute -left-40 top-10 h-[520px] w-[520px] rounded-full t-glow-purple opacity-60" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[460px] w-[460px] rounded-full t-glow-gold opacity-40" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-10 pt-12 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:pb-16 lg:pt-16">
        <div className="animate-rise">
          <div className="flex items-center gap-3">
            <StarMark className="h-3.5 w-3.5" />
            <span className="eyebrow">紫微斗數 · 東洋占星術</span>
          </div>

          <p className="t-display mt-6 text-[17px] tracking-[0.02em] sm:text-[18px]" style={{ color: 'var(--accent)' }}>
            천문이 읽고, 별이 말하다
          </p>
          <h1 className="t-display mt-3 text-[34px] leading-[1.28] sm:text-[44px] lg:text-[52px]">
            매번 같은 지점에서
            <br />
            멈추는 이유,
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(180deg,#f7e7c4 0%,#e3c07b 45%,#bd9351 100%)' }}
            >
              별은 이미 알고 있다
            </span>
          </h1>

          <p className="mt-6 max-w-[440px] text-[15.5px] leading-[1.9] t-body">
            생년월일시 하나로 열두 궁과 열네 주성, 사화와 대한을 계산합니다.{' '}
            <br className="hidden sm:block" />
            성격의 결부터 재물·연애·일의 흐름까지, 한 장의 명반으로 읽어드립니다.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] t-muted">
            {['12궁 명반 자동 계산', '음양력 · 윤달 · 시진 보정', '3분 완성 리포트'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full" style={{ background: 'var(--accent)' }} />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 아트워크 */}
        <div className="relative mx-auto w-full max-w-[430px] animate-rise [animation-delay:120ms]">
          <div className="relative mx-auto aspect-[4/5] w-[86%]">
            <div className="t-orbit animate-breathe" style={{ inset: '-9%', borderStyle: 'solid' }} />
            <div className="t-orbit animate-breathe [animation-delay:1.6s]" style={{ inset: '-19%' }} />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                borderRadius: '20px',
                border: '1px solid rgba(227,192,123,0.45)',
                boxShadow: '0 50px 90px -50px rgba(0,0,0,1), 0 0 60px -18px rgba(227,192,123,0.35)',
              }}
            >
              <img src={THEME_ART.mystic.hero} alt={THEME_ART.mystic.alt} className="h-full w-full object-cover" />
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(9,8,18,0.18) 0%, transparent 35%, rgba(9,8,18,0.72) 100%)' }}
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-4">
                <div>
                  <p className="text-[12px] tracking-[0.32em]" style={{ color: 'rgba(227,192,123,0.8)' }}>
                    ZI WEI DOU SHU
                  </p>
                  <p className="t-display mt-1 text-[15px] tracking-[0.24em]" style={{ color: '#f4e7cd' }}>
                    命盤 · 나의 별
                  </p>
                </div>
                <span
                  className="rounded-full px-2 py-1 text-[12px] tracking-[0.2em]"
                  style={{ border: '1px solid rgba(227,192,123,0.4)', color: '#e3c07b' }}
                >
                  紫微垣
                </span>
              </div>
            </div>

            <div
              className="absolute -right-4 top-6 hidden rounded-full px-3 py-1.5 text-[12.5px] tracking-[0.18em] sm:block"
              style={{
                background: 'rgba(12,9,24,0.85)',
                border: '1px solid rgba(227,192,123,0.35)',
                color: '#e3c07b',
                backdropFilter: 'blur(8px)',
              }}
            >
              運命 · 命運
            </div>
            <div className="absolute -left-3 bottom-16 h-16 w-16 rounded-full t-glow-gold opacity-60 blur-md" />
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 text-[12.5px] tracking-[0.18em] t-faint">
            <span className="h-px w-8" style={{ background: 'var(--line-strong)' }} />
            12궁 · 14주성 · 4사화 · 10년 대운
            <span className="h-px w-8" style={{ background: 'var(--line-strong)' }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MysticLanding({ onSubmit, onSample, draftRef, onProduct, onNewYear, system, onSystemChange }: Props) {
  const { copy } = useTheme();

  return (
    <div>
      <MysticHeader system={system} />
      <SystemTabs system={system} onChange={onSystemChange} />

      {system === 'western' ? (
        <WesternLanding onSubmit={onSubmit} onSample={onSample} onProduct={onProduct} />
      ) : (
        <>
      <Hero />

      {/* 2027 정미년 신년 부적 — 무료 퍼널 입구 */}
      <section className="mx-auto mt-14 max-w-6xl px-5 sm:px-8">
        <NewYearBanner onStart={onNewYear} />
      </section>

      {/* 입력 */}
      <section id="chart" className="relative mx-auto max-w-6xl scroll-mt-20 px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="lg:pt-6">
            <SectionLabel index="I">당신의 좌표</SectionLabel>
            <h2 className="t-display mt-4 text-[26px] leading-[1.35] sm:text-[30px]">
              별은 이미 떠 있습니다.
              <br />
              <span className="t-muted">좌표만 알려주세요.</span>
            </h2>
            <p className="mt-4 max-w-[360px] text-[14.5px] leading-[1.9] t-muted">
              양력·음력, 윤달, 시진을 모두 보정해 전통 방식 그대로 계산합니다.
              명반과 무료 해설은 입력 즉시 열리고, 결제 없이도 읽을 수 있습니다.
            </p>

            <div className="mt-7 space-y-3">
              {[
                ['01', '명반 계산', '12궁·14주성·사화·대한'],
                ['02', '무료 해설', '명궁 주성과 올해 조심할 궁'],
                ['03', '깊은 읽기', '결제한 리포트만 잠금 해제'],
              ].map(([no, title, desc]) => (
                <div key={no} className="flex items-start gap-3">
                  <span className="num mt-0.5 text-[12.5px] tracking-[0.16em] t-faint">{no}</span>
                  <div>
                    <p className="text-[14.5px] font-semibold t-body">{title}</p>
                    <p className="mt-0.5 text-[13.5px] t-faint">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <BirthForm onSubmit={onSubmit} onSample={onSample} draftRef={draftRef} />
          </div>
        </div>
      </section>

      {/* 무료 티저 */}
      <section className="mx-auto mt-20 max-w-6xl px-5 sm:px-8">
        <div className="t-panel relative p-7 sm:p-10">
          <div className="t-starfield opacity-50" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(143,111,224,0.45), transparent)' }} />
          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="text-[12.5px] tracking-[0.3em] t-panel-accent">무료로 열리는 것</p>
              <h2 className="t-panel-title mt-4 text-[24px] leading-[1.4] sm:text-[29px]">
                올해, 당신이 가장 조심해야 할 궁.
                <br />
                <span style={{ color: 'rgba(246,238,224,0.55)' }}>그리고 아직 말하지 않은 한 줄.</span>
              </h2>
              <p className="mt-4 max-w-[430px] text-[14.5px] leading-[1.9] t-panel-body">
                무료 명반에서도 명궁의 주성, 재물·연애·직업 지수, 그리고 올해 조심할 궁 하나는
                그대로 공개합니다. 다만 <b className="font-semibold" style={{ color: '#e3c07b' }}>왜 그런지</b>는
                첫 문장에서 멈춰 둡니다.
              </p>
            </div>

            <div className="relative rounded-2xl p-5" style={{ background: 'rgba(9,8,18,0.5)', border: '1px solid rgba(227,192,123,0.22)' }}>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] tracking-[0.22em] t-panel-faint">TEASER · 2026</span>
                <span className="rounded-full px-2 py-0.5 text-[12px]" style={{ border: '1px solid rgba(227,192,123,0.3)', color: '#e3c07b' }}>
                  무료 공개 30%
                </span>
              </div>
              <p className="mt-3 text-[14px] leading-[1.85]" style={{ color: 'rgba(248,241,228,0.92)' }}>
                재물이 새는 달은 3월과 9월. 그 이유는
                <span className="mt-1 block select-none text-[14px] leading-[1.85] blur-[4px]" style={{ color: 'rgba(248,241,228,0.6)' }} aria-hidden="true">
                  화기(化忌)가 재백궁을 건드리기 때문입니다. 그때는 새로운 지출을 미루고
                </span>
              </p>
              <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: 'rgba(246,238,224,0.12)' }}>
                <span className="text-[13px] t-panel-faint">잠긴 문장 7개</span>
                <span className="flex items-center gap-1 text-[13px]" style={{ color: '#e3c07b' }}>
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
                    <path d="M8.5 10.5V8a3.5 3.5 0 1 1 7 0v2.5" />
                  </svg>
                  명반 열면 확인
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto mt-20 max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <SectionLabel index="II">WHY JAMIWON</SectionLabel>
            <h2 className="t-display mt-4 text-[26px] leading-[1.35] sm:text-[31px]">
              철학원이 아니라,
              <br className="sm:hidden" /> 천문대처럼 읽습니다
            </h2>
          </div>
          <p className="max-w-[330px] text-[14px] leading-[1.9] t-muted">
            어려운 한자와 겁주는 말 대신, 지금 쓰는 언어로 정리했습니다.
            계산은 전통 방식 그대로, 읽는 방식은 오늘의 것으로.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              t: '정확한 계산',
              d: '음양력·윤달·시진을 보정해 12궁과 14주성, 사화, 대한을 계산합니다. 화면에는 중국어가 한 글자도 나오지 않습니다.',
              icon: (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 3.5v17M3.5 12h17" strokeOpacity="0.5" />
                  <circle cx="12" cy="12" r="2.2" />
                </svg>
              ),
            },
            {
              t: '지금의 언어',
              d: '"작두를 탄다" 같은 옛 표현 대신, 성격·재물·연애·일에서 실제로 겪는 장면으로 풀어냅니다.',
              icon: (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M4 7h9M4 12h13M4 17h7" />
                  <circle cx="18" cy="7" r="1.4" />
                </svg>
              ),
            },
            {
              t: '공유하는 명반',
              d: '내 명궁 주성을 4:5 카드로 저장. 인스타그램·스레드에 올릴 수 있는 요약 카드가 함께 나옵니다.',
              icon: (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <rect x="4" y="5" width="12" height="14" rx="2" />
                  <path d="M9 5V3.5h11a1 1 0 0 1 1 1V16" />
                </svg>
              ),
            },
          ].map((c, i) => (
            <div key={c.t} className="t-card group p-6">
              <div className="flex items-center justify-between">
                <span className="num text-[12.5px] tracking-[0.2em] t-faint">0{i + 1}</span>
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full transition group-hover:scale-105"
                  style={{ border: '1px solid var(--line)', color: 'var(--accent)' }}
                >
                  {c.icon}
                </span>
              </div>
              <h3 className="t-title mt-5 text-[19px]">{c.t}</h3>
              <p className="mt-2.5 text-[14.5px] leading-[1.85] t-muted">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REPORTS */}
      <section id="reports" className="mx-auto mt-20 max-w-6xl scroll-mt-20 px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <SectionLabel index="III">REPORTS</SectionLabel>
            <h2 className="t-display mt-4 text-[26px] leading-[1.35] sm:text-[31px]">
              필요한 만큼만, {ZIWEI_ONLY ? '세' : '다섯'} 개의 문
            </h2>
          </div>
          <p className="max-w-[330px] text-[14px] leading-[1.9] t-muted">
            {ZIWEI_ONLY
              ? '동양 전통 자미두수 세 개. 무료 해석으로 충분히 읽고, 더 깊이 보고 싶을 때만 결제하세요.'
              : '동양 자미두수 세 개, 서양 점성술 두 개. 체계마다 상품이 따로이고, 결제도 따로입니다. 무료 해석으로 충분히 읽고, 더 깊이 보고 싶을 때만 결제하세요.'}
          </p>
        </div>

        <div className="mt-8 space-y-8">
          {(ZIWEI_ONLY
            ? [{ label: '', items: ZIWEI_PRODUCTS }]
            : [
                { label: '① 동양 전통 자미두수 · 12궁 명반', items: ZIWEI_PRODUCTS },
                { label: '② 서양 점성술 · 출생 천궁도', items: WESTERN_PRODUCTS },
              ]
          ).map((group) => (
            <div key={group.label || 'all'}>
              {group.label && (
                <div className="flex items-center gap-3">
                  <span className="t-title text-[15px]">{group.label}</span>
                  <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
                </div>
              )}
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {group.items.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col p-6 ${p.recommended ? 't-panel' : 't-card'}`}
            >
              {p.badge && (
                <span
                  className="absolute -top-3 left-6 rounded-full px-3 py-1 text-[12.5px] font-semibold tracking-[0.08em]"
                  style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
                >
                  {p.badge}
                </span>
              )}
              <div className="flex items-baseline justify-between">
                <h3 className={`text-[19px] ${p.recommended ? 't-panel-title' : 't-title'}`}>{p.name}</h3>
                <span className={`text-[12.5px] ${p.recommended ? 't-panel-faint' : 't-faint'}`}>{p.hanja}</span>
              </div>
              <p className={`mt-1.5 text-[13.5px] ${p.recommended ? 't-panel-body' : 't-muted'}`}>{p.tagline}</p>

              <div className="mt-5">
                <PriceTag product={p} variant="card" onDark={!!p.recommended} />
              </div>

              <ul className={`mt-4 flex-1 space-y-2 text-[14px] leading-relaxed ${p.recommended ? 't-panel-body' : 't-muted'}`}>
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-2">
                    <span style={{ color: 'var(--accent)' }}>·</span>
                    {pt}
                  </li>
                ))}
              </ul>

              {productScopeShort(p, 'mystic') && (
                <p className={`mt-2 text-[12.5px] leading-[1.65] ${p.recommended ? 't-panel-faint' : 't-faint'}`}>
                  {productScopeShort(p, 'mystic')}
                </p>
              )}

              <button
                onClick={() => onProduct(p.id)}
                className={`t-btn mt-6 w-full py-3 text-[14.5px] ${p.recommended ? 't-btn-gold' : 't-btn-ghost'}`}
              >
                {p.system === 'western' ? '천궁도 입력하고 시작하기' : p.system === 'both' ? '통합 리포트 시작하기' : '명반 입력하고 시작하기'}
              </button>
            </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-[13px] t-faint">
          {ZIWEI_ONLY
            ? '모든 상품은 1회 결제 · 기간 제한 없이 재열람 · 명반은 서버에 저장하지 않습니다.'
            : '모든 상품은 1회 결제 · 기간 제한 없이 재열람 · 명반과 천궁도는 서버에 저장하지 않습니다.'}
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto mt-20 max-w-6xl scroll-mt-20 px-5 sm:px-8">
        <div className="grid gap-8 border-t pt-12 lg:grid-cols-[0.8fr_1.2fr]" style={{ borderColor: 'var(--line)' }}>
          <div>
            <SectionLabel index="IV">DETAIL</SectionLabel>
            <h2 className="t-display mt-4 text-[25px] leading-[1.4]">알아두실 것</h2>
            <p className="mt-3 max-w-[280px] text-[13.5px] leading-[1.9] t-faint">
              자미두수는 정답이 아니라 경향입니다. 리포트는 늘 “그래서 무엇을 할지”를 함께 제안합니다.
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--line-soft)' }}>
            {[
              {
                q: '태어난 시간을 모르면 어떻게 되나요?',
                a: '정오(오시) 기준으로 계산하며, 명궁이 달라질 수 있다는 안내를 함께 표시합니다. 시간을 알면 더 정확합니다.',
              },
              {
                q: '음력 생일인데 그대로 넣어도 되나요?',
                a: '됩니다. 한국 음력 기준으로 양력 변환 후 계산하며, 윤달도 선택할 수 있습니다.',
              },
              {
                q: '결제하면 무엇이 열리나요?',
                a: '결제한 상품의 리포트가 즉시 열립니다. 12궁 상세 풀이, 지수 그래프, 대한·유년 흐름, 월별 액션 가이드까지 한 화면에서 볼 수 있습니다.',
              },
              {
                q: '운세가 안 좋게 나오면 어떡하죠?',
                a: '자미두수는 정해진 미래가 아니라 지금의 결을 보는 지도입니다. 조심할 시기와 피하는 방법을 함께 읽도록 썼습니다.',
              },
            ].map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium t-body">
                  {f.q}
                  <span className="text-[17px] transition group-open:rotate-45" style={{ color: 'var(--accent)' }}>
                    +
                  </span>
                </summary>
                <p className="mt-3 pr-6 text-[14px] leading-[1.9] t-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
        </>
      )}

      <MysticFooter system={system} />
    </div>
  );
}

function MysticFooter({ system }: { system: SystemId }) {
  const { copy } = useTheme();
  return (
    <footer className="mt-20 border-t" style={{ borderColor: 'var(--line)' }}>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div>
            <div className="flex items-center gap-2.5">
              <StarMark className="h-3.5 w-3.5" />
              <span className="t-title text-[18px] tracking-[0.14em]">{copy.brand.name}</span>
              <span className="text-[12px] tracking-[0.3em] t-faint">{copy.brand.hanja}</span>
            </div>
            <p className="mt-3 max-w-sm text-[13.5px] leading-[1.9] t-muted">
              {system === 'western'
                ? '출생 천궁도로 읽는 나의 좌표. 태양·달·어센던트와 행성의 하우스를 지금의 언어로 읽습니다.'
                : '나만의 자미두수 사용설명서. 열두 궁과 열네 주성을 지금의 언어로 읽습니다.'}
            </p>
          </div>
          <div className="flex gap-12 text-[13.5px] t-muted">
            <div className="space-y-2">
              <p className="text-[12.5px] tracking-[0.2em] t-faint">리포트</p>
              <p>내 인생 사용설명서</p>
              <p>프리미엄 12궁</p>
              <p>두 사람 궁합</p>
            </div>
            {!ZIWEI_ONLY && (
              <div className="space-y-2">
                <p className="text-[12.5px] tracking-[0.2em] t-faint">서양 점성술</p>
                <p>출생 천궁도</p>
                <p>동양×서양 통합</p>
                <p>계산 방식</p>
              </div>
            )}
          </div>
        </div>
        {/* 고지·사업자 정보·정책 3종은 모든 화면 공통 푸터(LegalFooter)가 이어받습니다. */}
      </div>
    </footer>
  );
}

export { MysticHeader };
