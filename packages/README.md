# Shared Packages

This directory contains all shared libraries used by CLIs.

## Package Categories

### Infrastructure
- **shared-core** - Core utilities, types, and constants
- **shared-types** - TypeScript interfaces and type definitions

### CLI Foundations
- **shared-commands** - BaseCommand class with integrated infrastructure
- **shared-hooks** - Shared oclif hooks (init, prerun, postrun)
- **shared-services** - Business logic and API clients

### User Experience
- **shared-ui** - Progress indicators, spinners, task lists (ora, listr2)
- **shared-formatter** - Output formatting (chalk, cli-table3, diff)
- **shared-prompts** - Interactive prompts with consistent patterns (inquirer)

### System
- **shared-config** - Configuration management (cosmiconfig, Zod validation)
- **shared-logger** - Debug and structured logging (debug, pino)
- **shared-exit-codes** - Standardized exit codes
- **shared-history** - Command history and undo system
- **shared-ipc** - Inter-CLI communication
- **shared-testing** - Test utilities, fixtures, mocks

## Usage

All packages use unscoped names but are imported via `@/` path aliases:

```typescript
import { logger } from '@/shared-logger'
import { BaseCommand } from '@/shared-commands'
import { spinner } from '@/shared-ui'
```

## Package Structure

Each package follows this structure:
- `src/` - Source code
- `test/` - Tests
- `package.json` - Package configuration
- `tsconfig.json` - TypeScript configuration extending tooling configs
- `README.md` - Package documentation
