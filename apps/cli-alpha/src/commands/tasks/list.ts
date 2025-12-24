import { Flags } from '@oclif/core'
import { BaseCommand } from '@/shared-commands'
import { formatTable, formatJSON } from '@/shared-formatter'
import { SUCCESS } from '@/shared-exit-codes'
import { TaskStorage } from '../../storage.js'

export default class TasksList extends BaseCommand {
  static override description = 'List all tasks'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --status todo',
    '<%= config.bin %> <%= command.id %> --priority high',
    '<%= config.bin %> <%= command.id %> --tag urgent',
  ]

  static override flags = {
    ...BaseCommand.baseFlags,
    status: Flags.string({
      char: 's',
      description: 'Filter by status',
      options: ['todo', 'in-progress', 'done', 'cancelled'],
    }),
    priority: Flags.string({
      char: 'p',
      description: 'Filter by priority',
      options: ['low', 'medium', 'high', 'urgent'],
    }),
    tag: Flags.string({
      char: 'g',
      description: 'Filter by tag',
    }),
  }

  protected async execute(): Promise<void> {
    const { flags } = await this.parse(TasksList)
    const storage = new TaskStorage(this.context.dataDir)
    await storage.init()

    const tasks = await storage.list({
      status: flags.status,
      priority: flags.priority,
      tag: flags.tag,
    })

    if (tasks.length === 0) {
      if (!this.isQuiet()) {
        this.log('No tasks found.')
      }
      process.exit(SUCCESS)
      return
    }

    const format = this.getOutputFormat()

    if (format === 'json') {
      this.log(formatJSON(tasks, { pretty: true }))
    } else {
      // Format as table
      const tableData = tasks.map(task => ({
        id: task.id,
        title: task.title.length > 40 ? task.title.slice(0, 37) + '...' : task.title,
        status: task.status,
        priority: task.priority,
        tags: task.tags.join(', ') || '-',
      }))

      const table = formatTable(tableData, {
        columns: [
          { key: 'id', label: 'ID', width: 10 },
          { key: 'title', label: 'Title', width: 40 },
          { key: 'status', label: 'Status', width: 12 },
          { key: 'priority', label: 'Priority', width: 10 },
          { key: 'tags', label: 'Tags', width: 20 },
        ],
        style: 'simple',
      })

      this.log(table)
      this.log(`\nTotal: ${tasks.length} task${tasks.length === 1 ? '' : 's'}`)
    }

    process.exit(SUCCESS)
  }
}
