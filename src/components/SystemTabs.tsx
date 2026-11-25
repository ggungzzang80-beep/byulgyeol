import { SYSTEM_ORDER, SYSTEMS, type SystemId } from '../lib/systems';
import { useTheme } from '../lib/theme';

type Props = {
  system: SystemId;
  onChange: (system: SystemId) => void;
  /** 아래에 붙는 한 줄 안내 (없으면 기본 문구) */
  note?: string;
  compact?: boolean;
};

/**
 * 동양 자미두수 / 서양 점성술을 고르는 탭.
 * 랜딩·결과·리포트 화면이 모두 같은 모양을 써서 "지금 어느 체계를 보고 있는지"를
 * 화면마다 같은 자리에서 확인할 수 있게 합니다.
 */
export default function SystemTabs({ system, onChange, note, compact = false }: Props) {
  const { theme } = useTheme();
  /* 자미두수 단독 오픈 빌드 — 체계가 하나라 탭을 그리지 않습니다(코드는 그대로 두고 숨김). */
  if (SYSTEM_ORDER.length < 2) return null;

  /* 캐릭터(별의 속삭임) 테마는 탭 이름도 일상어로 보여 줍니다. */
  const label = (id: SystemId) => {
    const s = SYSTEMS[id];
    if (theme !== 'character') return { tab: s.tab, basis: s.basis };
    if (id === 'ziwei') return { tab: '동양 별지도', basis: '열두 개의 방 · 열네 개의 별' };
    return { tab: '서양 별자리', basis: '태어난 하늘의 좌표' };
  };

  return (
    <div className={compact ? '' : 'mx-auto max-w-5xl px-5 pt-5 sm:px-8'}>
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="점술 체계 선택">
        {SYSTEM_ORDER.map((id) => {
          const s = SYSTEMS[id];
          const active = system === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(id)}
              className="relative flex items-stretch gap-2 rounded-2xl px-2.5 py-2.5 text-left transition"
              style={
                active
                  ? {
                      background: 'var(--accent-soft)',
                      border: '1.5px solid var(--line-strong)',
                      color: 'var(--accent-deep)',
                      boxShadow: '0 12px 26px -22px rgba(0,0,0,0.7)',
                    }
                  : {
                      background: 'var(--field-bg)',
                      border: '1.5px solid var(--line-strong)',
                      color: 'var(--muted)',
                      opacity: 0.92,
                    }
              }
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[13px]"
                style={{
                  background: active ? 'var(--accent)' : 'var(--field-bg)',
                  color: active ? 'var(--on-accent)' : 'var(--accent)',
                }}
                aria-hidden="true"
              >
                {s.glyph}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="block text-[13px] font-semibold leading-[1.35]"
                  style={{ color: active ? 'var(--accent-deep)' : 'var(--text-2, var(--muted))' }}
                >
                  {label(id).tab}
                </span>
                <span className="mt-1 block text-[12px] leading-[1.4]" style={{ color: 'var(--faint)' }}>
                  {label(id).basis}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 px-1 text-[13.5px] leading-[1.75]" style={{ color: 'var(--muted)' }}>
        {note ??
          '두 체계는 계산 방식도 해석도 완전히 다른 별개의 서비스예요. 고른 체계만 아래에 나옵니다.'}
      </p>
    </div>
  );
}
