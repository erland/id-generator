import { afterEach, describe, expect, it, vi } from 'vitest'
import { uuidV7, uuidV7Generator } from './uuidV7'

const UUID_V7_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function timestampFromUuid(value: string): number {
  return Number.parseInt(value.replaceAll('-', '').slice(0, 12), 16)
}

describe('UUID v7 generator', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('generates a UUID v7 with the expected format', () => {
    const value = uuidV7()

    expect(value).toMatch(UUID_V7_PATTERN)
    expect(value[14]).toBe('7')
    expect(['8', '9', 'a', 'b']).toContain(value[19].toLowerCase())
  })

  it('encodes the provided Unix timestamp in milliseconds', () => {
    const timestamp = 1_725_000_123_456
    const value = uuidV7(timestamp)

    expect(timestampFromUuid(value)).toBe(timestamp)
  })

  it('creates distinct values for the same timestamp when random input differs', () => {
    let fillValue = 0
    vi.stubGlobal('crypto', {
      getRandomValues<T extends ArrayBufferView | null>(array: T): T {
        if (array instanceof Uint8Array) {
          array.fill(fillValue)
          fillValue += 1
        }
        return array
      },
    })

    const timestamp = 1_725_000_123_456

    expect(uuidV7(timestamp)).not.toBe(uuidV7(timestamp))
  })

  it('sets version and variant bits independently of random input', () => {
    vi.stubGlobal('crypto', {
      getRandomValues<T extends ArrayBufferView | null>(array: T): T {
        if (array instanceof Uint8Array) {
          array.fill(0xff)
        }
        return array
      },
    })

    const value = uuidV7(0)

    expect(value).toBe('00000000-0000-7fff-bfff-ffffffffffff')
  })

  it('rejects invalid timestamps', () => {
    expect(() => uuidV7(-1)).toThrow(RangeError)
    expect(() => uuidV7(Number.MAX_SAFE_INTEGER)).toThrow(RangeError)
    expect(() => uuidV7(1.5)).toThrow(RangeError)
  })

  it('is exposed through the shared generator contract', async () => {
    const result = await uuidV7Generator.generate({})

    expect(result.value).toMatch(UUID_V7_PATTERN)
    expect(result.metadata).toEqual({ version: 7, format: 'uuid', sortable: true })
  })
})
