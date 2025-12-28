import { createStructuredLogger } from '@cli-ops/shared-logger'
import { BasePluginCommand } from '@cli-ops/shared-plugins'
import { createSpinner } from '@cli-ops/shared-ui'
import { Flags } from '@oclif/core'

/**
 * Sync tasks with Jira
 */
export default class JiraSync extends BasePluginCommand {
  static override pluginName = '@cli-ops/clio-plugin-tasks-jira'
  static override pluginVersion = '2.0.0'

  static override description = 'Sync tasks with Jira project'

  static override examples = [
    '<%= config.bin %> <%= command.id %> --project PROJ',
    '<%= config.bin %> <%= command.id %> --project PROJ --bidirectional',
  ]

  static override flags = {
    project: Flags.string({
      char: 'p',
      description: 'Jira project key',
      required: true,
    }),
    bidirectional: Flags.boolean({
      char: 'b',
      description: 'Enable two-way sync',
      default: false,
    }),
    dryRun: Flags.boolean({
      description: 'Preview changes without applying them',
      default: false,
    }),
  }

  private logger = createStructuredLogger({ name: 'jira-sync' })

  override async run(): Promise<void> {
    const { flags } = await this.parse(JiraSync)

    this.logger.info('Starting Jira sync', {
      project: flags.project,
      bidirectional: flags.bidirectional,
      dryRun: flags.dryRun,
    })

    const spinner = createSpinner()
    spinner.start(`Syncing with Jira project ${flags.project}...`)

    try {
      // Simulate API call
      await this.simulateSync(flags)

      spinner.succeed(
        `Successfully synced with ${flags.project} (${flags.bidirectional ? 'bidirectional' : 'one-way'})`,
      )

      // Emit plugin event
      this.emitPluginEvent('jira:sync:complete', {
        project: flags.project,
        timestamp: new Date().toISOString(),
      })

      if (flags.dryRun) {
        this.log('\n⚠️  Dry run mode - no changes were applied')
      }
    } catch (error) {
      spinner.fail('Sync failed')
      throw error
    }
  }

  private async simulateSync(flags: {
    project: string
    bidirectional: boolean
    dryRun: boolean
  }): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    this.log(`\n📊 Sync Summary:`)
    this.log(`  Project: ${flags.project}`)
    this.log(`  Direction: ${flags.bidirectional ? 'Two-way ⇄' : 'One-way →'}`)
    this.log(`  Tasks synced: 5`)
    this.log(`  Issues updated: 3`)
    this.log(`  New issues: 2`)
  }
}
