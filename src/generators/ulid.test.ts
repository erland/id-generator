import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as cryptoModule from '../crypto'
import { ulid, ulidGenerator } from './ulid'

describe('ulid', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('generates a 26-character Crockford Base32 ULID', () => {
    const value = ulid(1_700_000_000_000)

    expect(value).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/)
  })

  it('encodes the timestamp in the first 10 characters', () => {
    vi.spyOn(cryptoModule, 'randomBytes').mockReturnValue(new Uint8Array(10))

    expect(ulid(0)).toBe('00000000000000000000000000')
    expect(ulid(1)).toBe('00000000010000000000000000')
  })

  it('sorts lexicographically across increasing timestamps', () => {
    vi.spyOn(cryptoModule, 'randomBytes').mockReturnValue(new Uint8Array(10))

    const first = ulid(1_700_000_000_000)
    const second = ulid(1_700_000_000_001)

    expect(first < second).toBe(true)
  })

  it('uses 80 bits of cryptographic randomness', () => {
    vi.spyOn(cryptoModule, 'randomBytes').mockReturnValue(
      Uint8Array.from([0xff, 0xee, 0xdd, 0xcc, 0xbb, 0xaa, 0x99, 0x88, 0x77, 0x66]),
    )

    const value = ulid(0)

    expect(value.slice(10)).toHaveLength(16)
    expect(cryptoModule.randomBytes).toHaveBeenCalledWith(10)
  })

  it('rejects invalid timestamps', () => {
    expect(() => ulid(-1)).toThrow(RangeError)
    expect(() => ulid(Number.MAX_SAFE_INTEGER)).toThrow(RangeError)
    expect(() => ulid(1.5)).toThrow(RangeError)
  })

  it('exposes a generator definition', () => {
    expect(ulidGenerator.id).toBe('ulid')
    expect(ulidGenerator.category).toBe('identifiers')
  })
})
