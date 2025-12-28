/**
 * Standard exit codes for CLI applications
 * 
 * Following conventions from:
 * - BSD sysexits.h
 * - POSIX standards
 * - Common CLI practices
 */

/**
 * Success - Command completed successfully
 */
export const SUCCESS = 0

/**
 * Generic error - Catch-all for unspecified errors
 */
export const GENERIC_ERROR = 1

/**
 * Misuse of command - Invalid arguments, flags, or usage
 */
export const MISUSE = 2

// BSD sysexits.h compatible codes (64-78)

/**
 * Configuration error - Invalid or missing configuration
 */
export const CONFIG_ERROR = 64

/**
 * Data format error - Invalid input data format
 */
export const DATA_ERROR = 65

/**
 * Cannot open input - Input file or resource unavailable
 */
export const NO_INPUT = 66

/**
 * User does not exist - Addressee unknown
 */
export const NO_USER = 67

/**
 * Host name unknown - Cannot resolve hostname
 */
export const NO_HOST = 68

/**
 * Service unavailable - Required service is unavailable
 */
export const UNAVAILABLE = 69

/**
 * Internal software error - Unexpected software condition
 */
export const SOFTWARE_ERROR = 70

/**
 * System error - Operating system error (fork failed, etc)
 */
export const OS_ERROR = 71

/**
 * Critical OS file missing - Cannot open required system file
 */
export const OS_FILE_ERROR = 72

/**
 * Cannot create output - Cannot create output file
 */
export const CANT_CREATE = 73

/**
 * Input/output error - Error during I/O operation
 */
export const IO_ERROR = 74

/**
 * Temporary failure - Retry may succeed
 */
export const TEMP_FAIL = 75

/**
 * Protocol error - Remote system returned invalid response
 */
export const PROTOCOL_ERROR = 76

/**
 * Permission denied - Insufficient permissions
 */
export const NO_PERMISSION = 77

/**
 * Configuration error - System configuration problem
 */
export const SYSTEM_CONFIG_ERROR = 78

// Custom CLI-specific codes (100+)

/**
 * Authentication failed - Invalid credentials or token
 */
export const AUTH_ERROR = 100

/**
 * Authorization failed - Insufficient privileges
 */
export const AUTHZ_ERROR = 101

/**
 * Network error - Connection failed or timeout
 */
export const NETWORK_ERROR = 102

/**
 * API error - Remote API returned error
 */
export const API_ERROR = 103

/**
 * Validation error - Data validation failed
 */
export const VALIDATION_ERROR = 104

/**
 * Resource not found - Requested resource does not exist
 */
export const NOT_FOUND = 105

/**
 * Resource already exists - Conflict with existing resource
 */
export const ALREADY_EXISTS = 106

/**
 * Operation cancelled - User cancelled operation
 */
export const CANCELLED = 130

/**
 * Map of exit codes to human-readable descriptions
 */
export const EXIT_CODE_DESCRIPTIONS: Record<number, string> = {
  [SUCCESS]: 'Success',
  [GENERIC_ERROR]: 'Generic error',
  [MISUSE]: 'Invalid command usage',
  [CONFIG_ERROR]: 'Configuration error',
  [DATA_ERROR]: 'Data format error',
  [NO_INPUT]: 'Cannot open input',
  [NO_USER]: 'User does not exist',
  [NO_HOST]: 'Host name unknown',
  [UNAVAILABLE]: 'Service unavailable',
  [SOFTWARE_ERROR]: 'Internal software error',
  [OS_ERROR]: 'System error',
  [OS_FILE_ERROR]: 'Critical OS file missing',
  [CANT_CREATE]: 'Cannot create output',
  [IO_ERROR]: 'Input/output error',
  [TEMP_FAIL]: 'Temporary failure',
  [PROTOCOL_ERROR]: 'Protocol error',
  [NO_PERMISSION]: 'Permission denied',
  [SYSTEM_CONFIG_ERROR]: 'System configuration error',
  [AUTH_ERROR]: 'Authentication failed',
  [AUTHZ_ERROR]: 'Authorization failed',
  [NETWORK_ERROR]: 'Network error',
  [API_ERROR]: 'API error',
  [VALIDATION_ERROR]: 'Validation error',
  [NOT_FOUND]: 'Resource not found',
  [ALREADY_EXISTS]: 'Resource already exists',
  [CANCELLED]: 'Operation cancelled',
}

/**
 * Get human-readable description for an exit code
 */
export function getExitCodeDescription(code: number): string {
  return EXIT_CODE_DESCRIPTIONS[code] ?? `Unknown exit code: ${code}`
}

/**
 * Check if exit code indicates success
 */
export function isSuccess(code: number): boolean {
  return code === SUCCESS
}

/**
 * Check if exit code indicates error
 */
export function isError(code: number): boolean {
  return code !== SUCCESS
}

/**
 * Check if exit code indicates a temporary/retryable failure
 */
export function isRetryable(code: number): boolean {
  return code === TEMP_FAIL || code === NETWORK_ERROR || code === UNAVAILABLE
}
