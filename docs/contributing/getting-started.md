# Getting Started

## Overview

Welcome to the cli-ops monorepo! This guide will help you get set up and contributing quickly.

## Prerequisites

### Required

- **Node.js** 18+ ([download](https://nodejs.org/))
- **pnpm** 8+ (package manager)
  ```bash
  npm install -g pnpm
  ```
- **Git** 2.30+ ([download](https://git-scm.com/))

### Recommended

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Code Spell Checker
  - GitLens

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/archubbuck/cli-ops.git
cd cli-ops
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all dependencies for all packages and CLIs in the monorepo.

### 3. Build All Packages

```bash
pnpm build
```

Turborepo will build packages in dependency order. First build takes ~30s, cached builds <5s.

### 4. Verify Setup

Run the verification checklist:

```bash
# Run all tests
pnpm test

# Lint all code
pnpm lint

# Type check
pnpm typecheck

# Spell check
pnpm spell:check
```

All commands should complete without errors.

## Repository Structure

```
cli-ops/
├── apps/               # The three CLIs
│   ├── cli-alpha/     # Task management CLI
│   ├── cli-beta/      # Item management CLI
│   └── cli-gamma/     # Project management CLI
├── packages/          # Shared packages
│   ├── shared-commands/    # Base command abstraction
│   ├── shared-config/      # Configuration management
│   ├── shared-logger/      # Logging infrastructure
│   ├── shared-ui/          # UI components
│   └── ...                 # 10 more packages
├── tooling/           # Development tooling
│   ├── eslint-config/
│   ├── prettier-config/
│   └── tsconfig-base/
├── docs/              # Documentation
└── scripts/           # Utility scripts
```

See [Monorepo Structure](../architecture/monorepo-structure.md) for detailed explanation.

## Running CLIs in Development

### Build and Run

```bash
# Build specific CLI
pnpm --filter @cli-ops/cli-alpha build

# Run CLI
./apps/cli-alpha/bin/run.js tasks list
```

### Development Mode (with watch)

```bash
# Watch and rebuild on changes
pnpm --filter @cli-ops/cli-alpha dev
```

In another terminal:

```bash
# Run the CLI
./apps/cli-alpha/bin/run.js tasks add "Test task"
```

### Testing CLIs

```bash
# Run tests for specific CLI
pnpm --filter @cli-ops/cli-alpha test

# Run tests with coverage
pnpm --filter @cli-ops/cli-alpha test:coverage

# Run tests in watch mode
pnpm --filter @cli-ops/cli-alpha test:watch
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/my-new-feature
```

### 2. Make Changes

Edit files in your favorite editor. The workspace includes:

- **ESLint**: Auto-fixes on save
- **Prettier**: Auto-formats on save
- **TypeScript**: Real-time type checking

### 3. Create Changeset

Document your changes:

```bash
pnpm changeset
```

Follow prompts to:
1. Select affected packages
2. Choose version bump type (major/minor/patch)
3. Write description of changes

This creates a file in `.changeset/` directory.

### 4. Run Quality Checks

```bash
# Lint
pnpm lint

# Type check
pnpm typecheck

# Tests
pnpm test

# Spell check
pnpm spell:check
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

Commit message is validated by commitlint (follows Conventional Commits).

### 6. Push and Create PR

```bash
git push origin feature/my-new-feature
```

Then create Pull Request on GitHub.

## Common Tasks

### Add New Dependency

```bash
# Add to specific package
pnpm --filter @cli-ops/cli-alpha add lodash

# Add to root (dev dependency)
pnpm add -D -w vitest
```

### Create New Command

Use the generator:

```bash
cd generators
pnpm plop command
```

Follow prompts to scaffold new command.

### Run Specific Tests

```bash
# Run single test file
pnpm test packages/shared-config/test/config.test.ts

# Run tests matching pattern
pnpm test --filter "config"
```

### Debug CLI

```bash
# Run with Node debugger
node --inspect ./apps/cli-alpha/bin/run.js tasks list

# With VS Code debugger
# Add breakpoint in VS Code, then F5
```

### Clean Build Artifacts

```bash
# Clean all dist/ directories
pnpm clean

# Clean and rebuild
pnpm clean && pnpm build
```

## Troubleshooting

### "Cannot find module"

Usually means packages aren't built:

```bash
pnpm build
```

### "Type error" in IDE

Restart TypeScript server:
- VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

### Tests Failing

```bash
# Clear test cache
pnpm test --clearCache

# Run with verbose output
pnpm test --verbose
```

### Git Hooks Not Running

```bash
# Reinstall husky
pnpm husky install
```

### Slow Builds

```bash
# Clear Turborepo cache
rm -rf .turbo

# Clear node_modules and reinstall
rm -rf node_modules **/node_modules
pnpm install
```

## Getting Help

- **Documentation**: Check [docs/](../) folder
- **Issues**: See [.github/ISSUES.md](../../.github/ISSUES.md)
- **Architecture**: Read [ARCHITECTURE.md](../ARCHITECTURE.md)
- **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md)

## Next Steps

- 📖 Read [Creating a New CLI](./creating-new-cli.md)
- 🧪 Learn [Testing Strategy](./testing-strategy.md)
- 📦 Understand [Changesets Workflow](./changesets-workflow.md)
- ♿ Review [ADHD/OCD Guidelines](./adhd-ocd-guidelines.md)

## ADHD/OCD-Friendly Tips

### Reduce Context Switching

- Keep one terminal for running CLI
- Keep another for running tests
- Use VS Code integrated terminal for git commands

### Chunking Work

Break large tasks into small commits:

```bash
# Good: Small, focused commits
git commit -m "feat: add task list command"
git commit -m "test: add tests for task list"
git commit -m "docs: document task list command"

# Avoid: Large, unfocused commits
git commit -m "add everything"
```

### Visual Feedback

Watch mode provides instant feedback:

```bash
# Tests re-run on save
pnpm test:watch

# Builds re-run on save  
pnpm dev
```

### Undo Support

Made a mistake? Easy to undo:

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git restore .

# Clean working directory
git clean -fd
```

<!-- TODO: Expand with video walkthrough and troubleshooting FAQ -->
<!-- TODO: Add development environment setup for Windows users -->
<!-- TODO: Document Docker-based development environment -->
