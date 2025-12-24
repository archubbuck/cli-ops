import debugFactory from 'debug'

/**
 * Debug logger for development and troubleshooting
 * 
 * Uses the debug package for namespace-based logging.
 * Enable with DEBUG environment variable:
 * 
 * DEBUG=mycli:* node app.js          # All mycli logs
 * DEBUG=mycli:api node app.js        # Just API logs
 * DEBUG=mycli:api,mycli:db node app.js  # Multiple namespaces
 * DEBUG=* node app.js                # Everything (verbose!)
 */

export interface DebugLoggerOptions {
  /**
   * Namespace for this logger (e.g., "mycli:api")
   */
  namespace: string

  /**
   * Whether to enable by default (overrides DEBUG env var)
   */
  enabled?: boolean
}

export interface DebugLogger {
  /**
   * Log a debug message
   */
  (message: string, ...args: unknown[]): void

  /**
   * Log with formatter
   */
  (formatter: string, ...args: unknown[]): void

  /**
   * Whether this logger is enabled
   */
  enabled: boolean

  /**
   * The namespace for this logger
   */
  namespace: string

  /**
   * Create a sub-logger with extended namespace
   */
  extend(subNamespace: string): DebugLogger
}

/**
 * Create a debug logger with namespace
 */
export function createDebugLogger(
  options: string | DebugLoggerOptions
): DebugLogger {
  const namespace = typeof options === 'string' 
    ? options 
    : options.namespace
  
  const logger = debugFactory(namespace)

  if (typeof options === 'object' && options.enabled !== undefined) {
    logger.enabled = options.enabled
  }

  return logger as DebugLogger
}

/**
 * Check if debug logging is enabled for a namespace
 */
export function isDebugEnabled(namespace: string): boolean {
  return debugFactory(namespace).enabled
}

/**
 * Enable debug logging for namespace(s)
 */
export function enableDebug(namespaces: string): void {
  debugFactory.enable(namespaces)
}

/**
 * Disable debug logging for namespace(s)
 */
export function disableDebug(namespaces: string): void {
  debugFactory.disable()
  if (namespaces !== '*') {
    const current = process.env.DEBUG || ''
    const patterns = current.split(',').filter(p => p !== namespaces)
    if (patterns.length > 0) {
      debugFactory.enable(patterns.join(','))
    }
  }
}

/**
 * Create a logger factory for a base namespace
 */
export function createLoggerFactory(baseNamespace: string) {
  return {
    /**
     * Create logger for a sub-namespace
     */
    create(subNamespace: string): DebugLogger {
      return createDebugLogger(`${baseNamespace}:${subNamespace}`)
    },

    /**
     * Create logger with full namespace
     */
    createRaw(namespace: string): DebugLogger {
      return createDebugLogger(namespace)
    },

    /**
     * Check if any loggers in this namespace are enabled
     */
    isEnabled(): boolean {
      return isDebugEnabled(baseNamespace)
    },
  }
}
