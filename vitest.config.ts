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
      '@/shared-commands': resolve(__dirname, './packages/shared-commands/src'),
      '@/shared-config': resolve(__dirname, './packages/shared-config/src'),
      '@/shared-core': resolve(__dirname, './packages/shared-core/src'),
      '@/shared-exit-codes': resolve(__dirname, './packages/shared-exit-codes/src'),
      '@/shared-formatter': resolve(__dirname, './packages/shared-formatter/src'),
      '@/shared-history': resolve(__dirname, './packages/shared-history/src'),
      '@/shared-hooks': resolve(__dirname, './packages/shared-hooks/src'),
      '@/shared-ipc': resolve(__dirname, './packages/shared-ipc/src'),
      '@/shared-logger': resolve(__dirname, './packages/shared-logger/src'),
      '@/shared-prompts': resolve(__dirname, './packages/shared-prompts/src'),
      '@/shared-services': resolve(__dirname, './packages/shared-services/src'),
      '@/shared-testing': resolve(__dirname, './packages/shared-testing/src'),
      '@/shared-types': resolve(__dirname, './packages/shared-types/src'),
      '@/shared-ui': resolve(__dirname, './packages/shared-ui/src'),
    },
  },
})
