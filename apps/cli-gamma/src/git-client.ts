import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/**
 * Git utilities
 */
export class GitClient {
  private cwd: string

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd
  }

  /**
   * Execute git command
   */
  private async exec(command: string): Promise<string> {
    const { stdout } = await execAsync(`git ${command}`, { cwd: this.cwd })
    return stdout.trim()
  }

  /**
   * Get current branch
   */
  async getCurrentBranch(): Promise<string> {
    return this.exec('branch --show-current')
  }

  /**
   * Get repository status
   */
  async getStatus(): Promise<{
    branch: string
    ahead: number
    behind: number
    staged: number
    modified: number
    untracked: number
  }> {
    const branch = await this.getCurrentBranch()
    const status = await this.exec('status --porcelain --branch')
    
    const lines = status.split('\n')
    let ahead = 0
    let behind = 0
    let staged = 0
    let modified = 0
    let untracked = 0

    // Parse branch line
    const branchLine = lines[0]
    const aheadMatch = branchLine.match(/ahead (\d+)/)
    const behindMatch = branchLine.match(/behind (\d+)/)
    if (aheadMatch) ahead = parseInt(aheadMatch[1], 10)
    if (behindMatch) behind = parseInt(behindMatch[1], 10)

    // Parse file status
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line) continue

      const statusCode = line.slice(0, 2)
      if (statusCode[0] !== ' ' && statusCode[0] !== '?') staged++
      if (statusCode[1] === 'M') modified++
      if (statusCode[0] === '?' && statusCode[1] === '?') untracked++
    }

    return { branch, ahead, behind, staged, modified, untracked }
  }

  /**
   * Get commit log
   */
  async getLog(limit: number = 10): Promise<Array<{
    hash: string
    author: string
    date: string
    message: string
  }>> {
    const log = await this.exec(`log --pretty=format:"%H|%an|%ai|%s" -n ${limit}`)
    
    return log.split('\n').map(line => {
      const [hash, author, date, message] = line.split('|')
      return { hash, author, date, message }
    })
  }

  /**
   * Get remote URL
   */
  async getRemoteUrl(remote: string = 'origin'): Promise<string> {
    return this.exec(`remote get-url ${remote}`)
  }

  /**
   * Parse GitHub repo from remote URL
   */
  parseGitHubRepo(url: string): { owner: string; repo: string } | null {
    // Support both HTTPS and SSH formats
    const httpsMatch = url.match(/github\.com[/:]([^/]+)\/([^/.]+)/)
    if (httpsMatch) {
      return { owner: httpsMatch[1], repo: httpsMatch[2] }
    }
    return null
  }
}
