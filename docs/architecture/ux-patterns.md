# UX Patterns

## Overview

This document outlines the user experience patterns implemented across all CLIs to ensure consistency, accessibility, and neurodivergent-friendly design (ADHD/OCD considerations).

## Core Principles

### 1. Predictability

Users should always know what to expect from commands:

```bash
# Consistent command structure
<cli> <noun> <verb> [arguments] [flags]

# Examples
alpha tasks add "Buy groceries"
beta items create --name "Item 1"
gamma projects delete project-123
```

### 2. Feedback

All operations provide clear visual feedback:

- **Instant operations** (<100ms): Immediate output
- **Quick operations** (100ms-1s): Spinner
- **Long operations** (>1s): Progress bar

### 3. Reversibility

Destructive operations can be undone:

```bash
# Delete with undo support
alpha tasks delete task-123

# Undo the deletion
alpha undo
```

### 4. Confirmation

Destructive actions require confirmation:

```bash
# Prompts before deleting
$ alpha tasks delete --all
? Delete all 47 tasks? This cannot be undone. (y/N)
```

### 5. Discoverability

Help is always available and contextual:

```bash
# Command help
alpha tasks add --help

# Did you mean suggestions for typos
$ alpha task add
Unknown command "task". Did you mean "tasks"?
```

## Visual Feedback Patterns

### Spinners

For indeterminate operations:

```typescript
import { spinner } from '@cli-ops/shared-ui'

const spin = spinner('Loading data...')
try {
  await fetchData()
  spin.succeed('Data loaded successfully')
} catch (error) {
  spin.fail('Failed to load data')
}
```

Output:
```
⠋ Loading data...
✓ Data loaded successfully
```

### Progress Bars

For trackable operations:

```typescript
import { progressBar } from '@cli-ops/shared-ui'

const progress = progressBar({
  total: files.length,
  format: 'Processing files [:bar] :current/:total'
})

for (const file of files) {
  await processFile(file)
  progress.increment()
}
```

Output:
```
Processing files [████████░░] 8/10
```

### Status Indicators

Consistent symbols across all CLIs:

- ✅ **Success**: Green + ✓ symbol
- ❌ **Error**: Red + ✗ symbol
- ⚠️ **Warning**: Yellow + ⚠ symbol
- ℹ️ **Info**: Blue + ℹ symbol
- 🔄 **Loading**: Spinner animation

## Interactive Prompts

### Confirmation Prompts

```typescript
import { confirm } from '@cli-ops/shared-prompts'

const shouldProceed = await confirm({
  message: 'Delete 5 tasks? This cannot be undone.',
  default: false
})

if (!shouldProceed) {
  return // User cancelled
}
```

### Input Prompts

```typescript
import { input } from '@cli-ops/shared-prompts'

const title = await input({
  message: 'Task title:',
  default: '',
  validate: (value) => value.length > 0 || 'Title is required'
})
```

### Select Prompts

```typescript
import { select } from '@cli-ops/shared-prompts'

const priority = await select({
  message: 'Task priority:',
  choices: [
    { name: 'Low', value: 'low' },
    { name: 'Medium', value: 'medium' },
    { name: 'High', value: 'high' }
  ]
})
```

### Multi-Select Prompts

```typescript
import { checkbox } from '@cli-ops/shared-prompts'

const selectedTasks = await checkbox({
  message: 'Select tasks to delete:',
  choices: tasks.map(t => ({
    name: t.title,
    value: t.id
  }))
})
```

## Output Formatting

### Tables

For structured data:

```typescript
import { table } from '@cli-ops/shared-formatter'

console.log(table({
  head: ['ID', 'Title', 'Status'],
  rows: tasks.map(t => [t.id, t.title, t.status])
}))
```

Output:
```
┌──────────┬──────────────────┬───────────┐
│ ID       │ Title            │ Status    │
├──────────┼──────────────────┼───────────┤
│ task-123 │ Buy groceries    │ pending   │
│ task-124 │ Write docs       │ completed │
└──────────┴──────────────────┴───────────┘
```

### Lists

For simple enumeration:

```typescript
import { list } from '@cli-ops/shared-formatter'

console.log(list(tasks.map(t => `${t.title} (${t.status})`)))
```

Output:
```
  • Buy groceries (pending)
  • Write docs (completed)
  • Review PR (pending)
```

### Tree Views

For hierarchical data:

```typescript
import { tree } from '@cli-ops/shared-formatter'

console.log(tree({
  'Project Alpha': {
    'tasks': {
      'task-123': 'Buy groceries',
      'task-124': 'Write docs'
    },
    'config': 'config.json'
  }
}))
```

Output:
```
Project Alpha
├── tasks
│   ├── task-123: Buy groceries
│   └── task-124: Write docs
└── config: config.json
```

## Error Handling

### Helpful Error Messages

Errors should be actionable:

```typescript
// ✓ Good - provides context and solution
throw new Error(
  `Task not found: 'task-123'\n\n` +
  `Did you mean:\n` +
  `  • task-124 - "Similar task"\n` +
  `  • task-125 - "Another task"\n\n` +
  `Run 'alpha tasks list' to see all tasks.`
)

// ✗ Avoid - too vague
throw new Error('Task not found')
```

### Error Recovery

Suggest fixes when possible:

```typescript
try {
  await loadConfig()
} catch (error) {
  logger.error('Failed to load configuration')
  logger.info('Try running: alpha config init')
  process.exit(1)
}
```

## Accessibility Features

### Colorblind-Friendly

Never rely on color alone:

```typescript
// ✓ Good - uses symbols + colors
console.log('✓ Success')  // Green ✓
console.log('✗ Error')    // Red ✗
console.log('⚠ Warning')  // Yellow ⚠

// ✗ Avoid - color only
console.log(chalk.green('Success'))
console.log(chalk.red('Error'))
```

### Screen Reader Support

Provide text alternatives:

```typescript
// Progress bar with text description
const progress = progressBar({
  format: 'Downloading [:bar] :percent :etas remaining'
})
```

### Reduce Animation

Respect user preferences:

```typescript
const shouldAnimate = !process.env.NO_ANIMATION

const spin = spinner('Loading...', {
  animation: shouldAnimate ? 'dots' : 'none'
})
```

## ADHD/OCD Considerations

### Reduce Decision Fatigue

Provide sensible defaults:

```typescript
// Default values reduce cognitive load
const priority = await input({
  message: 'Task priority:',
  default: 'medium' // Most common choice
})
```

### Chunking Information

Break large outputs into digestible chunks:

```typescript
// Show 10 items at a time with pagination
const items = await paginate(allItems, {
  pageSize: 10,
  prompt: 'Show more? (y/N)'
})
```

### Predictable Patterns

Consistent command structure reduces cognitive load:

```bash
# All CRUD operations follow same pattern
alpha tasks list
alpha tasks add "Task"
alpha tasks edit task-123
alpha tasks delete task-123
```

### Undo Support

Reduces anxiety about mistakes (see [Command History](../adr/007-command-history-and-undo-system.md)):

```bash
alpha tasks delete task-123
# Made a mistake!
alpha undo
```

## Flag Conventions

### Common Flags

All CLIs support these flags:

- `--help, -h` - Show help
- `--version, -v` - Show version
- `--verbose` - Enable debug logging
- `--quiet, -q` - Suppress output
- `--json` - Output as JSON
- `--force, -f` - Skip confirmation prompts
- `--dry-run` - Preview without executing

### Flag Naming

```typescript
// ✓ Good - clear and descriptive
--output-format
--config-file
--max-retries

// ✗ Avoid - ambiguous
--format  // Output or input format?
--file    // Which file?
--max     // Maximum what?
```

## Command Naming

### Verb-Noun Pattern

```bash
# ✓ Good - clear action
alpha tasks add
alpha config get
alpha history clear

# ✗ Avoid - noun-verb or unclear
alpha add task
alpha get
alpha clear
```

### Aliases

Common operations have short aliases:

```bash
# Full command
alpha tasks list

# Short alias
alpha t ls
```

## Related Documentation

- [ADR-005: ADHD/OCD-Friendly UX Patterns](../adr/005-adhd-ocd-friendly-ux-patterns.md)
- [shared-ui package](../../packages/shared-ui/README.md)
- [shared-prompts package](../../packages/shared-prompts/README.md)
- [shared-formatter package](../../packages/shared-formatter/README.md)

<!-- TODO: Expand with user testing results and feedback -->
<!-- TODO: Add examples of advanced interactive flows (wizards, multi-step forms) -->
<!-- TODO: Document i18n/l10n patterns for internationalization -->
