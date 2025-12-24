# Shared History

Command history tracking with SQLite, search, replay, and analytics.

## Features

- 📝 **Persistent History** - SQLite database for command tracking
- 🔍 **Powerful Search** - Filter by command, status, date, directory
- 📊 **Analytics** - Command frequency, success rates, duration stats
- 🔄 **Replay** - Re-run commands from history
- 🗂️ **Grouping** - Group by command, date, or custom criteria
- 🎯 **Fuzzy Search** - Find similar commands

## Installation

```bash
pnpm add @/shared-history
```

## Usage

### Basic History Tracking

```typescript
import { createHistoryManager } from '@/shared-history'

const history = createHistoryManager({
  cliName: 'mycli', // Stores in ~/.config/mycli/history.db
  maxEntries: 10000, // Keep last 10k commands
})

// Track command execution
const startTime = Date.now()
try {
  await runCommand()
  
  history.add({
    command: 'deploy',
    args: ['production'],
    flags: { force: true },
    timestamp: startTime,
    duration: Date.now() - startTime,
    exitCode: 0,
    cwd: process.cwd(),
    user: process.env.USER || 'unknown',
    success: true,
  })
} catch (error) {
  history.add({
    command: 'deploy',
    args: ['production'],
    flags: { force: true },
    timestamp: startTime,
    duration: Date.now() - startTime,
    exitCode: 1,
    cwd: process.cwd(),
    user: process.env.USER || 'unknown',
    success: false,
  })
}
```

### Search History

```typescript
// Get recent commands
const recent = history.recent(10)

// Get last command
const last = history.last()

// Search by command
const deployCommands = history.search({
  command: 'deploy',
  limit: 50,
})

// Search successful commands only
const successful = history.search({
  success: true,
  limit: 100,
})

// Search by date range
const today = Date.now()
const yesterday = today - 24 * 60 * 60 * 1000
const todaysCommands = history.search({
  after: yesterday,
  before: today,
})

// Search by directory
const projectCommands = history.search({
  cwd: '/path/to/project',
})
```

### Analytics

```typescript
// Get overall statistics
const stats = history.stats()
console.log(`Total: ${stats.total}`)
console.log(`Successful: ${stats.successful}`)
console.log(`Failed: ${stats.failed}`)
console.log(`Avg Duration: ${stats.avgDuration}ms`)

// Most used commands
stats.mostUsedCommands.forEach(cmd => {
  console.log(`${cmd.command}: ${cmd.count} times`)
})

// Custom analytics
import { getCommandFrequency, getSuccessRate } from '@/shared-history'

const entries = history.search({ limit: 1000 })

const frequency = getCommandFrequency(entries)
frequency.forEach((count, command) => {
  console.log(`${command}: ${count}`)
})

const successRate = getSuccessRate(entries)
successRate.forEach((rate, command) => {
  console.log(`${command}: ${rate.toFixed(1)}% success`)
})
```

### Display History

```typescript
import { formatHistoryEntry, groupByDate } from '@/shared-history'

// Format single entry
const entry = history.last()
console.log(formatHistoryEntry(entry))
// [123] ✓ deploy production --force (1234ms) - 12/24/2024, 10:30:00 AM

// Verbose format
console.log(formatHistoryEntry(entry, { verbose: true }))
// ID: 123
// Command: deploy production --force
// Status: ✓ (exit 0)
// Duration: 1234ms
// Time: 12/24/2024, 10:30:00 AM
// CWD: /path/to/project
// User: john

// Group by date
const entries = history.recent(100)
const byDate = groupByDate(entries)

byDate.forEach((entries, date) => {
  console.log(`\n${date}`)
  entries.forEach(entry => {
    console.log(`  ${formatHistoryEntry(entry)}`)
  })
})
```

### Replay Commands

```typescript
import { buildCommandString } from '@/shared-history'

// Get command string for replay
const entry = history.search({ command: 'deploy' })[0]
const commandStr = buildCommandString(entry)
console.log(`Run: ${commandStr}`)
// deploy production --force

// Execute in shell
import { exec } from 'node:child_process'
exec(commandStr, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`)
  }
})
```

### Fuzzy Search

```typescript
import { findSimilar } from '@/shared-history'

const entries = history.search({ limit: 1000 })

// Find commands similar to 'deploy'
const similar = findSimilar('deploy', entries, 0.6)
similar.forEach(entry => {
  console.log(entry.command) // deploy, deployer, redeploy, etc.
})
```

## Advanced Examples

### Auto-tracking Wrapper

```typescript
import { createHistoryManager } from '@/shared-history'

class TrackedCommand {
  private history = createHistoryManager({ cliName: 'mycli' })

  async run(command: string, args: string[], flags: Record<string, unknown>) {
    const startTime = Date.now()
    let exitCode = 0
    let success = true

    try {
      await this.execute(command, args, flags)
    } catch (error) {
      exitCode = error.exitCode || 1
      success = false
      throw error
    } finally {
      this.history.add({
        command,
        args,
        flags,
        timestamp: startTime,
        duration: Date.now() - startTime,
        exitCode,
        cwd: process.cwd(),
        user: process.env.USER || 'unknown',
        success,
      })
    }
  }

  private async execute(command: string, args: string[], flags: Record<string, unknown>) {
    // Your command implementation
  }
}
```

### History Command (for CLIs)

```typescript
import { Command } from '@oclif/core'
import { formatHistoryEntry, groupByDate } from '@/shared-history'

export class HistoryCommand extends Command {
  static description = 'Show command history'

  static flags = {
    limit: { type: 'number', default: 20 },
    command: { type: 'string' },
    success: { type: 'boolean' },
    verbose: { type: 'boolean', char: 'v' },
  }

  async run() {
    const { flags } = await this.parse(HistoryCommand)
    
    const entries = history.search({
      command: flags.command,
      success: flags.success,
      limit: flags.limit,
    })

    if (entries.length === 0) {
      this.log('No history found')
      return
    }

    if (flags.verbose) {
      entries.forEach(entry => {
        this.log(formatHistoryEntry(entry, { verbose: true }))
        this.log('') // Blank line
      })
    } else {
      const byDate = groupByDate(entries)
      byDate.forEach((dateEntries, date) => {
        this.log(`\n${date}`)
        dateEntries.forEach(entry => {
          this.log(`  ${formatHistoryEntry(entry)}`)
        })
      })
    }
  }
}
```

### Stats Command

```typescript
import { Command } from '@oclif/core'
import { formatTable } from '@/shared-formatter'

export class StatsCommand extends Command {
  static description = 'Show usage statistics'

  async run() {
    const stats = history.stats()

    this.log('\nOverall Statistics')
    this.log(`  Total Commands: ${stats.total}`)
    this.log(`  Successful: ${stats.successful} (${((stats.successful / stats.total) * 100).toFixed(1)}%)`)
    this.log(`  Failed: ${stats.failed} (${((stats.failed / stats.total) * 100).toFixed(1)}%)`)
    this.log(`  Average Duration: ${stats.avgDuration}ms`)

    this.log('\nMost Used Commands')
    const tableData = stats.mostUsedCommands.map(cmd => ({
      command: cmd.command,
      count: cmd.count,
      percentage: `${((cmd.count / stats.total) * 100).toFixed(1)}%`,
    }))

    this.log(formatTable(tableData))
  }
}
```

## Best Practices

1. **Track all commands** - Even if they fail
2. **Include context** - CWD, user, timestamps
3. **Set limits** - Don't let history grow indefinitely
4. **Regular cleanup** - Use maxEntries to auto-cleanup
5. **Respect privacy** - Don't track sensitive data in flags
6. **Close properly** - Call `history.close()` on exit

## ADHD/OCD Benefits

- **Never forget** - All commands are tracked
- **Learn patterns** - See what works/fails
- **Replay exactly** - No guessing previous commands
- **Analyze behavior** - Understand your workflow
- **Predictable** - Consistent tracking and retrieval

## API Reference

### HistoryManager
- `add(entry)` - Add command to history
- `search(options)` - Search history with filters
- `recent(limit)` - Get most recent entries
- `last()` - Get last command
- `stats()` - Get overall statistics
- `clear()` - Delete all history
- `close()` - Close database connection

### Search Options
- `command` - Filter by command name
- `exitCode` - Filter by exit code
- `success` - Filter by success/failure
- `cwd` - Filter by working directory
- `after` / `before` - Date range filter
- `limit` - Maximum results
- `order` - Sort order (asc/desc)

### Utilities
- `buildCommandString(entry)` - Build executable command
- `formatHistoryEntry(entry, options)` - Format for display
- `groupByCommand(entries)` - Group by command
- `groupByDate(entries)` - Group by date
- `findSimilar(target, entries)` - Fuzzy search
- `getCommandFrequency(entries)` - Command usage counts
- `getSuccessRate(entries)` - Success rates per command

## Storage

History is stored in SQLite database:
- **Location**: `~/.config/<cliName>/history.db`
- **Schema**: Indexed for fast queries
- **Size**: Auto-cleanup based on maxEntries
- **Portable**: Standard SQLite format
