# Performance Configuration

Performance budgets and benchmarking standards for the workspace.

## CLI Startup Budgets

Critical for ADHD/OCD workflow - fast feedback loops maintain focus.

| Command | Budget | Rationale |
|---------|--------|-----------|
| `--help` | <500ms | Help must be instant |
| `--version` | <200ms | Version check is simplest operation |
| Regular commands | <1000ms | Startup + parsing before actual work |

## Why These Budgets?

**ADHD Considerations:**
- Delays >500ms break flow state
- Fast responses reduce frustration
- Immediate feedback maintains engagement

**OCD Considerations:**
- Predictable performance reduces anxiety
- Consistent timing builds trust
- No "is it frozen?" worries

## Bundle Size Budgets

| Type | Budget | Reason |
|------|--------|--------|
| CLI total | <5MB | Reasonable install size |
| Individual package | <1MB | Keep packages focused |

## Memory Budgets

| State | Budget | Reason |
|-------|--------|--------|
| Idle | <50MB | Minimal footprint |
| Peak | <200MB | Reasonable for CLI |

## Optimization Strategies

### To Meet Help Budget (<500ms)
1. Lazy load commands
2. Minimize dependencies in main entry
3. Defer heavy imports until command execution
4. Use oclif's built-in lazy loading

### To Meet Version Budget (<200ms)
1. Keep version in package.json
2. No imports needed
3. Direct file read only

### To Reduce Bundle Size
1. Use tree-shaking friendly imports
2. Mark large dependencies as external
3. Use dynamic imports for optional features
4. Audit with `npx bundle-phobia <package>`

## Monitoring

Run performance checks:
```bash
pnpm perf
node scripts/check-perf-budget.js
```

In CI, performance regression tests automatically fail builds that exceed budgets.

## Current Status

✅ Budgets established
⏳ Implementation pending (CLIs not yet built)
📊 Monitoring ready (scripts in place)
