# Shared Logger

Flexible logging with debug (development) and pino (structured production logging).

## Features

- 🐛 **Debug Logging** - Namespace-based development logging with `debug`
- 📊 **Structured Logging** - JSON logging for production with `pino`
- 🎨 **Pretty Output** - Human-readable logs in development
- 🤖 **CI Detection** - Auto-adjusts output for CI environments
- 🎯 **Type-Safe** - Full TypeScript support
- ⚡ **High Performance** - Pino is one of the fastest Node.js loggers

## Installation

```bash
pnpm add @/shared-logger
```

## Usage

### Debug Logger (Development)

Perfect for troubleshooting and development logging:

```typescript
import { createDebugLogger } from '@/shared-logger'

// Create logger with namespace
const debug = createDebugLogger('mycli:api')

debug('Making API request to %s', '/users')
debug('Response: %O', { users: [...] })

// Create sub-logger
const dbDebug = debug.extend('database')
dbDebug('Connected to database')

// Check if enabled
if (debug.enabled) {
  // Expensive operation only if logging
  debug('Detailed info: %O', computeExpensiveData())
}
```

**Enable debug logging:**
```bash
# All mycli logs
DEBUG=mycli:* npm start

# Specific namespace
DEBUG=mycli:api npm start

# Multiple namespaces
DEBUG=mycli:api,mycli:db npm start

# Everything (verbose!)
DEBUG=* npm start
```

### Structured Logger (Production)

For production logging with structured output:

```typescript
import { createStructuredLogger } from '@/shared-logger'

// Create logger
const logger = createStructuredLogger({
  name: 'mycli',
  level: 'info',
})

// Simple messages
logger.info('Server started on port 3000')
logger.warn('API rate limit approaching')
logger.error('Failed to connect to database')

// With structured data
logger.info({ userId: 123, action: 'login' }, 'User logged in')

// Error logging
try {
  await riskyOperation()
} catch (error) {
  logger.error(error, 'Operation failed')
}

// Create child logger with context
const requestLogger = logger.child({ 
  requestId: '123',
  userId: '456',
})

requestLogger.info('Processing request') // Includes requestId + userId
```

### Logger Factory Pattern

```typescript
import { createDebugLoggerFactory, createStructuredLoggerFactory } from '@/shared-logger'

// Debug logger factory
const debugFactory = createDebugLoggerFactory('mycli')

const apiLogger = debugFactory.create('api')
const dbLogger = debugFactory.create('database')

// Structured logger factory
const loggerFactory = createStructuredLoggerFactory({
  level: 'info',
  prettyPrint: true,
})

const serviceLogger = loggerFactory.create('service')
const workerLogger = loggerFactory.create('worker')
```

## Log Levels

Structured logger supports these levels (lower = higher priority):

- `trace` (10) - Very detailed debugging
- `debug` (20) - Debug information
- `info` (30) - General information
- `warn` (40) - Warnings
- `error` (50) - Errors
- `fatal` (60) - Fatal errors

```typescript
// Set minimum level
logger.setLevel('warn') // Only warn, error, fatal will output

// Check current level
console.log(logger.level) // 'warn'
```

## Environment Detection

The logger automatically adjusts based on environment:

### Development
- Pretty printed output with colors
- Human-readable timestamps
- Detailed error messages

### CI/CD
- JSON output for machine parsing
- No colors or pretty printing
- Consistent formatting

### Production
- JSON output by default
- Optimized performance
- Structured data for log aggregation

**Override detection:**
```typescript
const logger = createStructuredLogger({
  name: 'mycli',
  prettyPrint: true,    // Force pretty print
  detectCI: false,      // Disable CI detection
})
```

## Examples

### Command Logger

```typescript
import { createDebugLogger, createStructuredLogger } from '@/shared-logger'

class MyCommand {
  private debug = createDebugLogger('mycli:commands:run')
  private logger = createStructuredLogger({ 
    name: 'mycli',
    level: process.env.LOG_LEVEL ?? 'info',
  })

  async run() {
    this.debug('Starting command execution')
    
    try {
      const result = await this.execute()
      
      this.logger.info({ 
        command: 'run',
        duration: result.duration,
      }, 'Command completed successfully')
      
      this.debug('Result: %O', result)
    } catch (error) {
      this.logger.error(error, 'Command failed')
      throw error
    }
  }
}
```

### API Client with Logging

```typescript
import { createDebugLogger } from '@/shared-logger'

const debug = createDebugLogger('mycli:api')

class APIClient {
  async request(endpoint: string) {
    debug('Making request to %s', endpoint)
    
    const start = Date.now()
    const response = await fetch(endpoint)
    const duration = Date.now() - start
    
    debug('Response %d in %dms', response.status, duration)
    
    return response
  }
}
```

### Error Tracking with Context

```typescript
const logger = createStructuredLogger({ name: 'mycli' })

function processTask(task: Task) {
  const taskLogger = logger.child({
    taskId: task.id,
    taskType: task.type,
  })

  taskLogger.info('Starting task')

  try {
    // Process task...
    taskLogger.info({ status: 'completed' }, 'Task finished')
  } catch (error) {
    taskLogger.error(error, 'Task failed')
    throw error
  }
}
```

## Best Practices

1. **Use debug for development** - Enable with DEBUG env var
2. **Use structured for production** - JSON logs work with log aggregation
3. **Add context with child loggers** - Include request IDs, user IDs, etc.
4. **Log errors properly** - Pass Error objects to preserve stack traces
5. **Use appropriate levels** - Don't log everything at info level
6. **Avoid logging secrets** - Never log passwords, tokens, or sensitive data

## ADHD/OCD Benefits

- **Namespace Organization** - Clear hierarchy of log sources
- **Toggleable** - Enable only what you need
- **Structured** - Consistent format across all logs
- **Searchable** - Easy to find specific log entries
- **Visual Feedback** - Colors in development help scan logs
- **Performance** - Fast logging doesn't slow down CLI

## Performance Tips

```typescript
// ❌ Bad - Always computes expensive data
debug('Data: %O', computeExpensiveData())

// ✅ Good - Only computes when debug enabled
if (debug.enabled) {
  debug('Data: %O', computeExpensiveData())
}

// ✅ Even better - Use lazy evaluation
debug('Data: %O', () => computeExpensiveData())
```
