import type { GeneratedValue, GeneratorDefinition, GeneratorOptions } from '../types/generator'

export const BATCH_COUNT_PRESETS = [1, 5, 10, 100] as const
export type BatchCountPreset = (typeof BATCH_COUNT_PRESETS)[number]

export function validateBatchCount(count: number): void {
  if (!Number.isSafeInteger(count) || count < 1 || count > 1000) {
    throw new RangeError('Batch count must be a safe integer between 1 and 1000')
  }
}

export async function generateBatch<TOptions extends GeneratorOptions>(
  generator: GeneratorDefinition<TOptions>,
  options: TOptions,
  count: number,
): Promise<GeneratedValue[]> {
  validateBatchCount(count)

  const values: GeneratedValue[] = []
  for (let index = 0; index < count; index += 1) {
    values.push(await generator.generate(options))
  }

  return values
}

export function batchValuesToText(values: readonly GeneratedValue[]): string {
  return values.map((item) => item.value).join('\n')
}
