import { afterEach, describe, expect, it, vi } from 'vitest'
import { uuidV4, uuidV4Generator } from './uuidV4'

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('UUID v4 generator', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('generates a UUID v4 with the expected format', () => {
    const value = uuidV4()

    expect(value).toMatch(UUID_V4_PATTERN)
    expect(value[14]).toBe('4')
    expect(['8', '9', 'a', 'b']).toContain(value[19].toLowerCase())
  })

  it('uses crypto.randomUUID when available', () => {
    const randomUUID = vi.fn(() => '123e4567-e89b-42d3-a456-426614174000')
    vi.stubGlobal('crypto', {
      randomUUID,
      getRandomValues: globalThis.crypto.getRandomValues.bind(globalThis.crypto),
    })

    expect(uuidV4()).toBe('123e4567-e89b-42d3-a456-426614174000')
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  it('falls back to random bytes and sets version and variant bits', () => {
    vi.stubGlobal('crypto', {
      getRandomValues<T extends ArrayBufferView | null>(array: T): T {
        if (array instanceof Uint8Array) {
          array.fill(0)
        }
        return array
      },
    })

    expect(uuidV4()).toBe('00000000-0000-4000-8000-000000000000')
  })

  it('is exposed through the shared generator contract', async () => {
    const result = await uuidV4Generator.generate({})

    expect(result.value).toMatch(UUID_V4_PATTERN)
    expect(result.metadata).toEqual({ version: 4, format: 'uuid' })
  })
})
