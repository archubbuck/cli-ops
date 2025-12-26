# Testing Strategy

## Overview

This document outlines the testing approach for the cli-ops monorepo, including testing patterns, conventions, and best practices.

## Testing Goals

1. **80%+ code coverage** for all packages
2. **Fast feedback** (<5s for unit tests)
3. **Confidence** in refactoring
4. **Documentation** via test examples
5. **Prevent regressions**

## Testing Stack

### Test Runner: Vitest

[Vitest](https://vitest.dev/) provides:
- Fast execution with ESM support
- Watch mode for development
- Coverage reporting
- Jest-compatible API

Configuration in [`vitest.config.ts`](../../vitest.config.ts):

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
```

### Testing Utilities

Shared testing helpers in [`packages/shared-testing`](../../packages/shared-testing/):

- **Fixture management**: Temporary directories and files
- **Mocking**: Console, environment, process.exit
- **Utilities**: Re-exports from Vitest and testing libraries

## Test Organization

### Directory Structure

```
packages/shared-logger/
├── src/
│   └── index.ts
└── test/
    ├── logger.test.ts
    ├── formatter.test.ts
    └── fixtures/
        └── sample-log.json
```

### Naming Conventions

- Test files: `*.test.ts`
- Fixture files: `fixtures/`
- Test utilities: `helpers/`

## Test Types

### 1. Unit Tests

Test individual functions and classes in isolation.

**Example: Testing a function**

```typescript
import { describe, it, expect } from 'vitest'
import { formatTask } from '../src/formatter'

describe('formatTask', () => {
  it('formats task with all fields', () => {
    const task = {
      id: 'task-123',
      title: 'Buy groceries',
      status: 'pending',
      createdAt: 1609459200000
    }

    const result = formatTask(task)

    expect(result).toBe('[pending] Buy groceries (task-123)')
  })

  it('handles missing optional fields', () => {
    const task = {
      id: 'task-123',
      title: 'Buy groceries'
    }

    const result = formatTask(task)

    expect(result).toBe('Buy groceries (task-123)')
  })
})
```

### 2. Integration Tests

Test multiple components working together.

**Example: Testing command with storage**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createFixtureManager } from '@cli-ops/shared-testing'
import { runCommand } from '@cli-ops/shared-testing'
import { storage } from '../src/storage'

describe('tasks:add command', () => {
  const fixtures = createFixtureManager()

  beforeEach(async () => {
    await fixtures.create({
      'config.json': '{}'
    })
  })

  afterEach(async () => {
    await fixtures.cleanup()
  })

  it('adds task to storage', async () => {
    const { stdout } = await runCommand(['tasks:add', 'New task'])

    expect(stdout).toContain('✓ Created task')
    
    const tasks = storage.getTasks()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('New task')
  })
})
```

### 3. E2E (End-to-End) Tests

Test CLI as user would use it.

**Example: Testing CLI binary**

```typescript
import { describe, it, expect } from 'vitest'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

describe('cli-alpha', () => {
  it('shows version', async () => {
    const { stdout } = await execAsync('./bin/run.js --version')
    expect(stdout).toMatch(/\d+\.\d+\.\d+/)
  })

  it('shows help', async () => {
    const { stdout } = await execAsync('./bin/run.js --help')
    expect(stdout).toContain('USAGE')
    expect(stdout).toContain('COMMANDS')
  })

  it('creates and lists tasks', async () => {
    // Add task
    await execAsync('./bin/run.js tasks add "Test task"')
    
    // List tasks
    const { stdout } = await execAsync('./bin/run.js tasks list')
    expect(stdout).toContain('Test task')
  })
})
```

## Testing Patterns

### Test Structure: AAA Pattern

Arrange, Act, Assert:

```typescript
it('deletes task', async () => {
  // Arrange - set up test data
  const task = await storage.addTask({ title: 'Test' })

  // Act - execute the behavior
  const result = await storage.deleteTask(task.id)

  // Assert - verify the outcome
  expect(result).toBe(true)
  expect(storage.getTasks()).toHaveLength(0)
})
```

### Using Fixtures

Create temporary files and directories:

```typescript
import { createFixtureManager } from '@cli-ops/shared-testing'

describe('config loading', () => {
  const fixtures = createFixtureManager()

  afterEach(async () => {
    await fixtures.cleanup()
  })

  it('loads config from file', async () => {
    // Create temporary config file
    const dir = await fixtures.create({
      'config.json': JSON.stringify({ theme: 'dark' })
    })

    const config = await loadConfig(dir)
    
    expect(config.theme).toBe('dark')
  })
})
```

### Mocking

#### Mock Console Output

```typescript
import { mockConsole } from '@cli-ops/shared-testing'

it('logs error message', () => {
  const restore = mockConsole()

  logger.error('Something failed')

  expect(console.error).toHaveBeenCalledWith(
    expect.stringContaining('Something failed')
  )

  restore()
})
```

#### Mock Environment Variables

```typescript
import { mockEnv } from '@cli-ops/shared-testing'

it('reads from environment', () => {
  const restore = mockEnv({ LOG_LEVEL: 'debug' })

  const logger = createLogger()

  expect(logger.level).toBe('debug')

  restore()
})
```

#### Mock process.exit

```typescript
import { mockExit } from '@cli-ops/shared-testing'

it('exits on error', () => {
  const mockExit = vi.spyOn(process, 'exit').mockImplementation()

  handleFatalError(new Error('Fatal'))

  expect(mockExit).toHaveBeenCalledWith(1)

  mockExit.mockRestore()
})
```

### Testing Async Code

```typescript
it('fetches tasks asynchronously', async () => {
  const promise = fetchTasks()

  // Use async/await
  const tasks = await promise

  expect(tasks).toHaveLength(10)
})

it('handles rejection', async () => {
  // Use rejects matcher
  await expect(fetchTasks()).rejects.toThrow('Network error')
})
```

### Testing Errors

```typescript
it('throws error for invalid input', () => {
  expect(() => {
    parseConfig('invalid json')
  }).toThrow('Invalid JSON')
})

it('provides helpful error message', () => {
  try {
    deleteTask('non-existent-id')
    fail('Should have thrown error')
  } catch (error) {
    expect(error.message).toContain('Task not found')
    expect(error.message).toContain('non-existent-id')
  }
})
```

## Coverage Requirements

### Package Coverage Targets

| Priority | Packages | Target Coverage |
|----------|----------|----------------|
| Critical | shared-commands, shared-config, shared-logger | 80%+ |
| High | shared-ui, shared-prompts, shared-formatter | 80%+ |
| Medium | shared-history, shared-ipc, shared-core | 70%+ |
| CLIs | cli-alpha, cli-beta, cli-gamma | 70%+ |

### What to Cover

**High Priority:**
- Public APIs
- Error handling
- Edge cases
- Business logic

**Lower Priority:**
- Trivial getters/setters
- Type definitions
- Console output formatting

### Checking Coverage

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/index.html
```

Coverage fails if below threshold:

```
ERROR: Coverage for lines (75%) does not meet threshold (80%)
```

## Running Tests

### Run All Tests

```bash
pnpm test
```

### Run Specific Package

```bash
pnpm --filter @cli-ops/shared-logger test
```

### Run Specific Test File

```bash
pnpm test packages/shared-logger/test/logger.test.ts
```

### Watch Mode

```bash
pnpm test:watch
```

Tests re-run on file changes.

### Debug Tests

#### VS Code Debugger

1. Set breakpoint in test file
2. Press F5 or click "Debug" in test file
3. Execution pauses at breakpoint

#### Node Inspector

```bash
node --inspect-brk ./node_modules/.bin/vitest run
```

Then attach debugger (Chrome DevTools or VS Code).

## Performance Testing

### Benchmarking

Use Vitest bench:

```typescript
import { bench, describe } from 'vitest'

describe('performance', () => {
  bench('array filter', () => {
    [1, 2, 3, 4, 5].filter(x => x > 2)
  })

  bench('array for loop', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = []
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] > 2) result.push(arr[i])
    }
  })
})
```

### CLI Performance

Measure command execution time:

```typescript
import { performance } from 'perf_hooks'

it('completes within performance budget', async () => {
  const start = performance.now()
  
  await runCommand(['tasks:list'])
  
  const duration = performance.now() - start
  expect(duration).toBeLessThan(500) // 500ms budget
})
```

## Testing Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ✓ Good - tests behavior
it('adds task to list', () => {
  addTask('New task')
  expect(getTasks()).toContain('New task')
})

// ✗ Avoid - tests implementation
it('pushes task to internal array', () => {
  addTask('New task')
  expect(internalArray.length).toBe(1)
})
```

### 2. One Assertion Per Test (Usually)

```typescript
// ✓ Good - focused test
it('task has correct title', () => {
  const task = createTask('Title')
  expect(task.title).toBe('Title')
})

it('task has creation timestamp', () => {
  const task = createTask('Title')
  expect(task.createdAt).toBeGreaterThan(0)
})

// ⚠️ Acceptable - related assertions
it('creates task with all fields', () => {
  const task = createTask('Title')
  expect(task.title).toBe('Title')
  expect(task.status).toBe('pending')
  expect(task.createdAt).toBeGreaterThan(0)
})
```

### 3. Use Descriptive Test Names

```typescript
// ✓ Good - clear intent
it('throws error when task ID does not exist')
it('formats task with pending status as yellow')
it('loads config from XDG_CONFIG_HOME when available')

// ✗ Avoid - vague
it('works')
it('handles error')
it('test config')
```

### 4. Keep Tests Fast

```typescript
// ✓ Good - fast, isolated
it('validates config', () => {
  const result = validateConfig({ theme: 'dark' })
  expect(result.valid).toBe(true)
})

// ✗ Avoid - slow, network dependent
it('validates config', async () => {
  await delay(1000)
  const result = await fetchConfigFromAPI()
  expect(result.valid).toBe(true)
})
```

### 5. Clean Up After Tests

```typescript
afterEach(async () => {
  // Clean up test files
  await fixtures.cleanup()
  
  // Reset mocks
  vi.restoreAllMocks()
  
  // Clear storage
  storage.clear()
})
```

## CI Integration

Tests run on every push and PR:

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: pnpm test

- name: Check coverage
  run: pnpm test:coverage
```

## Common Pitfalls

### ❌ Testing Implementation Details

```typescript
// Don't test private methods or internal state
expect(component._internalState).toBe(...)
```

### ❌ Flaky Tests

```typescript
// Avoid timing dependencies
await new Promise(resolve => setTimeout(resolve, 1000))

// Use waitFor instead
await waitFor(() => expect(result).toBeDefined())
```

### ❌ Shared State

```typescript
// Each test should be independent
let sharedState = [] // ❌ Avoid

beforeEach(() => {
  sharedState = [] // ✓ Reset in beforeEach
})
```

### ❌ Ignoring Errors

```typescript
// Don't silence errors
try {
  await dangerousOperation()
} catch {
  // ❌ Silent failure
}

// Verify error handling
await expect(dangerousOperation()).rejects.toThrow()
```

## Related Documentation

- [TESTING.md](../../TESTING.md) - Manual testing guide
- [shared-testing package](../../packages/shared-testing/README.md)
- [Vitest Documentation](https://vitest.dev/)

<!-- TODO: Expand with snapshot testing examples -->
<!-- TODO: Add visual regression testing for CLI output -->
<!-- TODO: Document contract testing for cross-CLI integration -->
