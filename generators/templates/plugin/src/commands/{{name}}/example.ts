import { Command, Flags } from '@oclif/core'
import { logger } from '@cli-ops/shared-logger'
import { ExitCodes } from '@cli-ops/shared-exit-codes'

export default class {{pascalCase name}}Example extends Command {
  static override description = 'Example command for {{name}} plugin'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --verbose',
  ]

  static override flags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'Show verbose output',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse({{pascalCase name}}Example)

    try {
      if (flags.verbose) {
        logger.debug('Running in verbose mode')
      }

      logger.info('Executing example command')
      
      // TODO: Implement your plugin logic here
      this.log('✓ {{pascalCase name}} plugin is working!')
      
    } catch (error) {
      logger.error('Command failed', { error })
      this.error('Command execution failed', { exit: ExitCodes.GENERAL_ERROR })
    }
  }
}
