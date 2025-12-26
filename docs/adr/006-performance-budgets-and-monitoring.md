# ADR-006: Performance Budgets and Monitoring

**Status:** Accepted  
**Date:** 2025-12-26  
**Deciders:** Team  

## Context

CLI responsiveness is critical for user experience. Slow commands lead to:

- User frustration and abandonment
- Reduced productivity in tight feedback loops
- Perception of poor software quality
- Context switching while waiting (especially harmful for ADHD users)

Challenges:
- Node.js startup time can be slow (~50-100ms)
- Dependencies add to bundle size and initialization time
- Cold starts are worse than warm starts (no cache)
- Some operations (file I/O, network) are inherently slow

Without performance budgets, CLIs can gradually become slower through:
- Adding heavy dependencies without consideration
- Implementing inefficient algorithms
- Excessive logging or computation during initialization
- Lack of lazy loading for rarely-used features

## Decision

We will enforce **performance budgets** for all CLI operations with automated monitoring.

### Performance Targets

| Operation | Target | Maximum | Rationale |
|-----------|--------|---------|-----------|
| `--help` | <200ms | <500ms | Most common command, must be instant |
| `--version` | <100ms | <200ms | Trivial operation, near-instant |
| Simple commands (list, show) | <500ms | <1000ms | Should feel immediate |
| Complex commands (add, delete) | <1000ms | <2000ms | Acceptable for operations with side effects |
| CLI startup (require time) | <300ms | <500ms | Impacts all commands |

### Monitoring Strategy

1. **Automated Performance Tests**
   - Run performance benchmarks in CI/CD
   - Fail builds if budgets are exceeded
   - Track trends over time

2. **Bundle Size Monitoring**
   - Measure total bundle size for each CLI
   - Alert on unexpected increases (>10% change)
   - Review dependency additions in PRs

3. **Lazy Loading**
   - Defer loading of heavy dependencies until needed
   - Use dynamic imports for rarely-used commands
   - Minimize work in module initialization

4. **Profiling Tools**
   - Use `NODE_OPTIONS='--prof'` for detailed profiling
   - `0x` for flamegraph generation
   - `clinic` for production profiling

## Consequences

### Positive

- **Consistent performance**: Users can rely on CLI responsiveness
- **Prevents regressions**: Automated tests catch slowdowns early
- **Forces optimization**: Developers must consider performance from the start
- **Better UX**: Fast CLIs feel polished and professional
- **Competitive advantage**: Many CLIs are slow; we can differentiate on speed

### Negative

- **Implementation effort**: Setting up performance testing infrastructure
- **CI/CD overhead**: Performance tests add time to builds (~2-5 minutes)
- **Constraint on features**: Some features may be rejected due to performance cost
- **Maintenance burden**: Performance tests need updates as codebase evolves

### Neutral

- **Variability**: Performance varies by machine (tests run in consistent CI environment)
- **Trade-offs**: May sacrifice some features for performance

## Implementation

Performance monitoring is implemented in:

### Performance Budget Configuration
- [tooling/perf-config/index.js](../../tooling/perf-config/index.js) - Performance budget definitions
  ```javascript
  module.exports = {
    budgets: {
      help: 500,      // ms
      version: 200,   // ms
      simple: 1000,   // ms
      complex: 2000   // ms
    }
  }
  ```

### Performance Testing
- [scripts/perf-budget.js](../../scripts/perf-budget.js) - Automated performance testing script
  ```bash
  pnpm test:perf  # Run performance tests
  ```
- [scripts/check-perf-budget.js](../../scripts/check-perf-budget.js) - CI check script
  ```bash
  # In CI pipeline
  pnpm check:perf && echo "Performance budgets met ✓"
  ```

### Measurement Utilities
```typescript
// In shared-testing package
import { measurePerformance } from '@cli-ops/shared-testing'

const duration = await measurePerformance(async () => {
  await command.run(['--help'])
})

expect(duration).toBeLessThan(500) // ms
```

### Lazy Loading Pattern
```typescript
// Bad: Load heavy dependency at module level
import { HeavyLibrary } from 'heavy-library'

// Good: Lazy load when needed
async run() {
  const { HeavyLibrary } = await import('heavy-library')
  // Use HeavyLibrary...
}
```

### Bundle Analysis
```bash
# Analyze bundle size
pnpm bundle-size

# Generate bundle visualization
pnpm bundle-viz
```

### CI/CD Integration
```yaml
# In .github/workflows/ci.yml
- name: Check Performance Budgets
  run: pnpm check:perf
  
- name: Report Bundle Size
  run: pnpm bundle-size --json > bundle-report.json
```

## Performance Optimization Strategies

### Startup Optimization
1. **Minimize require() calls**: Lazy load when possible
2. **Avoid heavy computation**: Defer to command execution
3. **Cache when possible**: Memoize expensive operations
4. **Use native modules**: Avoid polyfills for Node.js built-ins

### Runtime Optimization
1. **Async I/O**: Use async file operations, not sync
2. **Parallel operations**: Use Promise.all() for concurrent tasks
3. **Streaming**: Process large files with streams, not loading into memory
4. **Efficient data structures**: Use Maps/Sets over objects/arrays for lookups

### Dependency Optimization
1. **Audit dependencies**: Review impact of each dependency
2. **Use lighter alternatives**: e.g., `ms` instead of `moment`
3. **Tree-shaking**: Ensure bundler can remove unused code
4. **Avoid polyfills**: Target modern Node.js versions

## References

- [Performance Testing Documentation](../architecture/performance.md)
- [perf-config Package](../../tooling/perf-config/)
- [Performance Budget Scripts](../../scripts/perf-budget.js)
- Related ADRs:
  - [ADR-005 (ADHD/OCD UX)](005-adhd-ocd-friendly-ux-patterns.md) - Performance impacts UX

### External Resources
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Web Performance Budgets](https://web.dev/performance-budgets-101/)

<!-- TODO: Add actual performance metrics from current CLIs -->
<!-- TODO: Expand with case studies of optimization wins -->
<!-- TODO: Document profiling workflow for contributors -->
