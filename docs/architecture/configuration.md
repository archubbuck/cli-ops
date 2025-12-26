# Configuration System Architecture

## Overview

The configuration system provides a **unified, type-safe way** to manage settings across all CLI applications. It handles loading, validation, migration, and persistence of user preferences.

## Design Goals

1. **Consistency**: All CLIs use the same configuration patterns
2. **Type Safety**: TypeScript ensures config values are correct
3. **Validation**: Schemas validate configuration at runtime
4. **Migration**: Support schema evolution without breaking existing users
5. **Debuggability**: Easy to inspect and troubleshoot configuration
6. **XDG Compliance**: Follow Linux/Unix standards for config location

## Architecture

### Core Components

```typescript
┌──────────────────────────────────────────────────┐
│             ConfigManager                        │
│  ┌──────────────────────────────────────────┐   │
│  │  load()    - Load config from disk        │   │
│  │  get()     - Retrieve config value        │   │
│  │  set()     - Update config value          │   │
│  │  save()    - Persist to disk              │   │
│  │  reset()   - Clear user config            │   │
│  │  dump()    - Debug output                 │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
           │
           ├── ConfigSchema (Zod)
           ├── ConfigStorage (File I/O)
           ├── ConfigMigrator (Version migrations)
           └── ConfigValidator (Runtime validation)
```

### Configuration Hierarchy

Configuration values are merged from multiple sources (lower priority to higher):

```
1. Default values (hardcoded in schema)
   ↓
2. User config file (~/.config/cli-{name}/config.json)
   ↓
3. Environment variables (CLI_{NAME}_CONFIG_{KEY})
   ↓
4. Command-line flags (--config-key=value)
```

## Configuration Storage

### File Location (XDG Compliant)

```bash
# Linux/macOS
~/.config/cli-alpha/config.json
~/.config/cli-beta/config.json
~/.config/cli-gamma/config.json

# Windows
%APPDATA%\cli-alpha\config.json
%APPDATA%\cli-beta\config.json
%APPDATA%\cli-gamma\config.json
```

### File Format (JSON)

```json
{
  "$schema": "https://json.schemastore.org/cli-config.json",
  "version": 1,
  "debug": false,
  "theme": "auto",
  "logLevel": "info",
  "historyEnabled": true,
  "historyRetention": 90,
  "notifications": {
    "enabled": true,
    "sound": false
  },
  "editor": "vim"
}
```

## Configuration Schema

### Base Schema

All CLIs extend a base configuration schema:

```typescript
// packages/shared-config/src/schemas/base.ts
import { z } from 'zod'

export const BaseConfigSchema = z.object({
  // Schema version for migrations
  version: z.number().default(1),
  
  // Debug mode
  debug: z.boolean().default(false),
  
  // Log level
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  
  // Theme
  theme: z.enum(['auto', 'light', 'dark']).default('auto'),
  
  // History settings
  historyEnabled: z.boolean().default(true),
  historyRetention: z.number().min(1).max(365).default(90),
  
  // Notifications
  notifications: z.object({
    enabled: z.boolean().default(true),
    sound: z.boolean().default(false)
  }),
  
  // Editor preference
  editor: z.string().default(process.env.EDITOR || 'vim')
})

export type BaseConfig = z.infer<typeof BaseConfigSchema>
```

### CLI-Specific Schema

Each CLI can extend the base schema:

```typescript
// apps/cli-alpha/src/config-schema.ts
import { BaseConfigSchema } from '@cli-ops/shared-config'
import { z } from 'zod'

export const CliAlphaConfigSchema = BaseConfigSchema.extend({
  // CLI-alpha specific config
  tasks: z.object({
    defaultPriority: z.enum(['low', 'medium', 'high']).default('medium'),
    autoSave: z.boolean().default(true),
    sortBy: z.enum(['created', 'priority', 'due']).default('created')
  }),
  
  integrations: z.object({
    github: z.object({
      enabled: z.boolean().default(false),
      token: z.string().optional()
    })
  })
})

export type CliAlphaConfig = z.infer<typeof CliAlphaConfigSchema>
```

## ConfigManager Usage

### Creating a ConfigManager

```typescript
import { ConfigManager } from '@cli-ops/shared-config'
import { CliAlphaConfigSchema } from './config-schema'

const config = new ConfigManager('cli-alpha', CliAlphaConfigSchema, {
  // Default values (merged with schema defaults)
  debug: false,
  theme: 'auto'
})
```

### Loading Configuration

```typescript
// Load from disk (merges with defaults)
await config.load()

// Get specific value
const theme = config.get('theme')  // 'auto' | 'light' | 'dark'

// Get with fallback
const logLevel = config.get('logLevel', 'info')

// Get nested value
const priority = config.get('tasks.defaultPriority')
```

### Updating Configuration

```typescript
// Set single value
await config.set('theme', 'dark')

// Set nested value
await config.set('tasks.defaultPriority', 'high')

// Set multiple values
await config.setMany({
  debug: true,
  logLevel: 'debug',
  'tasks.autoSave': false
})

// Automatically saves to disk
```

### Resetting Configuration

```typescript
// Reset to defaults
await config.reset()

// Reset specific key
await config.reset('theme')

// This deletes the user config file
```

### Debugging Configuration

```typescript
// Dump current config (for debugging)
console.log(config.dump())
// => { theme: 'dark', debug: true, ... }

// Show config file location
console.log(config.path)
// => /home/user/.config/cli-alpha/config.json

// Show effective config (with source info)
console.log(config.explain('theme'))
// => {
//   value: 'dark',
//   source: 'user-config',
//   path: '/home/user/.config/cli-alpha/config.json'
// }
```

## Configuration Commands

Each CLI provides config commands:

### Get Command

```bash
# Get all config
$ cli-alpha config get

# Get specific key
$ cli-alpha config get theme
dark

# Get nested key
$ cli-alpha config get tasks.defaultPriority
high

# Output as JSON
$ cli-alpha config get --json
{"theme":"dark","debug":false,...}
```

### Set Command

```bash
# Set value
$ cli-alpha config set theme dark
✓ Set theme = dark

# Set nested value
$ cli-alpha config set tasks.defaultPriority high
✓ Set tasks.defaultPriority = high

# Set with validation
$ cli-alpha config set logLevel invalid
✗ Error: Invalid value for logLevel. Must be one of: trace, debug, info, warn, error
```

### Reset Command

```bash
# Reset all config
$ cli-alpha config reset
⚠ This will delete your configuration file. Continue? (y/n) y
✓ Configuration reset to defaults

# Reset specific key
$ cli-alpha config reset theme
✓ Reset theme to default value (auto)
```

### Path Command

```bash
# Show config file location
$ cli-alpha config path
/home/user/.config/cli-alpha/config.json

# Open in editor
$ cli-alpha config edit
# Opens config file in $EDITOR
```

## Schema Validation

### Runtime Validation

All config values are validated at runtime:

```typescript
// Invalid value rejected
await config.set('logLevel', 'invalid')
// Throws: ValidationError: logLevel must be one of: trace, debug, info, warn, error

// Type mismatch rejected
await config.set('debug', 'yes')
// Throws: ValidationError: debug must be a boolean

// Out of range rejected
await config.set('historyRetention', 400)
// Throws: ValidationError: historyRetention must be between 1 and 365
```

### TypeScript Types

Configuration is fully typed:

```typescript
// ✓ GOOD: Type-safe
const theme: 'auto' | 'light' | 'dark' = config.get('theme')

// ❌ BAD: Type error
const invalid: string = config.get('nonexistent')
// Error: Property 'nonexistent' does not exist

// ✓ GOOD: Nested access
const priority: 'low' | 'medium' | 'high' = config.get('tasks.defaultPriority')
```

## Configuration Migration

### Schema Versioning

Configuration schemas include a version number:

```json
{
  "version": 1,
  "theme": "auto"
}
```

### Migration System

When schema changes, migrations handle updates:

```typescript
// packages/shared-config/src/migrations.ts
export const migrations = {
  // Migrate from v1 to v2
  1: (config: any) => {
    // Rename 'theme' to 'appearance.theme'
    return {
      version: 2,
      appearance: {
        theme: config.theme
      },
      // Preserve other fields
      ...omit(config, ['theme', 'version'])
    }
  },
  
  // Migrate from v2 to v3
  2: (config: any) => {
    // Add new field with default
    return {
      version: 3,
      ...config,
      notifications: {
        enabled: true,
        sound: false
      }
    }
  }
}
```

### Automatic Migration

Migrations run automatically on load:

```typescript
// User has v1 config
// ConfigManager loads it and runs migrations 1 → 2 → 3
await config.load()  // Transparent migration to v3

// User's config file updated to v3
```

## Environment Variables

Configuration can be overridden with environment variables:

```bash
# Format: CLI_{NAME}_CONFIG_{KEY}
export CLI_ALPHA_CONFIG_DEBUG=true
export CLI_ALPHA_CONFIG_THEME=dark
export CLI_ALPHA_CONFIG_LOGLEVEL=debug

# Nested keys use double underscore
export CLI_ALPHA_CONFIG_TASKS__DEFAULTPRIORITY=high

$ cli-alpha config get debug
true  (from environment variable)
```

## Performance Considerations

### Lazy Loading

Configuration is loaded on first access:

```typescript
const config = new ConfigManager('cli-alpha', schema)
// No I/O yet

await config.get('theme')
// Triggers load() on first access
```

### Caching

Configuration is cached in memory:

```typescript
// First call: loads from disk
const theme1 = await config.get('theme')  // ~5ms

// Subsequent calls: cached
const theme2 = await config.get('theme')  // <1ms
```

### Atomic Writes

Configuration updates use atomic writes:

```typescript
// Write to temp file
await fs.writeFile(tmpPath, json)

// Atomic rename
await fs.rename(tmpPath, configPath)

// Prevents corruption if process crashes
```

## Error Handling

### Missing Config File

If config file doesn't exist, defaults are used:

```typescript
await config.load()
// No error, uses defaults from schema
```

### Corrupted Config File

If config file is invalid JSON:

```typescript
await config.load()
// Logs warning, creates backup, uses defaults

// Backup saved to:
// ~/.config/cli-alpha/config.json.backup.1234567890
```

### Validation Errors

Invalid values are rejected:

```typescript
try {
  await config.set('theme', 'invalid')
} catch (error) {
  console.error(error.message)
  // "Invalid value for theme. Must be one of: auto, light, dark"
}
```

## Testing

### Mocking ConfigManager

```typescript
import { ConfigManager } from '@cli-ops/shared-config'
import { createFixtureManager } from '@cli-ops/shared-testing'

describe('MyCommand', () => {
  const fixtures = createFixtureManager()
  
  it('should use custom config', async () => {
    // Create temp config file
    const configPath = await fixtures.create({
      'config.json': JSON.stringify({ theme: 'dark' })
    })
    
    const config = new ConfigManager('test', schema, {
      configDir: configPath
    })
    
    await config.load()
    expect(config.get('theme')).toBe('dark')
  })
  
  afterEach(async () => {
    await fixtures.cleanup()
  })
})
```

## References

- [shared-config Package](../../packages/shared-config/)
- [ADR-003: Unified Configuration](../adr/003-unified-configuration-management.md)
- [XDG Base Directory Spec](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html)
- [Zod Documentation](https://zod.dev)

<!-- TODO: Expand with real config migration examples -->
<!-- TODO: Add performance benchmarks for config loading -->
<!-- TODO: Document config validation best practices -->
