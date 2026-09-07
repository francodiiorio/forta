import { useCallback, useEffect, useState } from 'react'

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const
export type ThemePreference = (typeof THEME_PREFERENCES)[number]

const STORAGE_KEY = 'forta-theme-preference'

function isThemePreference(value: string | null): value is ThemePreference {
  return (THEME_PREFERENCES as readonly string[]).includes(value ?? '')
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export interface ThemeApi {
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
}

/**
 * Theme preference is a device/display setting, not fitness data — kept
 * in localStorage, never through the repository layer, and never part
 * of the backup format (see docs/DECISIONS.md D-049). A blocking inline
 * script in index.html applies the same resolution before first paint
 * so there's no flash of the wrong theme; this hook keeps `data-theme`
 * in sync afterward, including live updates while `preference` is
 * "system" and the OS theme changes with the app open.
 */
export function useTheme(): ThemeApi {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isThemePreference(stored) ? stored : 'system'
  })

  useEffect(() => {
    if (preference !== 'system') {
      document.documentElement.dataset.theme = preference
      return
    }

    document.documentElement.dataset.theme = getSystemTheme()

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      document.documentElement.dataset.theme = getSystemTheme()
    }
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [preference])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  return { preference, setPreference }
}
