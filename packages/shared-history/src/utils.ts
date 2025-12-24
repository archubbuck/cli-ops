import type { HistoryEntry } from './manager.js'

/**
 * Replay a command from history
 */
export interface ReplayOptions {
  /**
   * Dry run - don't actually execute
   * @default false
   */
  dryRun?: boolean

  /**
   * Confirm before executing
   * @default true
   */
  confirm?: boolean

  /**
   * Modify args before replay
   */
  modifyArgs?: (args: string[]) => string[]

  /**
   * Modify flags before replay
   */
  modifyFlags?: (flags: Record<string, unknown>) => Record<string, unknown>
}

/**
 * Build command string for replay
 */
export function buildCommandString(entry: HistoryEntry): string {
  const parts = [entry.command]

  // Add args
  parts.push(...entry.args)

  // Add flags
  Object.entries(entry.flags).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
      if (value) {
        parts.push(`--${key}`)
      }
    } else if (value !== undefined && value !== null) {
      parts.push(`--${key}=${String(value)}`)
    }
  })

  return parts.join(' ')
}

/**
 * Format history entry for display
 */
export function formatHistoryEntry(
  entry: HistoryEntry,
  options: { verbose?: boolean } = {}
): string {
  const { verbose = false } = options

  const timestamp = new Date(entry.timestamp).toLocaleString()
  const duration = `${entry.duration}ms`
  const status = entry.success ? '✓' : '✗'
  const command = buildCommandString(entry)

  if (verbose) {
    return [
      `ID: ${entry.id}`,
      `Command: ${command}`,
      `Status: ${status} (exit ${entry.exitCode})`,
      `Duration: ${duration}`,
      `Time: ${timestamp}`,
      `CWD: ${entry.cwd}`,
      `User: ${entry.user}`,
    ].join('\n')
  }

  return `[${entry.id}] ${status} ${command} (${duration}) - ${timestamp}`
}

/**
 * Group history entries by command
 */
export function groupByCommand(
  entries: HistoryEntry[]
): Map<string, HistoryEntry[]> {
  const groups = new Map<string, HistoryEntry[]>()

  entries.forEach(entry => {
    const existing = groups.get(entry.command) || []
    existing.push(entry)
    groups.set(entry.command, existing)
  })

  return groups
}

/**
 * Group history entries by date
 */
export function groupByDate(
  entries: HistoryEntry[]
): Map<string, HistoryEntry[]> {
  const groups = new Map<string, HistoryEntry[]>()

  entries.forEach(entry => {
    const date = new Date(entry.timestamp).toLocaleDateString()
    const existing = groups.get(date) || []
    existing.push(entry)
    groups.set(date, existing)
  })

  return groups
}

/**
 * Find similar commands (fuzzy search)
 */
export function findSimilar(
  target: string,
  entries: HistoryEntry[],
  threshold: number = 0.6
): HistoryEntry[] {
  return entries.filter(entry => {
    const similarity = calculateSimilarity(
      target.toLowerCase(),
      entry.command.toLowerCase()
    )
    return similarity >= threshold
  })
}

/**
 * Calculate string similarity (simple implementation)
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length === 0 || b.length === 0) return 0

  // Simple contains check
  if (a.includes(b) || b.includes(a)) {
    return Math.min(a.length, b.length) / Math.max(a.length, b.length)
  }

  // Levenshtein distance would be more accurate
  // This is simplified for now
  const maxLen = Math.max(a.length, b.length)
  let matches = 0

  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) {
      matches++
    }
  }

  return matches / maxLen
}

/**
 * Get command frequency
 */
export function getCommandFrequency(
  entries: HistoryEntry[]
): Map<string, number> {
  const frequency = new Map<string, number>()

  entries.forEach(entry => {
    frequency.set(entry.command, (frequency.get(entry.command) || 0) + 1)
  })

  return frequency
}

/**
 * Get success rate for commands
 */
export function getSuccessRate(entries: HistoryEntry[]): Map<string, number> {
  const stats = new Map<
    string,
    { total: number; successful: number }
  >()

  entries.forEach(entry => {
    const current = stats.get(entry.command) || { total: 0, successful: 0 }
    current.total++
    if (entry.success) {
      current.successful++
    }
    stats.set(entry.command, current)
  })

  const rates = new Map<string, number>()
  stats.forEach((stat, command) => {
    rates.set(command, (stat.successful / stat.total) * 100)
  })

  return rates
}
