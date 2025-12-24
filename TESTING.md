# Testing Consistency Tools

This document provides manual testing steps for all consistency enforcement tools.

## Prerequisites

```bash
# Install all dependencies
pnpm install

# Make scripts executable
chmod +x scripts/*.sh
chmod +x .husky/*
```

## Test 1: Verify Setup

```bash
bash scripts/test-setup.sh
```

Expected: All checks pass showing config files exist.

## Test 2: ESLint

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
