import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  BATCH_COUNT_PRESETS,
  HASH_ALGORITHMS,
  HASH_OUTPUTS,
  alphanumericIdGenerator,
  apiTokenGenerator,
  base64SecretGenerator,
  base64UrlSecretGenerator,
  batchValuesToText,
  generateBatch,
  genericTokenGenerator,
  hexSecretGenerator,
  nanoIdGenerator,
  numericIdGenerator,
  pkTokenGenerator,
  textHashGenerator,
  ulidGenerator,
  uuidV4Generator,
  uuidV7Generator,
} from '../generators'
import { hashLocalFile } from '../hashing'
import type { HashAlgorithm, HashOutput } from '../hashing'
import type { GeneratedValue, GeneratorDefinition, GeneratorOptions } from '../types/generator'
import { copyText } from '../utils/clipboard'
import { applyTheme, readThemePreference, resolveTheme, saveThemePreference } from '../utils/theme'
import type { ThemePreference } from '../utils/theme'

type CategoryId = 'identifiers' | 'secrets' | 'hash' | 'keys'

const categories = [
  { id: 'identifiers' as const, label: 'Identifierare', description: 'UUID, ULID och korta ID:n' },
  { id: 'secrets' as const, label: 'Secrets', description: 'Tokens och slumpvärden' },
  { id: 'hash' as const, label: 'Hash', description: 'Text och lokala filer' },
  { id: 'keys' as const, label: 'Nycklar', description: 'Kommande nyckelfunktioner' },
]

const generatorGroups: Record<Exclude<CategoryId, 'keys'>, GeneratorDefinition[]> = {
  identifiers: [
    uuidV4Generator,
    uuidV7Generator,
    ulidGenerator,
    nanoIdGenerator,
    alphanumericIdGenerator,
    numericIdGenerator,
  ],
  secrets: [
    hexSecretGenerator,
    base64SecretGenerator,
    base64UrlSecretGenerator,
    apiTokenGenerator,
    genericTokenGenerator,
    pkTokenGenerator,
  ],
  hash: [textHashGenerator],
}

const fileHashId = 'file-hash'

export function App() {
  const [category, setCategory] = useState<CategoryId>('identifiers')
  const [generatorId, setGeneratorId] = useState(uuidV4Generator.id)
  const [batchCount, setBatchCount] = useState(1)
  const [length, setLength] = useState(21)
  const [prefix, setPrefix] = useState('')
  const [alphabet, setAlphabet] = useState('')
  const [byteLength, setByteLength] = useState(32)
  const [hashText, setHashText] = useState('')
  const [hashAlgorithm, setHashAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [hashOutput, setHashOutput] = useState<HashOutput>('hex')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => readThemePreference())
  const [prefersDark, setPrefersDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [generatedValues, setGeneratedValues] = useState<GeneratedValue[]>([
    { value: '550e8400-e29b-41d4-a716-446655440000' },
  ])
  const [copyFeedback, setCopyFeedback] = useState('')
  const [generationFeedback, setGenerationFeedback] = useState('')
  const feedbackTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches)
    setPrefersDark(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [])

  useEffect(() => {
    applyTheme(resolveTheme(themePreference, prefersDark))
    saveThemePreference(themePreference)
  }, [themePreference, prefersDark])

  const resolvedTheme = resolveTheme(themePreference, prefersDark)
  const availableGenerators =
    category === 'keys' ? [] : generatorGroups[category]
  const isFileHash = category === 'hash' && generatorId === fileHashId
  const selectedGenerator = availableGenerators.find((generator) => generator.id === generatorId)

  function changeCategory(next: CategoryId) {
    if (next === 'keys') return
    setCategory(next)
    setGeneratorId(generatorGroups[next][0].id)
    setGeneratedValues([])
    setGenerationFeedback('')
  }

  function showCopyFeedback(message: string) {
    setCopyFeedback(message)
    if (feedbackTimer.current !== undefined) window.clearTimeout(feedbackTimer.current)
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

  function currentOptions(): GeneratorOptions {
    if (generatorId === nanoIdGenerator.id) {
      return { length, ...(alphabet ? { alphabet } : {}) }
    }
    if (generatorId === alphanumericIdGenerator.id) {
      return { length, prefix, ...(alphabet ? { alphabet } : {}) }
    }
    if (generatorId === numericIdGenerator.id) return { length, prefix }
    if (category === 'secrets') return { byteLength }
    if (generatorId === textHashGenerator.id) {
      return { text: hashText, algorithm: hashAlgorithm, output: hashOutput }
    }
    return {}
  }

  async function handleGenerate() {
    try {
      let values: GeneratedValue[]
      if (isFileHash) {
        if (!selectedFile) throw new Error('Välj en fil först.')
        const result = await hashLocalFile(selectedFile, hashAlgorithm, hashOutput)
        values = [{ value: result.value, metadata: { fileName: result.fileName, fileSize: result.fileSize } }]
      } else if (selectedGenerator) {
        values = await generateBatch(selectedGenerator, currentOptions(), category === 'hash' ? 1 : batchCount)
      } else {
        throw new Error('Välj en generator.')
      }
      setGeneratedValues(values)
      setGenerationFeedback(`${values.length} ${values.length === 1 ? 'värde genererat' : 'värden genererade'}`)
    } catch (error) {
      setGenerationFeedback(error instanceof Error ? error.message : 'Genereringen misslyckades.')
    }
  }

  const heading = isFileHash ? 'Fil-hash' : selectedGenerator?.name ?? 'Generator'

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
            <select value={themePreference} onChange={(event) => setThemePreference(event.target.value as ThemePreference)} aria-describedby="theme-help">
              <option value="system">System</option><option value="light">Ljust</option><option value="dark">Mörkt</option>
            </select>
          </label>
          <span id="theme-help" className="sr-only">Aktivt tema: {resolvedTheme === 'dark' ? 'mörkt' : 'ljust'}.</span>
          <p className="privacy-note">Inga genererade värden lämnar enheten.</p>
        </div>
      </header>

      <div className="workspace" aria-labelledby="app-title">
        <nav className="category-navigation" aria-label="Kategorier">
          <label className="mobile-category-label" htmlFor="category-select">Kategori</label>
          <select id="category-select" className="mobile-category-select" value={category} onChange={(event) => changeCategory(event.target.value as CategoryId)}>
            {categories.map((item) => <option value={item.id} key={item.id} disabled={item.id === 'keys'}>{item.label}</option>)}
          </select>
          <div className="desktop-category-list">
            <p className="navigation-heading">Kategorier</p>
            {categories.map((item) => (
              <button type="button" className={`category-button${category === item.id ? ' is-active' : ''}`} key={item.id}
                aria-current={category === item.id ? 'page' : undefined} disabled={item.id === 'keys'} onClick={() => changeCategory(item.id)}>
                <span>{item.label}</span><small>{item.description}</small>
              </button>
            ))}
          </div>
        </nav>

        <main id="main-content" className="generator-workspace" tabIndex={-1}>
          <section className="generator-panel" aria-labelledby="generator-title">
            <div className="panel-heading"><div><p className="section-kicker">{categories.find((item) => item.id === category)?.label}</p><h2 id="generator-title">{heading}</h2></div><span className="status-badge">Lokal generering</span></div>
            <p className="panel-description">{isFileHash ? 'Hasha en lokal fil utan uppladdning.' : selectedGenerator?.description}</p>

            <div className="field-grid" aria-label="Generatorinställningar">
              <label className="field"><span>Generator</span>
                <select value={generatorId} onChange={(event) => setGeneratorId(event.target.value)}>
                  {availableGenerators.map((generator) => <option value={generator.id} key={generator.id}>{generator.name}</option>)}
                  {category === 'hash' && <option value={fileHashId}>Fil-hash</option>}
                </select>
              </label>

              {category !== 'hash' && <label className="field"><span>Antal</span>
                <select value={batchCount} onChange={(event) => setBatchCount(Number(event.target.value))}>{BATCH_COUNT_PRESETS.map((count) => <option value={count} key={count}>{count}</option>)}</select>
              </label>}

              {[nanoIdGenerator.id, alphanumericIdGenerator.id, numericIdGenerator.id].includes(generatorId) && <label className="field"><span>Längd</span><input type="number" min="1" max="256" value={length} onChange={(event) => setLength(Number(event.target.value))} /></label>}
              {[alphanumericIdGenerator.id, numericIdGenerator.id].includes(generatorId) && <label className="field"><span>Prefix</span><input value={prefix} onChange={(event) => setPrefix(event.target.value)} /></label>}
              {[nanoIdGenerator.id, alphanumericIdGenerator.id].includes(generatorId) && <label className="field"><span>Eget alfabet (valfritt)</span><input value={alphabet} onChange={(event) => setAlphabet(event.target.value)} placeholder="Lämna tomt för standard" /></label>}
              {category === 'secrets' && <label className="field"><span>Bytes</span><select value={byteLength} onChange={(event) => setByteLength(Number(event.target.value))}>{[16,24,32,48,64].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>}
              {category === 'hash' && <>
                <label className="field"><span>Algoritm</span><select value={hashAlgorithm} onChange={(event) => setHashAlgorithm(event.target.value as HashAlgorithm)}>{HASH_ALGORITHMS.map((value) => <option key={value}>{value}</option>)}</select></label>
                <label className="field"><span>Format</span><select value={hashOutput} onChange={(event) => setHashOutput(event.target.value as HashOutput)}>{HASH_OUTPUTS.map((value) => <option key={value}>{value}</option>)}</select></label>
              </>}
            </div>

            {generatorId === textHashGenerator.id && <label className="field"><span>Text</span><textarea rows={5} value={hashText} onChange={(event) => setHashText(event.target.value)} /></label>}
            {isFileHash && <label className="field"><span>Fil</span><input type="file" onChange={(event: ChangeEvent<HTMLInputElement>) => setSelectedFile(event.target.files?.[0] ?? null)} /></label>}

            <button className="primary-action" type="button" onClick={handleGenerate}>Generera</button>
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{generationFeedback}</p>
          </section>

          <section className="result-panel" aria-labelledby="result-title">
            <div className="panel-heading result-heading"><div><p className="section-kicker">Resultat</p><h2 id="result-title">Genererade värden ({generatedValues.length})</h2></div>
              <button className="secondary-action" type="button" onClick={handleCopyAll} disabled={generatedValues.length === 0}>Kopiera alla</button></div>
            <ol className="result-list" aria-label="Genererade värden">{generatedValues.map((generated, index) => (
              <li className="result-row" key={`${generated.value}-${index}`}><output className="result-value" aria-label={`Genererat värde ${index + 1}`}>{generated.value}</output>
                <button className="row-copy-action" type="button" aria-label={`Kopiera värde ${index + 1}`} onClick={() => handleCopyValue(generated.value)}>Kopiera</button></li>
            ))}</ol>
            <p className={`copy-feedback${copyFeedback ? ' is-visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">{copyFeedback}</p>
            <p className="result-hint">All generering och hashing sker lokalt i webbläsaren.</p>
          </section>
        </main>
      </div>
    </div>
  )
}
