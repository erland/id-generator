import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  nanoId,
  nanoIdGenerator,
  NANO_ID_DEFAULT_LENGTH,
  NANO_ID_URL_ALPHABET,
} from './nanoId'

describe('NanoID-like generator', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses a 21 character URL-safe default', () => {
    const value = nanoId()

    expect(value).toHaveLength(NANO_ID_DEFAULT_LENGTH)
    expect(Array.from(value).every((character) => NANO_ID_URL_ALPHABET.includes(character))).toBe(true)
  })

  it('respects a custom length', () => {
    expect(nanoId(8)).toHaveLength(8)
    expect(nanoId(64)).toHaveLength(64)
  })

  it('supports a custom alphabet', () => {
    const value = nanoId(40, 'ABC123')

    expect(value).toHaveLength(40)
    expect(value).toMatch(/^[ABC123]+$/)
  })

  it('inherits alphabet validation from the unbiased random sampler', () => {
    expect(() => nanoId(10, '')).toThrow(/at least two/i)
    expect(() => nanoId(10, 'A')).toThrow(/at least two/i)
    expect(() => nanoId(10, 'AABC')).toThrow(/duplicate/i)
  })

  it('uses unbiased rejection sampling through randomCharacters', () => {
    let next = 0
    vi.stubGlobal('crypto', {
      getRandomValues<T extends ArrayBufferView | null>(array: T): T {
        if (array instanceof Uint32Array) {
          array[0] = next
          next += 1
        }
        return array
      },
    })

    expect(nanoId(6, 'ABC')).toBe('ABCABC')
  })

  it('is exposed through the shared generator contract', async () => {
    const result = await nanoIdGenerator.generate({ length: 12, alphabet: 'abcd' })

    expect(result.value).toHaveLength(12)
    expect(result.value).toMatch(/^[abcd]+$/)
    expect(result.metadata).toEqual({
      format: 'nano-id',
      length: 12,
      alphabetSize: 4,
    })
  })
})
