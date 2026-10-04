import type { GeneratorDefinition, GeneratorOptions } from '../types/generator'
import {
  DEFAULT_RANDOM_BYTE_LENGTH,
  generateRandomBytes,
} from './randomBytes'
import {
  encodeBase64,
  encodeBase64Url,
  encodeHex,
  type SecretEncoding,
} from './encoding'

export type EncodedRandomOptions = GeneratorOptions & {
  byteLength?: number
}

function generateEncodedRandom(
  encoding: SecretEncoding,
  byteLength: number = DEFAULT_RANDOM_BYTE_LENGTH,
): {
  value: string
  byteLength: number
  entropyBits: number
} {
  const random = generateRandomBytes(byteLength)

  const value =
    encoding === 'hex'
      ? encodeHex(random.bytes)
      : encoding === 'base64'
        ? encodeBase64(random.bytes)
        : encodeBase64Url(random.bytes)

  return {
    value,
    byteLength: random.byteLength,
    entropyBits: random.entropyBits,
  }
}

function createEncodedRandomGenerator(
  id: string,
  name: string,
  encoding: SecretEncoding,
  description: string,
): GeneratorDefinition<EncodedRandomOptions> {
  return {
    id,
    name,
    category: 'secrets',
    description,
    generate(options) {
      const result = generateEncodedRandom(
        encoding,
        options.byteLength ?? DEFAULT_RANDOM_BYTE_LENGTH,
      )

      return {
        value: result.value,
        metadata: {
          format: encoding,
          byteLength: result.byteLength,
          entropyBits: result.entropyBits,
        },
      }
    },
  }
}

export const hexSecretGenerator = createEncodedRandomGenerator(
  'random-hex',
  'Hex',
  'hex',
  'Kryptografiskt säkra slumpbytes kodade som hexadecimal text.',
)

export const base64SecretGenerator = createEncodedRandomGenerator(
  'random-base64',
  'Base64',
  'base64',
  'Kryptografiskt säkra slumpbytes kodade som Base64.',
)

export const base64UrlSecretGenerator = createEncodedRandomGenerator(
  'random-base64url',
  'Base64URL',
  'base64url',
  'Kryptografiskt säkra slumpbytes kodade som URL-säker Base64 utan padding.',
)
