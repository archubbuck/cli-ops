# Fixture Migrations

This directory contains migration scripts and documentation for upgrading fixtures between versions.

## Migration Strategy

Fixtures in this project support three migration strategies:

- **coerce** (default): Automatically coerce types and add optional fields with warnings
- **manual**: Require explicit migration scripts for complex transformations
- **strict**: No coercion, exact schema match required

## Directory Structure

```
migrations/
├── config/
│   └── 1.0.0-to-2.0.0.ts    # Example migration script
├── tasks/
│   └── 1.0.0-to-2.0.0.ts
└── README.md
```

## Creating Migration Scripts

Example migration script:

```typescript
import type { ConfigFixture } from '@cli-ops/shared-types'

export function migrate(data: any): ConfigFixture {
  return {
    ...data,
    version: '2.0.0',
    // Add new required fields
    newField: data.oldField || 'default-value',
  }
}

export const metadata = {
  fromVersion: '1.0.0',
  toVersion: '2.0.0',
  description: 'Add newField, remove oldField',
  breaking: true,
}
```

## When to Use Each Strategy

### Coerce (Default)

- Adding optional fields
- Making required fields optional
- Type coercion (string to number, etc.)
- Non-breaking changes

### Manual

- Removing required fields
- Renaming fields
- Complex data transformations
- Restructuring nested objects
- Breaking changes with complex logic

### Strict

- Testing exact schema compliance
- Validation of production data
- When backwards compatibility is not needed
