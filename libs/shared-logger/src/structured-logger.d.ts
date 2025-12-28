import type { LoggerOptions } from 'pino';
/**
 * Log levels (lower number = higher priority)
 */
export declare enum LogLevel {
    TRACE = 10,
    DEBUG = 20,
    INFO = 30,
    WARN = 40,
    ERROR = 50,
    FATAL = 60
}
/**
 * Structured logger options
 */
export interface StructuredLoggerOptions {
    /**
     * Logger name (appears in logs)
     */
    name: string;
    /**
     * Minimum log level to output
     * @default 'info'
     */
    level?: keyof typeof LogLevel | number;
    /**
     * Pretty print for development
     * @default true in development, false in production
     */
    prettyPrint?: boolean;
    /**
     * Custom transport for log output
     */
    transport?: LoggerOptions['transport'];
    /**
     * Additional context to include in all logs
     */
    context?: Record<string, unknown>;
    /**
     * Whether to auto-detect CI environment and adjust output
     * @default true
     */
    detectCI?: boolean;
}
/**
 * Structured logger interface
 */
export interface StructuredLogger {
    /**
     * Log at trace level
     */
    trace(message: string, ...args: unknown[]): void;
    trace(obj: Record<string, unknown>, message: string): void;
    /**
     * Log at debug level
     */
    debug(message: string, ...args: unknown[]): void;
    debug(obj: Record<string, unknown>, message: string): void;
    /**
     * Log at info level
     */
    info(message: string, ...args: unknown[]): void;
    info(obj: Record<string, unknown>, message: string): void;
    /**
     * Log at warn level
     */
    warn(message: string, ...args: unknown[]): void;
    warn(obj: Record<string, unknown>, message: string): void;
    /**
     * Log at error level
     */
    error(message: string, ...args: unknown[]): void;
    error(obj: Record<string, unknown>, message: string): void;
    error(error: Error, message?: string): void;
    /**
     * Log at fatal level
     */
    fatal(message: string, ...args: unknown[]): void;
    fatal(obj: Record<string, unknown>, message: string): void;
    fatal(error: Error, message?: string): void;
    /**
     * Create child logger with additional context
     */
    child(context: Record<string, unknown>): StructuredLogger;
    /**
     * Get current log level
     */
    level: string;
    /**
     * Set log level
     */
    setLevel(level: keyof typeof LogLevel): void;
}
/**
 * Create a structured logger with pino
 */
export declare function createStructuredLogger(options: StructuredLoggerOptions): StructuredLogger;
/**
 * Create a logger factory for consistent logger creation
 */
export declare function createLoggerFactory(baseOptions: Omit<StructuredLoggerOptions, 'name'>): {
    /**
     * Create a logger with a specific name
     */
    create(name: string, additionalContext?: Record<string, unknown>): StructuredLogger;
};
/**
 * Default logger instance
 */
export declare const logger: StructuredLogger;
//# sourceMappingURL=structured-logger.d.ts.map