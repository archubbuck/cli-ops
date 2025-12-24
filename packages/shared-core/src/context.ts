import { homedir } from 'node:os'
import { join } from 'node:path'
import type { CLIContext } from '@/shared-types'

/**
 * Create CLI context
 */
export function createContext(options: {
  name: string
  version: string
  cwd?: string
}): CLIContext {
  const { name, version, cwd = process.cwd() } = options
  const home = homedir()

  // XDG Base Directory specification
  const configHome = process.env.XDG_CONFIG_HOME || join(home, '.config')
  const cacheHome = process.env.XDG_CACHE_HOME || join(home, '.cache')
  const dataHome = process.env.XDG_DATA_HOME || join(home, '.local', 'share')

  return {
    name,
    version,
    cwd,
    home,
    configDir: join(configHome, name),
    cacheDir: join(cacheHome, name),
    dataDir: join(dataHome, name),
    isCI: isCI(),
    isTTY: process.stdout.isTTY ?? false,
    env: process.env as Record<string, string | undefined>,
  }
}

/**
 * Check if running in CI
 */
function isCI(): boolean {
  return (
    process.env.CI === 'true' ||
    Boolean(
      process.env.CI ||
        process.env.CONTINUOUS_INTEGRATION ||
        process.env.BUILD_NUMBER ||
        process.env.GITHUB_ACTIONS ||
        process.env.GITLAB_CI ||
        process.env.CIRCLECI ||
        process.env.TRAVIS ||
        process.env.JENKINS_URL
    )
  )
}
