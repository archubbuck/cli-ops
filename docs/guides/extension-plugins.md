# Extension Plugin Development

Guide to creating extension plugins that enhance existing plugins with additional functionality.

## Overview

Extension plugins are a special type of plugin that **extend** existing plugins rather than creating completely new functionality. They register themselves as extensions and hook into parent plugin lifecycle events.

## Extension vs Regular Plugin

### Regular Plugin

- Standalone functionality
- Adds new commands to CLI
- Independent lifecycle
- Example: `@cli-ops/clio-plugin-fetch`

### Extension Plugin

- Enhances existing plugin
- Hooks into parent plugin commands
- Shares parent lifecycle
- Example: `@cli-ops/clio-plugin-tasks-jira` extends `tasks` plugin

## Extension Plugin Architecture

```
Parent Plugin (tasks)
  ↓
  ├── Core Commands (create, list, update, delete)
  ├── Extension Registry
  └── Extension Hooks (before/after operations)
       ↓
       Extension Plugin (tasks-jira)
         ├── Provider Implementation
         ├── Custom Commands (tasks:jira:sync)
         └── Hook Handlers
```

## Creating an Extension Plugin

### 1. Naming Convention

Extension plugins must follow the naming pattern:

```
@cli-ops/clio-plugin-{parent}-{extension}
```

Examples:

- `@cli-ops/clio-plugin-tasks-jira` - Jira integration for tasks
- `@cli-ops/clio-plugin-tasks-github` - GitHub issues integration
- `@cli-ops/clio-plugin-fetch-oauth` - OAuth authentication for fetch

### 2. Package Structure

```
clio-plugin-tasks-jira/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # Extension entry point
│   ├── extension.ts                # BaseExtensionPlugin implementation
│   ├── commands/
│   │   └── tasks/
│   │       └── jira/
│   │           ├── sync.ts         # Custom commands
│   │           └── configure.ts
│   ├── providers/
│   │   └── jira-provider.ts        # Provider implementation
│   └── hooks/
│       ├── init.ts                 # Lifecycle hooks
│       └── prerun.ts
└── README.md
```

### 3. Extend BaseExtensionPlugin

```typescript
// src/extension.ts
import { BaseExtensionPlugin } from '@cli-ops/shared-plugins'
import type { ExtensionConfig, ExtensionMetadata } from '@cli-ops/shared-types'

export class JiraExtension extends BaseExtensionPlugin {
  // Required: Extension metadata
  static override metadata: ExtensionMetadata = {
    id: 'jira',
    name: 'Jira Integration',
    description: 'Sync tasks with Jira issues',
    version: '1.0.0',
    parentPlugin: '@cli-ops/clio-plugin-tasks',
    author: 'CLI Ops Team',
    homepage: 'https://github.com/archubbuck/cli-ops',
    requires: {
      parent: '>=1.0.0',
      node: '>=18.0.0',
    },
  }

  // Required: Initialize extension
  async initialize(config: ExtensionConfig): Promise<void> {
    this.log('Initializing Jira extension...')

    // Validate configuration
    this.validateConfig(config)

    // Register with parent plugin
    await this.registerWithParent()

    // Set up provider
    await this.setupProvider(config)
  }

  // Required: Extension capabilities
  getCapabilities(): string[] {
    return ['sync', 'auth', 'webhook', 'search']
  }

  // Optional: Custom validation
  validateConfig(config: ExtensionConfig): void {
    if (!config.jira?.url) {
      throw new Error('Jira URL is required')
    }
    if (!config.jira?.email || !config.jira?.apiToken) {
      throw new Error('Jira credentials are required')
    }
  }

  // Optional: Cleanup
  async cleanup(): Promise<void> {
    this.log('Cleaning up Jira extension...')
    await this.unregisterProvider()
  }
}
```

### 4. Register Extension

```typescript
// src/index.ts
import { JiraExtension } from './extension'
import type { Plugin } from '@oclif/core'

export default class ClioPluginTasksJira implements Plugin {
  async load(): Promise<void> {
    // Register extension with parent plugin
    const extension = new JiraExtension()
    await extension.register()
  }

  // Export for parent plugin discovery
  static extension = JiraExtension
}
```

### 5. Implement Lifecycle Hooks

Extensions can hook into parent plugin lifecycle:

```typescript
// src/hooks/init.ts
import { Hook } from '@oclif/core'

const hook: Hook<'init'> = async function (opts) {
  // Run before parent plugin commands
  const config = this.config.getPluginConfig('tasks-jira')

  if (config.autoSync) {
    this.log('Auto-sync enabled, checking for updates...')
    await this.syncWithJira()
  }
}

export default hook
```

```typescript
// src/hooks/prerun.ts
import { Hook } from '@oclif/core'

const hook: Hook<'prerun'> = async function (opts) {
  // Run before each command
  if (opts.Command.id.startsWith('tasks:')) {
    // Verify Jira connection before task operations
    await this.verifyJiraConnection()
  }
}

export default hook
```

### 6. Add Extension-Specific Commands

```typescript
// src/commands/tasks/jira/sync.ts
import { Command } from '@oclif/core'
import { BaseCommand } from '@cli-ops/shared-commands'

export default class TasksJiraSync extends BaseCommand<typeof TasksJiraSync> {
  static description = 'Sync local tasks with Jira issues'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --direction=pull',
    '<%= config.bin %> <%= command.id %> --project=PROJ --dry-run',
  ]

  static flags = {
    direction: Flags.string({
      description: 'Sync direction',
      options: ['push', 'pull', 'both'],
      default: 'both',
    }),
    project: Flags.string({
      description: 'Jira project key',
      required: false,
    }),
    'dry-run': Flags.boolean({
      description: 'Preview changes without syncing',
      default: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(TasksJiraSync)

    this.log('Starting Jira sync...')

    // Get extension instance
    const extension = await this.getExtension('tasks-jira')

    // Perform sync
    const result = await extension.sync({
      direction: flags.direction,
      project: flags.project,
      dryRun: flags['dry-run'],
    })

    this.log(`Synced ${result.count} tasks`)
  }
}
```

### 7. Implement Provider Interface

If the parent plugin uses a provider pattern, implement the required interface:

```typescript
// src/providers/jira-provider.ts
import type { TaskProvider, Task } from '@cli-ops/shared-types'

export class JiraTaskProvider implements TaskProvider {
  private client: JiraClient

  constructor(config: JiraConfig) {
    this.client = new JiraClient({
      host: config.url,
      authentication: {
        basic: {
          email: config.email,
          apiToken: config.apiToken,
        },
      },
    })
  }

  async getTasks(filter?: TaskFilter): Promise<Task[]> {
    const jql = this.buildJQL(filter)
    const issues = await this.client.issueSearch.searchForIssuesUsingJql({ jql })
    return issues.issues.map(this.mapIssueToTask)
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    const issue = await this.client.issues.createIssue({
      fields: {
        project: { key: task.project },
        summary: task.title,
        description: task.description,
        issuetype: { name: 'Task' },
      },
    })
    return this.mapIssueToTask(issue)
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    await this.client.issues.editIssue({
      issueIdOrKey: id,
      fields: {
        summary: updates.title,
        description: updates.description,
      },
    })
    return this.getTask(id)
  }

  async deleteTask(id: string): Promise<void> {
    await this.client.issues.deleteIssue({ issueIdOrKey: id })
  }

  private mapIssueToTask(issue: JiraIssue): Task {
    return {
      id: issue.key,
      title: issue.fields.summary,
      description: issue.fields.description,
      status: this.mapJiraStatus(issue.fields.status.name),
      priority: this.mapJiraPriority(issue.fields.priority?.name),
      createdAt: new Date(issue.fields.created),
      updatedAt: new Date(issue.fields.updated),
    }
  }
}
```

### 8. Configure package.json

```json
{
  "name": "@cli-ops/clio-plugin-tasks-jira",
  "version": "1.0.0",
  "description": "Jira integration extension for clio tasks plugin",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "oclif": {
    "bin": "clio",
    "extension": true,
    "parentPlugin": "@cli-ops/clio-plugin-tasks",
    "commands": "./dist/commands",
    "hooks": {
      "init": "./dist/hooks/init",
      "prerun": "./dist/hooks/prerun"
    },
    "topics": {
      "tasks:jira": {
        "description": "Manage Jira integration"
      }
    }
  },
  "dependencies": {
    "@cli-ops/clio-plugin-tasks": "^1.0.0",
    "@cli-ops/shared-commands": "workspace:*",
    "@cli-ops/shared-plugins": "workspace:*",
    "@cli-ops/shared-types": "workspace:*",
    "jira.js": "^2.0.0"
  },
  "peerDependencies": {
    "@cli-ops/clio-plugin-tasks": ">=1.0.0"
  }
}
```

## Extension Discovery

Parent plugins can discover and load extensions:

```typescript
// In parent plugin (tasks)
import { ExtensionRegistry } from '@cli-ops/shared-plugins'

export class TasksPlugin {
  private extensions: ExtensionRegistry

  async init(): Promise<void> {
    this.extensions = new ExtensionRegistry('tasks')

    // Discover installed extensions
    await this.extensions.discoverExtensions()

    // Load enabled extensions
    await this.extensions.loadExtensions()
  }

  getProviders(): TaskProvider[] {
    return this.extensions.getProviders()
  }
}
```

## Extension Configuration

Extensions inherit parent configuration and add their own:

```json
{
  "plugins": {
    "tasks": {
      "defaultProvider": "local",
      "syncInterval": 300000
    },
    "tasks-jira": {
      "enabled": true,
      "url": "https://your-domain.atlassian.net",
      "email": "user@example.com",
      "apiToken": "your-api-token",
      "project": "PROJ",
      "autoSync": true,
      "syncInterval": 600000
    }
  }
}
```

## Extension Management

Users can manage extensions through the parent plugin:

```bash
# List available extensions
clio tasks:extensions

# Enable extension
clio tasks:extensions:enable jira

# Disable extension
clio tasks:extensions:disable jira

# Configure extension
clio tasks:extensions:config jira

# Extension-specific commands
clio tasks:jira:sync
clio tasks:jira:configure
```

## Best Practices

### 1. Follow Parent Plugin Patterns

Match the parent plugin's conventions, command structure, and error handling.

### 2. Graceful Degradation

Extension should not break parent plugin if disabled or unavailable.

```typescript
// Parent plugin should handle missing extensions
const provider = this.extensions.getProvider('jira')
if (!provider) {
  this.warn('Jira extension not available, using local provider')
  return this.localProvider
}
```

### 3. Clear Extension Boundaries

Keep extension code separate from parent plugin. Use well-defined interfaces.

### 4. Configuration Validation

Validate extension configuration on initialization, provide helpful errors.

### 5. Proper Error Handling

Don't let extension errors crash parent plugin commands.

```typescript
try {
  await extension.sync()
} catch (error) {
  this.warn(`Extension sync failed: ${error.message}`)
  // Continue with local operations
}
```

### 6. Document Extension Points

In parent plugin, document how extensions can extend functionality:

```typescript
/**
 * Extension point for custom task providers.
 *
 * Extensions must implement TaskProvider interface.
 *
 * @example
 * class MyProvider implements TaskProvider {
 *   async getTasks() { ... }
 * }
 */
export interface TaskProvider {
  getTasks(filter?: TaskFilter): Promise<Task[]>
  createTask(task: Partial<Task>): Promise<Task>
  updateTask(id: string, updates: Partial<Task>): Promise<Task>
  deleteTask(id: string): Promise<void>
}
```

## Testing Extensions

```typescript
// test/extension.test.ts
import { expect } from '@jest/globals'
import { JiraExtension } from '../src/extension'

describe('JiraExtension', () => {
  it('registers with parent plugin', async () => {
    const extension = new JiraExtension()
    await extension.initialize(mockConfig)

    expect(extension.isRegistered).toBe(true)
  })

  it('provides Jira task provider', () => {
    const extension = new JiraExtension()
    const provider = extension.getProvider()

    expect(provider).toBeDefined()
    expect(provider.getTasks).toBeFunction()
  })
})
```

## Publishing Extensions

```bash
# Build extension
pnpm run build

# Publish to npm
npm publish --access public

# Users install
clio plugins:install @cli-ops/clio-plugin-tasks-jira
```

## Example Extensions

Reference implementations:

- **tasks-jira**: Jira issue synchronization
- **tasks-github**: GitHub issues integration
- **fetch-oauth**: OAuth 2.0 authentication
- **repo-hooks**: Git hooks management

## See Also

- [Plugin Development](/docs/contributing/plugin-development) - Creating regular plugins
- [Plugin Best Practices](/docs/contributing/plugin-best-practices) - Development guidelines
- [Architecture: Plugin System](/docs/architecture/overview#plugin-system) - Technical details
- [Shared Packages](/docs/architecture/monorepo-structure#shared-packages) - Available utilities
