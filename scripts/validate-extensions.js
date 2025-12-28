#!/usr/bin/env node

/**
 * Validation script for extension plugins
 *
 * Validates that extension plugins:
 * 1. Have clio.extension.parent in package.json matching a peerDependency
 * 2. Follow the naming convention {parent}-{feature}
 * 3. Declare hooks that exist on the parent plugin
 * 4. Don't have extension-to-extension dependencies
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const pluginsDir = join(rootDir, 'plugins')

let errorCount = 0
let warningCount = 0

function error(message) {
  console.error(`❌ ERROR: ${message}`)
  errorCount++
}

function warn(message) {
  console.warn(`⚠️  WARNING: ${message}`)
  warningCount++
}

function info(message) {
  console.log(`ℹ️  ${message}`)
}

function success(message) {
  console.log(`✓ ${message}`)
}

// Get all plugin directories
function getPluginDirs() {
  const entries = readdirSync(pluginsDir, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('clio-plugin-'))
    .map((entry) => entry.name)
}

// Read and parse package.json
function readPackageJson(pluginName) {
  const pkgPath = join(pluginsDir, pluginName, 'package.json')
  try {
    const content = readFileSync(pkgPath, 'utf-8')
    return JSON.parse(content)
  } catch (err) {
    error(`Failed to read package.json for ${pluginName}: ${err.message}`)
    return null
  }
}

// Check if plugin is an extension
function isExtensionPlugin(pluginName) {
  // Extension plugins follow pattern: clio-plugin-{parent}-{feature}
  const parts = pluginName.replace('clio-plugin-', '').split('-')
  return parts.length > 1
}

// Validate extension plugin
function validateExtension(pluginName, pkg) {
  const fullName = pkg.name
  info(`\nValidating extension: ${fullName}`)

  let hasErrors = false

  // 1. Check clio.extension.parent exists
  const extensionConfig = pkg.clio?.extension
  if (!extensionConfig) {
    error(`${fullName}: Missing clio.extension in package.json`)
    hasErrors = true
    return hasErrors
  }

  if (!extensionConfig.parent) {
    error(`${fullName}: Missing clio.extension.parent field`)
    hasErrors = true
    return hasErrors
  }

  const parentName = extensionConfig.parent
  success(`  Parent: ${parentName}`)

  // 2. Validate naming convention
  const expectedParentSlug = parentName.replace('@cli-ops/clio-plugin-', '')
  if (!pluginName.startsWith(`clio-plugin-${expectedParentSlug}-`)) {
    error(
      `${fullName}: Naming convention violation. ` +
        `Expected to start with 'clio-plugin-${expectedParentSlug}-' based on parent '${parentName}'`,
    )
    hasErrors = true
  } else {
    success(`  Naming convention: ✓`)
  }

  // 3. Check parent is in peerDependencies
  const peerDeps = pkg.peerDependencies || {}
  if (!peerDeps[parentName]) {
    error(`${fullName}: Parent '${parentName}' not found in peerDependencies`)
    hasErrors = true
  } else {
    success(`  Parent in peerDependencies: ✓`)
  }

  // 4. Check for extension-to-extension dependencies
  const allPeerDeps = Object.keys(peerDeps)
  const extensionDeps = allPeerDeps.filter((dep) => {
    if (dep === '@cli-ops/clio' || dep === parentName) return false
    // Check if it looks like an extension
    const match = dep.match(/^@cli-ops\/(clio-plugin-[\w-]+)-([\w-]+)$/)
    return match !== null
  })

  if (extensionDeps.length > 0) {
    error(`${fullName}: Has dependencies on other extensions: ${extensionDeps.join(', ')}`)
    error(`  Extensions should only depend on their parent plugin, not other extensions`)
    hasErrors = true
  } else {
    success(`  No extension-to-extension dependencies: ✓`)
  }

  // 5. Validate hooks (if parent plugin exists)
  const declaredHooks = extensionConfig.hooks || []
  if (declaredHooks.length === 0) {
    warn(`${fullName}: No hooks declared in clio.extension.hooks`)
  } else {
    success(`  Declared hooks: ${declaredHooks.length}`)
    for (const hook of declaredHooks) {
      info(`    • ${hook}`)
    }

    // Try to validate hooks against parent (if parent package.json exists)
    const parentPluginDir = parentName.replace('@cli-ops/', '')
    const parentPkgPath = join(pluginsDir, parentPluginDir, 'package.json')
    try {
      const parentPkg = JSON.parse(readFileSync(parentPkgPath, 'utf-8'))
      const parentHooks = parentPkg.clio?.plugin?.hooks || []

      if (parentHooks.length > 0) {
        const invalidHooks = declaredHooks.filter((h) => !parentHooks.includes(h))
        if (invalidHooks.length > 0) {
          warn(`${fullName}: Hooks not found in parent: ${invalidHooks.join(', ')}`)
        }
      }
    } catch {
      // Parent package.json not found, skip validation
      info(`    (Could not validate hooks against parent plugin)`)
    }
  }

  return hasErrors
}

// Validate base plugin
function validateBasePlugin(pluginName, pkg) {
  const fullName = pkg.name
  info(`\nValidating base plugin: ${fullName}`)

  // Base plugins should not have clio.extension
  if (pkg.clio?.extension) {
    warn(`${fullName}: Base plugin has clio.extension config (should be removed)`)
  }

  success(`  Base plugin: ✓`)
}

// Main validation
function main() {
  console.log('🔍 Validating Extension Plugins\n')
  console.log('='.repeat(60))

  const plugins = getPluginDirs()
  console.log(`\nFound ${plugins.length} plugins\n`)

  const extensions = []
  const basePlugins = []

  for (const pluginName of plugins) {
    const pkg = readPackageJson(pluginName)
    if (!pkg) continue

    if (isExtensionPlugin(pluginName)) {
      extensions.push({ name: pluginName, pkg })
    } else {
      basePlugins.push({ name: pluginName, pkg })
    }
  }

  console.log(`📦 Base Plugins: ${basePlugins.length}`)
  console.log(`🔌 Extension Plugins: ${extensions.length}`)
  console.log('\n' + '='.repeat(60))

  // Validate base plugins
  for (const { name, pkg } of basePlugins) {
    validateBasePlugin(name, pkg)
  }

  // Validate extensions
  for (const { name, pkg } of extensions) {
    validateExtension(name, pkg)
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Validation Summary:\n')

  if (errorCount === 0 && warningCount === 0) {
    console.log('✅ All validation checks passed!')
  } else {
    if (errorCount > 0) {
      console.log(`❌ ${errorCount} error(s) found`)
    }
    if (warningCount > 0) {
      console.log(`⚠️  ${warningCount} warning(s) found`)
    }
  }

  // Exit with error code if there are errors
  if (errorCount > 0) {
    process.exit(1)
  }
}

main()
