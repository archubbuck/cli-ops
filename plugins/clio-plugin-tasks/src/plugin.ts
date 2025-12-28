import { BasePlugin } from '@cli-ops/shared-plugins'
import type { PluginMetadata } from '@cli-ops/shared-types'

/**
 * Tasks plugin - Base plugin for task management
 */
export class TasksPlugin extends BasePlugin {
  readonly metadata: PluginMetadata = {
    name: '@cli-ops/clio-plugin-tasks',
    version: '3.0.0',
    description: 'Task management for developers',
  }

  override async init(): Promise<void> {
    // Define extension hooks that extensions can register handlers for
    this.defineExtensionHook('task:beforeCreate')
    this.defineExtensionHook('task:afterCreate')
    this.defineExtensionHook('task:beforeComplete')
    this.defineExtensionHook('task:afterComplete')
    this.defineExtensionHook('task:beforeUpdate')
    this.defineExtensionHook('task:afterUpdate')
    this.defineExtensionHook('task:beforeDelete')
    this.defineExtensionHook('task:afterDelete')
  }

  /**
   * Call the beforeCreate hook
   * Should be called from create command before task creation
   */
  async callBeforeCreateHook(taskData: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('task:beforeCreate', taskData)
    // Keep event emission for backward compatibility
    this.emit('task:beforeCreate', taskData)
  }

  /**
   * Call the afterCreate hook
   * Should be called from create command after task creation
   */
  async callAfterCreateHook(task: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('task:afterCreate', task)
    // Keep event emission for backward compatibility
    this.emit('task:created', task)
    this.emit('task:afterCreate', task)
  }

  /**
   * Call the beforeComplete hook
   * Should be called from update command before marking task as complete
   */
  async callBeforeCompleteHook(task: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('task:beforeComplete', task)
    this.emit('task:beforeComplete', task)
  }

  /**
   * Call the afterComplete hook
   * Should be called from update command after marking task as complete
   */
  async callAfterCompleteHook(task: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('task:afterComplete', task)
    // Keep event emission for backward compatibility
    this.emit('task:completed', task)
    this.emit('task:afterComplete', task)
  }

  /**
   * Call the beforeUpdate hook
   */
  async callBeforeUpdateHook(
    task: Record<string, unknown>,
    updates: Record<string, unknown>,
  ): Promise<void> {
    await this.callExtensionHook('task:beforeUpdate', { task, updates })
    this.emit('task:beforeUpdate', { task, updates })
  }

  /**
   * Call the afterUpdate hook
   */
  async callAfterUpdateHook(task: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('task:afterUpdate', task)
    this.emit('task:updated', task)
    this.emit('task:afterUpdate', task)
  }

  /**
   * Call the beforeDelete hook
   */
  async callBeforeDeleteHook(task: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('task:beforeDelete', task)
    this.emit('task:beforeDelete', task)
  }

  /**
   * Call the afterDelete hook
   */
  async callAfterDeleteHook(taskId: string): Promise<void> {
    await this.callExtensionHook('task:afterDelete', { id: taskId })
    this.emit('task:deleted', { id: taskId })
    this.emit('task:afterDelete', { id: taskId })
  }
}

// Export singleton instance
let tasksPluginInstance: TasksPlugin | undefined

export function getTasksPlugin(): TasksPlugin {
  if (!tasksPluginInstance) {
    tasksPluginInstance = new TasksPlugin()
  }
  return tasksPluginInstance
}
