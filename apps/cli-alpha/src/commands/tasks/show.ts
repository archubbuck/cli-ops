import { Args } from '@oclif/core'
import { BaseCommand } from '@/shared-commands'
import { NotFoundError } from '@/shared-core'
import { formatTable, formatJSON } from '@/shared-formatter'
import { SUCCESS } from '@/shared-exit-codes'
import { TaskStorage } from '../../storage.js'

export default class TasksShow extends BaseCommand {
  static override description = 'Show task details'

  static override examples = [
    '<%= config.bin %> <%= command.id %> abc123',
    '<%= config.bin %> <%= command.id %> abc123 --format json',
  ]

  static override args = {
    id: Args.string({
      description: 'Task ID',
      required: true,
    }),
  }

  static override flags = {
    ...BaseCommand.baseFlags,
  }

  protected async execute(): Promise<void> {
    const { args } = await this.parse(TasksShow)
    const storage = new TaskStorage(this.context.dataDir)
    await storage.init()

    const task = await storage.getById(args.id)
    if (!task) {
      throw new NotFoundError(`Task ${args.id}`, {
        suggestions: ['Run "alpha tasks:list" to see all tasks'],
      })
    }

    const format = this.getOutputFormat()

    if (format === 'json') {
      this.log(formatJSON(task, { pretty: true }))
    } else {
      const data = [
        { key: 'ID', value: task.id },
        { key: 'Title', value: task.title },
        { key: 'Description', value: task.description || '-' },
        { key: 'Status', value: task.status },
        { key: 'Priority', value: task.priority },
        { key: 'Tags', value: task.tags.join(', ') || '-' },
        { key: 'Created', value: new Date(task.createdAt).toLocaleString() },
        { key: 'Updated', value: new Date(task.updatedAt).toLocaleString() },
      ]

      if (task.completedAt) {
        data.push({
          key: 'Completed',
          value: new Date(task.completedAt).toLocaleString(),
        })
      }

      const table = formatTable(data, {
        columns: [
          { key: 'key', label: 'Field', width: 15 },
          { key: 'value', label: 'Value', width: 60 },
        ],
        style: 'simple',
      })

      this.log(table)
    }

    process.exit(SUCCESS)
  }
}
