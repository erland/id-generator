import { randomBytes } from '../crypto'
import type { GeneratorDefinition } from '../types/generator'

export type UlidOptions = Record<string, never>

const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const MAX_ULID_TIMESTAMP = 0xffffffffffff

function encodeBase32(value: bigint, length: number): string {
  let remaining = value
  let encoded = ''

  for (let index = 0; index < length; index += 1) {
    const digit = Number(remaining & 31n)
    encoded = CROCKFORD_BASE32[digit] + encoded
    remaining >>= 5n
  }

  if (remaining !== 0n) {
    throw new RangeError('Value does not fit in the requested Crockford Base32 length.')
  }

  return encoded
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let value = 0n

  for (const byte of bytes) {
    value = (value << 8n) | BigInt(byte)
  }

  return value
}

/**
 * Generates a standard ULID using a 48-bit Unix timestamp in milliseconds and
 * 80 bits of cryptographically secure randomness.
 */
export function ulid(timestamp = Date.now()): string {
  if (!Number.isSafeInteger(timestamp) || timestamp < 0 || timestamp > MAX_ULID_TIMESTAMP) {
    throw new RangeError('ULID timestamp must be an integer between 0 and 2^48 - 1.')
  }

  const timePart = encodeBase32(BigInt(timestamp), 10)
  const randomPart = encodeBase32(bytesToBigInt(randomBytes(10)), 16)

  return `${timePart}${randomPart}`
}

export const ulidGenerator: GeneratorDefinition<UlidOptions> = {
  id: 'ulid',
  name: 'ULID',
  category: 'identifiers',
  description: 'Tidsordningsbar ULID med Crockford Base32, millisekundtid och 80 bitar kryptografisk slump.',
  generate() {
    return {
      value: ulid(),
      metadata: {
        format: 'ulid',
        sortable: true,
        entropyBits: 80,
      },
    }
  },
}
