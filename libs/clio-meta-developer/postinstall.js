#!/usr/bin/env node

const { execSync } = require('child_process')
const { existsSync } = require('fs')
const { resolve } = require('path')

process.stdout.write('Installing clio developer plugins...\n')

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

  process.stdout.write('\n✓ Developer environment configured successfully!\n')
  process.stdout.write('\nAvailable commands:\n')
  process.stdout.write('  clio tasks:create     - Create tasks\n')
  process.stdout.write('\nRun "clio --help" for more information.\n')

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
