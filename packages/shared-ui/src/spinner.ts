import ora, { type Ora, type Options as OraOptions } from 'ora'

/**
 * Detect if running in CI or non-TTY environment
 */
function shouldDisableSpinner(): boolean {
  return Boolean(
    !process.stdout.isTTY ||
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.CIRCLECI
  )
}

export interface SpinnerOptions {
  /**
   * Spinner text
   */
  text?: string

  /**
   * Spinner color
   * @default 'cyan'
   */
  color?: OraOptions['color']

  /**
   * Force enable/disable spinner
   */
  enabled?: boolean

  /**
   * Prefix text (before spinner)
   */
  prefixText?: string

  /**
   * Suffix text (after spinner)
   */
  suffixText?: string
}

export interface Spinner {
  /**
   * Start the spinner
   */
  start(text?: string): Spinner

  /**
   * Stop the spinner
   */
  stop(): Spinner

  /**
   * Mark as successful
   */
  succeed(text?: string): Spinner

  /**
   * Mark as failed
   */
  fail(text?: string): Spinner

  /**
   * Mark as warning
   */
  warn(text?: string): Spinner

  /**
   * Mark as info
   */
  info(text?: string): Spinner

  /**
   * Whether spinner is currently spinning
   */
  isSpinning: boolean

  /**
   * Update spinner text
   */
  text: string

  /**
   * Clear the spinner
   */
  clear(): Spinner

  /**
   * Render a frame manually (for non-TTY)
   */
  frame(): Spinner
}

/**
 * Create a spinner for loading states
 */
export function createSpinner(options: SpinnerOptions = {}): Spinner {
  const {
    text = '',
    color = 'cyan',
    enabled = !shouldDisableSpinner(),
    prefixText,
    suffixText,
  } = options

  // In CI or non-TTY, just log text without spinner
  if (!enabled) {
    const noopSpinner: Spinner = {
      start: (txt?: string) => {
        if (txt) console.log(txt)
        return noopSpinner
      },
      stop: () => noopSpinner,
      succeed: (txt?: string) => {
        if (txt) console.log(`✓ ${txt}`)
        return noopSpinner
      },
      fail: (txt?: string) => {
        if (txt) console.log(`✗ ${txt}`)
        return noopSpinner
      },
      warn: (txt?: string) => {
        if (txt) console.log(`⚠ ${txt}`)
        return noopSpinner
      },
      info: (txt?: string) => {
        if (txt) console.log(`ℹ ${txt}`)
        return noopSpinner
      },
      clear: () => noopSpinner,
      frame: () => noopSpinner,
      isSpinning: false,
      text: '',
    }
    return noopSpinner
  }

  const spinner = ora({
    text,
    color,
    prefixText,
    suffixText,
  })

  return spinner as Spinner
}

/**
 * Helper to wrap an async operation with spinner
 */
export async function withSpinner<T>(
  text: string,
  fn: (spinner: Spinner) => Promise<T>,
  options: Omit<SpinnerOptions, 'text'> = {}
): Promise<T> {
  const spinner = createSpinner({ text, ...options })
  spinner.start()

  try {
    const result = await fn(spinner)
    spinner.succeed()
    return result
  } catch (error) {
    spinner.fail()
    throw error
  }
}

/**
 * Run operation with spinner, customizing success/error messages
 */
export async function spinnerTask<T>(
  options: {
    start: string
    succeed?: string
    fail?: string
  } & Omit<SpinnerOptions, 'text'>,
  fn: (spinner: Spinner) => Promise<T>
): Promise<T> {
  const { start, succeed, fail, ...spinnerOptions } = options
  const spinner = createSpinner({ text: start, ...spinnerOptions })
  
  spinner.start()

  try {
    const result = await fn(spinner)
    spinner.succeed(succeed)
    return result
  } catch (error) {
    spinner.fail(fail)
    throw error
  }
}
