---
sidebar_position: 1
---

# Core Concepts

Understanding the foundational concepts in Clio.

## Plugins

Plugins are the building blocks of Clio. Every feature is implemented as a plugin that can be installed, updated, or removed independently.

### Plugin Types

**Bundled Plugins**  
Pre-installed with Clio:

- `@cli-ops/clio-plugin-tasks`
- `@cli-ops/clio-plugin-fetch`
- `@cli-ops/clio-plugin-repo`

**Extension Plugins**  
Extend existing plugins with additional features:

- `@cli-ops/clio-plugin-tasks-jira` (extends tasks)
- `@cli-ops/clio-plugin-fetch-oauth` (extends fetch)

**Community Plugins**  
Third-party plugins following the same architecture.

[Learn more about plugins →](../plugins/getting-started)

## Commands

Commands are the primary way users interact with Clio. Each command follows a consistent structure:

```bash
clio topic:action [arguments] [flags]
```

Examples:

- `clio tasks:create "Fix bug" --priority high`
- `clio fetch:get https://api.example.com --cache`
- `clio repo:pr:create --title "Add feature"`

### Command Structure

- **Topic**: Logical grouping (tasks, fetch, repo)
- **Action**: What to do (create, list, update, delete)
- **Arguments**: Required positional parameters
- **Flags**: Optional named parameters

## Configuration

Clio uses a hierarchical configuration system:

### Configuration Locations

1. **Global**: `~/.config/clio/config.json`
2. **Project**: `./.clio/config.json`
3. **Environment Variables**: `CLIO_*`
4. **Command Flags**: `--config-key value`

### Configuration Priority

```
Command Flags > Environment Variables > Project Config > Global Config > Defaults
```

### Example Configuration

```json
{
  "log": {
    "level": "info",
    "format": "pretty"
  },
  "plugins": {
    "tasks": {
      "defaultPriority": "medium"
    },
    "fetch": {
      "cacheTTL": 3600
    }
  }
}
```

### Managing Configuration

```bash
# Get a value
clio config:get log.level

# Set a value
clio config:set log.level debug

# List all configuration
clio config:list
```

## History

Clio tracks all command executions for audit trails and debugging:

### View History

```bash
# List recent commands
clio history:list

# Show specific command
clio history:show 123

# Search history
clio history:search "tasks:create"
```

### Benefits

- **Audit Trail**: Track what commands were run and when
- **Debugging**: Reproduce issues by replaying commands
- **Learning**: See what commands others use
- **Undo**: (Planned) Reverse destructive operations

## Shared Infrastructure

All plugins and commands have access to shared infrastructure:

### Logger

```typescript
this.logger.info('Operation complete')
this.logger.error('Something failed', { error })
this.logger.debug('Detailed info', { data })
```

### UI Components

```typescript
import { createSpinner } from '@cli-ops/shared-ui'

const spinner = createSpinner({ text: 'Loading...' })
spinner.start()
await doWork()
spinner.stop()
```

### Prompts

```typescript
import { confirm } from '@cli-ops/shared-prompts'

const shouldContinue = await confirm({
  message: 'Delete all tasks?',
  default: false,
})
```

### Services

```typescript
import { CacheService } from '@cli-ops/shared-services'

const cache = new CacheService({ ttl: 60000 })
await cache.set('key', 'value')
const value = await cache.get('key')
```

## Exit Codes

Clio uses standardized exit codes for consistent error handling:

| Code | Meaning             |
| ---- | ------------------- |
| 0    | Success             |
| 1    | General error       |
| 2    | Misuse of command   |
| 3    | Configuration error |
| 4    | Network error       |
| 5    | File system error   |
| 6    | Validation error    |

## Events

Plugins communicate through an event system:

### Emitting Events

```typescript
this.emit('tasks:created', { id: '123', title: 'Fix bug' })
```

### Listening to Events

```typescript
this.on('tasks:created', (data) => {
  console.log('New task:', data)
})
```

### Common Events

- `tasks:created` - Task created
- `tasks:updated` - Task updated
- `fetch:request:complete` - HTTP request completed
- `repo:pr:created` - Pull request created

## Next Steps

- [Plugin Development](../plugins/development)
- [Architecture Overview](../architecture/overview)
- [Contributing Guide](../contributing/getting-started)
