# shared-plugins

> Plugin system utilities for CLI applications

## Overview

This package provides the infrastructure for managing plugins in the CLI ecosystem. It includes:

- **PluginManager**: Central manager for discovering, loading, and managing plugins
- **BasePlugin**: Abstract base class for creating plugins
- **BasePluginCommand**: Base class for plugin commands
- **Plugin Hooks**: Lifecycle hooks for plugin events

## Features

- ✅ Plugin validation and registration
- ✅ Event-based inter-plugin communication
- ✅ Plugin lifecycle management (load/unload)
- ✅ Integration with oclif plugin system
- ✅ Type-safe plugin metadata
- ✅ Scoped plugin isolation per CLI

## Usage

### Creating a Plugin

```typescript
import { BasePlugin } from '@/shared-plugins'
import type { PluginMetadata } from '@/shared-types'

export class MyPlugin extends BasePlugin {
  readonly metadata: PluginMetadata = {
    name: 'cli-alpha-plugin-custom',
    version: '1.0.0',
    description: 'Custom functionality plugin',
  }

  async init(): Promise<void> {
    // Initialize plugin resources
    this.emit('custom:ready', { plugin: this.metadata.name })
  }

  async destroy(): Promise<void> {
    // Cleanup resources
  }
}
```

### Creating a Plugin Command

```typescript
import { BasePluginCommand } from '@/shared-plugins'
import { Flags } from '@oclif/core'

export default class CustomCommand extends BasePluginCommand {
  static pluginName = 'cli-alpha-plugin-custom'
  static pluginVersion = '1.0.0'

  static description = 'Custom command from plugin'

  static flags = {
    option: Flags.string({ description: 'Custom option' }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(CustomCommand)

    // Emit plugin event
    this.emitPluginEvent('custom:executed', { flags })

    this.log('Custom command executed!')
  }
}
```

### Using the Plugin Manager

```typescript
import { getPluginManager } from '@/shared-plugins'

const manager = getPluginManager()

// Listen to plugin events
manager.getEventBus().on('plugin:loaded', (data) => {
  console.log('Plugin loaded:', data)
})

// Check if plugin is loaded
if (manager.isPluginLoaded('cli-alpha-plugin-custom')) {
  console.log('Plugin is loaded')
}

// Get plugin count
console.log(`Total plugins: ${manager.getPluginCount()}`)
```

## Plugin Naming Convention

Plugins must follow the naming convention:

```
cli-{cli-name}-plugin-{feature}
```

Examples:

- `cli-alpha-plugin-jira`
- `cli-beta-plugin-auth-oauth`
- `cli-gamma-plugin-git-hooks`

## Plugin Validation

The plugin manager automatically validates:

- ✅ Plugin name format
- ✅ Semantic versioning
- ✅ Required metadata fields
- ✅ No duplicate registrations

## Inter-Plugin Communication

Plugins can communicate using the event bus:

```typescript
// Plugin A
this.emit('data:processed', { items: 42 })

// Plugin B
this.on('data:processed', (data) => {
  console.log('Received data:', data)
})
```

## Architecture

```
shared-plugins/
├── src/
│   ├── plugin-manager.ts     # Plugin management
│   ├── base-plugin.ts        # Base plugin classes
│   ├── hooks/
│   │   └── plugin-loaded.ts  # Plugin lifecycle hooks
│   └── index.ts              # Public exports
├── package.json
├── tsconfig.json
└── README.md
```

## Dependencies

- `@oclif/core` - CLI framework
- `shared-types` - Type definitions
- `shared-ipc` - Event bus for communication
- `shared-logger` - Logging utilities
- `shared-core` - Core utilities (error classes)

## License

MIT
