import type { ReactNode } from 'react';
import { useTheme } from '../lib/theme';

export function SectionLabel({ index, children }: { index?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      {index && (
        <span className="num text-[12.5px] font-semibold tracking-[0.18em] t-accent opacity-80">{index}</span>
      )}
      <span className="h-px w-6 opacity-45" style={{ background: 'var(--accent)' }} />
      <span className="text-[13px] font-semibold uppercase tracking-[0.2em] t-muted">{children}</span>
    </div>
  );
}

export function StarMark({ className = '' }: { className?: string }) {
  const { theme } = useTheme();
  if (theme === 'character') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="M12 2.4l2.5 6.3 6.6.5-5 4.3 1.5 6.5L12 16.3 6.4 20l1.5-6.5-5-4.3 6.6-.5L12 2.4z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 1.2l1.35 7.1L21 12l-7.65 3.7L12 22.8l-1.35-7.1L3 12l7.65-3.7L12 1.2z" fill="currentColor" />
      <path d="M12 5.6l.8 4.2 4.2.8-4.2.8-.8 4.2-.8-4.2-4.2-.8 4.2-.8.8-4.2z" fill="var(--card)" opacity="0.55" />
    </svg>
  );
}

export function Hairline({ className = '' }: { className?: string }) {
  return <div className={`t-rule ${className}`} />;
}

export function Price({ value, className = '' }: { value: number; className?: string }) {
  return (
    <span className={`num ${className}`}>
      {value.toLocaleString('ko-KR')}
      <span className="ml-0.5 text-[0.78em] font-normal t-muted">원</span>
    </span>
  );
}

export function ScoreBar({
  label,
  score,
  hint,
  delay = 0,
}: {
  label: string;
  score: number;
  hint?: string;
  delay?: number;
}) {
  const { theme } = useTheme();
  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <span className="text-[14.5px] font-semibold t-body">{label}</span>
        <span className="num text-[14px] t-muted">
          <span className="text-[18px] font-bold t-title">{score}</span> / 100
        </span>
      </div>
      <div
        className="h-[7px] w-full overflow-hidden rounded-full"
        style={{ background: theme === 'character' ? 'rgba(146,116,192,0.14)' : 'rgba(246,238,224,0.1)' }}
      >
        <div
          className="h-full origin-left rounded-full animate-grow"
          style={{
            width: `${score}%`,
            animationDelay: `${delay}ms`,
            background:
              theme === 'character'
                ? 'linear-gradient(90deg,#b99bf2,#8f6fe0 60%,#ffb58c)'
                : 'linear-gradient(90deg,#c19a56,#e3c07b 60%,#f4e0b6)',
          }}
        />
      </div>
      {hint && <p className="mt-1.5 text-[13.5px] leading-relaxed t-faint">{hint}</p>}
    </div>
  );
}

export function LockIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 1 1 7 0v2.5" />
    </svg>
  );
}

export function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M5 12h13M13 6.5L18.5 12 13 17.5" />
    </svg>
  );
}
