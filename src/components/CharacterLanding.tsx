import type { BirthInput } from '../lib/chart';
import {
  CHARACTER_BOOKS,
  CHARACTER_FIRST_PRICE,
  WESTERN_PRODUCTS,
  ZIWEI_PRODUCTS,
  productBadge,
  productCta,
  productName,
  productPoints,
  productPriceInfo,
  productScopeShort,
  productTagline,
  type ProductId,
} from '../lib/products';
import type { SystemId } from '../lib/systems';
import { ZIWEI_ONLY } from '../config/env';
import { THEME_ART, useTheme } from '../lib/theme';
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
  /** 마법사 단계 (0 인트로 · 1 내 별 · 2 별 이야기) */
  step: number;
  onStep: (step: number) => void;
};

/** 인트로 장면 카드 문구 — THEME_ART.character.scenes 의 id 와 짝을 이룹니다. */
const SCENE_COPY: Record<string, { title: string; line: string }> = {
  board: { title: '12개 별방', line: '별지도를 펼치는 밤' },
  reading: { title: '올해의 흐름', line: '찻잔 곁에서 읽는 별' },
  amulet: { title: '2027 부적', line: '붉은 실을 묶은 밤' },
};

const SPARKLES: Array<{ top: string; left: string; size: number; delay: string; opacity: number }> = [
  { top: '8%', left: '6%', size: 12, delay: '0s', opacity: 0.9 },
  { top: '18%', left: '92%', size: 9, delay: '1.2s', opacity: 0.8 },
  { top: '46%', left: '3%', size: 7, delay: '2.4s', opacity: 0.7 },
  { top: '62%', left: '96%', size: 11, delay: '0.6s', opacity: 0.85 },
  { top: '30%', left: '78%', size: 6, delay: '3.1s', opacity: 0.6 },
];

function SparkleField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="absolute animate-twinkle"
          style={{
            top: s.top,
            left: s.left,
            fontSize: s.size,
            color: '#fff6d8',
            animationDelay: s.delay,
            opacity: s.opacity,
            textShadow: '0 0 12px rgba(255,214,160,0.9)',
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

function CharacterHeader({ system, onStep }: { system: SystemId; onStep: (step: number) => void }) {
  const { copy } = useTheme();
  const western = system === 'western';
  return (
    <header
      className="sticky top-0 z-30 no-print"
      style={{
        borderBottom: '1px solid rgba(146,116,192,0.12)',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <div className="mx-auto flex h-[64px] max-w-5xl items-center justify-between gap-3 px-5 sm:px-8">
        <button onClick={() => onStep(0)} className="flex items-center gap-2">
          <span className="guardian-avatar h-8 w-8">
            <img src={THEME_ART.character.avatar} alt="" className="h-full w-full object-cover" />
          </span>
          <span className="t-display text-[18.5px] text-[#58417c]">{copy.brand.name}</span>
          <span className="text-[13px] text-[#c9b6e4]" aria-hidden="true">
            ✦
          </span>
        </button>
        <nav className="hidden items-center gap-6 text-[14px] text-[#6a5788] sm:flex">
          {western ? (
            <>
              <button onClick={() => onStep(1)} className="transition hover:text-[#7c59cf]">
                내 천궁도
              </button>
              <button onClick={() => onStep(2)} className="transition hover:text-[#7c59cf]">
                서양 리포트
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onStep(0)} className="transition hover:text-[#7c59cf]">
                하온
              </button>
              <button onClick={() => onStep(1)} className="transition hover:text-[#7c59cf]">
                내 별
              </button>
              <button onClick={() => onStep(2)} className="transition hover:text-[#7c59cf]">
                별 이야기
              </button>
            </>
          )}
        </nav>
        <button
          onClick={() => onStep(1)}
          className="t-btn t-btn-primary px-4 py-2.5 text-[13.5px]"
        >
          {western ? '내 천궁도 보기' : copy.headerCta}
        </button>
      </div>
    </header>
  );
}

/** 인트로 — 하온과 별빛 고양이, 그리고 이 여정에서 볼 세 장면 */
function IntroStep({ onNext }: { onNext: () => void }) {
  const { copy } = useTheme();
  return (
    <div>
      <section className="relative overflow-hidden">
        <SparkleField />
        <div
          className="pointer-events-none absolute -right-24 top-10 h-[380px] w-[380px] rounded-full opacity-80 blur-[2px]"
          style={{ background: 'radial-gradient(closest-side,#ffe3cd, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -left-24 top-40 h-[300px] w-[300px] rounded-full"
          style={{ background: 'radial-gradient(closest-side,#e7d8ff, transparent 72%)' }}
        />

        <div className="relative pt-2 sm:pt-4">
          <div className="grid items-center gap-4 sm:grid-cols-[1.02fr_0.98fr] sm:gap-8 lg:gap-12">
            <div className="animate-rise">
              <span className="t-chip !py-1.5 !text-[13px]" style={{ color: '#7c59cf' }}>
                <span aria-hidden="true">✦</span> 오늘도 별이 반짝이는 중
              </span>
              <h1 className="t-display mt-4 text-[27px] leading-[1.45] text-[#4d3a6d] sm:text-[40px] lg:text-[44px]">
                오늘 나의 별이
                <br />
                살짝 신호를 보내고 있어요
                <span className="ml-1 align-middle text-[19px]" style={{ color: '#f0b968' }} aria-hidden="true">
                  ✦
                </span>
              </h1>
              <p className="mt-3 max-w-[330px] text-[15px] leading-[1.9] text-[#7c6a99] sm:text-[16px]">
                별빛 가디언이 읽어 드리는
                <br />
                나만의 사용설명서
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button onClick={onNext} className="t-btn t-btn-primary px-5 py-3 text-[14px]">
                  내 별지도 열기
                  <span aria-hidden="true">→</span>
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-[#9a86b6]">
                <span>✧ 12개 별방</span>
                <span>✧ 14개의 별</span>
                <span>✧ 커피 한 잔 값 {CHARACTER_FIRST_PRICE.toLocaleString('ko-KR')}원부터</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[330px] animate-rise [animation-delay:100ms] sm:max-w-[372px]">
              <div
                className="pointer-events-none absolute -inset-x-3 -top-3 bottom-24 rounded-[56px] opacity-80 blur-2xl"
                style={{ background: 'radial-gradient(closest-side,#cdb8f7, rgba(205,184,247,0) 74%)' }}
              />
              <img
                src={THEME_ART.character.hero}
                alt={THEME_ART.character.alt}
                className="relative mx-auto w-full rounded-[32px] object-cover"
                style={{ boxShadow: '0 42px 68px -42px rgba(48,32,92,0.72)' }}
              />
              <div className="bubble relative -mt-4 w-[94%] px-3.5 pb-3 pt-2.5 text-[13.5px] leading-[1.7]">
                <span className="flex items-center gap-1.5 text-[11.5px] font-semibold tracking-[0.06em] text-[#8f6fe0]">
                  <span className="guardian-avatar h-5 w-5">
                    <img src={THEME_ART.character.greeting} alt="" className="h-full w-full object-cover" />
                  </span>
                  하온 · 별을 읽는 사람
                </span>
                <p className="mt-1.5">
                  태어난 순간만 알려 주시면, <b className="font-semibold text-[#6b4fa0]">별지도부터</b> 펼쳐 볼게요.
                </p>
              </div>
            </div>
          </div>

          {/* 이 여정에서 볼 세 장면 */}
          <div className="mt-7">
            <SectionLabel index="✧">이런 별을 볼 수 있어요</SectionLabel>
            <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:gap-3.5 sm:overflow-visible">
              {THEME_ART.character.scenes.map((s) => {
                const caption = SCENE_COPY[s.id] ?? { title: '', line: '' };
                return (
                  <figure key={s.id} className="w-[68%] shrink-0 snap-start sm:w-auto">
                    <img
                      src={s.src}
                      alt={s.alt}
                      loading="lazy"
                      className="aspect-[3/4] w-full rounded-[20px] object-cover"
                      style={{ boxShadow: '0 22px 38px -28px rgba(72,48,120,0.7)' }}
                    />
                    <figcaption className="mt-2 px-0.5">
                      <span className="block text-[13.5px] font-semibold text-[#5b4382]">{caption.title}</span>
                      <span className="block text-[12.5px] text-[#7d6899]">{caption.line}</span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>

          <div
            className="mt-4 flex items-center gap-2.5 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(237,227,255,0.62)', border: '1px dashed rgba(146,116,192,0.28)' }}
          >
            <span className="guardian-avatar h-8 w-8 shrink-0">
              <img src={THEME_ART.character.avatar} alt="" className="h-full w-full object-cover" />
            </span>
            <p className="text-[13px] leading-[1.75] text-[#5b4382]">
              “어제는 고양이가 먼저 알아보더라고요.” <span className="text-[#8f6fe0]">— 하온</span>
            </p>
          </div>
          <p className="mt-3 text-center text-[12.5px] text-[#9a86b6]">{copy.brand.line}</p>
        </div>
      </section>
    </div>
  );
}

/** 입력 — 생년월일시 */
function BirthStep({
  onSubmit,
  draftRef,
}: {
  onSubmit: (input: BirthInput) => void;
  draftRef?: MutableRefObject<BirthDraft | null>;
}) {
  return (
    <section>
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="order-2 lg:order-1">
          <SectionLabel index="✧">YOUR STARS</SectionLabel>
          <h2 className="t-display mt-3 text-[23px] leading-[1.5] text-[#4d3a6d]">
            별은 이미 떠 있어요.
            <br />
            <span className="text-[#8f6fe0]">태어난 순간</span>만 알려 주세요.
          </h2>
          <p className="mt-3 max-w-[320px] text-[14px] leading-[1.9] text-[#6a5788]">
            양력·음력, 윤달, 태어난 시간까지 보정해서 그려요. 시간을 몰라도 괜찮아요 — 정오 기준으로 별을 놓아 드릴게요.
          </p>
          <div className="mt-5 space-y-2.5">
            {['수호별과 성격의 결', '12개 별방 이야기', '올해 조심할 별방 하나'].map((t, i) => (
              <p key={t} className="flex items-center gap-2 text-[13.5px] text-[#7c6a99]">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[12px]"
                  style={{ background: 'rgba(143,111,224,0.12)', color: '#7c59cf' }}
                >
                  {i + 1}
                </span>
                {t}
              </p>
            ))}
          </div>
          <div className="mt-5 hidden items-center gap-2.5 rounded-2xl px-3.5 py-3 lg:flex" style={{ background: 'rgba(237,227,255,0.6)' }}>
            <span className="guardian-avatar h-9 w-9 shrink-0">
              <img src={THEME_ART.character.greeting} alt="" className="h-full w-full object-cover" />
            </span>
            <p className="text-[13px] leading-[1.7] text-[#5b4382]">
              고양이가 생일을 기다리고 있어요. 하단의 <b className="text-[#7c59cf]">다음</b>을 누르면 바로 그려 드릴게요.
            </p>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <BirthForm onSubmit={onSubmit} draftRef={draftRef} formId="birth-wizard-form" hideSubmit />
        </div>
      </div>
    </section>
  );
}

/** 별 이야기 — 2027 부적 입구 + 상품 + 자주 묻는 질문 */
function BooksStep({ onProduct, onNewYear }: { onProduct: (id: ProductId) => void; onNewYear: () => void }) {
  const { theme } = useTheme();
  const shownBooks = ZIWEI_ONLY ? CHARACTER_BOOKS : [...CHARACTER_BOOKS, ...WESTERN_PRODUCTS];
  const shownRates = shownBooks
    .map((p) => productPriceInfo(p, 'character'))
    .filter((info) => info.discounted)
    .map((info) => info.rate);
  /* 자미두수 단독 프리뷰(VITE_ZIWEI_ONLY)에서는 상품을 한 묶음으로만 보여 줍니다. */
  const reportGroups = ZIWEI_ONLY
    ? [{ label: '', items: CHARACTER_BOOKS }]
    : [
        { label: '① 동양 전통 자미두수 · 12개 별방', items: CHARACTER_BOOKS },
        { label: '② 서양 점성술 · 출생 천궁도', items: WESTERN_PRODUCTS },
      ];

  return (
    <div>
      <section>
        <NewYearBanner onStart={onNewYear} />
      </section>

      <section className="mt-10">
        <SectionLabel index="✧">STORY BOOKS</SectionLabel>
        <h2 className="t-display mt-3 text-[23px] text-[#4d3a6d]">
          {ZIWEI_ONLY ? '별 이야기 다섯 권' : '별 이야기 일곱 권'}
        </h2>
        <p className="mt-2 max-w-[360px] text-[14px] leading-[1.9] text-[#6a5788]">
          {ZIWEI_ONLY
            ? '2027 신년 운세가 메인, 2026년은 마감 할인. '
            : '동양 자미두수 다섯 권, 서양 점성술 두 권. '}
          첫 이야기는{' '}
          <b className="font-semibold text-[#7c59cf]">커피 한 잔 값({CHARACTER_FIRST_PRICE.toLocaleString('ko-KR')}원)</b>이에요.
          가볍게 시작하시고, 더 궁금할 때만 다음 책을 펼쳐 보세요.
        </p>
        {shownRates.length > 0 && (
          <p
            className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full px-3 py-1.5 text-[13px] text-[#6a5788]"
            style={{ background: 'rgba(237,227,255,0.7)' }}
          >
            <span aria-hidden="true">✧</span>
            모든 별 이야기 정가 대비{' '}
            <b className="font-semibold text-[#7c59cf]">
              {Math.min(...shownRates)}~{Math.max(...shownRates)}%
            </b>{' '}
            할인 · 결제 전에 <b className="font-semibold text-[#7c59cf]">무료로 30%</b> 먼저 읽어 보세요
          </p>
        )}

        <div className="mt-5 space-y-6">
          {reportGroups.map((group) => (
            <div key={group.label || 'all'}>
              {group.label && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#5b4382]">{group.label}</span>
                  <span className="h-px flex-1" style={{ background: 'rgba(146,116,192,0.22)' }} />
                </div>
              )}
              <div className="mt-2.5 grid gap-3.5 sm:grid-cols-3">
                {group.items.map((p) => {
                  /* 2027 신년 운세가 메인, 2026년 운세는 마감 할인 카드로 보여 줍니다. */
                  const featured = p.id === 'newyear2027';
                  const closing = p.id === 'year2026';
                  return (
                  <div
                    key={p.id}
                    className="relative flex flex-col p-5"
                    style={
                      featured
                        ? {
                            borderRadius: '26px',
                            background: 'linear-gradient(160deg,#6a52a6,#4a3578)',
                            color: '#fff9ff',
                            border: '1px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 24px 44px -30px rgba(78,54,120,0.7)',
                          }
                        : closing
                          ? {
                              borderRadius: '26px',
                              background: 'linear-gradient(160deg,#fff6ea,#ffe7d4)',
                              border: '1px solid rgba(224,150,96,0.42)',
                              boxShadow: '0 18px 34px -28px rgba(168,112,70,0.5)',
                              color: '#4d3a6d',
                            }
                          : {
                              borderRadius: '26px',
                              background: 'rgba(255,255,255,0.88)',
                              border: '1px solid rgba(146,116,192,0.16)',
                              boxShadow: '0 18px 34px -28px rgba(112,80,164,0.5)',
                              color: '#4d3a6d',
                            }
                    }
                  >
                    {productBadge(p, 'character') && (
                      <span
                        className="absolute -top-2.5 left-5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold"
                        style={{ background: p.id === 'basic' ? '#ffd9c7' : '#ffe0b8', color: '#5b4382' }}
                      >
                        {productBadge(p, 'character')}
                      </span>
                    )}
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="t-display min-w-0 text-[16.5px] leading-snug" style={{ color: featured ? '#ffffff' : undefined }}>
                        {productName(p, theme)}
                      </h3>
                      {!ZIWEI_ONLY && (
                        <span className="text-[12px]" style={{ color: featured ? 'rgba(255,249,255,0.72)' : '#8f81a8' }}>
                          {p.hanja}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[13px]" style={{ color: featured ? 'rgba(255,249,255,0.88)' : '#6a5788' }}>
                      {productTagline(p, 'character')}
                    </p>
                    <div className="mt-4">
                      <PriceTag product={p} variant="card" onDark={featured} />
                    </div>
                    {p.id === 'basic' && !ZIWEI_ONLY && (
                      <p className="mt-1 text-[12.5px] text-[#b07ac9]">☕ 커피 한 잔 값, 부담 없이 시작해 보세요</p>
                    )}
                    <ul
                      className="mt-3 flex-1 space-y-1.5 text-[13px] leading-relaxed"
                      style={{ color: featured ? 'rgba(255,249,255,0.82)' : '#7c6a99' }}
                    >
                      {productPoints(p, 'character').slice(0, 3).map((pt) => (
                        <li key={pt} className="flex gap-1.5">
                          <span style={{ color: featured ? '#ffd9b8' : '#b395f5' }}>✧</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                    {productScopeShort(p, 'character') && (
                      <p
                        className="mt-2 text-[12.5px] leading-[1.65]"
                        style={{ color: featured ? 'rgba(255,249,255,0.8)' : '#75628f' }}
                      >
                        {productScopeShort(p, 'character')}
                      </p>
                    )}
                    <button
                      onClick={() => onProduct(p.id)}
                      className={`t-btn mt-4 w-full whitespace-nowrap py-2.5 text-[13.5px] ${featured ? 't-btn-gold' : 't-btn-soft'}`}
                    >
                      {productCta(p, 'character')}
                    </button>
                  </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[13px] text-[#75628f]">
          1회 결제 · 언제든 다시 보기 · 별지도는 서버에 저장하지 않아요
        </p>
        {!ZIWEI_ONLY && (
          <div
            className="mt-3 rounded-2xl px-4 py-3 text-center"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px dashed rgba(146,116,192,0.25)' }}
          >
            <p className="text-[13px] leading-[1.8] text-[#6a5788]">
              곧 · <b className="text-[#7c59cf]">매달 1일 월간 별빛 편지</b>(구독)가 열려요. 서양 별자리까지 함께 읽는{' '}
              <b className="text-[#7c59cf]">통합 리포트</b>는 위에서 바로 결제할 수 있어요.
            </p>
          </div>
        )}
        {ZIWEI_ONLY && <p className="mt-3 text-center text-[13px] text-[#75628f]">곧 · 매달 1일 별빛 편지(구독)가 열려요.</p>}
      </section>

      <section className="mt-10">
        <div className="t-card p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <StarMark className="h-3 w-3" />
            <h2 className="t-display text-[20px] text-[#4d3a6d]">가디언에게 물어보기</h2>
          </div>
          <div className="mt-3 divide-y" style={{ borderColor: 'rgba(146,116,192,0.1)' }}>
            {[
              { q: '태어난 시간을 몰라도 되나요?', a: '네, 정오(오시) 기준으로 계산해요. 수호별이 달라질 수 있다는 점도 함께 알려 드릴게요.' },
              { q: '음력 생일인데 그대로 넣어도 되나요?', a: '물론이에요. 한국 음력 기준으로 양력으로 바꿔서 그리고, 윤달도 선택할 수 있어요.' },
              {
                q: '결제하면 무엇이 열리나요?',
                a: '커피 한 잔 값 이야기(3,900원)에서는 수호별·성격, 연애·배우자상, 진로·전공, 돈이 새는 장면까지 핵심만 열려요. 12개 별방 전체와 달마다 처방은 전체 별 이야기(12,900원)에서 볼 수 있어요.',
              },
            ].map((f) => (
              <details key={f.q} className="group py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14.5px] font-medium text-[#5b4382]">
                  {f.q}
                  <span className="text-[16px] text-[#b395f5] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 pr-6 text-[13.5px] leading-[1.9] text-[#6a5788]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CharacterLanding({
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
    <div id="top">
      <CharacterHeader system={system} onStep={onStep} />
      <SystemTabs system={system} onChange={onSystemChange} />

      {system === 'western' ? (
        <WesternLanding onSubmit={onSubmit} onProduct={onProduct} />
      ) : (
        <div className="mx-auto max-w-5xl px-5 pb-2 pt-6 sm:px-8">
          <Wizard
            eyebrow={
              <span className="text-[12.5px] tracking-[0.2em] t-faint">
                {step === 0 ? 'STEP 1 · 별 읽는 사람' : step === 1 ? 'STEP 2 · 내 별' : 'STEP 3 · 별 이야기'}
              </span>
            }
            steps={[
              { id: 'intro', label: '인트로', body: <IntroStep onNext={() => onStep(1)} />, nextLabel: '내 별지도 열기' },
              {
                id: 'birth',
                label: '내 별',
                body: <BirthStep onSubmit={onSubmit} draftRef={draftRef} />,
                nextLabel: copy.form.submit,
              },
              { id: 'books', label: '별 이야기', body: <BooksStep onProduct={onProduct} onNewYear={onNewYear} /> },
            ]}
            index={step}
            onIndexChange={onStep}
            submitFormId={step === 1 ? 'birth-wizard-form' : undefined}
            finishLabel="처음으로"
            onFinish={() => onStep(0)}
          />
        </div>
      )}

      {/* 사업자 정보·정책·저작권은 모든 화면 공통 푸터(LegalFooter)가 이어받습니다. */}
    </div>
  );
}
