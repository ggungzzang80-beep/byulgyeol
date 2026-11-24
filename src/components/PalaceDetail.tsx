import type { PalaceView } from '../lib/chart';
import { MUTAGEN_HINT, MUTAGEN_MEANING, BRIGHTNESS_TEXT, TWELVE_STAGES_TEXT } from '../lib/terms';
import { palaceReadings, palaceScore, minorLine } from '../lib/content';
import { THEME_ART, useTheme } from '../lib/theme';

type Props = {
  palace: PalaceView;
  onUnlock: () => void;
};

export default function PalaceDetail({ palace, onUnlock }: Props) {
  const { theme, copy } = useTheme();
  const isCharacter = theme === 'character';
  const { headline, paragraphs, tip } = palaceReadings(palace, isCharacter ? 'casual' : 'formal');
  const score = palaceScore(palace);
  const label = isCharacter
    ? score >= 80
      ? '아주 좋아!'
      : score >= 68
        ? '좋은 편이야'
        : score >= 55
          ? '무난해'
          : score >= 42
            ? '조금 노력해 보자'
            : '살짝 조심!'
    : score >= 80
      ? '매우 좋음'
      : score >= 68
        ? '좋음'
        : score >= 55
          ? '무난'
          : score >= 42
            ? '노력 필요'
            : '주의';
  const warn = isCharacter ? '#d97d9a' : '#d98a7a';

  return (
    <div className="t-card flex h-full flex-col overflow-hidden">
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--line)', background: 'var(--field-bg)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              {isCharacter && (
                <span className="guardian-avatar h-6 w-6 shrink-0 self-center">
                  <img src={THEME_ART.character.avatar} alt="" className="h-full w-full object-cover" />
                </span>
              )}
              <h3 className="t-title text-[20px]">{palace.name}</h3>
              <span className="text-[12.5px] t-faint">{palace.hanja}</span>
            </div>
            <p className="mt-0.5 text-[13.5px] t-muted">{headline}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="num text-[21px] font-bold leading-none t-title">{score}</p>
            <p className="mt-1 text-[12.5px]" style={{ color: 'var(--accent-deep)' }}>
              {label}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="t-chip num">
            {palace.stem}
            {palace.branch}궁
          </span>
          <span className="t-chip num">
            대한 {palace.decadalRange[0]}–{palace.decadalRange[1]}세
          </span>
          <span className="t-chip">
            {palace.stage} · {TWELVE_STAGES_TEXT[palace.stage] ?? ''}
          </span>
          {palace.isBodyPalace && <span className="t-chip t-chip-solid">신궁</span>}
        </div>
      </div>

      <div className="thin-scroll flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <div>
          <p className="mb-2 text-[12.5px] font-semibold tracking-[0.18em] t-faint">주성</p>
          {palace.major.length ? (
            <div className="space-y-1.5">
              {palace.major.map((s) => (
                <div key={s.cn} className="flex flex-wrap items-baseline gap-2">
                  <span className="t-title text-[17px]">{s.name}</span>
                  {s.brightness && (
                    <span className="text-[12.5px] t-faint">
                      {s.brightness} · {BRIGHTNESS_TEXT[s.brightness] ?? ''}
                    </span>
                  )}
                  {s.mutagen && (
                    <span className="inline-flex flex-wrap items-center gap-1.5">
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[12px]"
                        style={{
                          background: s.mutagen === '화기' ? 'rgba(217,138,122,0.14)' : 'var(--accent-soft)',
                          color: s.mutagen === '화기' ? warn : 'var(--accent-deep)',
                        }}
                      >
                        {MUTAGEN_MEANING[s.mutagen]?.label ?? s.mutagen}
                      </span>
                      <span className="text-[13px] leading-[1.5] t-muted">{MUTAGEN_HINT[s.mutagen]}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] t-muted">
              {isCharacter
                ? '이 방에는 주성이 없어. 맞은편 방의 별이 대신 너를 봐주고 있어.'
                : '이 궁에는 주성이 없습니다. 맞은편 궁의 영향을 받는 자리입니다.'}
            </p>
          )}
        </div>

        {(palace.minor.length > 0 || palace.adj.length > 0) && (
          <div>
            <p className="mb-2 text-[12.5px] font-semibold tracking-[0.18em] t-faint">보좌성 · 잡성</p>
            <div className="flex flex-wrap gap-1.5">
              {[...palace.minor, ...palace.adj].map((s, i) => (
                <span
                  key={`${s.cn}-${i}`}
                  className="t-chip !text-[13px]"
                  title={s.mutagen ? MUTAGEN_HINT[s.mutagen] : undefined}
                  style={s.mutagen === '화기' ? { color: warn, borderColor: 'rgba(217,138,122,0.35)' } : undefined}
                >
                  {s.name}
                  {s.mutagen && <span className="ml-0.5 text-[12px] opacity-70">{s.mutagen}</span>}
                </span>
              ))}
            </div>
            {minorLine(palace, isCharacter ? 'casual' : 'formal') && (
              <p className="mt-2.5 rounded-xl p-2.5 text-[13px] leading-relaxed t-muted" style={{ background: 'var(--field-bg)' }}>
                {minorLine(palace, isCharacter ? 'casual' : 'formal')}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2.5">
          {paragraphs.slice(0, 2).map((p, i) => (
            <p key={i} className="text-[14.5px] leading-[1.85] t-body">
              {p}
            </p>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-2xl p-4" style={{ border: '1px solid var(--line)', background: 'var(--field-bg)' }}>
          <p className="text-[12.5px] font-semibold tracking-[0.18em]" style={{ color: 'var(--accent-deep)' }}>
            {copy.chart.detailNext}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed t-muted">{paragraphs[2]}</p>
          <div className="mt-3 select-none space-y-1 blur-[3px]" aria-hidden="true">
            <p className="text-[13.5px] leading-relaxed t-faint">{tip}</p>
            <p className="text-[13.5px] leading-relaxed t-faint">
              {isCharacter
                ? '이 방이 흔들리는 달에는 결정을 미루고, 열리는 달에는 먼저 움직여.'
                : '이 궁이 흔들리는 달에는 결정을 미루고, 열리는 달에는 먼저 움직이세요.'}
            </p>
          </div>
          <button onClick={onUnlock} className="t-btn t-btn-primary mt-3 w-full py-2.5 text-[14px]">
            {copy.chart.detailUnlock}
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
              <path d="M8.5 10.5V8a3.5 3.5 0 1 1 7 0v2.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
