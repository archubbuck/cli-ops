#!/usr/bin/env node

const { execSync } = require('child_process')

console.log('Installing all clio plugins...')

// Check if clio is installed
try {
  const clioPath = execSync('which clio', { encoding: 'utf8' }).trim()

  if (!clioPath) {
    console.warn('⚠️  clio command not found. Please ensure @cli-ops/clio is installed globally.')
    process.exit(0)
  }

  const plugins = ['@cli-ops/clio-plugin-fetch', '@cli-ops/clio-plugin-repo']

  for (const plugin of plugins) {
    console.log(`Installing ${plugin}...`)
    try {
      execSync(`clio plugins:install ${plugin}`, {
        stdio: 'inherit',
        encoding: 'utf8',
      })
      console.log(`✓ Installed ${plugin}`)
    } catch (error) {
      console.error(`✗ Failed to install ${plugin}:`, error.message)
    }
  }

  console.log('\n✓ All plugins installed successfully!')
  console.log('\nAvailable commands:')
  console.log('  clio tasks:*    - Task management (bundled)')
  console.log('  clio fetch:*    - HTTP API client')
  console.log('  clio repo:*     - Repository tools')
  console.log('\nRun "clio --help" for complete command list.')

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
    console.log('\n💡 Tip: Set up shell completions for command auto-completion:')
    console.log('  clio setup')
    console.log('\nOr run this later at any time.')
  }
} catch (error) {
  console.error('Error during plugin installation:', error.message)
  console.log('\n⚠️  You can manually install plugins later with:')
  console.log('  clio plugins:install @cli-ops/clio-plugin-fetch')
  console.log('  clio plugins:install @cli-ops/clio-plugin-repo')
  process.exit(0)
}
