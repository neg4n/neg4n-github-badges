import type { BadgeErrorContext, BadgeGenerationStatus } from './types.js'

export class BadgeGenerationError extends Error {
  readonly status: BadgeGenerationStatus
  readonly context: BadgeErrorContext | undefined

  constructor(status: BadgeGenerationStatus, message: string, context?: BadgeErrorContext) {
    super(message)
    this.name = 'BadgeGenerationError'
    this.status = status
    this.context = context
  }
}
