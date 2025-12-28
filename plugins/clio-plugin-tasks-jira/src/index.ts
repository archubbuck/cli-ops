import { BaseExtensionPlugin } from '@cli-ops/shared-plugins'
import type { PluginMetadata } from '@cli-ops/shared-types'

/**
 * Jira integration plugin for clio tasks
 */
export class JiraPlugin extends BaseExtensionPlugin {
  readonly metadata: PluginMetadata = {
    name: '@cli-ops/clio-plugin-tasks-jira',
    version: '3.0.0',
    description: 'Jira integration for task management',
  }

  override async init(): Promise<void> {
    // Register this extension with its parent plugin
    this.registerExtension('@cli-ops/clio-plugin-tasks')

    // Register hooks for parent plugin extension points
    this.registerHook('task:beforeCreate', this.enrichTaskWithJira.bind(this))
    this.registerHook('task:afterCreate', this.syncTaskToJira.bind(this))
    this.registerHook('task:beforeComplete', this.validateJiraStatus.bind(this))
    this.registerHook('task:afterComplete', this.updateJiraStatus.bind(this))

    // Keep event listeners for backward compatibility
    this.on('task:created', this.handleTaskCreated.bind(this))
    this.on('task:completed', this.handleTaskCompleted.bind(this))

    this.emit('jira:plugin:ready', {
      version: this.metadata.version,
    })
  }

  override async destroy(): Promise<void> {
    // Cleanup event listeners
    this.off('task:created', this.handleTaskCreated.bind(this))
    this.off('task:completed', this.handleTaskCompleted.bind(this))
  }

  // Hook handlers (new primary interface)
  private enrichTaskWithJira(_data: Record<string, unknown>): void {
    // Validate or enrich task data before creation
    if (_data['jiraId']) {
      // Could fetch Jira issue details and add to task metadata
    }
  }

  private syncTaskToJira(_data: Record<string, unknown>): void {
    // Sync newly created task to Jira
  }

  private validateJiraStatus(_data: Record<string, unknown>): void {
    // Validate Jira status before completing task
  }

  private updateJiraStatus(_data: Record<string, unknown>): void {
    // Update Jira issue status after task completion
  }

  // Event handlers (legacy/compatibility)
  private handleTaskCreated(_data: unknown): void {
    // Legacy event-based task created handler
  }

  private handleTaskCompleted(_data: unknown): void {
    // Legacy event-based task completed handler
  }
}

export default JiraPlugin
