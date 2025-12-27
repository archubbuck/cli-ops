#!/usr/bin/env node

/**
 * Plugin Verification Script
 *
 * Verifies that plugins meet quality and security standards:
 * - Has required files (package.json, README, LICENSE)
 * - Uses @cli-ops scoped name
 * - Has oclif configuration
 * - Has tests
 * - Has proper peerDependencies
 * - Exports commands
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { glob } from 'glob'

const REQUIRED_FILES = ['package.json', 'README.md', 'LICENSE']
const REQUIRED_SCRIPTS = ['build', 'test', 'typecheck']
const REQUIRED_PEER_DEPS = ['@cli-ops/clio']

async function verifyPlugin(pluginPath) {
  const errors = []
  const warnings = []
  const pluginName = pluginPath.split('/').pop()

  console.log(`\n🔍 Verifying ${pluginName}...`)

  // Check required files
  for (const file of REQUIRED_FILES) {
    const filePath = join(pluginPath, file)
    if (!existsSync(filePath)) {
      errors.push(`Missing required file: ${file}`)
    }
  }

  // Read package.json
  const pkgPath = join(pluginPath, 'package.json')
  if (!existsSync(pkgPath)) {
    errors.push('package.json not found')
    return { errors, warnings }
  }

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

  // Check scoped name
  if (!pkg.name || !pkg.name.startsWith('@cli-ops/clio-plugin-')) {
    errors.push(`Plugin name must start with @cli-ops/clio-plugin-, got: ${pkg.name}`)
  }

  // Check required scripts
  for (const script of REQUIRED_SCRIPTS) {
    if (!pkg.scripts?.[script]) {
      warnings.push(`Missing recommended script: ${script}`)
    }
  }

  // Check peerDependencies
  for (const dep of REQUIRED_PEER_DEPS) {
    if (!pkg.peerDependencies?.[dep]) {
      errors.push(`Missing peer dependency: ${dep}`)
    }
  }

  // Check oclif configuration
  if (!pkg.oclif) {
    errors.push('Missing oclif configuration in package.json')
  } else {
    if (!pkg.oclif.commands) {
      errors.push('oclif.commands not configured')
    }
    if (pkg.oclif.bin !== 'clio') {
      errors.push('oclif.bin must be "clio"')
    }
    if (pkg.oclif.topicSeparator !== ':') {
      warnings.push('oclif.topicSeparator should be ":"')
    }
  }

  // Check for commands directory
  const commandsDir = join(pluginPath, 'src/commands')
  if (!existsSync(commandsDir)) {
    errors.push('src/commands directory not found')
  } else {
    const commands = await glob(join(commandsDir, '**/*.ts'))
    if (commands.length === 0) {
      warnings.push('No commands found in src/commands/')
    }
  }

  // Check for tests
  const testDir = join(pluginPath, 'test')
  if (!existsSync(testDir) && !existsSync(join(pluginPath, '__tests__'))) {
    warnings.push('No test directory found')
  }

  // Check for TypeScript config
  if (!existsSync(join(pluginPath, 'tsconfig.json'))) {
    errors.push('tsconfig.json not found')
  }

  // Check publishConfig
  if (!pkg.publishConfig?.access) {
    warnings.push('publishConfig.access not set (recommended: "public")')
  }

  // Check engines
  if (!pkg.engines?.node) {
    warnings.push('package.json should specify engines.node')
  }

  return { errors, warnings }
}

async function main() {
  const pluginArg = process.argv[2] || 'all'
  let pluginPaths = []

  if (pluginArg === 'all') {
    // Find all plugin directories
    pluginPaths = await glob('packages/clio-plugin-*', { cwd: process.cwd() })
  } else {
    // Verify specific plugin
    const pluginName = pluginArg.replace('@cli-ops/', '')
    pluginPaths = [`packages/${pluginName}`]
  }

  let totalErrors = 0
  let totalWarnings = 0

  for (const pluginPath of pluginPaths) {
    const { errors, warnings } = await verifyPlugin(pluginPath)

    if (errors.length > 0) {
      console.log('  ❌ Errors:')
      errors.forEach((err) => console.log(`     - ${err}`))
      totalErrors += errors.length
    }

    if (warnings.length > 0) {
      console.log('  ⚠️  Warnings:')
      warnings.forEach((warn) => console.log(`     - ${warn}`))
      totalWarnings += warnings.length
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log('  ✅ All checks passed!')
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Verified ${pluginPaths.length} plugin(s)`)
  console.log(`   ${totalErrors} error(s)`)
  console.log(`   ${totalWarnings} warning(s)`)

  if (totalErrors > 0) {
    process.exit(1)
  }
}

main().catch(console.error)
