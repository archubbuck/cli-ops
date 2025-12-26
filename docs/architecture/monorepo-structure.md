# Monorepo Structure

## Directory Organization Patterns

The CLI Ops monorepo follows a **well-defined directory structure** that separates concerns and enables scalability.

## Root Structure

```
cli-ops/
├── apps/                      # User-facing applications
├── packages/                  # Shared libraries
├── tooling/                   # Development tooling
├── docs/                      # Documentation
├── scripts/                   # Build and utility scripts
├── completions/               # Shell completion scripts
├── fixtures/                  # Test fixtures
├── generators/                # Code generators (Plop.js)
├── .changeset/                # Changesets for versioning
├── .github/                   # GitHub-specific files
├── .husky/                    # Git hooks
├── node_modules/              # Dependencies (gitignored)
├── turbo.json                 # Turborepo configuration
├── pnpm-workspace.yaml        # pnpm workspaces config
├── package.json               # Root workspace config
└── tsconfig.json              # Root TypeScript config
```

## Apps Directory

User-facing CLI applications live in `apps/`:

```
apps/
├── README.md                  # Overview of all CLIs
├── cli-alpha/                 # First CLI application
│   ├── bin/                   # Executable entry points
│   │   ├── dev.js             # Development entry point
│   │   └── run.js             # Production entry point
│   ├── src/                   # Source code
│   │   ├── commands/          # Command implementations
│   │   │   ├── hello.ts
│   │   │   └── tasks/         # Command group
│   │   │       ├── add.ts
│   │   │       ├── list.ts
│   │   │       └── remove.ts
│   │   ├── services/          # Business logic
│   │   ├── storage.ts         # Data persistence
│   │   └── index.ts           # CLI entry point
│   ├── test/                  # Tests for this CLI
│   ├── package.json           # CLI dependencies
│   ├── tsconfig.json          # CLI-specific TS config
│   └── README.md              # CLI documentation
├── cli-beta/                  # Second CLI (similar structure)
└── cli-gamma/                 # Third CLI (similar structure)
```

### CLI Structure Conventions

Each CLI follows consistent patterns:

- **`bin/`**: Executable scripts that launch the CLI
  - `dev.js`: Used during development (no build step)
  - `run.js`: Used in production (requires build)
  
- **`src/commands/`**: All commands for this CLI
  - Nested directories for command groups
  - Each command extends `BaseCommand` from `shared-commands`
  
- **`src/services/`**: Business logic separate from commands
  - Testable in isolation
  - Can be shared between commands
  
- **`test/`**: Tests specific to this CLI
  - Unit tests for services
  - Integration tests for commands
  - E2E tests for CLI workflows

## Packages Directory

Shared packages provide reusable functionality:

```
packages/
├── README.md                         # Overview of all packages
├── shared-commands/                  # Core command infrastructure
│   ├── src/
│   │   ├── base-command.ts           # BaseCommand class
│   │   ├── command-runner.ts         # Command execution logic
│   │   └── index.ts                  # Public exports
│   ├── test/                         # Package tests
│   ├── package.json                  # Package config
│   ├── tsconfig.json                 # TS config extending base
│   └── README.md                     # Package documentation
├── shared-config/                    # Configuration management
├── shared-logger/                    # Logging system
├── shared-ui/                        # UI components
├── shared-prompts/                   # Interactive prompts
├── shared-formatter/                 # Output formatting
├── shared-history/                   # Command history & undo
├── shared-ipc/                       # Inter-process communication
├── shared-hooks/                     # Lifecycle hooks
├── shared-services/                  # Shared business logic
├── shared-types/                     # TypeScript types
├── shared-testing/                   # Test utilities
├── shared-exit-codes/                # Error codes
└── shared-core/                      # Core utilities
```

### Package Structure Conventions

All packages follow a consistent layout:

```
packages/shared-example/
├── src/                      # Source code
│   ├── index.ts              # Public API exports
│   ├── types.ts              # TypeScript type definitions
│   └── ... (implementation files)
├── test/                     # Tests
│   └── example.test.ts
├── package.json              # Package metadata
│   ├── name: "@cli-ops/shared-example"
│   ├── exports: "./dist/index.js"
│   └── dependencies: { ... }
├── tsconfig.json             # TypeScript config
│   └── extends: "@cli-ops/tsconfig-base/library.json"
└── README.md                 # Package documentation
    ├── Installation
    ├── Usage
    ├── API Reference
    └── Examples
```

## Tooling Directory

Development tooling for code quality and consistency:

```
tooling/
├── README.md                 # Overview of tooling packages
├── eslint-config/            # Shared ESLint configuration
│   ├── index.js              # ESLint rules
│   ├── package.json
│   └── README.md
├── prettier-config/          # Shared Prettier configuration
│   ├── index.js              # Prettier rules
│   ├── package.json
│   └── README.md
├── tsconfig-base/            # Shared TypeScript configurations
│   ├── base.json             # Base TS config
│   ├── cli.json              # CLI-specific config
│   ├── library.json          # Library-specific config
│   ├── package.json
│   └── README.md
└── perf-config/              # Performance budget configuration
    ├── index.js              # Performance budgets
    ├── package.json
    └── README.md
```

## Documentation Directory

Project documentation organized by type:

```
docs/
├── README.md                 # Documentation index
├── ARCHITECTURE.md           # Main architecture document
├── CONTRIBUTING.md           # Contributor guide
├── architecture/             # Detailed architecture docs
│   ├── overview.md
│   ├── monorepo-structure.md (this file)
│   ├── dependency-graph.md
│   ├── configuration.md
│   ├── logging.md
│   ├── ux-patterns.md
│   ├── performance.md
│   └── cross-cli-communication.md
├── adr/                      # Architecture Decision Records
│   ├── 001-turborepo-for-monorepo-builds.md
│   ├── 002-changesets-for-versioning.md
│   └── ... (8 ADRs total)
└── contributing/             # Contributor guides
    ├── getting-started.md
    ├── creating-new-cli.md
    ├── changesets-workflow.md
    ├── testing-strategy.md
    └── adhd-ocd-guidelines.md
```

## Scripts Directory

Utility scripts for development and CI/CD:

```
scripts/
├── README.md                        # Scripts overview
├── check-perf-budget.js             # Performance budget checker
├── generate-inventory.js            # Generate CLI inventory
├── install-completions.sh           # Install shell completions
├── perf-budget.js                   # Performance testing
├── test-setup.sh                    # Test environment setup
├── update-architecture-docs.js      # Auto-update docs
├── validate-command-structure.js    # Command structure validation
└── validate-inventory.js            # Inventory validation
```

## Other Directories

### Completions

Shell completion scripts for bash, zsh, and fish:

```
completions/
├── _alpha                   # Zsh completion for cli-alpha
├── _beta                    # Zsh completion for cli-beta
├── _gamma                   # Zsh completion for cli-gamma
├── alpha.bash               # Bash completion for cli-alpha
├── alpha.fish               # Fish completion for cli-alpha
├── beta.bash
├── beta.fish
├── gamma.bash
└── gamma.fish
```

### Fixtures

Test fixtures used across packages:

```
fixtures/
├── README.md                # Fixtures overview
├── configs/                 # Sample config files
├── commands/                # Sample command outputs
└── data/                    # Sample data files
```

### Generators

Code generators using Plop.js:

```
generators/
├── package.json             # Generator dependencies
└── plopfile.js              # Generator definitions
    ├── new-cli              # Generate new CLI
    ├── new-package          # Generate new package
    └── new-command          # Generate new command
```

## Naming Conventions

### Package Names
- **Apps**: `cli-{name}` (e.g., `cli-alpha`)
- **Shared packages**: `shared-{purpose}` (e.g., `shared-logger`)
- **Tooling**: `{tool}-config` (e.g., `eslint-config`)

### NPM Scope
All packages published to npm use the `@cli-ops` scope:
- `@cli-ops/cli-alpha`
- `@cli-ops/shared-logger`
- `@cli-ops/eslint-config`

### File Names
- **TypeScript files**: `kebab-case.ts` (e.g., `base-command.ts`)
- **Test files**: `*.test.ts` or `*.spec.ts`
- **Config files**: `lowercase.json` or `.rc` format

### Directory Names
- **Lowercase with hyphens**: `shared-commands`, `cli-alpha`
- **Plural for collections**: `commands/`, `services/`, `packages/`
- **Singular for types**: `src/`, `test/`, `docs/`

## Build Outputs

Build artifacts are generated but gitignored:

```
apps/cli-alpha/
├── dist/                    # Compiled JavaScript (gitignored)
│   ├── commands/
│   │   └── hello.js
│   └── index.js
└── oclif.manifest.json      # Generated oclif manifest (gitignored)

packages/shared-commands/
└── dist/                    # Compiled JavaScript (gitignored)
    ├── base-command.js
    └── index.js
```

## Workspace Configuration

### pnpm Workspace

`pnpm-workspace.yaml` defines workspace packages:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tooling/*'
  - 'generators'
```

### Turborepo Configuration

`turbo.json` defines build pipelines:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

## Path Aliases

TypeScript path aliases simplify imports:

```typescript
// Instead of:
import { Logger } from '../../../packages/shared-logger/src/logger'

// Use:
import { Logger } from '@cli-ops/shared-logger'
```

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@cli-ops/*": ["./packages/*/src"]
    }
  }
}
```

## References

- [Architecture Overview](./overview.md)
- [Dependency Graph](./dependency-graph.md)
- [ADR-001: Turborepo](../adr/001-turborepo-for-monorepo-builds.md)
- [ADR-002: Changesets](../adr/002-changesets-for-versioning.md)

<!-- TODO: Add visualization of directory tree with file counts -->
<!-- TODO: Document naming exceptions and special cases -->
<!-- TODO: Expand with workspace dependency resolution details -->
