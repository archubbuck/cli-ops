import Database from 'better-sqlite3'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

/**
 * Command history entry
 */
export interface HistoryEntry {
  id: number
  command: string
  args: string[]
  flags: Record<string, unknown>
  timestamp: number
  duration: number
  exitCode: number
  cwd: string
  user: string
  success: boolean
}

/**
 * History search options
 */
export interface HistorySearchOptions {
  /**
   * Filter by command name
   */
  command?: string

  /**
   * Filter by exit code
   */
  exitCode?: number

  /**
   * Filter by success/failure
   */
  success?: boolean

  /**
   * Filter by working directory
   */
  cwd?: string

  /**
   * Filter by date range (timestamp)
   */
  after?: number
  before?: number

  /**
   * Limit results
   * @default 100
   */
  limit?: number

  /**
   * Sort order
   * @default 'desc'
   */
  order?: 'asc' | 'desc'
}

/**
 * History manager options
 */
export interface HistoryManagerOptions {
  /**
   * Database file path
   */
  dbPath?: string

  /**
   * CLI name (for default db path)
   */
  cliName?: string

  /**
   * Maximum entries to keep
   * @default 10000
   */
  maxEntries?: number

  /**
   * Whether to enable history tracking
   * @default true
   */
  enabled?: boolean
}

/**
 * Command history manager using SQLite
 */
export class HistoryManager {
  private db: Database.Database | null = null
  private readonly dbPath: string
  private readonly maxEntries: number
  private readonly enabled: boolean

  constructor(options: HistoryManagerOptions = {}) {
    const {
      dbPath,
      cliName = 'cli',
      maxEntries = 10000,
      enabled = true,
    } = options

    this.enabled = enabled

    if (!this.enabled) {
      this.dbPath = ':memory:'
      this.maxEntries = 0
      return
    }

    // Default: ~/.config/<cliName>/history.db
    this.dbPath =
      dbPath ||
      join(
        process.env.XDG_CONFIG_HOME || join(homedir(), '.config'),
        cliName,
        'history.db'
      )

    this.maxEntries = maxEntries

    this.initialize()
  }

  /**
   * Initialize database and create schema
   */
  private initialize(): void {
    if (!this.enabled) return

    // Create directory if it doesn't exist
    const dir = this.dbPath.split('/').slice(0, -1).join('/')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    this.db = new Database(this.dbPath)

    // Create history table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        command TEXT NOT NULL,
        args TEXT NOT NULL,
        flags TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        exit_code INTEGER NOT NULL,
        cwd TEXT NOT NULL,
        user TEXT NOT NULL,
        success INTEGER NOT NULL
      )
    `)

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_command ON history(command);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON history(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_success ON history(success);
    `)
  }

  /**
   * Add command to history
   */
  add(entry: Omit<HistoryEntry, 'id'>): number {
    if (!this.enabled || !this.db) return -1

    const stmt = this.db.prepare(`
      INSERT INTO history (
        command, args, flags, timestamp, duration,
        exit_code, cwd, user, success
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      entry.command,
      JSON.stringify(entry.args),
      JSON.stringify(entry.flags),
      entry.timestamp,
      entry.duration,
      entry.exitCode,
      entry.cwd,
      entry.user,
      entry.success ? 1 : 0
    )

    // Cleanup old entries if over limit
    if (this.maxEntries > 0) {
      this.cleanup()
    }

    return result.lastInsertRowid as number
  }

  /**
   * Search history
   */
  search(options: HistorySearchOptions = {}): HistoryEntry[] {
    if (!this.enabled || !this.db) return []

    const {
      command,
      exitCode,
      success,
      cwd,
      after,
      before,
      limit = 100,
      order = 'desc',
    } = options

    let query = 'SELECT * FROM history WHERE 1=1'
    const params: unknown[] = []

    if (command) {
      query += ' AND command = ?'
      params.push(command)
    }

    if (exitCode !== undefined) {
      query += ' AND exit_code = ?'
      params.push(exitCode)
    }

    if (success !== undefined) {
      query += ' AND success = ?'
      params.push(success ? 1 : 0)
    }

    if (cwd) {
      query += ' AND cwd = ?'
      params.push(cwd)
    }

    if (after) {
      query += ' AND timestamp >= ?'
      params.push(after)
    }

    if (before) {
      query += ' AND timestamp <= ?'
      params.push(before)
    }

    query += ` ORDER BY timestamp ${order.toUpperCase()}`
    query += ' LIMIT ?'
    params.push(limit)

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params) as Array<{
      id: number
      command: string
      args: string
      flags: string
      timestamp: number
      duration: number
      exit_code: number
      cwd: string
      user: string
      success: number
    }>

    return rows.map(row => ({
      id: row.id,
      command: row.command,
      args: JSON.parse(row.args),
      flags: JSON.parse(row.flags),
      timestamp: row.timestamp,
      duration: row.duration,
      exitCode: row.exit_code,
      cwd: row.cwd,
      user: row.user,
      success: row.success === 1,
    }))
  }

  /**
   * Get most recent entries
   */
  recent(limit: number = 10): HistoryEntry[] {
    return this.search({ limit, order: 'desc' })
  }

  /**
   * Get last command
   */
  last(): HistoryEntry | null {
    const results = this.recent(1)
    return results[0] || null
  }

  /**
   * Get statistics
   */
  stats(): {
    total: number
    successful: number
    failed: number
    avgDuration: number
    mostUsedCommands: Array<{ command: string; count: number }>
  } {
    if (!this.enabled || !this.db) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        avgDuration: 0,
        mostUsedCommands: [],
      }
    }

    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM history')
    const total = (totalStmt.get() as { count: number }).count

    const successStmt = this.db.prepare(
      'SELECT COUNT(*) as count FROM history WHERE success = 1'
    )
    const successful = (successStmt.get() as { count: number }).count

    const avgStmt = this.db.prepare('SELECT AVG(duration) as avg FROM history')
    const avgDuration = (avgStmt.get() as { avg: number }).avg || 0

    const topStmt = this.db.prepare(`
      SELECT command, COUNT(*) as count
      FROM history
      GROUP BY command
      ORDER BY count DESC
      LIMIT 10
    `)
    const mostUsedCommands = topStmt.all() as Array<{
      command: string
      count: number
    }>

    return {
      total,
      successful,
      failed: total - successful,
      avgDuration: Math.round(avgDuration),
      mostUsedCommands,
    }
  }

  /**
   * Clear all history
   */
  clear(): void {
    if (!this.enabled || !this.db) return
    this.db.exec('DELETE FROM history')
  }

  /**
   * Cleanup old entries beyond maxEntries
   */
  private cleanup(): void {
    if (!this.enabled || !this.db || this.maxEntries === 0) return

    this.db.exec(`
      DELETE FROM history
      WHERE id NOT IN (
        SELECT id FROM history
        ORDER BY timestamp DESC
        LIMIT ${this.maxEntries}
      )
    `)
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

/**
 * Create a history manager instance
 */
export function createHistoryManager(
  options?: HistoryManagerOptions
): HistoryManager {
  return new HistoryManager(options)
}
