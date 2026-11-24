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
import Wizard from './Wizard';
import { SectionLabel, StarMark } from './ui';

type Props = {
  onSubmit: (input: BirthInput) => void;
  draftRef?: MutableRefObject<BirthDraft | null>;
  onProduct: (id: ProductId) => void;
  /** 랜딩의 2027 신년 부적 배너 */
  onNewYear: () => void;
  system: SystemId;
  onSystemChange: (system: SystemId) => void;
  /** 마법사 단계 (0 인트로 · 1 내 명반 · 2 별 이야기) */
  step: number;
  onStep: (step: number) => void;
};

function MysticHeader({
  onStep,
  system,
}: {
  onStep: (step: number) => void;
  system: SystemId;
}) {
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
        <button onClick={() => onStep(0)} className="flex items-center gap-2.5">
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
              <button onClick={() => onStep(1)} className="transition hover:text-[#e3c07b]">
                천궁도
              </button>
              <button onClick={() => onStep(2)} className="transition hover:text-[#e3c07b]">
                서양 리포트
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onStep(1)} className="transition hover:text-[#e3c07b]">
                {copy.nav.chart}
              </button>
              <button onClick={() => onStep(2)} className="transition hover:text-[#e3c07b]">
                {copy.nav.reports}
              </button>
              <button onClick={() => onStep(2)} className="transition hover:text-[#e3c07b]">
                {copy.nav.guide}
              </button>
            </>
          )}
        </nav>

        <button onClick={() => onStep(1)} className="t-btn t-btn-ghost px-4 py-2.5 text-[14px] sm:px-5">
          {western ? '내 천궁도 보기' : copy.headerCta}
        </button>
      </div>
    </header>
  );
}

function Hero({ onNext }: { onNext: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="t-starfield opacity-70" />
      <div className="pointer-events-none absolute -left-40 top-10 h-[520px] w-[520px] rounded-full t-glow-purple opacity-60" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[460px] w-[460px] rounded-full t-glow-gold opacity-40" />

      <div className="relative grid items-center gap-10 pb-2 pt-2 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <div className="animate-rise">
          <div className="flex items-center gap-3">
            <StarMark className="h-3.5 w-3.5" />
            <span className="eyebrow">紫微斗數 · 東洋占星術</span>
          </div>

          <p className="t-display mt-6 text-[17px] tracking-[0.02em] sm:text-[18px]" style={{ color: 'var(--accent)' }}>
            천문이 읽고, 별이 말하다
          </p>
          <h1 className="t-display mt-3 text-[32px] leading-[1.28] sm:text-[42px] lg:text-[48px]">
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

          <p className="mt-6 max-w-[440px] text-[15px] leading-[1.9] t-body">
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

          <div className="mt-7">
            <button onClick={onNext} className="t-btn t-btn-primary px-6 py-3 text-[15px]">
              생년월일 넣고 명반 열기
            </button>
          </div>
        </div>

        {/* 아트워크 */}
        <div className="relative mx-auto w-full max-w-[400px] animate-rise [animation-delay:120ms]">
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
            12궁 · 14주성 · 4사화 · 10년 대한
            <span className="h-px w-8" style={{ background: 'var(--line-strong)' }} />
          </div>
        </div>
      </div>

      {/* 무료로 열리는 것 — 단계 안내 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ['01', '명반 계산', '12궁·14주성·사화·대한을 입력 즉시 계산합니다.'],
          ['02', '무료 해설', '명궁 주성과 올해 조심할 궁 하나는 결제 없이 열립니다.'],
          ['03', '깊은 읽기', '더 궁금한 부분만 골라 결제하고, 12궁 전체는 프리미엄에서.'],
        ].map(([no, title, desc]) => (
          <div key={no} className="t-card p-5">
            <span className="num text-[12px] tracking-[0.18em] t-faint">{no}</span>
            <p className="t-title mt-2 text-[17px]">{title}</p>
            <p className="mt-1.5 text-[13.5px] leading-[1.8] t-muted">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BirthStep({ onSubmit, draftRef }: { onSubmit: (input: BirthInput) => void; draftRef?: MutableRefObject<BirthDraft | null> }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
      <div className="lg:pt-4">
        <SectionLabel index="I">당신의 좌표</SectionLabel>
        <h2 className="t-display mt-4 text-[26px] leading-[1.35] sm:text-[30px]">
          별은 이미 떠 있습니다.
          <br />
          <span className="t-muted">좌표만 알려주세요.</span>
        </h2>
        <p className="mt-4 max-w-[360px] text-[14.5px] leading-[1.9] t-muted">
          양력·음력, 윤달, 시진을 모두 보정해 전통 방식 그대로 계산합니다. 명반과 무료 해설은 입력 즉시 열리고,
          결제 없이도 읽을 수 있습니다.
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
        <p className="mt-6 hidden text-[13px] leading-[1.8] t-faint lg:block">
          하단의 <b className="t-body">다음</b>을 누르면 명반이 바로 열립니다.
        </p>
      </div>

      <div>
        <BirthForm onSubmit={onSubmit} draftRef={draftRef} formId="birth-wizard-form" hideSubmit />
      </div>
    </section>
  );
}

function BooksStep({ onProduct, onNewYear }: { onProduct: (id: ProductId) => void; onNewYear: () => void }) {
  return (
    <div>
      <section className="max-w-3xl">
        <NewYearBanner onStart={onNewYear} />
      </section>

      <section className="mt-10">
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
                  <div key={p.id} className={`relative flex flex-col p-6 ${p.recommended ? 't-panel' : 't-card'}`}>
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

      <section className="mt-14">
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
    </div>
  );
}

export default function MysticLanding({
  onSubmit,
  draftRef,
  onProduct,
  onNewYear,
  system,
  onSystemChange,
  step,
  onStep,
}: Props) {
  const { copy } = useTheme();

  return (
    <div>
      <MysticHeader system={system} onStep={onStep} />
      <SystemTabs system={system} onChange={onSystemChange} />

      {system === 'western' ? (
        <WesternLanding onSubmit={onSubmit} onProduct={onProduct} />
      ) : (
        <div className="mx-auto max-w-6xl px-5 pb-2 pt-8 sm:px-8">
          <Wizard
            eyebrow={<span className="text-[12.5px] tracking-[0.24em] t-faint">{copy.brand.hanja} · 단계별로 읽기</span>}
            steps={[
              { id: 'intro', label: '인트로', body: <Hero onNext={() => onStep(1)} />, nextLabel: '내 명반 열기' },
              { id: 'birth', label: '내 명반', body: <BirthStep onSubmit={onSubmit} draftRef={draftRef} />, nextLabel: copy.form.submit },
              { id: 'books', label: '리포트', body: <BooksStep onProduct={onProduct} onNewYear={onNewYear} /> },
            ]}
            index={step}
            onIndexChange={onStep}
            submitFormId={step === 1 ? 'birth-wizard-form' : undefined}
            finishLabel="처음으로"
            onFinish={() => onStep(0)}
          />
        </div>
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
