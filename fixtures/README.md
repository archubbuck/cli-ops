# Test Fixtures

This directory contains fixture data for E2E testing.

## Structure

Organize fixtures by CLI or by test type:

```
fixtures/
├── cli-alpha/
│   ├── configs/
│   └── outputs/
├── cli-beta/
│   └── api-responses/
└── shared/
    └── common-data/
```

## Usage

Import fixtures in E2E tests:

```typescript
import { readFileSync } from 'fs'
import { join } from 'path'

const fixture = readFileSync(
  join(__dirname, '../../fixtures/cli-alpha/configs/valid-config.json'),
  'utf-8'
)
```

## Guidelines

- Keep fixtures small and focused
- Use realistic data
- Document what each fixture tests
- Version control all fixtures
