import { randomCharacters } from '../crypto'
import type { GeneratorDefinition, GeneratorOptions } from '../types/generator'

export const ALPHANUMERIC_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
export const NUMERIC_ALPHABET = '0123456789'
export const RANDOM_IDENTIFIER_DEFAULT_LENGTH = 16

export type RandomIdentifierOptions = GeneratorOptions & {
  length?: number
  prefix?: string
  alphabet?: string
}

export type NumericIdentifierOptions = GeneratorOptions & {
  length?: number
  prefix?: string
}

/**
 * Generates a cryptographically secure identifier where `length` applies only
 * to the random part. The optional prefix is prepended after generation and
 * therefore never reduces the random portion.
 */
export function randomIdentifier(
  length = RANDOM_IDENTIFIER_DEFAULT_LENGTH,
  prefix = '',
  alphabet = ALPHANUMERIC_ALPHABET,
): string {
  return `${prefix}${randomCharacters(length, alphabet)}`
}

export function alphanumericId(
  length = RANDOM_IDENTIFIER_DEFAULT_LENGTH,
  prefix = '',
  alphabet = ALPHANUMERIC_ALPHABET,
): string {
  return randomIdentifier(length, prefix, alphabet)
}

export function numericId(
  length = RANDOM_IDENTIFIER_DEFAULT_LENGTH,
  prefix = '',
): string {
  return randomIdentifier(length, prefix, NUMERIC_ALPHABET)
}

export const alphanumericIdGenerator: GeneratorDefinition<RandomIdentifierOptions> = {
  id: 'alphanumeric',
  name: 'Alfanumeriskt ID',
  category: 'identifiers',
  description:
    'Kryptografiskt säkert ID med valbar längd, prefix och eget alfabet.',
  generate(options) {
    const length = options.length ?? RANDOM_IDENTIFIER_DEFAULT_LENGTH
    const prefix = options.prefix ?? ''
    const alphabet = options.alphabet ?? ALPHANUMERIC_ALPHABET

    return {
      value: alphanumericId(length, prefix, alphabet),
      metadata: {
        format: 'alphanumeric',
        randomLength: length,
        prefixLength: Array.from(prefix).length,
        alphabetSize: Array.from(alphabet).length,
      },
    }
  },
}

export const numericIdGenerator: GeneratorDefinition<NumericIdentifierOptions> = {
  id: 'numeric',
  name: 'Numeriskt ID',
  category: 'identifiers',
  description: 'Kryptografiskt säkert numeriskt ID med valbar längd och prefix.',
  generate(options) {
    const length = options.length ?? RANDOM_IDENTIFIER_DEFAULT_LENGTH
    const prefix = options.prefix ?? ''

    return {
      value: numericId(length, prefix),
      metadata: {
        format: 'numeric',
        randomLength: length,
        prefixLength: Array.from(prefix).length,
        alphabetSize: NUMERIC_ALPHABET.length,
      },
    }
  },
}
