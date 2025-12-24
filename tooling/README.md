# Development Tooling

This directory contains shared development configurations and tools.

## Packages

- **eslint-config** - Shared ESLint rules for consistency
- **prettier-config** - Shared Prettier configuration
- **tsconfig-base** - Base TypeScript configurations (base.json, cli.json, library.json)
- **perf-config** - Performance budgets and benchmarking config
- **generators** - Plop generators for creating new CLIs and packages

## Usage

These tooling packages are referenced by other packages via their package.json:

```json
{
  "extends": ["@/eslint-config"],
  "prettier": "@/prettier-config"
}
```

TypeScript configs are extended directly:

```json
{
  "extends": "../../tooling/tsconfig-base/cli.json"
}
```
