import { randomBytes } from '../crypto'
import type { GeneratorDefinition } from '../types/generator'

export type UuidV4Options = Record<string, never>

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

/**
 * Generates an RFC 4122 / RFC 9562 UUID version 4.
 * Uses crypto.randomUUID() when available and falls back to random bytes while
 * explicitly setting the UUID version and variant bits.
 */
export function uuidV4(): string {
  const crypto = globalThis.crypto

  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  const bytes = randomBytes(16)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  return formatUuid(bytes)
}

export const uuidV4Generator: GeneratorDefinition<UuidV4Options> = {
  id: 'uuid-v4',
  name: 'UUID v4',
  category: 'identifiers',
  description: 'Slumpbaserat UUID version 4 med kryptografiskt säker slump.',
  generate() {
    return {
      value: uuidV4(),
      metadata: {
        version: 4,
        format: 'uuid',
      },
    }
  },
}
