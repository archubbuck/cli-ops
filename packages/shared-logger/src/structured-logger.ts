import pino from 'pino'
import type { Logger as PinoLogger, LoggerOptions } from 'pino'

/**
 * Log levels (lower number = higher priority)
 */
export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60,
}

/**
 * Structured logger options
 */
export interface StructuredLoggerOptions {
  /**
   * Logger name (appears in logs)
   */
  name: string

  /**
   * Minimum log level to output
   * @default 'info'
   */
  level?: keyof typeof LogLevel | number

  /**
   * Pretty print for development
   * @default true in development, false in production
   */
  prettyPrint?: boolean

  /**
   * Custom transport for log output
   */
  transport?: LoggerOptions['transport']

  /**
   * Additional context to include in all logs
   */
  context?: Record<string, unknown>

  /**
   * Whether to auto-detect CI environment and adjust output
   * @default true
   */
  detectCI?: boolean
}

/**
 * Structured logger interface
 */
export interface StructuredLogger {
  /**
   * Log at trace level
   */
  trace(message: string, ...args: unknown[]): void
  trace(obj: Record<string, unknown>, message: string): void

  /**
   * Log at debug level
   */
  debug(message: string, ...args: unknown[]): void
  debug(obj: Record<string, unknown>, message: string): void

  /**
   * Log at info level
   */
  info(message: string, ...args: unknown[]): void
  info(obj: Record<string, unknown>, message: string): void

  /**
   * Log at warn level
   */
  warn(message: string, ...args: unknown[]): void
  warn(obj: Record<string, unknown>, message: string): void

  /**
   * Log at error level
   */
  error(message: string, ...args: unknown[]): void
  error(obj: Record<string, unknown>, message: string): void
  error(error: Error, message?: string): void

  /**
   * Log at fatal level
   */
  fatal(message: string, ...args: unknown[]): void
  fatal(obj: Record<string, unknown>, message: string): void
  fatal(error: Error, message?: string): void

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, unknown>): StructuredLogger

  /**
   * Get current log level
   */
  level: string

  /**
   * Set log level
   */
  setLevel(level: keyof typeof LogLevel): void
}

/**
 * Detect if running in CI environment
 */
function isCI(): boolean {
  return Boolean(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.CIRCLECI ||
    process.env.TRAVIS ||
    process.env.JENKINS_URL
  )
}

/**
 * Detect if running in production
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Create a structured logger with pino
 */
export function createStructuredLogger(
  options: StructuredLoggerOptions
): StructuredLogger {
  const {
    name,
    level = 'info',
    prettyPrint = !isProduction(),
    transport,
    context = {},
    detectCI = true,
  } = options

  // In CI, disable pretty printing and use JSON
  const shouldPrettyPrint = detectCI && isCI() ? false : prettyPrint

  const pinoOptions: LoggerOptions = {
    name,
    level: typeof level === 'string' ? level : undefined,
    base: context,
  }

  // Add transport for pretty printing or custom output
  if (shouldPrettyPrint && !transport) {
    pinoOptions.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    }
  } else if (transport) {
    pinoOptions.transport = transport
  }

  const logger = pino(pinoOptions)

  // Set numeric level if provided
  if (typeof level === 'number') {
    logger.level = Object.entries(LogLevel)
      .find(([, value]) => value === level)?.[0]
      ?.toLowerCase() ?? 'info'
  }

  return logger as unknown as StructuredLogger
}

/**
 * Create a logger factory for consistent logger creation
 */
export function createLoggerFactory(baseOptions: Omit<StructuredLoggerOptions, 'name'>) {
  return {
    /**
     * Create a logger with a specific name
     */
    create(name: string, additionalContext?: Record<string, unknown>): StructuredLogger {
      return createStructuredLogger({
        ...baseOptions,
        name,
        context: {
          ...baseOptions.context,
          ...additionalContext,
        },
      })
    },
  }
}

/**
 * Default logger instance
 */
export const logger = createStructuredLogger({
  name: 'app',
})
