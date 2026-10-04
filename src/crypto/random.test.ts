import { describe, expect, it } from 'vitest'
import { randomBytes, randomCharacters, randomInteger } from './random'

describe('cryptographic random utilities', () => {
  it('returns the requested number of random bytes', () => {
    expect(randomBytes(0)).toHaveLength(0)
    expect(randomBytes(32)).toHaveLength(32)
    expect(randomBytes(70_000)).toHaveLength(70_000)
  })

  it('rejects invalid byte lengths', () => {
    expect(() => randomBytes(-1)).toThrow(/non-negative safe integer/i)
    expect(() => randomBytes(1.5)).toThrow(/non-negative safe integer/i)
  })

  it('returns integers inside the requested half-open interval', () => {
    for (const maxExclusive of [1, 2, 10, 255, 256, 65_537]) {
      for (let attempt = 0; attempt < 100; attempt += 1) {
        const value = randomInteger(maxExclusive)
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(maxExclusive)
        expect(Number.isInteger(value)).toBe(true)
      }
    }
  })

  it('rejects invalid integer ranges', () => {
    expect(() => randomInteger(0)).toThrow(/between 1/i)
    expect(() => randomInteger(-1)).toThrow(/between 1/i)
    expect(() => randomInteger(1.5)).toThrow(/between 1/i)
    expect(() => randomInteger(0x1_0000_0001)).toThrow(/between 1/i)
  })

  it('generates the requested number of characters from the alphabet', () => {
    const value = randomCharacters(128, 'ABC123')

    expect(value).toHaveLength(128)
    expect(value).toMatch(/^[ABC123]+$/)
  })

  it('counts Unicode code points rather than UTF-16 code units', () => {
    const value = randomCharacters(20, 'A😀B')

    expect(Array.from(value)).toHaveLength(20)
    expect(Array.from(value).every((character) => ['A', '😀', 'B'].includes(character))).toBe(true)
  })

  it('rejects invalid alphabets', () => {
    expect(() => randomCharacters(10, '')).toThrow(/at least two/i)
    expect(() => randomCharacters(10, 'A')).toThrow(/at least two/i)
    expect(() => randomCharacters(10, 'AABC')).toThrow(/duplicate/i)
  })
})
