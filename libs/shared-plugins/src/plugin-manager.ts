/**
 * Plugin management utilities
 */

import { CLIError } from '@cli-ops/shared-core'
import { createEventBus, type EventBus } from '@cli-ops/shared-ipc'
import { createDebugLogger } from '@cli-ops/shared-logger'
import type { PluginMetadata } from '@cli-ops/shared-types'
import type { Plugin } from '@oclif/core'

import type { BasePlugin } from './base-plugin'

// Re-export EventBus for use in other modules
export type { EventBus }

export interface IPluginDiscoveryOptions {
  /**
   * Plugin directory to scan
   */
  pluginDir?: string

  /**
   * Whether to load user plugins
   */
  loadUserPlugins?: boolean

  /**
   * Whether to load linked plugins
   */
  loadLinkedPlugins?: boolean
}

export interface IPluginValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Plugin manager for discovering, loading, and managing plugins
 */
export class PluginManager {
  private eventBus: EventBus
  private logger = createDebugLogger('plugin-manager')
  private loadedPlugins = new Map<string, Plugin>()
  private extensionRegistry = new Map<string, string[]>() // parent -> extensions[]
  private pluginInstances = new Map<string, BasePlugin>() // Store BasePlugin instances

  constructor() {
    this.eventBus = createEventBus()
  }

  /**
   * Get event bus for plugin communication
   */
  getEventBus(): EventBus {
    return this.eventBus
  }

  /**
   * Validate a plugin's metadata
   */
  validatePlugin(metadata: PluginMetadata): IPluginValidationResult {
    const errors: string[] = []

    if (!metadata.name || typeof metadata.name !== 'string') {
      errors.push('Plugin name is required and must be a string')
    }

    if (!metadata.version || typeof metadata.version !== 'string') {
      errors.push('Plugin version is required and must be a string')
    }

    // Validate name format for scoped packages
    // Supports: @cli-ops/clio-plugin-{name} or {name}-plugin-{feature}
    if (metadata.name) {
      const isScopedPlugin = metadata.name.match(/^@cli-ops\/clio-plugin-[\w-]+$/)
      const isExtensionPlugin = metadata.name.match(/^@cli-ops\/[\w-]+-plugin-[\w-]+$/)
      const isLegacyPlugin = metadata.name.match(/^cli-\w+-plugin-[\w-]+$/)

      if (!isScopedPlugin && !isExtensionPlugin && !isLegacyPlugin) {
        errors.push(
          'Plugin name must follow format: @cli-ops/clio-plugin-{name} or @cli-ops/{base}-plugin-{feature}',
        )
      }
    }

    // Validate version format (semver)
    if (metadata.version && !metadata.version.match(/^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/)) {
      errors.push('Plugin version must follow semantic versioning')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Register a loaded plugin
   */
  registerPlugin(plugin: Plugin, metadata?: PluginMetadata): void {
    const name = plugin.name

    if (this.loadedPlugins.has(name)) {
      throw new CLIError(`Plugin "${name}" is already registered`, { exitCode: 1 })
    }

    // Validate metadata if provided
    if (metadata) {
      const validation = this.validatePlugin(metadata)
      if (!validation.valid) {
        throw new CLIError(`Plugin validation failed: ${validation.errors.join(', ')}`, {
          exitCode: 1,
        })
      }

      // Check if this is an extension plugin
      const extensionMatch = name.match(/^@cli-ops\/(clio-plugin-[\w-]+)-([\w-]+)$/)
      if (extensionMatch) {
        // Read extension metadata from package.json if available
        const pjson = plugin.pjson as Record<string, unknown>
        const clio = pjson?.['clio'] as Record<string, unknown> | undefined
        const extension = clio?.['extension'] as Record<string, unknown> | undefined
        const extensionParent = extension?.['parent'] as string | undefined

        if (extensionParent) {
          // Validate parent plugin is loaded
          if (!this.isPluginLoaded(extensionParent)) {
            throw new CLIError(
              `Cannot load extension plugin '${name}': parent plugin '${extensionParent}' is not loaded.\n\n` +
                `To fix this issue:\n` +
                `1. Install the parent plugin: clio plugins:install ${extensionParent}\n` +
                `2. Ensure the parent plugin loads before this extension\n`,
              { exitCode: 1 },
            )
          }

          // Validate declared hooks exist on parent
          const declaredHooks = (extension?.['hooks'] as string[]) || []
          if (declaredHooks.length > 0) {
            const parentInstance = this.pluginInstances.get(extensionParent)
            if (parentInstance && typeof parentInstance.getDefinedHooks === 'function') {
              const availableHooks = parentInstance.getDefinedHooks()
              const invalidHooks = declaredHooks.filter((h: string) => !availableHooks.includes(h))

              if (invalidHooks.length > 0) {
                this.logger(
                  `Warning: Extension '${name}' declares hooks that don't exist on parent: ${invalidHooks.join(', ')}`,
                )
              }
            }
          }
        }
      }
    }

    this.loadedPlugins.set(name, plugin)
    this.logger(`Registered plugin: ${name}`)

    // Emit plugin loaded event
    this.eventBus.emit('plugin:loaded', {
      name,
      version: plugin.version,
      metadata,
    })
  }

  /**
   * Unregister a plugin
   */
  unregisterPlugin(name: string): void {
    if (!this.loadedPlugins.has(name)) {
      throw new CLIError(`Plugin "${name}" is not registered`, { exitCode: 1 })
    }

    this.loadedPlugins.delete(name)
    this.logger(`Unregistered plugin: ${name}`)

    // Emit plugin unloaded event
    this.eventBus.emit('plugin:unloaded', { name })
  }

  /**
   * Get a loaded plugin by name
   */
  getPlugin(name: string): Plugin | undefined {
    return this.loadedPlugins.get(name)
  }

  /**
   * Get all loaded plugins
   */
  getLoadedPlugins(): Map<string, Plugin> {
    return new Map(this.loadedPlugins)
  }

  /**
   * Check if a plugin is loaded
   */
  isPluginLoaded(name: string): boolean {
    return this.loadedPlugins.has(name)
  }

  /**
   * Register an extension with its parent plugin
   * Called by BaseExtensionPlugin.registerExtension()
   */
  registerExtension(extensionName: string, parentName: string): void {
    const extensions = this.extensionRegistry.get(parentName) || []
    if (!extensions.includes(extensionName)) {
      extensions.push(extensionName)
      this.extensionRegistry.set(parentName, extensions)
      this.logger(`Registered extension '${extensionName}' for parent '${parentName}'`)
    }
  }

  /**
   * Get all extensions for a parent plugin
   */
  getExtensions(parentName: string): string[] {
    return this.extensionRegistry.get(parentName) || []
  }

  /**
   * Store a plugin instance (BasePlugin)
   * Used to access plugin methods like getDefinedHooks()
   */
  storePluginInstance(name: string, instance: BasePlugin): void {
    this.pluginInstances.set(name, instance)
  }

  /**
   * Get a plugin instance by name
   */
  getPluginInstance(name: string): BasePlugin | undefined {
    return this.pluginInstances.get(name)
  }

  /**
   * Get plugin count
   */
  getPluginCount(): number {
    return this.loadedPlugins.size
  }

  /**
   * Clear all loaded plugins
   */
  clear(): void {
    const names = Array.from(this.loadedPlugins.keys())
    for (const name of names) {
      this.unregisterPlugin(name)
    }
  }

  /**
   * Destroy plugin manager
   */
  destroy(): void {
    this.clear()
    this.eventBus.removeAllListeners()
  }
}

/**
 * Global plugin manager instance
 */
let globalPluginManager: PluginManager | undefined

/**
 * Get or create global plugin manager
 */
export function getPluginManager(): PluginManager {
  if (!globalPluginManager) {
    globalPluginManager = new PluginManager()
  }
  return globalPluginManager
}

/**
 * Create a new plugin manager instance
 */
export function createPluginManager(): PluginManager {
  return new PluginManager()
}
