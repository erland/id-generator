import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ALPHANUMERIC_ALPHABET,
  alphanumericId,
  alphanumericIdGenerator,
  numericId,
  numericIdGenerator,
} from './randomIdentifier'

describe('random identifiers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('generates alphanumeric identifiers with the requested random length', () => {
    const value = alphanumericId(32)

    expect(value).toHaveLength(32)
    expect(Array.from(value).every((character) => ALPHANUMERIC_ALPHABET.includes(character))).toBe(true)
  })

  it('generates numeric identifiers with the requested random length', () => {
    expect(numericId(24)).toMatch(/^\d{24}$/)
  })

  it('keeps the prefix separate from the requested random length', () => {
    const prefix = 'order_'
    const value = alphanumericId(12, prefix)

    expect(value.startsWith(prefix)).toBe(true)
    expect(value.slice(prefix.length)).toHaveLength(12)
  })

  it('supports a custom alphabet', () => {
    const value = alphanumericId(20, 'x_', 'ABC')

    expect(value).toMatch(/^x_[ABC]{20}$/)
  })

  it('rejects empty, single-character and duplicate custom alphabets clearly', () => {
    expect(() => alphanumericId(10, '', '')).toThrow(/at least two/i)
    expect(() => alphanumericId(10, '', 'A')).toThrow(/at least two/i)
    expect(() => alphanumericId(10, '', 'AABC')).toThrow(/duplicate/i)
  })

  it('uses unbiased sampling from the shared crypto module', () => {
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

    expect(alphanumericId(6, '', 'ABC')).toBe('ABCABC')
  })

  it('exposes both variants through the shared generator contract', async () => {
    const alphanumeric = await alphanumericIdGenerator.generate({
      length: 4,
      prefix: 'id_',
      alphabet: 'AB',
    })
    expect(alphanumeric).toMatchObject({
      value: expect.stringMatching(/^id_[AB]{4}$/),
      metadata: {
        format: 'alphanumeric',
        randomLength: 4,
        prefixLength: 3,
        alphabetSize: 2,
      },
    })

    const numeric = await numericIdGenerator.generate({ length: 5, prefix: 'n_' })
    expect(numeric).toMatchObject({
      value: expect.stringMatching(/^n_\d{5}$/),
      metadata: {
        format: 'numeric',
        randomLength: 5,
        prefixLength: 2,
        alphabetSize: 10,
      },
    })
  })
})
