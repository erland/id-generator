import type { GeneratorDefinition, GeneratorOptions } from '../types/generator'
import { encodeBase64Url } from './encoding'
import {
  DEFAULT_RANDOM_BYTE_LENGTH,
  generateRandomBytes,
} from './randomBytes'

export const SECRET_TOKEN_PRESETS = {
  api: {
    id: 'api-token',
    name: 'API token',
    prefix: 'api_',
    description: 'API-token med ett tydligt api_-prefix och kryptografiskt säker slump.',
  },
  token: {
    id: 'generic-token',
    name: 'Token',
    prefix: 'token_',
    description: 'Generell token med token_-prefix och kryptografiskt säker slump.',
  },
  publicKeyLike: {
    id: 'pk-token',
    name: 'PK token',
    prefix: 'pk_',
    description: 'Token med pk_-prefix för identifierare eller nyckelliknande referenser.',
  },
} as const

export type SecretTokenPresetName = keyof typeof SECRET_TOKEN_PRESETS

export type SecretTokenOptions = GeneratorOptions & {
  byteLength?: number
}

export interface SecretTokenResult {
  value: string
  prefix: string
  byteLength: number
  entropyBits: number
}

export function generateSecretToken(
  prefix: string,
  byteLength: number = DEFAULT_RANDOM_BYTE_LENGTH,
): SecretTokenResult {
  if (!prefix) {
    throw new Error('Secret token prefix must not be empty')
  }

  const random = generateRandomBytes(byteLength)
  const randomPart = encodeBase64Url(random.bytes)

  return {
    value: `${prefix}${randomPart}`,
    prefix,
    byteLength: random.byteLength,
    entropyBits: random.entropyBits,
  }
}

function createSecretTokenGenerator(
  preset: (typeof SECRET_TOKEN_PRESETS)[SecretTokenPresetName],
): GeneratorDefinition<SecretTokenOptions> {
  return {
    id: preset.id,
    name: preset.name,
    category: 'secrets',
    description: preset.description,
    generate(options) {
      const result = generateSecretToken(
        preset.prefix,
        options.byteLength ?? DEFAULT_RANDOM_BYTE_LENGTH,
      )

      return {
        value: result.value,
        metadata: {
          prefix: result.prefix,
          format: 'base64url',
          byteLength: result.byteLength,
          entropyBits: result.entropyBits,
        },
      }
    },
  }
}

export const apiTokenGenerator = createSecretTokenGenerator(
  SECRET_TOKEN_PRESETS.api,
)

export const genericTokenGenerator = createSecretTokenGenerator(
  SECRET_TOKEN_PRESETS.token,
)

export const pkTokenGenerator = createSecretTokenGenerator(
  SECRET_TOKEN_PRESETS.publicKeyLike,
)
