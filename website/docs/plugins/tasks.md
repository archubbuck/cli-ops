---
sidebar_position: 4
---

# Tasks Plugin

The `@cli-ops/clio-plugin-tasks` provides powerful task management capabilities with support for priorities, tags, and multiple output formats.

## Installation

```bash
clio plugins:install @cli-ops/clio-plugin-tasks
```

## Features

- ✅ Create, read, update, delete tasks
- 🎯 Priority levels (low, medium, high, urgent)
- 📊 Status tracking (todo, in-progress, done, cancelled)
- 🏷️ Tag support
- 💾 JSON file storage
- 🎨 Multiple output formats (table, JSON)
- 🔍 Filter and search
- ⌨️ Interactive and CLI modes

## Commands

### tasks:create

Create a new task.

```bash
# CLI mode
clio tasks:create --title "Implement feature" --priority high --tags backend,api

# Interactive mode
clio tasks:create --interactive
clio tasks:create -i
```

**Flags:**

- `--title, -t` - Task title (required in CLI mode)
- `--priority, -p` - Priority level (low, medium, high, urgent)
- `--tags` - Comma-separated tags
- `--interactive, -i` - Interactive mode

### tasks:list

List all tasks with optional filtering.

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

**Flags:**

- `--status, -s` - Filter by status
- `--priority, -p` - Filter by priority
- `--tag, -t` - Filter by tag
- `--format, -f` - Output format (table, json)

### tasks:show

Show detailed information about a task.

```bash
clio tasks:show abc123
clio tasks:show abc123 --format json
```

### tasks:update

Update an existing task.

```bash
# CLI mode
clio tasks:update abc123 --status done
clio tasks:update abc123 --priority urgent --tags critical

# Interactive mode
clio tasks:update abc123 --interactive
```

**Flags:**

- `--title, -t` - New title
- `--status, -s` - New status
- `--priority, -p` - New priority
- `--tags` - New tags (comma-separated)
- `--interactive, -i` - Interactive mode

### tasks:delete

Delete a task.

```bash
# With confirmation
clio tasks:delete abc123

# Skip confirmation
clio tasks:delete abc123 --force
```

**Flags:**

- `--force, -f` - Skip confirmation

## Examples

### Create a high-priority task

```bash
clio tasks:create \
  --title "Fix critical bug in auth" \
  --priority high \
  --tags bug,security,backend
```

### List urgent tasks

```bash
clio tasks:list --priority urgent
```

### Update task status

```bash
clio tasks:update abc123 --status done
```

### Delete completed tasks

First, list completed tasks:

```bash
clio tasks:list --status done
```

Then delete each one:

```bash
clio tasks:delete abc123 --force
```

## Configuration

Tasks are stored in:

```
~/.config/clio/tasks.json
```

Example structure:

```json
{
  "tasks": [
    {
      "id": "abc123",
      "title": "Implement feature",
      "status": "in-progress",
      "priority": "high",
      "tags": ["backend", "api"],
      "createdAt": "2025-12-27T12:00:00Z",
      "updatedAt": "2025-12-27T13:00:00Z"
    }
  ]
}
```

## Extensions

### @cli-ops/clio-plugin-tasks-jira

Extends tasks plugin with Jira integration.

See [extensions/clio-plugin-tasks-jira](https://github.com/archubbuck/cli-ops/tree/main/extensions/clio-plugin-tasks-jira) for implementation example.

## Related

- [Plugin Development Guide](./development)
- [Fetch Plugin](./fetch)
- [Repo Plugin](./repo)
