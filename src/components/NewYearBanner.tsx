import { useTheme } from '../lib/theme';

/**
 * 랜딩용 2027 신년 부적 배너.
 * 생년월일 입력 전에도 "무료 부적"이라는 목적지를 먼저 보여 주어
 * 무료 부적 → 정밀 리포트 → 원석 굿즈 퍼널의 입구를 만듭니다.
 */
export default function NewYearBanner({ onStart }: { onStart: () => void }) {
  const { theme } = useTheme();
  const isCharacter = theme === 'character';

  return (
    <div
      className="flex flex-col items-start justify-between gap-4 rounded-[26px] px-5 py-5 sm:flex-row sm:items-center sm:px-6"
      style={{
        background: 'linear-gradient(118deg,#141029 0%,#1e1638 52%,#0b0917 100%)',
        border: '1px solid rgba(227,192,123,0.34)',
        boxShadow: '0 26px 54px -38px rgba(9,8,18,0.9)',
      }}
    >
      <div className="flex items-center gap-3.5">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] tracking-tight"
          style={{
            background: 'rgba(150,52,48,0.88)',
            color: 'rgba(255,236,228,0.95)',
            border: '1px solid rgba(240,200,190,0.5)',
            fontFamily: '"Noto Serif KR", Georgia, serif',
          }}
          aria-hidden="true"
        >
          丁未
        </span>
        <div>
          <p className="text-[15.5px]" style={{ color: 'rgba(248,241,228,0.96)', fontFamily: 'var(--font-display)' }}>
            2027 정미년 신년 부적 <span style={{ color: '#e3c07b' }}>무료</span>
          </p>
          <p className="mt-1 text-[13px] leading-[1.7]" style={{ color: 'rgba(246,238,224,0.66)' }}>
            {isCharacter
              ? '생년월일만 알면 끝. 명궁의 별로 그린 소장용 부적 한 장.'
              : '생년월일만 있으면 됩니다. 명궁의 주성으로 그린 소장용 부적 한 장.'}
          </p>
        </div>
      </div>
      <button
        onClick={onStart}
        className="w-full shrink-0 rounded-full px-5 py-3 text-[14px] font-semibold transition active:scale-[0.99] sm:w-auto"
        style={{
          background: 'linear-gradient(180deg,#f2dbaa 0%,#d9b478 55%,#c19a56 100%)',
          color: '#14101f',
          boxShadow: '0 16px 34px -18px rgba(227,192,123,0.6)',
        }}
      >
        {isCharacter ? '내 2027 부적 받기' : '2027 부적 받기'}
        <span className="ml-1.5" aria-hidden="true">
          →
        </span>
      </button>
    </div>
  );
}
