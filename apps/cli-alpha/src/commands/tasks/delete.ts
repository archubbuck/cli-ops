import { Args, Flags } from '@oclif/core'
import { BaseCommand } from '@/shared-commands'
import { NotFoundError } from '@/shared-core'
import { confirmDestruction } from '@/shared-prompts'
import { SUCCESS } from '@/shared-exit-codes'
import { TaskStorage } from '../../storage.js'

export default class TasksDelete extends BaseCommand {
  static override description = 'Delete a task'

  static override examples = [
    '<%= config.bin %> <%= command.id %> abc123',
    '<%= config.bin %> <%= command.id %> abc123 --force',
  ]

  static override args = {
    id: Args.string({
      description: 'Task ID',
      required: true,
    }),
  }

  static override flags = {
    ...BaseCommand.baseFlags,
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation',
      default: false,
    }),
  }

  protected async execute(): Promise<void> {
    const { args, flags } = await this.parse(TasksDelete)
    const storage = new TaskStorage(this.context.dataDir)
    await storage.init()

    const existing = await storage.getById(args.id)
    if (!existing) {
      throw new NotFoundError(`Task ${args.id}`, {
        suggestions: ['Run "alpha tasks:list" to see all tasks'],
      })
    }

    // Confirm deletion
    if (!flags.force) {
      const confirmed = await confirmDestruction(`task "${existing.title}"`)
      if (!confirmed) {
        this.log('Cancelled.')
        process.exit(SUCCESS)
        return
      }
    }

    const deleted = await storage.delete(args.id)

    if (deleted && !this.isQuiet()) {
      this.log(`✓ Task ${args.id} deleted successfully.`)
    }

    process.exit(SUCCESS)
  }
}
