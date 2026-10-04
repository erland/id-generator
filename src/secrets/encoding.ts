export type SecretEncoding = 'hex' | 'base64' | 'base64url'

function bytesToBinaryString(bytes: Uint8Array): string {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return binary
}

function binaryStringToBytes(binary: string): Uint8Array {
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

export function encodeHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function decodeHex(value: string): Uint8Array {
  if (value.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(value)) {
    throw new Error('Invalid hexadecimal value')
  }

  const bytes = new Uint8Array(value.length / 2)

  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16)
  }

  return bytes
}

export function encodeBase64(bytes: Uint8Array): string {
  return btoa(bytesToBinaryString(bytes))
}

export function decodeBase64(value: string): Uint8Array {
  return binaryStringToBytes(atob(value))
}

export function encodeBase64Url(bytes: Uint8Array): string {
  return encodeBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

export function decodeBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) {
    throw new Error('Invalid Base64URL value')
  }

  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const paddingLength = (4 - (base64.length % 4)) % 4
  return decodeBase64(`${base64}${'='.repeat(paddingLength)}`)
}

export function encodeSecret(bytes: Uint8Array, encoding: SecretEncoding): string {
  switch (encoding) {
    case 'hex':
      return encodeHex(bytes)
    case 'base64':
      return encodeBase64(bytes)
    case 'base64url':
      return encodeBase64Url(bytes)
  }
}
