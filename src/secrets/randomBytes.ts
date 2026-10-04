import { randomBytes } from '../crypto'

export const RANDOM_BYTE_PRESETS = [16, 24, 32, 48, 64] as const
export type RandomBytePreset = (typeof RANDOM_BYTE_PRESETS)[number]

export const DEFAULT_RANDOM_BYTE_LENGTH: RandomBytePreset = 32

export interface RandomBytesResult {
  bytes: Uint8Array
  byteLength: number
  entropyBits: number
}

/** Returns the entropy size represented by a number of uniformly random bytes. */
export function entropyBitsForByteLength(byteLength: number): number {
  if (!Number.isSafeInteger(byteLength) || byteLength < 0) {
    throw new RangeError('Byte length must be a non-negative safe integer')
  }

  const entropyBits = byteLength * 8

  if (!Number.isSafeInteger(entropyBits)) {
    throw new RangeError('Entropy size exceeds the safe integer range')
  }

  return entropyBits
}

/**
 * Generates cryptographically secure random bytes together with display-ready
 * byte and entropy metadata. Encoding is deliberately handled separately.
 */
export function generateRandomBytes(
  byteLength: number = DEFAULT_RANDOM_BYTE_LENGTH,
): RandomBytesResult {
  const bytes = randomBytes(byteLength)

  return {
    bytes,
    byteLength,
    entropyBits: entropyBitsForByteLength(byteLength),
  }
}

export function isRandomBytePreset(byteLength: number): byteLength is RandomBytePreset {
  return RANDOM_BYTE_PRESETS.some((preset) => preset === byteLength)
}
