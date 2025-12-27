---
sidebar_position: 1
---

# Getting Started with Plugins

Clio uses a plugin-first architecture where functionality is distributed across modular plugins. Learn how to discover, install, and use plugins to extend your CLI capabilities.

## What are Plugins?

Plugins are npm packages that extend Clio with new commands and functionality. They can be:

- **Bundled Plugins**: Pre-installed with Clio (e.g., `@cli-ops/clio-plugin-tasks`)
- **Installable Plugins**: Added on-demand (e.g., `@cli-ops/clio-plugin-fetch`, `@cli-ops/clio-plugin-repo`)
- **Extension Plugins**: Community plugins that extend existing plugins (e.g., `@cli-ops/clio-plugin-tasks-jira`)

## Discovering Plugins

List all available plugins:

```bash
clio plugins
```

Search for plugins:

```bash
clio plugins:search tasks
```

View plugin details:

```bash
clio plugins:inspect @cli-ops/clio-plugin-tasks
```

## Installing Plugins

Install a plugin:

```bash
clio plugins:install @cli-ops/clio-plugin-fetch
```

Install a specific version:

```bash
clio plugins:install @cli-ops/clio-plugin-repo@2.0.0
```

Install from a git repository:

```bash
clio plugins:install https://github.com/archubbuck/cli-ops
```

## Using Plugins

Once installed, plugin commands become available in the CLI. For example, after installing `@cli-ops/clio-plugin-tasks`:

```bash
# Create a new task
clio tasks:create "Implement feature X"

# List all tasks
clio tasks:list

# Update a task
clio tasks:update 1 --status done
```

View all commands from a plugin:

```bash
clio help tasks
```

## Managing Plugins

### List Installed Plugins

```bash
clio plugins
```

### Update a Plugin

```bash
clio plugins:update @cli-ops/clio-plugin-tasks
```

### Uninstall a Plugin

```bash
clio plugins:uninstall @cli-ops/clio-plugin-fetch
```

### Link a Plugin for Development

```bash
clio plugins:link /path/to/plugin
```

## Core Plugins

### @cli-ops/clio-plugin-tasks

Task management and tracking.

**Commands:**

- `clio tasks:create` - Create a new task
- `clio tasks:list` - List all tasks
- `clio tasks:update` - Update task details
- `clio tasks:delete` - Delete a task

[Learn more →](./tasks)

### @cli-ops/clio-plugin-fetch

HTTP client with caching and retry logic.

**Commands:**

- `clio fetch:get` - Make GET requests
- `clio fetch:post` - Make POST requests
- `clio fetch:cache:clear` - Clear request cache

[Learn more →](./fetch)

### @cli-ops/clio-plugin-repo

Git and GitHub repository management.

**Commands:**

- `clio repo:status` - View repository status
- `clio repo:log` - View commit history
- `clio repo:sync` - Sync with remote
- `clio repo:pr:create` - Create pull request

[Learn more →](./repo)

## Next Steps

- [Develop Your Own Plugin](./development)
- [Plugin Best Practices](./best-practices)
- [View Example Plugins](https://github.com/archubbuck/cli-ops/tree/main/examples)
