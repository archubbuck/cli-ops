/**
 * Base error class with exit code
 */
export declare class CLIError extends Error {
    readonly exitCode: number;
    readonly suggestions?: string[];
    constructor(message: string, options?: {
        exitCode?: number;
        cause?: Error;
        suggestions?: string[];
    });
}
/**
 * Validation error
 */
export declare class ValidationError extends CLIError {
    constructor(message: string, options?: {
        cause?: Error;
        suggestions?: string[];
    });
}
/**
 * Configuration error
 */
export declare class ConfigError extends CLIError {
    constructor(message: string, options?: {
        cause?: Error;
        suggestions?: string[];
    });
}
/**
 * Not found error
 */
export declare class NotFoundError extends CLIError {
    constructor(resource: string, options?: {
        cause?: Error;
        suggestions?: string[];
    });
}
/**
 * Authentication error
 */
export declare class AuthError extends CLIError {
    constructor(message: string, options?: {
        cause?: Error;
        suggestions?: string[];
    });
}
/**
 * Authorization error
 */
export declare class AuthorizationError extends CLIError {
    constructor(message: string, options?: {
        cause?: Error;
        suggestions?: string[];
    });
}
/**
 * Network error
 */
export declare class NetworkError extends CLIError {
    constructor(message: string, options?: {
        cause?: Error;
        suggestions?: string[];
    });
}
/**
 * Check if error is a CLI error
 */
export declare function isCLIError(error: unknown): error is CLIError;
/**
 * Format error for display
 */
export declare function formatError(error: Error): string;
//# sourceMappingURL=error.d.ts.map