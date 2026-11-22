import type { BirthInput } from '../lib/chart';
import {
  CHARACTER_FIRST_PRICE,
  PRODUCTS,
  WESTERN_PRODUCTS,
  ZIWEI_PRODUCTS,
  productBadge,
  productCta,
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

/** 하온 소개 카드의 장면 문구 — THEME_ART.character.scenes 의 id 와 짝을 이룹니다. */
const SCENE_COPY: Record<string, { title: string; line: string }> = {
  cafe: { title: '카페의 하온', line: '오후 세 시, 창가 자리' },
  night: { title: '밤의 하온', line: '별이 제일 밝은 시간' },
  study: { title: '서재의 하온', line: '물음표가 생길 때' },
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
          style={{ top: s.top, left: s.left, fontSize: s.size, color: '#fff6d8', animationDelay: s.delay, opacity: s.opacity, textShadow: '0 0 12px rgba(255,214,160,0.9)' }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

function CharacterHeader({ system }: { system: SystemId }) {  const { copy } = useTheme();
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
        <a href="#top" className="flex items-center gap-2">
          <span className="guardian-avatar h-8 w-8">
            <img src={THEME_ART.character.avatar} alt="" className="h-full w-full object-cover" />
          </span>
          <span className="t-display text-[18.5px] text-[#58417c]">{copy.brand.name}</span>
          <span className="text-[13px] text-[#c9b6e4]" aria-hidden="true">
            ✦
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-[14px] text-[#6a5788] sm:flex">
          {western ? (
            <>
              <a href="#western-chart">내 천궁도</a>
              <a href="#western-reports">서양 리포트</a>
            </>
          ) : (
            <>
              <a href="#haon">별 읽는 사람</a>
              <a href="#chart">내 별</a>
              <a href="#collection">별 컬렉션</a>
              <a href="#reports">별 이야기</a>
            </>
          )}
        </nav>
        <a href={western ? '#western-chart' : '#chart'} className="t-btn t-btn-primary px-4 py-2.5 text-[13.5px]">
          {western ? '내 천궁도 보기' : copy.headerCta}
        </a>
      </div>
    </header>
  );
}

function LuckRing({ score }: { score: number }) {
  return (
    <div
      className="h-[104px] w-[104px] shrink-0 rounded-full p-[7px]"
      style={{ background: `conic-gradient(#9470e4 ${score * 3.6}deg, rgba(146,116,192,0.14) 0deg)` }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
        <span className="text-[12px] text-[#75628f]">행운지수</span>
        <span className="num text-[26px] font-bold leading-none text-[#5b4382]">{score}%</span>
      </div>
    </div>
  );
}

export default function CharacterLanding({ onSubmit, onSample, draftRef, onProduct, onNewYear, system, onSystemChange }: Props) {
  const { copy } = useTheme();
  const shownBooks = ZIWEI_ONLY ? ZIWEI_PRODUCTS : [...ZIWEI_PRODUCTS, ...WESTERN_PRODUCTS];
  const shownRates = shownBooks
    .map((p) => productPriceInfo(p, 'character'))
    .filter((info) => info.discounted)
    .map((info) => info.rate);
  /* 자미두수 단독 프리뷰(VITE_ZIWEI_ONLY)에서는 상품을 한 묶음으로만 보여 줍니다. */
  const reportGroups = ZIWEI_ONLY
    ? [{ label: '', items: ZIWEI_PRODUCTS }]
    : [
        { label: '① 동양 전통 자미두수 · 12궁 명반', items: ZIWEI_PRODUCTS },
        { label: '② 서양 점성술 · 출생 천궁도', items: WESTERN_PRODUCTS },
      ];

  return (
    <div id="top">
      <CharacterHeader system={system} />
      <SystemTabs system={system} onChange={onSystemChange} />

      {system === 'western' ? (
        <WesternLanding onSubmit={onSubmit} onSample={onSample} onProduct={onProduct} />
      ) : (
        <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <SparkleField />
        <div
          className="pointer-events-none absolute -right-24 top-10 h-[380px] w-[380px] rounded-full opacity-80 blur-[2px]"
          style={{ background: 'radial-gradient(closest-side,#ffe3cd, transparent 70%)' }}
        />
        <div className="pointer-events-none absolute -left-24 top-40 h-[300px] w-[300px] rounded-full" style={{ background: 'radial-gradient(closest-side,#e7d8ff, transparent 72%)' }} />

        <div className="relative mx-auto max-w-5xl px-5 pt-9 sm:px-8 sm:pt-12">
          <div className="grid items-center gap-4 sm:grid-cols-[1.02fr_0.98fr] sm:gap-8 lg:gap-12">
            <div className="animate-rise">
              <span className="t-chip !py-1.5 !text-[13px]" style={{ color: '#7c59cf' }}>
                <span aria-hidden="true">✦</span> 오늘도 별이 반짝이는 중
              </span>
              <h1 className="t-display mt-4 text-[27px] leading-[1.45] text-[#4d3a6d] sm:text-[40px] lg:text-[44px]">
                오늘 너의 별이
                <br />
                살짝 신호를 보내고 있어
                <span className="ml-1 align-middle text-[19px]" style={{ color: '#f0b968' }} aria-hidden="true">
                  ✦
                </span>
              </h1>
              <p className="mt-3 max-w-[330px] text-[15px] leading-[1.9] text-[#7c6a99] sm:text-[16px]">
                별빛 가디언이 읽어주는
                <br />
                나만의 사용설명서
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <a href="#chart" className="t-btn t-btn-primary px-5 py-3 text-[14px]">
                  내 별지도 열기
                  <span aria-hidden="true">→</span>
                </a>
                <button onClick={onSample} className="t-btn t-btn-ghost px-4 py-3 text-[13.5px]">
                  예시 먼저 보기
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-[#9a86b6]">
                <span>✧ 12개 별방</span>
                <span>✧ 14주성</span>
                <span>✧ 커피 한 잔 값 3,900원부터</span>
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
                  오늘의 행운은 <b className="font-semibold text-[#6b4fa0]">네 선택을 빛나게</b> 해 줄 거야.
                </p>
              </div>
            </div>
          </div>

          {/* 오늘의 운세 미리보기 */}
          <div className="t-card relative mt-6 p-5 animate-rise [animation-delay:180ms] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12.5px] tracking-[0.18em] text-[#75628f]">TODAY · 오늘의 별빛</p>
                <h2 className="t-display mt-1.5 text-[19px] leading-snug text-[#4d3a6d]">
                  <span aria-hidden="true">🌟</span> 작은 선택이 큰 변화를 가져와
                </h2>
                <p className="mt-2 text-[13.5px] leading-[1.8] text-[#6a5788]">
                  새로운 시도를 두려워하지 마.
                  <br />
                  네 직감이 좋은 길로 이끌어 줄 거야.
                </p>
              </div>
              <LuckRing score={78} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-1.5 border-t pt-3" style={{ borderColor: 'rgba(146,116,192,0.12)' }}>
              {[
                { glyph: '✦', color: '#e58aa6', label: '연애의 별', value: 80 },
                { glyph: '✦', color: '#d9a441', label: '금전의 별', value: 70 },
                { glyph: '✦', color: '#7b8fd6', label: '일의 별', value: 75 },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <span className="text-[15px]" style={{ color: s.color }} aria-hidden="true">
                    {s.glyph}
                  </span>
                  <p className="mt-0.5 text-[12.5px] text-[#907da9]">{s.label}</p>
                  <p className="num text-[14px] font-semibold text-[#6b4fa0]">{s.value}%</p>
                </div>
              ))}
            </div>

            <p className="mt-3 rounded-xl px-3 py-2 text-[13px] leading-relaxed text-[#6a5788]" style={{ background: 'rgba(237,227,255,0.6)' }}>
              ✧ 위 숫자는 예시야. 생년월일을 알려주면 <b className="text-[#6b4fa0]">너의 별로 다시 계산</b>해 줄게!
            </p>
          </div>
        </div>
      </section>

      {/* 하온 · 별빛 고양이 — 안내 비주얼 */}
      <section id="haon" className="mx-auto mt-12 max-w-5xl scroll-mt-20 px-5 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.66fr_1.34fr] lg:items-center lg:gap-8">
          <div>
            <SectionLabel index="✧">YOUR READER</SectionLabel>
            <h2 className="t-display mt-3 text-[23px] leading-[1.5] text-[#4d3a6d]">
              별을 읽는 사람,
              <br />
              <span className="text-[#8f6fe0]">하온</span>과 별빛 고양이
            </h2>
            <p className="mt-3 text-[14px] leading-[1.9] text-[#6a5788]">
              하온은 밤하늘을 읽는 사람이야. 곁에는 늘 순백의 고양이가 앉아 있어 — 왼쪽 눈은 사파이어,
              오른쪽 눈은 보랏빛. 털결에 별자리 무늬가 섞인 아이야.
            </p>
            <p className="mt-2 text-[14px] leading-[1.9] text-[#6a5788]">
              생일을 적으면 하온이 네 별자리부터 읽어. 고양이는 그 옆에서 먼저 고개를 끄덕여.
            </p>
          </div>

          <div className="mt-1 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:mt-0 sm:grid sm:grid-cols-3 sm:gap-3.5 sm:overflow-visible">
            {THEME_ART.character.scenes.map((s) => {
              const caption = SCENE_COPY[s.id] ?? { title: '', line: '' };
              return (
                <figure key={s.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
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

        <div className="mt-4 flex items-center gap-2.5 rounded-2xl px-4 py-3" style={{ background: 'rgba(237,227,255,0.62)', border: '1px dashed rgba(146,116,192,0.28)' }}>
          <span className="guardian-avatar h-8 w-8 shrink-0">
            <img src={THEME_ART.character.avatar} alt="" className="h-full w-full object-cover" />
          </span>
          <p className="text-[13px] leading-[1.75] text-[#5b4382]">
            “어제는 고양이가 먼저 너를 알아보더라.” <span className="text-[#8f6fe0]">— 하온</span>
          </p>
        </div>
      </section>
      <section id="collection" className="mx-auto mt-12 max-w-5xl scroll-mt-20 px-5 sm:px-8">
        <div className="flex items-end justify-between">
          <div>
            <SectionLabel index="✧">STAR COLLECTION</SectionLabel>
            <h2 className="t-display mt-3 text-[23px] text-[#4d3a6d]">나의 별 컬렉션</h2>
          </div>
          <span className="hidden text-[13px] text-[#75628f] sm:block">별지도를 열면 하나씩 모을 수 있어</span>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-3">
          {[
            { name: '설렘의 별', gain: '연애의 별 +10%', glyph: '★', color: '#ffb3c7', bg: 'linear-gradient(180deg,#fff0f5,#ffe3ec)', tag: 'NEW' },
            { name: '용기의 별', gain: '일의 별 +10%', glyph: '★', color: '#8fb6ff', bg: 'linear-gradient(180deg,#eff5ff,#e3edff)' },
            { name: '직관의 별', gain: '세 별 고르게 +3%', glyph: '★', color: '#b395f5', bg: 'linear-gradient(180deg,#f6efff,#ece2ff)', tag: '3' },
            { name: '풍요의 별', gain: '금전의 별 +10%', glyph: '★', color: '#f0c16a', bg: 'linear-gradient(180deg,#fff9ec,#fff2d9)', tag: '2' },
            { name: '평온의 별', gain: '일의 별 +5%', glyph: '★', color: '#7fd4b8', bg: 'linear-gradient(180deg,#effcf7,#e2f7ef)', tag: '1' },
          ].map((b) => (
            <div key={b.name} className="star-badge relative" style={{ background: b.bg }}>
              {b.tag && (
                <span
                  className="absolute right-1.5 top-1.5 rounded-full px-1.5 text-[12px] font-semibold text-white"
                  style={{ background: b.tag === 'NEW' ? '#ff94b4' : 'rgba(146,116,192,0.55)' }}
                >
                  {b.tag}
                </span>
              )}
              <span className="star-badge__glyph" style={{ color: b.color }} aria-hidden="true">
                {b.glyph}
              </span>
              <span className="star-badge__name !text-[12.5px] sm:!text-[13px]">{b.name}</span>
              <span className="star-badge__gain hidden sm:block">{b.gain}</span>
            </div>
          ))}
        </div>

        <a
          href="#chart"
          className="mt-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
          style={{ background: 'linear-gradient(120deg,#fff2e8,#f3e9ff)', border: '1px dashed rgba(255,150,120,0.5)' }}
        >
          <span className="text-[13.5px] text-[#7c59cf]">
            ☕ <b className="font-semibold">커피 한 잔 값 {CHARACTER_FIRST_PRICE.toLocaleString('ko-KR')}원</b>으로 내 별 이야기
            시작하기
          </span>
          <span className="text-[15px] text-[#b07ac9]" aria-hidden="true">
            →
          </span>
        </a>
      </section>

      {/* 입력 */}
      <section id="chart" className="mx-auto mt-12 max-w-5xl scroll-mt-20 px-5 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <SectionLabel index="✧">YOUR STARS</SectionLabel>
            <h2 className="t-display mt-3 text-[23px] leading-[1.5] text-[#4d3a6d]">
              별은 이미 떠 있어.
              <br />
              <span className="text-[#8f6fe0]">네가 태어난 순간</span>만 알려줘.
            </h2>
            <p className="mt-3 max-w-[320px] text-[14px] leading-[1.9] text-[#6a5788]">
              양력·음력, 윤달, 태어난 시간까지 보정해서 그려. 시간을 몰라도 괜찮아 — 정오 기준으로 별을 놓아줄게.
            </p>
            <div className="mt-5 space-y-2.5">
              {['수호별과 성격의 결', '12개 별방 이야기', '올해 조심할 별방 하나'].map((t, i) => (
                <p key={t} className="flex items-center gap-2 text-[13.5px] text-[#7c6a99]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-[12px]" style={{ background: 'rgba(143,111,224,0.12)', color: '#7c59cf' }}>
                    {i + 1}
                  </span>
                  {t}
                </p>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <BirthForm onSubmit={onSubmit} onSample={onSample} draftRef={draftRef} />
          </div>
        </div>
      </section>

      {/* 2027 정미년 신년 부적 — 무료 퍼널 입구 */}
      <section className="mx-auto mt-12 max-w-5xl px-5 sm:px-8">
        <NewYearBanner onStart={onNewYear} />
      </section>

      {/* REPORTS */}
      <section id="reports" className="mx-auto mt-14 max-w-5xl scroll-mt-20 px-5 sm:px-8">
        <SectionLabel index="✧">STORY BOOKS</SectionLabel>
        <h2 className="t-display mt-3 text-[23px] text-[#4d3a6d]">
          {ZIWEI_ONLY ? '별 이야기 세 권' : '별 이야기 다섯 권'}
        </h2>
        <p className="mt-2 max-w-[360px] text-[14px] leading-[1.9] text-[#6a5788]">
          {ZIWEI_ONLY ? '동양 전통 자미두수 세 권. ' : '동양 자미두수 세 권, 서양 점성술 두 권. '}첫 이야기는{' '}
          <b className="font-semibold text-[#7c59cf]">커피 한 잔 값({CHARACTER_FIRST_PRICE.toLocaleString('ko-KR')}원)</b>이야.
          가볍게 시작하고, 더 궁금할 때만 다음 책을 펼쳐.
        </p>
        <p className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full px-3 py-1.5 text-[13px] text-[#6a5788]" style={{ background: 'rgba(237,227,255,0.7)' }}>
          <span aria-hidden="true">✧</span>
          모든 별 이야기 정가 대비{' '}
          <b className="font-semibold text-[#7c59cf]">
            {Math.min(...shownRates)}~{Math.max(...shownRates)}%
          </b>{' '}
          할인 · 결제 전에 <b className="font-semibold text-[#7c59cf]">무료로 30%</b> 먼저 읽어
        </p>

        <div className="mt-5 space-y-6">
          {reportGroups.map((group) => (
            <div key={group.label || 'all'}>
              {group.label && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#5b4382]">{group.label}</span>
                  <span className="h-px flex-1" style={{ background: 'rgba(146,116,192,0.22)' }} />
                </div>
              )}
              <div className={`mt-2.5 grid gap-3.5 sm:grid-cols-3`}>
          {group.items.map((p) => (
            <div
              key={p.id}
              className="relative flex flex-col p-5"
              style={
                p.recommended
                  ? { borderRadius: '26px', background: 'linear-gradient(160deg,#6a52a6,#4a3578)', color: '#fff9ff', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 24px 44px -30px rgba(78,54,120,0.7)' }
                  : { borderRadius: '26px', background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(146,116,192,0.16)', boxShadow: '0 18px 34px -28px rgba(112,80,164,0.5)', color: '#4d3a6d' }
              }
            >
              {productBadge(p, 'character') && (
                <span
                  className="absolute -top-2.5 left-5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                  style={{ background: p.id === 'basic' ? '#ffd9c7' : '#ffe0b8', color: '#5b4382' }}
                >
                  {productBadge(p, 'character')}
                </span>
              )}
              <div className="flex items-baseline justify-between gap-2">
                <h3
                  className="t-display text-[16.5px] leading-snug"
                  style={{ color: p.recommended ? '#ffffff' : undefined }}
                >
                  {p.name}
                </h3>
                <span className="text-[12px]" style={{ color: p.recommended ? 'rgba(255,249,255,0.72)' : '#8f81a8' }}>
                  {p.hanja}
                </span>
              </div>
              <p className="mt-1.5 text-[13px]" style={{ color: p.recommended ? 'rgba(255,249,255,0.88)' : '#6a5788' }}>
                {productTagline(p, 'character')}
              </p>
              <div className="mt-4">
                <PriceTag product={p} variant="card" onDark={!!p.recommended} />
              </div>
              {p.id === 'basic' && !ZIWEI_ONLY && (
                <p className="mt-1 text-[12.5px] text-[#b07ac9]">☕ 커피 한 잔 값, 부담 없이 시작해</p>
              )}
              <ul className="mt-3 flex-1 space-y-1.5 text-[13px] leading-relaxed" style={{ color: p.recommended ? 'rgba(255,249,255,0.82)' : '#7c6a99' }}>
                {productPoints(p, 'character').slice(0, 3).map((pt) => (
                  <li key={pt} className="flex gap-1.5">
                    <span style={{ color: p.recommended ? '#ffd9b8' : '#b395f5' }}>✧</span>
                    {pt}
                  </li>
                ))}
              </ul>
              {productScopeShort(p, 'character') && (
                <p
                  className="mt-2 text-[12.5px] leading-[1.65]"
                  style={{ color: p.recommended ? 'rgba(255,249,255,0.8)' : '#75628f' }}
                >
                  {productScopeShort(p, 'character')}
                </p>
              )}
              <button
                onClick={() => onProduct(p.id)}
                className={`t-btn mt-4 w-full py-2.5 text-[13.5px] ${p.recommended ? 't-btn-gold' : 't-btn-soft'}`}
              >
                {productCta(p, 'character')}
              </button>
            </div>
          ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[13px] text-[#75628f]">
          1회 결제 · 언제든 다시 보기 · 별지도는 서버에 저장하지 않아
        </p>
        {!ZIWEI_ONLY && (
          <div className="mt-3 rounded-2xl px-4 py-3 text-center" style={{ background: 'rgba(255,255,255,0.7)', border: '1px dashed rgba(146,116,192,0.25)' }}>
            <p className="text-[13px] leading-[1.8] text-[#6a5788]">
              곧 · <b className="text-[#7c59cf]">매달 1일 월간 별빛 편지</b>(구독)가 열려. 서양 별자리까지 함께 읽는{' '}
              <b className="text-[#7c59cf]">통합 리포트</b>는 위에서 바로 결제할 수 있어.
            </p>
          </div>
        )}
        {ZIWEI_ONLY && (
          <p className="mt-3 text-center text-[13px] text-[#75628f]">곧 · 매달 1일 별빛 편지(구독)가 열려.</p>
        )}
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-12 max-w-5xl px-5 sm:px-8">
        <div className="t-card p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <StarMark className="h-3 w-3" />
            <h2 className="t-display text-[20px] text-[#4d3a6d]">가디언에게 물어보기</h2>
          </div>
          <div className="mt-3 divide-y" style={{ borderColor: 'rgba(146,116,192,0.1)' }}>
            {[
              { q: '태어난 시간을 몰라도 돼?', a: '응! 정오(오시) 기준으로 계산하고, 수호별이 달라질 수 있다는 것도 같이 알려줄게.' },
              { q: '음력 생일인데 그대로 넣어도 돼?', a: '당연하지. 한국 음력 기준으로 양력 변환해서 그리고, 윤달도 선택할 수 있어.' },
              { q: '결제하면 뭐가 열려?', a: '커피 한 잔 값 이야기(3,900원)는 수호별·성격, 연애·배우자상, 진로·전공, 돈이 새는 장면까지 핵심만 열려. 12개 별방 전체랑 달마다 처방은 전체 별 이야기(12,900원)에서 볼 수 있어.' },
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
        </>
      )}

      {/* 사업자 정보·정책·저작권은 모든 화면 공통 푸터(LegalFooter)가 이어받습니다. */}
    </div>
  );
}
