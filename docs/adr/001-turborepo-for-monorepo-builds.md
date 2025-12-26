# ADR-001: Use Turborepo for Monorepo Builds

**Status:** Accepted  
**Date:** 2025-12-26  
**Deciders:** Team  

## Context

This project is a monorepo containing three independent CLIs (`cli-alpha`, `cli-beta`, `cli-gamma`) and 14 shared packages. We needed a build orchestration tool that could:

- Handle complex dependency graphs between packages
- Enable efficient caching to avoid rebuilding unchanged packages
- Support parallel task execution to speed up CI/CD pipelines
- Provide a simple developer experience with minimal configuration
- Scale as the number of packages grows

Alternative solutions considered:
- **Lerna**: Legacy tool, less active development, slower build times
- **Nx**: More complex configuration, steeper learning curve
- **pnpm workspaces alone**: No task orchestration or caching capabilities
- **Custom scripts**: High maintenance burden, no caching

## Decision

We will use **Turborepo** as our monorepo build orchestrator.

Configuration is defined in `turbo.json` with the following tasks:
- `build`: Compiles TypeScript with output caching
- `test`: Runs Vitest with coverage
- `lint`: Executes ESLint across all packages
- `typecheck`: Validates TypeScript types

Turborepo is configured to work with pnpm workspaces, leveraging both tools' strengths.

## Consequences

### Positive

- **Fast builds**: Turborepo's cache reduces CI time from ~10 minutes to ~2 minutes on cache hits
- **Parallel execution**: Multiple packages build simultaneously, utilizing available CPU cores
- **Dependency awareness**: Tasks run in correct order based on package dependencies
- **Simple configuration**: Single `turbo.json` file defines all task pipelines
- **Local caching**: Developers benefit from cache on local machines, not just CI
- **Remote caching support**: Can add Vercel Remote Cache for team-wide cache sharing

### Negative

- **Additional dependency**: Adds Turborepo to the toolchain (though it's well-maintained)
- **Learning curve**: Team needs to understand Turborepo's caching behavior
- **Cache invalidation**: Requires careful configuration to avoid stale cache issues

### Neutral

- **Lock-in**: Turborepo-specific configuration, but migration path exists to alternatives
- **GitHub Actions integration**: Works seamlessly with `actions/cache`

## Implementation

Turborepo is implemented in the following files:

- [turbo.json](../../turbo.json) - Main configuration with task pipelines
- [package.json](../../package.json) - Root workspace configuration with Turborepo scripts
- Each package's `package.json` includes `build`, `test`, `lint` scripts that Turborepo orchestrates

Key scripts:
```bash
pnpm build        # Build all packages
pnpm test         # Run all tests
pnpm lint         # Lint all packages
turbo run build --filter=cli-alpha  # Build only cli-alpha and its dependencies
```

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [turbo.json Configuration](../../turbo.json)
- Related ADRs: [ADR-002 (Changesets)](002-changesets-for-versioning.md)

<!-- TODO: Expand with performance metrics from CI/CD pipeline -->
<!-- TODO: Add lessons learned after 6 months of usage -->
