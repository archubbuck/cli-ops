import { Hook } from '@oclif/core'
import { createDebugLogger } from '@/shared-logger'

const debug = createDebugLogger('hooks:init')

/**
 * Init hook - runs before CLI initialization
 */
export const init: Hook<'init'> = async function (opts) {
  debug('Init hook triggered')
  debug('ID: %s', opts.id)
  debug('Config: %O', {
    name: opts.config.name,
    version: opts.config.version,
    root: opts.config.root,
  })

  // Check Node version
  const nodeVersion = process.version
  const [major] = nodeVersion.slice(1).split('.').map(Number)
  
  if (major < 20) {
    this.warn(`Node.js ${nodeVersion} detected. Minimum required: v20.0.0`)
  }

  // Set up signal handlers for graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
  signals.forEach(signal => {
    process.on(signal, () => {
      debug(`Received ${signal}, shutting down gracefully`)
      process.exit(0)
    })
  })
}

export default init
