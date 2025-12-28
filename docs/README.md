---
slug: /
sidebar_position: 1
title: Welcome to CLI Ops
description: Modern, plugin-first CLI framework for building extensible command-line tools
---

# Welcome to CLI Ops

**CLI Ops** (Clio) is a modern, plugin-first CLI framework designed for building extensible command-line tools with exceptional user experience.

## What is Clio?

Clio is a CLI manager that provides:

- 🔌 **Plugin Architecture**: Install only the commands you need
- 🚀 **Fast Performance**: Under 200ms for common operations
- 🧠 **ADHD/OCD-Friendly**: Thoughtful UX patterns for neurodivergent users
- 📝 **Command History**: Undo mistakes with built-in history system
- 🔄 **Cross-Plugin Communication**: Plugins can coordinate and share data
- 📦 **Monorepo-Friendly**: Built with modern JavaScript tooling

## Quick Example

```bash
# Install clio
npm install -g @cli-ops/clio

# Use bundled task management
clio tasks:create "Write documentation"
clio tasks:list

# Install additional plugins
clio plugins:install @cli-ops/clio-plugin-fetch
clio fetch:get https://api.github.com/users/octocat

# View command history
clio history:list

# Undo the last command
clio history:undo
```

## Core Features

### Plugin System

Clio uses oclif's plugin system to enable modular functionality:

```bash
clio plugins:install @cli-ops/clio-plugin-fetch  # HTTP client
clio plugins:install @cli-ops/clio-plugin-repo   # Git/GitHub tools
```

### Command History & Undo

Never fear making mistakes. Clio tracks all commands and allows undoing reversible operations:

```bash
clio tasks:delete 42
# Oops, wrong task!
clio history:undo
✓ Restored task #42
```

### Configuration Management

Simple, unified configuration across all plugins:

```bash
clio config:set api.baseUrl https://api.example.com
clio config:get api.baseUrl
clio config:list
```

### Performance

Built for speed with strict performance budgets:

- `--help`: Under 200ms
- `--version`: Under 100ms
- Simple commands: Under 500ms

## Why Clio?

### For Users

- **Fast and responsive** - No waiting around
- **Mistake-friendly** - Undo commands when needed
- **Discoverable** - Clear help text and examples
- **Extensible** - Install only what you need

### For Plugin Developers

- **TypeScript-first** - Full type safety
- **Shared utilities** - 15 shared packages for common tasks
- **Testing tools** - Built-in testing utilities
- **Documentation** - Comprehensive guides and examples

### For Organizations

- **Monorepo-friendly** - Works well in large codebases
- **CI/CD ready** - Automated testing and publishing
- **Open source** - MIT licensed, community-driven

## Architecture Overview

Clio is built as a monorepo with:

- **Core CLI** (`@cli-ops/clio`) - Plugin manager and base functionality
- **Official Plugins** - `tasks`, `fetch`, `repo`
- **Shared Packages** - Reusable utilities for logger, config, history, etc.
- **Meta Packages** - Bundles for different personas (developer, complete)

All packages are scoped under `@cli-ops` on npm.

## Documentation Structure

This documentation is organized into several sections:

- **[Guides](/docs/guides/installation)** - Get started with installation, quick start, and user guides
- **[Plugins](/docs/plugins/tasks)** - Plugin reference documentation
- **[Architecture](/docs/architecture/overview)** - System design and ADRs
- **[Contributing](/docs/contributing/getting-started)** - Development guide and best practices

## Next Steps

- [Installation](/docs/guides/installation) - Install Clio and get set up
- [Quick Start](/docs/guides/quick-start) - Get up and running in 5 minutes
- [Core Concepts](/docs/guides/concepts) - Understand plugins, commands, and configuration
- [Plugin Development](/docs/contributing/plugin-development) - Create your own plugins

## Community

- [GitHub Repository](https://github.com/archubbuck/cli-ops)
- [Contributing Guide](/docs/contributing/getting-started)
