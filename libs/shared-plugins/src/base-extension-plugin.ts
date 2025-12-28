/**
 * Base extension plugin class for plugins that extend other plugins
 *
 * Extension plugins depend on a parent plugin and can register hooks
 * to inject behavior at specific points in the parent's lifecycle.
 */

import { BasePlugin } from './base-plugin'
import { getPluginManager } from './plugin-manager'

/**
 * Hook handler function type
 */
export type THookHandler<T = unknown> = (data: T) => void | Promise<void>

/**
 * Base class for extension plugins
 *
 * Extension plugins extend existing base plugins by:
 * - Declaring a parent plugin dependency
 * - Registering hooks at parent plugin extension points
 * - Accessing parent plugin APIs in a type-safe manner
 *
 * @example
 * ```typescript
 * export class JiraPlugin extends BaseExtensionPlugin {
 *   readonly metadata = {
 *     name: '@cli-ops/clio-plugin-tasks-jira',
 *     version: '3.0.0',
 *     description: 'Jira integration for task management'
 *   }
 *
 *   override async init(): Promise<void> {
 *     // Register this extension with its parent
 *     await this.registerExtension('@cli-ops/clio-plugin-tasks')
 *
 *     // Register hooks for parent plugin extension points
 *     this.registerHook('task:beforeCreate', this.enrichTaskWithJira.bind(this))
 *     this.registerHook('task:afterComplete', this.syncToJira.bind(this))
 *
 *     // Access parent plugin in a type-safe manner
 *     const parentPlugin = this.getParentPlugin<TasksPlugin>()
 *     if (parentPlugin) {
 *       // Use parent's public APIs
 *     }
 *   }
 *
 *   private async enrichTaskWithJira(data: TaskCreateData): Promise<void> {
 *     // Extension logic here
 *   }
 * }
 * ```
 */
export abstract class BaseExtensionPlugin extends BasePlugin {
  private parentPluginName?: string

  /**
   * Register this extension with its parent plugin
   *
   * This method:
   * 1. Validates that the parent plugin is loaded
   * 2. Stores the parent reference for later access
   * 3. Registers the extension with the plugin manager
   *
   * @param parentName - The name of the parent plugin (e.g., '@cli-ops/clio-plugin-tasks')
   * @throws Error if parent plugin is not loaded
   */
  protected registerExtension(parentName: string): void {
    const pluginManager = getPluginManager()

    // Validate parent plugin is loaded
    if (!pluginManager.isPluginLoaded(parentName)) {
      throw new Error(
        `Cannot register extension '${this.metadata.name}': parent plugin '${parentName}' is not loaded.\n\n` +
          `To fix this issue:\n` +
          `1. Install the parent plugin: clio plugins:install ${parentName}\n` +
          `2. Ensure the parent plugin loads before this extension\n`,
      )
    }

    this.parentPluginName = parentName

    // Register this extension with the plugin manager
    pluginManager.registerExtension(this.metadata.name, parentName)
  }

  /**
   * Get the parent plugin instance with type safety
   *
   * @returns The parent plugin instance, or undefined if not registered
   *
   * @example
   * ```typescript
   * const tasksPlugin = this.getParentPlugin<TasksPlugin>()
   * if (tasksPlugin) {
   *   const tasks = await tasksPlugin.getAllTasks()
   * }
   * ```
   */
  protected getParentPlugin<T extends BasePlugin>(): T | undefined {
    if (!this.parentPluginName) {
      return undefined
    }

    return getPluginManager().getPlugin(this.parentPluginName) as T | undefined
  }

  /**
   * Register a hook handler with the parent plugin
   *
   * Hooks are extension points defined by parent plugins where extensions
   * can inject custom behavior. Hooks are executed sequentially in the
   * order they were registered.
   *
   * @param hookName - The name of the hook (e.g., 'task:beforeCreate')
   * @param handler - The async function to execute when the hook is called
   *
   * @example
   * ```typescript
   * this.registerHook('task:beforeCreate', async (data: TaskCreateData) => {
   *   // Validate or modify task data before creation
   *   if (data.jiraId) {
   *     data.metadata.jiraLink = await this.fetchJiraLink(data.jiraId)
   *   }
   * })
   * ```
   */
  protected registerHook<T = unknown>(hookName: string, handler: THookHandler<T>): void {
    if (!this.parentPluginName) {
      throw new Error(
        `Cannot register hook '${hookName}': extension must call registerExtension() first`,
      )
    }

    const parentPlugin = this.getParentPlugin<BasePlugin>()
    if (!parentPlugin) {
      throw new Error(
        `Cannot register hook '${hookName}': parent plugin '${this.parentPluginName}' not found`,
      )
    }

    // Register the hook with the parent plugin
    parentPlugin.registerExtensionHookHandler(hookName, handler)
  }
}
