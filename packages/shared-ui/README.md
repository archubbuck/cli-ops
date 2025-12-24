# Shared UI

CLI UI components with spinners, progress bars, task lists, and colorblind-friendly themes.

## Features

- 🌀 **Spinners** - Loading indicators with ora
- 📊 **Progress Bars** - Visual progress tracking
- ✅ **Task Lists** - Multi-step operation visualization
- 🎨 **Themes** - Colorblind-friendly colors and symbols
- 🤖 **CI Detection** - Auto-disables animations in CI
- ♿ **Accessible** - Designed for ADHD/OCD users

## Installation

```bash
pnpm add @/shared-ui
```

## Usage

### Spinners

```typescript
import { createSpinner, withSpinner } from '@/shared-ui'

// Basic spinner
const spinner = createSpinner({ text: 'Loading...' })
spinner.start()
// ... do work ...
spinner.succeed('Done!')

// Wrapper helper
const data = await withSpinner(
  'Fetching data',
  async spinner => {
    const result = await fetchData()
    spinner.text = 'Processing...'
    return processData(result)
  }
)

// Custom messages
await spinnerTask(
  {
    start: 'Deploying application...',
    succeed: 'Deployed successfully!',
    fail: 'Deployment failed',
  },
  async spinner => {
    await deploy()
  }
)
```

### Progress Bars

```typescript
import { createProgressBar, withProgressBar, processWithProgress } from '@/shared-ui'

// Basic progress bar
const bar = createProgressBar({ total: 100 })
for (let i = 0; i <= 100; i++) {
  bar.update(i)
  await wait(10)
}
bar.stop()

// Process array with progress
const results = await processWithProgress(
  files,
  async (file, index) => {
    return await processFile(file)
  }
)

// Custom format
const bar = createProgressBar({
  total: files.length,
  format: 'Processing {bar} {percentage}% | {value}/{total} files',
})
```

### Task Lists

```typescript
import { createTaskList, createSequentialTasks } from '@/shared-ui'

// Sequential tasks
const tasks = createSequentialTasks([
  {
    title: 'Install dependencies',
    task: async () => {
      await installDeps()
    },
  },
  {
    title: 'Build project',
    task: async () => {
      await build()
    },
  },
  {
    title: 'Run tests',
    task: async (ctx, task) => {
      const result = await runTests()
      task.title = `Tests ${result.passed}/${result.total}`
    },
  },
])

await tasks.run()

// Conditional tasks
const tasks = createTaskList([
  {
    title: 'Check auth',
    task: async ctx => {
      ctx.isAuthed = await checkAuth()
    },
  },
  {
    title: 'Login',
    enabled: ctx => !ctx.isAuthed,
    task: async () => {
      await login()
    },
  },
  {
    title: 'Deploy',
    skip: ctx => !ctx.isAuthed ? 'Not authenticated' : false,
    task: async () => {
      await deploy()
    },
  },
])

// Concurrent tasks
const tasks = createConcurrentTasks([
  {
    title: 'Lint code',
    task: async () => await lint(),
  },
  {
    title: 'Type check',
    task: async () => await typecheck(),
  },
  {
    title: 'Run tests',
    task: async () => await test(),
  },
])

// Nested subtasks
const tasks = createTaskList([
  {
    title: 'Setup',
    subtasks: [
      { title: 'Create directory', task: async () => await mkdir() },
      { title: 'Copy files', task: async () => await copy() },
    ],
  },
])
```

### Themes & Formatting

```typescript
import { success, error, warning, info, code, link, list, colors } from '@/shared-ui'

// Formatted messages
console.log(success('Build completed'))
console.log(error('Failed to connect'))
console.log(warning('Deprecated feature'))
console.log(info('Server started on port 3000'))

// Code/commands
console.log(`Run ${code('npm install')} to install dependencies`)

// Links
console.log(link('Documentation', 'https://docs.example.com'))

// Lists
console.log(list([
  'First item',
  'Second item',
  'Third item',
]))

// Custom colors (colorblind-friendly)
console.log(colors.success('✓ Success'))
console.log(colors.error('✗ Error'))
console.log(colors.warning('⚠ Warning'))
console.log(colors.info('ℹ Info'))
```

## Colorblind-Friendly Design

The theme is designed for users with color vision deficiencies:

- **Blue** for success (not green)
- **Orange-red** for errors (not pure red)
- **Yellow-orange** for warnings
- **Cyan** for info
- **Symbols** in addition to colors (✓ ✗ ⚠ ℹ)

This ensures **all users** can distinguish states, not just those with typical color vision.

## CI/Non-TTY Detection

All UI components automatically detect CI environments and non-TTY terminals:

### In TTY (Normal Terminal)
- Animated spinners
- Progress bars with visual updates
- Colored output
- Interactive task lists

### In CI/Non-TTY
- Text-only output
- Percentage logs every 10%
- No colors (for CI logs)
- Simple task status

**Override detection:**
```typescript
const spinner = createSpinner({
  text: 'Loading',
  enabled: true, // Force enable even in CI
})
```

## Examples

### Complete Deployment Flow

```typescript
import { createTaskList, createSpinner } from '@/shared-ui'

async function deploy() {
  const tasks = createTaskList([
    {
      title: 'Build application',
      task: async (ctx, task) => {
        const spinner = createSpinner({ text: 'Compiling...' })
        spinner.start()
        
        try {
          await build()
          spinner.succeed('Compiled')
        } catch (error) {
          spinner.fail('Build failed')
          throw error
        }
      },
    },
    {
      title: 'Upload assets',
      task: async (ctx, task) => {
        const files = await getFiles()
        
        for (const file of files) {
          task.output = `Uploading ${file.name}`
          await upload(file)
        }
      },
    },
    {
      title: 'Update DNS',
      task: async () => {
        await updateDNS()
      },
    },
  ])

  await tasks.run()
}
```

### File Processing with Progress

```typescript
import { processWithProgress, success } from '@/shared-ui'

const files = await getFiles()

const results = await processWithProgress(
  files,
  async (file, index) => {
    return await transformFile(file)
  },
  {
    format: 'Processing {bar} {percentage}% | {value}/{total} files',
  }
)

console.log(success(`Processed ${results.length} files`))
```

### Conditional Task Execution

```typescript
import { createTaskList } from '@/shared-ui'

interface Context {
  needsAuth: boolean
  authToken?: string
}

const tasks = createTaskList<Context>([
  {
    title: 'Check authentication',
    task: async ctx => {
      ctx.needsAuth = !(await hasValidToken())
    },
  },
  {
    title: 'Authenticate',
    enabled: ctx => ctx.needsAuth,
    task: async ctx => {
      ctx.authToken = await login()
    },
  },
  {
    title: 'Fetch data',
    skip: ctx => !ctx.authToken ? 'No auth token' : false,
    task: async ctx => {
      await fetchData(ctx.authToken)
    },
  },
], {
  context: { needsAuth: false },
})

await tasks.run()
```

## ADHD/OCD Benefits

- **Visual Feedback** - Instant confirmation of progress (<500ms threshold)
- **Predictable** - Consistent symbols and colors
- **Accessible** - Works for colorblind users
- **Clear States** - Obvious success/failure indicators
- **Progress Tracking** - Reduces anxiety about long operations
- **No Distractions** - Clean, minimal animations

## API Reference

### Spinner Methods
- `start(text?)` - Start spinning
- `stop()` - Stop and remove
- `succeed(text?)` - Mark success with ✓
- `fail(text?)` - Mark failure with ✗
- `warn(text?)` - Mark warning with ⚠
- `info(text?)` - Mark info with ℹ

### Progress Bar Methods
- `update(value, payload?)` - Set progress value
- `increment(delta?, payload?)` - Add to progress
- `stop()` - Remove progress bar
- `getValue()` - Get current value
- `getTotal()` - Get total value
- `isComplete()` - Check if at 100%

### Task List Options
- `concurrent` - Run tasks in parallel
- `exitOnError` - Stop on first error (default: true)
- `renderer` - Force specific renderer
- `context` - Initial context for all tasks

## Best Practices

1. **Use spinners for <30s operations** - Quick feedback
2. **Use progress bars for >30s operations** - Show detailed progress
3. **Use task lists for multi-step workflows** - Clear structure
4. **Provide meaningful titles** - Users know what's happening
5. **Update spinner text** - Show current step
6. **Handle errors gracefully** - Use fail() with helpful messages
