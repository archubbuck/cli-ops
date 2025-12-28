import { BaseCommand } from '@cli-ops/shared-commands'
import { SUCCESS } from '@cli-ops/shared-exit-codes'
import { promptList } from '@cli-ops/shared-prompts'
import { createSpinner } from '@cli-ops/shared-ui'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export default class Setup extends BaseCommand {
  static override description = 'Set up shell completions and other configuration'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    ...BaseCommand.baseFlags,
  }

  protected async execute(): Promise<void> {
    this.logger.info('Welcome to clio setup!')
    this.logger.info('')

    // Prompt for shell selection
    const shell = await promptList({
      message: 'Which shell do you use?',
      choices: [
        { name: 'Bash', value: 'bash' },
        { name: 'Zsh', value: 'zsh' },
        { name: 'Fish', value: 'fish' },
        { name: 'PowerShell', value: 'powershell' },
      ],
    })

    // Set up completions
    const spinner = createSpinner({ text: `Setting up ${shell} completions...` }).start()

    try {
      const { stdout, stderr } = await execAsync(`${this.config.bin} autocomplete ${shell}`)

      spinner.succeed(`${shell} completions configured!`)

      // Show instructions from autocomplete command
      if (stdout) {
        this.logger.info('')
        this.logger.info(stdout.trim())
      }

      if (stderr) {
        this.logger.debug(stderr)
      }

      this.logger.info('')
      this.logger.info(
        '✅ Setup complete! Restart your shell or source your config file to enable completions.',
      )

      this.exit(SUCCESS)
    } catch (error) {
      spinner.fail('Failed to set up completions')

      if (error instanceof Error) {
        this.logger.error(error.message)
      }

      this.logger.info('')
      this.logger.info('You can manually set up completions by running:')
      this.logger.info(`  ${this.config.bin} autocomplete ${shell}`)

      throw error
    }
  }
}
