#!/usr/bin/env node

const { execSync } = require('child_process')
const { existsSync } = require('fs')
const { resolve } = require('path')

console.log('Installing clio developer plugins...')

// Check if clio is installed
try {
  const clioPath = execSync('which clio', { encoding: 'utf8' }).trim()

  if (!clioPath) {
    console.warn('⚠️  clio command not found. Please ensure @cli-ops/clio is installed globally.')
    process.exit(0)
  }

  // Install fetch plugin
  console.log('Installing @cli-ops/clio-plugin-fetch...')
  try {
    execSync('clio plugins:install @cli-ops/clio-plugin-fetch', {
      stdio: 'inherit',
      encoding: 'utf8',
    })
    console.log('✓ Installed @cli-ops/clio-plugin-fetch')
  } catch (error) {
    console.error('✗ Failed to install @cli-ops/clio-plugin-fetch:', error.message)
  }

  // Install repo plugin
  console.log('Installing @cli-ops/clio-plugin-repo...')
  try {
    execSync('clio plugins:install @cli-ops/clio-plugin-repo', {
      stdio: 'inherit',
      encoding: 'utf8',
    })
    console.log('✓ Installed @cli-ops/clio-plugin-repo')
  } catch (error) {
    console.error('✗ Failed to install @cli-ops/clio-plugin-repo:', error.message)
  }

  console.log('\n✓ Developer plugins installed successfully!')
  console.log('\nAvailable commands:')
  console.log('  clio tasks:create     - Create tasks')
  console.log('  clio fetch:get        - Make HTTP requests')
  console.log('  clio repo:status      - Check repository status')
  console.log('\nRun "clio --help" for more information.')

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
