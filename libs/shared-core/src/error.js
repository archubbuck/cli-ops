'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.NetworkError =
  exports.AuthorizationError =
  exports.AuthError =
  exports.NotFoundError =
  exports.ConfigError =
  exports.ValidationError =
  exports.CLIError =
    void 0
exports.isCLIError = isCLIError
exports.formatError = formatError
const shared_exit_codes_1 = require('@cli-ops/shared-exit-codes')
/**
 * Base error class with exit code
 */
class CLIError extends Error {
  exitCode
  suggestions
  constructor(message, options = {}) {
    super(message, { cause: options.cause })
    this.name = this.constructor.name
    this.exitCode = options.exitCode ?? shared_exit_codes_1.GENERIC_ERROR
    this.suggestions = options.suggestions
    Error.captureStackTrace(this, this.constructor)
  }
}
exports.CLIError = CLIError
/**
 * Validation error
 */
class ValidationError extends CLIError {
  constructor(message, options) {
    super(message, { ...options, exitCode: 2 })
  }
}
exports.ValidationError = ValidationError
/**
 * Configuration error
 */
class ConfigError extends CLIError {
  constructor(message, options) {
    super(message, { ...options, exitCode: 64 })
  }
}
exports.ConfigError = ConfigError
/**
 * Not found error
 */
class NotFoundError extends CLIError {
  constructor(resource, options) {
    super(`${resource} not found`, { ...options, exitCode: 101 })
  }
}
exports.NotFoundError = NotFoundError
/**
 * Authentication error
 */
class AuthError extends CLIError {
  constructor(message, options) {
    super(message, { ...options, exitCode: 100 })
  }
}
exports.AuthError = AuthError
/**
 * Authorization error
 */
class AuthorizationError extends CLIError {
  constructor(message, options) {
    super(message, { ...options, exitCode: 101 })
  }
}
exports.AuthorizationError = AuthorizationError
/**
 * Network error
 */
class NetworkError extends CLIError {
  constructor(message, options) {
    super(message, { ...options, exitCode: 102 })
  }
}
exports.NetworkError = NetworkError
/**
 * Check if error is a CLI error
 */
function isCLIError(error) {
  return error instanceof CLIError
}
/**
 * Format error for display
 */
function formatError(error) {
  const lines = []
  lines.push(`Error: ${error.message}`)
  if (isCLIError(error) && error.suggestions && error.suggestions.length > 0) {
    lines.push('')
    lines.push('Suggestions:')
    error.suggestions.forEach((suggestion) => {
      lines.push(`  • ${suggestion}`)
    })
  }
  if (error.cause instanceof Error) {
    lines.push('')
    lines.push(`Caused by: ${error.cause.message}`)
  }
  return lines.join('\n')
}
//# sourceMappingURL=error.js.map
