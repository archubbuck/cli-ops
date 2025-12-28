# Configuration Reference

Complete guide to configuring CLI Ops and all plugins.

## Configuration Files

CLI Ops follows the XDG Base Directory specification for configuration files:

```
~/.config/clio/config.json          # Main CLI configuration
~/.config/clio/plugins.json         # Plugin settings
~/.local/share/clio/history.json    # Command history
~/.cache/clio/                      # Cache directory
```

## Global Configuration

The main configuration file (`~/.config/clio/config.json`) controls global CLI behavior:

```json
{
  "version": "1.0.0",
  "logging": {
    "level": "info",
    "format": "pretty",
    "file": null
  },
  "performance": {
    "maxConcurrentOperations": 5,
    "timeout": 30000
  },
  "ui": {
    "color": true,
    "interactive": true,
    "progressBars": true,
    "icons": true
  },
  "history": {
    "enabled": true,
    "maxEntries": 1000,
    "save": true
  },
  "ipc": {
    "enabled": true,
    "port": null
  }
}
```

### Configuration Options

#### Logging

- **`logging.level`**: Log verbosity level
  - Values: `"silent"`, `"error"`, `"warn"`, `"info"`, `"debug"`, `"trace"`
  - Default: `"info"`

- **`logging.format`**: Log output format
  - Values: `"pretty"`, `"json"`, `"minimal"`
  - Default: `"pretty"`

- **`logging.file`**: Path to log file (optional)
  - Values: File path or `null` for no file logging
  - Default: `null`

#### Performance

- **`performance.maxConcurrentOperations`**: Maximum parallel operations
  - Values: Positive integer
  - Default: `5`
  - Impact: Higher values use more resources but complete faster

- **`performance.timeout`**: Operation timeout in milliseconds
  - Values: Positive integer
  - Default: `30000` (30 seconds)
  - Impact: Longer timeouts for slow operations

#### UI/UX

- **`ui.color`**: Enable colored output
  - Values: `true`, `false`
  - Default: `true`
  - Note: Auto-disabled when not in TTY

- **`ui.interactive`**: Enable interactive prompts
  - Values: `true`, `false`
  - Default: `true`
  - Note: Disable for CI/CD environments

- **`ui.progressBars`**: Show progress bars for long operations
  - Values: `true`, `false`
  - Default: `true`

- **`ui.icons`**: Display icons in output
  - Values: `true`, `false`
  - Default: `true`

#### History

- **`history.enabled`**: Enable command history tracking
  - Values: `true`, `false`
  - Default: `true`

- **`history.maxEntries`**: Maximum history entries to retain
  - Values: Positive integer
  - Default: `1000`

- **`history.save`**: Persist history to disk
  - Values: `true`, `false`
  - Default: `true`

#### IPC (Inter-Process Communication)

- **`ipc.enabled`**: Enable cross-CLI communication
  - Values: `true`, `false`
  - Default: `true`

- **`ipc.port`**: IPC server port (auto-assigned if null)
  - Values: Port number or `null`
  - Default: `null`

## Plugin Configuration

Each plugin can have its own configuration section:

```json
{
  "plugins": {
    "tasks": {
      "defaultProvider": "local",
      "syncInterval": 300000,
      "notifications": true
    },
    "fetch": {
      "timeout": 10000,
      "retries": 3,
      "cacheEnabled": true,
      "cacheTTL": 3600
    },
    "repo": {
      "defaultBranch": "main",
      "autoFetch": true,
      "prTemplate": ".github/PULL_REQUEST_TEMPLATE.md"
    }
  }
}
```

### Tasks Plugin Configuration

- **`tasks.defaultProvider`**: Default task backend
  - Values: `"local"`, `"jira"`, `"github"`
  - Default: `"local"`

- **`tasks.syncInterval`**: Auto-sync interval in milliseconds
  - Values: Positive integer or `null` to disable
  - Default: `300000` (5 minutes)

- **`tasks.notifications`**: Show desktop notifications
  - Values: `true`, `false`
  - Default: `true`

### Fetch Plugin Configuration

- **`fetch.timeout`**: HTTP request timeout in milliseconds
  - Values: Positive integer
  - Default: `10000` (10 seconds)

- **`fetch.retries`**: Number of retry attempts for failed requests
  - Values: Non-negative integer
  - Default: `3`

- **`fetch.cacheEnabled`**: Enable HTTP response caching
  - Values: `true`, `false`
  - Default: `true`

- **`fetch.cacheTTL`**: Cache time-to-live in seconds
  - Values: Positive integer
  - Default: `3600` (1 hour)

### Repo Plugin Configuration

- **`repo.defaultBranch`**: Default branch name for new repositories
  - Values: Branch name string
  - Default: `"main"`

- **`repo.autoFetch`**: Automatically fetch remote changes
  - Values: `true`, `false`
  - Default: `true`

- **`repo.prTemplate`**: Path to pull request template
  - Values: File path relative to repository root
  - Default: `".github/PULL_REQUEST_TEMPLATE.md"`

## Environment Variables

Override configuration with environment variables using the pattern:
`CLIO_<SECTION>_<KEY>=value`

Examples:

```bash
# Set log level to debug
export CLIO_LOGGING_LEVEL=debug

# Disable colored output
export CLIO_UI_COLOR=false

# Set fetch timeout
export CLIO_PLUGINS_FETCH_TIMEOUT=5000

# Disable IPC
export CLIO_IPC_ENABLED=false
```

## Command-Line Flags

Most configuration options can be overridden per-command:

```bash
# Set log level for single command
clio tasks:list --log-level=debug

# Disable color output
clio fetch:get https://api.example.com --no-color

# Disable interactive mode (useful for scripts)
clio tasks:create "Task name" --no-interactive
```

## Managing Configuration

### View Current Configuration

```bash
# Show all configuration
clio config:get

# Show specific section
clio config:get logging

# Show specific key
clio config:get logging.level
```

### Update Configuration

```bash
# Set a value
clio config:set logging.level debug

# Enable a boolean
clio config:set ui.progressBars true

# Set plugin configuration
clio config:set plugins.tasks.defaultProvider jira
```

### Reset Configuration

```bash
# Reset all configuration to defaults
clio config:reset

# Reset specific section
clio config:reset logging

# Reset and backup
clio config:reset --backup
```

### Export/Import Configuration

```bash
# Export configuration to file
clio config:export ~/my-config.json

# Import configuration from file
clio config:import ~/my-config.json

# Merge imported config with existing
clio config:import ~/partial-config.json --merge
```

## Configuration for Development

When developing plugins or contributing to CLI Ops:

```json
{
  "logging": {
    "level": "debug",
    "format": "pretty"
  },
  "performance": {
    "maxConcurrentOperations": 10
  },
  "ui": {
    "color": true,
    "progressBars": true
  }
}
```

## Configuration for CI/CD

For automated environments and continuous integration:

```json
{
  "logging": {
    "level": "info",
    "format": "json"
  },
  "ui": {
    "color": false,
    "interactive": false,
    "progressBars": false
  },
  "history": {
    "enabled": false,
    "save": false
  }
}
```

Or use environment variables:

```bash
export CLIO_LOGGING_FORMAT=json
export CLIO_UI_INTERACTIVE=false
export CLIO_UI_COLOR=false
export CLIO_HISTORY_ENABLED=false
```

## Schema Validation

All configuration is validated against JSON schemas. Invalid configuration will be rejected with helpful error messages:

```bash
$ clio config:set logging.level invalid
✖ Invalid configuration value
  - logging.level must be one of: silent, error, warn, info, debug, trace
```

## Configuration Migration

When upgrading CLI Ops, configuration is automatically migrated to new schemas. Backups are created at:

```
~/.config/clio/config.json.backup-TIMESTAMP
```

To manually trigger migration:

```bash
clio config:migrate
```

## See Also

- [Architecture: Configuration System](/docs/architecture/configuration) - Internal architecture details
- [Plugin Development: Configuration](/docs/contributing/plugin-development#configuration) - Adding config to plugins
- [Troubleshooting](/docs/guides/troubleshooting) - Common configuration issues
