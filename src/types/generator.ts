export const GENERATOR_CATEGORIES = [
  'identifiers',
  'secrets',
  'hash',
  'keys',
] as const

export type GeneratorCategory = (typeof GENERATOR_CATEGORIES)[number]

export type GeneratorOptionValue = string | number | boolean | undefined

export type GeneratorOptions = Readonly<Record<string, GeneratorOptionValue>>

export interface GeneratedValue {
  value: string
  label?: string
  metadata?: Readonly<Record<string, string | number | boolean>>
}

export interface GeneratorDefinition<
  TOptions extends GeneratorOptions = GeneratorOptions,
> {
  id: string
  name: string
  category: GeneratorCategory
  description: string
  generate(options: TOptions): GeneratedValue | Promise<GeneratedValue>
}
