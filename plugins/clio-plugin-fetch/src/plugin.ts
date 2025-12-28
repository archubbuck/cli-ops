import { BasePlugin } from '@cli-ops/shared-plugins'
import type { PluginMetadata } from '@cli-ops/shared-types'

/**
 * Fetch plugin - Base plugin for HTTP requests
 */
export class FetchPlugin extends BasePlugin {
  readonly metadata: PluginMetadata = {
    name: '@cli-ops/clio-plugin-fetch',
    version: '3.0.0',
    description: 'HTTP client with advanced features',
  }

  override async init(): Promise<void> {
    // Define extension hooks that extensions can register handlers for
    this.defineExtensionHook('fetch:beforeRequest')
    this.defineExtensionHook('fetch:afterResponse')
    this.defineExtensionHook('fetch:onError')
  }

  /**
   * Call the beforeRequest hook
   * Should be called before making HTTP request
   */
  async callBeforeRequestHook(requestData: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('fetch:beforeRequest', requestData)
    // Keep event emission for backward compatibility
    this.emit('request:before', requestData)
    this.emit('fetch:beforeRequest', requestData)
  }

  /**
   * Call the afterResponse hook
   * Should be called after receiving HTTP response
   */
  async callAfterResponseHook(responseData: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('fetch:afterResponse', responseData)
    // Keep event emission for backward compatibility
    this.emit('request:after', responseData)
    this.emit('fetch:afterResponse', responseData)
  }

  /**
   * Call the onError hook
   * Should be called when request fails
   */
  async callOnErrorHook(error: Error): Promise<void> {
    await this.callExtensionHook('fetch:onError', error)
    this.emit('request:error', error)
    this.emit('fetch:onError', error)
  }
}

// Export singleton instance
let fetchPluginInstance: FetchPlugin | undefined

export function getFetchPlugin(): FetchPlugin {
  if (!fetchPluginInstance) {
    fetchPluginInstance = new FetchPlugin()
  }
  return fetchPluginInstance
}
