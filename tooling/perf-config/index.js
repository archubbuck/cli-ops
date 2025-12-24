module.exports = {
  // CLI Startup Performance Budgets (milliseconds)
  budgets: {
    help: 500,    // --help command must complete in <500ms
    version: 200, // --version command must complete in <200ms
    command: 1000, // Regular commands should complete in <1s (not including actual work)
  },

  // Bundle Size Budgets (kilobytes)
  bundleSizes: {
    cli: 5000,    // CLI total size should be <5MB
    package: 1000, // Individual packages should be <1MB
  },

  // Memory Usage Budgets (megabytes)
  memory: {
    idle: 50,     // Idle memory usage should be <50MB
    peak: 200,    // Peak memory during execution should be <200MB
  },

  // Test Performance Budgets
  tests: {
    unit: 5000,   // All unit tests should complete in <5s
    e2e: 30000,   // E2E tests should complete in <30s per CLI
  },

  // Build Performance Budgets
  build: {
    clean: 10000, // Clean build should complete in <10s per package
    incremental: 2000, // Incremental build should complete in <2s
  },
};
