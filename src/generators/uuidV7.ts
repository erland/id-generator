import { randomBytes } from '../crypto'
import type { GeneratorDefinition } from '../types/generator'

export type UuidV7Options = Record<string, never>

const MAX_UUID_V7_TIMESTAMP = 0xffffffffffff

function formatUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-')
}

function writeTimestamp(bytes: Uint8Array, timestamp: number): void {
  let remaining = timestamp

  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = remaining % 256
    remaining = Math.floor(remaining / 256)
  }
}

/**
 * Generates an RFC 9562 UUID version 7.
 *
 * The first 48 bits contain the Unix timestamp in milliseconds. The remaining
 * payload is cryptographically random, with the version and RFC variant bits
 * set explicitly.
 */
export function uuidV7(timestamp = Date.now()): string {
  if (!Number.isSafeInteger(timestamp) || timestamp < 0 || timestamp > MAX_UUID_V7_TIMESTAMP) {
    throw new RangeError('UUID v7 timestamp must be an integer between 0 and 2^48 - 1.')
  }

  const bytes = randomBytes(16)
  writeTimestamp(bytes, timestamp)

  bytes[6] = (bytes[6] & 0x0f) | 0x70
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  return formatUuid(bytes)
}

export const uuidV7Generator: GeneratorDefinition<UuidV7Options> = {
  id: 'uuid-v7',
  name: 'UUID v7',
  category: 'identifiers',
  description: 'Tidsordningsbart UUID version 7 med millisekundtid och kryptografiskt säker slump.',
  generate() {
    return {
      value: uuidV7(),
      metadata: {
        version: 7,
        format: 'uuid',
        sortable: true,
      },
    }
  },
}
