import { BasePlugin } from '@cli-ops/shared-plugins'
import type { PluginMetadata } from '@cli-ops/shared-types'

/**
 * Repo plugin - Base plugin for Git repository management
 */
export class RepoPlugin extends BasePlugin {
  readonly metadata: PluginMetadata = {
    name: '@cli-ops/clio-plugin-repo',
    version: '3.0.0',
    description: 'Git repository management and GitHub integration',
  }

  override async init(): Promise<void> {
    // Define extension hooks that extensions can register handlers for
    this.defineExtensionHook('repo:beforeCommit')
    this.defineExtensionHook('repo:afterCommit')
    this.defineExtensionHook('repo:beforePush')
    this.defineExtensionHook('repo:afterPush')
    this.defineExtensionHook('repo:beforePull')
    this.defineExtensionHook('repo:afterPull')
  }

  /**
   * Call the beforeCommit hook
   * Should be called before making a Git commit
   */
  async callBeforeCommitHook(commitData: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('repo:beforeCommit', commitData)
    // Keep event emission for backward compatibility
    this.emit('git:commit:before', commitData)
    this.emit('repo:beforeCommit', commitData)
  }

  /**
   * Call the afterCommit hook
   * Should be called after making a Git commit
   */
  async callAfterCommitHook(commitResult: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('repo:afterCommit', commitResult)
    this.emit('git:commit:after', commitResult)
    this.emit('repo:afterCommit', commitResult)
  }

  /**
   * Call the beforePush hook
   * Should be called before pushing to remote
   */
  async callBeforePushHook(pushData: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('repo:beforePush', pushData)
    // Keep event emission for backward compatibility
    this.emit('git:push:before', pushData)
    this.emit('repo:beforePush', pushData)
  }

  /**
   * Call the afterPush hook
   * Should be called after pushing to remote
   */
  async callAfterPushHook(pushResult: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('repo:afterPush', pushResult)
    this.emit('git:push:after', pushResult)
    this.emit('repo:afterPush', pushResult)
  }

  /**
   * Call the beforePull hook
   */
  async callBeforePullHook(pullData: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('repo:beforePull', pullData)
    this.emit('git:pull:before', pullData)
    this.emit('repo:beforePull', pullData)
  }

  /**
   * Call the afterPull hook
   */
  async callAfterPullHook(pullResult: Record<string, unknown>): Promise<void> {
    await this.callExtensionHook('repo:afterPull', pullResult)
    this.emit('git:pull:after', pullResult)
    this.emit('repo:afterPull', pullResult)
  }
}

// Export singleton instance
let repoPluginInstance: RepoPlugin | undefined

export function getRepoPlugin(): RepoPlugin {
  if (!repoPluginInstance) {
    repoPluginInstance = new RepoPlugin()
  }
  return repoPluginInstance
}
