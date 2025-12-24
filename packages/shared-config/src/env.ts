import { z } from 'zod'

/**
 * Environment variable validation and loading
 */

export interface LoadEnvOptions<T extends z.ZodRawShape> {
  /**
   * Zod schema for environment variables
   */
  schema: z.ZodObject<T>

  /**
   * Prefix to filter env vars (e.g., "MYCLI_" will only load MYCLI_*)
   */
  prefix?: string

  /**
   * Whether to strip prefix from keys
   * @default true
   */
  stripPrefix?: boolean

  /**
   * Custom env object (defaults to process.env)
   */
  env?: NodeJS.ProcessEnv
}

/**
 * Load and validate environment variables
 */
export function loadEnv<T extends z.ZodRawShape>(
  options: LoadEnvOptions<T>
): z.infer<z.ZodObject<T>> {
  const {
    schema,
    prefix,
    stripPrefix = true,
    env = process.env,
  } = options

  let envToValidate = { ...env }

  // Filter by prefix if provided
  if (prefix) {
    envToValidate = Object.entries(env)
      .filter(([key]) => key.startsWith(prefix))
      .reduce((acc, [key, value]) => {
        const newKey = stripPrefix ? key.slice(prefix.length) : key
        acc[newKey] = value
        return acc
      }, {} as Record<string, string | undefined>)
  }

  // Validate with Zod
  const parseResult = schema.safeParse(envToValidate)

  if (!parseResult.success) {
    const errors = parseResult.error.errors
      .map(err => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n')

    throw new Error(`Invalid environment variables:\n${errors}`)
  }

  return parseResult.data
}

/**
 * Create a typed env loader for your CLI
 */
export function createEnvLoader<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  prefix?: string
) {
  return (env?: NodeJS.ProcessEnv) =>
    loadEnv({ schema, prefix, env })
}

/**
 * Helper to define required env var
 */
export const required = (message?: string) =>
  z.string().min(1, message ?? 'Required environment variable')

/**
 * Helper to define optional env var with default
 */
export const optional = (defaultValue: string) =>
  z.string().default(defaultValue)

/**
 * Helper to parse boolean env var
 */
export const boolean = () =>
  z
    .string()
    .optional()
    .transform(val => 
      val === 'true' || val === '1' || val === 'yes'
    )
    .pipe(z.boolean())

/**
 * Helper to parse number env var
 */
export const number = () =>
  z
    .string()
    .transform(val => Number.parseInt(val, 10))
    .pipe(z.number())

/**
 * Helper to parse URL env var
 */
export const url = () =>
  z.string().url()

/**
 * Helper to parse JSON env var
 */
export const json = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .string()
    .transform((val, ctx) => {
      try {
        return JSON.parse(val)
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid JSON',
        })
        return z.NEVER
      }
    })
    .pipe(schema)

/**
 * Helper for comma-separated list
 */
export const list = () =>
  z
    .string()
    .transform(val => val.split(',').map(s => s.trim()).filter(Boolean))
    .pipe(z.array(z.string()))
