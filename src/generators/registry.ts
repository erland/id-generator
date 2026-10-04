import type {
  GeneratedValue,
  GeneratorCategory,
  GeneratorDefinition,
  GeneratorOptions,
} from '../types/generator'

export interface GeneratorRegistry {
  register<TOptions extends GeneratorOptions>(
    generator: GeneratorDefinition<TOptions>,
  ): void
  get(id: string): GeneratorDefinition | undefined
  list(category?: GeneratorCategory): readonly GeneratorDefinition[]
  generate<TOptions extends GeneratorOptions>(
    id: string,
    options: TOptions,
  ): Promise<GeneratedValue>
}

export function createGeneratorRegistry(
  initialGenerators: readonly GeneratorDefinition[] = [],
): GeneratorRegistry {
  const generators = new Map<string, GeneratorDefinition>()

  const register: GeneratorRegistry['register'] = (generator) => {
    if (!generator.id.trim()) {
      throw new Error('Generator id must not be empty')
    }

    if (generators.has(generator.id)) {
      throw new Error(`Generator with id "${generator.id}" is already registered`)
    }

    generators.set(generator.id, generator as GeneratorDefinition)
  }

  for (const generator of initialGenerators) {
    register(generator)
  }

  return {
    register,
    get(id) {
      return generators.get(id)
    },
    list(category) {
      const registered = [...generators.values()]
      return category
        ? registered.filter((generator) => generator.category === category)
        : registered
    },
    async generate(id, options) {
      const generator = generators.get(id)

      if (!generator) {
        throw new Error(`Unknown generator: "${id}"`)
      }

      return generator.generate(options)
    },
  }
}
