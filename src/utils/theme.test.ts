import { describe, expect, it, vi } from 'vitest'
import {
  THEME_STORAGE_KEY,
  applyTheme,
  readThemePreference,
  resolveTheme,
  saveThemePreference,
} from './theme'

describe('theme utilities', () => {
  it('defaults to system when no valid preference is stored', () => {
    expect(readThemePreference({ getItem: () => null })).toBe('system')
    expect(readThemePreference({ getItem: () => 'unknown' })).toBe('system')
  })

  it('reads and stores an explicit preference', () => {
    expect(readThemePreference({ getItem: () => 'dark' })).toBe('dark')

    const setItem = vi.fn()
    saveThemePreference('light', { setItem })
    expect(setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'light')
  })

  it('resolves system preference without changing explicit overrides', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('applies the resolved theme to the root element', () => {
    const root = document.createElement('div')
    applyTheme('dark', root)
    expect(root.dataset.theme).toBe('dark')
    expect(root.style.colorScheme).toBe('dark')
  })
})
