import { describe, expect, it } from 'vitest'

import {
  decodeBase64,
  decodeBase64Url,
  decodeHex,
  encodeBase64,
  encodeBase64Url,
  encodeHex,
} from './encoding'

describe('secret encodings', () => {
  const bytes = Uint8Array.from([0x00, 0x01, 0x7f, 0x80, 0xfe, 0xff])

  it('encodes and decodes hexadecimal values', () => {
    const encoded = encodeHex(bytes)

    expect(encoded).toBe('00017f80feff')
    expect(decodeHex(encoded)).toEqual(bytes)
  })

  it('round-trips Base64', () => {
    const encoded = encodeBase64(bytes)

    expect(decodeBase64(encoded)).toEqual(bytes)
  })

  it('encodes 48 bytes as 64 Base64 characters', () => {
    expect(encodeBase64(new Uint8Array(48))).toHaveLength(64)
  })

  it('produces Base64URL without +, / or padding', () => {
    const encoded = encodeBase64Url(Uint8Array.from([0xfb, 0xff, 0xff]))

    expect(encoded).not.toMatch(/[+/=]/)
    expect(encoded).toBe('-___')
  })

  it('round-trips Base64URL', () => {
    const encoded = encodeBase64Url(bytes)

    expect(decodeBase64Url(encoded)).toEqual(bytes)
  })

  it('rejects malformed hexadecimal values', () => {
    expect(() => decodeHex('abc')).toThrow()
    expect(() => decodeHex('zz')).toThrow()
  })

  it('rejects malformed Base64URL characters', () => {
    expect(() => decodeBase64Url('abc+def')).toThrow()
  })
})
