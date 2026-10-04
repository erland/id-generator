import { describe, expect, it } from 'vitest'
import type { GeneratorDefinition } from '../types/generator'
import { createGeneratorRegistry } from './registry'

interface TestOptions {
  prefix?: string
  [key: string]: string | number | boolean | undefined
}

const testGenerator: GeneratorDefinition<TestOptions> = {
  id: 'test-generator',
  name: 'Test generator',
  category: 'identifiers',
  description: 'Generator used to verify the shared registry contract.',
  generate(options) {
    return {
      value: `${options.prefix ?? 'test'}-value`,
      metadata: { source: 'test' },
    }
  },
}

describe('generator registry', () => {
  it('registers and invokes a generator through the shared interface', async () => {
    const registry = createGeneratorRegistry()
    registry.register(testGenerator)

    await expect(
      registry.generate('test-generator', { prefix: 'demo' }),
    ).resolves.toEqual({
      value: 'demo-value',
      metadata: { source: 'test' },
    })
  })

  it('lists generators by category', () => {
    const registry = createGeneratorRegistry([testGenerator])

    expect(registry.list('identifiers')).toEqual([testGenerator])
    expect(registry.list('secrets')).toEqual([])
  })

  it('rejects duplicate generator ids', () => {
    const registry = createGeneratorRegistry([testGenerator])

    expect(() => registry.register(testGenerator)).toThrow(
      /already registered/i,
    )
  })

  it('rejects unknown generator ids', async () => {
    const registry = createGeneratorRegistry()

    await expect(registry.generate('missing', {})).rejects.toThrow(
      /unknown generator/i,
    )
  })
})
