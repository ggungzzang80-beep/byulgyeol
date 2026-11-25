import { useState } from 'react';
import type { ChartModel } from '../lib/chart';
import { GOODS_CHECKOUT_ENABLED } from '../config/env';
import { amuletShareText, build2027 } from '../lib/newyear2027';
import { downloadAmulet, renderAmulet2027 } from '../lib/amuletCard';
import { findProduct, productPrice, productUnlockCta } from '../lib/products';
import { useTheme, THEME_ART } from '../lib/theme';
import { mutagenLight, roomOf } from '../lib/friendly';
import { amuletPalette } from '../lib/amuletArt';
import {
  AMULET_LOCK_THEMES,
  amuletLockTheme,
  amuletLockThemeFor,
  type AmuletLockThemeId,
} from '../lib/amuletLockscreen';
import AmuletCard2027 from './AmuletCard2027';
import FreeOpenMeter from './FreeOpenMeter';
import StoneGoods2027 from './StoneGoods2027';
import { ArrowIcon, LockIcon, SectionLabel } from './ui';

type Props = {
  chart: ChartModel;
  /** 2027 정밀 리포트를 이미 연 상태 */
  unlocked: boolean;
  onUnlock: () => void;
};

export default function NewYear2027({ chart, unlocked, onUnlock }: Props) {
  const { theme, copy } = useTheme();
  const isCharacter = theme === 'character';
  const content = build2027(chart, theme);
  const palette = amuletPalette(theme, chart.primaryStar);
  const price = productPrice(findProduct('newyear2027'), theme);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  /* 부적 배경 — 수호별에 맞는 장면을 기본으로 고르고, 원하면 직접 바꿀 수 있습니다. */
  const autoTheme = amuletLockThemeFor(chart.primaryStar, chart.fiveElements);
  const [artThemeId, setArtThemeId] = useState<AmuletLockThemeId>(autoTheme.id);
  const artTheme = amuletLockTheme(artThemeId);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  const saveCard = async () => {
    setSaving(true);
    try {
      const url = await renderAmulet2027(chart, content, theme, artTheme);
      downloadAmulet(
        url,
        `${isCharacter ? '별의속삭임' : '자미원'}_2027정미년_부적_${chart.primaryStar}.png`,
      );
      flash(
        isCharacter
          ? '2027 부적 카드를 저장했어요! (1080×1920 · 폰 잠금화면 비율)'
          : '2027 부적 카드를 저장했습니다. (1080×1620)',
      );
    } catch {
      flash(isCharacter ? '카드를 저장하지 못했어요. 한 번만 다시 해 볼게요.' : '카드 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const share = async () => {
    const text = amuletShareText(chart, content);
    try {
      if (navigator.share) {
        await navigator.share({ title: '2027 정미년 신년 부적', text });
        return;
      }
      await navigator.clipboard.writeText(text);
      flash(isCharacter ? '부적 문구를 복사했어요. 원하는 곳에 붙여넣어 주세요.' : '부적 문구를 복사했습니다.');
    } catch {
      flash(isCharacter ? '공유를 그만두었어요.' : '공유를 취소했습니다.');
    }
  };

  const previewMonths = content.months.slice(0, 3);
  const lockedMonths = content.months.slice(3);

  return (
    <section id="newyear2027" className="mt-12 scroll-mt-24">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel index="2027">NEW YEAR · 신년 부적</SectionLabel>
        <span className="t-chip shrink-0 whitespace-nowrap !text-[13px]">무료</span>
      </div>
      <h2 className="t-display mt-3 text-[23px] leading-[1.4] sm:text-[27px]">
        {isCharacter ? (
          <>
            2027 정미년, 나를 위한 부적
            <br className="sm:hidden" /> 한 장
          </>
        ) : (
          '2027 정미년, 당신 몫의 부적 한 장'
        )}
      </h2>
      <p className="mt-2 max-w-[440px] text-[13.5px] leading-[1.85] t-muted">
        {isCharacter
          ? '수호별과 2027년의 별빛으로 그린 소장용 부적이에요. 저장해서 두고 보셔도 되고, 핵심 흐름만 먼저 볼 수도 있어요.'
          : '명궁의 주성과 2027년 유년 사화로 그린 소장용 부적입니다. 저장해 두고 보시거나, 핵심 흐름만 먼저 확인하실 수 있습니다.'}
      </p>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        {/* 부적 카드 */}
        <div>
          {isCharacter && (
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="guardian-avatar h-8 w-8 shrink-0">
                <img src={THEME_ART.character.greeting} alt="" className="h-full w-full object-cover" />
              </span>
              <p className="text-[13px] leading-[1.7] t-muted">
                <b style={{ color: 'var(--accent-deep)' }}>하온</b>이 수호별로 그린 부적이에요. 저장은 무료예요.
              </p>
            </div>
          )}
          <div className="overflow-hidden rounded-[22px]" style={{ boxShadow: palette.shadow }}>
            <AmuletCard2027 chart={chart} content={content} theme={theme} artTheme={isCharacter ? artTheme : undefined} />
          </div>

          {isCharacter && (
            <div className="mt-3 rounded-2xl px-3.5 py-3" style={{ background: 'var(--field-bg)', border: '1px solid var(--line)' }}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                <p className="text-[12.5px] font-semibold tracking-[0.1em]" style={{ color: 'var(--accent-deep)' }}>
                  부적 배경 · {artTheme.label}
                </p>
                <p className="text-[12px] t-faint">
                  {chart.primaryStar}별에 맞춰 자동으로 골랐어요
                </p>
              </div>
              <p className="mt-0.5 text-[12.5px] leading-[1.6] t-muted">{artTheme.mood}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {AMULET_LOCK_THEMES.map((t) => {
                  const on = t.id === artThemeId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setArtThemeId(t.id)}
                      aria-pressed={on}
                      className="rounded-full px-2.5 py-1 text-[12.5px] transition"
                      style={{
                        background: on ? 'var(--accent)' : 'transparent',
                        color: on ? '#fff' : 'var(--muted)',
                        border: `1px solid ${on ? 'var(--accent)' : 'var(--line-strong)'}`,
                      }}
                    >
                      {t.label}
                      {t.id === autoTheme.id ? ' ✧' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-2.5 flex flex-wrap gap-2">
            <button onClick={saveCard} disabled={saving} className="t-btn t-btn-primary !px-4 !py-2.5 text-[13.5px]">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M12 4v11M7.5 11L12 15.5 16.5 11M5 19h14" />
              </svg>
              {saving ? (isCharacter ? '그리는 중…' : '만드는 중…') : '부적 저장'}
            </button>
            <button onClick={share} className="t-btn t-btn-soft !px-4 !py-2.5 text-[13.5px]">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="17.5" cy="6" r="2.5" />
                <circle cx="6.5" cy="12" r="2.5" />
                <circle cx="17.5" cy="18" r="2.5" />
                <path d="M8.7 10.9l6.6-3.6M8.7 13.1l6.6 3.6" />
              </svg>
              {copy.chart.share}
            </button>
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.7] t-faint">{content.note}</p>
        </div>

        {/* 30% 프리뷰 → 정밀 리포트 */}
        <div className="t-panel p-6">
          <div className="t-starfield opacity-30" />
          <div className="relative">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12.5px] tracking-[0.2em] t-panel-accent">2027 FLOW · 핵심 흐름</p>
              <span className="text-[12.5px]" style={{ color: 'var(--panel-faint)' }}>
                무료 부적 + 미리보기
              </span>
            </div>

            <div className="mt-3">
              <FreeOpenMeter
                freePercent={30}
                openItems={['2027 네 별방과 별빛 네 개', '연애·금전·일 별빛 지수', '1~3월 흐름', '무료 신년 부적 카드']}
                lockedItems={
                  isCharacter
                    ? ['4~12월 아홉 달의 문', '부족한 기운과 보완 습관 셋', '달마다 먼저 할 일', '2027 지수 상세']
                    : ['4~12월 아홉 달의 문', '부족한 기운과 보완 습관 셋', '수호 원석 처방', '월별로 할 일 한 줄']
                }
                volume="한 번 결제로 열두 달 전체가 열려"
                product={findProduct('newyear2027')}
              />
            </div>

            <p className="t-panel-title mt-3 text-[19px] leading-[1.6]">{content.headline}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full px-2.5 py-1 text-[12.5px]" style={{ border: '1px solid var(--panel-rule)', color: 'var(--panel-muted)' }}>
                {isCharacter ? '올해 흐름' : '유년 명궁'} {isCharacter ? roomOf(content.stage.palace) : content.stage.palace}
              </span>
              <span className="rounded-full px-2.5 py-1 text-[12.5px]" style={{ border: '1px solid var(--panel-rule)', color: 'var(--panel-muted)' }}>
                {isCharacter ? `${content.age}세` : `${content.age}세 · ${content.yearElement}의 해`}
              </span>
              {content.mutagen.slice(0, 2).map((m) => (
                <span key={m.mutagen} className="rounded-full px-2.5 py-1 text-[12.5px]" style={{ border: '1px solid var(--panel-line)', color: 'var(--panel-accent)' }}>
                  {isCharacter ? `${m.star} · ${mutagenLight(m.mutagen)}` : `${m.mutagen} ${m.star}`}
                </span>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl px-3 py-3.5" style={{ background: 'rgba(9,8,18,0.28)', border: '1px solid var(--panel-rule)' }}>
              {[
                { label: isCharacter ? '연애의 별' : '연애', value: content.scores.love },
                { label: isCharacter ? '금전의 별' : '금전', value: content.scores.money },
                { label: isCharacter ? '일의 별' : '일', value: content.scores.work },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="num text-[23px] font-bold leading-none" style={{ color: 'var(--panel-accent)' }}>
                    {s.value}
                  </p>
                  <p className="mt-1.5 text-[13px] t-panel-body">{s.label}</p>
                  <div className="mx-auto mt-2 h-[3px] w-[72%] overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.16)' }}>
                    <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: 'var(--panel-accent)' }} />
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[13.5px] leading-[1.85] t-panel-body">{content.flow.free}</p>
            <p className="mt-1.5 select-none text-[13.5px] leading-[1.85] blur-[4px]" style={{ color: 'var(--panel-faint)' }} aria-hidden="true">
              {content.flow.locked}
            </p>

            {/* 열두 달 중 앞 세 달만 공개 */}
            <div className="mt-4 space-y-1.5">
              {previewMonths.map((m) => (
                <div key={m.month} className="rounded-xl px-3 py-2.5" style={{ border: '1px solid var(--panel-rule)', background: 'rgba(9,8,18,0.22)' }}>
                  <div className="flex items-center gap-2">
                    <span className="num text-[12.5px] tracking-[0.08em] t-panel-accent">{String(m.month).padStart(2, '0')}월</span>
                    <span className="text-[13.5px] t-panel-title">{m.title}</span>
                  </div>
                  <p className="mt-1 text-[13px] leading-[1.7] t-panel-body">{m.body}</p>
                </div>
              ))}
              <div className="rounded-xl px-3 py-2.5" style={{ border: '1px dashed var(--panel-rule)' }}>
                <div className="flex items-center gap-2">
                  <LockIcon className="h-3 w-3 t-panel-faint" />
                  <span className="text-[13px] t-panel-faint">04월 — 12월 · 아홉 달의 문은 리포트에서 열려</span>
                </div>
                <p className="mt-1 select-none text-[13px] leading-[1.7] blur-[4px] t-panel-faint" aria-hidden="true">
                  {lockedMonths.map((m) => m.title).join(' · ')}
                </p>
              </div>
            </div>

            <button onClick={onUnlock} className="t-btn t-btn-gold mt-4 w-full py-3 text-[14.5px]">
              {unlocked ? (
                <>
                  2027 정밀 리포트 다시 보기
                  <ArrowIcon className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <LockIcon className="h-3.5 w-3.5" />
                  {isCharacter
                    ? `${price.toLocaleString('ko-KR')}원으로 2027 열두 달 열기`
                    : `2027 정밀 운세 리포트 ${price.toLocaleString('ko-KR')}원`}                </>
              )}
            </button>
            <p className="mt-2 text-[12.5px] leading-[1.7] t-panel-faint">
              {isCharacter
                ? '열두 달 흐름과 달마다 할 일, 부족한 기운을 채우는 습관까지 한 번에 이어져.'
                : '열두 달 흐름, 달마다 할 일, 부족한 기운의 보완 처방까지 이어집니다.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2026-11-25 @kooleumi8 피드백 2번: 별의 속삭임에서는 '준비 중' 굿즈·원석 진열을 감춥니다.
          (자미원 미스틱 테마는 그대로 유지) */}
      {GOODS_CHECKOUT_ENABLED && !isCharacter && (
        <div className="mt-8">
          <StoneGoods2027 goods={content.goods} needLabel={content.needLabel} stoneName={content.stone.name} />
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-16 left-1/2 z-40 -translate-x-1/2 animate-rise whitespace-nowrap rounded-full px-5 py-3 text-[13.5px] shadow-lg"
          style={{ background: 'var(--panel-bg)', color: 'var(--panel-text)', border: '1px solid var(--panel-line)' }}
        >
          {toast}
        </div>
      )}
    </section>
  );
}
