# @cli-ops/clio-plugin-tasks

A powerful task management plugin for Clio with CRUD operations and full workspace package integration.

> **Documentation**: See [Tasks Plugin Documentation](https://github.com/archubbuck/cli-ops/tree/main/docs/plugins/tasks.md) for complete reference.

## Features

- ✅ Create, read, update, delete tasks
- 🎯 Priority levels (low, medium, high, urgent)
- 📊 Status tracking (todo, in-progress, done, cancelled)
- 🏷️ Tag support
- 💾 JSON file storage
- 🎨 Multiple output formats (table, JSON)
- 🔍 Filter and search
- ⌨️ Interactive and CLI modes
- 📝 Command history tracking
- 🎯 Type-safe with Zod validation

## Installation

Bundled with Clio by default. For development:

```bash
pnpm install
pnpm build
```

## Usage

### Create Tasks

```bash
# CLI mode
clio tasks:create --title "Implement feature" --priority high --tags backend,api

# Interactive mode
clio tasks:create --interactive
clio tasks:create -i
```

### List Tasks

```bash
# List all tasks
clio tasks:list

# Filter by status
clio tasks:list --status todo

# Filter by priority
clio tasks:list --priority high

# Filter by tag
clio tasks:list --tag urgent

# JSON output
clio tasks:list --format json
```

### Show Task Details

```bash
clio tasks:show abc123
clio tasks:show abc123 --format json
```

### Update Tasks

```bash
# CLI mode
clio tasks:update abc123 --status done
clio tasks:update abc123 --priority urgent --tags critical

# Interactive mode
clio tasks:update abc123 --interactive
```

### Delete Tasks

```bash
# With confirmation
clio tasks:delete abc123

# Skip confirmation
clio tasks:delete abc123 --force
```

## Global Flags

- `--format` - Output format (json, table, text)
- `--verbose, -v` - Verbose output
- `--quiet, -q` - Suppress output
- `--no-color` - Disable colors

## Examples

### Create a task interactively

```bash
clio tasks:create -i
```

### Create a high-priority task with tags

```bash
clio tasks:create \
  --title "Fix critical bug" \
  --description "Server crashes on startup" \
  --priority urgent \
  --tags bug,backend,critical
```

### List only in-progress tasks

```bash
clio tasks:list --status in-progress
```

### Update task to done

```bash
clio tasks:update abc123 --status done
```

### Export tasks to JSON

```bash
clio tasks:list --format json > tasks.json
```

## Task Schema

```typescript
{
  id: string              // Auto-generated
  title: string           // Required
  description?: string    // Optional
  status: 'todo' | 'in-progress' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
  createdAt: number       // Timestamp
  updatedAt: number       // Timestamp
  completedAt?: number    // Timestamp when marked done
}
```

## Storage

Tasks are stored in:

- Linux/Mac: `~/.local/share/clio/tasks.json`
- Windows: `%LOCALAPPDATA%/clio/tasks.json`

## Architecture

This CLI demonstrates:

- **BaseCommand** - Enhanced oclif command with history, logging, config
- **Zod Validation** - Type-safe schemas for tasks
- **Storage Layer** - File-based persistence with async operations
- **Formatters** - Multiple output formats (table, JSON)
- **Prompts** - Interactive mode with inquirer
- **Error Handling** - Custom errors with suggestions
- **Hooks** - Lifecycle hooks for init, prerun, postrun
- **Exit Codes** - Standard exit codes for all scenarios

## Development

```bash
# Run in dev mode
pnpm dev tasks:list

# Build
pnpm build

# Typecheck
pnpm typecheck

# Performance check
pnpm perf
```

## Extension API

> **New in v3.0.0**: Extension plugins can hook into task lifecycle events

This plugin provides extension points for other plugins to add functionality. Extensions can register hooks to modify behavior at specific points in the task lifecycle.

### Available Hooks

#### `task:beforeCreate`

**When**: Before a task is created  
**Data**: Task creation data (title, description, priority, tags, etc.)  
**Use case**: Validate or enrich task data before creation

```typescript
this.registerHook('task:beforeCreate', async (data: TaskCreateData) => {
  // Add Jira ID lookup, validate fields, etc.
})
```

#### `task:afterCreate`

**When**: After a task is successfully created  
**Data**: Complete task object with generated ID  
**Use case**: Sync to external systems, trigger notifications

```typescript
this.registerHook('task:afterCreate', async (task: Task) => {
  // Sync to Jira, send notification, etc.
})
```

#### `task:beforeComplete`

**When**: Before marking a task as complete  
**Data**: Task object  
**Use case**: Validate completion requirements

```typescript
this.registerHook('task:beforeComplete', async (task: Task) => {
  // Check all subtasks done, validate Jira status, etc.
})
```

#### `task:afterComplete`

**When**: After a task is marked complete  
**Data**: Updated task object  
**Use case**: Trigger workflows, update external systems

```typescript
this.registerHook('task:afterComplete', async (task: Task) => {
  // Update Jira, trigger CI/CD, etc.
})
```

#### Other Hooks

- `task:beforeUpdate` - Before task update
- `task:afterUpdate` - After task update
- `task:beforeDelete` - Before task deletion
- `task:afterDelete` - After task deletion

### Legacy Event Bus

For backward compatibility, the following events are still emitted:

- `task:created` - After task creation (legacy)
- `task:completed` - After task completion (legacy)
- `task:updated` - After task update (legacy)
- `task:deleted` - After task deletion (legacy)

**Note**: New extensions should use hooks instead of events for type safety and sequential execution guarantees.

### Example Extension

See [@cli-ops/clio-plugin-tasks-jira](../clio-plugin-tasks-jira) for a complete extension example.

## ADHD/OCD Benefits

- **Clear structure** - Organized by commands
- **Predictable** - Consistent patterns across all commands
- **Visual feedback** - Tables, colors, status indicators
- **Interactive mode** - Reduces cognitive load of remembering flags
- **Validation** - Catches errors early with helpful messages
- **History** - Track what you've done
