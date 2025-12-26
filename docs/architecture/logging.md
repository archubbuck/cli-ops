# Logging Architecture

## Overview

The logging system provides structured, consistent logging across all three CLIs via the `@cli-ops/shared-logger` package. It supports multiple output formats, log levels, and context-aware logging for debugging and monitoring.

## Architecture

### Core Components

```
@cli-ops/shared-logger
├── Logger class
│   ├── Log level filtering (debug, info, warn, error)
│   ├── Format handlers (pretty, json)
│   └── Transport configuration
├── Context injection
│   ├── Command name
│   ├── Timestamps
│   └── Process metadata
└── Output streams
    ├── stdout (info, debug)
    └── stderr (warn, error)
```

### Log Levels

Ordered by severity (ascending):

1. **debug** - Detailed diagnostic information for troubleshooting
2. **info** - General informational messages about normal operations
3. **warn** - Potentially problematic situations that don't stop execution
4. **error** - Error messages for failures that require attention

### Output Formats

#### Pretty Format (Default)

Human-readable output with colors and symbols:

```
✓ Task created successfully
⚠ Configuration file not found, using defaults
✗ Failed to connect to API
ℹ Loading configuration from ~/.config/cli-alpha/config.json
```

#### JSON Format

Machine-parseable structured logging:

```json
{
  "level": "info",
  "message": "Task created successfully",
  "timestamp": "2025-12-26T10:30:15.123Z",
  "context": {
    "command": "tasks add",
    "cli": "cli-alpha"
  }
}
```

## Implementation

### Creating a Logger

```typescript
import { createLogger } from '@cli-ops/shared-logger'

const logger = createLogger({
  name: 'cli-alpha',
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'pretty'
})
```

### Using the Logger

```typescript
// Basic logging
logger.info('Operation completed')
logger.warn('Deprecated flag used')
logger.error('Operation failed', { error })

// With context
logger.debug('Loading configuration', {
  path: configPath,
  exists: fs.existsSync(configPath)
})

// Conditional logging
if (logger.isDebugEnabled()) {
  const data = expensiveOperation()
  logger.debug('Debug data', { data })
}
```

### Integration with BaseCommand

All commands automatically inherit logging via [`packages/shared-commands/src/base-command.ts`](../../packages/shared-commands/src/base-command.ts):

```typescript
export abstract class BaseCommand {
  protected logger: Logger

  async init() {
    this.logger = createLogger({
      name: this.config.name,
      level: this.flags.verbose ? 'debug' : 'info'
    })
  }

  async run() {
    this.logger.info(`Running command: ${this.id}`)
    // Command implementation
  }
}
```

### Environment Variables

- `LOG_LEVEL=debug` - Set minimum log level
- `LOG_FORMAT=json` - Enable JSON output
- `DEBUG=cli-alpha:*` - Enable debug logging for specific namespace
- `SILENT=true` - Disable all logging (useful for testing)

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// ✓ Good
logger.debug('Cache hit', { key })
logger.info('Task created successfully')
logger.warn('API rate limit approaching')
logger.error('Database connection failed', { error })

// ✗ Avoid
logger.info('Cache hit') // Too noisy for info level
logger.error('Task created') // Wrong severity
```

### 2. Include Context

```typescript
// ✓ Good - provides context for debugging
logger.error('Failed to save task', {
  taskId: task.id,
  error: error.message,
  stack: error.stack
})

// ✗ Avoid - lacks useful context
logger.error('Failed to save task')
```

### 3. Avoid Logging Sensitive Data

```typescript
// ✓ Good - redacts sensitive information
logger.debug('API request', {
  url: request.url,
  method: request.method,
  headers: redactSensitiveHeaders(request.headers)
})

// ✗ Avoid - logs API keys
logger.debug('API request', {
  headers: request.headers // May contain Authorization header
})
```

### 4. Use Structured Data

```typescript
// ✓ Good - structured data is easily parseable
logger.info('Task operation complete', {
  operation: 'create',
  taskId: task.id,
  duration: performance.now() - start
})

// ✗ Avoid - string interpolation loses structure
logger.info(`Created task ${task.id} in ${duration}ms`)
```

## Accessibility Features

### Colorblind-Friendly

The logger uses symbols + colors to ensure information is accessible:

- ✅ Green + ✓ for success
- ❌ Red + ✗ for errors
- ⚠️ Yellow + ⚠ for warnings
- ℹ️ Blue + ℹ for info

### TTY Detection

Automatically disables colors when not in a terminal:

```typescript
const logger = createLogger({
  format: process.stdout.isTTY ? 'pretty' : 'json'
})
```

## Testing

### Silent Mode

Disable logging during tests:

```typescript
import { createLogger } from '@cli-ops/shared-logger'

const logger = createLogger({
  silent: true // No output during tests
})
```

### Capturing Logs

Capture logs for assertions:

```typescript
import { createLogger, captureLogger } from '@cli-ops/shared-logger'

test('logs error message', async () => {
  const capture = captureLogger()
  
  await myFunction()
  
  expect(capture.logs.error).toContainEqual(
    expect.objectContaining({
      message: 'Operation failed'
    })
  )
})
```

## Performance Considerations

### Lazy Evaluation

Avoid expensive operations in log statements:

```typescript
// ✓ Good - only evaluates when debug enabled
if (logger.isDebugEnabled()) {
  logger.debug('Large data', { data: serializeExpensiveData() })
}

// ✗ Avoid - always evaluates even if debug disabled
logger.debug('Large data', { data: serializeExpensiveData() })
```

### Log Sampling

For high-frequency operations, sample logs:

```typescript
let logCounter = 0

function processItem(item) {
  if (logCounter++ % 100 === 0) {
    logger.debug('Processing items', { processed: logCounter })
  }
}
```

## Related Documentation

- [ADR-004: Structured Logging Architecture](../adr/004-structured-logging-architecture.md)
- [shared-logger package](../../packages/shared-logger/README.md)
- [BaseCommand implementation](../../packages/shared-commands/src/base-command.ts)

<!-- TODO: Expand with log aggregation examples (e.g., Winston transports, Pino streams) -->
<!-- TODO: Add examples of custom log formats and transports -->
<!-- TODO: Document log rotation strategies for long-running processes -->
