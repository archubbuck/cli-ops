# Plugin Development Guide

This guide explains how to create plugins for the clio CLI ecosystem.

## Overview

CLI Ops uses a plugin-first architecture where `clio` serves as the core plugin manager. Plugins are npm packages published under the `@cli-ops` scope that follow oclif v4 conventions and integrate with our shared package ecosystem.

## Plugin Architecture

### Plugin Types

1. **Bundled Plugins**: Included with clio installation (e.g., `@cli-ops/clio-plugin-tasks`)
2. **Installable Plugins**: User installs on-demand (e.g., `@cli-ops/clio-plugin-fetch`, `@cli-ops/clio-plugin-repo`)
3. **Extension Plugins**: Community plugins extending existing plugins (e.g., `@cli-ops/clio-plugin-tasks-jira`)

### Naming Conventions

- **Core Plugins**: `@cli-ops/clio-plugin-{name}`
- **Extension Plugins**: `@cli-ops/clio-plugin-{parent}-{feature}`
- **Example**: `@cli-ops/clio-plugin-tasks-github` extends tasks plugin with GitHub integration

## Quick Start

### 1. Create Plugin Package

```bash
# Use workspace generator
cd /workspaces/cli-ops
pnpm generate:cli

# Follow prompts:
# - Name: clio-plugin-myfeature
# - Description: My custom feature plugin
# - bin: clio
```

### 2. Configure package.json

```json
{
  "name": "@cli-ops/clio-plugin-myfeature",
  "version": "1.0.0",
  "description": "Custom feature plugin for clio",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "publishConfig": {
    "access": "public"
  },
  "oclif": {
    "bin": "clio",
    "commands": "./dist/commands",
    "topicSeparator": ":",
    "topics": {
      "myfeature": {
        "description": "My custom feature commands"
      }
    }
  },
  "peerDependencies": {
    "@cli-ops/clio": "^1.0.0"
  },
  "dependencies": {
    "@oclif/core": "^4.0.31",
    "@cli-ops/shared-commands": "workspace:*",
    "@cli-ops/shared-logger": "workspace:*",
    "@cli-ops/shared-plugins": "workspace:*",
    "@cli-ops/shared-types": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.7.2"
  }
}
```

### 3. Create Plugin Class

```typescript
// src/index.ts
import { BasePlugin } from '@/shared-plugins'
import type { PluginMetadata } from '@/shared-types'

export class MyFeaturePlugin extends BasePlugin {
  readonly metadata: PluginMetadata = {
    name: '@cli-ops/clio-plugin-myfeature',
    version: '1.0.0',
    description: 'Custom functionality for clio',
  }

  async init(): Promise<void> {
    // Initialize your plugin
    this.emit('myfeature:ready', {
      version: this.metadata.version,
    })
  }

  async destroy(): Promise<void> {
    // Cleanup resources
  }
}

export default MyFeaturePlugin
```

### 4. Create Commands

```typescript
// src/commands/myfeature/hello.ts
import { BasePluginCommand } from '@/shared-plugins'
import { Flags } from '@oclif/core'

export default class MyFeatureHello extends BasePluginCommand {
  static pluginName = '@cli-ops/clio-plugin-myfeature'
  static pluginVersion = '1.0.0'

  static description = 'Say hello from plugin'

  static flags = {
    name: Flags.string({
      char: 'n',
      description: 'Name to greet',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(CustomHello)

    this.log(`Hello, ${flags.name}!`)

    // Emit plugin event
    this.emitPluginEvent('custom:hello', {
      name: flags.name,
    })
  }
}
```

### 5. Build and Test

```bash
# Build plugin
pnpm build

# Test in development mode
pnpm dev:myfeature

# Link for local testing (from plugin directory)
clio plugins link .

# Test command
clio myfeature:hello --name World

# Unlink when done
clio plugins:uninstall @cli-ops/clio-plugin-myfeature
```

### 6. Publish to npm

```bash
# Create changeset
pnpm changeset

# Build for production
pnpm build

# Publish (requires @cli-ops npm org access)
pnpm changeset:publish
```

## Plugin Naming Convention

Plugins **must** follow this naming pattern:

```
@cli-ops/clio-plugin-{feature}
@cli-ops/clio-plugin-{parent}-{extension}
```

**Examples:**

- ✅ `@cli-ops/clio-plugin-tasks` (core plugin)
- ✅ `@cli-ops/clio-plugin-fetch` (core plugin)
- ✅ `@cli-ops/clio-plugin-tasks-jira` (extends tasks)
- ✅ `@cli-ops/clio-plugin-fetch-oauth` (extends fetch)
- ❌ `clio-jira-plugin` (not scoped)
- ❌ `@myorg/my-cool-plugin` (wrong scope)

## Using Shared Packages

Plugins have access to all workspace shared packages via `@/` aliases:

### Logging

```typescript
import { createLogger } from '@/shared-logger'

const logger = createLogger('myfeature-plugin')
logger.info('Plugin action', { data: 'value' })
logger.error('Error occurred', { error })
```

### UI Components

```typescript
import { createSpinner, createTable } from '@/shared-ui'

// Spinner
const spinner = createSpinner()
spinner.start('Loading...')
await doWork()
spinner.succeed('Done!')

// Table
const table = createTable({
  head: ['Name', 'Value'],
})
table.push(['foo', 'bar'])
console.log(table.toString())
```

```typescript
import { confirm, input, select, checkbox } from '@/shared-prompts'

const name = await input('What is your name?')
const shouldContinue = await confirm('Continue?', true)

const choice = await select('Pick one:', [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
])

const selected = await checkbox('Pick many:', [
  { value: '1', label: 'Item 1' },
  { value: '2', label: 'Item 2' },
])
```

### Configuration

```typescript
import { loadConfig } from '@/shared-config'
import { z } from 'zod'

const configSchema = z.object({
  plugins: z.object({
    custom: z.object({
      apiKey: z.string(),
      endpoint: z.string().url(),
    }),
  }),
})

const { config } = await loadConfig({
  moduleName: 'alpha',
  schema: configSchema,
})

const apiKey = config.plugins.custom.apiKey
```

## Event Communication

Plugins can communicate with each other and the host CLI using the event bus:

### Emitting Events

```typescript
export default class MyCommand extends BasePluginCommand {
  async run(): Promise<void> {
    // Do work

    // Emit event
    this.emitPluginEvent('my-plugin:action:complete', {
      result: 'success',
      timestamp: new Date().toISOString(),
    })
  }
}
```

### Listening to Events

```typescript
export class MyPlugin extends BasePlugin {
  async init(): Promise<void> {
    // Listen to events from other plugins or CLI
    this.on('task:created', (data) => {
      console.log('Task created:', data)
    })

    this.on('other-plugin:action', (data) => {
      console.log('Other plugin did something:', data)
    })
  }

  async destroy(): Promise<void> {
    // Clean up listeners
    this.off('task:created', this.handleTaskCreated)
  }
}
```

### Common Events

**Task CLI (alpha):**

- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `task:completed` - Task marked complete

**API CLI (beta):**

- `request:before` - Before HTTP request
- `request:after` - After HTTP request
- `auth:login` - User logged in
- `auth:logout` - User logged out

**DevTools CLI (gamma):**

- `git:commit:before` - Before git commit
- `git:push:before` - Before git push
- `pr:created` - Pull request created
- `pr:merged` - Pull request merged

## Lifecycle Hooks

Plugins can implement lifecycle methods:

```typescript
export class MyPlugin extends BasePlugin {
  // Called when plugin is loaded
  async init(): Promise<void> {
    console.log('Plugin initializing...')

    // Setup resources
    this.setupResources()

    // Register event listeners
    this.registerListeners()

    // Emit ready event
    this.emit('my-plugin:ready')
  }

  // Called when plugin is unloaded
  async destroy(): Promise<void> {
    console.log('Plugin cleaning up...')

    // Remove event listeners
    this.removeListeners()

    // Clean up resources
    this.cleanup()
  }

  private setupResources(): void {
    // Initialize connections, caches, etc.
  }

  private registerListeners(): void {
    this.on('event:name', this.handler.bind(this))
  }

  private removeListeners(): void {
    this.off('event:name', this.handler.bind(this))
  }

  private cleanup(): void {
    // Close connections, clear caches, etc.
  }

  private handler(data: unknown): void {
    console.log('Event received:', data)
  }
}
```

## Testing Plugins

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { MyPlugin } from '../src/index.js'

describe('MyPlugin', () => {
  it('should initialize correctly', async () => {
    const plugin = new MyPlugin()
    await plugin.init()

    expect(plugin.metadata.name).toBe('cli-alpha-plugin-custom')
    expect(plugin.metadata.version).toBeDefined()
  })

  it('should emit events', async () => {
    const plugin = new MyPlugin()
    let eventFired = false

    plugin.on('test:event', () => {
      eventFired = true
    })

    plugin.emit('test:event')
    expect(eventFired).toBe(true)
  })
})
```

### Command Tests

```typescript
import { describe, it, expect } from 'vitest'
import CustomHello from '../src/commands/custom/hello.js'

describe('CustomHello', () => {
  it('should run successfully', async () => {
    const cmd = new CustomHello(['--name', 'World'], {} as any)
    await cmd.run()

    // Add assertions
  })
})
```

### Integration Tests

```bash
# Install plugin locally
alpha plugins link .

# Run integration tests
alpha custom hello --name Test
```

## Publishing

### 1. Prepare for Release

```bash
# Build
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Update version
npm version patch|minor|major
```

### 2. Publish to npm

```bash
# Login to npm (if not already)
npm login

# Publish
npm publish --access public
```

### 3. Installation

Users can now install your plugin:

```bash
# From npm
alpha plugins install cli-alpha-plugin-custom

# From GitHub
alpha plugins install github:username/cli-alpha-plugin-custom

# From local path (development)
alpha plugins link /path/to/plugin
```

## Best Practices

### 1. Type Safety

- Use TypeScript strict mode
- Import types from `@/shared-types`
- Define clear interfaces for your plugin

### 2. Error Handling

```typescript
import { CLIError } from '@/shared-core'

if (!apiKey) {
  throw new CLIError('API key not configured', 'CONFIG_MISSING', {
    suggestion: 'Run: alpha config set custom.apiKey YOUR_KEY',
  })
}
```

### 3. Logging

```typescript
// Use structured logging
logger.info('Operation started', {
  operation: 'sync',
  items: 42,
})

// Log errors with context
logger.error('Operation failed', {
  error: error.message,
  stack: error.stack,
})
```

### 4. Performance

- Lazy load dependencies
- Cache expensive operations
- Use async/await properly

```typescript
// Bad: Blocking initialization
export class SlowPlugin extends BasePlugin {
  async init(): Promise<void> {
    await this.heavyOperation() // Blocks CLI startup
  }
}

// Good: Lazy initialization
export class FastPlugin extends BasePlugin {
  private initialized = false

  async init(): Promise<void> {
    // Quick setup only
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.heavyOperation()
      this.initialized = true
    }
  }

  async doWork(): Promise<void> {
    await this.ensureInitialized()
    // Now do work
  }
}
```

### 5. Documentation

- Write comprehensive README
- Include usage examples
- Document configuration options
- List emitted events

### 6. Versioning

- Follow semantic versioning
- Document breaking changes
- Maintain CHANGELOG.md

## Plugin Structure

Recommended directory structure:

```
cli-alpha-plugin-custom/
├── package.json              # Plugin metadata
├── tsconfig.json             # TypeScript config
├── README.md                 # Documentation
├── CHANGELOG.md              # Version history
├── LICENSE                   # License file
├── .gitignore               # Git ignore rules
├── src/
│   ├── index.ts             # Plugin class
│   ├── commands/            # Command files
│   │   └── custom/
│   │       ├── hello.ts
│   │       └── goodbye.ts
│   ├── hooks/               # Hook handlers (optional)
│   │   └── prerun.ts
│   ├── lib/                 # Utility functions
│   │   ├── api-client.ts
│   │   └── helpers.ts
│   └── types/               # Type definitions
│       └── index.ts
├── test/                    # Tests
│   ├── commands/
│   └── plugin.test.ts
└── docs/                    # Additional docs
    └── configuration.md
```

## Examples

See the [`extensions/`](../../extensions) directory for complete plugin implementations:

- **clio-plugin-tasks-jira**: Jira integration for task management
- **clio-plugin-fetch-oauth**: OAuth authentication for HTTP requests
- **clio-plugin-repo-hooks**: Git hooks automation for repositories

## Troubleshooting

### Plugin not found

```bash
# Verify plugin is installed
alpha plugins

# Reinstall
alpha plugins uninstall cli-alpha-plugin-custom
alpha plugins install cli-alpha-plugin-custom
```

### Commands not appearing

- Ensure `oclif.commands` points to `./dist/commands`
- Verify plugin is built: `pnpm build`
- Check command export: `export default class MyCommand`

### Type errors

- Ensure shared packages are linked: `pnpm install`
- Check TypeScript references in tsconfig.json
- Rebuild shared packages: `pnpm --filter './packages/**' build`

### Events not working

- Verify event names match exactly
- Check listener is registered before event is emitted
- Use `getPluginEventBus()` in commands

## Resources

- [oclif Plugin Documentation](https://oclif.io/docs/plugins)
- [Architecture Documentation](../ARCHITECTURE.md)
- [ADR-009: Plugin System Architecture](../adr/009-plugin-system-architecture.md)
- [Example Plugins](../../extensions/)

## Support

For questions or issues:

1. Check the examples directory
2. Review the architecture docs
3. Open an issue on GitHub
4. Join the community discussions

Happy plugin development! 🎉
