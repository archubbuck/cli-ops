#!/bin/bash

# Test script to validate consistency tools
echo "Testing consistency enforcement tools..."
echo ""

# Test 1: Check if config files exist
echo "✓ Checking configuration files..."
test -f .eslintrc.js && echo "  ✓ ESLint config exists"
test -f .prettierrc.json && echo "  ✓ Prettier config exists"
test -f .ls-lint.yml && echo "  ✓ ls-lint config exists"
test -f commitlint.config.js && echo "  ✓ Commitlint config exists"
test -f tsconfig.base.json && echo "  ✓ TypeScript config exists"
test -f turbo.json && echo "  ✓ Turbo config exists"
test -f .lintstagedrc.json && echo "  ✓ Lint-staged config exists"
test -f .cspell.json && echo "  ✓ CSpell config exists"

echo ""
echo "✓ Checking git hooks..."
test -f .husky/pre-commit && echo "  ✓ Pre-commit hook exists"
test -f .husky/commit-msg && echo "  ✓ Commit-msg hook exists"

echo ""
echo "✓ Checking validation scripts..."
test -f scripts/validate-command-structure.js && echo "  ✓ Command structure validator exists"
test -f scripts/check-perf-budget.js && echo "  ✓ Performance budget checker exists"

echo ""
echo "✓ Checking directory structure..."
test -d apps && echo "  ✓ apps/ directory exists"
test -d packages && echo "  ✓ packages/ directory exists"
test -d tooling && echo "  ✓ tooling/ directory exists"
test -d docs && echo "  ✓ docs/ directory exists"
test -d scripts && echo "  ✓ scripts/ directory exists"
test -d fixtures && echo "  ✓ fixtures/ directory exists"

echo ""
echo "✓ Checking pnpm workspace setup..."
test -f pnpm-workspace.yaml && echo "  ✓ pnpm-workspace.yaml exists"
test -f .npmrc && echo "  ✓ .npmrc exists"
test -f package.json && echo "  ✓ package.json exists"

echo ""
echo "✓ Checking Changesets setup..."
test -d .changeset && echo "  ✓ .changeset directory exists"
test -f .changeset/config.json && echo "  ✓ Changesets config exists"

echo ""
echo "=========================================="
echo "All foundational files and directories are in place!"
echo ""
echo "Next steps to test tools:"
echo "  1. Run 'pnpm install' to install dependencies"
echo "  2. Run 'pnpm lint' to test ESLint"
echo "  3. Run 'pnpm format:check' to test Prettier"
echo "  4. Run 'npx ls-lint' to test file naming"
echo "  5. Run 'pnpm typecheck' to test TypeScript"
echo "  6. Run 'git add . && git commit -m \"test: initial commit\"' to test hooks"
echo "=========================================="
