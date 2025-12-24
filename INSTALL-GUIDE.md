# Installation Guide

## ⚠️ Important: Use pnpm, NOT npm!

This is a **pnpm workspace**. You must use `pnpm` commands, not `npm`.

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run a specific CLI in dev mode
pnpm dev:alpha
pnpm dev:beta
pnpm dev:gamma
```

## Why pnpm?

This workspace uses:
- **Workspace protocol** (`workspace:*`) for internal dependencies
- **pnpm workspaces** for monorepo management
- **Efficient disk space** usage with content-addressable storage
- **Strict dependency management** to prevent phantom dependencies

## Common Commands

```bash
# Install dependencies
pnpm install

# Build everything
pnpm build

# Build just packages
pnpm build:packages

# Build just apps
pnpm build:apps

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint code
pnpm lint
pnpm lint:fix

# Format code
pnpm format
pnpm format:check

# Clean build artifacts
pnpm clean
```

## If You Accidentally Ran `npm install`

If you ran `npm install` by mistake:

```bash
# Remove npm artifacts
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm -rf tooling/*/node_modules

# Install with pnpm
pnpm install
```

## Troubleshooting

### "Cannot find module" errors
```bash
# Rebuild everything
pnpm clean
pnpm install
pnpm build
```

### Workspace dependency issues
```bash
# Verify workspace setup
pnpm list --depth=0

# Check for circular dependencies
pnpm why <package-name>
```

### Peer dependency warnings
These are expected and safe to ignore for now. The workspace uses `strict-peer-dependencies=false` in `.npmrc`.

## Next Steps

1. ✅ Run `pnpm install`
2. ✅ Run `pnpm build` to compile TypeScript
3. ✅ Run `pnpm dev:alpha` to test a CLI
4. ✅ Read [SETUP-COMPLETE.md](./SETUP-COMPLETE.md) for more details
