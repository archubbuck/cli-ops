#!/usr/bin/env node

/**
 * CLI Inventory Generator
 * Discovers CLIs, validates commands via oclif manifests, measures performance,
 * and generates docs/CLI-INVENTORY.md + versioned JSON snapshots
 */

import { execSync } from 'node:child_process'
import { performance } from 'node:perf_hooks'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '..')
const APPS_DIR = join(ROOT_DIR, 'apps')
const INVENTORY_DIR = join(ROOT_DIR, 'inventory')
const PERF_BUDGETS = {
  help: 500,
  version: 200,
}

/**
 * Discover all CLI applications in the apps/ directory
 */
function discoverCLIs() {
  if (!existsSync(APPS_DIR)) {
    console.error('❌ apps/ directory not found')
    process.exit(1)
  }

  const clis = readdirSync(APPS_DIR)
    .filter(name => {
      const path = join(APPS_DIR, name)
      return statSync(path).isDirectory() && name.startsWith('cli-')
    })
    .map(name => ({
      name,
      path: join(APPS_DIR, name),
    }))

  if (clis.length === 0) {
    console.error('❌ No CLI applications found in apps/')
    process.exit(1)
  }

  return clis
}

/**
 * Extract metadata from CLI's package.json
 */
function extractCLIMetadata(cliPath, cliName) {
  const pkgPath = join(cliPath, 'package.json')
  
  if (!existsSync(pkgPath)) {
    console.warn(`⚠️  No package.json found for ${cliName}`)
    return null
  }

  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    const binName = pkg.oclif?.bin || (pkg.bin ? Object.keys(pkg.bin)[0] : cliName.replace('cli-', ''))
    
    // Extract shared package dependencies
    const sharedDeps = Object.keys(pkg.dependencies || {})
      .filter(dep => dep.startsWith('shared-'))
      .sort()
    
    return {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description || '',
      bin: binName,
      topics: pkg.oclif?.topics || {},
      sharedPackages: sharedDeps,
      packageCount: sharedDeps.length,
    }
  } catch (error) {
    console.error(`❌ Failed to parse package.json for ${cliName}: ${error.message}`)
    return null
  }
}

/**
 * Discover commands using oclif's approach by traversing src/commands
 */
function discoverCommands(cliPath) {
  const commandsDir = join(cliPath, 'src', 'commands')
  const commands = []

  if (!existsSync(commandsDir)) {
    return commands
  }

  function traverse(dir, prefix = '') {
    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        traverse(fullPath, prefix + entry.name + ':')
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
        const cmdName = entry.name.replace('.ts', '')
        const commandId = prefix + cmdName

        // Extract description via regex
        try {
          const content = readFileSync(fullPath, 'utf-8')
          const descMatch = /static\s+(?:override\s+)?description\s*=\s*['"`]([^'"`]+)['"`]/s.exec(content)
          const aliasMatch = /static\s+(?:override\s+)?aliases\s*=\s*\[(.*?)\]/s.exec(content)
          
          let aliases = []
          if (aliasMatch) {
            aliases = aliasMatch[1]
              .split(',')
              .map(a => a.trim().replace(/['"]/g, ''))
              .filter(Boolean)
          }

          commands.push({
            id: commandId,
            description: descMatch ? descMatch[1].trim() : '',
            aliases: aliases,
            file: relative(cliPath, fullPath),
          })
        } catch (error) {
          console.warn(`⚠️  Could not parse command file: ${fullPath}`)
          commands.push({
            id: commandId,
            description: '',
            aliases: [],
            file: relative(cliPath, fullPath),
          })
        }
      }
    }
  }

  traverse(commandsDir)
  return commands.sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * Check performance of help and version commands
 */
function checkPerformance(cliName) {
  const devScript = join(APPS_DIR, cliName, 'bin', 'dev.js')
  
  if (!existsSync(devScript)) {
    return {
      help: { duration: -1, budget: PERF_BUDGETS.help, status: 'unavailable' },
      version: { duration: -1, budget: PERF_BUDGETS.version, status: 'unavailable' },
    }
  }

  const results = {}

  // Check --help
  try {
    const helpStart = performance.now()
    execSync(`node "${devScript}" --help`, {
      stdio: 'pipe',
      timeout: 5000,
    })
    const helpDuration = Math.round(performance.now() - helpStart)
    results.help = {
      duration: helpDuration,
      budget: PERF_BUDGETS.help,
      status: helpDuration <= PERF_BUDGETS.help ? 'pass' : 'fail',
    }
  } catch (error) {
    results.help = {
      duration: -1,
      budget: PERF_BUDGETS.help,
      status: 'error',
      error: error.message,
    }
  }

  // Check --version
  try {
    const versionStart = performance.now()
    execSync(`node "${devScript}" --version`, {
      stdio: 'pipe',
      timeout: 5000,
    })
    const versionDuration = Math.round(performance.now() - versionStart)
    results.version = {
      duration: versionDuration,
      budget: PERF_BUDGETS.version,
      status: versionDuration <= PERF_BUDGETS.version ? 'pass' : 'fail',
    }
  } catch (error) {
    results.version = {
      duration: -1,
      budget: PERF_BUDGETS.version,
      status: 'error',
      error: error.message,
    }
  }

  return results
}

/**
 * Check test status
 */
function checkTests(cliPath) {
  const srcDir = join(cliPath, 'src')
  
  if (!existsSync(srcDir)) {
    return { hasTests: false, testFiles: 0, testPatterns: [] }
  }

  let testFiles = 0
  const testPatterns = []

  function traverse(dir) {
    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        traverse(fullPath)
      } else if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.spec.ts')) {
        testFiles++
        testPatterns.push(relative(cliPath, fullPath))
      }
    }
  }

  traverse(srcDir)

  return {
    hasTests: testFiles > 0,
    testFiles,
    testPatterns,
  }
}

/**
 * Generate markdown documentation
 */
function generateMarkdown(inventory) {
  const timestamp = new Date().toISOString()
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  let md = `# CLI Inventory\n\n`
  md += `> **Last Updated:** ${date}\n`
  md += `> **Generated:** Automatically via \`pnpm inventory:generate\`\n\n`
  md += `This document provides a comprehensive inventory of all CLI applications in this monorepo, including their commands, performance metrics, and testing status.\n\n`

  // Overview Table
  md += `## Overview\n\n`
  md += `| CLI | Version | Commands | Performance (help/version) | Tests | Shared Packages |\n`
  md += `|-----|---------|----------|----------------------------|-------|------------------|\n`

  for (const cli of inventory.clis) {
    const perfHelp = cli.performance.help.status === 'pass' 
      ? `✅ ${cli.performance.help.duration}ms`
      : cli.performance.help.status === 'fail'
      ? `⚠️ ${cli.performance.help.duration}ms`
      : '❌'
    
    const perfVersion = cli.performance.version.status === 'pass'
      ? `✅ ${cli.performance.version.duration}ms`
      : cli.performance.version.status === 'fail'
      ? `⚠️ ${cli.performance.version.duration}ms`
      : '❌'

    const testStatus = cli.tests.hasTests
      ? `✅ ${cli.tests.testFiles} files`
      : `❌ No tests`

    md += `| **${cli.metadata.bin}** | ${cli.metadata.version} | ${cli.commands.length} | ${perfHelp} / ${perfVersion} | ${testStatus} | ${cli.metadata.packageCount} |\n`
  }

  md += `\n`
  md += `**Performance Budgets:**\n`
  md += `- Help command: ${PERF_BUDGETS.help}ms\n`
  md += `- Version command: ${PERF_BUDGETS.version}ms\n\n`

  // Detailed CLI Sections
  for (const cli of inventory.clis) {
    md += `## ${cli.metadata.bin}\n\n`
    md += `**${cli.metadata.description}**\n\n`
    
    md += `- **Package:** \`${cli.metadata.name}\`\n`
    md += `- **Version:** ${cli.metadata.version}\n`
    md += `- **Binary:** \`${cli.metadata.bin}\`\n`
    md += `- **Commands:** ${cli.commands.length}\n`
    md += `- **Shared Dependencies:** ${cli.metadata.packageCount} packages\n\n`

    // Commands
    if (cli.commands.length > 0) {
      md += `### Commands\n\n`
      
      for (const cmd of cli.commands) {
        md += `#### \`${cmd.id}\`\n\n`
        if (cmd.description) {
          md += `${cmd.description}\n\n`
        }
        if (cmd.aliases && cmd.aliases.length > 0) {
          md += `**Aliases:** ${cmd.aliases.map(a => `\`${a}\``).join(', ')}\n\n`
        }
      }
    }

    // Topics
    if (Object.keys(cli.metadata.topics).length > 0) {
      md += `### Command Topics\n\n`
      for (const [topic, config] of Object.entries(cli.metadata.topics)) {
        md += `- **${topic}:** ${config.description || '(no description)'}\n`
      }
      md += `\n`
    }

    // Performance
    md += `### Performance\n\n`
    md += `| Command | Duration | Budget | Status |\n`
    md += `|---------|----------|--------|--------|\n`
    md += `| \`--help\` | ${cli.performance.help.duration}ms | ${cli.performance.help.budget}ms | ${cli.performance.help.status === 'pass' ? '✅ Pass' : cli.performance.help.status === 'fail' ? '⚠️ Over Budget' : '❌ Error'} |\n`
    md += `| \`--version\` | ${cli.performance.version.duration}ms | ${cli.performance.version.budget}ms | ${cli.performance.version.status === 'pass' ? '✅ Pass' : cli.performance.version.status === 'fail' ? '⚠️ Over Budget' : '❌ Error'} |\n`
    md += `\n`

    // Tests
    md += `### Testing\n\n`
    if (cli.tests.hasTests) {
      md += `- **Status:** ✅ ${cli.tests.testFiles} test file(s)\n`
      md += `- **Test Files:**\n`
      for (const file of cli.tests.testPatterns) {
        md += `  - \`${file}\`\n`
      }
    } else {
      md += `- **Status:** ❌ No tests found\n`
    }
    md += `\n`

    // Dependencies
    if (cli.metadata.sharedPackages.length > 0) {
      md += `### Shared Dependencies\n\n`
      md += `This CLI depends on ${cli.metadata.packageCount} shared workspace packages:\n\n`
      for (const pkg of cli.metadata.sharedPackages) {
        md += `- \`${pkg}\`\n`
      }
      md += `\n`
    }

    md += `---\n\n`
  }

  // Maintenance Section
  md += `## Maintenance\n\n`
  md += `This inventory is automatically generated and validated:\n\n`
  md += `- **Generate:** \`pnpm inventory:generate\`\n`
  md += `- **Validate:** \`pnpm inventory:validate\`\n`
  md += `- **Update Architecture Docs:** \`pnpm inventory:update-docs\`\n\n`
  md += `The inventory is regenerated:\n`
  md += `- After each build via postbuild hook\n`
  md += `- In CI workflows to ensure accuracy\n`
  md += `- Before commits via pre-commit hook (validation)\n\n`
  md += `### When to Update\n\n`
  md += `The inventory updates automatically when:\n`
  md += `- Adding or removing CLI applications\n`
  md += `- Adding, removing, or modifying commands\n`
  md += `- Changing CLI versions or descriptions\n`
  md += `- Updating shared package dependencies\n\n`
  md += `If the inventory is out of date, the \`inventory:validate\` script will fail and trigger regeneration.\n`

  return md
}

/**
 * Main execution
 */
function main() {
  console.log('📦 CLI Inventory Generator\n')

  // Discover CLIs
  console.log('🔍 Discovering CLIs...')
  const clis = discoverCLIs()
  console.log(`   Found ${clis.length} CLI(s): ${clis.map(c => c.name).join(', ')}\n`)

  // Build inventory
  const inventory = {
    generated: new Date().toISOString(),
    clis: [],
  }

  for (const cli of clis) {
    console.log(`📋 Processing ${cli.name}...`)
    
    const metadata = extractCLIMetadata(cli.path, cli.name)
    if (!metadata) {
      console.log(`   ⚠️  Skipping ${cli.name} (no metadata)\n`)
      continue
    }

    console.log(`   Version: ${metadata.version}`)
    
    const commands = discoverCommands(cli.path)
    console.log(`   Commands: ${commands.length}`)
    
    const performance = checkPerformance(cli.name)
    console.log(`   Performance: help=${performance.help.duration}ms, version=${performance.version.duration}ms`)
    
    const tests = checkTests(cli.path)
    console.log(`   Tests: ${tests.testFiles} file(s)`)
    console.log(`   Shared Packages: ${metadata.packageCount}\n`)

    inventory.clis.push({
      name: cli.name,
      metadata,
      commands,
      performance,
      tests,
    })
  }

  // Create inventory directory
  if (!existsSync(INVENTORY_DIR)) {
    mkdirSync(INVENTORY_DIR, { recursive: true })
  }

  // Generate markdown
  console.log('📝 Generating markdown...')
  const markdown = generateMarkdown(inventory)
  const mdPath = join(ROOT_DIR, 'docs', 'CLI-INVENTORY.md')
  writeFileSync(mdPath, markdown, 'utf-8')
  console.log(`   ✅ Written to docs/CLI-INVENTORY.md`)

  // Generate versioned JSON
  console.log('💾 Generating JSON snapshots...')
  const version = inventory.clis.length > 0 ? inventory.clis[0].metadata.version : '1.0.0'
  const versionedPath = join(INVENTORY_DIR, `inventory-v${version}.json`)
  const latestPath = join(INVENTORY_DIR, 'latest.json')
  
  const json = JSON.stringify(inventory, null, 2)
  writeFileSync(versionedPath, json, 'utf-8')
  writeFileSync(latestPath, json, 'utf-8')
  console.log(`   ✅ Written to inventory/inventory-v${version}.json`)
  console.log(`   ✅ Written to inventory/latest.json`)

  console.log('\n✨ Inventory generation complete!')
  console.log(`\n📊 Summary:`)
  console.log(`   CLIs: ${inventory.clis.length}`)
  console.log(`   Total Commands: ${inventory.clis.reduce((sum, cli) => sum + cli.commands.length, 0)}`)
  console.log(`   Total Test Files: ${inventory.clis.reduce((sum, cli) => sum + cli.tests.testFiles, 0)}`)
}

main()
