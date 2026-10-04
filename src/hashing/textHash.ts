import type { GeneratorDefinition, GeneratorOptions } from '../types/generator'
import { encodeBase64, encodeHex } from '../secrets/encoding'

export const HASH_ALGORITHMS = ['SHA-256', 'SHA-384', 'SHA-512'] as const
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number]

export const HASH_OUTPUTS = ['hex', 'base64'] as const
export type HashOutput = (typeof HASH_OUTPUTS)[number]

export type TextHashOptions = GeneratorOptions & {
  text?: string
  algorithm?: HashAlgorithm
  output?: HashOutput
}

export interface TextHashResult {
  value: string
  algorithm: HashAlgorithm
  output: HashOutput
  inputByteLength: number
}

function assertHashAlgorithm(algorithm: string): asserts algorithm is HashAlgorithm {
  if (!HASH_ALGORITHMS.includes(algorithm as HashAlgorithm)) {
    throw new Error(`Unsupported hash algorithm: ${algorithm}`)
  }
}

function assertHashOutput(output: string): asserts output is HashOutput {
  if (!HASH_OUTPUTS.includes(output as HashOutput)) {
    throw new Error(`Unsupported hash output: ${output}`)
  }
}

export async function hashBytes(
  bytes: Uint8Array,
  algorithm: HashAlgorithm,
): Promise<Uint8Array> {
  assertHashAlgorithm(algorithm)

  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto SubtleCrypto is not available in this environment')
  }

  const data = new Uint8Array(bytes.byteLength)
  data.set(bytes)
  const digest = await globalThis.crypto.subtle.digest(algorithm, data)
  return new Uint8Array(digest)
}

export async function hashText(
  text: string,
  algorithm: HashAlgorithm = 'SHA-256',
  output: HashOutput = 'hex',
): Promise<TextHashResult> {
  assertHashAlgorithm(algorithm)
  assertHashOutput(output)

  const inputBytes = new TextEncoder().encode(text)
  const digestBytes = await hashBytes(inputBytes, algorithm)

  return {
    value: output === 'hex' ? encodeHex(digestBytes) : encodeBase64(digestBytes),
    algorithm,
    output,
    inputByteLength: inputBytes.byteLength,
  }
}

export const textHashGenerator: GeneratorDefinition<TextHashOptions> = {
  id: 'text-hash',
  name: 'Text hash',
  category: 'hash',
  description: 'Beräkna SHA-256, SHA-384 eller SHA-512 för text lokalt i webbläsaren.',
  async generate(options) {
    const result = await hashText(
      options.text ?? '',
      options.algorithm ?? 'SHA-256',
      options.output ?? 'hex',
    )

    return {
      value: result.value,
      metadata: {
        algorithm: result.algorithm,
        output: result.output,
        inputByteLength: result.inputByteLength,
      },
    }
  },
}
