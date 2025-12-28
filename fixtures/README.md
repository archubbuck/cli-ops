# Test Fixtures

This directory is for E2E and cross-package integration test fixtures **only**. Most test fixtures have been moved to package-specific locations for better organization and reusability.

## Fixture Organization Strategy

This project uses a **hybrid fixture approach** with three levels:

### 1. Shared Fixtures (libs/shared-testing/fixtures/)

**Recommended for most use cases.** Reusable fixtures accessible via `@cli-ops/shared-testing` package exports.

**Use for:**

- Common configuration examples
- Standard API responses
- Git repository structures
- Generic task data
- Fixtures needed by multiple packages

**Import:** `import { loadSharedFixture } from '@cli-ops/shared-testing'`

### 2. Package-Local Fixtures ({package}/test/fixtures/)

Package-specific test data co-located with tests.

**Use for:**

- Plugin-specific command tests
- Domain-specific data structures
- Package-unique test scenarios
- Edge cases specific to one package

**Import:** `import { loadFixture } from '@cli-ops/shared-testing'`

### 3. Root Fixtures (/fixtures/) - MINIMAL USE ONLY

Cross-cutting E2E and integration tests that span multiple packages.

**Use only for:**

- Multi-CLI integration scenarios
- Cross-package workflow tests
- Full end-to-end system tests

**Import:** Standard Node.js file imports with relative paths

## Migration Status

✅ **Completed:** Most fixtures have been migrated to `libs/shared-testing/fixtures/`  
⚠️ **Deprecated:** Root-level fixtures directory for general use  
✨ **Current:** Hybrid approach with shared + package-local fixtures

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

### Running Validation

```bash
# Validate all fixtures
pnpm validate:fixtures

# Generate fixture type definitions (for IDE autocomplete)
pnpm generate:fixture-types
```

## Fixture Versioning

All fixtures must include a `version` field for migration support:

```json
{
  "version": "1.0.0",
  "name": "example",
  "theme": "dark"
}
```

Organize fixtures by version to support testing migrations:

```
fixtures/
├── configs/v1/
│   └── valid.json
└── configs/v2/
    └── valid.json
```

## Migration Strategies

Fixtures support three migration strategies defined in schemas:

## Migration Strategies

Fixtures support three migration strategies defined in schemas:

### 1. Coerce (Default - AI-Friendly)

Automatically coerce types and add optional fields with warnings.

```typescript
const ConfigFixtureSchema = z
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

### 2. Manual (For Complex Transformations)

Require explicit migration scripts for breaking changes:

```typescript
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

### 3. Strict (Exact Validation)

No coercion, exact schema match required for production validation.

## Best Practices

### ✅ DO

- Version all fixtures with semantic versioning
- Use realistic, production-like data
- Keep fixtures small and focused
- Document what each fixture tests
- Use shared fixtures for common scenarios
- Validate fixtures against schemas
- Include both valid and invalid examples
- Co-locate package-specific fixtures with tests

### ❌ DON'T

- Include sensitive or real production data
- Create large, multi-purpose fixtures
- Duplicate fixtures across packages
- Skip version fields
- Ignore validation warnings
- Put package-specific fixtures in root directory

## When to Use Each Fixture Type

| Fixture Type                 | Use Case                               | Example                       |
| ---------------------------- | -------------------------------------- | ----------------------------- |
| **Shared** (shared-testing)  | Common data, multiple packages         | GitHub API responses, configs |
| **Package-local**            | Plugin-specific, domain data           | Task commands, fetch options  |
| **Root** (this directory)    | Cross-package E2E tests                | Multi-CLI workflows           |
| **Dynamic** (FixtureManager) | Temporary test files, runtime fixtures | Temp config, git repos        |

## Type-Safe Fixture Imports

After running `pnpm generate:fixture-types`, import fixtures with full type safety:

```typescript
// Auto-generated types provide autocomplete
import type { ConfigV1Valid } from '@cli-ops/shared-testing/fixture-types'
import { loadSharedFixture } from '@cli-ops/shared-testing'

const config: ConfigV1Valid = loadSharedFixture<ConfigV1Valid>('configs/v1/valid.json')
```

## Adding New Fixtures

### To Shared Testing (Reusable)

1. Create fixture in `libs/shared-testing/fixtures/{category}/v{version}/`
2. Add `version` field to fixture
3. Run `pnpm validate:fixtures`
4. Run `pnpm generate:fixture-types`
5. Import via `loadSharedFixture()`

### To Package (Package-Specific)

1. Create fixture in `{package}/test/fixtures/`
2. Add `version` field
3. Import via `loadFixture()` with relative path
4. Document in package's test README

### To Root (E2E Only)

1. Create fixture in `/fixtures/{category}/`
2. Add detailed documentation
3. Import via standard Node.js imports
4. Use only for cross-package integration tests

## Generator Support

When creating commands or plugins, the generator can automatically create fixture directories:

```bash
# Create command with fixtures
pnpm generate:command
# Answer "yes" to "Create test/fixtures directory?"

# Plugin template includes test/fixtures/ by default
pnpm generate:plugin
```

| -------------------------------------------- | ------------------------ | ----------------------------- |
| **Shared** (`libs/shared-testing/fixtures/`) | Reusable across packages | Config schemas, API responses |
| **Package-local** (`{pkg}/test/fixtures/`) | Package-specific logic | Command-specific test data |
| **Dynamic** (via `FixtureManager`) | Temporary test files | File system operations |
| **Root** (`/fixtures/`) | E2E integration tests | Multi-package scenarios |

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
