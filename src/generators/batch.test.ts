import { describe, expect, it } from 'vitest'
import type { GeneratorDefinition } from '../types/generator'
import { BATCH_COUNT_PRESETS, batchValuesToText, generateBatch, validateBatchCount } from './batch'

const sequentialGenerator: GeneratorDefinition = {
  id: 'sequential-test',
  name: 'Sequential test generator',
  category: 'identifiers',
  description: 'Test generator',
  generate: (() => {
    let counter = 0
    return () => ({ value: `value-${++counter}` })
  })(),
}

describe('batch generation', () => {
  it('exposes the required presets', () => {
    expect(BATCH_COUNT_PRESETS).toEqual([1, 5, 10, 100])
  })

  it('generates the requested number in stable order', async () => {
    const values = await generateBatch(sequentialGenerator, {}, 5)
    expect(values).toHaveLength(5)
    expect(values.map((item) => item.value)).toEqual([
      'value-1',
      'value-2',
      'value-3',
      'value-4',
      'value-5',
    ])
  })

  it('joins Copy all values with one LF and no trailing newline', () => {
    expect(batchValuesToText([{ value: 'a' }, { value: 'b' }, { value: 'c' }])).toBe('a\nb\nc')
  })

  it.each([0, -1, 1001, 1.5, Number.NaN])('rejects invalid batch count %s', (count) => {
    expect(() => validateBatchCount(count)).toThrow(RangeError)
  })
})
