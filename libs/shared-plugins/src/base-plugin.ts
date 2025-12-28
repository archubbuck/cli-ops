/**
 * Base plugin class for CLI plugins
 *
 * Extend this class to create custom plugins that integrate with the CLI ecosystem
 */

import { Command } from '@oclif/core'
import type { PluginMetadata } from '@cli-ops/shared-types'
import { getPluginManager } from './plugin-manager'

/**
 * Base plugin class that provides common functionality
 */
export abstract class BasePlugin {
  /**
   * Plugin metadata
   */
  abstract readonly metadata: PluginMetadata

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
   * Get the plugin event bus for inter-plugin communication
   */
  protected getEventBus() {
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
  protected getPluginEventBus() {
    return getPluginManager().getEventBus()
  }

  /**
   * Emit a plugin event
   */
  protected emitPluginEvent(event: string, data?: unknown): void {
    this.getPluginEventBus().emit(event, data)
  }
}
