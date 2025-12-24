import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { BaseService } from './base.js'

/**
 * Cache service options
 */
export interface CacheOptions {
  /**
   * Cache directory
   */
  cacheDir: string

  /**
   * Default TTL in milliseconds
   * @default 3600000 (1 hour)
   */
  ttl?: number
}

/**
 * Cache entry
 */
interface CacheEntry<T> {
  value: T
  expires: number
}

/**
 * Simple file-based cache service
 */
export class CacheService extends BaseService {
  private cacheDir: string
  private defaultTTL: number
  private memoryCache = new Map<string, CacheEntry<unknown>>()

  constructor(options: CacheOptions) {
    super()
    this.cacheDir = options.cacheDir
    this.defaultTTL = options.ttl ?? 3600000 // 1 hour
  }

  async init(): Promise<void> {
    // Create cache directory
    if (!existsSync(this.cacheDir)) {
      await mkdir(this.cacheDir, { recursive: true })
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key)
    if (memEntry && memEntry.expires > Date.now()) {
      return memEntry.value as T
    }

    // Check file cache
    const filePath = join(this.cacheDir, `${this.sanitizeKey(key)}.json`)
    
    if (!existsSync(filePath)) {
      return null
    }

    try {
      const content = await readFile(filePath, 'utf-8')
      const entry: CacheEntry<T> = JSON.parse(content)

      if (entry.expires < Date.now()) {
        // Expired
        return null
      }

      // Store in memory
      this.memoryCache.set(key, entry)

      return entry.value
    } catch {
      return null
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expires = Date.now() + (ttl ?? this.defaultTTL)
    const entry: CacheEntry<T> = { value, expires }

    // Store in memory
    this.memoryCache.set(key, entry)

    // Store in file
    const filePath = join(this.cacheDir, `${this.sanitizeKey(key)}.json`)
    await writeFile(filePath, JSON.stringify(entry, null, 2))
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)

    const filePath = join(this.cacheDir, `${this.sanitizeKey(key)}.json`)
    if (existsSync(filePath)) {
      const { unlink } = await import('node:fs/promises')
      await unlink(filePath)
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()

    const { readdir, unlink } = await import('node:fs/promises')
    const files = await readdir(this.cacheDir)
    await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(file => unlink(join(this.cacheDir, file)))
    )
  }

  /**
   * Get or compute value
   */
  async getOrSet<T>(
    key: string,
    compute: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await compute()
    await this.set(key, value, ttl)
    return value
  }

  /**
   * Sanitize cache key for filename
   */
  private sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9-_]/g, '_')
  }
}
