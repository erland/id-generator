export type ClipboardResult =
  | { ok: true; method: 'clipboard-api' | 'exec-command' }
  | { ok: false; error: string }

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') {
    return false
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  textarea.style.inset = '0 auto auto 0'

  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)

  try {
    return document.execCommand('copy')
  } finally {
    textarea.remove()
  }
}

/**
 * Copies text using the modern Clipboard API when available and falls back to
 * document.execCommand('copy') for older browsers. No copied value is persisted.
 */
export async function copyText(text: string): Promise<ClipboardResult> {
  if (!text) {
    return { ok: false, error: 'Det finns inget värde att kopiera.' }
  }

  try {
    if (globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(text)
      return { ok: true, method: 'clipboard-api' }
    }
  } catch {
    // Try the legacy path before reporting a failure.
  }

  try {
    if (legacyCopy(text)) {
      return { ok: true, method: 'exec-command' }
    }
  } catch {
    // Fall through to the user-facing error below.
  }

  return {
    ok: false,
    error: 'Kunde inte kopiera automatiskt. Kontrollera webbläsarens clipboard-behörighet och försök igen.',
  }
}
