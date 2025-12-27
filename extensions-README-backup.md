# Extension Plugin Examples

This directory contains extension plugin examples demonstrating how to extend base clio plugins with additional functionality. These plugins show real-world integration patterns.

## Available Examples

### 1. @cli-ops/clio-plugin-tasks-jira

Jira integration plugin extending `@cli-ops/clio-plugin-tasks`.

**Features:**

- Sync tasks with Jira projects
- Link local tasks to Jira issues
- Two-way synchronization support

**Installation:**

```bash
clio plugins:install @cli-ops/clio-plugin-tasks-jira
```

**Usage:**

```bash
clio tasks:jira:sync --project MYPROJECT
clio tasks:jira:link 123 PROJ-456
```

### 2. @cli-ops/clio-plugin-fetch-oauth

OAuth 2.0 authentication plugin extending `@cli-ops/clio-plugin-fetch`.

**Features:**

- Multiple OAuth providers (GitHub, Google, GitLab)
- Automatic token injection
- Token management and refresh

**Installation:**

```bash
clio plugins:install @cli-ops/clio-plugin-fetch-oauth
```

**Usage:**

```bash
clio fetch:oauth:login --provider github
clio fetch:get https://api.github.com/user
```

### 3. @cli-ops/clio-plugin-repo-hooks

Git hooks automation plugin extending `@cli-ops/clio-plugin-repo`.

**Features:**

- Interactive hook installation
- Multiple hook templates
- Customizable check configurations

**Installation:**

```bash
clio plugins:install @cli-ops/clio-plugin-repo-hooks
```

**Usage:**

```bash
clio repo:hooks:install
clio repo:hooks:list
```

## Development

Each plugin follows the same structure:

```
clio-plugin-{feature}-{extension}/
├── package.json           # Plugin metadata and dependencies
├── tsconfig.json          # TypeScript configuration
├── README.md              # Plugin documentation
└── src/
    ├── index.ts           # Plugin class
    └── commands/          # Plugin commands
        └── {topic}/
            └── {command}.ts
```

### Building Plugins

```bash
# Navigate to plugin directory
cd extensions/clio-plugin-tasks-jira

# Install dependencies
pnpm install

# Build
pnpm build

# Type check
pnpm typecheck
```

### Testing Plugins Locally

```bash
# Link plugin for local development
clio plugins link extensions/clio-plugin-tasks-jira

# Verify installation
alpha plugins

# Test commands
alpha jira sync --project TEST --dry-run
```

## Plugin Architecture

All example plugins extend `BasePlugin` or `BasePluginCommand` from `shared-plugins`:

```typescript
import { BasePlugin, BasePluginCommand } from '@/shared-plugins'
import type { PluginMetadata } from '@/shared-types'

export class MyPlugin extends BasePlugin {
  readonly metadata: PluginMetadata = {
    name: 'cli-alpha-plugin-custom',
    version: '1.0.0',
    description: 'Custom functionality',
  }

  async init(): Promise<void> {
    // Initialize plugin
  }

  async destroy(): Promise<void> {
    // Cleanup
  }
}
```

## Publishing Plugins

To publish a plugin to npm:

```bash
# 1. Build the plugin
pnpm build

# 2. Update version
npm version patch|minor|major

# 3. Publish to npm
npm publish --access public

# 4. Install from npm
alpha plugins install cli-alpha-plugin-jira
```

## Plugin Guidelines

1. **Naming Convention**: `cli-{name}-plugin-{feature}`
2. **Semantic Versioning**: Follow semver for releases
3. **Documentation**: Include comprehensive README
4. **Type Safety**: Use TypeScript and shared types
5. **Event Communication**: Use event bus for inter-plugin communication
6. **Configuration**: Support plugin config namespace
7. **Testing**: Include tests for commands and plugin logic

## Resources

- [Plugin Development Guide](../docs/contributing/plugin-development.md)
- [Architecture Documentation](../docs/ARCHITECTURE.md)
- [ADR-009: Plugin System Architecture](../docs/adr/009-plugin-system-architecture.md)

## License

MIT
