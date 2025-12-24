# Helper Scripts

This directory contains utility scripts for development and automation.

## Scripts

- **bootstrap.sh** - Initialize new developer environment
- **install-completions.sh** - Install shell completions (bash/zsh/fish)
- **benchmark.ts** - Measure CLI startup performance
- **perf-report.ts** - Generate performance reports
- **validate-command-structure.js** - Validate command file structure
- **check-perf-budget.js** - Check performance against budgets

## Usage

Scripts are invoked via npm scripts in root package.json:

```bash
pnpm install-completions
pnpm perf
```

Or directly:

```bash
bash scripts/install-completions.sh
node scripts/benchmark.ts
```
