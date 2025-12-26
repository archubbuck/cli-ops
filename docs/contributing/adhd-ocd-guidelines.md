# ADHD/OCD-Friendly Development Guidelines

## Overview

This document outlines development practices that support neurodivergent developers, particularly those with ADHD or OCD. These practices benefit all developers by promoting clarity, consistency, and reduced cognitive load.

## Core Principles

### 1. Predictability

**Why**: Reduces anxiety and cognitive load by creating reliable patterns.

**How**:
- Consistent file structure across packages
- Standardized naming conventions
- Uniform command patterns
- Predictable build outputs

**Examples**:
```
Every package follows same structure:
package/
├── src/
│   └── index.ts
├── test/
│   └── index.test.ts
├── package.json
├── README.md
└── tsconfig.json
```

### 2. Organization

**Why**: Clear organization reduces overwhelm and makes navigation easier.

**How**:
- Group related files together
- Use descriptive directory names
- Limit nesting depth to 3-4 levels
- Keep related code close

**Examples**:
```
✓ Good structure
src/commands/tasks/
  add.ts
  list.ts
  delete.ts

✗ Avoid
src/
  task-add.ts
  task-list.ts
  task-delete.ts
```

### 3. Simplicity

**Why**: Reduces cognitive overhead and makes code easier to reason about.

**How**:
- Prefer simple solutions over clever ones
- Extract complex logic into well-named functions
- Limit function length (aim for <50 lines)
- One responsibility per function

**Examples**:
```typescript
// ✓ Good - simple and clear
function formatTask(task: Task): string {
  return `${task.title} (${task.status})`
}

// ✗ Avoid - clever but confusing
const formatTask = (t: Task) => 
  [t.title, t.status].filter(Boolean).join(' (') + ')'
```

### 4. Explicit Over Implicit

**Why**: Reduces guesswork and mental modeling.

**How**:
- Explicit return types
- Named parameters for options
- Descriptive variable names
- Clear error messages

**Examples**:
```typescript
// ✓ Good - explicit
async function loadConfig(options: {
  path: string
  validate: boolean
}): Promise<Config> {
  // ...
}

// ✗ Avoid - implicit
async function loadConfig(p: string, v = true) {
  // ...
}
```

## Development Workflow

### Breaking Down Tasks

**Challenge**: Large tasks can be overwhelming.

**Solution**: Chunk work into small, completable pieces.

```markdown
Instead of:
- [ ] Implement task management

Break into:
- [ ] Create task storage interface
- [ ] Implement task add command
- [ ] Implement task list command
- [ ] Add tests for task commands
- [ ] Update documentation
```

### Making Progress Visible

**Challenge**: Hard to track progress across long sessions.

**Solution**: Use git commits as progress markers.

```bash
# Make small, frequent commits
git commit -m "feat: add task storage interface"
git commit -m "feat: implement task add command"
git commit -m "test: add tests for task add"

# View progress
git log --oneline
```

### Reducing Context Switching

**Challenge**: Context switches drain energy and focus.

**Solution**: Batch similar work and use tools to maintain context.

**Practices**:
- Keep one terminal for running CLI
- Keep another terminal for tests in watch mode
- Use VS Code workspace with all files open
- Write down current task before switching

### Managing Hyperfocus

**Challenge**: Can code for hours without breaks.

**Solution**: Set timers and reminders.

```bash
# Set timer for 50-minute work session
sleep 3000 && say "Time for a break"

# Or use Pomodoro timer
npm install -g pomade
pomade start
```

## Code Organization Patterns

### Single Responsibility

Each file, function, and class should have one clear purpose.

```typescript
// ✓ Good - clear responsibilities
// storage.ts - handles data persistence
// formatter.ts - formats output
// validator.ts - validates input

// ✗ Avoid - mixed responsibilities
// utils.ts - handles everything
```

### Consistent Naming

Use predictable naming patterns:

```typescript
// Functions: verb + noun
function loadConfig()
function saveTask()
function deleteItem()

// Classes: noun
class TaskManager
class ConfigStore
class Logger

// Boolean: is/has/can
const isValid = true
const hasAccess = false
const canDelete = true

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3
const DEFAULT_TIMEOUT = 5000
```

### Limited Function Scope

Keep functions small and focused:

```typescript
// ✓ Good - focused function
async function loadTasks(): Promise<Task[]> {
  const data = await readFile(TASKS_FILE)
  return JSON.parse(data)
}

// ✗ Avoid - too many responsibilities
async function loadTasksAndFormatAndDisplay() {
  const data = await readFile(TASKS_FILE)
  const tasks = JSON.parse(data)
  const formatted = tasks.map(formatTask)
  console.log(formatted.join('\n'))
}

// ✓ Better - compose small functions
const tasks = await loadTasks()
const formatted = tasks.map(formatTask)
display(formatted)
```

## Error Handling

### Helpful Error Messages

Errors should be actionable:

```typescript
// ✓ Good - helpful
throw new Error(
  `Task not found: '${id}'\n\n` +
  `Try running:\n` +
  `  alpha tasks list    # See all tasks\n` +
  `  alpha tasks add     # Create new task`
)

// ✗ Avoid - vague
throw new Error('Not found')
```

### Predictable Error Handling

Use consistent error handling patterns:

```typescript
// Consistent pattern across codebase
async function loadConfig(): Promise<Config> {
  try {
    const data = await readFile(CONFIG_FILE)
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return getDefaultConfig()
    }
    throw new ConfigError('Failed to load config', { cause: error })
  }
}
```

## Testing for Confidence

### Why It Helps

Tests provide confidence to refactor without fear of breaking things.

### Testing Checklist

For each new feature:
- [ ] Unit tests for core logic
- [ ] Integration tests for command flow
- [ ] E2E test for user scenario
- [ ] Error cases covered

### Test-Driven Development

TDD can help manage overwhelm:

```typescript
// 1. Write failing test (defines what you're building)
it('adds task to list', () => {
  const result = addTask('New task')
  expect(result).toBe(true)
})

// 2. Implement minimal code to pass
function addTask(title: string): boolean {
  tasks.push({ title })
  return true
}

// 3. Refactor with confidence
```

## Documentation

### Self-Documenting Code

Prefer clear code over comments:

```typescript
// ✓ Good - code is clear
function getActiveTasks() {
  return tasks.filter(task => task.status === 'active')
}

// ✗ Avoid - needs comment
function getT() {
  // Get active tasks
  return tasks.filter(t => t.s === 'a')
}
```

### When to Comment

Use comments for "why" not "what":

```typescript
// ✓ Good - explains why
// Use debounce to avoid overwhelming the API
// with requests during rapid typing
const debouncedSearch = debounce(search, 300)

// ✗ Avoid - states the obvious
// Call the search function with debounce
const debouncedSearch = debounce(search, 300)
```

### README for Each Package

Every package includes:
- Purpose (1-2 sentences)
- Installation
- Basic usage example
- API reference
- Links to related docs

## Visual Feedback

### Progress Indicators

For long operations, show progress:

```typescript
import { spinner } from '@cli-ops/shared-ui'

const spin = spinner('Loading tasks...')
await loadTasks()
spin.succeed('Tasks loaded')
```

### Confirmation

Before destructive actions:

```typescript
const confirmed = await confirm({
  message: 'Delete all tasks? This cannot be undone.',
  default: false
})
```

### Color + Symbols

Never rely on color alone (colorblind accessibility):

```typescript
// ✓ Good - symbol + color
console.log('✓ Success')  // Green
console.log('✗ Error')    // Red
console.log('⚠ Warning')  // Yellow

// ✗ Avoid - color only
console.log(chalk.green('Success'))
```

## Managing Perfectionism

### Good Enough vs. Perfect

```markdown
✓ Ship good enough code
- Tests pass
- Meets requirements
- Readable and maintainable

✗ Don't wait for perfect
- Optimal performance (unless needed)
- Perfect abstraction (YAGNI)
- Every edge case handled
```

### Progressive Enhancement

Build incrementally:

```typescript
// Version 1: Basic functionality
function formatTask(task: Task): string {
  return task.title
}

// Version 2: Add status
function formatTask(task: Task): string {
  return `${task.title} (${task.status})`
}

// Version 3: Add colors
function formatTask(task: Task): string {
  const color = getColorForStatus(task.status)
  return color(`${task.title} (${task.status})`)
}
```

### Done is Better Than Perfect

Use TODOs for future improvements:

```typescript
function loadConfig(): Config {
  const data = fs.readFileSync(CONFIG_FILE)
  return JSON.parse(data)
  
  // TODO: Add validation
  // TODO: Handle missing file
  // TODO: Support multiple formats
}
```

## Dealing with Decision Paralysis

### Sensible Defaults

Provide defaults to reduce decisions:

```typescript
// ✓ Good - has defaults
createLogger({
  level: 'info',        // default
  format: 'pretty',     // default
  colors: true          // default
})

// ✗ Avoid - requires all decisions
createLogger({
  level: ???,
  format: ???,
  colors: ???
})
```

### Follow Established Patterns

When in doubt, copy existing patterns:

```typescript
// New command? Copy structure from existing command
// New package? Copy structure from shared-logger
// New test? Copy pattern from similar test
```

## Time Management

### Time-Boxing

Set time limits to prevent endless tweaking:

```markdown
Tasks with time boxes:
- [ ] Implement basic feature (2 hours)
- [ ] Add tests (1 hour)
- [ ] Write docs (30 minutes)
- [ ] Code review (15 minutes)
```

### Pomodoro Technique

Work in focused sprints:

```
1. Work for 25 minutes (one Pomodoro)
2. Take 5-minute break
3. After 4 Pomodoros, take longer break (15-30 min)
```

### Task Switching Buffer

When switching tasks, take a moment to:
1. Write down current state
2. Commit work-in-progress
3. Review next task
4. Set up environment

## Tools & Automation

### Automate Repetitive Tasks

```bash
# Format on save (VS Code settings)
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Validation Scripts

Run automatically:

```bash
# Pre-commit hook validates:
- Lint
- Type check
- Tests
- Spell check
```

### Watch Mode

Get instant feedback:

```bash
# Watch tests
pnpm test:watch

# Watch build
pnpm dev
```

## Team Collaboration

### Clear Communication

In PRs and issues:
- State problem clearly
- Provide examples
- List what you tried
- Ask specific questions

### Async-First

Prefer async communication:
- Write detailed PR descriptions
- Use GitHub comments
- Document decisions in ADRs
- Reduces real-time pressure

### Set Boundaries

Communicate your needs:
- "I need 2 hours of focused time"
- "I work best in the morning"
- "I prefer written communication"

## Related Documentation

- [ADR-005: ADHD/OCD-Friendly UX Patterns](../adr/005-adhd-ocd-friendly-ux-patterns.md)
- [Getting Started](./getting-started.md)
- [Testing Strategy](./testing-strategy.md)

<!-- TODO: Expand with neurodiversity resources and community support -->
<!-- TODO: Add examples of accommodations and workspace setups -->
<!-- TODO: Document stress management and burnout prevention -->
