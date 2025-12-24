# Architecture

This document describes the architecture of the CLI workspace monorepo.

## Overview

The workspace is a **monorepo** containing multiple CLI applications that share common packages. It uses:
- **pnpm workspaces** for package management
- **Turborepo** for build orchestration
- **Changesets** for versioning
- **TypeScript** with strict mode

## Directory Structure

```
.
├── apps/                    # CLI applications
│   ├── cli-alpha/          # Task manager CLI
│   ├── cli-beta/           # API client CLI
│   └── cli-gamma/          # Dev tools CLI
├── packages/               # Shared packages
│   ├── shared-commands/    # Base command classes
│   ├── shared-config/      # Configuration management
│   ├── shared-core/        # Core utilities
│   ├── shared-exit-codes/  # Standard exit codes
│   ├── shared-formatter/   # Output formatters
│   ├── shared-history/     # Command history
│   ├── shared-hooks/       # Lifecycle hooks
│   ├── shared-ipc/         # Inter-process communication
│   ├── shared-logger/      # Logging utilities
│   ├── shared-prompts/     # Interactive prompts
│   ├── shared-services/    # Service abstractions
│   ├── shared-testing/     # Testing utilities
│   ├── shared-types/       # TypeScript types
│   └── shared-ui/          # CLI UI components
├── tooling/                # Shared tooling configs
│   ├── eslint-config/      # ESLint configuration
│   ├── prettier-config/    # Prettier configuration
│   ├── tsconfig-base/      # TypeScript configurations
│   └── perf-config/        # Performance budgets
├── docs/                   # Documentation
├── scripts/                # Build and utility scripts
└── completions/            # Shell completion scripts
```

## Architecture Layers

### Layer 1: Foundation (Tooling)
- **Purpose**: Workspace-wide consistency
- **Packages**: `tooling/*`
- **Contents**: ESLint, Prettier, TypeScript configs

### Layer 2: Types
- **Purpose**: Shared type definitions
- **Packages**: `shared-types`
- **Contents**: TypeScript types and interfaces

### Layer 3: Infrastructure
- **Purpose**: Low-level utilities
- **Packages**: 
  - `shared-exit-codes` - Standard exit codes
  - `shared-logger` - Logging
  - `shared-config` - Configuration
  - `shared-ipc` - Inter-process communication
  - `shared-history` - Command history
- **Dependencies**: Types only

### Layer 4: UI & Formatting
- **Purpose**: User interaction and output
- **Packages**:
  - `shared-ui` - Spinners, progress bars, tasks
  - `shared-formatter` - JSON, YAML, table, Markdown, CSV
  - `shared-prompts` - Interactive prompts
- **Dependencies**: Infrastructure + Types

### Layer 5: Core
- **Purpose**: Business logic abstractions
- **Packages**:
  - `shared-core` - Error classes, context
  - `shared-services` - Service patterns
  - `shared-testing` - Test utilities
- **Dependencies**: All lower layers

### Layer 6: Commands
- **Purpose**: CLI framework integration
- **Packages**: `shared-commands`, `shared-hooks`
- **Dependencies**: All lower layers + oclif
- **Contents**: Base command classes, hooks

### Layer 7: Applications
- **Purpose**: End-user CLIs
- **Packages**: `apps/*`
- **Dependencies**: All shared packages
- **Contents**: Commands, business logic

## Design Principles

### 1. Dependency Direction
Dependencies flow **upward only**:
```
Applications → Commands → Core → UI/Formatting → Infrastructure → Types → Tooling
```

### 2. Separation of Concerns
- **UI**: Visual components (spinners, tables)
- **Logic**: Business rules in apps
- **Data**: Storage and caching in services
- **Framework**: oclif integration in commands

### 3. Composition over Inheritance
- Small, focused packages
- Compose functionality via imports
- Minimal inheritance hierarchies

### 4. Type Safety
- Strict TypeScript everywhere
- Zod for runtime validation
- No `any` types

### 5. ADHD/OCD Optimization
- **Predictability**: Consistent patterns
- **Organization**: Clear structure
- **Simplicity**: Minimal complexity
- **Feedback**: Visual indicators

## Package Dependencies

### No External Dependencies
- `shared-exit-codes`
- `shared-types`

### Minimal Dependencies
- `shared-logger`: debug, pino
- `shared-ui`: ora, cli-progress, listr2, chalk
- `shared-formatter`: cli-table3, chalk
- `shared-prompts`: inquirer, zod

### Framework Integration
- `shared-commands`: @oclif/core
- `shared-hooks`: @oclif/core

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
2. **Types** (`shared-types`)
3. **Infrastructure** (logger, config, etc.)
4. **UI/Formatting** (ui, formatter, prompts)
5. **Core** (core, services, testing)
6. **Commands** (commands, hooks)
7. **Applications** (all CLIs)

## Data Flow

### Command Execution
```
User Input
  ↓
oclif Parser
  ↓
BaseCommand
  ↓
Command Logic
  ↓
Services/Storage
  ↓
Formatters
  ↓
Output
```

### Configuration Loading
```
CLI Start
  ↓
Context Creation
  ↓
Config Loader
  ↓
Validation (Zod)
  ↓
Merged Config
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

### Adding New CLI
1. Use generator: `pnpm generate:cli`
2. Add commands
3. Update workspace config
4. Add to CI/CD

### Adding New Package
1. Use generator: `pnpm generate:package`
2. Implement functionality
3. Add tests
4. Update dependencies

### Adding New Command
1. Use generator: `pnpm generate:command`
2. Extend BaseCommand
3. Add to CLI's oclif config
4. Document usage

## Future Enhancements

### Planned
- Plugin system
- API documentation generation
- Interactive tutorials
- Update notifications
- Telemetry (opt-in)

### Experimental
- WebAssembly modules
- GUI wrapper
- VS Code extension
- Browser-based CLI
