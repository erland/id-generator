import { describe, expect, it } from 'vitest'

import {
  base64SecretGenerator,
  base64UrlSecretGenerator,
  hexSecretGenerator,
} from './encodedRandom'

describe('encoded random secret generators', () => {
  it('generates hex with entropy metadata', () => {
    const result = hexSecretGenerator.generate({ byteLength: 16 })

    expect(result).toMatchObject({
      metadata: {
        format: 'hex',
        byteLength: 16,
        entropyBits: 128,
      },
    })
  })

  it('generates 48 random bytes as 64 Base64 characters', () => {
    const result = base64SecretGenerator.generate({ byteLength: 48 })

    expect(result).toMatchObject({
      metadata: {
        format: 'base64',
        byteLength: 48,
        entropyBits: 384,
      },
    })
    expect(result.value).toHaveLength(64)
  })

  it('generates Base64URL without unsafe characters or padding', () => {
    const result = base64UrlSecretGenerator.generate({ byteLength: 32 })

    expect(result.value).not.toMatch(/[+/=]/)
  })
})
