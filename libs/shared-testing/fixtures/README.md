# Shared Test Fixtures

This directory contains reusable test fixtures for the entire monorepo.

## Directory Structure

```
fixtures/
├── configs/v1/              # Configuration file examples
├── api-responses/github/v1/ # GitHub API response mocks
├── git-repos/basic/         # Git repository metadata
└── tasks/v1/                # Task data examples
```

## Versioning

All fixtures include a `version` field to support testing migrations and backwards compatibility:

```json
{
  "version": "1.0.0",
  ...
}
```

When making breaking changes to fixture structure, create a new version directory (e.g., `v2/`).

## Usage

Import fixtures in your tests:

```typescript
import { loadSharedFixture } from '@cli-ops/shared-testing'

// Load a shared fixture
const config = await loadSharedFixture('configs/v1/valid.json')
```

## Validation

All fixtures are validated against Zod schemas. Run validation:

```bash
pnpm validate:fixtures
```

## Adding New Fixtures

1. Create fixture file in appropriate versioned directory
2. Add `version` field
3. Reference schema using `$schema` field
4. Run validation to ensure fixture is valid
5. Regenerate TypeScript types: `pnpm generate:fixture-types`
