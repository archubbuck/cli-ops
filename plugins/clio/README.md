# @cli-ops/clio

Foundational plugin manager CLI for CLI Ops tools.

## Installation

```bash
npm install -g @cli-ops/clio
```

## Quick Start

Clio comes with the task management plugin (`@cli-ops/clio-plugin-tasks`) bundled by default:

```bash
# Task management (bundled by default)
clio tasks:create "My new task"
clio tasks:list
```

## Installing Additional Plugins

Install additional functionality as needed:

```bash
# HTTP API client
clio plugins:install @cli-ops/clio-plugin-fetch

# Developer tools with Git/GitHub integration
clio plugins:install @cli-ops/clio-plugin-repo
```

Or use persona-based meta-packages:

```bash
# For developers (fetch + repo tools)
npm install -g @cli-ops/clio-meta-developer

# For complete installation (all plugins)
npm install -g @cli-ops/clio-meta-complete
```

## Core Commands

### Plugin Management

```bash
clio plugins                                 # List installed plugins
clio plugins:install @cli-ops/clio-plugin-*  # Install plugin
clio plugins:uninstall PLUGIN                # Remove plugin
clio plugins:update                          # Update all plugins
```

### Configuration

```bash
clio config:get KEY           # Get config value
clio config:set KEY VALUE     # Set config value
clio config:list              # List all config
```

### History

```bash
clio history:list             # View command history
```

### Diagnostics

```bash
clio doctor                   # Check installation health
```

## Available Plugins

- **@cli-ops/clio-plugin-tasks** - Task management (bundled)
- **@cli-ops/clio-plugin-fetch** - HTTP API client
- **@cli-ops/clio-plugin-repo** - Git/GitHub developer tools

## Meta-Packages

- **@cli-ops/clio-meta-developer** - Clio + fetch + repo
- **@cli-ops/clio-meta-productivity** - Clio + tasks (tasks is bundled)
- **@cli-ops/clio-meta-complete** - All plugins

## Documentation

See [CLI Ops Documentation](../../docs/) for more information.
