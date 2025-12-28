# CLI Inventory

> **Last Updated:** December 28, 2025
> **Generated:** Automatically via `pnpm inventory:generate`

This document provides a comprehensive inventory of all CLI applications in this monorepo, including their commands, performance metrics, and testing status.

## Overview

| CLI | Version | Commands | Performance (help/version) | Tests | Shared Packages |
|-----|---------|----------|----------------------------|-------|------------------|
| **clio** | 1.0.0 | 6 | ⚠️ 924ms / ⚠️ 889ms | ❌ No tests | 0 |
| **clio** | 2.0.0 | 2 | ⚠️ 774ms / ⚠️ 691ms | ❌ No tests | 0 |
| **clio** | 2.0.0 | 3 | ⚠️ 928ms / ⚠️ 764ms | ❌ No tests | 0 |
| **clio** | 2.0.0 | 5 | ⚠️ 854ms / ⚠️ 969ms | ❌ No tests | 0 |

**Performance Budgets:**
- Help command: 500ms
- Version command: 200ms

## clio

**Foundational plugin manager CLI for CLI Ops tools**

- **Package:** `@cli-ops/clio`
- **Version:** 1.0.0
- **Binary:** `clio`
- **Commands:** 6
- **Shared Dependencies:** 0 packages

### Commands

#### `config:get`

Get a configuration value

#### `config:list`

List all configuration values

#### `config:set`

Set a configuration value

#### `doctor`

Check clio installation health

#### `history:list`

View command history

#### `setup`

Set up shell completions and other configuration

### Command Topics

- **config:** Manage clio configuration
- **history:** View command history

### Performance

| Command | Duration | Budget | Status |
|---------|----------|--------|--------|
| `--help` | 924ms | 500ms | ⚠️ Over Budget |
| `--version` | 889ms | 200ms | ⚠️ Over Budget |

### Testing

- **Status:** ❌ No tests found

---

## clio

**HTTP API client plugin for clio**

- **Package:** `@cli-ops/clio-plugin-fetch`
- **Version:** 2.0.0
- **Binary:** `clio`
- **Commands:** 2
- **Shared Dependencies:** 0 packages

### Commands

#### `request:get`

Make a GET request

#### `request:post`

Make a POST request

### Command Topics

- **fetch:** Make HTTP requests
- **auth:** Manage authentication

### Performance

| Command | Duration | Budget | Status |
|---------|----------|--------|--------|
| `--help` | 774ms | 500ms | ⚠️ Over Budget |
| `--version` | 691ms | 200ms | ⚠️ Over Budget |

### Testing

- **Status:** ❌ No tests found

---

## clio

**Developer tools plugin for clio with Git and GitHub integration**

- **Package:** `@cli-ops/clio-plugin-repo`
- **Version:** 2.0.0
- **Binary:** `clio`
- **Commands:** 3
- **Shared Dependencies:** 0 packages

### Commands

#### `git:log`

Show git commit history

#### `git:status`

Show git repository status

#### `pr:list`

List pull requests

### Command Topics

- **repo:** Repository management

### Performance

| Command | Duration | Budget | Status |
|---------|----------|--------|--------|
| `--help` | 928ms | 500ms | ⚠️ Over Budget |
| `--version` | 764ms | 200ms | ⚠️ Over Budget |

### Testing

- **Status:** ❌ No tests found

---

## clio

**Task management plugin for clio**

- **Package:** `@cli-ops/clio-plugin-tasks`
- **Version:** 2.0.0
- **Binary:** `clio`
- **Commands:** 5
- **Shared Dependencies:** 0 packages

### Commands

#### `tasks:create`

Create a new task

#### `tasks:delete`

Delete a task

#### `tasks:list`

List all tasks

#### `tasks:show`

Show task details

#### `tasks:update`

Update a task

### Command Topics

- **tasks:** Manage tasks

### Performance

| Command | Duration | Budget | Status |
|---------|----------|--------|--------|
| `--help` | 854ms | 500ms | ⚠️ Over Budget |
| `--version` | 969ms | 200ms | ⚠️ Over Budget |

### Testing

- **Status:** ❌ No tests found

---

## Maintenance

This inventory is automatically generated and validated:

- **Generate:** `pnpm inventory:generate`
- **Validate:** `pnpm inventory:validate`
- **Update Architecture Docs:** `pnpm inventory:update-docs`

The inventory is regenerated:
- After each build via postbuild hook
- In CI workflows to ensure accuracy
- Before commits via pre-commit hook (validation)

### When to Update

The inventory updates automatically when:
- Adding or removing CLI applications
- Adding, removing, or modifying commands
- Changing CLI versions or descriptions
- Updating shared package dependencies

If the inventory is out of date, the `inventory:validate` script will fail and trigger regeneration.
