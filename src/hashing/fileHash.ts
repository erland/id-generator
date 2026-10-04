import { encodeBase64, encodeHex } from '../secrets/encoding'
import {
  HASH_ALGORITHMS,
  HASH_OUTPUTS,
  hashBytes,
  type HashAlgorithm,
  type HashOutput,
} from './textHash'

export interface FileHashResult {
  value: string
  algorithm: HashAlgorithm
  output: HashOutput
  fileName: string
  fileSize: number
  fileType: string
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

/**
 * Hash a browser-local File entirely on the client.
 *
 * The function only calls File.arrayBuffer() and Web Crypto. It performs no
 * network requests and does not persist either the File object or its bytes.
 */
export async function hashLocalFile(
  file: File,
  algorithm: HashAlgorithm = 'SHA-256',
  output: HashOutput = 'hex',
): Promise<FileHashResult> {
  assertHashAlgorithm(algorithm)
  assertHashOutput(output)

  const bytes = new Uint8Array(await file.arrayBuffer())
  const digestBytes = await hashBytes(bytes, algorithm)

  return {
    value: output === 'hex' ? encodeHex(digestBytes) : encodeBase64(digestBytes),
    algorithm,
    output,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  }
}
