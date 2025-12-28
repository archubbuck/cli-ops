import { type Options as OraOptions } from 'ora';
export interface SpinnerOptions {
    /**
     * Spinner text
     */
    text?: string;
    /**
     * Spinner color
     * @default 'cyan'
     */
    color?: OraOptions['color'];
    /**
     * Force enable/disable spinner
     */
    enabled?: boolean;
    /**
     * Prefix text (before spinner)
     */
    prefixText?: string;
    /**
     * Suffix text (after spinner)
     */
    suffixText?: string;
}
export interface Spinner {
    /**
     * Start the spinner
     */
    start(text?: string): Spinner;
    /**
     * Stop the spinner
     */
    stop(): Spinner;
    /**
     * Mark as successful
     */
    succeed(text?: string): Spinner;
    /**
     * Mark as failed
     */
    fail(text?: string): Spinner;
    /**
     * Mark as warning
     */
    warn(text?: string): Spinner;
    /**
     * Mark as info
     */
    info(text?: string): Spinner;
    /**
     * Whether spinner is currently spinning
     */
    isSpinning: boolean;
    /**
     * Update spinner text
     */
    text: string;
    /**
     * Clear the spinner
     */
    clear(): Spinner;
    /**
     * Render a frame manually (for non-TTY)
     */
    frame(): Spinner;
}
/**
 * Create a spinner for loading states
 */
export declare function createSpinner(options?: SpinnerOptions): Spinner;
/**
 * Helper to wrap an async operation with spinner
 */
export declare function withSpinner<T>(text: string, fn: (spinner: Spinner) => Promise<T>, options?: Omit<SpinnerOptions, 'text'>): Promise<T>;
/**
 * Run operation with spinner, customizing success/error messages
 */
export declare function spinnerTask<T>(options: {
    start: string;
    succeed?: string;
    fail?: string;
} & Omit<SpinnerOptions, 'text'>, fn: (spinner: Spinner) => Promise<T>): Promise<T>;
//# sourceMappingURL=spinner.d.ts.map