# Shared Exit Codes

Standardized exit codes for all CLI applications in the workspace.

## Usage

```typescript
import {
  SUCCESS,
  GENERIC_ERROR,
  CONFIG_ERROR,
  NETWORK_ERROR,
  getExitCodeDescription,
  isRetryable,
} from '@/shared-exit-codes'

// Exit with specific code
process.exit(CONFIG_ERROR)

// Check if operation succeeded
if (exitCode === SUCCESS) {
  console.log('Operation completed successfully')
}

// Get human-readable description
console.log(getExitCodeDescription(CONFIG_ERROR))
// Output: "Configuration error"

// Check if error is retryable
if (isRetryable(exitCode)) {
  console.log('Operation may succeed if retried')
}
```

## Exit Code Reference

### Success (0)
- `SUCCESS` (0) - Command completed successfully

### Generic Errors (1-2)
- `GENERIC_ERROR` (1) - Catch-all for unspecified errors
- `MISUSE` (2) - Invalid arguments, flags, or usage

### BSD sysexits.h Compatible (64-78)
- `CONFIG_ERROR` (64) - Invalid or missing configuration
- `DATA_ERROR` (65) - Invalid input data format
- `NO_INPUT` (66) - Input file or resource unavailable
- `NO_USER` (67) - User does not exist
- `NO_HOST` (68) - Cannot resolve hostname
- `UNAVAILABLE` (69) - Required service unavailable
- `SOFTWARE_ERROR` (70) - Internal software error
- `OS_ERROR` (71) - Operating system error
- `OS_FILE_ERROR` (72) - Required system file missing
- `CANT_CREATE` (73) - Cannot create output file
- `IO_ERROR` (74) - I/O operation error
- `TEMP_FAIL` (75) - Temporary failure (retry may succeed)
- `PROTOCOL_ERROR` (76) - Protocol/communication error
- `NO_PERMISSION` (77) - Insufficient permissions
- `SYSTEM_CONFIG_ERROR` (78) - System configuration problem

### Custom CLI Codes (100+)
- `AUTH_ERROR` (100) - Authentication failed
- `AUTHZ_ERROR` (101) - Authorization failed  
- `NETWORK_ERROR` (102) - Network connection error
- `API_ERROR` (103) - Remote API error
- `VALIDATION_ERROR` (104) - Data validation failed
- `NOT_FOUND` (105) - Resource not found
- `ALREADY_EXISTS` (106) - Resource conflict
- `CANCELLED` (130) - User cancelled operation

## Utility Functions

### `getExitCodeDescription(code: number): string`
Returns human-readable description for any exit code.

### `isSuccess(code: number): boolean`
Returns `true` if code indicates success (0).

### `isError(code: number): boolean`
Returns `true` if code indicates error (non-zero).

### `isRetryable(code: number): boolean`
Returns `true` if error may succeed on retry (TEMP_FAIL, NETWORK_ERROR, UNAVAILABLE).

## Best Practices

1. **Always use constants** - Never use magic numbers
2. **Be specific** - Use most specific code for the error condition
3. **Document usage** - Explain which codes your command uses
4. **Handle gracefully** - Provide helpful error messages with exit codes
5. **Consider retryability** - Use TEMP_FAIL for transient errors

## Examples

### Configuration Error
```typescript
if (!config.isValid()) {
  console.error('Invalid configuration in config.json')
  process.exit(CONFIG_ERROR)
}
```

### Network Error with Retry Suggestion
```typescript
if (isRetryable(error.exitCode)) {
  console.error(`${error.message} (temporary failure, retry may succeed)`)
  process.exit(TEMP_FAIL)
}
```

### Permission Denied
```typescript
if (!hasPermission) {
  console.error('Permission denied. Run with sudo or check file permissions.')
  process.exit(NO_PERMISSION)
}
```

## ADHD/OCD Benefits

- **Predictable** - Same codes always mean same thing
- **Debuggable** - Easy to identify exact failure type
- **Scriptable** - Shell scripts can make decisions based on codes
- **Documented** - No guessing what exit code means
- **Consistent** - All CLIs use same system
