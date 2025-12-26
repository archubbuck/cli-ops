# ADR-004: Structured Logging Architecture

**Status:** Accepted  
**Date:** 2025-12-26  
**Deciders:** Team  

## Context

CLIs need robust logging for:

- **User feedback**: Progress indicators, success/error messages
- **Debugging**: Detailed logs when `--debug` flag is enabled
- **Development**: Troubleshooting issues during development
- **Auditing**: Recording command execution for history/undo features

Requirements:
- Structured logging (key-value pairs, not just strings)
- Multiple log levels (debug, info, warn, error)
- Configurable output formats (pretty for TTY, JSON for pipes)
- Context propagation (request IDs, user info)
- Performance (minimal overhead when debug disabled)
- Integration with UI components (spinners, progress bars)

Challenges:
- Three independent CLIs need consistent logging behavior
- Console.log/console.error are too simple
- Need to suppress logs during tests
- Debug logs should not spam users by default

Alternative approaches:
- **Console methods only**: No structure, hard to filter, no log levels
- **Third-party loggers** (e.g., `winston`, `pino`): Heavy dependencies, overkill for CLIs
- **Custom per-CLI**: Code duplication, inconsistent behavior
- **No logging**: Poor debuggability and user experience

## Decision

We will implement a **structured logging system** in the `shared-logger` package.

Architecture:
- **Logger class**: Core logging abstraction with level-based methods
- **Transport system**: Pluggable outputs (console, file, memory)
- **Formatters**: JSON, pretty-print, custom formatters
- **Context management**: Attach metadata to all logs in a scope
- **Log levels**: TRACE, DEBUG, INFO, WARN, ERROR, FATAL
- **Environment-aware**: Automatically adjusts based on NODE_ENV and CI environment

Key design principles:
1. **Zero overhead when disabled**: Debug logs have negligible cost when not active
2. **Type-safe contexts**: Use TypeScript for structured log fields
3. **Test-friendly**: Easy to mock and capture logs in tests
4. **ADHD/OCD-friendly**: Clear visual hierarchy, not overwhelming

## Consequences

### Positive

- **Consistency**: All CLIs log in the same format with same conventions
- **Debuggability**: Developers can enable detailed logs with `--debug` flag
- **Structure**: Logs are queryable/filterable (e.g., grep for specific keys)
- **Testability**: Tests can assert on log messages and metadata
- **Performance**: Minimal overhead in production (no debug logs)
- **Integration**: Works seamlessly with `shared-ui` spinners and progress bars
- **Context propagation**: Can attach request IDs, command names, etc. to all logs

### Negative

- **Abstraction cost**: Simple logging requires importing Logger class
- **Learning curve**: Contributors must learn logger API vs console.log
- **Dependency**: All CLIs depend on `shared-logger` package

### Neutral

- **Log storage**: Logs are ephemeral by default (no automatic file persistence)
- **Format choice**: JSON logs less human-readable but machine-parseable

## Implementation

Logging system is implemented in:

- [packages/shared-logger/src/logger.ts](../../packages/shared-logger/src/logger.ts) - Core Logger class
- [packages/shared-logger/src/formatters/](../../packages/shared-logger/src/formatters/) - Output formatters
- [packages/shared-logger/src/transports/](../../packages/shared-logger/src/transports/) - Log transports
- Each CLI creates a named logger instance in their base command

Usage example:
```typescript
import { Logger } from '@cli-ops/shared-logger'

// Create logger instance
const logger = new Logger('cli-alpha', {
  level: process.env.DEBUG ? 'debug' : 'info',
  format: process.stdout.isTTY ? 'pretty' : 'json'
})

// Basic logging
logger.info('Processing task', { taskId: '123', status: 'started' })
logger.debug('Detailed debug info', { payload: data })
logger.error('Operation failed', { error: err.message, stack: err.stack })

// With context
const contextLogger = logger.child({ userId: '456' })
contextLogger.info('User action') // Automatically includes userId in metadata

// Conditional logging
if (logger.isLevelEnabled('debug')) {
  const expensiveData = computeExpensiveData()
  logger.debug('Debug data', { data: expensiveData })
}
```

Integration with commands:
```typescript
export default class MyCommand extends BaseCommand {
  async run() {
    this.logger.info('Starting command')
    
    try {
      await this.doWork()
      this.logger.info('Command completed successfully')
    } catch (error) {
      this.logger.error('Command failed', { error })
      throw error
    }
  }
}
```

## References

- [shared-logger Package](../../packages/shared-logger/)
- [12-Factor App: Logs](https://12factor.net/logs)
- Related ADRs:
  - [ADR-003 (Configuration)](003-unified-configuration-management.md) - Log level from config
  - [ADR-005 (ADHD/OCD UX)](005-adhd-ocd-friendly-ux-patterns.md) - Visual formatting

<!-- TODO: Expand with performance benchmarks -->
<!-- TODO: Add examples of log querying in CI/CD -->
<!-- TODO: Document log retention policies -->
