import { Listr } from 'listr2'
import type { ListrTask, ListrRendererFactory, ListrDefaultRendererOptions } from 'listr2'

/**
 * Detect if running in CI or non-TTY environment
 */
function shouldUseSimpleRenderer(): boolean {
  return Boolean(
    !process.stdout.isTTY ||
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION
  )
}

export interface Task<TContext = unknown> {
  /**
   * Task title
   */
  title: string

  /**
   * Task function to execute
   */
  task: (ctx: TContext, task: TaskInstance) => Promise<void> | void

  /**
   * Whether task can be skipped
   */
  skip?: (ctx: TContext) => boolean | string | Promise<boolean | string>

  /**
   * Whether task is enabled
   */
  enabled?: (ctx: TContext) => boolean | Promise<boolean>

  /**
   * Subtasks
   */
  subtasks?: Task<TContext>[]
}

export interface TaskInstance {
  /**
   * Update task title
   */
  title: string

  /**
   * Update task output
   */
  output: string

  /**
   * Skip this task
   */
  skip(message?: string): void

  /**
   * Create subtasks
   */
  newListr<TSubContext = unknown>(
    tasks: Task<TSubContext>[],
    options?: TaskListOptions
  ): TaskList<TSubContext>
}

export interface TaskListOptions {
  /**
   * Run tasks concurrently
   * @default false
   */
  concurrent?: boolean

  /**
   * Exit on error
   * @default true
   */
  exitOnError?: boolean

  /**
   * Force specific renderer
   */
  renderer?: 'default' | 'verbose' | 'simple'

  /**
   * Context to pass to all tasks
   */
  context?: Record<string, unknown>
}

export interface TaskList<TContext = unknown> {
  /**
   * Run all tasks
   */
  run(context?: TContext): Promise<TContext>

  /**
   * Add a task dynamically
   */
  add(task: Task<TContext>): void
}

/**
 * Create a task list for multi-step operations
 */
export function createTaskList<TContext = unknown>(
  tasks: Task<TContext>[],
  options: TaskListOptions = {}
): TaskList<TContext> {
  const {
    concurrent = false,
    exitOnError = true,
    renderer: forcedRenderer,
    context = {} as TContext,
  } = options

  // Choose renderer based on environment
  let renderer: ListrRendererFactory<ListrDefaultRendererOptions> = 'default' as any
  
  if (forcedRenderer === 'simple' || shouldUseSimpleRenderer()) {
    renderer = 'simple' as any
  } else if (forcedRenderer === 'verbose') {
    renderer = 'verbose' as any
  }

  const listr = new Listr<TContext>(
    tasks as ListrTask<TContext, any>[],
    {
      concurrent,
      exitOnError,
      renderer,
      ctx: context,
    }
  )

  return {
    run: async (ctx?: TContext) => {
      return await listr.run(ctx)
    },
    add: (task: Task<TContext>) => {
      listr.add(task as ListrTask<TContext, any>)
    },
  }
}

/**
 * Helper to create a simple sequential task list
 */
export function createSequentialTasks<TContext = unknown>(
  tasks: Task<TContext>[],
  options: Omit<TaskListOptions, 'concurrent'> = {}
): TaskList<TContext> {
  return createTaskList(tasks, { ...options, concurrent: false })
}

/**
 * Helper to create concurrent task list
 */
export function createConcurrentTasks<TContext = unknown>(
  tasks: Task<TContext>[],
  options: Omit<TaskListOptions, 'concurrent'> = {}
): TaskList<TContext> {
  return createTaskList(tasks, { ...options, concurrent: true })
}

/**
 * Run a single task with a title
 */
export async function runTask<T>(
  title: string,
  fn: () => Promise<T>,
  options: TaskListOptions = {}
): Promise<T> {
  let result: T

  const tasks = createTaskList<{ result?: T }>(
    [
      {
        title,
        task: async ctx => {
          result = await fn()
          ctx.result = result
        },
      },
    ],
    options
  )

  await tasks.run()
  return result!
}
