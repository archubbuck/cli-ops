#!/usr/bin/env node

/**
 * Performance budget checker
 * Validates CLI startup times against defined budgets
 */

import { execSync } from 'node:child_process'
import { performance } from 'node:perf_hooks'

const BUDGETS = {
  // Command startup time budgets (milliseconds)
  help: 500,
  version: 200,
  'tasks:list': 1000,
  'tasks:create': 1000,
  'request:get': 1500,
  'git:status': 800,
}

const WARN_THRESHOLD = 0.8 // Warn at 80% of budget
const CLIS = ['alpha', 'beta', 'gamma']

console.log('⏱️  Performance Budget Check\n')

let totalChecks = 0
let passedChecks = 0
let warnings = 0

for (const cli of CLIS) {
  console.log(`\n📦 ${cli.toUpperCase()}\n`)

  // Check help command
  const helpStart = performance.now()
  try {
    execSync(`node apps/cli-${cli}/bin/dev.js --help`, {
      stdio: 'pipe',
      timeout: 5000,
    })
    const helpDuration = Math.round(performance.now() - helpStart)
    const helpBudget = BUDGETS.help

    totalChecks++
    if (helpDuration <= helpBudget) {
      passedChecks++
      console.log(`  ✓ help: ${helpDuration}ms (budget: ${helpBudget}ms)`)
      
      if (helpDuration > helpBudget * WARN_THRESHOLD) {
        warnings++
        console.log(`    ⚠️  Warning: Close to budget (${Math.round(helpDuration / helpBudget * 100)}%)`)
      }
    } else {
      console.log(`  ✗ help: ${helpDuration}ms (budget: ${helpBudget}ms) - EXCEEDED by ${helpDuration - helpBudget}ms`)
    }
  } catch (error) {
    console.log(`  ⚠️  help: Could not measure (${error.message})`)
  }

  // Check version command
  const versionStart = performance.now()
  try {
    execSync(`node apps/cli-${cli}/bin/dev.js --version`, {
      stdio: 'pipe',
      timeout: 5000,
    })
    const versionDuration = Math.round(performance.now() - versionStart)
    const versionBudget = BUDGETS.version

    totalChecks++
    if (versionDuration <= versionBudget) {
      passedChecks++
      console.log(`  ✓ version: ${versionDuration}ms (budget: ${versionBudget}ms)`)
      
      if (versionDuration > versionBudget * WARN_THRESHOLD) {
        warnings++
        console.log(`    ⚠️  Warning: Close to budget (${Math.round(versionDuration / versionBudget * 100)}%)`)
      }
    } else {
      console.log(`  ✗ version: ${versionDuration}ms (budget: ${versionBudget}ms) - EXCEEDED by ${versionDuration - versionBudget}ms`)
    }
  } catch (error) {
    console.log(`  ⚠️  version: Could not measure (${error.message})`)
  }
}

// Summary
console.log('\n' + '='.repeat(60))
console.log('\n📊 Summary\n')
console.log(`  Total checks: ${totalChecks}`)
console.log(`  Passed: ${passedChecks} (${Math.round(passedChecks / totalChecks * 100)}%)`)
console.log(`  Failed: ${totalChecks - passedChecks}`)
console.log(`  Warnings: ${warnings}`)

if (passedChecks === totalChecks) {
  console.log('\n✓ All performance budgets met!')
  process.exit(0)
} else {
  console.log('\n✗ Some performance budgets exceeded')
  console.log('\nTips:')
  console.log('  - Reduce dependency imports')
  console.log('  - Use lazy loading for heavy modules')
  console.log('  - Optimize initialization code')
  console.log('  - Profile with: node --prof')
  process.exit(1)
}
