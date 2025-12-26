# ADR-007: Command History and Undo System

**Status:** Accepted  
**Date:** 2025-12-26  
**Deciders:** Team  

## Context

Users frequently make mistakes when running CLI commands:

- Running commands with wrong arguments
- Executing destructive operations unintentionally
- Forgetting which commands were recently run
- Needing to reverse changes made by commands

This is especially problematic for:
- **ADHD users**: May run commands impulsively, then realize the mistake
- **OCD users**: Need reassurance that mistakes can be undone
- **All users**: Learning a new CLI involves trial and error

Traditional CLIs provide no built-in undo mechanism:
- Shell history (↑) only shows commands, not results
- No way to reverse command effects
- Users must manually reverse changes (error-prone)

Requirements:
- Track all commands with their outcomes
- Enable undo for reversible operations
- Show command history for reference
- Persist history across sessions
- Audit trail for troubleshooting

## Decision

We will implement a **command history and undo system** in the `shared-history` package.

### Architecture

**Storage:** SQLite database for reliability and queryability
- Location: `~/.local/share/cli-{name}/history.db`
- Schema: commands table with metadata

**Tracking:** Automatic recording via base command lifecycle
- Command name and arguments
- Timestamp and duration
- Exit code and status
- Undo metadata (if reversible)

**Undo System:** Commands implement `getUndoMetadata()` and `undo()`
- Not all commands are undoable (read-only commands, external API calls)
- Undo metadata stores what's needed to reverse the operation
- Undo operations are themselves recorded in history

**Commands:**
- `history` - List recent commands with status
- `undo` - Reverse last reversible command
- `redo` - Re-apply undone command

### Example Flow

```bash
# User adds a task
$ cli-alpha tasks add "Buy groceries"
✓ Task added: #42 "Buy groceries"

# User realizes mistake (wrong CLI or task)
$ cli-alpha tasks list
  42: Buy groceries

# User can undo
$ cli-alpha undo
✓ Undid: tasks add "Buy groceries"
  Removed task #42

# User can see history
$ cli-alpha history
  3m ago  tasks add "Buy groceries"    [UNDONE]
  5m ago  tasks list                  [SUCCESS]
  1h ago  tasks add "Finish report"   [SUCCESS]
```

## Consequences

### Positive

- **Mistake recovery**: Users can easily undo accidental commands
- **Learning aid**: Safe experimentation without fear of permanent damage
- **Audit trail**: Troubleshoot issues by reviewing command history
- **ADHD-friendly**: Reduces anxiety about impulsive command execution
- **OCD-friendly**: Provides certainty that mistakes are reversible
- **Debugging**: History shows what led to current state
- **Compliance**: Some environments require command auditing

### Negative

- **Complexity**: Undo logic must be implemented per-command
- **Storage overhead**: History database grows over time (mitigation: retention policy)
- **Edge cases**: Some operations can't be undone (external API calls, file deletions)
- **Consistency**: Undo might fail if external state changed
- **Performance**: Minor overhead to record each command (~5-10ms)

### Neutral

- **Disk usage**: History database typically <1MB, even with 1000s of commands
- **Privacy**: History contains command arguments (may include sensitive data)
  - Mitigation: Users can disable history or clear it

## Implementation

History system is implemented in:

### Core Package
- [packages/shared-history/src/history-manager.ts](../../packages/shared-history/src/history-manager.ts) - Core history tracking
- [packages/shared-history/src/undo-manager.ts](../../packages/shared-history/src/undo-manager.ts) - Undo/redo logic
- [packages/shared-history/src/storage/sqlite.ts](../../packages/shared-history/src/storage/sqlite.ts) - SQLite persistence

### Database Schema
```sql
CREATE TABLE commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  command TEXT NOT NULL,
  args TEXT NOT NULL,      -- JSON array of arguments
  timestamp INTEGER NOT NULL,
  duration INTEGER,        -- milliseconds
  exit_code INTEGER,
  status TEXT,             -- 'success', 'error', 'undone'
  undo_metadata TEXT,      -- JSON for undo operation
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timestamp ON commands(timestamp);
CREATE INDEX idx_status ON commands(status);
```

### Base Command Integration
```typescript
export abstract class BaseCommand {
  async run() {
    const startTime = Date.now()
    
    try {
      await this.execute()
      
      // Record successful command
      await historyManager.record({
        command: this.id,
        args: this.argv,
        duration: Date.now() - startTime,
        exitCode: 0,
        status: 'success',
        undoMetadata: await this.getUndoMetadata?.()
      })
    } catch (error) {
      // Record failed command
      await historyManager.record({
        command: this.id,
        args: this.argv,
        duration: Date.now() - startTime,
        exitCode: error.exitCode || 1,
        status: 'error'
      })
      throw error
    }
  }
  
  // Optional: Implement to make command undoable
  async getUndoMetadata?(): Promise<UndoMetadata>
  async undo?(metadata: UndoMetadata): Promise<void>
}
```

### Command Implementation
```typescript
export default class TasksAdd extends BaseCommand {
  async execute() {
    const task = await tasksService.add(this.args.description)
    this.log(`✓ Task added: #${task.id} "${task.description}"`)
    
    // Store task ID for undo
    this._undoTaskId = task.id
  }
  
  async getUndoMetadata() {
    return {
      type: 'tasks:add',
      taskId: this._undoTaskId
    }
  }
  
  async undo(metadata) {
    await tasksService.delete(metadata.taskId)
    this.log(`✓ Removed task #${metadata.taskId}`)
  }
}
```

### History Commands
```typescript
// cli-alpha history
export default class History extends BaseCommand {
  async execute() {
    const commands = await historyManager.list({ limit: 20 })
    
    for (const cmd of commands) {
      const icon = cmd.status === 'success' ? '✓' : '✗'
      const time = formatRelative(cmd.timestamp)
      this.log(`${icon} ${time}  ${cmd.command} ${cmd.args.join(' ')}`)
    }
  }
}

// cli-alpha undo
export default class Undo extends BaseCommand {
  async execute() {
    const lastCommand = await historyManager.getLastReversible()
    
    if (!lastCommand) {
      this.error('No commands to undo')
    }
    
    await undoManager.undo(lastCommand)
    await historyManager.markAsUndone(lastCommand.id)
    
    this.log(`✓ Undid: ${lastCommand.command}`)
  }
}
```

## Limitations and Constraints

### Non-Undoable Operations
Some commands cannot be undone:
- **External API calls**: Can't reverse actions on external services
- **File deletions**: Files might be permanently deleted (mitigation: trash bin)
- **Irreversible operations**: e.g., sending emails, publishing packages

These commands should:
1. Show warning before execution: "This operation cannot be undone"
2. Require confirmation (unless `--yes` flag)
3. Not provide undo metadata

### Retention Policy
History database shouldn't grow unbounded:
- Default: Keep last 1000 commands or 90 days (whichever is more)
- Configurable: `cli-alpha config set historyRetention 30`
- Manual cleanup: `cli-alpha history clear --older-than 30d`

### Privacy Considerations
Command history may contain sensitive data:
- Passwords in command arguments
- API keys passed as flags
- Private file paths

Mitigations:
- Users can disable history: `cli-alpha config set historyEnabled false`
- Clear history: `cli-alpha history clear`
- History location documented in `cli-alpha history path`

## References

- [shared-history Package](../../packages/shared-history/)
- [ADHD/OCD UX Patterns](005-adhd-ocd-friendly-ux-patterns.md)
- Related ADRs:
  - [ADR-003 (Configuration)](003-unified-configuration-management.md) - History settings
  - [ADR-005 (ADHD/OCD UX)](005-adhd-ocd-friendly-ux-patterns.md) - Safety features

### External Resources
- [Git's approach to undo](https://git-scm.com/docs/git-revert)
- [Emacs undo tree](https://www.emacswiki.org/emacs/UndoTree)

<!-- TODO: Expand with retention policy implementation details -->
<!-- TODO: Add metrics on undo usage in production -->
<!-- TODO: Document best practices for implementing undoable commands -->
