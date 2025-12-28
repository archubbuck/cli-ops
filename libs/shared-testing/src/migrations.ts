/**
 * Fixture migration system
 * @module migrations
 */

import type { MigrationMetadata } from '@cli-ops/shared-types'

/**
 * Migration function type
 */
export type MigrationFunction = (data: any) => any

/**
 * Migration registration entry
 */
interface MigrationEntry {
  fromVersion: string
  toVersion: string
  migrate: MigrationFunction
  metadata: MigrationMetadata
}

/**
 * Global migration registry
 */
const migrationRegistry = new Map<string, MigrationEntry[]>()

/**
 * Register a migration for a fixture type
 * @param fixtureType - Type of fixture (e.g., 'config', 'task')
 * @param fromVersion - Source version
 * @param toVersion - Target version
 * @param migrate - Migration function
 * @param metadata - Migration metadata
 */
export function registerMigration(
  fixtureType: string,
  fromVersion: string,
  toVersion: string,
  migrate: MigrationFunction,
  metadata: Omit<MigrationMetadata, 'fromVersion' | 'toVersion'>,
): void {
  if (!migrationRegistry.has(fixtureType)) {
    migrationRegistry.set(fixtureType, [])
  }

  const migrations = migrationRegistry.get(fixtureType)!
  migrations.push({
    fromVersion,
    toVersion,
    migrate,
    metadata: {
      fromVersion,
      toVersion,
      ...metadata,
    },
  })

  // Sort migrations by version
  migrations.sort((a, b) => compareVersions(a.fromVersion, b.fromVersion))
}

/**
 * Get migration path between two versions
 * @param fixtureType - Type of fixture
 * @param fromVersion - Source version
 * @param toVersion - Target version
 * @returns Array of migrations to apply
 */
export function getMigrationPath(
  fixtureType: string,
  fromVersion: string,
  toVersion: string,
): MigrationEntry[] {
  const migrations = migrationRegistry.get(fixtureType) || []
  const path: MigrationEntry[] = []

  let currentVersion = fromVersion
  while (currentVersion !== toVersion) {
    const nextMigration = migrations.find((m) => m.fromVersion === currentVersion)

    if (!nextMigration) {
      throw new Error(
        `No migration path found from ${fromVersion} to ${toVersion} for ${fixtureType}`,
      )
    }

    path.push(nextMigration)
    currentVersion = nextMigration.toVersion

    // Prevent infinite loops
    if (path.length > 100) {
      throw new Error(`Migration path too long (>100 steps) from ${fromVersion} to ${toVersion}`)
    }
  }

  return path
}

/**
 * Apply migrations to fixture data
 * @param fixtureType - Type of fixture
 * @param data - Fixture data to migrate
 * @param targetVersion - Target version (optional, uses latest if not specified)
 * @returns Migrated data
 */
export function applyMigrations(fixtureType: string, data: any, targetVersion?: string): any {
  const currentVersion = data.version

  if (!currentVersion) {
    throw new Error('Fixture data must have a version field')
  }

  // If no target version specified, use the latest
  const migrations = migrationRegistry.get(fixtureType) || []
  const target =
    targetVersion ||
    migrations.reduce(
      (latest, m) => (compareVersions(m.toVersion, latest) > 0 ? m.toVersion : latest),
      currentVersion,
    )

  // No migration needed
  if (currentVersion === target) {
    return data
  }

  // Get migration path
  const path = getMigrationPath(fixtureType, currentVersion, target)

  // Apply migrations sequentially
  let migratedData = data
  for (const migration of path) {
    try {
      migratedData = migration.migrate(migratedData)
      migratedData.version = migration.toVersion
    } catch (error) {
      throw new Error(
        `Migration from ${migration.fromVersion} to ${migration.toVersion} failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  }

  return migratedData
}

/**
 * Compare two semantic versions
 * @param a - First version
 * @param b - Second version
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map(Number)
  const bParts = b.split('.').map(Number)

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aNum = aParts[i] || 0
    const bNum = bParts[i] || 0

    if (aNum < bNum) return -1
    if (aNum > bNum) return 1
  }

  return 0
}

/**
 * Check if a migration is breaking
 * @param fixtureType - Type of fixture
 * @param fromVersion - Source version
 * @param toVersion - Target version
 * @returns True if any migration in the path is breaking
 */
export function isBreakingMigration(
  fixtureType: string,
  fromVersion: string,
  toVersion: string,
): boolean {
  try {
    const path = getMigrationPath(fixtureType, fromVersion, toVersion)
    return path.some((m) => m.metadata.breaking)
  } catch {
    return false
  }
}

/**
 * Get all registered migrations for a fixture type
 * @param fixtureType - Type of fixture
 * @returns Array of migration metadata
 */
export function getMigrations(fixtureType: string): MigrationMetadata[] {
  const migrations = migrationRegistry.get(fixtureType) || []
  return migrations.map((m) => m.metadata)
}
