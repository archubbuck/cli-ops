import { Flags } from '@oclif/core'
import { BaseCommand } from '@/shared-commands'
import { promptText, promptList } from '@/shared-prompts'
import { formatTable } from '@/shared-formatter'
import { SUCCESS } from '@/shared-exit-codes'
import { TaskStorage } from '../../storage.js'
import { TaskPriority, TaskStatus } from '../../types.js'

export default class TasksCreate extends BaseCommand {
  static override description = 'Create a new task'

  static override examples = [
    '<%= config.bin %> <%= command.id %> --title "Implement feature"',
    '<%= config.bin %> <%= command.id %> --interactive',
  ]

  static override flags = {
    ...BaseCommand.baseFlags,
    title: Flags.string({
      char: 't',
      description: 'Task title',
    }),
    description: Flags.string({
      char: 'd',
      description: 'Task description',
    }),
    priority: Flags.string({
      char: 'p',
      description: 'Task priority',
      options: ['low', 'medium', 'high', 'urgent'],
    }),
    tags: Flags.string({
      char: 'g',
      description: 'Task tags (comma-separated)',
    }),
    interactive: Flags.boolean({
      char: 'i',
      description: 'Interactive mode',
      default: false,
    }),
  }

  protected async execute(): Promise<void> {
    const { flags } = await this.parse(TasksCreate)
    const storage = new TaskStorage(this.context.dataDir)
    await storage.init()

    let title: string
    let description: string | undefined
    let priority: string
    let tags: string[]

    if (flags.interactive || !flags.title) {
      // Interactive mode
      title = await promptText({
        message: 'Task title:',
        validate: (input: string) => input.length > 0 || 'Title is required',
      })

      description = await promptText({
        message: 'Description (optional):',
        default: '',
      })

      priority = await promptList({
        message: 'Priority:',
        choices: [
          { name: 'Low', value: 'low' },
          { name: 'Medium', value: 'medium' },
          { name: 'High', value: 'high' },
          { name: 'Urgent', value: 'urgent' },
        ],
        default: 'medium',
      })

      const tagsInput = await promptText({
        message: 'Tags (comma-separated, optional):',
        default: '',
      })
      tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : []
    } else {
      // CLI flags mode
      title = flags.title
      description = flags.description
      priority = flags.priority || 'medium'
      tags = flags.tags ? flags.tags.split(',').map(t => t.trim()) : []
    }

    // Validate with Zod schemas
    TaskPriority.parse(priority)

    const task = await storage.create({
      title,
      description: description || undefined,
      status: 'todo',
      priority: priority as never,
      tags,
    })

    if (!this.isQuiet()) {
      this.log('\n✓ Task created successfully!\n')
      
      const format = this.getOutputFormat()
      if (format === 'json') {
        this.log(JSON.stringify(task, null, 2))
      } else {
        const table = formatTable([
          { key: 'ID', value: task.id },
          { key: 'Title', value: task.title },
          { key: 'Description', value: task.description || '-' },
          { key: 'Status', value: task.status },
          { key: 'Priority', value: task.priority },
          { key: 'Tags', value: task.tags.join(', ') || '-' },
          { key: 'Created', value: new Date(task.createdAt).toLocaleString() },
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
