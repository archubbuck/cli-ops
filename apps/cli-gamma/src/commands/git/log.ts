import { Flags } from '@oclif/core'
import { BaseCommand } from '@/shared-commands'
import { formatTable, formatJSON } from '@/shared-formatter'
import { SUCCESS } from '@/shared-exit-codes'
import { GitClient } from '../git-client.js'

export default class GitLog extends BaseCommand {
  static override description = 'Show git commit history'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --limit 20',
  ]

  static override flags = {
    ...BaseCommand.baseFlags,
    limit: Flags.integer({
      char: 'n',
      description: 'Number of commits to show',
      default: 10,
    }),
  }

  protected async execute(): Promise<void> {
    const { flags } = await this.parse(GitLog)
    const git = new GitClient(this.context.cwd)

    try {
      const commits = await git.getLog(flags.limit)

      const format = this.getOutputFormat()

      if (format === 'json') {
        this.log(formatJSON(commits, { pretty: true }))
      } else {
        this.log(`\n📝 Recent Commits (${commits.length})\n`)

        const tableData = commits.map(commit => ({
          hash: commit.hash.slice(0, 7),
          author: commit.author,
          date: new Date(commit.date).toLocaleDateString(),
          message: commit.message.length > 60 ? commit.message.slice(0, 57) + '...' : commit.message,
        }))

        const table = formatTable(tableData, {
          columns: [
            { key: 'hash', label: 'Hash', width: 8 },
            { key: 'author', label: 'Author', width: 20 },
            { key: 'date', label: 'Date', width: 12 },
            { key: 'message', label: 'Message', width: 60 },
          ],
          style: 'simple',
        })

        this.log(table)
      }
    } catch (error) {
      this.error('Not a git repository', { exit: 1 })
    }

    process.exit(SUCCESS)
  }
}
