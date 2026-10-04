import { randomCharacters } from '../crypto'
import type { GeneratorDefinition, GeneratorOptions } from '../types/generator'

export const NANO_ID_DEFAULT_LENGTH = 21
export const NANO_ID_URL_ALPHABET =
  '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export type NanoIdOptions = GeneratorOptions & {
  length?: number
  alphabet?: string
}

/**
 * Generates a compact, URL-safe identifier using cryptographically secure,
 * unbiased sampling from the supplied alphabet.
 */
export function nanoId(
  length = NANO_ID_DEFAULT_LENGTH,
  alphabet = NANO_ID_URL_ALPHABET,
): string {
  return randomCharacters(length, alphabet)
}

export const nanoIdGenerator: GeneratorDefinition<NanoIdOptions> = {
  id: 'nano-id',
  name: 'NanoID',
  category: 'identifiers',
  description:
    'Kort URL-säker identifierare med valbar längd och kryptografiskt säker, bias-fri slump.',
  generate(options) {
    const length = options.length ?? NANO_ID_DEFAULT_LENGTH
    const alphabet = options.alphabet ?? NANO_ID_URL_ALPHABET

    return {
      value: nanoId(length, alphabet),
      metadata: {
        format: 'nano-id',
        length,
        alphabetSize: Array.from(alphabet).length,
      },
    }
  },
}
