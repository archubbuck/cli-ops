# Shared Config

Configuration management with cosmiconfig, Zod validation, migrations, and environment variables.

## Features

- 🔍 **Config Discovery** - Searches multiple locations and formats
- ✅ **Type-Safe Validation** - Zod schemas with helpful error messages
- 🏠 **User + Project Configs** - Merge `~/.config` and project configs
- 🔄 **Migrations** - Handle breaking config changes gracefully
- 🌍 **Environment Variables** - Type-safe env loading with validation
- 📦 **Zero Config** - Sensible defaults for common patterns

## Installation

```bash
pnpm add @/shared-config
```

## Usage

### Basic Configuration Loading

```typescript
import { loadConfig } from '@/shared-config'
import { z } from 'zod'

// Define your config schema
const schema = z.object({
  apiUrl: z.string().url(),
  timeout: z.number().default(5000),
  debug: z.boolean().default(false),
})

// Load and validate config
const result = await loadConfig({
  moduleName: 'mycli',
  schema,
  defaults: {
    apiUrl: 'https://api.example.com',
  },
})

console.log(result.config.apiUrl) // Type-safe!
console.log(result.filepath) // Path to loaded config
```

### Config File Locations

Searches in this order (first match wins):

**Project Config:**
- `package.json` (under "mycli" key)
- `.myclirc`
- `.myclirc.json`
- `.myclirc.yaml`
- `.myclirc.js`
- `mycli.config.js`

**User Config (if `mergeUserConfig: true`):**
- `~/.config/mycli/.myclirc`
- `~/.config/mycli/.myclirc.json`
- `~/.config/mycli/config.json`

### Environment Variables

```typescript
import { loadEnv, required, optional, boolean, number } from '@/shared-config'
import { z } from 'zod'

// Define env schema with helpers
const envSchema = z.object({
  API_KEY: required('API key is required'),
  API_URL: optional('https://api.example.com'),
  DEBUG: boolean(),
  PORT: number(),
})

// Load with prefix filtering
const env = loadEnv({
  schema: envSchema,
  prefix: 'MYCLI_', // Only load MYCLI_* vars
  stripPrefix: true, // Remove prefix from keys
})

console.log(env.API_KEY) // Type: string
console.log(env.DEBUG) // Type: boolean
console.log(env.PORT) // Type: number
```

### Configuration Migrations

```typescript
import { loadConfig, migrateConfig, createMigration } from '@/shared-config'

// Define migrations
const migrations = [
  createMigration({
    fromVersion: '1.0.0',
    toVersion: '2.0.0',
    description: 'Renamed apiUrl to api.url',
    migrate: (old: any) => ({
      ...old,
      api: { url: old.apiUrl },
      apiUrl: undefined,
    }),
  }),
]

// Load config
const result = await loadConfig({ moduleName: 'mycli', schema })

// Check version and migrate if needed
const migrated = migrateConfig({
  currentVersion: result.config.version,
  latestVersion: '2.0.0',
  migrations,
  config: result.config,
})

if (migrated.wasMigrated) {
  console.log('Config was upgraded:')
  migrated.appliedMigrations.forEach(m => {
    console.log(`  ${m.from} → ${m.to}: ${m.description}`)
  })
}
```

## API Reference

### `loadConfig<T>(options)`

Load and validate configuration from filesystem.

**Options:**
- `moduleName: string` - CLI name for config file search
- `schema: ZodSchema<T>` - Zod schema for validation
- `searchFrom?: string` - Start search directory (default: `process.cwd()`)
- `stopDir?: string` - Stop search directory (default: home dir)
- `mergeUserConfig?: boolean` - Merge `~/.config` with project (default: `true`)
- `defaults?: Partial<T>` - Default values
- `transform?: (config: unknown) => unknown` - Pre-validation transform

**Returns:**
```typescript
{
  config: T,              // Validated config
  filepath: string | null, // Config file path
  isUserConfig: boolean,   // From ~/.config?
  isProjectConfig: boolean // From project dir?
}
```

### `loadEnv<T>(options)`

Load and validate environment variables.

**Options:**
- `schema: ZodObject<T>` - Zod schema for env vars
- `prefix?: string` - Filter vars by prefix
- `stripPrefix?: boolean` - Remove prefix from keys (default: `true`)
- `env?: NodeJS.ProcessEnv` - Custom env object

**Helpers:**
- `required(message?)` - Required string env var
- `optional(default)` - Optional with default
- `boolean()` - Parse boolean (true/1/yes → true)
- `number()` - Parse integer
- `url()` - Validate URL format
- `json(schema)` - Parse JSON string
- `list()` - Parse comma-separated list

### `migrateConfig<T>(options)`

Migrate configuration through version upgrades.

**Options:**
- `currentVersion?: string` - Current config version
- `latestVersion: string` - Target version
- `migrations: Migration[]` - Array of migrations
- `config: T` - Configuration to migrate
- `autoMigrate?: boolean` - Auto-apply migrations (default: `true`)

## Examples

### Complete CLI Config Setup

```typescript
import { loadConfig, loadEnv, migrateConfig } from '@/shared-config'
import { z } from 'zod'

// 1. Define schemas
const configSchema = z.object({
  version: z.string().default('2.0.0'),
  api: z.object({
    url: z.string().url(),
    timeout: z.number().default(5000),
  }),
  output: z.enum(['json', 'yaml', 'table']).default('table'),
})

const envSchema = z.object({
  API_KEY: required(),
  DEBUG: boolean().default(false),
})

// 2. Load environment
const env = loadEnv({
  schema: envSchema,
  prefix: 'MYCLI_',
})

// 3. Load config with env overrides
const configResult = await loadConfig({
  moduleName: 'mycli',
  schema: configSchema,
  defaults: {
    api: {
      url: env.API_URL || 'https://api.example.com',
    },
  },
})

// 4. Migrate if needed
const migrated = migrateConfig({
  currentVersion: configResult.config.version,
  latestVersion: '2.0.0',
  migrations: [...],
  config: configResult.config,
})

// 5. Use merged config
const config = migrated.config
console.log(config.api.url) // Fully typed and validated!
```

### Custom Config Transform

```typescript
const result = await loadConfig({
  moduleName: 'mycli',
  schema,
  transform: (config: any) => {
    // Expand environment variables
    if (typeof config.path === 'string') {
      config.path = config.path.replace(/\$HOME/g, process.env.HOME)
    }
    return config
  },
})
```

## ADHD/OCD Benefits

- **Predictable** - Always validates, no surprises
- **Clear Errors** - Zod provides helpful validation messages
- **Flexible** - Supports multiple config formats and locations
- **Versioned** - Migrations handle breaking changes gracefully
- **Type-Safe** - Full TypeScript support prevents typos
- **Documented** - Schema serves as documentation

## Best Practices

1. **Always validate** - Use Zod schemas for all config
2. **Provide defaults** - Minimize required configuration
3. **Document schema** - Use `.describe()` for helpful errors
4. **Version configs** - Include version field for migrations
5. **Env overrides** - Allow env vars to override config files
6. **Fail fast** - Validate on startup, not during execution
