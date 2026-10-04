import { describe, expect, it } from 'vitest'
import { hashText, textHashGenerator } from './textHash'

describe('hashText', () => {
  it('matches the SHA-256 standard vector for abc', async () => {
    const result = await hashText('abc', 'SHA-256', 'hex')

    expect(result.value).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('matches the SHA-384 standard vector for abc', async () => {
    const result = await hashText('abc', 'SHA-384', 'hex')

    expect(result.value).toBe(
      'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7',
    )
  })

  it('matches the SHA-512 standard vector for abc', async () => {
    const result = await hashText('abc', 'SHA-512', 'hex')

    expect(result.value).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    )
  })

  it('can return Base64 output', async () => {
    const result = await hashText('abc', 'SHA-256', 'base64')

    expect(result.value).toBe('ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=')
  })

  it('encodes input as UTF-8', async () => {
    const result = await hashText('å', 'SHA-256', 'hex')

    expect(result.inputByteLength).toBe(2)
  })
})

describe('textHashGenerator', () => {
  it('exposes hash metadata through the generator contract', async () => {
    const generated = await textHashGenerator.generate({
      text: 'abc',
      algorithm: 'SHA-384',
      output: 'base64',
    })

    expect(generated.metadata).toEqual({
      algorithm: 'SHA-384',
      output: 'base64',
      inputByteLength: 3,
    })
  })
})
