import { Command, Flags } from '@oclif/core'
import { createContext } from '@/shared-core'
import { createDebugLogger, createStructuredLogger } from '@/shared-logger'
import { loadConfig } from '@/shared-config'
import { createHistoryManager } from '@/shared-history'
import type { CLIContext, ConfigSchema, OutputFormat } from '@/shared-types'

/**
 * Enhanced base command with common functionality
 */
export abstract class BaseCommand extends Command {
  protected context!: CLIContext
  protected debug = createDebugLogger('command')
  protected logger = createStructuredLogger({ level: 'info' })
  protected history = createHistoryManager({ cliName: 'cli' })
  protected startTime = Date.now()

  /**
   * Global flags available to all commands
   */
  static baseFlags = {
    format: Flags.string({
      description: 'Output format',
      options: ['json', 'yaml', 'table', 'csv', 'markdown', 'text'],
      default: 'text',
    }),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Verbose output',
      default: false,
    }),
    quiet: Flags.boolean({
      char: 'q',
      description: 'Suppress output',
      default: false,
    }),
    'no-color': Flags.boolean({
      description: 'Disable colors',
      default: false,
    }),
  }

  /**
   * Initialize command
   */
  async init(): Promise<void> {
    await super.init()

    // Create context
    this.context = createContext({
      name: this.config.name,
      version: this.config.version,
    })

    this.debug('Context created: %O', this.context)
  }

  /**
   * Load configuration
   */
  protected async loadConfig<T extends ConfigSchema = ConfigSchema>(): Promise<T> {
    const config = await loadConfig<T>({
      name: this.context.name,
      cwd: this.context.cwd,
    })

    this.debug('Config loaded: %O', config)
    return config
  }

  /**
   * Get output format from flags
   */
  protected getOutputFormat(): OutputFormat {
    const flags = this.parsedFlags as { format?: string }
    return (flags.format as OutputFormat) || 'text'
  }

  /**
   * Check if verbose mode
   */
  protected isVerbose(): boolean {
    const flags = this.parsedFlags as { verbose?: boolean }
    return flags.verbose ?? false
  }

  /**
   * Check if quiet mode
   */
  protected isQuiet(): boolean {
    const flags = this.parsedFlags as { quiet?: boolean }
    return flags.quiet ?? false
  }

  /**
   * Track command in history
   */
  protected async trackCommand(exitCode: number, success: boolean): Promise<void> {
    const duration = Date.now() - this.startTime

    this.history.add({
      command: this.id!,
      args: this.argv,
      flags: this.parsedFlags as Record<string, unknown>,
      timestamp: this.startTime,
      duration,
      exitCode,
      cwd: this.context.cwd,
      user: process.env.USER || 'unknown',
      success,
    })
  }

  /**
   * Run command with error handling
   */
  async run(): Promise<void> {
    try {
      await this.execute()
      await this.trackCommand(0, true)
    } catch (error) {
      await this.trackCommand(1, false)
      throw error
    }
  }

  /**
   * Execute command - implement in subclasses
   */
  protected abstract execute(): Promise<void>

  /**
   * Get parsed flags (type-safe accessor)
   */
  private get parsedFlags(): Record<string, unknown> {
    return (this as unknown as { flags: Record<string, unknown> }).flags || {}
  }

  /**
   * Cleanup on exit
   */
  async finally(): Promise<void> {
    this.history.close()
    await super.finally()
  }
}
