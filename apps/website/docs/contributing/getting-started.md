---
sidebar_position: 1
---

# Getting Started with Contributing

Welcome! This guide will help you start contributing to the Clio CLI Operations Platform.

## Prerequisites

### Required

- **Node.js** 20+ ([download](https://nodejs.org/))
- **pnpm** 9+
  ```bash
  npm install -g pnpm
  ```
- **Git** 2.30+ ([download](https://git-scm.com/))

### Recommended

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - GitLens

## Initial Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/cli-ops.git
cd cli-ops
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all dependencies for all packages and plugins.

### 3. Build All Packages

```bash
pnpm build
```

First build takes ~30s, cached builds under 5s.

### 4. Run Tests

```bash
pnpm test
```

## Development Workflow

### Making Changes

1. **Create a branch**

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**
   - Edit code in `plugins/`, `libs/`, or `website/`
   - Follow existing code style
   - Add tests for new functionality

3. **Build and test**

   ```bash
   pnpm build
   pnpm test
   ```

4. **Create changeset**

   ```bash
   pnpm changeset
   ```

   - Select packages affected
   - Choose version bump (major/minor/patch)
   - Describe changes

5. **Commit and push**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-feature
   ```

6. **Create Pull Request**
   - Open PR on GitHub
   - Fill out the template
   - Wait for review

## Project Structure

```
cli-ops/
├── plugins/             # Base plugins
│   ├── clio-plugin-tasks/       # Tasks plugin
│   │   └── src/
│   │       ├── commands/
│   │       └── extensions/      # Extensions that enhance tasks
│   │           └── clio-plugin-tasks-jira/
│   ├── clio-plugin-fetch/       # Fetch plugin
│   │   └── src/
│   │       ├── commands/
│   │       └── extensions/      # Extensions that enhance fetch
│   │           └── clio-plugin-fetch-oauth/
│   └── clio-plugin-repo/        # Repo plugin
│       └── src/
│           ├── commands/
│           └── extensions/      # Extensions that enhance repo
│               └── clio-plugin-repo-hooks/
├── libs/                # Shared libraries
│   ├── shared-commands/
│   ├── shared-logger/
│   └── ...
├── website/             # Docusaurus website
└── docs/                # Root documentation
```

## Common Tasks

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build --filter @cli-ops/shared-logger

# Build without cache
pnpm build --force
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter @cli-ops/shared-commands

# Watch mode
pnpm test --watch
```

### Linting

```bash
# Lint all packages
pnpm lint

# Fix linting errors
pnpm lint:fix

# Format code
pnpm format
```

### Type Checking

```bash
# Check types
pnpm typecheck
```

## Code Style

- **TypeScript**: All code in TypeScript with strict mode
- **ESLint**: Follow configured rules
- **Prettier**: Auto-format on save
- **Naming**:
  - Files: `kebab-case.ts`
  - Classes: `PascalCase`
  - Functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(tasks): add priority filtering
fix(fetch): handle network timeouts
docs(website): update plugin guide
```

## Creating a Plugin

See the [Plugin Development Guide](../plugins/development) for detailed instructions.

Quick start:

```bash
pnpm generate:cli
# Follow prompts
```

## Getting Help

- **GitHub Discussions**: Ask questions
- **GitHub Issues**: Report bugs or request features
- **Pull Requests**: Submit changes

## What to Contribute

### Good First Issues

Look for issues labeled `good first issue` on GitHub.

### Areas to Contribute

- **Bug Fixes**: Fix reported issues
- **Features**: Implement requested features
- **Documentation**: Improve docs and examples
- **Tests**: Add test coverage
- **Plugins**: Create new plugins
- **Performance**: Optimize existing code

## Code of Conduct

Be respectful, inclusive, and constructive. See our [Code of Conduct](https://github.com/archubbuck/cli-ops/blob/main/CODE_OF_CONDUCT.md).

## Next Steps

- [Plugin Development Guide](../plugins/development)
- [Architecture Overview](../architecture/overview)
- [View Open Issues](https://github.com/archubbuck/cli-ops/issues)
