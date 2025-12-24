import { Flags } from '@oclif/core'
import { BaseCommand } from '@/shared-commands'
import { formatTable, formatJSON } from '@/shared-formatter'
import { SUCCESS } from '@/shared-exit-codes'
import { GitClient } from '../git-client.js'
import { GitHubClient } from '../github-client.js'

export default class PrList extends BaseCommand {
  static override description = 'List pull requests'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --state all',
    '<%= config.bin %> <%= command.id %> --token YOUR_TOKEN',
  ]

  static override flags = {
    ...BaseCommand.baseFlags,
    state: Flags.string({
      char: 's',
      description: 'Filter by state',
      options: ['open', 'closed', 'all'],
      default: 'open',
    }),
    token: Flags.string({
      char: 't',
      description: 'GitHub token',
      env: 'GITHUB_TOKEN',
    }),
  }

  protected async execute(): Promise<void> {
    const { flags } = await this.parse(PrList)
    const git = new GitClient(this.context.cwd)

    try {
      const remoteUrl = await git.getRemoteUrl()
      const repoInfo = git.parseGitHubRepo(remoteUrl)

      if (!repoInfo) {
        this.error('Not a GitHub repository', { exit: 1 })
        return
      }

      const github = new GitHubClient(this.context.cacheDir, flags.token)
      await github.init()

      const prs = await github.getPullRequests(
        repoInfo.owner,
        repoInfo.repo,
        flags.state as 'open' | 'closed' | 'all'
      )

      if (prs.length === 0) {
        this.log(`No ${flags.state} pull requests found.`)
        process.exit(SUCCESS)
        return
      }

      const format = this.getOutputFormat()

      if (format === 'json') {
        this.log(formatJSON(prs, { pretty: true }))
      } else {
        this.log(`\n🔀 Pull Requests (${prs.length})\n`)

        const tableData = prs.map(pr => ({
          number: `#${pr.number}`,
          title: pr.title.length > 50 ? pr.title.slice(0, 47) + '...' : pr.title,
          author: pr.user.login,
          state: pr.state,
        }))

        const table = formatTable(tableData, {
          columns: [
            { key: 'number', label: 'PR', width: 8 },
            { key: 'title', label: 'Title', width: 50 },
            { key: 'author', label: 'Author', width: 20 },
            { key: 'state', label: 'State', width: 10 },
          ],
          style: 'simple',
        })

        this.log(table)
        this.log(`\nRepository: ${repoInfo.owner}/${repoInfo.repo}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        this.error(error.message, { exit: 1 })
      }
    }

    process.exit(SUCCESS)
  }
}
