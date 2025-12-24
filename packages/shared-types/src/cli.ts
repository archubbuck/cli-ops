/**
 * CLI-specific types
 */

import type { JSONValue } from './common.js'

/**
 * CLI context passed to commands
 */
export interface CLIContext {
  /**
   * CLI name
   */
  name: string

  /**
   * CLI version
   */
  version: string

  /**
   * Current working directory
   */
  cwd: string

  /**
   * User home directory
   */
  home: string

  /**
   * Configuration directory
   */
  configDir: string

  /**
   * Cache directory
   */
  cacheDir: string

  /**
   * Data directory
   */
  dataDir: string

  /**
   * Whether running in CI
   */
  isCI: boolean

  /**
   * Whether TTY is available
   */
  isTTY: boolean

  /**
   * Environment variables
   */
  env: Record<string, string | undefined>
}

/**
 * Command flag definition
 */
export interface FlagDefinition {
  /**
   * Flag type
   */
  type: 'string' | 'boolean' | 'number' | 'option'

  /**
   * Flag description
   */
  description: string

  /**
   * Short alias (single character)
   */
  char?: string

  /**
   * Default value
   */
  default?: unknown

  /**
   * Required flag
   */
  required?: boolean

  /**
   * Multiple values allowed
   */
  multiple?: boolean

  /**
   * Options (for option type)
   */
  options?: string[]

  /**
   * Hidden from help
   */
  hidden?: boolean

  /**
   * Deprecated message
   */
  deprecated?: string | boolean
}

/**
 * Command argument definition
 */
export interface ArgumentDefinition {
  /**
   * Argument name
   */
  name: string

  /**
   * Argument description
   */
  description: string

  /**
   * Required argument
   */
  required?: boolean

  /**
   * Default value
   */
  default?: string

  /**
   * Hidden from help
   */
  hidden?: boolean
}

/**
 * Command metadata
 */
export interface CommandMetadata {
  /**
   * Command ID (e.g., "user:create")
   */
  id: string

  /**
   * Command description
   */
  description: string

  /**
   * Command aliases
   */
  aliases?: string[]

  /**
   * Usage examples
   */
  examples?: string[]

  /**
   * Command flags
   */
  flags?: Record<string, FlagDefinition>

  /**
   * Command arguments
   */
  args?: Record<string, ArgumentDefinition>

  /**
   * Hidden from help
   */
  hidden?: boolean

  /**
   * Plugin name
   */
  pluginName?: string

  /**
   * Plugin version
   */
  pluginVersion?: string
}

/**
 * Command execution result
 */
export interface CommandResult {
  /**
   * Exit code
   */
  exitCode: number

  /**
   * Execution duration (ms)
   */
  duration: number

  /**
   * Output data
   */
  data?: JSONValue

  /**
   * Error if failed
   */
  error?: Error
}

/**
 * Hook types
 */
export type HookType =
  | 'init'
  | 'prerun'
  | 'postrun'
  | 'command_not_found'
  | 'error'

/**
 * Hook function
 */
export type HookFunction<T = unknown> = (
  context: T
) => void | Promise<void>

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  /**
   * Plugin name
   */
  name: string

  /**
   * Plugin version
   */
  version: string

  /**
   * Plugin description
   */
  description?: string

  /**
   * Plugin commands
   */
  commands?: CommandMetadata[]

  /**
   * Plugin hooks
   */
  hooks?: Partial<Record<HookType, HookFunction[]>>
}

/**
 * Output format
 */
export type OutputFormat = 'json' | 'yaml' | 'table' | 'csv' | 'markdown' | 'text'

/**
 * Log level
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

/**
 * Configuration schema
 */
export interface ConfigSchema {
  /**
   * Configuration version
   */
  version: string

  /**
   * CLI settings
   */
  cli?: {
    /**
     * Default output format
     */
    output?: OutputFormat

    /**
     * Log level
     */
    logLevel?: LogLevel

    /**
     * Enable colors
     */
    colors?: boolean

    /**
     * Enable debug mode
     */
    debug?: boolean
  }

  /**
   * Plugin-specific settings
   */
  plugins?: Record<string, JSONValue>

  /**
   * User-defined settings
   */
  [key: string]: JSONValue
}
