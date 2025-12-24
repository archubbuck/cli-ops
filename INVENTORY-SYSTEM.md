# CLI Inventory System - Setup & Usage Guide

## Overview

The CLI Inventory System is an automated solution for discovering, documenting, and maintaining an up-to-date catalog of all CLI applications in this monorepo. It provides comprehensive information about commands, performance metrics, testing status, and dependencies.

## Architecture

### Components

1. **`scripts/generate-inventory.js`** - Main generator
   - Discovers CLIs by scanning `apps/` directory
   - Extracts metadata from `package.json` files
   - Traverses command directories and parses TypeScript files
   - Measures `--help` and `--version` performance
   - Counts test files
   - Generates `docs/CLI-INVENTORY.md` and versioned JSON snapshots

2. **`scripts/validate-inventory.js`** - Validator
   - Compares current CLI state with committed inventory
   - Generates hashes to detect changes
   - Exits with error code if outdated
   - Used in pre-commit hooks and CI

3. **`scripts/update-architecture-docs.js`** - Documentation updater
   - Reads inventory JSON
   - Generates ASCII dependency tree
   - Injects into `docs/ARCHITECTURE.md`
   - Maintains consistency across documentation

### Generated Artifacts

- **`docs/CLI-INVENTORY.md`** - Human-readable markdown documentation
- **`inventory/inventory-v{version}.json`** - Versioned snapshot (e.g., `inventory-v1.0.0.json`)
- **`inventory/latest.json`** - Symlink/copy to current version
- **`docs/ARCHITECTURE.md`** - Updated with CLI inventory section

## Usage

### Initial Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build all CLIs:**
   ```bash
   pnpm build
   ```

3. **Generate inventory:**
   ```bash
   pnpm inventory:generate
   ```

### Available Commands

| Command | Description |
|---------|-------------|
| `pnpm inventory:generate` | Generate inventory files (markdown + JSON) |
| `pnpm inventory:validate` | Validate inventory is up-to-date |
| `pnpm inventory:update-docs` | Update `ARCHITECTURE.md` with inventory tree |

### Automatic Updates

The inventory is automatically maintained through:

#### 1. Post-Build Hook
After running `pnpm build`, the inventory regenerates automatically:
```json
"postbuild": "pnpm inventory:generate"
```

#### 2. Pre-Commit Hook (`.husky/pre-commit`)
Before each commit:
- Validates inventory is current
- Auto-regenerates if outdated
- Stages updated files

```bash
pnpm inventory:validate || {
  pnpm inventory:generate
  git add docs/CLI-INVENTORY.md inventory/
}
```

#### 3. CI Workflow (`.github/workflows/ci.yml`)
After successful build in CI:
- Regenerates inventory from built artifacts
- Updates architecture documentation
- Uploads inventory artifacts
- Ensures committed inventory matches reality

### Integration Points

#### Turbo Pipeline

```json
{
  "inventory": {
    "dependsOn": ["build"],
    "outputs": ["inventory/**", "docs/CLI-INVENTORY.md"],
    "cache": true
  },
  "inventory:validate": {
    "dependsOn": ["build"],
    "cache": true
  }
}
```

#### Package.json Scripts

```json
{
  "inventory:generate": "node scripts/generate-inventory.js",
  "inventory:validate": "node scripts/validate-inventory.js",
  "inventory:update-docs": "node scripts/update-architecture-docs.js",
  "postbuild": "pnpm inventory:generate"
}
```

## What Gets Tracked

### Per CLI

- **Metadata:**
  - Name, version, description
  - Binary name
  - Command topics

- **Commands:**
  - Command IDs (e.g., `tasks:create`)
  - Descriptions
  - Aliases
  - File paths

- **Performance:**
  - `--help` duration vs 500ms budget
  - `--version` duration vs 200ms budget
  - Pass/fail status (✅/⚠️/❌)

- **Testing:**
  - Test file count
  - Test file paths
  - Has tests: Yes/No

- **Dependencies:**
  - Shared workspace packages
  - Package count

### Output Format

#### Markdown (`docs/CLI-INVENTORY.md`)

```markdown
## Overview

| CLI | Version | Commands | Performance | Tests | Shared Packages |
|-----|---------|----------|-------------|-------|------------------|
| alpha | 1.0.0 | 5 | ✅ 245ms / ✅ 120ms | ❌ No tests | 11 |
| beta | 1.0.0 | 2 | ✅ 290ms / ✅ 150ms | ❌ No tests | 9 |

## alpha
...detailed CLI documentation...
```

#### JSON (`inventory/*.json`)

```json
{
  "generated": "2025-12-24T...",
  "clis": [
    {
      "name": "cli-alpha",
      "metadata": {
        "name": "cli-alpha",
        "version": "1.0.0",
        "description": "...",
        "bin": "alpha",
        "topics": {...},
        "sharedPackages": [...],
        "packageCount": 11
      },
      "commands": [...],
      "performance": {...},
      "tests": {...}
    }
  ]
}
```

## Maintenance

### When Inventory Updates

The inventory regenerates automatically when:

✅ Adding or removing CLI applications  
✅ Adding, removing, or modifying commands  
✅ Changing CLI versions or descriptions  
✅ Updating package.json oclif configuration  
✅ Changing shared package dependencies  
✅ After every build via postbuild hook  

### Manual Regeneration

If you need to manually regenerate:

```bash
# Generate inventory
pnpm inventory:generate

# Validate it's current
pnpm inventory:validate

# Update architecture docs
pnpm inventory:update-docs
```

### Troubleshooting

**Problem:** `inventory:validate` fails

**Solution:**
```bash
pnpm build
pnpm inventory:generate
```

**Problem:** Performance checks fail

**Solution:** CLIs must be built first. Run `pnpm build` before generating inventory.

**Problem:** Commands not discovered

**Solution:** Ensure commands are in `apps/cli-*/src/commands/` and follow oclif structure.

## Version History

The inventory system maintains versioned snapshots:

```
inventory/
├── inventory-v1.0.0.json  # Snapshot at version 1.0.0
├── inventory-v1.1.0.json  # Snapshot at version 1.1.0
└── latest.json            # Current version
```

This allows:
- Historical tracking of CLI evolution
- Version comparison
- Rollback reference
- CI artifact archival

## Best Practices

1. **Always build before generating inventory**
   ```bash
   pnpm build && pnpm inventory:generate
   ```

2. **Commit generated files**
   - Commit `docs/CLI-INVENTORY.md`
   - Commit `inventory/*.json` files
   - Git tracks inventory as source of truth

3. **Let automation handle updates**
   - Don't manually edit `CLI-INVENTORY.md`
   - Rely on postbuild hook
   - Trust pre-commit validation

4. **Review inventory in PRs**
   - Check for expected command additions
   - Verify performance metrics
   - Confirm test coverage changes

5. **Use inventory as reference**
   - Share `docs/CLI-INVENTORY.md` with users
   - Reference in API documentation
   - Link from README files

## Future Enhancements

Potential improvements:

- [ ] Add oclif manifest validation (compare against generated manifests)
- [ ] Include command flag/argument details
- [ ] Track command usage statistics
- [ ] Generate OpenAPI-style specs
- [ ] Add command deprecation tracking
- [ ] Performance trend analysis over time
- [ ] Test coverage percentage per CLI
- [ ] Dependency graph visualization (Mermaid diagrams)
- [ ] Changelog generation from inventory diffs

## Related Documentation

- [docs/CLI-INVENTORY.md](../docs/CLI-INVENTORY.md) - Generated inventory
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture (includes inventory tree)
- [apps/README.md](../apps/README.md) - CLI applications overview
- [scripts/README.md](./README.md) - Scripts documentation
