---
sidebar_position: 2
---

# Plugin Development

Learn how to create your own plugins to extend Clio with custom functionality.

## Quick Start

### 1. Generate Plugin Scaffold

Use the workspace generator to create a new plugin:

```bash
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
  }
}
```

### 3. Create Plugin Class

```typescript
// src/index.ts
import { BasePlugin } from '@cli-ops/shared-plugins'
import type { PluginMetadata } from '@cli-ops/shared-types'

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
import { BaseCommand } from '@cli-ops/shared-commands'
import { Flags } from '@oclif/core'
import { SUCCESS } from '@cli-ops/shared-exit-codes'

export default class MyFeatureHello extends BaseCommand {
  static override description = 'Say hello from plugin'

  static override flags = {
    ...BaseCommand.baseFlags,
    name: Flags.string({
      char: 'n',
      description: 'Name to greet',
      required: true,
    }),
  }

  protected async execute(): Promise<void> {
    const { flags } = await this.parse(MyFeatureHello)

    this.logger.info(`Hello, ${flags.name}!`)

    this.exit(SUCCESS)
  }
}
```

### 5. Build and Test

```bash
# Build plugin
pnpm build

# Link for local testing
clio plugins:link .

# Test command
clio myfeature:hello --name World

# Unlink when done
clio plugins:uninstall @cli-ops/clio-plugin-myfeature
```

## Naming Conventions

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

Plugins have access to workspace shared packages:

### Logging

```typescript
import { createLogger } from '@cli-ops/shared-logger'

const logger = createLogger('myfeature-plugin')
logger.info('Plugin action', { data: 'value' })
logger.error('Error occurred', { error })
logger.debug('Debug info', { details })
```

### UI Components

```typescript
import { createSpinner } from '@cli-ops/shared-ui'

const spinner = createSpinner({ text: 'Loading...' })
spinner.start()
await doWork()
spinner.stop()
this.logger.info('Done!')
```

### Prompts

```typescript
import { confirm, input, select } from '@cli-ops/shared-prompts'

const name = await input({
  message: 'What is your name?',
})

const shouldContinue = await confirm({
  message: 'Continue?',
  default: true,
})

const choice = await select({
  message: 'Pick one:',
  choices: [
    { value: 'a', name: 'Option A' },
    { value: 'b', name: 'Option B' },
  ],
})
```

### Configuration

```typescript
import { ConfigManager } from '@cli-ops/shared-config'

const config = new ConfigManager('myfeature')
await config.set('apiKey', 'your-key')
const apiKey = await config.get('apiKey')
```

### Services

```typescript
import { CacheService, createRetryPolicy } from '@cli-ops/shared-services'

// Caching
const cache = new CacheService({ ttl: 60000 })
await cache.set('key', 'value')
const value = await cache.get('key')

// Retry logic
const result = await createRetryPolicy({ maxRetries: 3 }).execute(async () => await fetchData())
```

## Event Communication

### Emitting Events

```typescript
export default class MyCommand extends BaseCommand {
  protected async execute(): Promise<void> {
    // Do work
    const result = await doSomething()

    // Emit event for other plugins
    this.emit('myfeature:action:complete', {
      result,
      timestamp: Date.now(),
    })
  }
}
```

### Listening to Events

```typescript
export class MyPlugin extends BasePlugin {
  async init(): Promise<void> {
    // Listen to events from other plugins
    this.on('tasks:created', (data) => {
      this.logger.info('Task created:', data)
    })

    this.on('fetch:request:complete', (data) => {
      this.logger.info('Request completed:', data)
    })
  }

  async destroy(): Promise<void> {
    // Clean up listeners
    this.removeAllListeners()
  }
}
```

## Testing Plugins

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import MyFeatureHello from '../src/commands/myfeature/hello'

describe('MyFeatureHello', () => {
  it('should greet user', async () => {
    const command = new MyFeatureHello(['--name', 'World'], {} as any)
    await command.run()
    // Add assertions
  })
})
```

### Integration Tests

```bash
# Test in development
clio plugins:link .
clio myfeature:hello --name Test
```

## Publishing

### 1. Create Changeset

```bash
pnpm changeset
# Select: minor (for new features) or patch (for fixes)
# Enter summary of changes
```

### 2. Build

```bash
pnpm build
```

### 3. Publish

```bash
pnpm changeset:publish
```

## Next Steps

- [Plugin Best Practices](./best-practices)
- [View Example Plugins](https://github.com/archubbuck/cli-ops/tree/main/plugins)
- [Architecture Overview](/docs/architecture/overview)
