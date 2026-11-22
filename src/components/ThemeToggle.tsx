import { useTheme, type ThemeId } from '../lib/theme';

const LABEL: Record<ThemeId, string> = { mystic: '미스틱', character: '캐릭터' };

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-toggle no-print" role="group" aria-label="테마 미리보기 전환">
      <span className="theme-toggle__label">Preview</span>
      {(['mystic', 'character'] as ThemeId[]).map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => setTheme(id)}
          aria-pressed={theme === id}
          className={`theme-toggle__btn ${theme === id ? 'is-active' : ''}`}
        >
          <span aria-hidden="true">{id === 'mystic' ? '✦' : '☾'}</span>
          {LABEL[id]}
        </button>
      ))}
    </div>
  );
}
