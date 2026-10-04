import { describe, expect, it } from 'vitest'

import {
  DEFAULT_RANDOM_BYTE_LENGTH,
  RANDOM_BYTE_PRESETS,
  entropyBitsForByteLength,
  generateRandomBytes,
  isRandomBytePreset,
} from './randomBytes'

describe('random bytes secret groundwork', () => {
  it.each([
    [16, 128],
    [24, 192],
    [32, 256],
    [48, 384],
    [64, 512],
  ])('maps %i bytes to %i bits of entropy', (byteLength, entropyBits) => {
    expect(entropyBitsForByteLength(byteLength)).toBe(entropyBits)
  })

  it.each(RANDOM_BYTE_PRESETS)('generates exactly %i random bytes', (byteLength) => {
    const result = generateRandomBytes(byteLength)

    expect(result.bytes).toBeInstanceOf(Uint8Array)
    expect(result.bytes).toHaveLength(byteLength)
    expect(result.byteLength).toBe(byteLength)
    expect(result.entropyBits).toBe(byteLength * 8)
  })

  it('defaults to 32 bytes / 256 bits', () => {
    const result = generateRandomBytes()

    expect(DEFAULT_RANDOM_BYTE_LENGTH).toBe(32)
    expect(result.byteLength).toBe(32)
    expect(result.entropyBits).toBe(256)
  })

  it('recognizes only the supported presets', () => {
    for (const preset of RANDOM_BYTE_PRESETS) {
      expect(isRandomBytePreset(preset)).toBe(true)
    }

    expect(isRandomBytePreset(20)).toBe(false)
  })

  it('rejects invalid entropy byte lengths', () => {
    expect(() => entropyBitsForByteLength(-1)).toThrow(RangeError)
    expect(() => entropyBitsForByteLength(1.5)).toThrow(RangeError)
  })
})
