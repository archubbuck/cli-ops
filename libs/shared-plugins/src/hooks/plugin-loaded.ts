/**
 * Plugin lifecycle hooks
 */

import type { Hook } from '@oclif/core'
import { getPluginManager } from '../plugin-manager'

/**
 * Hook called when a plugin is loaded
 */
export const pluginLoaded: Hook<'init'> = async function () {
  const manager = getPluginManager()
  const eventBus = manager.getEventBus()

  // Listen for plugin loaded events and log them
  eventBus.on('plugin:loaded', (data: unknown) => {
    const pluginData = data as { name: string; version: string }
    this.log(`Plugin loaded: ${pluginData.name}@${pluginData.version}`)
  })

  eventBus.on('plugin:unloaded', (data: unknown) => {
    const pluginData = data as { name: string }
    this.log(`Plugin unloaded: ${pluginData.name}`)
  })
}

export default pluginLoaded
