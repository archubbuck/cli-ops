'use strict'
/**
 * Base plugin class for CLI plugins
 *
 * Extend this class to create custom plugins that integrate with the CLI ecosystem
 */
Object.defineProperty(exports, '__esModule', { value: true })
exports.BasePluginCommand = exports.BasePlugin = void 0
const core_1 = require('@oclif/core')
const plugin_manager_1 = require('./plugin-manager')
/**
 * Base plugin class that provides common functionality
 */
class BasePlugin {
  /**
   * Initialize the plugin
   * Called when the plugin is loaded
   */
  async init() {
    // Override in subclass if needed
  }
  /**
   * Cleanup resources
   * Called when the plugin is unloaded
   */
  async destroy() {
    // Override in subclass if needed
  }
  /**
   * Get the plugin event bus for inter-plugin communication
   */
  getEventBus() {
    return (0, plugin_manager_1.getPluginManager)().getEventBus()
  }
  /**
   * Emit a plugin event
   */
  emit(event, data) {
    this.getEventBus().emit(event, data)
  }
  /**
   * Listen to a plugin event
   */
  on(event, handler) {
    this.getEventBus().on(event, handler)
  }
  /**
   * Listen to a plugin event once
   */
  once(event, handler) {
    this.getEventBus().once(event, handler)
  }
  /**
   * Remove event listener
   */
  off(event, handler) {
    this.getEventBus().off(event, handler)
  }
}
exports.BasePlugin = BasePlugin
/**
 * Base command class for plugin commands
 *
 * Plugin commands should extend this class to inherit common functionality
 * and ensure compatibility with the CLI framework
 */
class BasePluginCommand extends core_1.Command {
  /**
   * Plugin name this command belongs to
   */
  static pluginName
  /**
   * Plugin version
   */
  static pluginVersion
  /**
   * Get the plugin event bus
   */
  getPluginEventBus() {
    return (0, plugin_manager_1.getPluginManager)().getEventBus()
  }
  /**
   * Emit a plugin event
   */
  emitPluginEvent(event, data) {
    this.getPluginEventBus().emit(event, data)
  }
}
exports.BasePluginCommand = BasePluginCommand
//# sourceMappingURL=base-plugin.js.map
