import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test/**',
        '**/fixtures/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['node_modules/', 'dist/', '.turbo/'],
  },
  resolve: {
    alias: {
      '@cli-ops/shared-commands': resolve(__dirname, './libs/shared-commands/src'),
      '@cli-ops/shared-config': resolve(__dirname, './libs/shared-config/src'),
      '@cli-ops/shared-core': resolve(__dirname, './libs/shared-core/src'),
      '@cli-ops/shared-exit-codes': resolve(__dirname, './libs/shared-exit-codes/src'),
      '@cli-ops/shared-formatter': resolve(__dirname, './libs/shared-formatter/src'),
      '@cli-ops/shared-history': resolve(__dirname, './libs/shared-history/src'),
      '@cli-ops/shared-hooks': resolve(__dirname, './libs/shared-hooks/src'),
      '@cli-ops/shared-ipc': resolve(__dirname, './libs/shared-ipc/src'),
      '@cli-ops/shared-logger': resolve(__dirname, './libs/shared-logger/src'),
      '@cli-ops/shared-prompts': resolve(__dirname, './libs/shared-prompts/src'),
      '@cli-ops/shared-services': resolve(__dirname, './libs/shared-services/src'),
      '@cli-ops/shared-testing': resolve(__dirname, './libs/shared-testing/src'),
      '@cli-ops/shared-types': resolve(__dirname, './libs/shared-types/src'),
      '@cli-ops/shared-ui': resolve(__dirname, './libs/shared-ui/src'),
    },
  },
})
