import type { PalaceView } from '../lib/chart';
import { MUTAGEN_HINT, MUTAGEN_MEANING, BRIGHTNESS_TEXT, TWELVE_STAGES_TEXT } from '../lib/terms';
import { palaceReadings, palaceScore, minorLine } from '../lib/content';
import { branchRoom, brightLight, mutagenLight, roomOf, stageLight } from '../lib/friendly';
import { THEME_ART, useTheme } from '../lib/theme';

type Props = {
  palace: PalaceView;
  onUnlock: () => void;
};

/**
 * 한 별방(궁)의 이야기 카드.
 * 캐릭터 테마는 한자·명리 용어 대신 '메인 별 · 보조 별 · 10년 흐름' 처럼
 * 일상어로 바꾸고, 별마다 자기 줄을 갖도록 나눠 그립니다.
 * (2026-11-25 @kooleumi8 피드백 3·4·5번)
 */
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

  /* 문단 안의 '\\n' 은 별·사화 하나씩의 줄입니다. */
  const linesOf = (text: string) =>
    text
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

  const minorLines = minorLine(palace, isCharacter ? 'casual' : 'formal');

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
              <h3 className="t-title text-[21px]">{isCharacter ? roomOf(palace.name) : palace.name}</h3>
              {!isCharacter && <span className="text-[12.5px] t-faint">{palace.hanja}</span>}
            </div>
            <p className="mt-1 text-[14px] leading-[1.6] t-muted">{headline}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="num text-[22px] font-bold leading-none t-title">{score}</p>
            <p className="mt-1 text-[13px]" style={{ color: 'var(--accent-deep)' }}>
              {label}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="t-chip num !text-[13px]">
            {isCharacter ? branchRoom(palace.stem, palace.branch, palace.index) : `${palace.stem}${palace.branch}궁`}
          </span>
          <span className="t-chip num !text-[13px]">
            {isCharacter
              ? `10년 흐름 ${palace.decadalRange[0]}–${palace.decadalRange[1]}세`
              : `대한 ${palace.decadalRange[0]}–${palace.decadalRange[1]}세`}
          </span>
          <span className="t-chip !text-[13px]">
            {isCharacter
              ? stageLight(palace.stage) || TWELVE_STAGES_TEXT[palace.stage] || ''
              : `${palace.stage} · ${TWELVE_STAGES_TEXT[palace.stage] ?? ''}`}
          </span>
          {palace.isBodyPalace && (
            <span className="t-chip t-chip-solid !text-[13px]">{isCharacter ? '몸의 방' : '신궁'}</span>
          )}
        </div>
      </div>

      <div className="thin-scroll flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div>
          <p className="mb-2.5 text-[13px] font-semibold tracking-[0.14em] t-faint">
            {isCharacter ? '이 방의 메인 별' : '주성'}
          </p>
          {palace.major.length ? (
            <div className="space-y-2">
              {palace.major.map((s) => (
                <div
                  key={s.cn}
                  className="rounded-xl px-3 py-2.5"
                  style={
                    isCharacter
                      ? { background: 'var(--field-bg)', borderLeft: '3px solid var(--accent)' }
                      : undefined
                  }
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="t-title text-[18px]">{s.name}</span>
                    {s.brightness && (
                      <span className="text-[13px] t-faint">
                        {isCharacter ? brightLight(s.brightness) : `${s.brightness} · ${BRIGHTNESS_TEXT[s.brightness] ?? ''}`}
                      </span>
                    )}
                    {s.mutagen && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[12.5px]"
                        style={{
                          background: s.mutagen === '화기' ? 'rgba(217,138,122,0.14)' : 'var(--accent-soft)',
                          color: s.mutagen === '화기' ? warn : 'var(--accent-deep)',
                        }}
                      >
                        {isCharacter ? mutagenLight(s.mutagen) : MUTAGEN_MEANING[s.mutagen]?.label ?? s.mutagen}
                      </span>
                    )}
                  </div>
                  {s.mutagen && (
                    <p className="mt-1.5 text-[13.5px] leading-[1.7] t-muted">{MUTAGEN_HINT[s.mutagen]}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14.5px] leading-[1.8] t-muted">
              {isCharacter
                ? '이 방에는 메인 별이 없어. 맞은편 방의 별이 대신 너를 봐주고 있어.'
                : '이 궁에는 주성이 없습니다. 맞은편 궁의 영향을 받는 자리입니다.'}
            </p>
          )}
        </div>

        {(palace.minor.length > 0 || palace.adj.length > 0) && (
          <div>
            <p className="mb-2.5 text-[13px] font-semibold tracking-[0.14em] t-faint">
              {isCharacter ? '함께 빛나는 보조 별' : '보좌성 · 잡성'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[...palace.minor, ...palace.adj].map((s, i) => (
                <span
                  key={`${s.cn}-${i}`}
                  className="t-chip !text-[13.5px]"
                  title={s.mutagen ? MUTAGEN_HINT[s.mutagen] : undefined}
                  style={s.mutagen === '화기' ? { color: warn, borderColor: 'rgba(217,138,122,0.35)' } : undefined}
                >
                  {s.name}
                  {s.mutagen && (
                    <span className="ml-1 text-[12px] opacity-75">{isCharacter ? mutagenLight(s.mutagen) : s.mutagen}</span>
                  )}
                </span>
              ))}
            </div>
            {minorLines && (
              <div className="mt-2.5 space-y-1 rounded-xl p-3" style={{ background: 'var(--field-bg)' }}>
                {linesOf(minorLines).map((line) => (
                  <p key={line} className="text-[13.5px] leading-[1.75] t-muted">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {paragraphs.slice(0, 2).map((p, i) => (
            <div key={i} className="space-y-1.5">
              {linesOf(p).map((line) => (
                <p key={line} className="text-[15px] leading-[1.95] t-body">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-2xl p-4" style={{ border: '1px solid var(--line)', background: 'var(--field-bg)' }}>
          <p className="text-[13px] font-semibold tracking-[0.14em]" style={{ color: 'var(--accent-deep)' }}>
            {copy.chart.detailNext}
          </p>
          <div className="mt-2 space-y-1.5">
            {(paragraphs[2] ? linesOf(paragraphs[2]) : []).map((line) => (
              <p key={line} className="text-[14.5px] leading-[1.85] t-muted">
                {line}
              </p>
            ))}
          </div>
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
