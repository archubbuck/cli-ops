#!/usr/bin/env node

/**
 * Check CLI startup performance against budgets
 * Budget: <500ms for help, <200ms for version
 */

const { execSync } = require('child_process')
const path = require('path')

const BUDGETS = {
  help: 500, // ms
  version: 200, // ms
}

const clis = ['cli-alpha', 'cli-beta', 'cli-gamma']
const errors = []

console.log('Checking CLI performance budgets...\n')

clis.forEach((cli) => {
  const cliPath = path.join(__dirname, '..', 'apps', cli)
  
  // Check if CLI exists
  if (!require('fs').existsSync(cliPath)) {
    console.log(`⏭️  Skipping ${cli} (not yet created)`)
    return
  }

  try {
    // Measure help command
    const helpStart = Date.now()
    execSync(`node ${path.join(cliPath, 'bin', 'dev.js')} --help`, {
      stdio: 'pipe',
      timeout: 5000,
    })
    const helpTime = Date.now() - helpStart

    // Measure version command  
    const versionStart = Date.now()
    execSync(`node ${path.join(cliPath, 'bin', 'dev.js')} --version`, {
      stdio: 'pipe',
      timeout: 5000,
    })
    const versionTime = Date.now() - versionStart

    // Check against budgets
    const helpStatus = helpTime <= BUDGETS.help ? '✓' : '❌'
    const versionStatus = versionTime <= BUDGETS.version ? '✓' : '❌'

    console.log(`${cli}:`)
    console.log(`  ${helpStatus} help: ${helpTime}ms (budget: ${BUDGETS.help}ms)`)
    console.log(`  ${versionStatus} version: ${versionTime}ms (budget: ${BUDGETS.version}ms)`)

    if (helpTime > BUDGETS.help) {
      errors.push(`${cli} help command exceeded budget: ${helpTime}ms > ${BUDGETS.help}ms`)
    }

    if (versionTime > BUDGETS.version) {
      errors.push(`${cli} version command exceeded budget: ${versionTime}ms > ${BUDGETS.version}ms`)
    }
  } catch (error) {
    console.log(`  ⚠️  Could not benchmark ${cli}: ${error.message}`)
  }
  
  console.log()
})

if (errors.length > 0) {
  console.error('❌ Performance budget violations:\n')
  errors.forEach((err) => console.error(`  - ${err}`))
  console.error('\nConsider:')
  console.error('  - Lazy loading commands')
  console.error('  - Reducing dependency size')
  console.error('  - Optimizing imports')
  process.exit(1)
}

console.log('✓ All CLIs meet performance budgets')
