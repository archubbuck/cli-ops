#!/usr/bin/env node

/**
 * Architecture Documentation Updater
 * Injects CLI inventory dependency tree into docs/ARCHITECTURE.md
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '..')
const INVENTORY_PATH = join(ROOT_DIR, 'inventory', 'latest.json')
const ARCHITECTURE_PATH = join(ROOT_DIR, 'docs', 'ARCHITECTURE.md')

const SECTION_START_MARKER = '## Package Dependencies'
const SECTION_END_MARKER = '## Build Pipeline'

/**
 * Generate ASCII dependency tree from inventory
 */
function generateDependencyTree(inventory) {
  let tree = `\n### CLI Application Inventory\n\n`
  tree += `> **Auto-generated from inventory.** Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`
  
  for (const cli of inventory.clis) {
    const { metadata, commands } = cli
    tree += `#### ${metadata.bin}\n\n`
    tree += `**${metadata.description}**\n\n`
    tree += `\`\`\`\n`
    tree += `${metadata.name}@${metadata.version}\n`
    tree += `├── Commands: ${commands.length}\n`
    
    // Show command list
    if (commands.length > 0) {
      tree += `│   `
      const cmdList = commands.map(c => c.id).join(', ')
      // Split into multiple lines if too long
      if (cmdList.length > 60) {
        const cmds = commands.map(c => c.id)
        for (let i = 0; i < cmds.length; i++) {
          if (i === 0) {
            tree += `├── ${cmds[i]}\n`
          } else if (i === cmds.length - 1) {
            tree += `│   └── ${cmds[i]}\n`
          } else {
            tree += `│   ├── ${cmds[i]}\n`
          }
        }
      } else {
        tree += `[${cmdList}]\n`
      }
    }
    
    tree += `│\n`
    tree += `└── Shared Dependencies: ${metadata.packageCount} packages\n`
    
    // Show dependency tree
    if (metadata.sharedPackages && metadata.sharedPackages.length > 0) {
      for (let i = 0; i < metadata.sharedPackages.length; i++) {
        const pkg = metadata.sharedPackages[i]
        const isLast = i === metadata.sharedPackages.length - 1
        tree += `    ${isLast ? '└' : '├'}── ${pkg}\n`
      }
    }
    
    tree += `\`\`\`\n\n`
  }
  
  // Summary table
  tree += `**Summary:**\n\n`
  tree += `| CLI | Version | Commands | Shared Packages |\n`
  tree += `|-----|---------|----------|------------------|\n`
  
  for (const cli of inventory.clis) {
    tree += `| ${cli.metadata.bin} | ${cli.metadata.version} | ${cli.commands.length} | ${cli.metadata.packageCount} |\n`
  }
  
  tree += `\n`
  tree += `For detailed command information, see [CLI-INVENTORY.md](CLI-INVENTORY.md).\n\n`
  
  return tree
}

/**
 * Update ARCHITECTURE.md with inventory tree
 */
function updateArchitectureDoc() {
  if (!existsSync(INVENTORY_PATH)) {
    console.error('❌ Inventory not found. Run: pnpm inventory:generate')
    process.exit(1)
  }
  
  if (!existsSync(ARCHITECTURE_PATH)) {
    console.error('❌ ARCHITECTURE.md not found')
    process.exit(1)
  }
  
  try {
    // Read inventory
    const inventory = JSON.parse(readFileSync(INVENTORY_PATH, 'utf-8'))
    
    // Read architecture doc
    let content = readFileSync(ARCHITECTURE_PATH, 'utf-8')
    
    // Find section boundaries
    const startIndex = content.indexOf(SECTION_START_MARKER)
    const endIndex = content.indexOf(SECTION_END_MARKER)
    
    if (startIndex === -1 || endIndex === -1) {
      console.error('❌ Could not find section markers in ARCHITECTURE.md')
      console.error(`   Looking for: "${SECTION_START_MARKER}" and "${SECTION_END_MARKER}"`)
      process.exit(1)
    }
    
    // Generate new dependency tree
    const tree = generateDependencyTree(inventory)
    
    // Extract existing content up to the inventory section
    const beforeSection = content.substring(0, startIndex + SECTION_START_MARKER.length)
    
    // Find where to insert (after existing dependency lists, before Build Pipeline)
    const sectionContent = content.substring(startIndex + SECTION_START_MARKER.length, endIndex)
    
    // Keep existing non-inventory content (the framework integration parts)
    const existingLines = sectionContent.split('\n')
    let keepUntilLine = existingLines.length
    
    // Find if there's already an inventory section
    const inventoryLineIndex = existingLines.findIndex(line => line.includes('CLI Application Inventory'))
    if (inventoryLineIndex !== -1) {
      // Remove old inventory section
      keepUntilLine = inventoryLineIndex - 2 // Remove heading and blank line before
    }
    
    const keptContent = existingLines.slice(0, keepUntilLine).join('\n')
    const afterSection = content.substring(endIndex)
    
    // Reconstruct document
    const newContent = beforeSection + keptContent + tree + afterSection
    
    // Write back
    writeFileSync(ARCHITECTURE_PATH, newContent, 'utf-8')
    
    console.log('✅ Updated docs/ARCHITECTURE.md with inventory tree')
    
  } catch (error) {
    console.error(`❌ Error updating ARCHITECTURE.md: ${error.message}`)
    process.exit(1)
  }
}

/**
 * Main execution
 */
function main() {
  console.log('📝 Updating Architecture Documentation\n')
  updateArchitectureDoc()
  console.log('\n✨ Documentation update complete!')
}

main()
