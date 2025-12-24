/**
 * Configuration migration utilities for handling breaking changes
 */

export interface Migration<TOld = unknown, TNew = unknown> {
  /**
   * Version this migration upgrades from
   */
  fromVersion: string

  /**
   * Version this migration upgrades to
   */
  toVersion: string

  /**
   * Description of what changed
   */
  description: string

  /**
   * Transform function to migrate config
   */
  migrate: (oldConfig: TOld) => TNew

  /**
   * Validation function to check if migration is needed
   */
  shouldMigrate?: (config: unknown) => boolean
}

export interface MigrationOptions<T> {
  /**
   * Current config version in the loaded file
   */
  currentVersion?: string

  /**
   * Latest version your CLI supports
   */
  latestVersion: string

  /**
   * Array of migrations in order from oldest to newest
   */
  migrations: Migration[]

  /**
   * Configuration to migrate
   */
  config: T

  /**
   * Whether to allow automatic migrations
   * @default true
   */
  autoMigrate?: boolean
}

export interface MigrationResult<T> {
  /**
   * Migrated configuration
   */
  config: T

  /**
   * Whether config was migrated
   */
  wasMigrated: boolean

  /**
   * Migrations that were applied
   */
  appliedMigrations: Array<{
    from: string
    to: string
    description: string
  }>

  /**
   * Warning messages about deprecated config
   */
  warnings: string[]
}

/**
 * Migrate configuration through all necessary versions
 */
export function migrateConfig<T>(
  options: MigrationOptions<T>
): MigrationResult<T> {
  const {
    currentVersion,
    latestVersion,
    migrations,
    config,
    autoMigrate = true,
  } = options

  // If no version or already latest, no migration needed
  if (!currentVersion || currentVersion === latestVersion) {
    return {
      config,
      wasMigrated: false,
      appliedMigrations: [],
      warnings: [],
    }
  }

  if (!autoMigrate) {
    return {
      config,
      wasMigrated: false,
      appliedMigrations: [],
      warnings: [
        `Configuration is v${currentVersion} but latest is v${latestVersion}. ` +
        'Run with --migrate-config to update.',
      ],
    }
  }

  // Find migrations that need to be applied
  const applicableMigrations = migrations.filter(migration => {
    // Check if this migration is in the upgrade path
    if (currentVersion < migration.fromVersion) {
      return false
    }
    
    if (currentVersion >= migration.toVersion) {
      return false
    }

    // Custom validation if provided
    if (migration.shouldMigrate && !migration.shouldMigrate(config)) {
      return false
    }

    return true
  })

  if (applicableMigrations.length === 0) {
    return {
      config,
      wasMigrated: false,
      appliedMigrations: [],
      warnings: [
        `No migration path found from v${currentVersion} to v${latestVersion}`,
      ],
    }
  }

  // Apply migrations in order
  let migratedConfig = config
  const appliedMigrations: MigrationResult<T>['appliedMigrations'] = []
  const warnings: string[] = []

  for (const migration of applicableMigrations) {
    try {
      migratedConfig = migration.migrate(migratedConfig) as T
      appliedMigrations.push({
        from: migration.fromVersion,
        to: migration.toVersion,
        description: migration.description,
      })
    } catch (error) {
      warnings.push(
        `Failed to apply migration ${migration.fromVersion} → ${migration.toVersion}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  return {
    config: migratedConfig,
    wasMigrated: appliedMigrations.length > 0,
    appliedMigrations,
    warnings,
  }
}

/**
 * Helper to create a migration
 */
export function createMigration<TOld, TNew>(
  migration: Migration<TOld, TNew>
): Migration<TOld, TNew> {
  return migration
}
