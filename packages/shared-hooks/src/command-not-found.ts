import { Hook } from '@oclif/core'
import { createDebugLogger } from '@/shared-logger'

const debug = createDebugLogger('hooks:command-not-found')

/**
 * Command not found hook - suggests similar commands
 */
export const commandNotFound: Hook<'command_not_found'> = async function (opts) {
  debug('Command not found: %s', opts.id)

  const suggestions = opts.config.commands
    .filter(cmd => !cmd.hidden)
    .map(cmd => cmd.id)
    .filter(id => calculateSimilarity(opts.id, id) > 0.5)
    .slice(0, 5)

  if (suggestions.length > 0) {
    this.log(`\nDid you mean one of these?`)
    suggestions.forEach(suggestion => {
      this.log(`  ${suggestion}`)
    })
  }
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

  const maxLen = Math.max(a.length, b.length)
  let matches = 0

  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) {
      matches++
    }
  }

  return matches / maxLen
}

export default commandNotFound
