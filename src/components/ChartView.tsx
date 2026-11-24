import { useEffect, useState, type CSSProperties } from 'react';
import type { ChartModel, PalaceView } from '../lib/chart';
import { buildTeaser, deepProfileOf, palaceScore, profileOf } from '../lib/content';
import {
  CHARACTER_FIRST_PRICE,
  WESTERN_PRODUCTS,
  ZIWEI_PRODUCTS,
  findProduct,
  productBadge,
  productPoints,
  productPrice,
  productScopeShort,
  productShortCta,
  productTagline,
  productUnlockCta,
  type ProductId,
} from '../lib/products';
import type { SystemId } from '../lib/systems';
import { MUTAGEN_HINT, STAR_HANJA } from '../lib/terms';
import { THEME_ART, useTheme } from '../lib/theme';
import { guardianRecommendation } from '../lib/guardianGoods';
import { downloadDataUrl, renderShareCard } from '../lib/shareCard';
import { starGlowStyle, starGuardian, starVisual } from '../lib/starPalette';
import StarEmblem from './StarEmblem';
import ChartBoard from './ChartBoard';
import PalaceDetail from './PalaceDetail';
import SystemTabs from './SystemTabs';
import NewYear2027 from './NewYear2027';
import FreeOpenMeter from './FreeOpenMeter';
import PriceTag from './PriceTag';
import Wizard from './Wizard';
import { ArrowIcon, LockIcon, SectionLabel, StarMark } from './ui';
import { ZIWEI_ONLY } from '../config/env';

type Props = {
  chart: ChartModel;
  system: SystemId;
  onSystemChange: (system: SystemId) => void;
  onReset: () => void;
  onUnlock: (id: ProductId) => void;
  onAiReport: () => void;
  /** 궁합 무료 점수 프리뷰 열기 */
  onCompatPreview: () => void;
  /** 2027 신년 정밀 리포트를 이미 연 상태 */
  newYearUnlocked: boolean;
  /** 랜딩의 2027 부적 버튼으로 들어온 경우 부적 단계로 이동 */
  focusNewYear?: boolean;
  onFocusNewYearHandled?: () => void;
  /** 마법사 단계 (0 수호별 · 1 12개 별방 · 2 올해의 흐름 · 3 2027 부적 · 4 별 이야기) */
  step: number;
  onStep: (step: number) => void;
};

/** 단계 머리의 장면 일러스트 — 좁은 화면은 장면을 채우고, 넓은 화면은 좌우를 흐리게 깔아 잘리지 않게 */
function StepArt({ src, alt, caption, position }: { src: string; alt: string; caption: string; position: string }) {
  return (
    <div className="wizard-art mb-4" style={{ height: 176 }}>
      <div className="wizard-art__blur" style={{ backgroundImage: `url(${src})` }} aria-hidden="true" />
      <img src={src} alt={alt} style={{ objectPosition: position }} loading="lazy" />
      <p className="wizard-art__caption">{caption}</p>
    </div>
  );
}

/** 결과 마법사 단계 — 랜딩에서 이어지는 흐름의 2부 */
const RESULT_STEPS = [
  { id: 'soul', label: '수호별' },
  { id: 'board', label: '12개 별방' },
  { id: 'year', label: '올해의 흐름' },
  { id: 'amulet', label: '2027 부적' },
  { id: 'books', label: '별 이야기' },
];

export default function ChartView({
  chart,
  system,
  onSystemChange,
  onReset,
  onUnlock,
  onAiReport,
  onCompatPreview,
  newYearUnlocked,
  focusNewYear = false,
  onFocusNewYearHandled,
  step,
  onStep,
}: Props) {
  const { theme, copy } = useTheme();
  const isCharacter = theme === 'character';
  const [selected, setSelected] = useState<PalaceView>(chart.soulPalace);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [teaserPulse, setTeaserPulse] = useState(false);

  const tone = isCharacter ? 'casual' : 'formal';
  const profile = profileOf(chart.primaryStar, tone);
  const deep = deepProfileOf(chart.primaryStar, tone);
  const guardian = guardianRecommendation(chart, theme);
  const guardianArt = starGuardian(chart.primaryStar);
  const teaser = buildTeaser(chart, tone);

  const pick = (name: string) => palaceScore(chart.palaces.find((p) => p.name === name));
  const moneyScore = pick('재백궁');
  const loveScore = pick('부처궁');
  const workScore = pick('관록궁');

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  /* 랜딩의 2027 부적 버튼으로 넘어온 경우 — 부적 단계로 */
  useEffect(() => {
    if (!focusNewYear) return;
    onStep(3);
    onFocusNewYearHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNewYear]);

  const jumpToNewYear = () => onStep(3);

  /** '살짝 엿보기' → 같은 단계 안의 미리보기 블록으로 이동 + 잠깐 하이라이트 */
  const revealTeaser = () => {
    onStep(2);
    setTeaserPulse(true);
    window.setTimeout(() => {
      document.getElementById('teaser')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    window.setTimeout(() => setTeaserPulse(false), 2400);
  };

  const saveImage = async () => {
    setSaving(true);
    try {
      const url = await renderShareCard(chart, theme);
      downloadDataUrl(
        url,
        isCharacter ? `별의속삭임_${chart.primaryStar}별_별지도.png` : `자미원_${chart.primaryStar}성_명반.png`,
      );
      flash(copy.chart.toastSaved);
    } catch {
      flash(copy.chart.toastSaveFail);
    } finally {
      setSaving(false);
    }
  };

  const share = async () => {
    const text = `${chart.name ? chart.name + ' 님의 ' : ''}명궁은 ${chart.primaryStar}성 — "${profile.identity}"\n#${profile.keywords.join(' #')}\n\n${copy.chart.shareTagline}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: copy.chart.shareTitle, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      flash(copy.chart.toastCopied);
    } catch {
      flash(copy.chart.toastCancel);
    }
  };

  /* ---------------------------------------------------------------- 단계 1 */
  const SoulStep = (
    <section>
      <SectionLabel index="01">{copy.chart.soulSection}</SectionLabel>

      {isCharacter && (
        <div className="mt-3">
          <StepArt
            src={THEME_ART.character.greeting}
            alt="하온과 오드아이 별빛 고양이"
            position="center 68%"
            caption="하온과 별빛 고양이가 네 명궁의 별을 읽었어. 먼저 수호별부터."
          />
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
        {/* 왼쪽: 주성 정체성 */}
        <div className="t-panel p-6 sm:p-8">
          {isCharacter ? (
            <>
              <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full" style={starGlowStyle(chart.primaryStar)} />
              <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full opacity-40" style={starGlowStyle(chart.primaryStar)} />
              <StarEmblem
                star={chart.primaryStar}
                className="pointer-events-none absolute -right-4 top-20 h-40 w-40 sm:h-48 sm:w-48"
                color="var(--panel-accent)"
                opacity={0.13}
              />
              <div className="t-starfield opacity-40" />
            </>
          ) : (
            <>
              <div className="t-starfield opacity-60" />
              <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(143,111,224,0.45), transparent 70%)' }} />
              <div className="t-orbit" style={{ width: 260, height: 260, right: -70, bottom: -90 }} />
            </>
          )}

          <div className="relative">
            <p className="text-[13.5px] tracking-[0.2em] t-panel-accent">동양 전통 자미두수 · 12궁 명반</p>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <StarMark className="h-3 w-3" />
                <span className="text-[12.5px] tracking-[0.24em] t-panel-accent">{copy.chart.soulLabel}</span>
              </div>
              <span className="t-panel-accent font-[inherit] text-[14px] opacity-70">{STAR_HANJA[chart.primaryStar] ?? ''}</span>
            </div>

            {isCharacter && (
              <div className="mt-4 flex items-end gap-2">
                <span className="guardian-avatar h-10 w-10 shrink-0">
                  <img src={guardianArt.image} alt={`${chart.primaryStar}별 가디언 ${guardianArt.name}`} className="h-full w-full object-cover" />
                </span>
                <p className="flex-1 rounded-2xl rounded-bl-md px-3 py-2 text-[13px] leading-[1.65]" style={{ background: 'rgba(255,255,255,0.92)', color: '#5b4382' }}>
                  {copy.chart.soulBubble(chart.primaryStar)}
                </p>
              </div>
            )}

            <h2 className="t-panel-title mt-4 text-[44px] leading-none sm:text-[56px]">
              {chart.primaryStar}
              <span className="ml-1 text-[24px] font-light opacity-70 sm:text-[28px]">{isCharacter ? '별' : '성'}</span>
            </h2>

            {isCharacter && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[14px]" style={{ border: '1px solid var(--panel-rule)', color: 'var(--panel-accent)' }}>
                <StarEmblem star={chart.primaryStar} className="h-3.5 w-3.5" color="currentColor" opacity={0.9} />
                {starVisual(chart.primaryStar).mood}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] t-panel-body">
              {chart.primaryBrightness && <span>밝기 {chart.primaryBrightness}</span>}
              {chart.primaryMutagen && (
                <span className="rounded-full px-2 py-0.5" style={{ background: 'rgba(255,255,255,0.14)', color: 'var(--panel-accent)' }}>
                  {chart.primaryMutagen}
                </span>
              )}
              <span className="opacity-40">·</span>
              <span>{chart.fiveElements}</span>
              <span className="opacity-40">·</span>
              <span>{chart.zodiac}띠</span>
              {chart.borrowedFrom && <span className="opacity-60">· {chart.borrowedFrom}에서 빌려온 주성</span>}
            </div>
            <p className="num mt-1.5 text-[13px] t-panel-faint">
              {chart.solarText} {chart.timeText}
            </p>
            {(!chart.timeKnown || chart.note) && (
              <p className="mt-1 text-[12.5px] leading-relaxed t-panel-faint">
                {!chart.timeKnown && '태어난 시간을 몰라 정오(오시) 기준으로 계산했습니다. '}
                {chart.note}
              </p>
            )}

            <p className="t-panel-title mt-6 text-[23px] leading-snug sm:text-[24px]">“{profile.identity}”</p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {profile.keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full px-2.5 py-1 text-[13px]"
                  style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'var(--panel-accent)' }}
                >
                  #{k}
                </span>
              ))}
            </div>

            {isCharacter && (
              <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl px-3 py-4" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--panel-rule)' }}>
                {[
                  { label: '연애의 별', value: loveScore },
                  { label: '금전의 별', value: moneyScore },
                  { label: '일의 별', value: workScore },
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
            )}

            <div className="mt-6 grid gap-4 pt-5 sm:grid-cols-2" style={{ borderTop: '1px solid var(--panel-rule)' }}>
              <div>
                <p className="text-[12.5px] tracking-[0.18em] t-panel-accent">{copy.chart.strength}</p>
                <p className="mt-1.5 text-[14px] leading-[1.8] t-panel-body">{profile.strength}</p>
              </div>
              <div>
                <p className="text-[12.5px] tracking-[0.18em] t-panel-accent">{copy.chart.caution}</p>
                <p className="mt-1.5 text-[14px] leading-[1.8] t-panel-faint">{profile.caution}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={saveImage}
                disabled={saving}
                className="t-btn !px-4 !py-2.5 text-[13.5px]"
                style={{ background: 'var(--panel-text)', color: theme === 'character' ? '#4a3468' : '#14101f' }}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M12 4v11M7.5 11L12 15.5 16.5 11M5 19h14" />
                </svg>
                {saving ? copy.chart.saveBusy : copy.chart.save}
              </button>
              <button onClick={share} className="t-btn t-btn-onpanel !px-4 !py-2.5 text-[13.5px]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="17.5" cy="6" r="2.5" />
                  <circle cx="6.5" cy="12" r="2.5" />
                  <circle cx="17.5" cy="18" r="2.5" />
                  <path d="M8.7 10.9l6.6-3.6M8.7 13.1l6.6 3.6" />
                </svg>
                {copy.chart.share}
              </button>
              <button onClick={jumpToNewYear} className="t-btn t-btn-soft !px-4 !py-2.5 text-[13.5px]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M12 3.5l2.2 5.6 6 .4-4.6 3.9 1.4 5.9L12 16.2 6.9 19.3l1.4-5.9L3.8 9.5l6-.4L12 3.5z" />
                </svg>
                2027 신년 부적
              </button>
            </div>
          </div>
        </div>

        {/* 오른쪽: 수호별 가디언(캐릭터) + 올해 */}
        <div className="flex flex-col gap-4">
          {isCharacter && (
            <div className="t-card overflow-hidden" style={{ padding: 0 }}>
              <div className="relative">
                <img
                  src={guardianArt.image}
                  alt={`${chart.primaryStar}별 가디언 ${guardianArt.name}`}
                  className="h-[286px] w-full object-cover"
                  style={{ objectPosition: guardianArt.focus }}
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 52%, var(--card) 100%)' }} />
                <div className="absolute left-4 top-4 rounded-full px-2.5 py-1 text-[12px] tracking-[0.18em]" style={{ background: 'rgba(255,255,255,0.8)', color: '#6b4f92' }}>
                  GUARDIAN · 수호별
                </div>
              </div>
              <div className="relative px-5 pb-5 pt-0.5">
                <p className="text-[12.5px] tracking-[0.18em] t-faint">{chart.primaryStar}별의 가디언</p>
                <p className="t-title mt-1.5 text-[18px]">
                  {guardianArt.name}
                  <span className="ml-2 text-[13px] font-normal t-muted">· {starVisual(chart.primaryStar).mood}</span>
                </p>
                <p className="mt-1.5 text-[13.5px] leading-[1.8] t-body">{guardianArt.desc}</p>
              </div>
            </div>
          )}
          {!isCharacter && (
            <div className="t-card p-5 sm:p-6">
              <p className="text-[12.5px] tracking-[0.18em] t-faint">{copy.chart.numbersTitle}</p>

              <div className="mt-4 space-y-3.5">
                {[
                  { label: '금전', score: moneyScore },
                  { label: '연애', score: loveScore },
                  { label: '일', score: workScore },
                ].map((s, i) => (
                  <div key={s.label}>
                    <div className="flex items-end justify-between">
                      <span className="text-[14px] t-muted">{s.label}</span>
                      <span className="num text-[17px] font-semibold t-title">{s.score}</span>
                    </div>
                    <div className="mt-1.5 h-[5px] overflow-hidden rounded-full" style={{ background: 'rgba(246,238,224,0.1)' }}>
                      <div
                        className="h-full origin-left rounded-full animate-grow"
                        style={{ width: `${s.score}%`, animationDelay: `${i * 120}ms`, background: 'linear-gradient(90deg,#c19a56,#e3c07b 60%,#f4e0b6)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[13px] leading-relaxed t-faint">{copy.chart.numbersNote}</p>
            </div>
          )}

          {/* 수호 원석 티저 — 리포트 하단 굿즈 추천으로 연결 */}
          <div className="t-card p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12.5px] tracking-[0.18em] t-faint">{isCharacter ? 'GUARDIAN STONE · 수호 원석' : 'GUARDIAN STONE'}</p>
              <span className="t-chip !text-[12px]">준비 중</span>
            </div>
            <div className="mt-2.5 flex items-center gap-3">
              <span
                className="h-10 w-10 shrink-0 rounded-full"
                style={{
                  background: `radial-gradient(circle at 32% 28%, #ffffff 0%, ${guardian.colorHex} 42%, rgba(0,0,0,0.35) 100%)`,
                  boxShadow: `0 0 18px ${guardian.colorHex}55`,
                }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="t-title truncate text-[15px]">{guardian.stone}</p>
                <p className="mt-0.5 text-[13px] t-muted">
                  {guardian.weakestArea} 지수 {guardian.weakestScore} · {guardian.needElement} 기운 보완
                </p>
              </div>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed t-faint">
              {isCharacter ? '부족한 별빛을 채우는 원석·부적을 리포트 하단에서 추천해 줄게.' : '부족한 기운을 채우는 원석과 소품을 리포트 하단에서 추천합니다.'}
            </p>
            <button onClick={() => onUnlock(isCharacter ? 'basic' : 'premium')} className="t-btn t-btn-soft mt-3 w-full py-2 text-[13px]">
              {isCharacter ? '리포트에서 굿즈 추천 보기' : '리포트에서 추천 보기'}
            </button>
          </div>

          <button onClick={() => onStep(1)} className="t-btn t-btn-ghost w-full py-2.5 text-[13.5px]">
            12개 별방 보기
            <ArrowIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );

  /* ---------------------------------------------------------------- 단계 2 */
  const BoardStep = (
    <section>
      {isCharacter && (
        <StepArt
          src={THEME_ART.character.steps!.board.src}
          alt={THEME_ART.character.steps!.board.alt}
          position="center 45%"
          caption="촛불 아래 펼친 별지도 — 열두 개의 방에 앉은 별을 하나씩 눌러 봐."
        />
      )}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <SectionLabel index="02">{copy.chart.boardSection}</SectionLabel>
          <h2 className="t-display mt-3 text-[24px] sm:text-[28px]">{copy.chart.boardTitle(chart.name)}</h2>
        </div>
        <p
          className="rounded-2xl py-2.5 pl-3.5 pr-4 text-[15px] font-medium leading-[1.8] t-body sm:max-w-[360px]"
          style={{ background: 'var(--field-bg)', border: '1px solid var(--line)', borderLeft: '3px solid var(--accent)' }}
        >
          {copy.chart.boardHint}
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <ChartBoard chart={chart} selected={selected} onSelect={setSelected} />
        <div className="lg:sticky lg:top-24 lg:h-[520px]">
          <PalaceDetail palace={selected} onUnlock={() => onUnlock('premium')} />
        </div>
      </div>
    </section>
  );

  /* ---------------------------------------------------------------- 단계 3 */
  const YearStep = (
    <div>
      {isCharacter && (
        <StepArt
          src={THEME_ART.character.steps!.reading.src}
          alt={THEME_ART.character.steps!.reading.alt}
          position="center 26%"
          caption="찻잔 곁에서 올해의 별을 읽는 중 — 대한과 유년, 그리고 조심할 방 하나."
        />
      )}

      {/* 올해의 흐름 — 대한 / 유년 */}
      <section>
        <SectionLabel index="03">{isCharacter ? '올해의 별' : '올해의 흐름'}</SectionLabel>
        <div id="year-flow" className="t-card mt-3 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-[12.5px] tracking-[0.18em]" style={{ color: 'var(--accent-deep)' }}>
              {chart.yearly.year}년 · {isCharacter ? '올해의 별' : '유년'} {chart.yearly.stemBranch}
            </p>
            <span className="t-chip !text-[12.5px]">{isCharacter ? '가디언의 지도' : '무료 공개'}</span>
          </div>

          {/* 문장 겹침 수정 — 긴 문장 한 줄 대신 항목별 두 줄로 나눠 어떤 화면 폭에서도 겹치지 않습니다. */}
          <dl className="mt-3 space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 rounded-xl px-3 py-2" style={{ background: 'var(--field-bg)' }}>
              <dt className="text-[14px] leading-[1.7] t-muted">{isCharacter ? '올해의 큰 별 · 대한' : '올해 대한'}</dt>
              <dd className="num text-[15px] font-semibold leading-[1.7] t-body">
                {chart.decadal.range[0]}–{chart.decadal.range[1]}세
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 rounded-xl px-3 py-2" style={{ background: 'var(--field-bg)' }}>
              <dt className="text-[14px] leading-[1.7] t-muted">
                {chart.yearly.stemBranch}년 {isCharacter ? '네 별방' : '유년 명궁'}
              </dt>
              <dd className="text-[15px] font-semibold leading-[1.7] t-body">{chart.yearly.palaceName}</dd>
            </div>
          </dl>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {chart.yearly.mutagen.map((m) => (
              <span
                key={m.cn}
                className="t-chip !text-[13px]"
                title={m.mutagen ? MUTAGEN_HINT[m.mutagen] : undefined}
                style={m.mutagen === '화기' ? { color: theme === 'character' ? '#d97d9a' : '#d98a7a', borderColor: 'rgba(217,138,122,0.3)' } : undefined}
              >
                {m.name} {m.mutagen}
              </span>
            ))}
          </div>
          {/* 사화 한 줄 풀이 — 처음 보는 사람도 바로 이해하도록 */}
          <ul className="mt-2 space-y-0.5">
            {chart.yearly.mutagen.map((m) => (
              <li key={`hint-${m.cn}`} className="flex gap-1.5 text-[13.5px] leading-[1.6] t-muted">
                <span
                  className="shrink-0 font-semibold"
                  style={{ color: m.mutagen === '화기' ? (theme === 'character' ? '#c9688a' : '#cf7f6d') : 'var(--accent-deep)' }}
                >
                  {m.mutagen}
                </span>
                <span>— {m.mutagen ? MUTAGEN_HINT[m.mutagen] : ''}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
            <p className="text-[14px] leading-[1.75] t-muted">
              {isCharacter ? '올해 조심할 별방 하나는 아래에 이어져.' : '올해 재물·연애에서 조심할 한 가지는 아래에 이어집니다.'}
            </p>
            <button
              type="button"
              onClick={revealTeaser}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-semibold t-body transition active:scale-[0.98]"
              style={{ background: 'var(--accent-soft)', border: '1px solid var(--line-strong)' }}
            >
              {isCharacter ? '살짝 엿보기' : '맛보기 진단 보기'}
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14M6.5 13.5L12 19l5.5-5.5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* AI 심층 리포트 — 무료 결과에서 바로 연결 */}
      <section id="ai-report" className="mt-6 scroll-mt-24">
        <div className="t-panel p-6 sm:p-8">
          <div className="t-starfield opacity-40" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(227,192,123,0.25), transparent 70%)' }} />
          <div className="relative grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <p className="text-[12.5px] tracking-[0.24em] t-panel-accent">AI DEEP DIVE · 진로 · 전공 · 배우자 · 재물</p>
              <h2 className="t-panel-title mt-3 text-[23px] leading-[1.45] sm:text-[25px]">
                {isCharacter ? (
                  <>
                    진로·배우자상·돈 새는 장면까지,
                    <br />
                    여기서 한 번에 ✨
                  </>
                ) : (
                  <>
                    진로·배우자상·돈 새는 장면까지
                    <br />
                    여기서 바로 읽으세요
                  </>
                )}
              </h2>
              <p className="mt-3 text-[13.5px] leading-[1.85] t-panel-body">
                {chart.primaryStar}
                {isCharacter ? '별' : '성'} 기준으로 <b className="font-semibold" style={{ color: 'var(--panel-accent)' }}>진로·전공·직업군</b>,{' '}
                <b className="font-semibold" style={{ color: 'var(--panel-accent)' }}>끌리는 연애 타입과 배우자상</b>,{' '}
                <b className="font-semibold" style={{ color: 'var(--panel-accent)' }}>돈이 새는 구체적 장면</b>{isCharacter ? '을 핀셋으로 짚어 줄게.' : '을 핀셋으로 짚어드립니다.'}
              </p>
              {!ZIWEI_ONLY && (
                <p className="mt-2 text-[12.5px] leading-relaxed t-panel-faint">자미두수 12궁 × 서양 네이탈 차트 통합 해석도 확장 준비 중입니다.</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={onAiReport} className="t-btn t-btn-gold !px-4 !py-2.5 text-[13.5px]">
                  <LockIcon className="h-3.5 w-3.5" />
                  {isCharacter
                    ? `${CHARACTER_FIRST_PRICE.toLocaleString('ko-KR')}원으로 진로·배우자상 열기`
                    : `AI 심층 리포트 열기 · ${productPrice(findProduct('premium'), theme).toLocaleString('ko-KR')}원`}
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="rounded-2xl p-3.5" style={{ border: '1px solid var(--panel-rule)', background: 'rgba(9,8,18,0.28)' }}>
                <p className="text-[12px] tracking-[0.18em] t-panel-accent">직업군 · 전공 (무료 공개)</p>
                <p className="mt-1.5 text-[13.5px] leading-[1.7] t-panel-text" style={{ color: 'var(--panel-text)' }}>
                  {deep.careers.join(' · ')}
                </p>
                <p className="mt-1 text-[13px] t-panel-faint">전공: {deep.majors.join(' · ')}</p>
              </div>
              <div className="rounded-2xl p-3.5" style={{ border: '1px solid var(--panel-rule)', background: 'rgba(9,8,18,0.28)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] tracking-[0.18em] t-panel-accent">{isCharacter ? '배우자상 · 끌리는 타입' : '배우자상'}</p>
                  <LockIcon className="h-3 w-3 t-panel-faint" />
                </div>
                <p className="mt-1.5 select-none text-[13.5px] leading-[1.7] blur-[4px]" style={{ color: 'var(--panel-body, rgba(246,238,224,0.8))' }} aria-hidden="true">
                  {deep.spouse}
                </p>
              </div>
              <div className="rounded-2xl p-3.5" style={{ border: '1px solid var(--panel-rule)', background: 'rgba(9,8,18,0.28)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] tracking-[0.18em] t-panel-accent">{isCharacter ? '돈이 새는 장면' : '돈이 새는 구체적 상황'}</p>
                  <LockIcon className="h-3 w-3 t-panel-faint" />
                </div>
                <p className="mt-1.5 select-none text-[13.5px] leading-[1.7] blur-[4px]" style={{ color: 'var(--panel-muted)' }} aria-hidden="true">
                  {deep.moneyLeak}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 티저 */}
      <section id="teaser" className="mt-6 scroll-mt-24">
        <div
          className="t-panel p-6 transition-shadow duration-700 sm:p-9"
          style={teaserPulse ? { boxShadow: '0 0 0 4px var(--accent-soft), 0 0 0 2px var(--accent), 0 0 64px -6px var(--accent)' } : undefined}
        >
          <div className="t-starfield opacity-40" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(227,192,123,0.28), transparent 70%)' }} />
          <div className="relative">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[12.5px] tracking-[0.24em] t-panel-accent">
                  {isCharacter ? 'GUARDIAN’S NOTE · 가디언의 쪽지' : 'TEASER · 맛보기'}
                </p>
                <h2 className="t-panel-title mt-3 text-[23px] leading-[1.45] sm:text-[28px]">
                  {copy.chart.teaserTitle(teaser.year)}
                  <br />
                  <span className="opacity-55">{copy.chart.teaserSub}</span>
                </h2>
              </div>
            </div>

            <div className="mt-5">
              <FreeOpenMeter
                freePercent={30}
                openItems={[
                  isCharacter ? '수호별과 성격의 결' : '명궁 주성과 성격의 결',
                  isCharacter ? '연애·금전·일 별빛 지수' : '재물·연애·일 지수',
                  isCharacter ? '12개 별방 지도' : '12궁 명반 지도',
                  isCharacter ? '올해 조심할 별방 한 줄' : '올해 조심할 궁 한 줄',
                ]}
                lockedItems={[
                  isCharacter ? '배우자상 · 끌리는 타입' : '배우자상',
                  isCharacter ? '돈이 새는 장면' : '돈이 새는 구체적 상황',
                  isCharacter ? '12개 별방 전체 해설' : '12궁 전체 해설',
                  isCharacter ? '달마다 별 처방 12개' : '월별 액션 가이드 12개',
                ]}
                volume={isCharacter ? '한 번 결제로 12개 별방 · 달마다 처방까지 전부 열려' : '한 번 결제로 12궁 전체 · 월별 가이드까지 전부 열립니다'}
                product={findProduct('premium')}
              />
            </div>

            <div className="mt-7 grid gap-3.5 sm:grid-cols-2">
              {[
                { label: isCharacter ? '금전의 별방' : '재물', text: teaser.money, score: moneyScore },
                { label: isCharacter ? '사랑의 별방' : '연애', text: teaser.love, score: loveScore },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl p-4" style={{ border: '1px solid var(--panel-rule)', background: 'rgba(9,8,18,0.28)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] tracking-[0.16em] t-panel-accent">{item.label}</span>
                    <span className="num text-[12.5px] t-panel-faint">지수 {item.score}</span>
                  </div>
                  <p className="mt-3 text-[14.5px] leading-[1.85] t-panel-body">{item.text.split('. ')[0]}.</p>
                  <p className="mt-1 select-none text-[14.5px] leading-[1.85] blur-[4px]" style={{ color: 'var(--panel-faint)' }} aria-hidden="true">
                    {item.text.split('. ').slice(1).join('. ') || '이어지는 해석은 리포트에서 확인할 수 있습니다.'}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col items-start justify-between gap-4 pt-5 sm:flex-row sm:items-center" style={{ borderTop: '1px solid var(--panel-rule)' }}>
              <p className="text-[13.5px] leading-[1.8] t-panel-body">{copy.chart.teaserNote}</p>
              <button onClick={() => onUnlock('premium')} className="t-btn t-btn-gold shrink-0 px-5 py-3 text-[14.5px]">
                {productUnlockCta(findProduct('premium'), theme)}
                <LockIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  /* ---------------------------------------------------------------- 단계 4 */
  const AmuletStep = (
    <div>
      {isCharacter && (
        <StepArt
          src={THEME_ART.character.steps!.amulet.src}
          alt={THEME_ART.character.steps!.amulet.alt}
          position="center 34%"
          caption="붉은 실을 묶은 부적 한 장 — 하온이 네 명궁의 별로 그려 줬어."
        />
      )}
      <NewYear2027 chart={chart} unlocked={newYearUnlocked} onUnlock={() => onUnlock('newyear2027')} />
    </div>
  );

  /* ---------------------------------------------------------------- 단계 5 */
  const BooksStep = (
    <div>
      {/* 궁합 — 무료 점수 먼저, 심층 해석은 유료 */}
      <section>
        <SectionLabel index="04">{isCharacter ? '두 사람의 별' : '두 사람의 궁합'}</SectionLabel>
        <div className="t-card mt-4 p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="sm:max-w-[520px]">
              <h2 className="t-display text-[23px] leading-snug sm:text-[24px]">
                {isCharacter ? '궁합 점수는 먼저 무료로 봐 ✨' : '궁합 점수는 먼저 무료로 볼 수 있습니다'}
              </h2>
              <p className="mt-2 text-[14.5px] leading-[1.85] t-body">
                {isCharacter
                  ? '친구·연인의 생년월일만 넣으면 두 사람의 궁합 점수와 한 줄 케미를 바로 보여줄게. 구체적인 관계 해석·끌림 포인트·갈등 주의점은 심층 리포트에서 이어져.'
                  : '상대방의 생년월일만 넣으면 두 사람의 궁합 점수와 한 줄 케미를 바로 보여드립니다. 구체적인 관계 해석·끌림 포인트·갈등 주의점은 심층 리포트에서 이어집니다.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="t-chip !text-[13px]">점수 무료</span>
                <span className="t-chip !text-[13px]">한 줄 케미 요약</span>
                <span className="t-chip !text-[13px]">심층 리포트 {productPrice(findProduct('compat'), theme).toLocaleString('ko-KR')}원</span>
              </div>
            </div>
            <button onClick={onCompatPreview} className="t-btn t-btn-primary shrink-0 px-5 py-3 text-[14.5px]">
              <StarMark className="h-3.5 w-3.5" />
              무료 궁합 점수 보기
            </button>
          </div>
        </div>
      </section>

      {/* 상품 */}
      <section className="mt-10">
        <SectionLabel index="05">{ZIWEI_ONLY ? '별 이야기 3종' : copy.chart.productsSection}</SectionLabel>
        <div className="mt-4 space-y-7">
          {(ZIWEI_ONLY
            ? [{ label: '', items: ZIWEI_PRODUCTS }]
            : [
                { label: '① 동양 전통 자미두수 · 12궁 명반', items: ZIWEI_PRODUCTS },
                { label: '② 서양 점성술 · 출생 천궁도', items: WESTERN_PRODUCTS },
              ]
          ).map((group) => (
            <div key={group.label || 'all'}>
              {group.label && (
                <div className="flex items-center gap-2.5">
                  <span className="text-[13.5px] font-semibold t-body">{group.label}</span>
                  <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
                </div>
              )}
              <div className="mt-3 grid gap-3.5 lg:grid-cols-3">
                {group.items.map((p) => (
                  <div key={p.id} className="t-card flex flex-col p-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="t-title text-[18px]">{p.name}</h3>
                      {productBadge(p, theme) ? (
                        <span className="rounded-full px-2 py-0.5 text-[12px]" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>
                          {productBadge(p, theme)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[13.5px] t-muted">{productTagline(p, theme)}</p>
                    <ul className="mt-3 flex-1 space-y-1.5 text-[13.5px] leading-relaxed t-muted">
                      {productPoints(p, theme).slice(0, 3).map((pt) => (
                        <li key={pt} className="flex gap-1.5">
                          <span style={{ color: 'var(--accent)' }}>·</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                    {productScopeShort(p, theme) && <p className="mt-2 text-[12.5px] leading-[1.65] t-faint">{productScopeShort(p, theme)}</p>}
                    <div className="mt-4 flex items-end justify-between gap-2">
                      <PriceTag product={p} variant="compact" />
                      <button onClick={() => onUnlock(p.id)} className="t-btn t-btn-soft !px-3.5 !py-2 text-[13.5px]">
                        {productShortCta(p, theme)}
                        <ArrowIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 text-center text-[13px] leading-[1.9] t-faint">
        {isCharacter
          ? '자미두수는 전통 상담 문화야. 의료·법률·투자 판단의 근거가 아니고, 별지도 데이터는 서버에 저장되지 않아.'
          : '자미두수는 전통 상담 문화로, 의료·법률·투자 판단의 근거가 아닙니다. 명반 데이터는 서버에 저장되지 않습니다.'}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen pb-6" style={{ '--wizard-top': '62px' } as CSSProperties}>
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
            {/* 로고·타이틀 = 첫 홈으로 (모바일에서도 바로 보이는 홈 동선) */}
            <button
              type="button"
              onClick={onReset}
              title="첫 화면으로"
              aria-label="첫 화면으로 돌아가기"
              className="group flex min-w-0 cursor-pointer items-center gap-2 rounded-full py-1 pr-1.5 transition hover:opacity-90 active:scale-[0.985]"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 t-faint transition group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14.5 6L8.5 12l6 6" />
              </svg>
              {isCharacter ? (
                <span className="guardian-avatar h-7 w-7 shrink-0">
                  <img src={THEME_ART.character.avatar} alt="" className="h-full w-full object-cover" />
                </span>
              ) : (
                <StarMark className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="t-title min-w-0 truncate text-[18px] tracking-[0.12em] underline decoration-1 underline-offset-4 decoration-transparent transition group-hover:decoration-current">
                {copy.brand.name}
              </span>
            </button>
            <span className="hidden h-3 w-px sm:block" style={{ background: 'var(--line-strong)' }} />
            <span className="hidden truncate text-[13.5px] t-muted sm:inline">
              {chart.name ? `${chart.name} 님의 ` : ''}
              {isCharacter ? '별지도' : '명반'} · {chart.solarText} · {chart.timeText.replace(' (정오 기준)', '')}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={onReset} className="t-btn t-btn-ghost !hidden !px-3.5 !py-2 text-[13.5px] sm:!inline-flex">
              {copy.chart.reset}
            </button>
            <button onClick={() => onUnlock('premium')} className="t-btn t-btn-primary !px-3.5 !py-2 text-[13.5px]">
              {copy.chart.premium}
            </button>
          </div>
        </div>
      </div>

      {!ZIWEI_ONLY && (
        <div className="mx-auto max-w-6xl px-5 pt-4 sm:px-8">
          <SystemTabs
            system={system}
            onChange={onSystemChange}
            note="지금 보고 있는 체계: 동양 전통 자미두수 · 12궁 명반 — 탭을 누르면 서양 점성술로 바뀝니다."
          />
        </div>
      )}

      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8 sm:pt-7">
        <Wizard
          eyebrow={<span className="text-[12.5px] tracking-[0.2em] t-faint">{isCharacter ? '별지도 · 단계별로 읽기' : '명반 · 단계별로 읽기'}</span>}
          steps={[
            { id: RESULT_STEPS[0].id, label: RESULT_STEPS[0].label, body: SoulStep },
            { id: RESULT_STEPS[1].id, label: RESULT_STEPS[1].label, body: BoardStep },
            { id: RESULT_STEPS[2].id, label: RESULT_STEPS[2].label, body: YearStep },
            { id: RESULT_STEPS[3].id, label: RESULT_STEPS[3].label, body: AmuletStep },
            { id: RESULT_STEPS[4].id, label: RESULT_STEPS[4].label, body: BooksStep },
          ]}
          index={step}
          onIndexChange={onStep}
          finishLabel="수호별로"
          onFinish={() => onStep(0)}
        />
      </div>

      {toast && (
        <div
          className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 animate-rise whitespace-nowrap rounded-full px-5 py-3 text-[13.5px] shadow-lg"
          style={{ background: 'var(--panel-bg)', color: 'var(--panel-text)', border: '1px solid var(--panel-line)' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
