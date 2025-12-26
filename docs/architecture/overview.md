# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLI Ops Monorepo                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │cli-alpha │  │cli-beta  │  │cli-gamma │   User-Facing   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘   CLIs           │
│       │             │             │                         │
│       └─────────────┴─────────────┘                         │
│                     │                                        │
│  ┌──────────────────┴──────────────────┐                   │
│  │      Shared Packages Layer          │                   │
│  ├─────────────────────────────────────┤                   │
│  │ • shared-commands (BaseCommand)     │  Core             │
│  │ • shared-config   (ConfigManager)   │  Infrastructure   │
│  │ • shared-logger   (Logger)          │                   │
│  ├─────────────────────────────────────┤                   │
│  │ • shared-ui       (Spinners, etc.)  │  User             │
│  │ • shared-prompts  (Confirmations)   │  Experience       │
│  │ • shared-formatter (Output)         │                   │
│  ├─────────────────────────────────────┤                   │
│  │ • shared-history  (Undo system)     │  Advanced         │
│  │ • shared-ipc      (Cross-CLI comm)  │  Features         │
│  ├─────────────────────────────────────┤                   │
│  │ • shared-types    (TypeScript)      │  Development      │
│  │ • shared-testing  (Test utilities)  │  Support          │
│  │ • shared-exit-codes (Error codes)   │                   │
│  └─────────────────────────────────────┘                   │
│                                                              │
│  ┌─────────────────────────────────────┐                   │
│  │      Build & Development Tools      │                   │
│  ├─────────────────────────────────────┤                   │
│  │ • Turborepo  (Build orchestration)  │                   │
│  │ • Changesets (Versioning)           │                   │
│  │ • TypeScript (Type checking)        │                   │
│  │ • Vitest     (Testing)              │                   │
│  │ • ESLint     (Linting)              │                   │
│  │ • Prettier   (Formatting)           │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## High-Level Overview

The CLI Ops monorepo is a **multi-CLI system** built with a **shared package architecture**. It demonstrates best practices for building scalable, maintainable command-line tools with TypeScript.

### Key Concepts

**Monorepo Structure:**
- 3 independent CLIs (`cli-alpha`, `cli-beta`, `cli-gamma`)
- 14 shared packages providing reusable functionality
- Managed with pnpm workspaces + Turborepo

**Layered Architecture:**
1. **User-Facing CLIs**: Independent applications, each with their own commands
2. **Shared Packages**: Reusable libraries providing common functionality
3. **Build Tools**: Development infrastructure for building, testing, releasing

**Design Philosophy:**
- **DRY (Don't Repeat Yourself)**: Common logic extracted to shared packages
- **Separation of Concerns**: Clear boundaries between packages
- **Type Safety**: Full TypeScript coverage with strict mode
- **Testability**: All packages designed for easy testing
- **ADHD/OCD-Friendly UX**: Inclusive design patterns throughout

## Package Categories

### Core Infrastructure
These packages form the foundation that all CLIs build upon:

- **shared-commands**: `BaseCommand` class with lifecycle hooks
- **shared-config**: Configuration management with validation
- **shared-logger**: Structured logging with multiple transports

### User Experience
These packages handle all user-facing interactions:

- **shared-ui**: Spinners, progress bars, color-coded output
- **shared-prompts**: Interactive confirmations and selections
- **shared-formatter**: Structured output (tables, JSON, YAML)

### Advanced Features
These packages provide sophisticated CLI capabilities:

- **shared-history**: Command tracking with undo/redo
- **shared-ipc**: Inter-process communication between CLIs
- **shared-hooks**: Lifecycle hooks for extensibility
- **shared-services**: Business logic and data management

### Development Support
These packages aid in development and quality assurance:

- **shared-types**: Common TypeScript types and interfaces
- **shared-testing**: Test utilities and fixtures
- **shared-exit-codes**: Standardized error codes
- **shared-core**: Utility functions and helpers

## Data Flow

### Typical Command Execution Flow

```
1. User runs command
   $ cli-alpha tasks add "Buy groceries"

2. CLI parses arguments
   ├─ oclif parses command and flags
   └─ Routes to TasksAddCommand

3. BaseCommand lifecycle
   ├─ preRun() - Load config, initialize logger
   ├─ run() - Execute command logic
   │  ├─ Validate inputs
   │  ├─ Call shared services
   │  ├─ Update storage (SQLite, files, etc.)
   │  └─ Display output with shared-ui
   └─ postRun() - Record in history, cleanup

4. History tracking (if applicable)
   ├─ Record command in shared-history
   └─ Store undo metadata

5. Exit with status code
   └─ Use shared-exit-codes for consistent error handling
```

## Key Architectural Decisions

The architecture is shaped by several key decisions documented in ADRs:

1. **[Turborepo for Builds](../adr/001-turborepo-for-monorepo-builds.md)**: Fast, cached builds across packages
2. **[Changesets for Versioning](../adr/002-changesets-for-versioning.md)**: Independent package versions
3. **[Unified Configuration](../adr/003-unified-configuration-management.md)**: Consistent config across CLIs
4. **[Structured Logging](../adr/004-structured-logging-architecture.md)**: Queryable, level-based logs
5. **[ADHD/OCD UX Patterns](../adr/005-adhd-ocd-friendly-ux-patterns.md)**: Inclusive design
6. **[Performance Budgets](../adr/006-performance-budgets-and-monitoring.md)**: Fast, responsive CLIs
7. **[Command History](../adr/007-command-history-and-undo-system.md)**: Undo mistakes safely
8. **[Cross-CLI Communication](../adr/008-cross-cli-communication.md)**: IPC for coordination

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Language** | TypeScript 5.x with strict mode |
| **Package Manager** | pnpm with workspaces |
| **Build Tool** | Turborepo for orchestration |
| **CLI Framework** | oclif (optional, can use custom) |
| **Testing** | Vitest with coverage |
| **Linting** | ESLint with custom config |
| **Formatting** | Prettier with custom config |
| **Version Management** | Changesets for independent versioning |
| **Storage** | SQLite for history, JSON for config |

## Directory Structure

```
cli-ops/
├── apps/                     # User-facing CLIs
│   ├── cli-alpha/
│   ├── cli-beta/
│   └── cli-gamma/
├── packages/                 # Shared packages
│   ├── shared-commands/      # Base command infrastructure
│   ├── shared-config/        # Configuration management
│   ├── shared-logger/        # Logging system
│   └── ... (11 more packages)
├── tooling/                  # Development tooling
│   ├── eslint-config/
│   ├── prettier-config/
│   └── tsconfig-base/
├── docs/                     # Documentation
│   ├── adr/                  # Architecture Decision Records
│   ├── architecture/         # Architecture docs (this folder)
│   └── contributing/         # Contributor guides
└── scripts/                  # Build and utility scripts
```

See [monorepo-structure.md](./monorepo-structure.md) for detailed directory explanations.

## Extension Points

The architecture is designed for extensibility:

### For CLI Developers
- Extend `BaseCommand` to create new commands
- Use shared packages for common functionality
- Implement command-specific undo logic
- Add custom hooks for lifecycle events

### For Package Developers
- Create new shared packages following conventions
- Export TypeScript types for consumers
- Provide test utilities in `__tests__` directories
- Document APIs in README files

### For Plugin Authors (Future)
- Plugin system planned (not yet implemented)
- Will support loading external commands
- Hook-based extension mechanism via `shared-hooks`

## Performance Characteristics

Target performance metrics:

| Operation | Target | Notes |
|-----------|--------|-------|
| CLI startup | <300ms | Module loading time |
| `--help` | <500ms | Most common command |
| `--version` | <200ms | Trivial operation |
| Simple commands | <1000ms | List, show, etc. |
| Complex commands | <2000ms | Add, delete, etc. |

See [performance.md](./performance.md) for optimization strategies.

## Security Considerations

- **Input validation**: All user inputs validated before use
- **File permissions**: Config/history files are user-readable only (0600)
- **No credentials in history**: Sensitive data not stored
- **Safe defaults**: Confirmations required for destructive operations

## Scalability

The architecture scales in multiple dimensions:

- **Horizontal**: Add more CLIs without affecting existing ones
- **Vertical**: Add more packages within the monorepo
- **Functional**: Extend commands with hooks and plugins
- **Team**: Multiple developers can work independently on different packages

## References

- [Monorepo Structure](./monorepo-structure.md) - Detailed directory layout
- [Dependency Graph](./dependency-graph.md) - Package relationships
- [Configuration](./configuration.md) - Config system details
- [Logging](./logging.md) - Logging architecture
- [UX Patterns](./ux-patterns.md) - Design guidelines
- [Performance](./performance.md) - Optimization strategies
- [Cross-CLI Communication](./cross-cli-communication.md) - IPC patterns

<!-- TODO: Add actual performance benchmarks from production -->
<!-- TODO: Expand with plugin system design when implemented -->
<!-- TODO: Add sequence diagrams for complex flows -->
