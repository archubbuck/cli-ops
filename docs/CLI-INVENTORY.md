# CLI Inventory

> **Last Updated:** December 29, 2025
> **Generated:** Automatically via `pnpm inventory:generate`

This document provides a comprehensive inventory of all CLI applications in this monorepo, including their commands, performance metrics, and testing status.

## Overview

| CLI | Version | Commands | Performance (help/version) | Tests | Shared Packages |
|-----|---------|----------|----------------------------|-------|------------------|
| **clio** | 1.0.0 | 7 | ⚠️ 743ms / ⚠️ 734ms | ❌ No tests | 0 |
| **clio** | 3.0.0 | 2 | ⚠️ 592ms / ⚠️ 586ms | ❌ No tests | 0 |
| **clio** | 3.0.0 | 1 | ❌ / ❌ | ❌ No tests | 0 |
| **clio** | 3.0.0 | 3 | ⚠️ 580ms / ⚠️ 578ms | ❌ No tests | 0 |
| **clio** | 3.0.0 | 1 | ❌ / ❌ | ❌ No tests | 0 |
| **clio** | 3.0.0 | 5 | ⚠️ 681ms / ⚠️ 686ms | ❌ No tests | 0 |
| **clio** | 3.0.0 | 2 | ❌ / ❌ | ❌ No tests | 0 |

**Performance Budgets:**
- Help command: 500ms
- Version command: 200ms

## clio

**Foundational plugin manager CLI for CLI Ops tools**

- **Package:** `@cli-ops/clio`
- **Version:** 1.0.0
- **Binary:** `clio`
- **Commands:** 7
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

#### `plugins:extensions`

List available extensions for a plugin

#### `setup`

Set up shell completions and other configuration

### Command Topics

- **config:** Manage clio configuration
- **history:** View command history

### Performance

| Command | Duration | Budget | Status |
|---------|----------|--------|--------|
| `--help` | 743ms | 500ms | ⚠️ Over Budget |
| `--version` | 734ms | 200ms | ⚠️ Over Budget |

### Testing

- **Status:** ❌ No tests found

---

## clio

**HTTP API client plugin for clio**

- **Package:** `@cli-ops/clio-plugin-fetch`
- **Version:** 3.0.0
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
| `--help` | 592ms | 500ms | ⚠️ Over Budget |
| `--version` | 586ms | 200ms | ⚠️ Over Budget |

### Testing

- **Status:** ❌ No tests found

---

## clio

**OAuth 2.0 authentication plugin for clio fetch**

- **Package:** `@cli-ops/clio-plugin-fetch-oauth`
- **Version:** 3.0.0
- **Binary:** `clio`
- **Commands:** 1
- **Shared Dependencies:** 0 packages

### Commands

#### `oauth:login`

Authenticate using OAuth 2.0

### Command Topics

- **fetch:oauth:** OAuth 2.0 authentication for HTTP requests

### Performance

| Command | Duration | Budget | Status |
|---------|----------|--------|--------|
| `--help` | -1ms | 500ms | ❌ Error |
| `--version` | -1ms | 200ms | ❌ Error |

### Testing

- **Status:** ❌ No tests found

---

## clio

**Developer tools plugin for clio with Git and GitHub integration**

- **Package:** `@cli-ops/clio-plugin-repo`
- **Version:** 3.0.0
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
| `--help` | 580ms | 500ms | ⚠️ Over Budget |
| `--version` | 578ms | 200ms | ⚠️ Over Budget |

### Testing

- **Status:** ❌ No tests found

---

## clio

**Git hooks automation plugin for clio repo**

- **Package:** `@cli-ops/clio-plugin-repo-hooks`
- **Version:** 3.0.0
- **Binary:** `clio`
- **Commands:** 1
- **Shared Dependencies:** 0 packages

### Commands

#### `hooks:install`

Install Git hooks for automated checks

### Command Topics

- **repo:hooks:** Git hooks management and automation

### Performance

| Command | Duration | Budget | Status |
|---------|----------|--------|--------|
| `--help` | -1ms | 500ms | ❌ Error |
| `--version` | -1ms | 200ms | ❌ Error |

### Testing

- **Status:** ❌ No tests found

---

## clio

**Task management plugin for clio**

- **Package:** `@cli-ops/clio-plugin-tasks`
- **Version:** 3.0.0
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
| `--help` | 681ms | 500ms | ⚠️ Over Budget |
| `--version` | 686ms | 200ms | ⚠️ Over Budget |

### Testing

- **Status:** ❌ No tests found

---

## clio

**Jira integration plugin for clio tasks**

- **Package:** `@cli-ops/clio-plugin-tasks-jira`
- **Version:** 3.0.0
- **Binary:** `clio`
- **Commands:** 2
- **Shared Dependencies:** 0 packages

### Commands

#### `jira:link`

Link a local task to a Jira issue

#### `jira:sync`

Sync tasks with Jira project

### Command Topics

- **tasks:jira:** Jira integration for task management

### Performance

| Command | Duration | Budget | Status |
|---------|----------|--------|--------|
| `--help` | -1ms | 500ms | ❌ Error |
| `--version` | -1ms | 200ms | ❌ Error |

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
