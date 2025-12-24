import cliProgress from 'cli-progress'
import type { SingleBar, MultiBar, Options } from 'cli-progress'

/**
 * Detect if running in CI or non-TTY environment
 */
function shouldDisableProgress(): boolean {
  return Boolean(
    !process.stdout.isTTY ||
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION
  )
}

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
export function createProgressBar(
  options: ProgressBarOptions
): ProgressBar {
  const {
    total,
    start = 0,
    format = '{bar} {percentage}% | ETA: {eta}s | {value}/{total}',
    hideCursor = true,
    clearOnComplete = false,
    enabled = !shouldDisableProgress(),
  } = options

  // In CI or non-TTY, create a no-op progress bar that just logs percentages
  if (!enabled) {
    let currentValue = start
    let lastLoggedPercentage = 0

    const noopBar: ProgressBar = {
      update: (value: number) => {
        currentValue = value
        const percentage = Math.floor((value / total) * 100)
        
        // Log every 10%
        if (percentage >= lastLoggedPercentage + 10) {
          console.log(`Progress: ${percentage}%`)
          lastLoggedPercentage = percentage
        }
      },
      increment: (delta = 1) => {
        noopBar.update(currentValue + delta)
      },
      stop: () => {
        if (currentValue >= total) {
          console.log('Progress: 100% (Complete)')
        }
      },
      getValue: () => currentValue,
      getTotal: () => total,
      isComplete: () => currentValue >= total,
    }

    return noopBar
  }

  const bar = new cliProgress.SingleBar(
    {
      format,
      hideCursor,
      clearOnComplete,
      stopOnComplete: false,
    },
    cliProgress.Presets.shades_classic
  )

  bar.start(total, start)

  return {
    update: (value: number, payload?: Record<string, unknown>) => {
      bar.update(value, payload)
    },
    increment: (delta = 1, payload?: Record<string, unknown>) => {
      bar.increment(delta, payload)
    },
    stop: () => {
      bar.stop()
    },
    getValue: () => bar.value ?? start,
    getTotal: () => bar.total ?? total,
    isComplete: () => (bar.value ?? start) >= (bar.total ?? total),
  }
}

/**
 * Helper to track progress of an async operation
 */
export async function withProgressBar<T>(
  total: number,
  fn: (bar: ProgressBar) => Promise<T>,
  options: Omit<ProgressBarOptions, 'total'> = {}
): Promise<T> {
  const bar = createProgressBar({ total, ...options })

  try {
    const result = await fn(bar)
    bar.stop()
    return result
  } catch (error) {
    bar.stop()
    throw error
  }
}

/**
 * Track progress of array processing
 */
export async function processWithProgress<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: Omit<ProgressBarOptions, 'total'> = {}
): Promise<R[]> {
  const results: R[] = []
  
  await withProgressBar(
    items.length,
    async bar => {
      for (let i = 0; i < items.length; i++) {
        results.push(await processor(items[i], i))
        bar.update(i + 1)
      }
    },
    options
  )

  return results
}
