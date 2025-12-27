# Base Plugins

This directory contains all base plugins in the monorepo. These are the foundational plugins that provide core functionality.

## Structure

Each CLI is an independent oclif application with its own:

- `bin/` - Entry points (dev.js, run.js)
- `src/commands/` - CLI commands
- `src/hooks/` - CLI-specific hooks (optional)
- `test/` - Unit and E2E tests
- `package.json` - Dependencies and oclif configuration
- `tsconfig.json` - TypeScript configuration
- `README.md` - CLI-specific documentation

## Current Base Plugins

- **clio** - Core CLI manager and plugin system
- **cli-alpha** - Task management plugin (clio-plugin-tasks)
- **cli-beta** - HTTP API client plugin (clio-plugin-fetch)
- **cli-gamma** - Developer tools plugin (clio-plugin-repo)

## CLI Inventory

For a complete inventory of all CLIs, their commands, performance metrics, and testing status, see [../docs/CLI-INVENTORY.md](../docs/CLI-INVENTORY.md).

## Creating a New CLI

Use the generator:

```bash
pnpm generate:cli
```

This ensures consistent structure and integration with all shared packages.
