import { Hook } from '@oclif/core'
import { createDebugLogger } from '@/shared-logger'

const debug = createDebugLogger('hooks:prerun')

/**
 * Prerun hook - runs before command execution
 */
export const prerun: Hook<'prerun'> = async function (opts) {
  debug('Prerun hook triggered')
  debug('Command: %s', opts.Command.id)
  debug('Args: %O', opts.argv)

  // Log command execution in debug mode
  if (process.env.DEBUG) {
    this.log(`Executing: ${opts.Command.id}`)
  }
}

export default prerun
