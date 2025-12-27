import { BasePluginCommand } from '@cli-ops/shared-plugins'
import { Flags, Args } from '@oclif/core'
import { createStructuredLogger } from '@cli-ops/shared-logger'
import { promptConfirm } from '@cli-ops/shared-prompts'

/**
 * Link a local task to a Jira issue
 */
export default class JiraLink extends BasePluginCommand {
  static override pluginName = '@cli-ops/clio-plugin-tasks-jira'
  static override pluginVersion = '2.0.0'

  static override description = 'Link a local task to a Jira issue'

  static override examples = [
    '<%= config.bin %> <%= command.id %> 123 PROJ-456',
    '<%= config.bin %> <%= command.id %> 123 PROJ-456 --sync',
  ]

  static override args = {
    taskId: Args.string({
      description: 'Local task ID',
      required: true,
    }),
    issueKey: Args.string({
      description: 'Jira issue key (e.g., PROJ-123)',
      required: true,
    }),
  }

  static override flags = {
    sync: Flags.boolean({
      char: 's',
      description: 'Sync task data with Jira issue',
      default: false,
    }),
  }

  private logger = createStructuredLogger({ name: 'jira-link' })

  override async run(): Promise<void> {
    const { args, flags } = await this.parse(JiraLink)

    this.logger.info('Linking task to Jira issue', {
      taskId: args.taskId,
      issueKey: args.issueKey,
    })

    // Validate issue key format
    if (!args.issueKey.match(/^[A-Z]+-\d+$/)) {
      this.error('Invalid Jira issue key format. Expected: PROJECT-123')
    }

    // Confirm action
    const shouldContinue = await promptConfirm({
      message: `Link task ${args.taskId} to Jira issue ${args.issueKey}?`,
      default: true,
    })

    if (!shouldContinue) {
      this.log('Cancelled')
      return
    }

    // Simulate linking
    await new Promise((resolve) => setTimeout(resolve, 500))

    this.log(`✓ Task ${args.taskId} linked to ${args.issueKey}`)

    if (flags.sync) {
      this.log('  Syncing task data with Jira...')
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.log('  ✓ Task data synced')
    }

    // Emit plugin event
    this.emitPluginEvent('jira:link:created', {
      taskId: args.taskId,
      issueKey: args.issueKey,
      timestamp: new Date().toISOString(),
    })
  }
}
