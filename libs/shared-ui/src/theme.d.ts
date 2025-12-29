/**
 * Colorblind-friendly color theme
 *
 * Based on research for ADHD/OCD users:
 * - High contrast
 * - Works for deuteranopia (red-green colorblindness)
 * - Distinct shapes/symbols in addition to colors
 */
export declare const colors: {
  /**
   * Success - Blue instead of green (colorblind friendly)
   */
  success: import('chalk').ChalkInstance
  /**
   * Error - Orange-red instead of pure red
   */
  error: import('chalk').ChalkInstance
  /**
   * Warning - Yellow-orange
   */
  warning: import('chalk').ChalkInstance
  /**
   * Info - Cyan
   */
  info: import('chalk').ChalkInstance
  /**
   * Dim/muted text
   */
  dim: import('chalk').ChalkInstance
  /**
   * Bold/emphasis
   */
  bold: import('chalk').ChalkInstance
  /**
   * Highlight/accent
   */
  highlight: import('chalk').ChalkInstance
  /**
   * URL/link
   */
  link: import('chalk').ChalkInstance
  /**
   * Code/monospace
   */
  code: import('chalk').ChalkInstance
}
export declare const symbols: {
  /**
   * Success checkmark
   */
  success: string
  /**
   * Error cross
   */
  error: string
  /**
   * Warning triangle
   */
  warning: string
  /**
   * Info circle
   */
  info: string
  /**
   * Arrow/pointer
   */
  pointer: string
  /**
   * Bullet point
   */
  bullet: string
  /**
   * Loading/spinner
   */
  loading: string
  /**
   * Progress bar components
   */
  progressBar: {
    complete: string
    incomplete: string
  }
}
/**
 * Format success message
 */
export declare function success(message: string): string
/**
 * Format error message
 */
export declare function error(message: string): string
/**
 * Format warning message
 */
export declare function warning(message: string): string
/**
 * Format info message
 */
export declare function info(message: string): string
/**
 * Format command/code
 */
export declare function code(text: string): string
/**
 * Format URL/link
 */
export declare function link(text: string, url?: string): string
/**
 * Create a simple progress bar
 */
export declare function progressBar(current: number, total: number, width?: number): string
/**
 * Format a list with bullets
 */
export declare function list(items: string[]): string
/**
 * Format a title/header
 */
export declare function title(text: string): string
/**
 * Format a section
 */
export declare function section(heading: string, content: string): string
//# sourceMappingURL=theme.d.ts.map
