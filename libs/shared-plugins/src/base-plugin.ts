/**
 * Base plugin class for CLI plugins
 *
 * Extend this class to create custom plugins that integrate with the CLI ecosystem
 */

import type { PluginMetadata } from '@cli-ops/shared-types'
import { Command } from '@oclif/core'

import { type EventBus, getPluginManager } from './plugin-manager'

/**
 * Hook handler function type
 */
type THookHandler<T = unknown> = (data: T) => void | Promise<void>

/**
 * Base plugin class that provides common functionality
 */
export abstract class BasePlugin {
  /**
   * Plugin metadata
   */
  abstract readonly metadata: PluginMetadata

  /**
   * Registry of defined extension hooks
   * Maps hook name to array of registered handlers
   */
  private extensionHooks: Map<string, THookHandler[]> = new Map()

  /**
   * Set of defined hook names (for validation)
   */
  private definedHooks: Set<string> = new Set()

  /**
   * Initialize the plugin
   * Called when the plugin is loaded
   */
  async init(): Promise<void> {
    // Override in subclass if needed
  }

  /**
   * Cleanup resources
   * Called when the plugin is unloaded
   */
  async destroy(): Promise<void> {
    // Override in subclass if needed
  }

  /**
   * Define an extension hook that extensions can register handlers for
   *
   * Parent plugins should call this method in their constructor or init()
   * to declare extension points where extensions can inject behavior.
   *
   * @param hookName - The name of the hook (e.g., 'task:beforeCreate')
   *
   * @example
   * ```typescript
   * class TasksPlugin extends BasePlugin {
   *   async init() {
   *     // Define hooks for extensions
   *     this.defineExtensionHook('task:beforeCreate')
   *     this.defineExtensionHook('task:afterCreate')
   *     this.defineExtensionHook('task:beforeComplete')
   *     this.defineExtensionHook('task:afterComplete')
   *   }
   * }
   * ```
   */
  protected defineExtensionHook(hookName: string): void {
    this.definedHooks.add(hookName)
    if (!this.extensionHooks.has(hookName)) {
      this.extensionHooks.set(hookName, [])
    }
  }

  /**
   * Call an extension hook, executing all registered handlers sequentially
   *
   * Handlers are executed in the order they were registered.
   * If a handler throws an error, execution stops and the error is propagated.
   *
   * @param hookName - The name of the hook to call
   * @param data - Data to pass to hook handlers
   *
   * @example
   * ```typescript
   * async createTask(taskData: TaskCreateData): Promise<Task> {
   *   // Allow extensions to modify or validate before creation
   *   await this.callExtensionHook('task:beforeCreate', taskData)
   *
   *   const task = await this.storage.create(taskData)
   *
   *   // Allow extensions to react after creation
   *   await this.callExtensionHook('task:afterCreate', task)
   *
   *   return task
   * }
   * ```
   */
  protected async callExtensionHook<T = unknown>(hookName: string, data: T): Promise<void> {
    const handlers = this.extensionHooks.get(hookName)
    if (!handlers || handlers.length === 0) {
      return
    }

    // Execute handlers sequentially
    for (const handler of handlers) {
      await handler(data)
    }
  }

  /**
   * Register an extension hook handler (called by extensions)
   *
   * This is an internal method called by BaseExtensionPlugin.
   * Extensions should use BaseExtensionPlugin.registerHook() instead.
   *
   * @internal
   */
  registerExtensionHookHandler<T = unknown>(hookName: string, handler: THookHandler<T>): void {
    // Validate hook is defined
    if (!this.definedHooks.has(hookName)) {
      const availableHooks = Array.from(this.definedHooks).join(', ')
      throw new Error(
        `Hook '${hookName}' is not defined by plugin '${this.metadata.name}'.\n` +
          `Available hooks: ${availableHooks || '(none)'}`,
      )
    }

    // Get or create handler array
    const handlers = this.extensionHooks.get(hookName) || []
    handlers.push(handler as THookHandler)
    this.extensionHooks.set(hookName, handlers)
  }

  /**
   * Get all defined hook names for this plugin
   *
   * @returns Array of hook names
   */
  getDefinedHooks(): string[] {
    return Array.from(this.definedHooks)
  }

  /**
   * Get the plugin event bus for inter-plugin communication
   */
  protected getEventBus(): EventBus {
    return getPluginManager().getEventBus()
  }

  /**
   * Emit a plugin event
   */
  protected emit(event: string, data?: unknown): void {
    this.getEventBus().emit(event, data)
  }

  /**
   * Listen to a plugin event
   */
  protected on(event: string, handler: (data: unknown) => void): void {
    this.getEventBus().on(event, handler)
  }

  /**
   * Listen to a plugin event once
   */
  protected once(event: string, handler: (data: unknown) => void): void {
    this.getEventBus().once(event, handler)
  }

  /**
   * Remove event listener
   */
  protected off(event: string, handler: (data: unknown) => void): void {
    this.getEventBus().off(event, handler)
  }
}

/**
 * Base command class for plugin commands
 *
 * Plugin commands should extend this class to inherit common functionality
 * and ensure compatibility with the CLI framework
 */
export abstract class BasePluginCommand extends Command {
  /**
   * Plugin name this command belongs to
   */
  static override pluginName?: string

  /**
   * Plugin version
   */
  static pluginVersion?: string

  /**
   * Get the plugin event bus
   */
  protected getPluginEventBus(): EventBus {
    return getPluginManager().getEventBus()
  }

  /**
   * Emit a plugin event
   */
  protected emitPluginEvent(event: string, data?: unknown): void {
    this.getPluginEventBus().emit(event, data)
  }
}
