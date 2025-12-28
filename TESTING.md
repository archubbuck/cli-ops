# Testing Consistency Tools

This document provides manual testing steps for all consistency enforcement tools and fixture validation.

## Prerequisites

```bash
# Install all dependencies
pnpm install

# Make scripts executable
chmod +x scripts/*.sh
chmod +x scripts/*.js
chmod +x .husky/*
```

## Test 1: Verify Setup

```bash
bash scripts/test-setup.sh
```

Expected: All checks pass showing config files exist.

## Test 2: Fixture Validation

### Understanding Fixture Organization

The project uses a **hybrid fixture approach**:

- **Shared fixtures**: `libs/shared-testing/fixtures/` - Common configs, API responses, etc.
- **Package-local fixtures**: `{package}/test/fixtures/` - Package-specific test data
- **Root fixtures**: `/fixtures/` - Cross-package E2E tests only

All fixtures must include a `version` field and are validated against Zod schemas.

### Generate Fixture Types

```bash
pnpm generate:fixture-types
# Or: node scripts/generate-fixture-types.js
```

Expected:

- ✅ Scans `libs/shared-testing/fixtures/` recursively
- ✅ Generates `libs/shared-testing/src/fixture-types.ts`
- ✅ Shows count of fixtures found by category
- ✅ Creates TypeScript types for IDE autocomplete

Check generated types:

```bash
cat libs/shared-testing/src/fixture-types.ts | head -20
```

### Validate Fixtures

```bash
pnpm validate:fixtures
# Or: node scripts/validate-fixtures.js
```

Expected:

- ✅ Validates all JSON fixtures against schemas
- ✅ Shows validation report with pass/fail counts
- ✅ Creates `.fixture-cache/` for performance (caches by file hash)
- ✅ Creates/updates `.fixture-snapshots/` for change detection
- ✅ All fixtures pass validation
- ✅ Reports: configs, tasks, api-responses, git-repos

Validation checks:

1. **Version field** - All fixtures must have `version: "1.0.0"`
2. **Schema compliance** - Validates against Zod schemas
3. **Type coercion** - Warns on coercible type mismatches
4. **Breaking changes** - Detects structural changes via snapshots

Test invalid fixture:

```bash
# Create invalid fixture
mkdir -p libs/shared-testing/fixtures/test
echo '{"invalid": "no version"}' > libs/shared-testing/fixtures/test/invalid.json

# Run validation
node scripts/validate-fixtures.js
# Expected: ❌ Shows validation error for missing version

# Cleanup
rm -rf libs/shared-testing/fixtures/test
```

## Test 3: ESLint

The test file `test-file.ts` has several intentional violations:

```bash
npx eslint test-file.ts
```

Expected errors:

- ❌ Interface must be prefixed with `I` (naming-convention)
- ❌ Function name must be camelCase (naming-convention)
- ❌ `console.log` not allowed (no-console)
- ❌ Unused variable (no-unused-vars)
- ❌ Missing spacing (prettier via ESLint)
- ❌ Interface should use `interface` not `type` (consistent-type-definitions)

## Test 3: Prettier

```bash
npx prettier --check test-file.ts
```

Expected: File needs formatting (spacing, semicolons).

Auto-fix:

```bash
npx prettier --write test-file.ts
```

## Test 4: File Naming (ls-lint)

```bash
npx ls-lint
```

Expected: `test-file.ts` should pass (kebab-case).

Create invalid file to test:

```bash
touch test_file_invalid.ts
npx ls-lint
```

Expected: ❌ Error for underscore naming.

## Test 5: TypeScript Compilation

```bash
pnpm typecheck
```

Expected: Type checking errors in test-file.ts (unused variables, etc).

## Test 6: Spell Checking

```bash
npx cspell test-file.ts
```

Expected: Pass (no misspellings in test file).

Add typo to test:

```bash
echo "// typooo in comment" >> test-file.ts
npx cspell test-file.ts
```

Expected: ❌ "typooo" flagged.

## Test 7: Commit Message Validation

```bash
# This should fail (invalid format)
echo "test: invalid commit" | npx commitlint

# This should pass (valid conventional commit)
echo "feat: add new feature" | npx commitlint
echo "fix(api): resolve bug in endpoint" | npx commitlint
```

## Test 8: Git Hooks (Full Integration)

```bash
# Initialize husky
pnpm exec husky install

# Stage test file
git add test-file.ts

# Try to commit with invalid message
git commit -m "bad commit message"
# Expected: ❌ Blocked by commit-msg hook

# Try to commit with valid message (but file has issues)
git commit -m "test: add test file"
# Expected: ❌ Blocked by pre-commit hook (ESLint errors)

# Fix the file first
npx eslint --fix test-file.ts
npx prettier --write test-file.ts

# Commit again
git add test-file.ts
git commit -m "test: add test file"
# Expected: ✅ Should succeed
```

## Test 9: Validation Scripts

### Command Structure Validator

```bash
# Create invalid command file
mkdir -p test-commands
cat > test-commands/invalid.ts << 'EOF'
export class InvalidCommand {
  async run() {
    console.log('missing required properties')
  }
}
EOF

node scripts/validate-command-structure.js test-commands/invalid.ts
# Expected: ❌ Missing description, examples, etc.
```

### Performance Budget Checker

```bash
node scripts/check-perf-budget.js
# Expected: ⏭️ Skip (CLIs not created yet)
```

## Test 10: Turborepo

```bash
# Should work even with no packages yet
pnpm build
# Expected: No packages to build yet, but command works

pnpm test
# Expected: No packages to test yet

pnpm lint
# Expected: Runs on root only
```

## Cleanup Test Files

```bash
rm -f test-file.ts
rm -f test_file_invalid.ts
rm -rf test-commands
```

## Summary Checklist

After running all tests, you should have verified:

- [x] All config files present
- [x] Fixture type generation works
- [x] Fixture validation works
- [x] Fixture caching improves performance
- [x] Fixture snapshots detect changes
- [x] ESLint catches violations
- [x] Prettier enforces formatting
- [x] ls-lint validates file naming
- [x] TypeScript compilation works
- [x] Spell checking works
- [x] Commit messages validated
- [x] Pre-commit hooks block invalid commits
- [x] Commit-msg hooks enforce conventional commits
- [x] Custom validators work
- [x] Turborepo commands execute

All tools working correctly = Ready to proceed with package implementation! ✅

## Fixture Testing Workflow

### Creating New Fixtures

1. Add fixture file to appropriate directory:
   - Shared: `libs/shared-testing/fixtures/`
   - Package-local: `{package}/test/fixtures/`

2. Ensure fixture has `version` field:

```json
{
  "version": "1.0.0",
  "name": "example",
  "data": {}
}
```

3. Validate fixture:

```bash
node scripts/validate-fixtures.js
```

4. Regenerate types:

```bash
node scripts/generate-fixture-types.js
```

### Using Fixtures in Tests

```typescript
import { loadSharedFixture, validateFixture } from '@cli-ops/shared-testing'
import { ConfigFixtureSchema } from '@cli-ops/shared-types'

describe('my test', () => {
  it('loads fixture', () => {
    const config = loadSharedFixture('configs/v1/valid.json')
    expect(config.version).toBe('1.0.0')
  })

  it('validates fixture', () => {
    const config = loadSharedFixture('configs/v1/valid.json')
    const result = validateFixture(config, ConfigFixtureSchema)
    expect(result.valid).toBe(true)
  })
})
```
