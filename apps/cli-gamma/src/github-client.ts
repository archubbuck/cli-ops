import { CacheService } from '@/shared-services'

/**
 * GitHub API client
 */
export class GitHubClient {
  private baseUrl = 'https://api.github.com'
  private token?: string
  private cache: CacheService

  constructor(cacheDir: string, token?: string) {
    this.token = token
    this.cache = new CacheService({ cacheDir })
  }

  async init(): Promise<void> {
    await this.cache.init()
  }

  /**
   * Make GitHub API request
   */
  private async request<T>(endpoint: string, options: {
    method?: string
    body?: unknown
    useCache?: boolean
  } = {}): Promise<T> {
    const { method = 'GET', body, useCache = false } = options

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'cli-gamma',
    }

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`
    }

    if (body) {
      headers['Content-Type'] = 'application/json'
    }

    const url = `${this.baseUrl}${endpoint}`

    // Check cache for GET requests
    if (useCache && method === 'GET') {
      const cached = await this.cache.get<T>(`github:${endpoint}`)
      if (cached) {
        return cached
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as T

    // Cache successful GET requests
    if (useCache && method === 'GET') {
      await this.cache.set(`github:${endpoint}`, data, 300000) // 5 min
    }

    return data
  }

  /**
   * Get pull requests
   */
  async getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<Array<{
    number: number
    title: string
    state: string
    user: { login: string }
    created_at: string
    updated_at: string
    html_url: string
  }>> {
    return this.request(`/repos/${owner}/${repo}/pulls?state=${state}`, {
      useCache: true,
    })
  }

  /**
   * Get single pull request
   */
  async getPullRequest(owner: string, repo: string, number: number): Promise<{
    number: number
    title: string
    body: string
    state: string
    user: { login: string }
    created_at: string
    updated_at: string
    merged_at?: string
    html_url: string
    head: { ref: string }
    base: { ref: string }
  }> {
    return this.request(`/repos/${owner}/${repo}/pulls/${number}`)
  }

  /**
   * Get repository
   */
  async getRepository(owner: string, repo: string): Promise<{
    name: string
    full_name: string
    description: string
    html_url: string
    stargazers_count: number
    forks_count: number
    open_issues_count: number
  }> {
    return this.request(`/repos/${owner}/${repo}`, { useCache: true })
  }

  /**
   * Get user
   */
  async getUser(username: string): Promise<{
    login: string
    name: string
    bio: string
    public_repos: number
    followers: number
    following: number
    html_url: string
  }> {
    return this.request(`/users/${username}`, { useCache: true })
  }
}
