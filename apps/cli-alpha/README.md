# CLI Alpha - Task Manager

A powerful task management CLI with CRUD operations, demonstrating the full capabilities of the shared workspace packages.

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

```bash
pnpm install
pnpm build
```

## Usage

### Create Tasks

```bash
# CLI mode
alpha tasks:create --title "Implement feature" --priority high --tags backend,api

# Interactive mode
alpha tasks:create --interactive
alpha tasks:create -i
```

### List Tasks

```bash
# List all tasks
alpha tasks:list

# Filter by status
alpha tasks:list --status todo

# Filter by priority
alpha tasks:list --priority high

# Filter by tag
alpha tasks:list --tag urgent

# JSON output
alpha tasks:list --format json
```

### Show Task Details

```bash
alpha tasks:show abc123
alpha tasks:show abc123 --format json
```

### Update Tasks

```bash
# CLI mode
alpha tasks:update abc123 --status done
alpha tasks:update abc123 --priority urgent --tags critical

# Interactive mode
alpha tasks:update abc123 --interactive
```

### Delete Tasks

```bash
# With confirmation
alpha tasks:delete abc123

# Skip confirmation
alpha tasks:delete abc123 --force
```

## Global Flags

- `--format` - Output format (json, table, text)
- `--verbose, -v` - Verbose output
- `--quiet, -q` - Suppress output
- `--no-color` - Disable colors

## Examples

### Create a task interactively
```bash
alpha tasks:create -i
```

### Create a high-priority task with tags
```bash
alpha tasks:create \
  --title "Fix critical bug" \
  --description "Server crashes on startup" \
  --priority urgent \
  --tags bug,backend,critical
```

### List only in-progress tasks
```bash
alpha tasks:list --status in-progress
```

### Update task to done
```bash
alpha tasks:update abc123 --status done
```

### Export tasks to JSON
```bash
alpha tasks:list --format json > tasks.json
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
- Linux/Mac: `~/.local/share/alpha/tasks.json`
- Windows: `%LOCALAPPDATA%/alpha/tasks.json`

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

## ADHD/OCD Benefits

- **Clear structure** - Organized by commands
- **Predictable** - Consistent patterns across all commands
- **Visual feedback** - Tables, colors, status indicators
- **Interactive mode** - Reduces cognitive load of remembering flags
- **Validation** - Catches errors early with helpful messages
- **History** - Track what you've done
