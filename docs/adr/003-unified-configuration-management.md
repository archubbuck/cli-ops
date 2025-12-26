# ADR-003: Unified Configuration Management System

**Status:** Accepted  
**Date:** 2025-12-26  
**Deciders:** Team  

## Context

Three independent CLIs (`cli-alpha`, `cli-beta`, `cli-gamma`) need to:

- Store user preferences and settings
- Support configuration hierarchies (defaults → user config → CLI args)
- Provide a consistent configuration API across all CLIs
- Enable easy migration when configuration schemas change
- Support validation of configuration values
- Allow debugging and inspection of active configuration

We needed a solution that:
- Abstracts away file I/O and storage details
- Provides type safety for configuration values
- Handles edge cases (corrupted files, missing directories, etc.)
- Is testable without touching the filesystem

Alternative approaches:
- **Direct file I/O in each CLI**: Code duplication, inconsistent behavior
- **Third-party config libraries** (e.g., `conf`, `configstore`): Extra dependencies, less control
- **Environment variables only**: Not persistent, poor UX for complex settings
- **CLI-specific solutions**: No code reuse between CLIs

## Decision

We will implement a **unified configuration system** in the `shared-config` package.

Architecture:
- **ConfigManager class**: Core abstraction for loading, saving, validating config
- **JSON-based storage**: Human-readable, easy to debug
- **XDG Base Directory compliance**: Stores configs in `~/.config/cli-{name}/config.json`
- **Schema validation**: Uses Zod or similar for runtime type checking
- **Migration system**: Supports schema evolution with version migrations
- **Debug mode**: Can dump active config for troubleshooting

Key design principles:
1. **Separation of concerns**: Config logic is separate from CLI logic
2. **Testability**: Uses dependency injection to avoid filesystem access in tests
3. **Fail-safe defaults**: Never crashes if config file is missing/corrupted
4. **Atomic writes**: Uses temp files + rename to prevent corruption

## Consequences

### Positive

- **Code reuse**: All three CLIs use the same configuration infrastructure
- **Consistency**: Users experience identical config behavior across CLIs
- **Type safety**: TypeScript interfaces ensure config values are correct
- **Testability**: Easy to test config logic in isolation
- **Debuggability**: Users can inspect config with `cli-name config get`
- **Migration support**: Can evolve config schema without breaking existing users
- **XDG compliance**: Follows Linux/Unix conventions for config storage

### Negative

- **Abstraction overhead**: Simple config reads/writes require going through ConfigManager
- **Learning curve**: Contributors must understand the ConfigManager API
- **Dependency**: All CLIs depend on `shared-config` package

### Neutral

- **File format**: JSON chosen over YAML/TOML (simpler, built-in Node.js support)
- **Config location**: XDG-compliant paths may differ from user expectations on some platforms

## Implementation

Configuration system is implemented in:

- [packages/shared-config/src/config-manager.ts](../../packages/shared-config/src/config-manager.ts) - Core ConfigManager class
- [packages/shared-config/src/schemas/](../../packages/shared-config/src/schemas/) - Zod schemas for validation
- Each CLI defines its own config schema extending base schema

Usage example:
```typescript
import { ConfigManager } from '@cli-ops/shared-config'

const config = new ConfigManager('cli-alpha', {
  debug: false,
  theme: 'auto',
  logLevel: 'info'
})

// Load config (merges defaults + user config)
await config.load()

// Get value with fallback
const theme = config.get('theme', 'auto')

// Update value
await config.set('debug', true)

// Dump for debugging
console.log(config.dump())
```

Commands that use config:
- `cli-alpha config get [key]` - Read config value
- `cli-alpha config set <key> <value>` - Write config value
- `cli-alpha config reset` - Delete user config (revert to defaults)
- `cli-alpha config path` - Show config file location

## References

- [shared-config Package](../../packages/shared-config/)
- [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html)
- Related ADRs: [ADR-004 (Structured Logging)](004-structured-logging-architecture.md)

<!-- TODO: Expand with schema migration examples -->
<!-- TODO: Add guidance on config validation patterns -->
<!-- TODO: Document performance considerations for config loading -->
