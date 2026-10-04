import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { BATCH_COUNT_PRESETS, batchValuesToText, generateBatch, uuidV4Generator } from '../generators'
import type { GeneratedValue } from '../types/generator'
import { copyText } from '../utils/clipboard'
import { applyTheme, readThemePreference, resolveTheme, saveThemePreference } from '../utils/theme'
import type { ThemePreference } from '../utils/theme'

const categories = [
  { id: 'identifiers', label: 'Identifierare', description: 'UUID, ULID och korta ID:n' },
  { id: 'secrets', label: 'Secrets', description: 'Tokens och slumpvärden' },
  { id: 'hash', label: 'Hash', description: 'Text och lokala filer' },
  { id: 'keys', label: 'Nycklar', description: 'Kommande nyckelfunktioner' },
]

export function App() {
  const [batchCount, setBatchCount] = useState(1)
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => readThemePreference())
  const [prefersDark, setPrefersDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [generatedValues, setGeneratedValues] = useState<GeneratedValue[]>([
    { value: '550e8400-e29b-41d4-a716-446655440000' },
  ])
  const [copyFeedback, setCopyFeedback] = useState<string>('')
  const [generationFeedback, setGenerationFeedback] = useState<string>('')
  const feedbackTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches)

    setPrefersDark(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [])

  useEffect(() => {
    const resolvedTheme = resolveTheme(themePreference, prefersDark)
    applyTheme(resolvedTheme)
    saveThemePreference(themePreference)
  }, [themePreference, prefersDark])

  const resolvedTheme = resolveTheme(themePreference, prefersDark)

  function showCopyFeedback(message: string) {
    setCopyFeedback(message)
    if (feedbackTimer.current !== undefined) {
      window.clearTimeout(feedbackTimer.current)
    }
    feedbackTimer.current = window.setTimeout(() => setCopyFeedback(''), 2500)
  }

  async function handleCopyValue(value: string) {
    const result = await copyText(value)
    showCopyFeedback(result.ok ? 'Kopierat' : result.error)
  }

  async function handleCopyAll() {
    const result = await copyText(batchValuesToText(generatedValues))
    showCopyFeedback(result.ok ? `Kopierade ${generatedValues.length} värden` : result.error)
  }

  async function handleGenerate() {
    const values = await generateBatch(uuidV4Generator, {}, batchCount)
    setGeneratedValues(values)
    setGenerationFeedback(`${values.length} ${values.length === 1 ? 'värde genererat' : 'värden genererade'}`)
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Hoppa till innehållet</a>
      <header className="app-header">
        <div>
          <p className="eyebrow">ID Generator</p>
          <h1 id="app-title">Generera värden lokalt i webbläsaren</h1>
        </div>
        <div className="header-actions">
          <label className="theme-control">
            <span>Tema</span>
            <select
              value={themePreference}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setThemePreference(event.target.value as ThemePreference)}
              aria-describedby="theme-help"
            >
              <option value="system">System</option>
              <option value="light">Ljust</option>
              <option value="dark">Mörkt</option>
            </select>
          </label>
          <span id="theme-help" className="sr-only">Aktivt tema: {resolvedTheme === 'dark' ? 'mörkt' : 'ljust'}.</span>
          <p className="privacy-note">Inga genererade värden lämnar enheten.</p>
        </div>
      </header>

      <div className="workspace" aria-labelledby="app-title">
        <nav className="category-navigation" aria-label="Kategorier">
          <label className="mobile-category-label" htmlFor="category-select">Kategori</label>
          <select id="category-select" className="mobile-category-select" defaultValue="identifiers">
            {categories.map((category) => (
              <option value={category.id} key={category.id} disabled={category.id !== 'identifiers'}>{category.label}</option>
            ))}
          </select>

          <div className="desktop-category-list">
            <p className="navigation-heading">Kategorier</p>
            {categories.map((category, index) => (
              <button
                type="button"
                className={`category-button${index === 0 ? ' is-active' : ''}`}
                key={category.id}
                aria-current={index === 0 ? 'page' : undefined}
                disabled={index !== 0}
              >
                <span>{category.label}</span>
                <small>{category.description}</small>
              </button>
            ))}
          </div>
        </nav>

        <main id="main-content" className="generator-workspace" tabIndex={-1}>
          <section className="generator-panel" aria-labelledby="generator-title">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Identifierare</p>
                <h2 id="generator-title">UUID v4</h2>
              </div>
              <span className="status-badge">Lokal generering</span>
            </div>

            <p className="panel-description">
              Välj generator och antal. Fler generatorinställningar kopplas in i kommande UI-steg.
            </p>

            <div className="field-grid" aria-label="Generatorinställningar">
              <label className="field">
                <span>Generator</span>
                <select defaultValue="uuid-v4">
                  <option value="uuid-v4">UUID v4</option>
                  <option value="uuid-v7" disabled>UUID v7 (UI kommer senare)</option>
                  <option value="ulid" disabled>ULID (UI kommer senare)</option>
                  <option value="nanoid" disabled>NanoID (UI kommer senare)</option>
                </select>
              </label>

              <label className="field">
                <span>Antal</span>
                <select value={batchCount} onChange={(event: ChangeEvent<HTMLSelectElement>) => setBatchCount(Number(event.target.value))}>
                  {BATCH_COUNT_PRESETS.map((count) => (
                    <option value={count} key={count}>{count}</option>
                  ))}
                </select>
              </label>
            </div>

            <button className="primary-action" type="button" onClick={handleGenerate}>Generera</button>
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{generationFeedback}</p>
          </section>

          <section className="result-panel" aria-labelledby="result-title">
            <div className="panel-heading result-heading">
              <div>
                <p className="section-kicker">Resultat</p>
                <h2 id="result-title">Genererade värden ({generatedValues.length})</h2>
              </div>
              <button className="secondary-action" type="button" onClick={handleCopyAll}>
                Kopiera alla
              </button>
            </div>

            <ol className="result-list" aria-label="Genererade värden">
              {generatedValues.map((generated, index) => (
                <li className="result-row" key={`${generated.value}-${index}`}>
                  <output className="result-value" aria-label={`Genererat värde ${index + 1}`}>{generated.value}</output>
                  <button
                    className="row-copy-action"
                    type="button"
                    aria-label={`Kopiera värde ${index + 1}`}
                    onClick={() => handleCopyValue(generated.value)}
                  >
                    Kopiera
                  </button>
                </li>
              ))}
            </ol>
            <p className={`copy-feedback${copyFeedback ? ' is-visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">
              {copyFeedback}
            </p>
            <p className="result-hint">Varje rad kan kopieras separat. Kopiera alla använder en rad per värde.</p>
          </section>
        </main>
      </div>
    </div>
  )
}
