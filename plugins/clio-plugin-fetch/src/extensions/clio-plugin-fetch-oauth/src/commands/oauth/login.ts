import { BasePluginCommand } from '@cli-ops/shared-plugins'
import { Flags } from '@oclif/core'
import { createStructuredLogger } from '@cli-ops/shared-logger'
import { createSpinner } from '@cli-ops/shared-ui'

/**
 * Initiate OAuth 2.0 authentication flow
 */
export default class OAuthLogin extends BasePluginCommand {
  static override pluginName = '@cli-ops/clio-plugin-fetch-oauth'
  static override pluginVersion = '2.0.0'

  static override description = 'Authenticate using OAuth 2.0'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --provider github',
    '<%= config.bin %> <%= command.id %> --provider google --scopes "email profile"',
  ]

  static override flags = {
    provider: Flags.string({
      char: 'p',
      description: 'OAuth provider (github, google, gitlab)',
      options: ['github', 'google', 'gitlab'],
      default: 'github',
    }),
    scopes: Flags.string({
      char: 's',
      description: 'OAuth scopes (space-separated)',
      default: 'read:user',
    }),
    port: Flags.integer({
      description: 'Local server port for callback',
      default: 8080,
    }),
  }

  private logger = createStructuredLogger({ name: 'oauth-login' })

  override async run(): Promise<void> {
    const { flags } = await this.parse(OAuthLogin)

    this.logger.info('Starting OAuth flow', {
      provider: flags.provider,
      scopes: flags.scopes,
    })

    const spinner = createSpinner()
    spinner.start(`Opening ${flags.provider} login page...`)

    try {
      // Simulate OAuth flow
      await this.simulateOAuthFlow(flags)

      spinner.succeed(`Successfully authenticated with ${flags.provider}`)

      // Emit plugin event
      this.emitPluginEvent('oauth:login:success', {
        provider: flags.provider,
        timestamp: new Date().toISOString(),
      })

      this.log(`\n✓ Access token stored in config`)
      this.log(`✓ Scopes: ${flags.scopes}`)
    } catch (error) {
      spinner.fail('Authentication failed')
      throw error
    }
  }

  private async simulateOAuthFlow(flags: {
    provider: string
    scopes: string
    port: number
  }): Promise<void> {
    // Simulate opening browser
    await new Promise((resolve) => setTimeout(resolve, 500))
    this.log(`\n🌐 Opening browser to: https://${flags.provider}.com/oauth/authorize`)

    // Simulate waiting for callback
    await new Promise((resolve) => setTimeout(resolve, 1500))
    this.log(`✓ Authorization received`)

    // Simulate token exchange
    await new Promise((resolve) => setTimeout(resolve, 500))
    this.log(`✓ Access token obtained`)
  }
}
