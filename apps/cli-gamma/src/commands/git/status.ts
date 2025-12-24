import { BaseCommand } from '@/shared-commands'
import { formatTable } from '@/shared-formatter'
import { SUCCESS } from '@/shared-exit-codes'
import { GitClient } from '../git-client.js'

export default class GitStatus extends BaseCommand {
  static override description = 'Show git repository status'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    ...BaseCommand.baseFlags,
  }

  protected async execute(): Promise<void> {
    const git = new GitClient(this.context.cwd)

    try {
      const status = await git.getStatus()

      this.log('\n📊 Repository Status\n')

      const data = [
        { key: 'Branch', value: status.branch },
        { key: 'Ahead', value: String(status.ahead) },
        { key: 'Behind', value: String(status.behind) },
        { key: 'Staged', value: String(status.staged) },
        { key: 'Modified', value: String(status.modified) },
        { key: 'Untracked', value: String(status.untracked) },
      ]

      const table = formatTable(data, {
        columns: [
          { key: 'key', label: 'Property' },
          { key: 'value', label: 'Value' },
        ],
        style: 'simple',
      })

      this.log(table)

      // Show status indicators
      if (status.ahead > 0) {
        this.log(`\n↑ ${status.ahead} commit(s) ahead of remote`)
      }
      if (status.behind > 0) {
        this.log(`↓ ${status.behind} commit(s) behind remote`)
      }
      if (status.staged > 0) {
        this.log(`✓ ${status.staged} file(s) staged`)
      }
      if (status.modified > 0) {
        this.log(`✎ ${status.modified} file(s) modified`)
      }
      if (status.untracked > 0) {
        this.log(`? ${status.untracked} untracked file(s)`)
      }

      if (status.staged === 0 && status.modified === 0 && status.untracked === 0) {
        this.log('\n✓ Working directory clean')
      }
    } catch (error) {
      this.error('Not a git repository', { exit: 1 })
    }

    process.exit(SUCCESS)
  }
}
