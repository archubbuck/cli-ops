import { BaseCommand } from '@cli-ops/shared-commands'
import { SUCCESS } from '@cli-ops/shared-exit-codes'
import { Args } from '@oclif/core'

export default class ConfigGet extends BaseCommand {
  static override description = 'Get a configuration value'

  static override examples = [
    '<%= config.bin %> <%= command.id %> editor',
    '<%= config.bin %> <%= command.id %> log.level',
  ]

  static override args = {
    key: Args.string({
      description: 'Configuration key to retrieve',
      required: true,
    }),
  }

  static override flags = {
    ...BaseCommand.baseFlags,
  }

  protected async execute(): Promise<void> {
    const { args } = await this.parse(ConfigGet)
    this.logger.warn('Config commands not yet implemented')

    this.logger.info(`Config key: ${args.key}`)
    this.exit(SUCCESS)
  }

  // TODO: Uncomment when config loading is implemented
  // private getNestedValue(obj: any, path: string): any {
  //   const keys = path.split('.')
  //   let current = obj
  //
  //   for (const key of keys) {
  //     if (current === null || current === undefined) {
  //       return undefined
  //     }
  //     current = current[key]
  //   }
  //
  //   return current
  // }
}
