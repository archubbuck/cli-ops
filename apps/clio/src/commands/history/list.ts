import { Flags } from '@oclif/core'
import { BaseCommand } from '@cli-ops/shared-commands'
import { formatTable } from '@cli-ops/shared-formatter'
import { SUCCESS } from '@cli-ops/shared-exit-codes'

export default class HistoryList extends BaseCommand {
  static override description = 'View command history'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --limit 20',
  ]

  static override flags = {
    ...BaseCommand.baseFlags,
    limit: Flags.integer({
      char: 'l',
      description: 'Number of history entries to show',
      default: 10,
    }),
  }

  protected async execute(): Promise<void> {
    const { flags } = await this.parse(HistoryList)
    const entries = this.history.recent(flags.limit)

    if (entries.length === 0) {
      this.logger.info('No command history found')
      this.exit(SUCCESS)
      return
    }

    if (flags.json) {
      this.logger.info(JSON.stringify(entries, null, 2))
    } else {
      const tableData = entries.map(
        (entry: { command: string; exitCode: number; timestamp: number; duration: number }) => ({
          timestamp: new Date(entry.timestamp).toLocaleString(),
          command: entry.command,
          exitCode: entry.exitCode ?? 'running',
          duration: entry.duration ? `${entry.duration}ms` : '-',
        }),
      )

      this.logger.info(formatTable(tableData))
    }

    this.exit(SUCCESS)
  }
}
