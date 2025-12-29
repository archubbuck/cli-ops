#!/usr/bin/env node

const { execSync } = require('child_process')

process.stdout.write('Installing all clio plugins...\n')

// Check if clio is installed
try {
  const clioPath = execSync('which clio', { encoding: 'utf8' }).trim()

  if (!clioPath) {
    console.warn('⚠️  clio command not found. Please ensure @cli-ops/clio is installed globally.')
    process.exit(0)
  }

  // Note: Additional plugins like @cli-ops/clio-plugin-fetch and @cli-ops/clio-plugin-repo
  // can be installed manually when they become available:
  //   clio plugins:install @cli-ops/clio-plugin-fetch
  //   clio plugins:install @cli-ops/clio-plugin-repo

  process.stdout.write('\n✓ All available plugins are configured!\n')
  process.stdout.write('\nAvailable commands:\n')
  process.stdout.write('  clio tasks:*    - Task management (bundled)\n')
  process.stdout.write('\nRun "clio --help" for complete command list.\n')

  // Prompt for shell completions setup (only in interactive terminals)
  const isCI = Boolean(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.CIRCLECI ||
    process.env.TRAVIS ||
    process.env.JENKINS_URL,
  )

  const isTTY = process.stdout.isTTY
  const skipSetup = process.env.CLI_OPS_SETUP_COMPLETIONS === 'true'

  if (!isCI && isTTY && !skipSetup) {
    process.stdout.write('\n💡 Tip: Set up shell completions for command auto-completion:\n')
    process.stdout.write('  clio setup\n')
    process.stdout.write('\nOr run this later at any time.\n')
  }
} catch (error) {
  console.error('Error during plugin setup:', error.message)
  process.exit(0)
}
