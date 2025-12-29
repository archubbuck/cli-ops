'use strict'
/**
 * Plugin lifecycle hooks
 */
Object.defineProperty(exports, '__esModule', { value: true })
exports.pluginLoaded = void 0
const plugin_manager_1 = require('../plugin-manager')
/**
 * Hook called when a plugin is loaded
 */
const pluginLoaded = async function () {
  const manager = (0, plugin_manager_1.getPluginManager)()
  const eventBus = manager.getEventBus()
  // Listen for plugin loaded events and log them
  eventBus.on('plugin:loaded', (data) => {
    const pluginData = data
    this.log(`Plugin loaded: ${pluginData.name}@${pluginData.version}`)
  })
  eventBus.on('plugin:unloaded', (data) => {
    const pluginData = data
    this.log(`Plugin unloaded: ${pluginData.name}`)
  })
}
exports.pluginLoaded = pluginLoaded
exports.default = exports.pluginLoaded
//# sourceMappingURL=plugin-loaded.js.map
