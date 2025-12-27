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
    namespace: string;
    /**
     * Whether to enable by default (overrides DEBUG env var)
     */
    enabled?: boolean;
}
export interface DebugLogger {
    /**
     * Log a debug message
     */
    (message: string, ...args: unknown[]): void;
    /**
     * Log with formatter
     */
    (formatter: string, ...args: unknown[]): void;
    /**
     * Whether this logger is enabled
     */
    enabled: boolean;
    /**
     * The namespace for this logger
     */
    namespace: string;
    /**
     * Create a sub-logger with extended namespace
     */
    extend(subNamespace: string): DebugLogger;
}
/**
 * Create a debug logger with namespace
 */
export declare function createDebugLogger(options: string | DebugLoggerOptions): DebugLogger;
/**
 * Check if debug logging is enabled for a namespace
 */
export declare function isDebugEnabled(namespace: string): boolean;
/**
 * Enable debug logging for namespace(s)
 */
export declare function enableDebug(namespaces: string): void;
/**
 * Disable debug logging for namespace(s)
 */
export declare function disableDebug(namespaces: string): void;
/**
 * Create a logger factory for a base namespace
 */
export declare function createLoggerFactory(baseNamespace: string): {
    /**
     * Create logger for a sub-namespace
     */
    create(subNamespace: string): DebugLogger;
    /**
     * Create logger with full namespace
     */
    createRaw(namespace: string): DebugLogger;
    /**
     * Check if any loggers in this namespace are enabled
     */
    isEnabled(): boolean;
};
//# sourceMappingURL=debug-logger.d.ts.map