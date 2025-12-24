# CLI Workspace

> Multi-CLI monorepo workspace optimized for AI-driven solution engineering

## Overview

This is a production-ready monorepo containing multiple CLI applications built with:

- **oclif** - Extensible CLI framework
- **TypeScript** - Type-safe development
- **pnpm** - Fast, efficient package manager
- **Turborepo** - Intelligent build system with caching
- **Changesets** - Automated versioning and changelogs

## Structure

```
.
├── apps/           # CLI applications
├── packages/       # Shared libraries
├── tooling/        # Development configs
├── docs/           # Documentation
└── scripts/        # Helper scripts
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages and apps
pnpm build

# Run a specific CLI in dev mode
pnpm dev:alpha

# Run tests
pnpm test

# Lint
pnpm lint
```

## Package Naming

Packages use unscoped names with `@/` TypeScript path aliases:

- CLIs: `cli-alpha`, `cli-beta`, `cli-gamma`
- Shared packages: `shared-core`, `shared-logger`, `shared-ui`, etc.

Import using `@/` aliases:
```typescript
import { logger } from '@/shared-logger'
import { BaseCommand } from '@/shared-commands'
```

## Development

- **Performance Budget**: `<500ms` for help commands, `<200ms` for version
- **Shell Completion**: Auto-generated for bash/zsh/fish
- **Consistency**: Enforced via ESLint, Prettier, git hooks
- **Testing**: Unit + E2E tests with coverage requirements

## Documentation

See [`docs/`](./docs/) for detailed documentation:
- [Architecture Overview](./docs/architecture/overview.md)
- [Contributing Guide](./docs/contributing/getting-started.md)
- [Development Workflow](./docs/guides/development-workflow.md)

## License

MIT
