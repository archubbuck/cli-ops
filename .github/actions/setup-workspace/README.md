# Setup Workspace Composite Action

This composite action standardizes the setup of Node.js, pnpm, and dependency installation across all workflows in the cli-ops repository.

## Usage

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: ./.github/actions/setup-workspace
```

### With Custom Inputs

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: ./.github/actions/setup-workspace
    with:
      node-version: '20'
      frozen-lockfile: 'true'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `node-version` | Node.js version to use | No | `20` |
| `frozen-lockfile` | Use `--frozen-lockfile` flag for pnpm install | No | `true` |

## What It Does

1. **Sets up pnpm** (version 9.15.0)
2. **Sets up Node.js** with the specified version and enables pnpm caching
3. **Installs dependencies** using pnpm with optional frozen lockfile

## Benefits

- **DRY Principle**: Single source of truth for workspace setup
- **Consistency**: All workflows use identical setup steps
- **Maintainability**: Update Node/pnpm versions in one place
- **Reduced Boilerplate**: Eliminates ~15 lines per workflow job

## Workflows Using This Action

- `ci.yml` - All jobs (lint, typecheck, build, test, perf)
- `plugin-verification.yml` - Plugin verification
- `release.yml` - Package publishing

## Version History

- **v1.0** (2024-12-30): Initial creation as part of workflow simplification effort
