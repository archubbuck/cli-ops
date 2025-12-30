---
sidebar_position: 1
sidebar_label: Contributing Overview
title: Contributing to CLI Ops
description: Guidelines and workflows for contributing to the CLI Ops project
---

# Contributing

Thank you for your interest in contributing to CLI Ops! This document provides guidelines for contributing to the plugin-first monorepo.

## Project Overview

CLI Ops provides a unified CLI (`clio`) that manages plugins for different workflows:

- **Core CLI**: `@cli-ops/clio` - Plugin manager with foundational commands
- **Bundled Plugin**: `@cli-ops/clio-plugin-tasks` - Task management (ships with clio)
- **Installable Plugins**: `@cli-ops/clio-plugin-fetch`, `@cli-ops/clio-plugin-repo`
- **Shared Packages**: `@cli-ops/shared-*` - Common utilities
- **Meta-Packages**: `@cli-ops/clio-meta-*` - Persona-based bundles

## Project Tracking

This project uses **internal issue tracking** via [.github/ISSUES.md](../.github/ISSUES.md) rather than GitHub Issues. This approach provides:

- Detailed task breakdowns with dependencies
- Milestone organization (Foundation, Infrastructure, Core, CLIs, Tooling, Documentation)
- ADHD/OCD-friendly progress tracking without external tooling overhead

### For Contributors

**Referencing Issues:**

- When committing, reference issues using the format: `Issue #1`, `Issue #17`, etc.
- Example: `git commit -m "feat(clio-plugin-tasks): add task storage (Issue #17)"`
- The `Issue #N` format matches our [commitlint.config.js](../commitlint.config.js) validation

**Finding Work:**

- Review [.github/ISSUES.md](../.github/ISSUES.md) for detailed task descriptions
- Check [.github/COMPLETION-CHECKLIST.md](../.github/COMPLETION-CHECKLIST.md) for current status
- Look for issues marked `priority: high` or `good-first-issue` labels in the markdown

**Tracking Progress:**

- Update issue status in [ISSUES.md](../.github/ISSUES.md) when completing tasks
- Update [COMPLETION-CHECKLIST.md](../.github/COMPLETION-CHECKLIST.md) with evidence of completion

**Why No GitHub Issues?**

- Reduces context switching for contributors
- Keeps all project context in the repository
- Eliminates duplication between issue tracker and implementation tracking
- Better for focused, deep work sessions

---

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Git
- npm account for `@cli-ops` organization (for publishing)

### Why pnpm?

⚠️ **Important: Use pnpm, NOT npm!**

This workspace uses pnpm for several reasons:

- **Workspace protocol** (`workspace:*`) for internal dependencies
- **pnpm workspaces** for monorepo management
- **Efficient disk space** usage with content-addressable storage
- **Strict dependency management** to prevent phantom dependencies

**If you accidentally ran `npm install`:**

```bash
# Remove npm artifacts
rm -rf node_modules package-lock.json
rm -rf plugins/*/node_modules
rm -rf libs/*/node_modules
rm -rf tooling/*/node_modules

# Install with pnpm
pnpm install
```

### Setup

```bash
# Clone repository
git clone <repo-url>
cd cli-ops

# Install dependencies
pnpm install

# Build packages
pnpm build

# Run tests
pnpm test

# Try clio in dev mode
pnpm dev:clio
pnpm dev:tasks
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/my-fix
```

### 2. Make Changes

- Write code
- Add tests
- Update documentation
- Follow code style

### 3. Validate

```bash
# Lint
pnpm lint

# Type check
pnpm typecheck

# Test
pnpm test

# Performance
pnpm perf
```

### 4. Commit

```bash
# Stage changes
git add .

# Commit (husky will validate)
git commit -m "feat: add new feature"
```

### 5. Push and PR

```bash
git push origin feature/my-feature
```

Then create a pull request on GitHub.

## Code Style

### TypeScript

- Use strict mode
- No `any` types
- Prefer interfaces over types
- Document public APIs

### Naming Conventions

- **Files**: kebab-case (`my-file.ts`)
- **Classes**: PascalCase (`MyClass`)
- **Functions**: camelCase (`myFunction`)
- **Constants**: UPPER_SNAKE_CASE (`MY_CONSTANT`)
- **Interfaces**: PascalCase with 'I' prefix (`IMyInterface`)
- **Types**: PascalCase with 'T' prefix (`TMyType`)

### Code Organization

```typescript
// 1. Imports (grouped)
import { external } from 'external'
import { internal } from '@/internal'

// 2. Types/Interfaces
export interface MyInterface {}

// 3. Constants
const MY_CONSTANT = 'value'

// 4. Functions/Classes
export function myFunction() {}
export class MyClass {}

// 5. Exports (if not inline)
export { something }
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Tests
- `chore`: Maintenance

### Examples

```
feat(clio): add plugin installation command
fix(clio-plugin-tasks): resolve task deletion bug
docs(clio-plugin-fetch): update authentication guide
chore(shared-logger): upgrade pino dependency
test(clio-plugin-repo): add git status tests
```

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run specific package
pnpm --filter @cli-ops/shared-logger test
pnpm --filter @cli-ops/clio-plugin-tasks test

# Watch mode
pnpm test --watch

# Coverage
pnpm test:coverage
```

### E2E Tests

```bash
# Run e2e tests
pnpm test:e2e

# Specific plugin
pnpm --filter @cli-ops/clio-plugin-tasks test:e2e
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFunction', () => {
  it('should do something', () => {
    expect(myFunction()).toBe('result')
  })
})
```

## Adding Features

### New Plugin

See [Plugin Development Guide](./contributing/plugin-development.md) for details.

```bash
# 1. Generate plugin structure
pnpm generate:cli

# 2. Update package.json
{
  "name": "@cli-ops/clio-plugin-myfeature",
  "version": "1.0.0",
  "oclif": {
    "bin": "clio",
    "commands": "./dist/commands"
  },
  "peerDependencies": {
    "@cli-ops/clio": "^1.0.0"
  }
}

# 3. Add commands to src/commands/
# 4. Build and test
pnpm build
pnpm dev:myfeature

# 5. Publish to npm
pnpm changeset
pnpm publish
```

### New Shared Package

```bash
pnpm generate:package
```

### New Command (to existing plugin)

```bash
pnpm generate:command
```

## Package Guidelines

### Creating a Shared Package

1. Use generator or follow structure:

```
libs/shared-myfeature/
├── src/
│   ├── index.ts
│   └── ...
├── test/
│   └── index.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

2. Update package.json:

```json
{
  "name": "@cli-ops/shared-myfeature",
  "version": "1.0.0",
  "publishConfig": {
    "access": "public"
  }
}
```

3. Add to workspace path aliases:

```json
// tsconfig.base.json
{
  "paths": {
    "@/shared-myfeature": ["./libs/shared-myfeature/src"]
  }
}
```

4. Document in README:

- Purpose
- Installation
- Usage examples
- API reference

### Package Dependencies

- **Minimal**: Only add what you need
- **Workspace**: Use `workspace:*` for internal packages
- **Pinned**: Pin versions for consistency
- **Scoped**: All published packages use `@cli-ops` scope

## Documentation

### Code Comments

````typescript
/**
 * Brief description
 *
 * @param name - Parameter description
 * @returns Return value description
 * @throws Error conditions
 * @example
 * ```typescript
 * myFunction('example')
 * ```
 */
export function myFunction(name: string): string {
  // Implementation
}
````

### README Structure

1. Title and description
2. Features
3. Installation
4. Usage
5. Examples
6. API Reference
7. Contributing

### Architecture Decisions

Document significant decisions in `docs/adr/`:

```markdown
# ADR-001: Use Turborepo

## Status

Accepted

## Context

Need monorepo build tool

## Decision

Use Turborepo

## Consequences

- Fast builds
- Remote caching
- Learning curve
```

## Performance

### Best Practices

- Lazy load heavy modules
- Cache when appropriate
- Minimize startup time
- Profile before optimizing

### Performance Budgets

Run: `pnpm perf`

Current budgets:

- Help: 500ms
- Version: 200ms
- Commands: 1000ms

## Security

### Guidelines

- No secrets in code
- Validate all input
- Use Zod schemas
- Enable ESLint security rules
- Keep dependencies updated

### Reporting Issues

Email: security@example.com

## Review Process

### PR Checklist

- [ ] Tests pass
- [ ] Lint passes
- [ ] Type check passes
- [ ] Performance budgets met
- [ ] Documentation updated
- [ ] Changeset added (if needed)

### Review Guidelines

- Be respectful
- Provide constructive feedback
- Test the changes
- Check for edge cases

## Releases

The CLI Ops project uses an automated release process with Changesets and GitHub Actions. For detailed information about the release process, including handling GitHub Actions restrictions, see the [Release Process documentation](./RELEASE-PROCESS.md).

### Changesets

```bash
# Add changeset
pnpm changeset

# Select packages and version bump
# Write changelog

# Commit
git add .
git commit -m "chore: add changeset"
```

### Publishing

Automated via GitHub Actions:

1. PR merged to main
2. Changesets creates version PR (may require PAT - see [Release Process](./RELEASE-PROCESS.md))
3. Merge version PR
4. Automated publish to npm

**Important**: Due to GitHub Actions restrictions, PR creation may require a Personal Access Token. See the [Release Process documentation](./RELEASE-PROCESS.md) for:
- PAT setup instructions
- Alternative release approaches
- Security best practices
- Troubleshooting guide

## Getting Help

### Resources

- [Documentation](./README.md)
- [Architecture](./ARCHITECTURE.md)
- [Issue Tracking](../.github/ISSUES.md)
- [Completion Status](../.github/COMPLETION-CHECKLIST.md)

### Questions

- Check existing documentation first
- Review [ISSUES.md](../.github/ISSUES.md) for known work items
- For genuine questions, open a discussion or contact maintainers

## Migration Guides

### Upgrading to v3.0.0 (Extension Plugin Refactor)

**Breaking Changes**: Extension plugins moved to top-level architecture

#### For End Users

1. **Update clio and base plugins**:

   ```bash
   # Update all installed plugins
   clio plugins:update
   ```

2. **Reinstall extension plugins** (moved to top-level):

   ```bash
   # Extensions are now separate top-level packages
   clio plugins:install @cli-ops/clio-plugin-tasks-jira
   clio plugins:install @cli-ops/clio-plugin-fetch-oauth
   clio plugins:install @cli-ops/clio-plugin-repo-hooks
   ```

3. **Discover available extensions**:

   ```bash
   # List extensions for a specific plugin
   clio plugins:extensions @cli-ops/clio-plugin-tasks

   # List all extensions
   clio plugins:extensions
   ```

#### For Plugin Developers

See [ADR-010: Extension Plugin Formalization](./adr/010-extension-plugin-formalization.md#migration-guide) for detailed migration instructions.

**Key Changes**:

- Extensions moved from nested (`plugins/{parent}/src/extensions/`) to top-level (`plugins/{extension}/`)
- Use `BaseExtensionPlugin` instead of `BasePlugin`
- Call `registerExtension()` in `init()`
- Use `registerHook()` for type-safe extension points
- Add `clio.extension` metadata to package.json

**Quick Example**:

```typescript
// v3.0.0
import { BaseExtensionPlugin } from '@cli-ops/shared-plugins'

export class JiraPlugin extends BaseExtensionPlugin {
  async init() {
    await this.registerExtension('@cli-ops/clio-plugin-tasks')
    this.registerHook('task:afterCreate', this.syncToJira.bind(this))
  }
}
```

For complete details, see:

- [ADR-010](./adr/010-extension-plugin-formalization.md)
- [Changeset](../.changeset/extension-plugin-refactor-v3.md)
- [Plugin Development Guide](./contributing/plugin-development.md)

## Code of Conduct

### Our Pledge

We pledge to make participation a harassment-free experience for everyone.

### Standards

- Be welcoming
- Be respectful
- Accept constructive criticism
- Focus on what is best for the community

### Enforcement

Report violations to: conduct@example.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
