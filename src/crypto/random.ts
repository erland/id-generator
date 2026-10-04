const UINT32_RANGE = 0x1_0000_0000
const GET_RANDOM_VALUES_MAX_BYTES = 65_536

function getCrypto(): Crypto {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Web Crypto API is not available in this environment')
  }

  return globalThis.crypto
}

/**
 * Returns cryptographically secure random bytes.
 * Large requests are split because getRandomValues() accepts at most 65,536 bytes per call.
 */
export function randomBytes(length: number): Uint8Array {
  if (!Number.isSafeInteger(length) || length < 0) {
    throw new RangeError('Random byte length must be a non-negative safe integer')
  }

  const result = new Uint8Array(length)
  const crypto = getCrypto()

  for (let offset = 0; offset < length; offset += GET_RANDOM_VALUES_MAX_BYTES) {
    const end = Math.min(offset + GET_RANDOM_VALUES_MAX_BYTES, length)
    crypto.getRandomValues(result.subarray(offset, end))
  }

  return result
}

/**
 * Returns a cryptographically secure integer in the range 0 <= value < maxExclusive.
 * Rejection sampling avoids modulo bias.
 */
export function randomInteger(maxExclusive: number): number {
  if (
    !Number.isSafeInteger(maxExclusive) ||
    maxExclusive <= 0 ||
    maxExclusive > UINT32_RANGE
  ) {
    throw new RangeError(
      `maxExclusive must be a safe integer between 1 and ${UINT32_RANGE}`,
    )
  }

  const crypto = getCrypto()
  const sample = new Uint32Array(1)
  const acceptanceLimit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive

  do {
    crypto.getRandomValues(sample)
  } while (sample[0] >= acceptanceLimit)

  return sample[0] % maxExclusive
}

function alphabetCharacters(alphabet: string): string[] {
  const characters = Array.from(alphabet)

  if (characters.length < 2) {
    throw new RangeError('Alphabet must contain at least two characters')
  }

  if (new Set(characters).size !== characters.length) {
    throw new RangeError('Alphabet must not contain duplicate characters')
  }

  return characters
}

/**
 * Returns a cryptographically secure string sampled uniformly from the supplied alphabet.
 */
export function randomCharacters(length: number, alphabet: string): string {
  if (!Number.isSafeInteger(length) || length < 0) {
    throw new RangeError('Random character length must be a non-negative safe integer')
  }

  const characters = alphabetCharacters(alphabet)
  let result = ''

  for (let index = 0; index < length; index += 1) {
    result += characters[randomInteger(characters.length)]
  }

  return result
}
