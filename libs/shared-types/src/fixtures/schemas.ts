/**
 * Zod schemas for fixture validation
 */

import { z } from 'zod'

import type { FixtureSchemaMetadata } from './types.js'

/**
 * Helper to add metadata to a schema
 */
function withMetadata<T extends z.ZodType>(schema: T, metadata: FixtureSchemaMetadata): T {
  return schema.describe(JSON.stringify(metadata)) as T
}

/**
 * Base fixture schema with version
 */
export const BaseFixtureSchema = z.object({
  version: z.string(),
})

/**
 * Configuration fixture schema
 * Default strategy: coerce (AI-friendly)
 */
export const ConfigFixtureSchema = withMetadata(
  BaseFixtureSchema.extend({
    version: z.literal('1.0.0'),
    name: z.string().optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    plugins: z.array(z.string()).optional(),
    settings: z.record(z.unknown()).optional(),
  }),
  {
    migrationStrategy: 'coerce',
    breakingChangePolicy: 'warn',
    description: 'CLI configuration file schema',
  },
)

/**
 * Task fixture schema
 * Default strategy: coerce (AI-friendly)
 */
export const TaskFixtureSchema = withMetadata(
  BaseFixtureSchema.extend({
    version: z.literal('1.0.0'),
    id: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['todo', 'in-progress', 'done']).optional(),
    tags: z.array(z.string()).optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  }),
  {
    migrationStrategy: 'coerce',
    breakingChangePolicy: 'warn',
    description: 'Task data schema',
  },
)

/**
 * API response fixture schema
 * Default strategy: coerce (AI-friendly)
 */
export const APIResponseFixtureSchema = withMetadata(
  BaseFixtureSchema.extend({
    version: z.literal('1.0.0'),
    status: z.number().int().min(100).max(599).optional(),
    statusText: z.string().optional(),
    headers: z.record(z.string()).optional(),
    data: z.unknown().optional(),
  }),
  {
    migrationStrategy: 'coerce',
    breakingChangePolicy: 'warn',
    description: 'HTTP API response schema',
  },
)

/**
 * Git repository fixture schema
 * Default strategy: coerce (AI-friendly)
 */
export const GitRepoFixtureSchema = withMetadata(
  BaseFixtureSchema.extend({
    version: z.literal('1.0.0'),
    branches: z.array(z.string()).optional(),
    commits: z
      .array(
        z.object({
          sha: z.string(),
          message: z.string(),
          author: z.string(),
          date: z.string().datetime(),
        }),
      )
      .optional(),
    tags: z.array(z.string()).optional(),
    remotes: z.record(z.string()).optional(),
  }),
  {
    migrationStrategy: 'coerce',
    breakingChangePolicy: 'warn',
    description: 'Git repository structure schema',
  },
)

/**
 * Get metadata from a schema
 */
export function getSchemaMetadata(schema: z.ZodType): FixtureSchemaMetadata | null {
  const description = schema.description
  if (!description) return null

  try {
    return JSON.parse(description) as FixtureSchemaMetadata
  } catch {
    return null
  }
}

/**
 * All fixture schemas mapped by type
 */
export const FixtureSchemas = {
  config: ConfigFixtureSchema,
  task: TaskFixtureSchema,
  apiResponse: APIResponseFixtureSchema,
  gitRepo: GitRepoFixtureSchema,
} as const

export type FixtureSchemaType = keyof typeof FixtureSchemas
