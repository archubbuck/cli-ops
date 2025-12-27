import { BasePlugin } from '@cli-ops/shared-plugins'
import type { PluginMetadata } from '@cli-ops/shared-types'

/**
 * OAuth 2.0 authentication plugin for clio fetch
 */
export class OAuthPlugin extends BasePlugin {
  readonly metadata: PluginMetadata = {
    name: '@cli-ops/clio-plugin-fetch-oauth',
    version: '2.0.0',
    description: 'OAuth 2.0 authentication for API requests',
  }

  override async init(): Promise<void> {
    // Listen for request events to inject auth headers
    this.on('request:before', this.injectAuthHeader.bind(this))

    this.emit('oauth:plugin:ready', {
      version: this.metadata.version,
    })
  }

  override async destroy(): Promise<void> {
    this.off('request:before', this.injectAuthHeader.bind(this))
  }

  private injectAuthHeader(data: unknown): void {
    // Automatically add OAuth token to requests
    console.log('Injecting OAuth header into request:', data)
  }
}

export default OAuthPlugin
