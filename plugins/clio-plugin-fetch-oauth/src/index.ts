import { BaseExtensionPlugin } from '@cli-ops/shared-plugins'
import type { PluginMetadata } from '@cli-ops/shared-types'

/**
 * OAuth 2.0 authentication plugin for clio fetch
 */
export class OAuthPlugin extends BaseExtensionPlugin {
  readonly metadata: PluginMetadata = {
    name: '@cli-ops/clio-plugin-fetch-oauth',
    version: '3.0.0',
    description: 'OAuth 2.0 authentication for API requests',
  }

  override async init(): Promise<void> {
    // Register this extension with its parent plugin
    this.registerExtension('@cli-ops/clio-plugin-fetch')

    // Register hooks for parent plugin extension points
    this.registerHook('fetch:beforeRequest', this.injectOAuthToken.bind(this))
    this.registerHook('fetch:afterResponse', this.handleAuthErrors.bind(this))

    // Keep event listeners for backward compatibility
    this.on('request:before', this.injectAuthHeader.bind(this))

    this.emit('oauth:plugin:ready', {
      version: this.metadata.version,
    })
  }

  override async destroy(): Promise<void> {
    this.off('request:before', this.injectAuthHeader.bind(this))
  }

  // Hook handlers (new primary interface)
  private injectOAuthToken(_data: Record<string, unknown>): void {
    // Inject OAuth token into request headers
    if (!_data['headers']) {
      _data['headers'] = {}
    }
    // Would fetch actual token from storage
    // Token injection logic would go here
  }

  private handleAuthErrors(_data: Record<string, unknown>): void {
    // Handle authentication errors and potentially refresh token
    const statusCode = _data['statusCode'] as number | undefined
    if (statusCode === 401 || statusCode === 403) {
      // Would handle auth error and refresh token
    }
  }

  // Event handler (legacy/compatibility)
  private injectAuthHeader(_data: unknown): void {
    // Legacy event-based auth header injection
    // Would inject OAuth header here
  }
}

export default OAuthPlugin
