# Helper Scripts

This directory contains utility scripts for development and automation.

## Scripts

### Inventory Management

- **generate-inventory.js** - Generate CLI inventory (markdown + JSON snapshots)
- **validate-inventory.js** - Validate inventory is current
- **update-architecture-docs.js** - Update ARCHITECTURE.md with inventory tree

### Performance

- **benchmark.ts** - Measure CLI startup performance
- **perf-report.ts** - Generate performance reports
- **perf-budget.js** - Check CLI performance budgets
- **check-perf-budget.js** - Check performance against budgets

### Validation

- **validate-command-structure.js** - Validate command file structure

### Setup

- **bootstrap.sh** - Initialize new developer environment
- **install-completions.sh** - Install shell completions (bash/zsh/fish)
- **test-setup.sh** - Setup test environment

## Usage

### Inventory Scripts

```bash
# Generate complete inventory
pnpm inventory:generate

# Validate inventory is current
pnpm inventory:validate

# Update architecture documentation
pnpm inventory:update-docs
```

See [../INVENTORY-SYSTEM.md](../INVENTORY-SYSTEM.md) for complete documentation.

### Other Scripts

Scripts are invoked via npm scripts in root package.json:

```bash
pnpm install-completions
pnpm perf
```

Or directly:

```bash
bash scripts/install-completions.sh
node scripts/generate-inventory.js
```
