'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.symbols = exports.colors = void 0
exports.success = success
exports.error = error
exports.warning = warning
exports.info = info
exports.code = code
exports.link = link
exports.progressBar = progressBar
exports.list = list
exports.title = title
exports.section = section
const chalk_1 = __importDefault(require('chalk'))
/**
 * Colorblind-friendly color theme
 *
 * Based on research for ADHD/OCD users:
 * - High contrast
 * - Works for deuteranopia (red-green colorblindness)
 * - Distinct shapes/symbols in addition to colors
 */
exports.colors = {
  /**
   * Success - Blue instead of green (colorblind friendly)
   */
  success: chalk_1.default.blue,
  /**
   * Error - Orange-red instead of pure red
   */
  error: chalk_1.default.hex('#FF6B35'),
  /**
   * Warning - Yellow-orange
   */
  warning: chalk_1.default.hex('#FFA500'),
  /**
   * Info - Cyan
   */
  info: chalk_1.default.cyan,
  /**
   * Dim/muted text
   */
  dim: chalk_1.default.dim,
  /**
   * Bold/emphasis
   */
  bold: chalk_1.default.bold,
  /**
   * Highlight/accent
   */
  highlight: chalk_1.default.magenta,
  /**
   * URL/link
   */
  link: chalk_1.default.underline.cyan,
  /**
   * Code/monospace
   */
  code: chalk_1.default.hex('#F0F0F0').bgHex('#2A2A2A'),
}
exports.symbols = {
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
function success(message) {
  return `${exports.colors.success(exports.symbols.success)} ${message}`
}
/**
 * Format error message
 */
function error(message) {
  return `${exports.colors.error(exports.symbols.error)} ${message}`
}
/**
 * Format warning message
 */
function warning(message) {
  return `${exports.colors.warning(exports.symbols.warning)} ${message}`
}
/**
 * Format info message
 */
function info(message) {
  return `${exports.colors.info(exports.symbols.info)} ${message}`
}
/**
 * Format command/code
 */
function code(text) {
  return exports.colors.code(` ${text} `)
}
/**
 * Format URL/link
 */
function link(text, url) {
  return url
    ? `${exports.colors.link(text)} ${exports.colors.dim(`(${url})`)}`
    : exports.colors.link(text)
}
/**
 * Create a simple progress bar
 */
function progressBar(current, total, width = 20) {
  const percentage = current / total
  const filled = Math.floor(percentage * width)
  const empty = width - filled
  const bar =
    exports.symbols.progressBar.complete.repeat(filled) +
    exports.symbols.progressBar.incomplete.repeat(empty)
  const percent = Math.floor(percentage * 100)
  return `${bar} ${exports.colors.bold(`${percent}%`)}`
}
/**
 * Format a list with bullets
 */
function list(items) {
  return items.map((item) => `  ${exports.symbols.bullet} ${item}`).join('\n')
}
/**
 * Format a title/header
 */
function title(text) {
  return exports.colors.bold.underline(text)
}
/**
 * Format a section
 */
function section(heading, content) {
  return `${title(heading)}\n${content}`
}
//# sourceMappingURL=theme.js.map
