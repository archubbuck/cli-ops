# Performance Architecture

## Overview

Performance is a critical aspect of CLI user experience. This document outlines the performance budgets, monitoring strategies, and optimization techniques used across all CLIs.

## Performance Budgets

### Target Metrics

| Operation Type | Target | Rationale |
|---------------|--------|-----------|
| Version command | <200ms | Trivial operation, must be instant |
| Help command | <500ms | Frequently used, must feel responsive |
| List operations | <1000ms | User-facing reads, must feel fast |
| Create operations | <2000ms | Write operations, acceptable delay |
| Full build | <30s | Developer workflow, cached builds critical |
| Cached build | <5s | Incremental development, must be instant |

### Monitoring

Performance budgets are enforced via [`scripts/perf-budget.js`](../../scripts/perf-budget.js):

```javascript
module.exports = {
  budgets: {
    'version': { max: 200, unit: 'ms' },
    'help': { max: 500, unit: 'ms' },
    'list': { max: 1000, unit: 'ms' },
    'create': { max: 2000, unit: 'ms' }
  }
}
```

Checked in CI via [`scripts/check-perf-budget.js`](../../scripts/check-perf-budget.js).

## Architecture Patterns

### 1. Lazy Loading

Load heavy dependencies only when needed:

```typescript
// ✓ Good - lazy load heavy dependency
export async function analyze(data) {
  const { Analyzer } = await import('./heavy-analyzer')
  return new Analyzer().run(data)
}

// ✗ Avoid - eager load at startup
import { Analyzer } from './heavy-analyzer'
export function analyze(data) {
  return new Analyzer().run(data)
}
```

Example in [`apps/cli-gamma/src/commands/analyze.ts`](../../apps/cli-gamma/src/commands/analyze.ts):

```typescript
async run() {
  // Heavy analysis library loaded only when command runs
  const { analyze } = await import('../lib/analyzer')
  return analyze(this.args)
}
```

### 2. Caching

Cache expensive operations:

```typescript
// Configuration cache
let configCache: Config | null = null

async function getConfig(): Promise<Config> {
  if (!configCache) {
    configCache = await loadConfig()
  }
  return configCache
}
```

Cache strategies:
- **In-memory**: For process lifetime (config, metadata)
- **Filesystem**: For across-process (HTTP responses, computed data)
- **Time-based**: Expire after duration

Example cache implementation in [`packages/shared-config/src/cache.ts`](../../packages/shared-config/src/cache.ts).

### 3. Parallelization

Run independent operations concurrently:

```typescript
// ✓ Good - parallel execution
const [config, tasks, projects] = await Promise.all([
  loadConfig(),
  fetchTasks(),
  fetchProjects()
])

// ✗ Avoid - sequential execution
const config = await loadConfig()
const tasks = await fetchTasks()
const projects = await fetchProjects()
```

### 4. Streaming

Stream large datasets instead of loading into memory:

```typescript
import { createReadStream } from 'fs'
import { pipeline } from 'stream/promises'

async function processLargeFile(filePath: string) {
  await pipeline(
    createReadStream(filePath),
    transformStream(),
    outputStream()
  )
}
```

### 5. Bundle Optimization

Minimize CLI bundle size:

- Use tree-shaking (ES modules)
- Avoid bundling dev dependencies
- Externalize large dependencies
- Use dynamic imports for optional features

## Startup Time Optimization

### Minimize Initialization

```typescript
// ✓ Good - minimal startup work
export class CLI {
  constructor() {
    // Only essential initialization
    this.name = 'cli-alpha'
  }
  
  async run() {
    // Load config only when needed
    const config = await loadConfig()
    await this.execute(config)
  }
}

// ✗ Avoid - heavy startup work
export class CLI {
  constructor() {
    this.config = loadConfigSync()  // Blocks startup
    this.plugins = loadPluginsSync() // Blocks startup
  }
}
```

### Defer Non-Critical Work

```typescript
async function run() {
  // Execute command immediately
  const result = await command.run()
  
  // Defer telemetry/analytics
  setImmediate(() => {
    trackCommand(command.id).catch(() => {})
  })
  
  return result
}
```

## Build Performance

### Turborepo Caching

Configured in [`turbo.json`](../../turbo.json):

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "cache": true
    }
  }
}
```

Benefits:
- Local cache: Rebuilds only changed packages
- Remote cache: Share builds across team/CI
- Parallel builds: Independent packages build simultaneously

### TypeScript Performance

Optimize TypeScript compilation in [`tsconfig.json`](../../tsconfig.json):

```json
{
  "compilerOptions": {
    "incremental": true,
    "skipLibCheck": true,
    "composite": true
  }
}
```

Project references in [`tsconfig.base.json`](../../tsconfig.base.json) enable:
- Incremental compilation
- Parallel type checking
- Faster IDE experience

## Runtime Performance

### Avoid Synchronous Operations

```typescript
// ✓ Good - async I/O
const data = await fs.readFile(filePath, 'utf-8')

// ✗ Avoid - blocks event loop
const data = fs.readFileSync(filePath, 'utf-8')
```

### Optimize Hot Paths

Profile and optimize frequently-called code:

```typescript
// Use perf_hooks for profiling
import { performance } from 'perf_hooks'

const start = performance.now()
await criticalOperation()
const duration = performance.now() - start

if (duration > 100) {
  logger.warn('Slow operation detected', { duration })
}
```

### Memoization

Cache expensive computations:

```typescript
import memoize from 'memoizee'

const expensiveCalculation = memoize((input: string) => {
  // Expensive operation
  return complexTransform(input)
}, { maxAge: 60000 }) // Cache for 1 minute
```

## Monitoring & Profiling

### Benchmarking

Use Hyperfine for command benchmarking:

```bash
# Benchmark command execution
hyperfine 'alpha tasks list' --warmup 3 --runs 10

# Output:
# Time (mean ± σ):     245.2 ms ±   8.3 ms
# Range (min … max):   235.1 ms … 261.8 ms
```

### Profiling

Use Node.js profiler to identify bottlenecks:

```bash
# Generate CPU profile
node --cpu-prof ./bin/run.js tasks list

# Analyze with speedscope
speedscope isolate-*.log
```

### Memory Profiling

Monitor memory usage:

```bash
# Generate heap snapshot
node --heap-prof ./bin/run.js tasks list

# Analyze with Chrome DevTools
# chrome://inspect -> Load heap snapshot
```

## Performance Testing

### CI Integration

Performance tests run on every PR:

```yaml
# .github/workflows/ci.yml
- name: Performance tests
  run: |
    pnpm test:perf
    pnpm check:perf
```

### Performance Regression Detection

Compare against baseline:

```typescript
const baseline = 500 // ms
const current = await measurePerformance()

if (current > baseline * 1.2) {
  throw new Error(`Performance regression: ${current}ms > ${baseline}ms`)
}
```

## Best Practices

### 1. Measure First

Always profile before optimizing:

```bash
# Measure current performance
hyperfine 'alpha tasks list'

# Make optimization
# ...

# Verify improvement
hyperfine 'alpha tasks list'
```

### 2. Optimize Hot Paths

Focus on frequently-executed code:
- Command initialization (runs every time)
- List operations (users run frequently)
- Configuration loading (happens on startup)

### 3. Balance Complexity

Don't sacrifice readability for marginal gains:

```typescript
// ✓ Good - clear and fast enough
const filtered = items.filter(item => item.active)

// ✗ Avoid - premature optimization
const filtered = []
for (let i = 0; i < items.length; i++) {
  if (items[i].active) filtered.push(items[i])
}
```

### 4. Monitor in Production

Track real-world performance:
- Log command execution times
- Track slow operations
- Monitor memory usage
- Detect performance regressions

## Performance Anti-Patterns

### ❌ Synchronous File I/O

```typescript
// Blocks event loop
const config = fs.readFileSync('config.json')
```

### ❌ Unnecessary Dependencies

```typescript
// Adds MB to bundle size
import _ from 'lodash'
```

### ❌ Eager Loading

```typescript
// Loads everything at startup
import { AllFeatures } from './features'
```

### ❌ No Caching

```typescript
// Re-computes on every call
function getConfig() {
  return loadConfigFromDisk()
}
```

## Related Documentation

- [ADR-006: Performance Budgets and Monitoring](../adr/006-performance-budgets-and-monitoring.md)
- [Turborepo Configuration](../../turbo.json)
- [Performance Budget Script](../../scripts/perf-budget.js)

<!-- TODO: Expand with V8 optimization tips and deoptimization patterns -->
<!-- TODO: Add examples of bundle analysis and tree-shaking verification -->
<!-- TODO: Document memory leak detection and prevention strategies -->
