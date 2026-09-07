import { THEME_PREFERENCES, type ThemePreference, useTheme } from './useTheme'

const LABELS: Record<ThemePreference, string> = {
  system: 'Sistema',
  light: 'Claro',
  dark: 'Oscuro',
}

/** Light/dark/system theme preference — see docs/DECISIONS.md D-049 for why this lives outside the domain/backup layers. */
export function ThemeSection() {
  const { preference, setPreference } = useTheme()

  return (
    <section className="card" aria-label="Apariencia">
      <h2>Apariencia</h2>

      <div className="segmented-control" role="tablist" aria-label="Tema">
        {THEME_PREFERENCES.map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={preference === value}
            onClick={() => setPreference(value)}
          >
            {LABELS[value]}
          </button>
        ))}
      </div>
    </section>
  )
}
