import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyText } from './clipboard'

describe('copyText', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('copies through the Clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    await expect(copyText('value')).resolves.toEqual({ ok: true, method: 'clipboard-api' })
    expect(writeText).toHaveBeenCalledWith('value')
  })

  it('reports an understandable error when automatic copy is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
    vi.spyOn(document, 'execCommand').mockReturnValue(false)

    const result = await copyText('value')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/clipboard-behörighet/i)
    }
  })

  it('rejects an empty value without accessing the clipboard', async () => {
    await expect(copyText('')).resolves.toEqual({
      ok: false,
      error: 'Det finns inget värde att kopiera.',
    })
  })
})
