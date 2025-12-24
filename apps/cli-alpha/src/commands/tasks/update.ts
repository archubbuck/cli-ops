import { Args, Flags } from '@oclif/core'
import { BaseCommand } from '@/shared-commands'
import { NotFoundError } from '@/shared-core'
import { promptList, promptText, confirmOverwrite } from '@/shared-prompts'
import { formatTable } from '@/shared-formatter'
import { SUCCESS } from '@/shared-exit-codes'
import { TaskStorage } from '../../storage.js'
import { TaskPriority, TaskStatus } from '../../types.js'

export default class TasksUpdate extends BaseCommand {
  static override description = 'Update a task'

  static override examples = [
    '<%= config.bin %> <%= command.id %> abc123 --status done',
    '<%= config.bin %> <%= command.id %> abc123 --priority high',
    '<%= config.bin %> <%= command.id %> abc123 --interactive',
  ]

  static override args = {
    id: Args.string({
      description: 'Task ID',
      required: true,
    }),
  }

  static override flags = {
    ...BaseCommand.baseFlags,
    title: Flags.string({
      char: 't',
      description: 'New title',
    }),
    description: Flags.string({
      char: 'd',
      description: 'New description',
    }),
    status: Flags.string({
      char: 's',
      description: 'New status',
      options: ['todo', 'in-progress', 'done', 'cancelled'],
    }),
    priority: Flags.string({
      char: 'p',
      description: 'New priority',
      options: ['low', 'medium', 'high', 'urgent'],
    }),
    tags: Flags.string({
      char: 'g',
      description: 'New tags (comma-separated)',
    }),
    interactive: Flags.boolean({
      char: 'i',
      description: 'Interactive mode',
      default: false,
    }),
  }

  protected async execute(): Promise<void> {
    const { args, flags } = await this.parse(TasksUpdate)
    const storage = new TaskStorage(this.context.dataDir)
    await storage.init()

    const existing = await storage.getById(args.id)
    if (!existing) {
      throw new NotFoundError(`Task ${args.id}`, {
        suggestions: ['Run "alpha tasks:list" to see all tasks'],
      })
    }

    const updates: Record<string, unknown> = {}

    if (flags.interactive) {
      // Interactive mode
      const shouldUpdateTitle = await confirmOverwrite('title')
      if (shouldUpdateTitle) {
        updates.title = await promptText({
          message: 'New title:',
          default: existing.title,
        })
      }

      const shouldUpdateDesc = await confirmOverwrite('description')
      if (shouldUpdateDesc) {
        updates.description = await promptText({
          message: 'New description:',
          default: existing.description || '',
        })
      }

      updates.status = await promptList({
        message: 'Status:',
        choices: [
          { name: 'To Do', value: 'todo' },
          { name: 'In Progress', value: 'in-progress' },
          { name: 'Done', value: 'done' },
          { name: 'Cancelled', value: 'cancelled' },
        ],
        default: existing.status,
      })

      updates.priority = await promptList({
        message: 'Priority:',
        choices: [
          { name: 'Low', value: 'low' },
          { name: 'Medium', value: 'medium' },
          { name: 'High', value: 'high' },
          { name: 'Urgent', value: 'urgent' },
        ],
        default: existing.priority,
      })
    } else {
      // CLI flags mode
      if (flags.title) updates.title = flags.title
      if (flags.description !== undefined) updates.description = flags.description
      if (flags.status) {
        TaskStatus.parse(flags.status)
        updates.status = flags.status
      }
      if (flags.priority) {
        TaskPriority.parse(flags.priority)
        updates.priority = flags.priority
      }
      if (flags.tags) {
        updates.tags = flags.tags.split(',').map(t => t.trim())
      }
    }

    // Track completion
    if (updates.status === 'done' && existing.status !== 'done') {
      updates.completedAt = Date.now()
    }

    const updated = await storage.update(args.id, updates)

    if (!this.isQuiet()) {
      this.log('\n✓ Task updated successfully!\n')
      
      const format = this.getOutputFormat()
      if (format === 'json') {
        this.log(JSON.stringify(updated, null, 2))
      } else {
        const table = formatTable([
          { key: 'ID', value: updated!.id },
          { key: 'Title', value: updated!.title },
          { key: 'Description', value: updated!.description || '-' },
          { key: 'Status', value: updated!.status },
          { key: 'Priority', value: updated!.priority },
          { key: 'Tags', value: updated!.tags.join(', ') || '-' },
          { key: 'Updated', value: new Date(updated!.updatedAt).toLocaleString() },
        ], {
          columns: [
            { key: 'key', label: 'Field' },
            { key: 'value', label: 'Value' },
          ],
          style: 'simple',
        })
        
        this.log(table)
      }
    }

    process.exit(SUCCESS)
  }
}
