/**
 * Fixture loading and validation utilities
 * @module fixture-helpers
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { FixtureValidationResult, MigrationStrategy } from '@cli-ops/shared-types'
import { getSchemaMetadata } from '@cli-ops/shared-types'
import type { z } from 'zod'

/**
 * Load a fixture file from disk
 * @param path - Relative path to fixture file
 * @param options - Loading options
 * @returns Parsed fixture data
 */
export function loadFixture<T = unknown>(
  path: string,
  options?: {
    baseDir?: string
    encoding?: BufferEncoding
  },
): T {
  const baseDir = options?.baseDir || process.cwd()
  const encoding = options?.encoding || 'utf-8'
  const fullPath = resolve(baseDir, path)

  try {
    const content = readFileSync(fullPath, encoding)

    // Parse JSON files
    if (fullPath.endsWith('.json')) {
      return JSON.parse(content) as T
    }

    // Return raw content for other files
    return content as T
  } catch (error) {
    throw new Error(
      `Failed to load fixture from ${fullPath}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/**
 * Load a shared fixture from @cli-ops/shared-testing/fixtures
 * @param path - Relative path within fixtures directory
 * @returns Parsed fixture data
 */
export function loadSharedFixture<T = unknown>(path: string): T {
  // In development, resolve relative to this package
  const fixturesDir = resolve(__dirname, '../fixtures')
  return loadFixture<T>(path, { baseDir: fixturesDir })
}

/**
 * Validate a fixture against a Zod schema
 * @param data - Fixture data to validate
 * @param schema - Zod schema to validate against
 * @returns Validation result
 */
export function validateFixture<T>(data: unknown, schema: z.ZodType<T>): FixtureValidationResult {
  const metadata = getSchemaMetadata(schema)
  const strategy: MigrationStrategy = metadata?.migrationStrategy || 'coerce'

  try {
    // Apply strategy
    if (strategy === 'strict') {
      // Strict mode: no coercion
      const result = schema.safeParse(data)
      if (!result.success) {
        return {
          valid: false,
          errors: result.error.errors.map((err) => ({
            path: err.path.map(String),
            message: err.message,
          })),
        }
      }
      return { valid: true }
    } else if (strategy === 'coerce') {
      // Coerce mode: attempt coercion with warnings
      const result = schema.safeParse(data)
      if (!result.success) {
        // Check if errors are coercible
        const warnings = result.error.errors
          .filter((err) => err.code === 'invalid_type')
          .map((err) => ({
            path: err.path.map(String),
            message: `Type coercion: ${err.message}`,
          }))

        const errors = result.error.errors
          .filter((err) => err.code !== 'invalid_type')
          .map((err) => ({
            path: err.path.map(String),
            message: err.message,
          }))

        if (errors.length > 0) {
          return { valid: false, errors, warnings }
        }

        return {
          valid: true,
          warnings,
          coerced: warnings.length > 0,
        }
      }
      return { valid: true }
    } else {
      // Manual mode: require migration
      return {
        valid: false,
        errors: [
          {
            path: [],
            message: 'Manual migration required. Run migration script before validation.',
          },
        ],
      }
    }
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          path: [],
          message: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    }
  }
}

/**
 * Load and validate a fixture in one step
 * @param path - Path to fixture file
 * @param schema - Zod schema to validate against
 * @param options - Loading options
 * @returns Validated fixture data
 * @throws Error if validation fails
 */
export function loadAndValidateFixture<T>(
  path: string,
  schema: z.ZodType<T>,
  options?: {
    baseDir?: string
    throwOnWarnings?: boolean
  },
): T {
  const data = loadFixture(path, options)
  const result = validateFixture(data, schema)

  if (!result.valid) {
    const errorMessages = result.errors?.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n')
    throw new Error(`Fixture validation failed for ${path}:\n${errorMessages}`)
  }

  if (result.warnings && result.warnings.length > 0) {
    const warningMessages = result.warnings
      .map((w) => `${w.path.join('.')}: ${w.message}`)
      .join('\n')

    if (options?.throwOnWarnings) {
      throw new Error(`Fixture has warnings for ${path}:\n${warningMessages}`)
    }

    console.warn(`Fixture warnings for ${path}:\n${warningMessages}`)
  }

  return data as T
}

/**
 * Create a snapshot of fixture data for change detection
 * @param data - Fixture data to snapshot
 * @param name - Snapshot name
 * @returns Snapshot hash
 */
export function snapshotFixture(data: unknown, name: string): string {
  const content = JSON.stringify(data, null, 2)
  // Simple hash for now - can be enhanced with crypto
  return `${name}:${content.length}:${content.slice(0, 100)}`
}

/**
 * Create a mock Git repository fixture
 * @param options - Repository configuration
 * @returns Path to created repository
 */
export async function createGitFixture(_options?: {
  branches?: string[]
  commits?: number
  tags?: string[]
}): Promise<string> {
  const { createFixtureManager } = await import('./fixtures.js')
  const manager = createFixtureManager()

  const repoPath = await manager.create({
    /* eslint-disable @typescript-eslint/naming-convention */
    '.git/config': '[core]\n\trepositoryformatversion = 0',
    '.git/HEAD': 'ref: refs/heads/main',
    'README.md': '# Test Repository',
    /* eslint-enable @typescript-eslint/naming-convention */
  })

  return repoPath
}

/**
 * Create a mock API response fixture
 * @param options - Response configuration
 * @returns Mock response data
 */
export function createAPIFixture(options: {
  status?: number
  statusText?: string
  data?: unknown
  headers?: Record<string, string>
}): unknown {
  return {
    version: '1.0.0',
    status: options.status || 200,
    statusText: options.statusText || 'OK',
    /* eslint-disable @typescript-eslint/naming-convention */
    headers: options.headers || { 'content-type': 'application/json' },
    /* eslint-enable @typescript-eslint/naming-convention */
    data: options.data || {},
  }
}
