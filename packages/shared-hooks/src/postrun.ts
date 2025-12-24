import { Hook } from '@oclif/core'
import { createDebugLogger } from '@/shared-logger'

const debug = createDebugLogger('hooks:postrun')

/**
 * Postrun hook - runs after command execution
 */
export const postrun: Hook<'postrun'> = async function (opts) {
  debug('Postrun hook triggered')
  debug('Command: %s', opts.Command.id)

  // Check for updates (placeholder for future implementation)
  // Could check for CLI updates here
}

export default postrun
