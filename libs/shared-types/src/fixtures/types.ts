/**
 * Fixture type definitions
 */

/**
 * Migration strategy for fixture validation
 * - strict: No coercion, exact schema match required
 * - coerce: Attempt type coercion, warn on issues
 * - manual: Require explicit migration script
 */
export type MigrationStrategy = 'strict' | 'coerce' | 'manual'

/**
 * Policy for handling breaking changes
 * - error: Throw error on breaking changes
 * - warn: Log warning but continue
 */
export type BreakingChangePolicy = 'error' | 'warn'

/**
 * Metadata for fixture schemas
 */
export interface FixtureSchemaMetadata {
  migrationStrategy?: MigrationStrategy
  breakingChangePolicy?: BreakingChangePolicy
  description?: string
}

/**
 * Base fixture interface with version
 */
export interface BaseFixture {
  version: string
  [key: string]: unknown
}

/**
 * Configuration fixture
 */
export interface ConfigFixture extends BaseFixture {
  name?: string
  theme?: string
  plugins?: string[]
  settings?: Record<string, unknown>
}

/**
 * Task fixture
 */
export interface TaskFixture extends BaseFixture {
  id?: string
  title?: string
  description?: string
  status?: 'todo' | 'in-progress' | 'done'
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

/**
 * API response fixture
 */
export interface APIResponseFixture extends BaseFixture {
  status?: number
  statusText?: string
  headers?: Record<string, string>
  data?: unknown
}

/**
 * Git repository fixture metadata
 */
export interface GitRepoFixture extends BaseFixture {
  branches?: string[]
  commits?: Array<{
    sha: string
    message: string
    author: string
    date: string
  }>
  tags?: string[]
  remotes?: Record<string, string>
}

/**
 * Fixture validation result
 */
export interface FixtureValidationResult {
  valid: boolean
  errors?: Array<{
    path: string[]
    message: string
  }>
  warnings?: Array<{
    path: string[]
    message: string
  }>
  coerced?: boolean
}

/**
 * Migration metadata
 */
export interface MigrationMetadata {
  fromVersion: string
  toVersion: string
  description: string
  breaking: boolean
}
