import { describe, expect, it } from 'vitest'
import {
  SECRET_TOKEN_PRESETS,
  apiTokenGenerator,
  generateSecretToken,
  genericTokenGenerator,
  pkTokenGenerator,
} from './tokenPresets'

describe('secret token presets', () => {
  it('defines the expected prefixes', () => {
    expect(SECRET_TOKEN_PRESETS.api.prefix).toBe('api_')
    expect(SECRET_TOKEN_PRESETS.token.prefix).toBe('token_')
    expect(SECRET_TOKEN_PRESETS.publicKeyLike.prefix).toBe('pk_')
  })

  it('uses 32 bytes / 256 bits by default', () => {
    const result = generateSecretToken('api_')

    expect(result.value).toMatch(/^api_[A-Za-z0-9_-]{43}$/)
    expect(result.byteLength).toBe(32)
    expect(result.entropyBits).toBe(256)
  })

  it('supports a different byte length without changing the prefix', () => {
    const result = generateSecretToken('token_', 48)

    expect(result.value).toMatch(/^token_[A-Za-z0-9_-]{64}$/)
    expect(result.byteLength).toBe(48)
    expect(result.entropyBits).toBe(384)
  })

  it('rejects an empty prefix', () => {
    expect(() => generateSecretToken('')).toThrow(/prefix/i)
  })

  it('exposes the presets through generator definitions', () => {
    expect(apiTokenGenerator.id).toBe('api-token')
    expect(genericTokenGenerator.id).toBe('generic-token')
    expect(pkTokenGenerator.id).toBe('pk-token')
    expect(apiTokenGenerator.category).toBe('secrets')
  })
})
