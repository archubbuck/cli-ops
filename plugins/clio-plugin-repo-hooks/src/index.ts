import { BaseExtensionPlugin } from '@cli-ops/shared-plugins'
import type { PluginMetadata } from '@cli-ops/shared-types'

/**
 * Git hooks automation plugin for clio repo
 */
export class GitHooksPlugin extends BaseExtensionPlugin {
  readonly metadata: PluginMetadata = {
    name: '@cli-ops/clio-plugin-repo-hooks',
    version: '3.0.0',
    description: 'Automated Git hooks management and execution',
  }

  override async init(): Promise<void> {
    // Register this extension with its parent plugin
    this.registerExtension('@cli-ops/clio-plugin-repo')

    // Register hooks for parent plugin extension points
    this.registerHook('repo:beforeCommit', this.runPreCommitHooks.bind(this))
    this.registerHook('repo:afterCommit', this.runPostCommitHooks.bind(this))
    this.registerHook('repo:beforePush', this.runPrePushHooks.bind(this))

    // Keep event listeners for backward compatibility
    this.on('git:commit:before', this.runPreCommitChecks.bind(this))
    this.on('git:push:before', this.runPrePushChecks.bind(this))

    this.emit('hooks:plugin:ready', {
      version: this.metadata.version,
    })
  }

  override async destroy(): Promise<void> {
    this.off('git:commit:before', this.runPreCommitChecks.bind(this))
    this.off('git:push:before', this.runPrePushChecks.bind(this))
  }

  // Hook handlers (new primary interface)
  private runPreCommitHooks(_data: Record<string, unknown>): void {
    // Run automated checks before commit
    // Could run linting, tests, etc.
  }

  private runPostCommitHooks(_data: Record<string, unknown>): void {
    // Run actions after successful commit
  }

  private runPrePushHooks(_data: Record<string, unknown>): void {
    // Run checks before push
    // Could run full test suite, check for secrets, etc.
  }

  // Event handlers (legacy/compatibility)
  private runPreCommitChecks(_data: unknown): void {
    // Legacy event-based pre-commit checks
  }

  private runPrePushChecks(_data: unknown): void {
    // Legacy event-based pre-push checks
  }
}

export default GitHooksPlugin
