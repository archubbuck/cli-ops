# Build & Test Instructions

## Initial Setup Complete ✅

Dependencies have been installed successfully. Now you need to build the packages.

## Build the Project

```bash
pnpm build
```

This will:

- Compile all TypeScript packages
- Generate type definitions
- Create oclif manifest files
- Prepare packages for local testing

## Run Tests

After building, run the test suite:

```bash
pnpm test
```

## Try Clio Locally

Once built, you can test clio in development mode:

```bash
# Show help
pnpm dev:clio help

# Try task commands
pnpm dev:clio tasks:create "Test task"
pnpm dev:clio tasks:list

# View autocomplete commands
pnpm dev:clio autocomplete

# Check configuration
pnpm dev:clio config:list

# Run diagnostics
pnpm dev:clio doctor
```

## Performance Check

```bash
pnpm perf
```

## Documentation Site

Start the Docusaurus documentation site:

```bash
pnpm dev:docs
```

Visit http://localhost:3000 to see the docs.

## Next Steps

After build completes:

1. Run tests: `pnpm test`
2. Check performance: `pnpm perf`
3. Test example plugins
4. Review CI/CD pipeline
5. Consider remaining implementation tasks (telemetry, plugin registry features, etc.)

## Troubleshooting

If build fails:

- Check for TypeScript errors: `pnpm typecheck`
- Clean and rebuild: `pnpm clean && pnpm build`
- Check individual package: `pnpm --filter @cli-ops/clio build`
