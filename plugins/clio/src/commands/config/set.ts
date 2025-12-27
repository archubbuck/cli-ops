import { Args } from '@oclif/core'
import { BaseCommand } from '@cli-ops/shared-commands'
import { SUCCESS } from '@cli-ops/shared-exit-codes'

export default class ConfigSet extends BaseCommand {
  static override description = 'Set a configuration value'

  static override examples = [
    '<%= config.bin %> <%= command.id %> editor "vim"',
    '<%= config.bin %> <%= command.id %> log.level "debug"',
  ]

  static override args = {
    key: Args.string({
      description: 'Configuration key to set',
      required: true,
    }),
    value: Args.string({
      description: 'Configuration value',
      required: true,
    }),
  }

  static override flags = {
    ...BaseCommand.baseFlags,
  }

  protected async execute(): Promise<void> {
    const { args } = await this.parse(ConfigSet)
    // TODO: Implement config loading and saving
    // const config = await loadConfig(this.context.configDir)
    // this.setNestedValue(config, args.key, args.value)
    // await saveConfig(this.context.configDir, config)
    this.logger.warn('Config commands not yet implemented')

    this.logger.info(`Set ${args.key} = ${args.value}`)
    this.exit(SUCCESS)
  }

  // TODO: Uncomment when config loading is implemented
  // private setNestedValue(obj: any, path: string, value: any): void {
  //   const keys = path.split('.')
  //   let current = obj
  //
  //   for (let i = 0; i < keys.length - 1; i++) {
  //     const key = keys[i]
  //     if (!key || !(key in current) || typeof current[key] !== 'object') {
  //       if (key) current[key] = {}
  //     }
  //     if (key) current = current[key]
  //   }
  //
  //   const lastKey = keys[keys.length - 1]
  //   if (lastKey) current[lastKey] = value
  // }
}
