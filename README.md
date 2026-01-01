# CLI Ops - Unified CLI Workspace

> Plugin-first CLI architecture with clio as the foundational manager

## Overview

This is a production-ready monorepo containing a unified CLI (`clio`) with pluggable functionality built with:

- **oclif** - Extensible CLI framework with plugin system
- **TypeScript** - Type-safe development
- **pnpm** - Fast, efficient package manager
- **Turborepo** - Intelligent build system with caching
- **Changesets** - Automated versioning and changelogs

## Installation

### Quick Install

```bash
# Install clio with default task management plugin
npm install -g @cli-ops/clio

# Or install persona-based bundles
npm install -g @cli-ops/clio-meta-developer    # clio + fetch + repo
npm install -g @cli-ops/clio-meta-complete     # all plugins
```

### Individual Plugins

```bash
# Install additional plugins as needed
clio plugins:install @cli-ops/clio-plugin-fetch
clio plugins:install @cli-ops/clio-plugin-repo
```

## Available Commands

### Core (built-in)

```bash
clio config:get KEY         # Get configuration value
clio config:set KEY VALUE   # Set configuration value
clio history:list           # View command history
clio doctor                 # Check installation health
clio plugins                # Manage plugins
```

### Tasks (bundled by default)

```bash
clio tasks:create "Task"    # Create a new task
clio tasks:list             # List all tasks
clio tasks:update ID        # Update a task
clio tasks:delete ID        # Delete a task
```

### Fetch (installable plugin)

```bash
clio fetch:get URL          # Make HTTP GET request
clio fetch:post URL         # Make HTTP POST request
clio auth:login             # Authenticate
```

### Repo (installable plugin)

```bash
clio repo:status            # Show repository status
clio repo:clone REPO        # Clone a repository
clio repo:pr                # Manage pull requests
```

## Structure

```
.
├── apps/
│   ├── clio/                      # Core CLI manager
│   └── website/                   # Documentation site
├── plugins/
│   ├── clio-plugin-tasks/         # Task management (bundled)
│   │   └── src/
│   │       └── extensions/        # Extensions that enhance tasks plugin
│   │           └── clio-plugin-tasks-jira/  # Jira integration
│   ├── clio-plugin-fetch/         # HTTP API client
│   │   └── src/
│   │       └── extensions/        # Extensions that enhance fetch plugin
│   │           └── clio-plugin-fetch-oauth/ # OAuth authentication
│   └── clio-plugin-repo/          # Developer tools
│       └── src/
│           └── extensions/        # Extensions that enhance repo plugin
│               └── clio-plugin-repo-hooks/  # Git hooks automation
├── libs/
│   ├── clio-meta-*/               # Persona-based bundles
│   └── shared-*/                  # Shared libraries (@cli-ops/shared-*)
├── tooling/                       # Development configs
├── docs/                          # Documentation
└── scripts/                       # Helper scripts
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run CLIs in dev mode
pnpm dev:clio       # Core CLI
pnpm dev:tasks      # Tasks plugin
pnpm dev:fetch      # Fetch plugin
pnpm dev:repo       # Repo plugin
pnpm dev:docs       # Documentation site

# Generate new code
pnpm generate:plugin    # Create new plugin with full setup
pnpm generate:command   # Add command to existing plugin
pnpm generate:package   # Create new shared package

# Run tests
pnpm test

# Lint & format
pnpm lint
pnpm format

# Type check
pnpm typecheck

# Clean build artifacts
pnpm clean
```

## Creating a Plugin

Use the generator to scaffold a new plugin:

```bash
pnpm generate:plugin

# Follow the prompts:
# - Plugin name (e.g., "slack")
# - Description
# - Author
# - Include tests? (Y/n)
# - Include CI? (Y/n)
# - Include docs? (Y/n)
```

This creates a complete plugin with:

- TypeScript setup
- Command templates
- Test structure
- CI/CD workflow (optional)
- Documentation template (optional)
- oclif configuration

## Package Naming

All packages use `@cli-ops` scoped names:

- **Core**: `@cli-ops/clio`
- **Plugins**: `@cli-ops/clio-plugin-{name}`
- **Extensions**: `@cli-ops/{plugin}-plugin-{feature}`
- **Shared**: `@cli-ops/shared-{name}`
- **Meta**: `@cli-ops/clio-meta-{persona}`

Import using `@/` aliases:

```typescript
import { logger } from '@/shared-logger'
import { BaseCommand } from '@/shared-commands'
```

## Architecture

- **Plugin-first design**: Core CLI + pluggable functionality
- **Independent versioning**: Each package versioned separately
- **Persona-based bundles**: Install what you need
- **Shared infrastructure**: Common utilities across plugins
- **NPM published**: Available via `@cli-ops` organization

## Performance

- **Budget**: `<500ms` for help commands, `<200ms` for version
- **Shell Completion**: Auto-generated for bash/zsh/fish
- **Consistency**: Enforced via ESLint, Prettier, git hooks
- **Testing**: Unit + E2E tests with coverage requirements

## Documentation

See [`docs/`](./docs/) for detailed documentation:

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)
- [Plugin Development](./docs/contributing/plugin-development.md)
- [Release Process](./docs/RELEASE-PROCESS.md)

## Publishing

Automated via GitHub Actions and Changesets with support for modern npm trusted publishing.

```bash
# Create a changeset
pnpm changeset

# Version packages (in CI)
pnpm changeset:version

# Publish to npm (in CI)
pnpm changeset:publish
```

### Publishing Methods

The release workflow supports two authentication methods:

- **Trusted Publishing (OIDC)**: Secure, token-less publishing with automatic provenance
  - See [NPM Trusted Publishing Guide](./docs/NPM-TRUSTED-PUBLISHING.md)
  - Recommended for production use
  - No npm token management required

- **Token-Based**: Traditional npm token authentication
  - See [Release Process](./docs/RELEASE-PROCESS.md)
  - Supports gradual migration to trusted publishing

**Note**: Due to GitHub Actions restrictions on PR creation, the release workflow requires a Personal Access Token (PAT) for creating version PRs. See the [Release Process documentation](./docs/RELEASE-PROCESS.md) for setup instructions.

## Version History

### v4.0.0 (Plugins) / v2.0.0 (Core) - Extension Plugin Formalization

**BREAKING CHANGES**: Extension plugins refactored to top-level architecture

- ✨ Extensions moved from nested to top-level `plugins/` directories
- ✨ New `BaseExtensionPlugin` class with explicit parent registration
- ✨ Type-safe hook system for extension points (replaces event-only approach)
- ✨ Runtime validation of parent dependencies and hook compatibility
- ✨ `clio plugins:extensions` command for extension discovery
- ✨ `pnpm validate:extensions` script for automated validation
- 📚 Extension API documentation added to all base plugin READMEs
- 🔄 Backward compatible: Event-based communication still supported

**Migration Required**: See [ADR-010](./docs/adr/010-extension-plugin-formalization.md) for upgrade guide

**Affected Packages**:

- `@cli-ops/shared-plugins@4.0.0`
- `@cli-ops/clio-plugin-tasks@4.0.0`
- `@cli-ops/clio-plugin-fetch@4.0.0`
- `@cli-ops/clio-plugin-repo@4.0.0`
- `@cli-ops/clio-plugin-tasks-jira@4.0.0`
- `@cli-ops/clio-plugin-fetch-oauth@4.0.0`
- `@cli-ops/clio-plugin-repo-hooks@4.0.0`

### v2.0.0 (Core) - Initial Release

**Note**: This is the initial stable release of all packages, incorporating the extension plugin formalization work.

- 🚀 Plugin-first architecture with clio as the foundational manager
- 📦 oclif v4 with plugin management
- 📝 Command history with undo/redo support
- ⚙️ Unified configuration management
- 🔧 Built-in task management (bundled with clio)
- 🔌 Event-based inter-plugin communication
- 📚 Comprehensive documentation and testing utilities

## License

MIT
