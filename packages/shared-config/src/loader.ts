import { cosmiconfig, cosmiconfigSync } from 'cosmiconfig'
import type { CosmiconfigResult } from 'cosmiconfig'
import type { ZodSchema } from 'zod'

export interface LoadConfigOptions<T> {
  /**
   * Name of your CLI/tool (used for config file search)
   * e.g., "mycli" will search for .myclircrc, mycli.config.js, etc.
   */
  moduleName: string

  /**
   * Zod schema for config validation
   */
  schema: ZodSchema<T>

  /**
   * Directory to start searching from (defaults to process.cwd())
   */
  searchFrom?: string

  /**
   * Stop searching at this directory (defaults to home directory)
   */
  stopDir?: string

  /**
   * Whether to merge user config (~/.config) with project config
   * @default true
   */
  mergeUserConfig?: boolean

  /**
   * Default configuration values
   */
  defaults?: Partial<T>

  /**
   * Transform function to run before validation
   */
  transform?: (config: unknown) => unknown
}

export interface ConfigResult<T> {
  /**
   * Validated configuration object
   */
  config: T

  /**
   * Path to the config file that was loaded
   */
  filepath: string | null

  /**
   * Whether config came from user directory (~/.config)
   */
  isUserConfig: boolean

  /**
   * Whether config came from project directory
   */
  isProjectConfig: boolean
}

/**
 * Load and validate configuration with cosmiconfig and Zod
 */
export async function loadConfig<T>(
  options: LoadConfigOptions<T>
): Promise<ConfigResult<T>> {
  const {
    moduleName,
    schema,
    searchFrom = process.cwd(),
    stopDir,
    mergeUserConfig = true,
    defaults = {},
    transform,
  } = options

  // Create cosmiconfig explorer
  const explorer = cosmiconfig(moduleName, {
    stopDir,
    searchPlaces: [
      'package.json',
      `.${moduleName}rc`,
      `.${moduleName}rc.json`,
      `.${moduleName}rc.yaml`,
      `.${moduleName}rc.yml`,
      `.${moduleName}rc.js`,
      `.${moduleName}rc.cjs`,
      `.${moduleName}.config.js`,
      `.${moduleName}.config.cjs`,
    ],
  })

  // Load project config
  let projectResult: CosmiconfigResult = null
  try {
    projectResult = await explorer.search(searchFrom)
  } catch (error) {
    throw new Error(
      `Failed to load project config: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  // Load user config from home directory
  let userResult: CosmiconfigResult = null
  if (mergeUserConfig) {
    const userConfigDir = process.env.XDG_CONFIG_HOME || 
      `${process.env.HOME}/.config`
    const userExplorer = cosmiconfig(moduleName, {
      stopDir: userConfigDir,
    })
    
    try {
      userResult = await userExplorer.search(`${userConfigDir}/${moduleName}`)
    } catch {
      // User config is optional, ignore errors
    }
  }

  // Merge configs: defaults < user < project
  let mergedConfig = { ...defaults }
  
  if (userResult?.config) {
    mergedConfig = { ...mergedConfig, ...userResult.config }
  }
  
  if (projectResult?.config) {
    mergedConfig = { ...mergedConfig, ...projectResult.config }
  }

  // Apply transform if provided
  const configToValidate = transform 
    ? transform(mergedConfig) 
    : mergedConfig

  // Validate with Zod
  const parseResult = schema.safeParse(configToValidate)
  
  if (!parseResult.success) {
    const errors = parseResult.error.errors
      .map(err => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n')
    
    throw new Error(`Invalid configuration:\n${errors}`)
  }

  return {
    config: parseResult.data,
    filepath: projectResult?.filepath ?? userResult?.filepath ?? null,
    isUserConfig: !!userResult && !projectResult,
    isProjectConfig: !!projectResult,
  }
}

/**
 * Synchronous version of loadConfig
 */
export function loadConfigSync<T>(
  options: LoadConfigOptions<T>
): ConfigResult<T> {
  const {
    moduleName,
    schema,
    searchFrom = process.cwd(),
    stopDir,
    mergeUserConfig = true,
    defaults = {},
    transform,
  } = options

  const explorer = cosmiconfigSync(moduleName, {
    stopDir,
    searchPlaces: [
      'package.json',
      `.${moduleName}rc`,
      `.${moduleName}rc.json`,
      `.${moduleName}rc.yaml`,
      `.${moduleName}rc.yml`,
      `.${moduleName}rc.js`,
      `.${moduleName}rc.cjs`,
      `.${moduleName}.config.js`,
      `.${moduleName}.config.cjs`,
    ],
  })

  let projectResult: CosmiconfigResult = null
  try {
    projectResult = explorer.search(searchFrom)
  } catch (error) {
    throw new Error(
      `Failed to load project config: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  let userResult: CosmiconfigResult = null
  if (mergeUserConfig) {
    const userConfigDir = process.env.XDG_CONFIG_HOME || 
      `${process.env.HOME}/.config`
    const userExplorer = cosmiconfigSync(moduleName, {
      stopDir: userConfigDir,
    })
    
    try {
      userResult = userExplorer.search(`${userConfigDir}/${moduleName}`)
    } catch {
      // User config is optional
    }
  }

  let mergedConfig = { ...defaults }
  
  if (userResult?.config) {
    mergedConfig = { ...mergedConfig, ...userResult.config }
  }
  
  if (projectResult?.config) {
    mergedConfig = { ...mergedConfig, ...projectResult.config }
  }

  const configToValidate = transform 
    ? transform(mergedConfig) 
    : mergedConfig

  const parseResult = schema.safeParse(configToValidate)
  
  if (!parseResult.success) {
    const errors = parseResult.error.errors
      .map(err => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n')
    
    throw new Error(`Invalid configuration:\n${errors}`)
  }

  return {
    config: parseResult.data,
    filepath: projectResult?.filepath ?? userResult?.filepath ?? null,
    isUserConfig: !!userResult && !projectResult,
    isProjectConfig: !!projectResult,
  }
}
