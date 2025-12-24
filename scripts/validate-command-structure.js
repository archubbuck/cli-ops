#!/usr/bin/env node

/**
 * Validates that command files follow the required structure
 */

const fs = require('fs')
const path = require('path')

const errors = []

// Get command file from arguments or stdin
const files = process.argv.slice(2)

if (files.length === 0) {
  console.log('✓ No command files to validate')
  process.exit(0)
}

files.forEach((file) => {
  if (!fs.existsSync(file)) {
    return
  }

  const content = fs.readFileSync(file, 'utf-8')

  // Check for required elements in oclif commands
  const checks = {
    hasDescription: /static\s+description\s*=/,
    hasExamples: /static\s+examples\s*=/,
    hasRunMethod: /public\s+async\s+run\s*\(/,
    extendsCommand: /extends\s+\w*Command/,
  }

  const fileErrors = []

  Object.entries(checks).forEach(([check, regex]) => {
    if (!regex.test(content)) {
      fileErrors.push(`  ❌ Missing: ${check.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
    }
  })

  if (fileErrors.length > 0) {
    errors.push(`\n${file}:`)
    errors.push(...fileErrors)
  }
})

if (errors.length > 0) {
  console.error('❌ Command structure validation failed:\n')
  console.error(errors.join('\n'))
  console.error('\nAll command files must:')
  console.error('  - Extend a Command class')
  console.error('  - Have a static description property')
  console.error('  - Have static examples array')
  console.error('  - Have a public async run() method')
  process.exit(1)
}

console.log('✓ All command files are valid')
