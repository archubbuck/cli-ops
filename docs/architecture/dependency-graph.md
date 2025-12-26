# Dependency Graph

## Package Dependency Relationships

Understanding the dependency graph is crucial for maintaining the monorepo and avoiding circular dependencies.

## Visual Dependency Graph

```
┌─────────────────── CLI Layer ────────────────────┐
│                                                   │
│   cli-alpha      cli-beta      cli-gamma         │
│       │              │              │             │
│       └──────────────┴──────────────┘             │
│                      │                            │
└──────────────────────┼────────────────────────────┘
                       │
┌──────────────────────┼──── Core Infrastructure ───┐
│                      │                            │
│              shared-commands                      │
│                      │                            │
│         ┌────────────┼────────────┐               │
│         │            │            │               │
│   shared-config  shared-logger  shared-hooks     │
│         │            │            │               │
└─────────┼────────────┼────────────┼───────────────┘
          │            │            │
┌─────────┼────────────┼────────────┼── UX Layer ───┐
│         │            │            │               │
│         │      shared-ui ──────── shared-formatter│
│         │            │                            │
│         │      shared-prompts                     │
│         │                                         │
└─────────┼─────────────────────────────────────────┘
          │
┌─────────┼──────────── Advanced Features ─────────┐
│         │                                         │
│   shared-history                                 │
│         │                                         │
│   shared-ipc                                     │
│         │                                         │
│   shared-services                                │
│                                                   │
└─────────┼─────────────────────────────────────────┘
          │
┌─────────┼──────────── Foundation ────────────────┐
│         │                                         │
│   shared-core  ◄──────────── (used by most)      │
│         │                                         │
│   shared-types ◄──────────── (used by all)       │
│         │                                         │
│   shared-exit-codes                              │
│                                                   │
│   shared-testing (dev only)                      │
│                                                   │
└───────────────────────────────────────────────────┘
```

## Dependency Matrix

| Package | Depends On | Depended By |
|---------|-----------|-------------|
| **cli-alpha** | All shared-* packages | (none - top level) |
| **cli-beta** | All shared-* packages | (none - top level) |
| **cli-gamma** | All shared-* packages | (none - top level) |
| **shared-commands** | shared-config, shared-logger, shared-hooks, shared-types | All CLIs |
| **shared-config** | shared-core, shared-types | shared-commands, all CLIs |
| **shared-logger** | shared-core, shared-types | shared-commands, shared-ui, all CLIs |
| **shared-ui** | shared-logger, shared-formatter, shared-types | All CLIs |
| **shared-prompts** | shared-types | All CLIs |
| **shared-formatter** | shared-types | shared-ui, all CLIs |
| **shared-history** | shared-core, shared-types | All CLIs |
| **shared-ipc** | shared-core, shared-types | All CLIs |
| **shared-hooks** | shared-types | shared-commands |
| **shared-services** | shared-core, shared-types | All CLIs |
| **shared-types** | (none - foundation) | All packages |
| **shared-core** | shared-types | Most packages |
| **shared-exit-codes** | (none - foundation) | All CLIs |
| **shared-testing** | shared-types | (dev only) All packages |

## Dependency Layers

The architecture enforces a **layered dependency structure** to prevent circular dependencies:

### Layer 1: Foundation (No Dependencies)
- `shared-types`: TypeScript interfaces and types
- `shared-exit-codes`: Error code constants

### Layer 2: Core Utilities
- `shared-core`: Common utilities, depends on `shared-types`
- `shared-testing`: Test helpers, depends on `shared-types` (dev dependency only)

### Layer 3: Infrastructure
- `shared-config`: Depends on `shared-core`, `shared-types`
- `shared-logger`: Depends on `shared-core`, `shared-types`
- `shared-hooks`: Depends on `shared-types`

### Layer 4: Command Infrastructure
- `shared-commands`: Depends on Layer 1-3 packages
  - This is the base for all commands

### Layer 5: User Experience
- `shared-ui`: Depends on `shared-logger`, `shared-formatter`, `shared-types`
- `shared-prompts`: Depends on `shared-types`
- `shared-formatter`: Depends on `shared-types`

### Layer 6: Advanced Features
- `shared-history`: Depends on `shared-core`, `shared-types`
- `shared-ipc`: Depends on `shared-core`, `shared-types`
- `shared-services`: Depends on `shared-core`, `shared-types`

### Layer 7: Applications
- `cli-alpha`, `cli-beta`, `cli-gamma`: Depend on all shared packages they need

## Circular Dependency Prevention

**Rules enforced:**
1. **Lower layers cannot depend on higher layers**
2. **Same-layer packages should avoid depending on each other** (if needed, extract to lower layer)
3. **Applications never depend on each other**

**Example violation:**
```typescript
// ❌ BAD: shared-types depending on shared-logger
// shared-types is Layer 1, shared-logger is Layer 3
import { Logger } from '@cli-ops/shared-logger' 

// ✓ GOOD: shared-logger depending on shared-types
import { LogLevel } from '@cli-ops/shared-types'
```

## Package.json Dependencies

### CLI Package Dependencies

Example from `apps/cli-alpha/package.json`:

```json
{
  "dependencies": {
    "@cli-ops/shared-commands": "workspace:*",
    "@cli-ops/shared-config": "workspace:*",
    "@cli-ops/shared-logger": "workspace:*",
    "@cli-ops/shared-ui": "workspace:*",
    "@cli-ops/shared-prompts": "workspace:*",
    "@cli-ops/shared-formatter": "workspace:*",
    "@cli-ops/shared-history": "workspace:*",
    "@cli-ops/shared-ipc": "workspace:*",
    "@cli-ops/shared-exit-codes": "workspace:*",
    "@cli-ops/shared-types": "workspace:*"
  },
  "devDependencies": {
    "@cli-ops/shared-testing": "workspace:*",
    "@cli-ops/tsconfig-base": "workspace:*"
  }
}
```

**Note:** `workspace:*` tells pnpm to link to the local workspace version.

### Shared Package Dependencies

Example from `packages/shared-commands/package.json`:

```json
{
  "dependencies": {
    "@cli-ops/shared-config": "workspace:*",
    "@cli-ops/shared-logger": "workspace:*",
    "@cli-ops/shared-hooks": "workspace:*",
    "@cli-ops/shared-types": "workspace:*"
  },
  "devDependencies": {
    "@cli-ops/shared-testing": "workspace:*"
  }
}
```

## External Dependencies

Each package may have external dependencies:

### Common External Dependencies

| Package | External Dependencies | Purpose |
|---------|----------------------|---------|
| **shared-config** | `zod`, `fs-extra` | Schema validation, file I/O |
| **shared-logger** | `chalk`, `winston` (optional) | Color output, logging |
| **shared-ui** | `chalk`, `ora`, `cli-progress` | Colors, spinners, progress bars |
| **shared-prompts** | `inquirer` or `prompts` | Interactive prompts |
| **shared-formatter** | `cli-table3`, `js-yaml` | Tables, YAML output |
| **shared-history** | `better-sqlite3` | SQLite database |
| **shared-ipc** | `lockfile` | Cross-platform file locking |
| **All packages** | `typescript`, `@types/node` | TypeScript support |

## Build Order

Turborepo automatically determines build order based on dependencies:

```
1. Foundation packages (no dependencies)
   - shared-types
   - shared-exit-codes

2. Core utilities
   - shared-core
   - shared-testing

3. Infrastructure
   - shared-config
   - shared-logger
   - shared-hooks

4. Command infrastructure
   - shared-commands

5. UX and Advanced (parallel)
   - shared-ui
   - shared-prompts
   - shared-formatter
   - shared-history
   - shared-ipc
   - shared-services

6. Applications (parallel)
   - cli-alpha
   - cli-beta
   - cli-gamma
```

**Build time:** ~30 seconds for full build (without cache)

## Dependency Updates

### Updating Workspace Dependencies

When a shared package changes:

```bash
# Turborepo automatically rebuilds dependent packages
pnpm build

# Or target specific package
pnpm turbo build --filter=cli-alpha...
# Builds cli-alpha and all its dependencies
```

### Updating External Dependencies

```bash
# Update specific dependency across workspace
pnpm up chalk --recursive

# Update all dependencies
pnpm up --recursive --latest

# Update dependencies in specific package
pnpm --filter shared-logger up chalk
```

## Analyzing Dependencies

### Visualize Dependencies

```bash
# Generate dependency graph (requires graphviz)
pnpm exec turbo run build --graph=dependency-graph.png

# Or use pnpm's built-in
pnpm ls --depth=1 --long
```

### Check for Circular Dependencies

```bash
# Use madge to detect circular dependencies
npx madge --circular --extensions ts ./packages

# Or dpdm
npx dpdm --circular ./packages/*/src/index.ts
```

### Find Unused Dependencies

```bash
# Use depcheck
npx depcheck

# Or unimported
npx unimported
```

## Dependency Best Practices

### 1. Minimize Dependencies
Only add dependencies when necessary. Evaluate:
- Bundle size impact
- Maintenance status
- Security track record

### 2. Use Exact Versions for Tools
In `tooling/` packages, use exact versions:
```json
{
  "dependencies": {
    "eslint": "8.50.0"  // not "^8.50.0"
  }
}
```

### 3. Shared Versions
For common dependencies, use the same version across packages:
```json
// Root package.json
{
  "devDependencies": {
    "typescript": "5.2.2"
  }
}
```

### 4. Peer Dependencies
For tooling packages that extend other tools:
```json
// tooling/eslint-config/package.json
{
  "peerDependencies": {
    "eslint": "^8.0.0"
  }
}
```

## Troubleshooting

### Issue: "Cannot find module '@cli-ops/shared-logger'"

**Cause:** Package not built or workspace link broken

**Solution:**
```bash
pnpm install
pnpm build
```

### Issue: Circular dependency detected

**Cause:** Two packages depend on each other

**Solution:**
1. Extract common logic to lower-layer package
2. Use dependency injection to break cycle
3. Refactor to remove circular dependency

### Issue: Changes not reflected after edit

**Cause:** Build cache not invalidated

**Solution:**
```bash
# Clear Turborepo cache
pnpm turbo build --force

# Or delete cache
rm -rf .turbo node_modules/.cache
```

## References

- [Monorepo Structure](./monorepo-structure.md)
- [Architecture Overview](./overview.md)
- [ADR-001: Turborepo](../adr/001-turborepo-for-monorepo-builds.md)
- [pnpm Workspaces Documentation](https://pnpm.io/workspaces)

<!-- TODO: Generate actual dependency graph visualization -->
<!-- TODO: Add real bundle size analysis -->
<!-- TODO: Document process for safely adding new dependencies -->
