'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.createProgressBar = createProgressBar
exports.withProgressBar = withProgressBar
exports.processWithProgress = processWithProgress
const cli_progress_1 = __importDefault(require('cli-progress'))
/**
 * Detect if running in CI or non-TTY environment
 */
function shouldDisableProgress() {
  return Boolean(
    !process.stdout.isTTY || process.env['CI'] || process.env['CONTINUOUS_INTEGRATION'],
  )
}
/**
 * Create a progress bar for long-running operations
 */
function createProgressBar(options) {
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
    const noopBar = {
      update: (value) => {
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
  const bar = new cli_progress_1.default.SingleBar(
    {
      format,
      hideCursor,
      clearOnComplete,
      stopOnComplete: false,
    },
    cli_progress_1.default.Presets.shades_classic,
  )
  bar.start(total, start)
  return {
    update: (value, payload) => {
      bar.update(value, payload)
    },
    increment: (delta = 1, payload) => {
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
async function withProgressBar(total, fn, options = {}) {
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
async function processWithProgress(items, processor, options = {}) {
  const results = []
  await withProgressBar(
    items.length,
    async (bar) => {
      for (let i = 0; i < items.length; i++) {
        results.push(await processor(items[i], i))
        bar.update(i + 1)
      }
    },
    options,
  )
  return results
}
//# sourceMappingURL=progress.js.map
