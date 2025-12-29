'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.createTaskList = createTaskList
exports.createSequentialTasks = createSequentialTasks
exports.createConcurrentTasks = createConcurrentTasks
exports.runTask = runTask
const listr2_1 = require('listr2')
/**
 * Detect if running in CI or non-TTY environment
 */
function shouldUseSimpleRenderer() {
  return Boolean(
    !process.stdout.isTTY || process.env['CI'] || process.env['CONTINUOUS_INTEGRATION'],
  )
}
/**
 * Create a task list for multi-step operations
 */
function createTaskList(tasks, options = {}) {
  const { concurrent = false, exitOnError = true, renderer: forcedRenderer, context = {} } = options
  // Choose renderer based on environment
  let renderer = 'default'
  if (forcedRenderer === 'simple' || shouldUseSimpleRenderer()) {
    renderer = 'simple'
  } else if (forcedRenderer === 'verbose') {
    renderer = 'verbose'
  }
  const listr = new listr2_1.Listr(tasks, {
    concurrent,
    exitOnError,
    renderer: renderer,
    ctx: context,
  })
  return {
    run: async (ctx) => {
      return await listr.run(ctx)
    },
    add: (task) => {
      listr.add(task)
    },
  }
}
/**
 * Helper to create a simple sequential task list
 */
function createSequentialTasks(tasks, options = {}) {
  return createTaskList(tasks, { ...options, concurrent: false })
}
/**
 * Helper to create concurrent task list
 */
function createConcurrentTasks(tasks, options = {}) {
  return createTaskList(tasks, { ...options, concurrent: true })
}
/**
 * Run a single task with a title
 */
async function runTask(title, fn, options = {}) {
  let result
  const tasks = createTaskList(
    [
      {
        title,
        task: async (ctx) => {
          result = await fn()
          ctx.result = result
        },
      },
    ],
    options,
  )
  await tasks.run()
  return result
}
//# sourceMappingURL=tasks.js.map
