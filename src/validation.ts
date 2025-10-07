import { BadgeGenerationError } from './errors.js'
import type { BadgeErrorContext, BadgeGenerationStatus } from './types.js'

type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: Array<{ message: string }> } }

export function parseWithZod<T>(
  schema: { safeParse: (value: unknown) => SafeParseResult<T> },
  value: unknown,
  status: BadgeGenerationStatus,
  context?: BadgeErrorContext
): T {
  const result = schema.safeParse(value)
  if (result.success) {
    return result.data
  }

  const message = result.error.issues[0]?.message ?? 'Validation failed.'
  throw new BadgeGenerationError(status, message, context)
}
