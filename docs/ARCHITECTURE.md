---
sidebar_position: 1
sidebar_label: System Architecture
title: Architecture Overview
description: Complete architecture documentation for the CLI Ops plugin-first monorepo
---

# Architecture

This document describes the architecture of the CLI Ops plugin-first monorepo.

## Overview

The workspace is a **monorepo** with a unified CLI (`clio`) as a plugin manager. It uses:

- **oclif v4** - CLI framework with plugin system
- **pnpm workspaces** for package management
- **Turborepo** for build orchestration
- **Changesets** for versioning
- **TypeScript** with strict mode
- **@cli-ops scope** for npm packages

## Directory Structure

```
.
├── apps/
│   ├── clio/                      # Core CLI manager (@cli-ops/clio)
│   └── website/                   # Documentation site (Docusaurus)
├── plugins/
│   ├── clio-plugin-tasks/         # Task management plugin (bundled)
│   ├── clio-plugin-fetch/         # HTTP API client plugin
│   └── clio-plugin-repo/          # Developer tools plugin
├── libs/
│   ├── clio-meta-developer/       # Dev persona bundle
│   ├── clio-meta-complete/        # Complete bundle
│   ├── shared-commands/           # Base command classes
│   ├── shared-config/             # Configuration management
│   ├── shared-core/               # Core utilities
│   ├── shared-exit-codes/         # Standard exit codes
│   ├── shared-formatter/          # Output formatters
│   ├── shared-history/            # Command history
│   ├── shared-hooks/              # Lifecycle hooks
│   ├── shared-ipc/                # Inter-process communication
│   ├── shared-logger/             # Logging utilities
│   ├── shared-plugins/            # Plugin system infrastructure
│   ├── shared-prompts/            # Interactive prompts
│   ├── shared-services/           # Service abstractions
│   ├── shared-testing/            # Testing utilities
│   ├── shared-types/              # TypeScript types
│   └── shared-ui/                 # CLI UI components
├── tooling/                       # Shared tooling configs
│   ├── eslint-config/             # ESLint configuration
│   ├── prettier-config/           # Prettier configuration
│   ├── tsconfig-base/             # TypeScript configurations
│   └── perf-config/               # Performance budgets
├── docs/                          # Documentation
├── scripts/                       # Build and utility scripts
└── completions/                   # Shell completion scripts

Note: Extension plugins are nested under their parent plugins at `plugins/{parent}/src/extensions/{extension}`
```

## Architecture Layers

### Layer 0: Core CLI (clio)

- **Purpose**: Plugin manager and foundational CLI
- **Package**: `@cli-ops/clio`
- **Contents**: Core commands (config, history, doctor), plugin management
- **Bundles**: `@oclif/plugin-plugins`, `@oclif/plugin-help`, `@cli-ops/clio-plugin-tasks`

### Layer 1: Foundation (Tooling)

- **Purpose**: Workspace-wide consistency
- **Packages**: `tooling/*`
- **Contents**: ESLint, Prettier, TypeScript configs

### Layer 2: Types

- **Purpose**: Shared type definitions
- **Package**: `@cli-ops/shared-types`
- **Contents**: TypeScript types and interfaces

### Layer 3: Infrastructure

- **Purpose**: Low-level utilities
- **Packages**:
  - `@cli-ops/shared-exit-codes` - Standard exit codes
  - `@cli-ops/shared-logger` - Logging
  - `@cli-ops/shared-config` - Configuration
  - `@cli-ops/shared-ipc` - Inter-process communication
  - `@cli-ops/shared-history` - Command history
- **Dependencies**: Types only

### Layer 4: UI & Formatting

- **Purpose**: User interaction and output
- **Packages**:
  - `@cli-ops/shared-ui` - Spinners, progress bars, tasks
  - `@cli-ops/shared-formatter` - JSON, YAML, table, Markdown, CSV
  - `@cli-ops/shared-prompts` - Interactive prompts
- **Dependencies**: Infrastructure + Types

### Layer 5: Core

- **Purpose**: Business logic abstractions
- **Packages**:
  - `@cli-ops/shared-core` - Error classes, context
  - `@cli-ops/shared-services` - Service patterns
  - `@cli-ops/shared-testing` - Test utilities
- **Dependencies**: All lower layers

### Layer 6: Commands

- **Purpose**: CLI framework integration
- **Packages**: `@cli-ops/shared-commands`, `@cli-ops/shared-hooks`
- **Dependencies**: All lower layers + oclif
- **Contents**: Base command classes, hooks

### Layer 6.5: Plugins

- **Purpose**: Plugin system infrastructure
- **Package**: `@cli-ops/shared-plugins`
- **Dependencies**: Commands + IPC + Logger + Types
- **Contents**: Plugin manager, base plugin classes, plugin hooks
- **Note**: Plugins register with clio's plugin system

### Layer 7: Plugin Implementations

- **Purpose**: Feature-specific functionality
- **Packages**:
  - `@cli-ops/clio-plugin-tasks` - Task management (bundled)
  - `@cli-ops/clio-plugin-fetch` - HTTP API client (installable)
  - `@cli-ops/clio-plugin-repo` - Developer tools (installable)
- **Dependencies**: All shared packages
- **Contents**: Commands, business logic, plugin-specific utilities

### Layer 8: Meta-Packages

- **Purpose**: Persona-based installation bundles
- **Packages**:
  - `@cli-ops/clio-meta-developer` - clio + fetch + repo
  - `@cli-ops/clio-meta-complete` - All plugins
- **Contents**: postinstall scripts auto-installing plugins

## Plugin Architecture

### Plugin Discovery

```
User executes: clio tasks:create "Task"
  ↓
clio plugin loader
  ↓
Check bundled plugins (tasks)
  ↓
Check installed plugins (fetch, repo)
  ↓
Load plugin commands
  ↓
Execute command
```

### Plugin Structure

```typescript
// @cli-ops/clio-plugin-tasks/package.json
{
  "name": "@cli-ops/clio-plugin-tasks",
  "version": "2.0.0",
  "oclif": {
    "bin": "clio",
    "commands": "./dist/commands"
  },
  "peerDependencies": {
    "@cli-ops/clio": "^1.0.0"
  }
}
```

### Plugin Installation

```bash
# Via meta-package postinstall
npm install -g @cli-ops/clio-meta-developer
# → Auto-installs: clio, fetch, repo plugins

# Manual installation
clio plugins:install @cli-ops/clio-plugin-fetch
clio plugins:list
```

## Design Principles

### 1. Plugin-First Design

All functionality beyond core management is delivered as plugins:

- **Bundled**: Tasks plugin included by default
- **Installable**: Fetch, repo, and community plugins on-demand
- **Composable**: Mix and match plugins per user needs

### 2. Dependency Direction

Dependencies flow **upward only**:

```
Meta-Packages → Plugins → clio Core → Commands → Core → UI/Formatting → Infrastructure → Types → Tooling
```

### 3. Separation of Concerns

- **UI**: Visual components (spinners, tables)
- **Logic**: Business rules in plugins
- **Data**: Storage and caching in services
- **Framework**: oclif integration in commands

### 4. Composition over Inheritance

- Small, focused packages
- Compose functionality via imports
- Minimal inheritance hierarchies

### 5. Type Safety

- Strict TypeScript everywhere
- Zod for runtime validation
- No `any` types

### 6. ADHD/OCD Optimization

- **Predictability**: Consistent patterns
- **Organization**: Clear structure
- **Simplicity**: Minimal complexity
- **Feedback**: Visual indicators

## Package Dependencies

### No External Dependencies

- `@cli-ops/shared-exit-codes`
- `@cli-ops/shared-types`

### Minimal Dependencies

- `@cli-ops/shared-logger`: debug, pino
- `@cli-ops/shared-ui`: ora, cli-progress, listr2, chalk
- `@cli-ops/shared-formatter`: cli-table3, chalk
- `@cli-ops/shared-prompts`: inquirer, zod

### Framework Integration

- `@cli-ops/shared-commands`: @oclif/core
- `@cli-ops/shared-hooks`: @oclif/core
- `@cli-ops/clio`: @oclif/core, @oclif/plugin-plugins, @oclif/plugin-help

### Plugin Dependencies

All plugins (`@cli-ops/clio-plugin-*`) have:

- **peerDependencies**: `@cli-ops/clio` (ensures core CLI is installed)
- **dependencies**: Shared packages (`@cli-ops/shared-*`)

### CLI Application Inventory

> **Auto-generated from inventory.** Last updated: December 29, 2025

#### clio

**Foundational plugin manager CLI for CLI Ops tools**

```
@cli-ops/clio@1.0.0
├── Commands: 7
│   ├── config:get
│   ├── config:list
│   ├── config:set
│   ├── doctor
│   ├── history:list
│   ├── plugins:extensions
│   └── setup
│
└── Shared Dependencies: 0 packages
```

#### clio

**HTTP API client plugin for clio**

```
@cli-ops/clio-plugin-fetch@3.0.0
├── Commands: 2
│   [request:get, request:post]
│
└── Shared Dependencies: 0 packages
```

#### clio

**OAuth 2.0 authentication plugin for clio fetch**

```
@cli-ops/clio-plugin-fetch-oauth@3.0.0
├── Commands: 1
│   [oauth:login]
│
└── Shared Dependencies: 0 packages
```

#### clio

**Developer tools plugin for clio with Git and GitHub integration**

```
@cli-ops/clio-plugin-repo@3.0.0
├── Commands: 3
│   [git:log, git:status, pr:list]
│
└── Shared Dependencies: 0 packages
```

#### clio

**Git hooks automation plugin for clio repo**

```
@cli-ops/clio-plugin-repo-hooks@3.0.0
├── Commands: 1
│   [hooks:install]
│
└── Shared Dependencies: 0 packages
```

#### clio

**Task management plugin for clio**

```
@cli-ops/clio-plugin-tasks@3.0.0
├── Commands: 5
│   ├── tasks:create
│   ├── tasks:delete
│   ├── tasks:list
│   ├── tasks:show
│   └── tasks:update
│
└── Shared Dependencies: 0 packages
```

#### clio

**Jira integration plugin for clio tasks**

```
@cli-ops/clio-plugin-tasks-jira@3.0.0
├── Commands: 2
│   [jira:link, jira:sync]
│
└── Shared Dependencies: 0 packages
```

**Summary:**

| CLI  | Version | Commands | Shared Packages |
| ---- | ------- | -------- | --------------- |
| clio | 1.0.0   | 7        | 0               |
| clio | 3.0.0   | 2        | 0               |
| clio | 3.0.0   | 1        | 0               |
| clio | 3.0.0   | 3        | 0               |
| clio | 3.0.0   | 1        | 0               |
| clio | 3.0.0   | 5        | 0               |
| clio | 3.0.0   | 2        | 0               |

For detailed command information, see [CLI-INVENTORY.md](CLI-INVENTORY.md).

## Build Pipeline

### Turborepo Configuration

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

### Build Order

1. **Tooling packages** (configs)
2. **Types** (`@cli-ops/shared-types`)
3. **Infrastructure** (logger, config, etc.)
4. **UI/Formatting** (ui, formatter, prompts)
5. **Core** (core, services, testing)
6. **Commands** (commands, hooks)
7. **Core CLI** (`@cli-ops/clio`)
8. **Plugins** (`@cli-ops/clio-plugin-*`)
9. **Meta-packages** (`@cli-ops/clio-meta-*`)

## Data Flow

### Command Execution (Plugin-based)

```
User Input: clio tasks:create "Task"
  ↓
oclif Parser
  ↓
Plugin Loader (clio)
  ↓
Load tasks plugin
  ↓
BaseCommand (from shared-commands)
  ↓
Task Command Logic
  ↓
Services/Storage
  ↓
Formatters
  ↓
Output
```

### Configuration Loading

```
CLI Start (clio)
  ↓
Context Creation
  ↓
Config Loader (~/.config/clio/config.json)
  ↓
Plugin Configs (~/.config/clio/plugins/*.json)
  ↓
Validation (Zod)
  ↓
Merged Config
```

### Plugin Installation Flow

```
User: clio plugins:install @cli-ops/clio-plugin-fetch
  ↓
@oclif/plugin-plugins
  ↓
npm install -g @cli-ops/clio-plugin-fetch
  ↓
Register plugin with clio
  ↓
Cache plugin commands
  ↓
Available: clio fetch:get URL
```

## Testing Strategy

### Unit Tests

- Each package has its own tests
- Run with: `pnpm test`
- Coverage target: 80%

### E2E Tests

- Test full CLI workflows
- Run with: `pnpm test:e2e`
- Use `@oclif/test` helpers

### Performance Tests

- Validate startup times
- Run with: `pnpm perf`
- Budgets defined in `perf-config`

## CI/CD Pipeline

### GitHub Actions Workflows

#### CI (on push/PR)

1. Lint
2. Type check
3. Build
4. Test
5. Performance check

#### Release (on main)

1. Build
2. Changesets version
3. Publish to npm
4. Create GitHub release

## Error Handling

### Error Hierarchy

```
Error
  └── CLIError (with exit codes)
      ├── ValidationError (code: 2)
      ├── ConfigError (code: 64)
      ├── NotFoundError (code: 101)
      ├── AuthError (code: 100)
      └── NetworkError (code: 102)
```

### Error Display

1. Error message
2. Suggestions (if available)
3. Cause chain (if available)
4. Exit with appropriate code

## Performance Optimization

### Strategies

- **Lazy loading**: Import heavy modules only when needed
- **Caching**: Cache API responses and config
- **Parallelization**: Use Turborepo's parallel builds
- **Tree shaking**: ESM modules for better bundling

### Budgets

- Help command: < 500ms
- Version command: < 200ms
- List commands: < 1000ms
- Create commands: < 1000ms

## Security

### Best Practices

- No secrets in code
- Environment variable validation
- Input sanitization
- Zod schema validation
- ESLint security rules

## Extensibility

### Adding New Plugin

1. Use generator: `pnpm generate:cli` (generates plugin structure)
2. Update package.json:
   - Name: `@cli-ops/clio-plugin-{name}`
   - Add `peerDependencies`: `@cli-ops/clio`
   - Add oclif config with `"bin": "clio"`
3. Add commands to `/src/commands/`
4. Update workspace config
5. Publish to npm under `@cli-ops` scope

### Adding New Shared Package

1. Use generator: `pnpm generate:package`
2. Implement functionality
3. Add tests
4. Update dependencies
5. Publish as `@cli-ops/shared-{name}`

### Adding Command to Plugin

1. Use generator: `pnpm generate:command`
2. Extend BaseCommand from `@cli-ops/shared-commands`
3. Add to plugin's `/src/commands/` directory
4. Document usage
5. Plugin commands automatically available after install

### Creating Meta-Package

1. Create `@cli-ops/clio-meta-{persona}` package
2. Add dependencies (clio + plugins)
3. Create postinstall.js:
   ```javascript
   const { execSync } = require('child_process')
   const plugins = ['@cli-ops/clio-plugin-fetch', '@cli-ops/clio-plugin-repo']
   plugins.forEach((plugin) => {
     try {
       execSync(`clio plugins:install ${plugin}`, { stdio: 'inherit' })
     } catch (e) {
       console.warn(`Failed to install ${plugin}`)
     }
   })
   ```
4. Document persona use case

## Future Enhancements

### Implemented

- ✅ Plugin system - Dynamic extension via npm packages
- ✅ Plugin manager - Core clio CLI manages plugins
- ✅ Scoped packages - `@cli-ops` namespace
- ✅ Meta-packages - Persona-based bundles

### Planned

- API documentation generation
- Interactive tutorials
- Update notifications
- Telemetry (opt-in)
- Community plugin registry
- Plugin marketplace

### Experimental

- WebAssembly modules
- GUI wrapper
- VS Code extension
- Browser-based CLI
