#!/usr/bin/env node

/**
 * CLI Inventory Validator
 * Compares current CLI state with committed inventory files
 * Exits with error code if inventory is outdated
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '..')
const INVENTORY_PATH = join(ROOT_DIR, 'inventory', 'latest.json')
const MD_PATH = join(ROOT_DIR, 'docs', 'CLI-INVENTORY.md')

/**
 * Discover all CLI applications and plugins (same as generate-inventory.js)
 */
function discoverCLIs() {
  const clis = []

  // Add core clio CLI
  const clioPath = join(ROOT_DIR, 'apps', 'clio')
  if (existsSync(clioPath)) {
    clis.push({
      name: 'clio',
      path: clioPath,
      type: 'core',
    })
  }

  // Add plugins from plugins/
  const pluginsDir = join(ROOT_DIR, 'plugins')
  if (existsSync(pluginsDir)) {
    readdirSync(pluginsDir)
      .filter((name) => {
        const path = join(pluginsDir, name)
        return statSync(path).isDirectory() && name.startsWith('clio-plugin-')
      })
      .forEach((name) => {
        clis.push({
          name,
          path: join(pluginsDir, name),
          type: 'plugin',
        })
      })
  }

  return clis
}

/**
 * Discover commands from a CLI (same as generate-inventory.js)
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
          const descMatch = /static\s+(?:override\s+)?description\s*=\s*['"`]([^'"`]+)['"`]/s.exec(
            content,
          )

          commands.push({
            id: commandId,
            description: descMatch ? descMatch[1].trim() : '',
          })
        } catch (error) {
          commands.push({
            id: commandId,
            description: '',
          })
        }
      }
    }
  }

  traverse(commandsDir)
  return commands.sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * Generate a hash of the current CLI state
 */
function generateCurrentStateHash() {
  const hash = createHash('sha256')

  // Discover CLIs using the same logic as generate-inventory.js
  const clis = discoverCLIs()

  for (const cli of clis) {
    const pkgPath = join(cli.path, 'package.json')

    if (!existsSync(pkgPath)) {
      continue
    }

    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

      // Extract shared package dependencies
      const sharedDeps = Object.keys(pkg.dependencies || {})
        .filter((dep) => dep.startsWith('shared-'))
        .sort()

      // Hash metadata (same fields as inventory)
      // Only hash fields that are stored in the inventory JSON structure:
      // - name, version, description: basic package metadata
      // - oclif.topics: command topics/categories (other oclif fields like hooks, plugins aren't in inventory)
      // - sharedPackages: filtered list of shared dependencies
      hash.update(pkg.name || '')
      hash.update(pkg.version || '')
      hash.update(pkg.description || '')
      hash.update(JSON.stringify(pkg.oclif?.topics || {}))
      hash.update(JSON.stringify(sharedDeps))

      // Discover and hash commands
      const commands = discoverCommands(cli.path)
      for (const cmd of commands) {
        hash.update(cmd.id || '')
        hash.update(cmd.description || '')
      }
    } catch (error) {
      console.error(`❌ Error processing ${cli.name}: ${error.message}`)
      process.exit(1)
    }
  }

  return hash.digest('hex')
}

/**
 * Get hash from committed inventory
 */
function getInventoryHash() {
  if (!existsSync(INVENTORY_PATH)) {
    return null
  }

  try {
    const content = readFileSync(INVENTORY_PATH, 'utf-8')
    const inventory = JSON.parse(content)

    // Generate hash from inventory data
    const hash = createHash('sha256')

    for (const cli of inventory.clis || []) {
      hash.update(cli.metadata?.name || '')
      hash.update(cli.metadata?.version || '')
      hash.update(cli.metadata?.description || '')
      hash.update(JSON.stringify(cli.metadata?.topics || {}))
      hash.update(JSON.stringify(cli.metadata?.sharedPackages || []))

      for (const cmd of cli.commands || []) {
        hash.update(cmd.id || '')
        hash.update(cmd.description || '')
      }
    }

    return hash.digest('hex')
  } catch (error) {
    console.error(`❌ Error reading inventory: ${error.message}`)
    return null
  }
}

/**
 * Check if markdown file exists
 */
function checkMarkdownExists() {
  return existsSync(MD_PATH)
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Validating CLI Inventory\n')

  // Check if inventory files exist
  if (!existsSync(INVENTORY_PATH)) {
    console.error('❌ Inventory file not found: inventory/latest.json')
    console.error('   Run: pnpm inventory:generate\n')
    process.exit(1)
  }

  if (!checkMarkdownExists()) {
    console.error('❌ Inventory documentation not found: docs/CLI-INVENTORY.md')
    console.error('   Run: pnpm inventory:generate\n')
    process.exit(1)
  }

  console.log('✅ Inventory files exist')

  // Generate current state hash
  console.log('📊 Computing current CLI state...')
  const currentHash = generateCurrentStateHash()

  // Get inventory hash
  console.log('📋 Reading committed inventory...')
  const inventoryHash = getInventoryHash()

  if (!inventoryHash) {
    console.error('\n❌ Could not read inventory hash')
    console.error('   Run: pnpm inventory:generate\n')
    process.exit(1)
  }

  // Compare hashes
  console.log('\n🔎 Comparing state...')
  console.log(`   Current:   ${currentHash.substring(0, 12)}...`)
  console.log(`   Inventory: ${inventoryHash.substring(0, 12)}...`)

  if (currentHash !== inventoryHash) {
    console.error('\n❌ Inventory is outdated!')
    console.error('   The current CLI state does not match the committed inventory.')
    console.error('   Run: pnpm inventory:generate\n')
    process.exit(1)
  }

  console.log('\n✅ Inventory is up to date!\n')
  process.exit(0)
}

main()
