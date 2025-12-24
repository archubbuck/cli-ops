import { CacheService } from '@/shared-services'
import { NetworkError } from '@/shared-core'

/**
 * HTTP client with retry and caching
 */
export class HttpClient {
  private cache: CacheService
  private maxRetries: number
  private retryDelay: number

  constructor(cacheDir: string, options: { maxRetries?: number; retryDelay?: number } = {}) {
    this.cache = new CacheService({ cacheDir })
    this.maxRetries = options.maxRetries ?? 3
    this.retryDelay = options.retryDelay ?? 1000
  }

  async init(): Promise<void> {
    await this.cache.init()
  }

  /**
   * Make HTTP request with retry logic
   */
  async request(options: {
    url: string
    method?: string
    headers?: Record<string, string>
    body?: string
    useCache?: boolean
    cacheTTL?: number
  }): Promise<{ status: number; headers: Record<string, string>; body: string }> {
    const { url, method = 'GET', headers = {}, body, useCache = false, cacheTTL } = options

    // Check cache for GET requests
    if (useCache && method === 'GET') {
      const cacheKey = `http:${method}:${url}`
      const cached = await this.cache.get<{ status: number; headers: Record<string, string>; body: string }>(cacheKey)
      if (cached) {
        return cached
      }
    }

    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers,
          body,
        })

        const responseBody = await response.text()
        const result = {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseBody,
        }

        // Cache successful GET requests
        if (useCache && method === 'GET' && response.ok) {
          const cacheKey = `http:${method}:${url}`
          await this.cache.set(cacheKey, result, cacheTTL)
        }

        return result
      } catch (error) {
        lastError = error as Error
        
        if (attempt < this.maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt)))
        }
      }
    }

    throw new NetworkError(`Failed to fetch ${url} after ${this.maxRetries + 1} attempts`, {
      cause: lastError!,
      suggestions: [
        'Check your internet connection',
        'Verify the URL is correct',
        'Try again later',
      ],
    })
  }

  /**
   * GET request
   */
  async get(url: string, headers?: Record<string, string>, useCache?: boolean): Promise<{ status: number; headers: Record<string, string>; body: string }> {
    return this.request({ url, method: 'GET', headers, useCache })
  }

  /**
   * POST request
   */
  async post(url: string, body: string, headers?: Record<string, string>): Promise<{ status: number; headers: Record<string, string>; body: string }> {
    return this.request({ url, method: 'POST', body, headers })
  }

  /**
   * PUT request
   */
  async put(url: string, body: string, headers?: Record<string, string>): Promise<{ status: number; headers: Record<string, string>; body: string }> {
    return this.request({ url, method: 'PUT', body, headers })
  }

  /**
   * DELETE request
   */
  async delete(url: string, headers?: Record<string, string>): Promise<{ status: number; headers: Record<string, string>; body: string }> {
    return this.request({ url, method: 'DELETE', headers })
  }
}
