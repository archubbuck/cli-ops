import chalk from 'chalk'

/**
 * Colorblind-friendly color theme
 * 
 * Based on research for ADHD/OCD users:
 * - High contrast
 * - Works for deuteranopia (red-green colorblindness)
 * - Distinct shapes/symbols in addition to colors
 */

export const colors = {
  /**
   * Success - Blue instead of green (colorblind friendly)
   */
  success: chalk.blue,

  /**
   * Error - Orange-red instead of pure red
   */
  error: chalk.hex('#FF6B35'),

  /**
   * Warning - Yellow-orange
   */
  warning: chalk.hex('#FFA500'),

  /**
   * Info - Cyan
   */
  info: chalk.cyan,

  /**
   * Dim/muted text
   */
  dim: chalk.dim,

  /**
   * Bold/emphasis
   */
  bold: chalk.bold,

  /**
   * Highlight/accent
   */
  highlight: chalk.magenta,

  /**
   * URL/link
   */
  link: chalk.underline.cyan,

  /**
   * Code/monospace
   */
  code: chalk.hex('#F0F0F0').bgHex('#2A2A2A'),
}

export const symbols = {
  /**
   * Success checkmark
   */
  success: '✓',

  /**
   * Error cross
   */
  error: '✗',

  /**
   * Warning triangle
   */
  warning: '⚠',

  /**
   * Info circle
   */
  info: 'ℹ',

  /**
   * Arrow/pointer
   */
  pointer: '→',

  /**
   * Bullet point
   */
  bullet: '•',

  /**
   * Loading/spinner
   */
  loading: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏',

  /**
   * Progress bar components
   */
  progressBar: {
    complete: '█',
    incomplete: '░',
  },
}

/**
 * Format success message
 */
export function success(message: string): string {
  return `${colors.success(symbols.success)} ${message}`
}

/**
 * Format error message
 */
export function error(message: string): string {
  return `${colors.error(symbols.error)} ${message}`
}

/**
 * Format warning message
 */
export function warning(message: string): string {
  return `${colors.warning(symbols.warning)} ${message}`
}

/**
 * Format info message
 */
export function info(message: string): string {
  return `${colors.info(symbols.info)} ${message}`
}

/**
 * Format command/code
 */
export function code(text: string): string {
  return colors.code(` ${text} `)
}

/**
 * Format URL/link
 */
export function link(text: string, url?: string): string {
  return url ? `${colors.link(text)} ${colors.dim(`(${url})`)}` : colors.link(text)
}

/**
 * Create a simple progress bar
 */
export function progressBar(
  current: number,
  total: number,
  width = 20
): string {
  const percentage = current / total
  const filled = Math.floor(percentage * width)
  const empty = width - filled

  const bar =
    symbols.progressBar.complete.repeat(filled) +
    symbols.progressBar.incomplete.repeat(empty)

  const percent = Math.floor(percentage * 100)

  return `${bar} ${colors.bold(`${percent}%`)}`
}

/**
 * Format a list with bullets
 */
export function list(items: string[]): string {
  return items.map(item => `  ${symbols.bullet} ${item}`).join('\n')
}

/**
 * Format a title/header
 */
export function title(text: string): string {
  return colors.bold.underline(text)
}

/**
 * Format a section
 */
export function section(heading: string, content: string): string {
  return `${title(heading)}\n${content}`
}
