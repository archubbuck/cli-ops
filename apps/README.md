# CLI Applications

This directory contains all CLI applications in the monorepo.

## Structure

Each CLI is an independent oclif application with its own:
- `bin/` - Entry points (dev.js, run.js)
- `src/commands/` - CLI commands
- `src/hooks/` - CLI-specific hooks (optional)
- `test/` - Unit and E2E tests
- `package.json` - Dependencies and oclif configuration
- `tsconfig.json` - TypeScript configuration
- `README.md` - CLI-specific documentation

## Current CLIs

- **cli-alpha** - Simple patterns demonstration (will be created)
- **cli-beta** - Plugin system demonstration (will be created)
- **cli-gamma** - Advanced patterns demonstration (will be created)

## Creating a New CLI

Use the generator:

```bash
pnpm generate:cli
```

This ensures consistent structure and integration with all shared packages.
