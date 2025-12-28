# Test Fixtures

This directory contains fixture data for E2E testing across the monorepo.

## Fixture Organization Strategy

This project uses a **hybrid fixture approach**:

1. **Root-level fixtures** (`/fixtures/`) - For cross-cutting E2E and integration tests
2. **Shared fixtures** (`libs/shared-testing/fixtures/`) - Reusable fixtures accessible via package exports
3. **Package-level fixtures** (`{package}/test/fixtures/`) - Package-specific test data

## Root Fixtures Structure

```
fixtures/
├── configs/          # Shared config examples (moved to shared-testing)
├── api-responses/    # Common HTTP responses (moved to shared-testing)
└── README.md
```

**Note**: Most fixtures have been migrated to `libs/shared-testing/fixtures/` for better reusability.

## Shared Testing Fixtures

Located in `libs/shared-testing/fixtures/`:

```
libs/shared-testing/fixtures/
├── configs/v1/                 # Configuration fixtures
│   ├── valid.json
│   ├── invalid.json
│   ├── minimal.json
│   └── .cliorc
├── api-responses/github/v1/    # GitHub API response fixtures
│   ├── issue.json
│   ├── pull-request.json
│   ├── repository.json
│   ├── error-404.json
│   └── error-500.json
├── git-repos/basic/            # Git repository fixtures
│   └── metadata.json
├── tasks/v1/                   # Task data fixtures
│   ├── empty.json
│   ├── in-progress.json
│   └── completed.json
└── migrations/                 # Migration scripts and docs
    └── README.md
```

## Usage

### Importing Shared Fixtures

```typescript
import { loadSharedFixture } from '@cli-ops/shared-testing'

// Load a shared fixture
const config = loadSharedFixture('configs/v1/valid.json')
```

### Importing Package-Specific Fixtures

```typescript
import { loadFixture } from '@cli-ops/shared-testing'
import { join } from 'path'

// Load a local fixture
const fixture = loadFixture('tasks/sample-task.json', {
  baseDir: join(__dirname, 'fixtures'),
})
```

### Using Dynamic Fixtures

```typescript
import { createFixtureManager } from '@cli-ops/shared-testing'

const fixtures = createFixtureManager()

// Create temporary fixture files
const dir = await fixtures.create({
  'config.json': JSON.stringify({ theme: 'dark' }),
  'data/tasks.json': JSON.stringify({ tasks: [] }),
})

// Cleanup automatically
await fixtures.cleanup()
```

## Fixture Validation

All fixtures are validated against Zod schemas with versioning support:

```typescript
import { validateFixture, loadAndValidateFixture } from '@cli-ops/shared-testing'
import { ConfigFixtureSchema } from '@cli-ops/shared-types'

// Validate manually
const result = validateFixture(data, ConfigFixtureSchema)

// Load and validate in one step
const config = loadAndValidateFixture('configs/v1/valid.json', ConfigFixtureSchema)
```

## Migration Strategies

Fixtures support three migration strategies:

### Coerce (Default)

- Automatically coerce types
- Add optional fields with warnings
- AI-friendly for gradual changes

```typescript
// Schema with coerce strategy (default)
const schema = z
  .object({
    version: z.literal('1.0.0'),
    name: z.string().optional(),
  })
  .describe(
    JSON.stringify({
      migrationStrategy: 'coerce',
      breakingChangePolicy: 'warn',
    }),
  )
```

### Manual

- Require explicit migration scripts
- For complex transformations
- Breaking changes with custom logic

```typescript
// Register a migration
import { registerMigration } from '@cli-ops/shared-testing'

registerMigration(
  'config',
  '1.0.0',
  '2.0.0',
  (data) => ({
    ...data,
    version: '2.0.0',
    newField: data.oldField || 'default',
  }),
  {
    description: 'Add newField, remove oldField',
    breaking: true,
  },
)
```

### Strict

- No coercion, exact schema match
- Testing exact compliance
- Production data validation

## Versioning Conventions

All fixtures must include a `version` field:

```json
{
  "version": "1.0.0",
  "name": "example",
  "theme": "dark"
}
```

Organize fixtures by version:

```
fixtures/
├── configs/v1/
│   └── valid.json
└── configs/v2/
    └── valid.json
```

## Running Validation

```bash
# Validate all fixtures
npm run validate:fixtures

# Generate fixture type definitions
npm run generate:fixture-types
```

## Guidelines

### DO

- ✅ Version all fixtures with semantic versioning
- ✅ Use realistic, production-like data
- ✅ Keep fixtures small and focused
- ✅ Document what each fixture tests
- ✅ Use shared fixtures for common scenarios
- ✅ Validate fixtures against schemas
- ✅ Include both valid and invalid examples

### DON'T

- ❌ Include sensitive or real production data
- ❌ Create large, multi-purpose fixtures
- ❌ Duplicate fixtures across packages
- ❌ Skip version fields
- ❌ Ignore validation warnings

## When to Use Each Fixture Type

| Fixture Type                                 | Use Case                 | Example                       |
| -------------------------------------------- | ------------------------ | ----------------------------- |
| **Shared** (`libs/shared-testing/fixtures/`) | Reusable across packages | Config schemas, API responses |
| **Package-local** (`{pkg}/test/fixtures/`)   | Package-specific logic   | Command-specific test data    |
| **Dynamic** (via `FixtureManager`)           | Temporary test files     | File system operations        |
| **Root** (`/fixtures/`)                      | E2E integration tests    | Multi-package scenarios       |

## Fixture Generation

When creating commands via the generator:

```bash
npm run generate
# Select "command"
# Answer: Create test/fixtures directory? Yes
```

This automatically creates a `test/fixtures/` directory for your command.

## See Also

- [Testing Strategy](../docs/contributing/testing-strategy.md)
- [TESTING.md](../TESTING.md)
- [Fixture Migrations](../libs/shared-testing/fixtures/migrations/README.md)
