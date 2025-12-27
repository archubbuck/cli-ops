import { BaseCommand } from '@cli-ops/shared-commands'
import { SUCCESS } from '@cli-ops/shared-exit-codes'
import { createSpinner } from '@cli-ops/shared-ui'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

export default class Doctor extends BaseCommand {
  static override description = 'Check clio installation health'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    ...BaseCommand.baseFlags,
  }

  protected async execute(): Promise<void> {
    const spinner = createSpinner({ text: 'Running diagnostics...' }).start()
    const issues: string[] = []
    const warnings: string[] = []

    // Check configuration directory
    const configDir = join(homedir(), '.config', 'clio')
    if (!existsSync(configDir)) {
      warnings.push(`Configuration directory not found: ${configDir}`)
    } else {
      this.logger.debug(`✓ Configuration directory exists: ${configDir}`)
    }

    // Check data directory
    const dataDir = join(homedir(), '.local', 'share', 'clio')
    if (!existsSync(dataDir)) {
      warnings.push(`Data directory not found: ${dataDir}`)
    } else {
      this.logger.debug(`✓ Data directory exists: ${dataDir}`)
    }

    // Check plugin directory
    const pluginDir = join(homedir(), '.clio', 'plugins')
    if (!existsSync(pluginDir)) {
      warnings.push(`Plugin directory not found: ${pluginDir}`)
    } else {
      this.logger.debug(`✓ Plugin directory exists: ${pluginDir}`)
    }

    // Check Node.js version
    const nodeVersion = process.version
    const versionParts = nodeVersion.slice(1).split('.')
    const majorVersion = parseInt(versionParts[0] ?? '0', 10)
    if (majorVersion < 20) {
      issues.push(`Node.js version ${nodeVersion} is below required version 20.x`)
    } else {
      this.logger.debug(`✓ Node.js version: ${nodeVersion}`)
    }

    spinner.stop()

    // Report results
    if (issues.length === 0 && warnings.length === 0) {
      this.logger.info('✓ All checks passed! Clio is healthy.')
    } else {
      if (issues.length > 0) {
        this.logger.error('Issues found:')
        issues.forEach((issue) => this.logger.error(`  ✗ ${issue}`))
      }

      if (warnings.length > 0) {
        this.logger.warn('Warnings:')
        warnings.forEach((warning) => this.logger.warn(`  ⚠ ${warning}`))
      }

      if (issues.length > 0) {
        this.logger.error('\nPlease fix the issues above before using clio.')
        this.exit(1)
      }
    }

    this.exit(SUCCESS)
  }
}
