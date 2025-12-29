export interface ProgressBarOptions {
  /**
   * Total value for progress (e.g., 100 for percentage)
   */
  total: number
  /**
   * Starting value
   * @default 0
   */
  start?: number
  /**
   * Format string for progress display
   * @default '{bar} {percentage}% | ETA: {eta}s | {value}/{total}'
   */
  format?: string
  /**
   * Hide cursor during progress
   * @default true
   */
  hideCursor?: boolean
  /**
   * Clear progress bar on completion
   * @default false
   */
  clearOnComplete?: boolean
  /**
   * Force enable/disable progress bar
   */
  enabled?: boolean
}
export interface ProgressBar {
  /**
   * Update progress value
   */
  update(value: number, payload?: Record<string, unknown>): void
  /**
   * Increment progress by amount
   */
  increment(delta?: number, payload?: Record<string, unknown>): void
  /**
   * Stop and remove the progress bar
   */
  stop(): void
  /**
   * Get current progress value
   */
  getValue(): number
  /**
   * Get total value
   */
  getTotal(): number
  /**
   * Check if progress is complete
   */
  isComplete(): boolean
}
/**
 * Create a progress bar for long-running operations
 */
export declare function createProgressBar(options: ProgressBarOptions): ProgressBar
/**
 * Helper to track progress of an async operation
 */
export declare function withProgressBar<T>(
  total: number,
  fn: (bar: ProgressBar) => Promise<T>,
  options?: Omit<ProgressBarOptions, 'total'>,
): Promise<T>
/**
 * Track progress of array processing
 */
export declare function processWithProgress<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options?: Omit<ProgressBarOptions, 'total'>,
): Promise<R[]>
//# sourceMappingURL=progress.d.ts.map
