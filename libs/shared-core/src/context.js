'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.createContext = createContext
const node_os_1 = require('node:os')
const node_path_1 = require('node:path')
/**
 * Create CLI context
 */
function createContext(options) {
  const { name, version, cwd = process.cwd() } = options
  const home = (0, node_os_1.homedir)()
  // XDG Base Directory specification
  const configHome = process.env['XDG_CONFIG_HOME'] || (0, node_path_1.join)(home, '.config')
  const cacheHome = process.env['XDG_CACHE_HOME'] || (0, node_path_1.join)(home, '.cache')
  const dataHome = process.env['XDG_DATA_HOME'] || (0, node_path_1.join)(home, '.local', 'share')
  return {
    name,
    version,
    cwd,
    home,
    configDir: (0, node_path_1.join)(configHome, name),
    cacheDir: (0, node_path_1.join)(cacheHome, name),
    dataDir: (0, node_path_1.join)(dataHome, name),
    isCI: isCI(),
    isTTY: process.stdout.isTTY ?? false,
    env: process.env,
  }
}
/**
 * Check if running in CI
 */
function isCI() {
  return (
    process.env['CI'] === 'true' ||
    Boolean(
      process.env['CI'] ||
      process.env['CONTINUOUS_INTEGRATION'] ||
      process.env['BUILD_NUMBER'] ||
      process.env['GITHUB_ACTIONS'] ||
      process.env['GITLAB_CI'] ||
      process.env['CIRCLECI'] ||
      process.env['TRAVIS'] ||
      process.env['JENKINS_URL'],
    )
  )
}
//# sourceMappingURL=context.js.map
