#!/usr/bin/env node

/**
 * CLI Inventory Validator
 * Compares current CLI state with committed inventory files
 * Exits with error code if inventory is outdated
 */

import { execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '..')
const INVENTORY_PATH = join(ROOT_DIR, 'inventory', 'latest.json')
const MD_PATH = join(ROOT_DIR, 'docs', 'CLI-INVENTORY.md')

/**
 * Generate a hash of the current CLI state
 */
function generateCurrentStateHash() {
  const hash = createHash('sha256')
  
  // Hash all package.json files in apps/
  try {
    const appsDir = join(ROOT_DIR, 'apps')
    const result = execSync('find apps/cli-* -name "package.json" | sort', {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
    })
    
    const packageFiles = result.trim().split('\n').filter(Boolean)
    
    for (const file of packageFiles) {
      const content = readFileSync(join(ROOT_DIR, file), 'utf-8')
      const pkg = JSON.parse(content)
      
      // Hash relevant fields
      hash.update(pkg.name || '')
      hash.update(pkg.version || '')
      hash.update(pkg.description || '')
      hash.update(JSON.stringify(pkg.oclif || {}))
      hash.update(JSON.stringify(Object.keys(pkg.dependencies || {}).filter(d => d.startsWith('shared-')).sort()))
    }
  } catch (error) {
    console.error(`❌ Error reading package files: ${error.message}`)
    process.exit(1)
  }
  
  // Hash all command files
  try {
    const result = execSync('find apps/cli-*/src/commands -name "*.ts" ! -name "*.test.ts" | sort', {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
    })
    
    const commandFiles = result.trim().split('\n').filter(Boolean)
    
    for (const file of commandFiles) {
      const content = readFileSync(join(ROOT_DIR, file), 'utf-8')
      
      // Hash file path and description
      hash.update(file)
      const descMatch = /static\s+(?:override\s+)?description\s*=\s*['"`]([^'"`]+)['"`]/s.exec(content)
      if (descMatch) {
        hash.update(descMatch[1])
      }
    }
  } catch (error) {
    // No commands found or error - hash empty string
    hash.update('')
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
