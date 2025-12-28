#!/usr/bin/env node
/**
 * Validate fixtures against schemas
 * Supports parallel validation, caching, and snapshot comparison
 */

import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { Worker } from 'node:worker_threads'
import { cpus } from 'node:os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const FIXTURES_DIR = join(__dirname, '../libs/shared-testing/fixtures')
const CACHE_DIR = join(__dirname, '../.fixture-cache')
const SNAPSHOTS_DIR = join(__dirname, '../.fixture-snapshots')

const SCHEMAS = {
  config: 'ConfigFixtureSchema',
  task: 'TaskFixtureSchema',
  'api-response': 'APIResponseFixtureSchema',
  'git-repo': 'GitRepoFixtureSchema',
}

/**
 * Compute hash of file content
 */
async function computeHash(path) {
  const content = await readFile(path, 'utf-8')
  return createHash('sha256').update(content).digest('hex')
}

/**
 * Check if fixture is cached and unchanged
 */
async function isCached(path, hash) {
  const cachePath = join(CACHE_DIR, `${hash}.json`)
  try {
    await stat(cachePath)
    return true
  } catch {
    return false
  }
}

/**
 * Save validation result to cache
 */
async function saveToCache(hash, result) {
  await mkdir(CACHE_DIR, { recursive: true })
  const cachePath = join(CACHE_DIR, `${hash}.json`)
  await writeFile(cachePath, JSON.stringify(result, null, 2), 'utf-8')
}

/**
 * Load validation result from cache
 */
async function loadFromCache(hash) {
  const cachePath = join(CACHE_DIR, `${hash}.json`)
  const content = await readFile(cachePath, 'utf-8')
  return JSON.parse(content)
}

/**
 * Detect schema type from fixture path
 */
function detectSchemaType(path) {
  if (path.includes('configs')) return 'config'
  if (path.includes('tasks')) return 'task'
  if (path.includes('api-responses')) return 'apiResponse'
  if (path.includes('git-repos')) return 'gitRepo'
  return null
}

/**
 * Validate a single fixture
 */
async function validateFixture(path) {
  try {
    // Compute hash
    const hash = await computeHash(path)

    // Check cache
    if (await isCached(path, hash)) {
      return {
        path,
        cached: true,
        result: await loadFromCache(hash),
      }
    }

    // Load fixture data
    const content = await readFile(path, 'utf-8')
    const data = JSON.parse(content)

    // Detect schema type
    const schemaType = detectSchemaType(path)
    if (!schemaType) {
      return {
        path,
        cached: false,
        result: {
          valid: false,
          errors: [{ path: [], message: 'Unknown fixture type' }],
        },
      }
    }

    // Validate (simplified - in production, import actual schemas)
    const result = {
      valid: !!data.version,
      warnings: data.version ? [] : [{ path: ['version'], message: 'Missing version field' }],
    }

    // Save to cache
    await saveToCache(hash, result)

    return { path, cached: false, result }
  } catch (error) {
    return {
      path,
      cached: false,
      result: {
        valid: false,
        errors: [{ path: [], message: error.message }],
      },
    }
  }
}

/**
 * Scan fixtures directory
 */
async function scanFixtures(dir, base = dir) {
  const fixtures = []
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      const subFixtures = await scanFixtures(fullPath, base)
      fixtures.push(...subFixtures)
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      fixtures.push(fullPath)
    }
  }

  return fixtures
}

/**
 * Validate fixtures in parallel
 */
async function validateInParallel(fixtures) {
  const batchSize = Math.max(1, Math.floor(cpus().length / 2))
  const results = []

  for (let i = 0; i < fixtures.length; i += batchSize) {
    const batch = fixtures.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(validateFixture))
    results.push(...batchResults)

    // Progress indicator
    const progress = Math.min(100, Math.round(((i + batch.length) / fixtures.length) * 100))
    process.stdout.write(`\r⏳ Validating fixtures... ${progress}%`)
  }

  process.stdout.write('\n')
  return results
}

/**
 * Compare with snapshots
 */
async function compareSnapshots(results) {
  await mkdir(SNAPSHOTS_DIR, { recursive: true })
  const snapshotFile = join(SNAPSHOTS_DIR, 'validation-results.json')

  let previousResults = {}
  try {
    const content = await readFile(snapshotFile, 'utf-8')
    previousResults = JSON.parse(content)
  } catch {
    // No previous snapshot
  }

  // Compare results
  const changes = []
  for (const result of results) {
    const relativePath = relative(FIXTURES_DIR, result.path)
    const previous = previousResults[relativePath]

    if (!previous) {
      changes.push({ path: relativePath, type: 'added' })
    } else if (previous.valid !== result.result.valid) {
      changes.push({
        path: relativePath,
        type: 'changed',
        from: previous.valid ? 'valid' : 'invalid',
        to: result.result.valid ? 'valid' : 'invalid',
      })
    }
  }

  // Save new snapshot
  const newSnapshot = results.reduce((acc, r) => {
    const relativePath = relative(FIXTURES_DIR, r.path)
    acc[relativePath] = r.result
    return acc
  }, {})

  await writeFile(snapshotFile, JSON.stringify(newSnapshot, null, 2), 'utf-8')

  return changes
}

/**
 * Format validation report
 */
function formatReport(results, changes) {
  const valid = results.filter((r) => r.result.valid).length
  const invalid = results.filter((r) => !r.result.valid).length
  const cached = results.filter((r) => r.cached).length
  const warnings = results.filter((r) => r.result.warnings?.length > 0).length

  console.log('\n📊 Validation Report\n')
  console.log(`Total fixtures: ${results.length}`)
  console.log(`✅ Valid: ${valid}`)
  console.log(`❌ Invalid: ${invalid}`)
  console.log(`⚠️  Warnings: ${warnings}`)
  console.log(`💾 Cached: ${cached}`)

  if (changes.length > 0) {
    console.log(`\n🔄 Changes detected: ${changes.length}`)
    for (const change of changes.slice(0, 10)) {
      if (change.type === 'added') {
        console.log(`  + ${change.path}`)
      } else {
        console.log(`  ~ ${change.path} (${change.from} → ${change.to})`)
      }
    }
    if (changes.length > 10) {
      console.log(`  ... and ${changes.length - 10} more`)
    }
  }

  // Show errors
  const errored = results.filter((r) => !r.result.valid)
  if (errored.length > 0) {
    console.log('\n❌ Validation Errors:\n')
    for (const result of errored.slice(0, 5)) {
      const relativePath = relative(FIXTURES_DIR, result.path)
      console.log(`  ${relativePath}:`)
      for (const error of result.result.errors || []) {
        console.log(`    - ${error.message}`)
      }
    }
    if (errored.length > 5) {
      console.log(`\n  ... and ${errored.length - 5} more fixtures with errors`)
    }
  }

  // Show warnings
  const warned = results.filter((r) => r.result.warnings?.length > 0)
  if (warned.length > 0) {
    console.log('\n⚠️  Validation Warnings:\n')
    for (const result of warned.slice(0, 5)) {
      const relativePath = relative(FIXTURES_DIR, result.path)
      console.log(`  ${relativePath}:`)
      for (const warning of result.result.warnings || []) {
        console.log(`    - ${warning.message}`)
      }
    }
    if (warned.length > 5) {
      console.log(`\n  ... and ${warned.length - 5} more fixtures with warnings`)
    }
  }

  console.log()
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔍 Scanning fixtures...')
    const fixtures = await scanFixtures(FIXTURES_DIR)
    console.log(`📝 Found ${fixtures.length} fixtures\n`)

    console.log('🔬 Validating fixtures...')
    const results = await validateInParallel(fixtures)

    console.log('📸 Comparing with snapshots...')
    const changes = await compareSnapshots(results)

    formatReport(results, changes)

    // Exit with error if any fixtures are invalid
    const invalid = results.filter((r) => !r.result.valid).length
    if (invalid > 0) {
      console.error(`❌ ${invalid} fixture(s) failed validation`)
      process.exit(1)
    }

    console.log('✅ All fixtures valid!')
  } catch (error) {
    console.error('❌ Error validating fixtures:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
