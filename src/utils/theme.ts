export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'id-generator.theme'

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

export function readThemePreference(storage: Pick<Storage, 'getItem'> = localStorage): ThemePreference {
  try {
    const stored = storage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function saveThemePreference(
  preference: ThemePreference,
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  try {
    storage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Theme persistence is optional; the active in-memory preference still works.
  }
}

export function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean,
): ResolvedTheme {
  if (preference === 'system') {
    return prefersDark ? 'dark' : 'light'
  }
  return preference
}

export function applyTheme(theme: ResolvedTheme, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = theme
  root.style.colorScheme = theme
}
