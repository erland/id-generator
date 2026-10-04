import { describe, expect, it } from 'vitest'
import { hashLocalFile } from './fileHash'

const ABC_SHA256 =
  'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
const ABC_SHA384 =
  'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7'
const ABC_SHA512 =
  'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'

describe('hashLocalFile', () => {
  it('hashes a local file with SHA-256', async () => {
    const file = new File(['abc'], 'abc.txt', { type: 'text/plain' })
    const result = await hashLocalFile(file)

    expect(result.value).toBe(ABC_SHA256)
    expect(result.fileName).toBe('abc.txt')
    expect(result.fileSize).toBe(3)
    expect(result.fileType).toBe('text/plain')
    expect(result.algorithm).toBe('SHA-256')
    expect(result.output).toBe('hex')
  })

  it('supports SHA-384 and SHA-512', async () => {
    const file = new File(['abc'], 'abc.txt')

    await expect(hashLocalFile(file, 'SHA-384')).resolves.toMatchObject({
      value: ABC_SHA384,
      algorithm: 'SHA-384',
    })
    await expect(hashLocalFile(file, 'SHA-512')).resolves.toMatchObject({
      value: ABC_SHA512,
      algorithm: 'SHA-512',
    })
  })

  it('supports base64 output', async () => {
    const file = new File(['abc'], 'abc.txt')
    const result = await hashLocalFile(file, 'SHA-256', 'base64')

    expect(result.value).toBe('ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=')
  })
})
