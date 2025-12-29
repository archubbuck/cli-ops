'use strict'
/**
 * Standard exit codes for CLI applications
 *
 * Following conventions from:
 * - BSD sysexits.h
 * - POSIX standards
 * - Common CLI practices
 */
Object.defineProperty(exports, '__esModule', { value: true })
exports.EXIT_CODE_DESCRIPTIONS =
  exports.CANCELLED =
  exports.ALREADY_EXISTS =
  exports.NOT_FOUND =
  exports.VALIDATION_ERROR =
  exports.API_ERROR =
  exports.NETWORK_ERROR =
  exports.AUTHZ_ERROR =
  exports.AUTH_ERROR =
  exports.SYSTEM_CONFIG_ERROR =
  exports.NO_PERMISSION =
  exports.PROTOCOL_ERROR =
  exports.TEMP_FAIL =
  exports.IO_ERROR =
  exports.CANT_CREATE =
  exports.OS_FILE_ERROR =
  exports.OS_ERROR =
  exports.SOFTWARE_ERROR =
  exports.UNAVAILABLE =
  exports.NO_HOST =
  exports.NO_USER =
  exports.NO_INPUT =
  exports.DATA_ERROR =
  exports.CONFIG_ERROR =
  exports.MISUSE =
  exports.GENERIC_ERROR =
  exports.SUCCESS =
    void 0
exports.getExitCodeDescription = getExitCodeDescription
exports.isSuccess = isSuccess
exports.isError = isError
exports.isRetryable = isRetryable
/**
 * Success - Command completed successfully
 */
exports.SUCCESS = 0
/**
 * Generic error - Catch-all for unspecified errors
 */
exports.GENERIC_ERROR = 1
/**
 * Misuse of command - Invalid arguments, flags, or usage
 */
exports.MISUSE = 2
// BSD sysexits.h compatible codes (64-78)
/**
 * Configuration error - Invalid or missing configuration
 */
exports.CONFIG_ERROR = 64
/**
 * Data format error - Invalid input data format
 */
exports.DATA_ERROR = 65
/**
 * Cannot open input - Input file or resource unavailable
 */
exports.NO_INPUT = 66
/**
 * User does not exist - Addressee unknown
 */
exports.NO_USER = 67
/**
 * Host name unknown - Cannot resolve hostname
 */
exports.NO_HOST = 68
/**
 * Service unavailable - Required service is unavailable
 */
exports.UNAVAILABLE = 69
/**
 * Internal software error - Unexpected software condition
 */
exports.SOFTWARE_ERROR = 70
/**
 * System error - Operating system error (fork failed, etc)
 */
exports.OS_ERROR = 71
/**
 * Critical OS file missing - Cannot open required system file
 */
exports.OS_FILE_ERROR = 72
/**
 * Cannot create output - Cannot create output file
 */
exports.CANT_CREATE = 73
/**
 * Input/output error - Error during I/O operation
 */
exports.IO_ERROR = 74
/**
 * Temporary failure - Retry may succeed
 */
exports.TEMP_FAIL = 75
/**
 * Protocol error - Remote system returned invalid response
 */
exports.PROTOCOL_ERROR = 76
/**
 * Permission denied - Insufficient permissions
 */
exports.NO_PERMISSION = 77
/**
 * Configuration error - System configuration problem
 */
exports.SYSTEM_CONFIG_ERROR = 78
// Custom CLI-specific codes (100+)
/**
 * Authentication failed - Invalid credentials or token
 */
exports.AUTH_ERROR = 100
/**
 * Authorization failed - Insufficient privileges
 */
exports.AUTHZ_ERROR = 101
/**
 * Network error - Connection failed or timeout
 */
exports.NETWORK_ERROR = 102
/**
 * API error - Remote API returned error
 */
exports.API_ERROR = 103
/**
 * Validation error - Data validation failed
 */
exports.VALIDATION_ERROR = 104
/**
 * Resource not found - Requested resource does not exist
 */
exports.NOT_FOUND = 105
/**
 * Resource already exists - Conflict with existing resource
 */
exports.ALREADY_EXISTS = 106
/**
 * Operation cancelled - User cancelled operation
 */
exports.CANCELLED = 130
/**
 * Map of exit codes to human-readable descriptions
 */
exports.EXIT_CODE_DESCRIPTIONS = {
  [exports.SUCCESS]: 'Success',
  [exports.GENERIC_ERROR]: 'Generic error',
  [exports.MISUSE]: 'Invalid command usage',
  [exports.CONFIG_ERROR]: 'Configuration error',
  [exports.DATA_ERROR]: 'Data format error',
  [exports.NO_INPUT]: 'Cannot open input',
  [exports.NO_USER]: 'User does not exist',
  [exports.NO_HOST]: 'Host name unknown',
  [exports.UNAVAILABLE]: 'Service unavailable',
  [exports.SOFTWARE_ERROR]: 'Internal software error',
  [exports.OS_ERROR]: 'System error',
  [exports.OS_FILE_ERROR]: 'Critical OS file missing',
  [exports.CANT_CREATE]: 'Cannot create output',
  [exports.IO_ERROR]: 'Input/output error',
  [exports.TEMP_FAIL]: 'Temporary failure',
  [exports.PROTOCOL_ERROR]: 'Protocol error',
  [exports.NO_PERMISSION]: 'Permission denied',
  [exports.SYSTEM_CONFIG_ERROR]: 'System configuration error',
  [exports.AUTH_ERROR]: 'Authentication failed',
  [exports.AUTHZ_ERROR]: 'Authorization failed',
  [exports.NETWORK_ERROR]: 'Network error',
  [exports.API_ERROR]: 'API error',
  [exports.VALIDATION_ERROR]: 'Validation error',
  [exports.NOT_FOUND]: 'Resource not found',
  [exports.ALREADY_EXISTS]: 'Resource already exists',
  [exports.CANCELLED]: 'Operation cancelled',
}
/**
 * Get human-readable description for an exit code
 */
function getExitCodeDescription(code) {
  return exports.EXIT_CODE_DESCRIPTIONS[code] ?? `Unknown exit code: ${code}`
}
/**
 * Check if exit code indicates success
 */
function isSuccess(code) {
  return code === exports.SUCCESS
}
/**
 * Check if exit code indicates error
 */
function isError(code) {
  return code !== exports.SUCCESS
}
/**
 * Check if exit code indicates a temporary/retryable failure
 */
function isRetryable(code) {
  return (
    code === exports.TEMP_FAIL || code === exports.NETWORK_ERROR || code === exports.UNAVAILABLE
  )
}
//# sourceMappingURL=constants.js.map
