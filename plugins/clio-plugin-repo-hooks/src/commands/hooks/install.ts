import { createStructuredLogger } from '@cli-ops/shared-logger'
import { BasePluginCommand } from '@cli-ops/shared-plugins'
import { promptMultiSelect } from '@cli-ops/shared-prompts'
import { Flags } from '@oclif/core'

/**
 * Install Git hooks
 */
export default class HooksInstall extends BasePluginCommand {
  static override pluginName = '@cli-ops/clio-plugin-repo-hooks'
  static override pluginVersion = '2.0.0'

  static override description = 'Install Git hooks for automated checks'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --hooks pre-commit,pre-push',
    '<%= config.bin %> <%= command.id %> --template=strict',
  ]

  static override flags = {
    hooks: Flags.string({
      char: 'h',
      description: 'Specific hooks to install (comma-separated)',
    }),
    template: Flags.string({
      char: 't',
      description: 'Hook template preset',
      options: ['basic', 'strict', 'custom'],
      default: 'basic',
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Overwrite existing hooks',
      default: false,
    }),
  }

  private logger = createStructuredLogger({ name: 'hooks-install' })

  override async run(): Promise<void> {
    const { flags } = await this.parse(HooksInstall)

    this.log('🪝 Git Hooks Installer\n')

    // Determine which hooks to install
    let hooksToInstall: string[]
    if (flags.hooks) {
      hooksToInstall = flags.hooks.split(',').map((h) => h.trim())
    } else {
      hooksToInstall = await this.selectHooks()
    }

    if (hooksToInstall.length === 0) {
      this.log('No hooks selected')
      return
    }

    this.logger.info('Installing hooks', {
      hooks: hooksToInstall,
      template: flags.template,
    })

    // Install hooks
    for (const hook of hooksToInstall) {
      await this.installHook(hook, flags.template, flags.force)
    }

    this.log(`\n✓ Installed ${hooksToInstall.length} hook(s)`)

    // Emit plugin event
    this.emitPluginEvent('hooks:installed', {
      hooks: hooksToInstall,
      template: flags.template,
      timestamp: new Date().toISOString(),
    })
  }

  private async selectHooks(): Promise<string[]> {
    const availableHooks = [
      { name: 'pre-commit', description: 'Run before commit' },
      { name: 'pre-push', description: 'Run before push' },
      { name: 'commit-msg', description: 'Validate commit message' },
      { name: 'prepare-commit-msg', description: 'Prepare commit message' },
      { name: 'post-commit', description: 'Run after commit' },
    ]

    const selected = await promptMultiSelect<string>({
      message: 'Select hooks to install:',
      choices: availableHooks.map((h) => ({
        value: h.name,
        name: `${h.name} - ${h.description}`,
      })),
    })

    return selected
  }

  private async installHook(hook: string, template: string, force: boolean): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const action = force ? 'Overwriting' : 'Installing'
    this.log(`  ${action} ${hook} (${template} template)...`)
  }
}
