import { GENERIC_ERROR } from '@/shared-exit-codes'

/**
 * Base error class with exit code
 */
export class CLIError extends Error {
  public readonly exitCode: number
  public readonly suggestions?: string[]

  constructor(
    message: string,
    options: {
      exitCode?: number
      cause?: Error
      suggestions?: string[]
    } = {}
  ) {
    super(message, { cause: options.cause })
    this.name = this.constructor.name
    this.exitCode = options.exitCode ?? GENERIC_ERROR
    this.suggestions = options.suggestions
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Validation error
 */
export class ValidationError extends CLIError {
  constructor(message: string, options?: { cause?: Error; suggestions?: string[] }) {
    super(message, { ...options, exitCode: 2 })
  }
}

/**
 * Configuration error
 */
export class ConfigError extends CLIError {
  constructor(message: string, options?: { cause?: Error; suggestions?: string[] }) {
    super(message, { ...options, exitCode: 64 })
  }
}

/**
 * Not found error
 */
export class NotFoundError extends CLIError {
  constructor(resource: string, options?: { cause?: Error; suggestions?: string[] }) {
    super(`${resource} not found`, { ...options, exitCode: 101 })
  }
}

/**
 * Authentication error
 */
export class AuthError extends CLIError {
  constructor(message: string, options?: { cause?: Error; suggestions?: string[] }) {
    super(message, { ...options, exitCode: 100 })
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends CLIError {
  constructor(message: string, options?: { cause?: Error; suggestions?: string[] }) {
    super(message, { ...options, exitCode: 101 })
  }
}

/**
 * Network error
 */
export class NetworkError extends CLIError {
  constructor(message: string, options?: { cause?: Error; suggestions?: string[] }) {
    super(message, { ...options, exitCode: 102 })
  }
}

/**
 * Check if error is a CLI error
 */
export function isCLIError(error: unknown): error is CLIError {
  return error instanceof CLIError
}

/**
 * Format error for display
 */
export function formatError(error: Error): string {
  const lines: string[] = []

  lines.push(`Error: ${error.message}`)

  if (isCLIError(error) && error.suggestions && error.suggestions.length > 0) {
    lines.push('')
    lines.push('Suggestions:')
    error.suggestions.forEach(suggestion => {
      lines.push(`  • ${suggestion}`)
    })
  }

  if (error.cause instanceof Error) {
    lines.push('')
    lines.push(`Caused by: ${error.cause.message}`)
  }

  return lines.join('\n')
}
