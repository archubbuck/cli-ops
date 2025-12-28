---
sidebar_position: 3
---

# Best Practices

Guidelines for creating high-quality, maintainable Clio plugins.

## Plugin Design

### Single Responsibility

Each plugin should focus on one domain or feature:

✅ **Good:**

- `@cli-ops/clio-plugin-tasks` - Task management only
- `@cli-ops/clio-plugin-fetch` - HTTP requests only

❌ **Avoid:**

- `@cli-ops/clio-plugin-everything` - Tasks + HTTP + Git + ...

### Extension Over Duplication

Extend existing plugins rather than reimplementing functionality:

```typescript
// ✅ Good: Extend existing plugin
// @cli-ops/clio-plugin-tasks-jira
import { TasksPlugin } from '@cli-ops/clio-plugin-tasks'

export class JiraTasksPlugin extends TasksPlugin {
  async syncWithJira() {
    const tasks = await this.listTasks()
    // Sync logic...
  }
}
```

### Clear Command Namespacing

Use topic separators for logical grouping:

```
clio tasks:create
clio tasks:list
clio tasks:jira:sync
clio tasks:jira:link
```

## Code Quality

### Type Safety

Always use TypeScript with strict mode:

```typescript
// ✅ Good: Explicit types
interface TaskData {
  title: string
  status: 'todo' | 'done'
}

async function createTask(data: TaskData): Promise<Task> {
  // Implementation
}

// ❌ Avoid: Any types
async function createTask(data: any): Promise<any> {
  // Implementation
}
```

### Error Handling

Use proper error handling with descriptive messages:

```typescript
import { CLIError } from '@oclif/core/errors'
import { ERROR_CODES } from '@cli-ops/shared-exit-codes'

export default class MyCommand extends BaseCommand {
  protected async execute(): Promise<void> {
    try {
      await riskyOperation()
    } catch (error) {
      this.logger.error('Operation failed:', error)
      throw new CLIError('Failed to complete operation', { exit: ERROR_CODES.OPERATION_FAILED })
    }
  }
}
```

### Validation

Validate inputs early:

```typescript
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1).max(200),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().datetime().optional(),
})

protected async execute(): Promise<void> {
  const { args } = await this.parse(TaskCreate)

  const validated = taskSchema.parse({
    title: args.title,
    priority: args.priority,
    dueDate: args.dueDate,
  })

  await this.createTask(validated)
}
```

## User Experience

### Consistent Feedback

Provide clear feedback for all operations:

```typescript
// ✅ Good: Clear feedback
this.logger.info('Creating task...')
const task = await createTask(data)
this.logger.success(`Created task #${task.id}`)

// ❌ Avoid: Silent operations
await createTask(data)
```

### Progress Indicators

Show progress for long-running operations:

```typescript
import { createSpinner } from '@cli-ops/shared-ui'

const spinner = createSpinner({ text: 'Syncing with API...' })
spinner.start()

try {
  await syncOperation()
  spinner.stop()
  this.logger.success('Sync complete')
} catch (error) {
  spinner.stop()
  this.logger.error('Sync failed')
}
```

### Interactive Prompts

Use prompts for better UX:

```typescript
import { confirm, select } from '@cli-ops/shared-prompts'

// Confirm destructive actions
const shouldDelete = await confirm({
  message: 'Delete all tasks? This cannot be undone.',
  default: false,
})

if (!shouldDelete) {
  this.logger.info('Cancelled')
  return
}

// Provide choices instead of requiring exact input
const status = await select({
  message: 'Select task status:',
  choices: [
    { value: 'todo', name: 'To Do' },
    { value: 'in-progress', name: 'In Progress' },
    { value: 'done', name: 'Done' },
  ],
})
```

### Helpful Defaults

Provide sensible defaults:

```typescript
static override flags = {
  limit: Flags.integer({
    description: 'Number of results',
    default: 10, // ✅ Reasonable default
  }),
  format: Flags.string({
    description: 'Output format',
    options: ['json', 'table', 'csv'],
    default: 'table', // ✅ Most common format
  }),
}
```

## Performance

### Caching

Cache expensive operations:

```typescript
import { CacheService } from '@cli-ops/shared-services'

export default class MyCommand extends BaseCommand {
  private cache = new CacheService({ ttl: 300000 }) // 5 minutes

  protected async execute(): Promise<void> {
    const cacheKey = 'api-data'

    let data = await this.cache.get(cacheKey)
    if (!data) {
      data = await fetchFromAPI()
      await this.cache.set(cacheKey, data)
    }

    this.logger.info(data)
  }
}
```

### Lazy Loading

Load resources only when needed:

```typescript
export class MyPlugin extends BasePlugin {
  private heavyResource?: HeavyResource

  async getResource(): Promise<HeavyResource> {
    if (!this.heavyResource) {
      this.heavyResource = await loadHeavyResource()
    }
    return this.heavyResource
  }
}
```

### Concurrent Operations

Use parallel execution when possible:

```typescript
// ✅ Good: Parallel
const [tasks, users, projects] = await Promise.all([fetchTasks(), fetchUsers(), fetchProjects()])

// ❌ Avoid: Sequential when not needed
const tasks = await fetchTasks()
const users = await fetchUsers()
const projects = await fetchProjects()
```

## Documentation

### README

Every plugin should have comprehensive documentation:

```markdown
# @cli-ops/clio-plugin-myfeature

> Description of what the plugin does

## Installation

\`\`\`bash
clio plugins:install @cli-ops/clio-plugin-myfeature
\`\`\`

## Commands

### myfeature:hello

Say hello

\`\`\`bash
clio myfeature:hello --name World
\`\`\`

## Configuration

\`\`\`json
{
"plugins": {
"myfeature": {
"defaultGreeting": "Hello"
}
}
}
\`\`\`

## License

MIT
```

### Command Help

Provide clear command descriptions and examples:

```typescript
export default class TaskCreate extends BaseCommand {
  static override description = 'Create a new task'

  static override examples = [
    '<%= config.bin %> <%= command.id %> "Fix bug in login"',
    '<%= config.bin %> <%= command.id %> "Add tests" --priority high',
    '<%= config.bin %> <%= command.id %> "Refactor API" --due 2025-12-31',
  ]
}
```

## Security

### Sensitive Data

Never log or expose sensitive information:

```typescript
// ✅ Good: Redact sensitive data
this.logger.debug('API call', {
  url,
  headers: { authorization: '[REDACTED]' },
})

// ❌ Avoid: Logging secrets
this.logger.debug('API call', {
  url,
  headers: { authorization: apiKey },
})
```

### Input Sanitization

Sanitize user input before use:

```typescript
import { escape } from 'he'

const sanitized = escape(userInput)
```

### Secure Defaults

Default to secure options:

```typescript
static override flags = {
  verify: Flags.boolean({
    description: 'Verify SSL certificates',
    default: true, // ✅ Secure by default
    allowNo: true,
  }),
}
```

## Testing

### Test Coverage

Aim for high test coverage:

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('TaskCreate', () => {
  it('creates task with valid data', async () => {
    // Test happy path
  })

  it('rejects invalid title', async () => {
    // Test validation
  })

  it('handles API errors gracefully', async () => {
    // Test error handling
  })
})
```

### Mock External Dependencies

```typescript
vi.mock('@cli-ops/shared-services', () => ({
  CacheService: vi.fn(),
}))
```

## Next Steps

- [View Example Plugins](https://github.com/archubbuck/cli-ops/tree/main/plugins)
- [Contributing Guidelines](/docs/contributing/getting-started)
- [Architecture Overview](/docs/architecture/overview)
