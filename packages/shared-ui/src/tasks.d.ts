export interface Task<TContext = unknown> {
    /**
     * Task title
     */
    title: string;
    /**
     * Task function to execute
     */
    task: (ctx: TContext, task: TaskInstance) => Promise<void> | void;
    /**
     * Whether task can be skipped
     */
    skip?: (ctx: TContext) => boolean | string | Promise<boolean | string>;
    /**
     * Whether task is enabled
     */
    enabled?: (ctx: TContext) => boolean | Promise<boolean>;
    /**
     * Subtasks
     */
    subtasks?: Task<TContext>[];
}
export interface TaskInstance {
    /**
     * Update task title
     */
    title: string;
    /**
     * Update task output
     */
    output: string;
    /**
     * Skip this task
     */
    skip(message?: string): void;
    /**
     * Create subtasks
     */
    newListr<TSubContext = unknown>(tasks: Task<TSubContext>[], options?: TaskListOptions): TaskList<TSubContext>;
}
export interface TaskListOptions {
    /**
     * Run tasks concurrently
     * @default false
     */
    concurrent?: boolean;
    /**
     * Exit on error
     * @default true
     */
    exitOnError?: boolean;
    /**
     * Force specific renderer
     */
    renderer?: 'default' | 'verbose' | 'simple';
    /**
     * Context to pass to all tasks
     */
    context?: Record<string, unknown>;
}
export interface TaskList<TContext = unknown> {
    /**
     * Run all tasks
     */
    run(context?: TContext): Promise<TContext>;
    /**
     * Add a task dynamically
     */
    add(task: Task<TContext>): void;
}
/**
 * Create a task list for multi-step operations
 */
export declare function createTaskList<TContext = unknown>(tasks: Task<TContext>[], options?: TaskListOptions): TaskList<TContext>;
/**
 * Helper to create a simple sequential task list
 */
export declare function createSequentialTasks<TContext = unknown>(tasks: Task<TContext>[], options?: Omit<TaskListOptions, 'concurrent'>): TaskList<TContext>;
/**
 * Helper to create concurrent task list
 */
export declare function createConcurrentTasks<TContext = unknown>(tasks: Task<TContext>[], options?: Omit<TaskListOptions, 'concurrent'>): TaskList<TContext>;
/**
 * Run a single task with a title
 */
export declare function runTask<T>(title: string, fn: () => Promise<T>, options?: TaskListOptions): Promise<T>;
//# sourceMappingURL=tasks.d.ts.map