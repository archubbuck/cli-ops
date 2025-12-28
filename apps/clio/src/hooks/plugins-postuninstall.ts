import { Hook } from '@oclif/core'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { homedir } from 'node:os'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const execAsync = promisify(exec)

/**
 * Hook that runs after a plugin is uninstalled
 * Automatically refreshes shell completions if they were previously set up
 */
export const hook: Hook<'plugins:postuninstall'> = async function () {
  // Only refresh if completions were previously configured
  const shell = getConfiguredShell()

  if (!shell) {
    // User hasn't set up completions yet, skip silently
    return
  }

  try {
    // Silently refresh completions for the configured shell
    await execAsync(`${this.config.bin} autocomplete ${shell} --refresh-cache`)
  } catch {
    // Fail silently - don't block plugin uninstallation
  }
}

/**
 * Detect which shell was previously configured for completions
 * by checking oclif's autocomplete cache directory
 */
function getConfiguredShell(): string | null {
  const cacheDir = join(homedir(), '.cache', 'clio', 'autocomplete')

  // Check for shell-specific completion cache files
  const shells = ['bash', 'zsh', 'fish', 'powershell']

  for (const shell of shells) {
    const completionFile = join(cacheDir, `${shell}_setup`)
    if (existsSync(completionFile)) {
      return shell
    }
  }

  return null
}

export default hook
