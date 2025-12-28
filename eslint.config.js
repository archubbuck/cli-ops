import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import unicornPlugin from 'eslint-plugin-unicorn'
import promisePlugin from 'eslint-plugin-promise'
import nodePlugin from 'eslint-plugin-node'
import securityPlugin from 'eslint-plugin-security'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default [
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/lib/**',
      '**/node_modules/**',
      '**/*.js',
      '**/coverage/**',
      '**/.turbo/**',
      '**/.fixture-cache/**',
      '**/.fixture-snapshots/**',
      '**/inventory/**',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        projectService: true,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      import: importPlugin,
      unicorn: unicornPlugin,
      promise: promisePlugin,
      node: nodePlugin,
      security: securityPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // ESLint recommended
      ...Object.fromEntries(
        Object.entries({
          'no-console': ['error', { allow: ['warn', 'error'] }],
          'no-debugger': 'error',
          'no-return-await': 'error',
          'require-await': 'error',
          'prefer-const': 'error',
          'prefer-template': 'error',
        }),
      ),

      // TypeScript specific
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'] },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'memberLike', format: ['camelCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
        { selector: 'typeAlias', format: ['PascalCase'], prefix: ['T'] },
        { selector: 'enum', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['UPPER_CASE'] },
      ],

      // Import organization
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-default-export': 'error',

      // Unicorn overrides (some rules are too strict)
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',

      // Node.js
      'node/no-unsupported-features/es-syntax': 'off',
      'node/no-missing-import': 'off',
      'node/no-unpublished-import': 'off',
    },
  },
  {
    files: ['**/commands/**/*.ts', '**/src/index.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  {
    files: ['**/fixtures/**/*.ts', '**/src/migrations.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    files: ['libs/shared-testing/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: [
      'plugins/**/src/index.ts',
      'plugins/**/src/plugin.ts',
      'libs/shared-plugins/src/**/*.ts',
    ],
    rules: {
      // Plugin lifecycle methods often override Promise-returning methods
      // but don't need await internally
      'require-await': 'off',
    },
  },
]
