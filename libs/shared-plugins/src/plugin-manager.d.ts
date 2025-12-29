/**
 * Plugin management utilities
 */
import { Plugin } from '@oclif/core'
import type { PluginMetadata } from '@cli-ops/shared-types'
import { type EventBus } from '@cli-ops/shared-ipc'
export interface PluginDiscoveryOptions {
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
export interface PluginValidationResult {
  valid: boolean
  errors: string[]
}
/**
 * Plugin manager for discovering, loading, and managing plugins
 */
export declare class PluginManager {
  private eventBus
  private logger
  private loadedPlugins
  constructor()
  /**
   * Get event bus for plugin communication
   */
  getEventBus(): EventBus
  /**
   * Validate a plugin's metadata
   */
  validatePlugin(metadata: PluginMetadata): PluginValidationResult
  /**
   * Register a loaded plugin
   */
  registerPlugin(plugin: Plugin, metadata?: PluginMetadata): void
  /**
   * Unregister a plugin
   */
  unregisterPlugin(name: string): void
  /**
   * Get a loaded plugin by name
   */
  getPlugin(name: string): Plugin | undefined
  /**
   * Get all loaded plugins
   */
  getLoadedPlugins(): Map<string, Plugin>
  /**
   * Check if a plugin is loaded
   */
  isPluginLoaded(name: string): boolean
  /**
   * Get plugin count
   */
  getPluginCount(): number
  /**
   * Clear all loaded plugins
   */
  clear(): void
  /**
   * Destroy plugin manager
   */
  destroy(): void
}
/**
 * Get or create global plugin manager
 */
export declare function getPluginManager(): PluginManager
/**
 * Create a new plugin manager instance
 */
export declare function createPluginManager(): PluginManager
//# sourceMappingURL=plugin-manager.d.ts.map
