import { BaseCommand } from '@cli-ops/shared-commands'
import { SUCCESS } from '@cli-ops/shared-exit-codes'

export default class ConfigList extends BaseCommand {
  static override description = 'List all configuration values'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    ...BaseCommand.baseFlags,
  }

  protected async execute(): Promise<void> {
    await this.parse(ConfigList)
    this.logger.warn('Config commands not yet implemented')

    this.exit(SUCCESS)
  }

  // TODO: Uncomment when config loading is implemented
  // private printConfig(obj: any, prefix = ''): void {
  //   for (const [key, value] of Object.entries(obj)) {
  //     const fullKey = prefix ? `${prefix}.${key}` : key
  //
  //     if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
  //       this.printConfig(value, fullKey)
  //     } else {
  //       this.logger.info(`  ${fullKey}: ${JSON.stringify(value)}`)
  //     }
  //   }
  // }
}
