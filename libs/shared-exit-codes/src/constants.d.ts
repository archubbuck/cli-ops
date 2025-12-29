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
export declare const SUCCESS = 0
/**
 * Generic error - Catch-all for unspecified errors
 */
export declare const GENERIC_ERROR = 1
/**
 * Misuse of command - Invalid arguments, flags, or usage
 */
export declare const MISUSE = 2
/**
 * Configuration error - Invalid or missing configuration
 */
export declare const CONFIG_ERROR = 64
/**
 * Data format error - Invalid input data format
 */
export declare const DATA_ERROR = 65
/**
 * Cannot open input - Input file or resource unavailable
 */
export declare const NO_INPUT = 66
/**
 * User does not exist - Addressee unknown
 */
export declare const NO_USER = 67
/**
 * Host name unknown - Cannot resolve hostname
 */
export declare const NO_HOST = 68
/**
 * Service unavailable - Required service is unavailable
 */
export declare const UNAVAILABLE = 69
/**
 * Internal software error - Unexpected software condition
 */
export declare const SOFTWARE_ERROR = 70
/**
 * System error - Operating system error (fork failed, etc)
 */
export declare const OS_ERROR = 71
/**
 * Critical OS file missing - Cannot open required system file
 */
export declare const OS_FILE_ERROR = 72
/**
 * Cannot create output - Cannot create output file
 */
export declare const CANT_CREATE = 73
/**
 * Input/output error - Error during I/O operation
 */
export declare const IO_ERROR = 74
/**
 * Temporary failure - Retry may succeed
 */
export declare const TEMP_FAIL = 75
/**
 * Protocol error - Remote system returned invalid response
 */
export declare const PROTOCOL_ERROR = 76
/**
 * Permission denied - Insufficient permissions
 */
export declare const NO_PERMISSION = 77
/**
 * Configuration error - System configuration problem
 */
export declare const SYSTEM_CONFIG_ERROR = 78
/**
 * Authentication failed - Invalid credentials or token
 */
export declare const AUTH_ERROR = 100
/**
 * Authorization failed - Insufficient privileges
 */
export declare const AUTHZ_ERROR = 101
/**
 * Network error - Connection failed or timeout
 */
export declare const NETWORK_ERROR = 102
/**
 * API error - Remote API returned error
 */
export declare const API_ERROR = 103
/**
 * Validation error - Data validation failed
 */
export declare const VALIDATION_ERROR = 104
/**
 * Resource not found - Requested resource does not exist
 */
export declare const NOT_FOUND = 105
/**
 * Resource already exists - Conflict with existing resource
 */
export declare const ALREADY_EXISTS = 106
/**
 * Operation cancelled - User cancelled operation
 */
export declare const CANCELLED = 130
/**
 * Map of exit codes to human-readable descriptions
 */
export declare const EXIT_CODE_DESCRIPTIONS: Record<number, string>
/**
 * Get human-readable description for an exit code
 */
export declare function getExitCodeDescription(code: number): string
/**
 * Check if exit code indicates success
 */
export declare function isSuccess(code: number): boolean
/**
 * Check if exit code indicates error
 */
export declare function isError(code: number): boolean
/**
 * Check if exit code indicates a temporary/retryable failure
 */
export declare function isRetryable(code: number): boolean
//# sourceMappingURL=constants.d.ts.map
