# ADR-008: Cross-CLI Communication and IPC

**Status:** Accepted  
**Date:** 2025-12-26  
**Deciders:** Team  

## Context

This monorepo contains three independent CLIs (`cli-alpha`, `cli-beta`, `cli-gamma`) that sometimes need to:

- **Coordinate actions**: One CLI triggering another CLI
- **Share state**: Access to common data or configuration
- **Prevent conflicts**: Avoid simultaneous execution that could corrupt data
- **Discover each other**: Know which CLIs are installed and running
- **Event notification**: One CLI notifying others of state changes

Use cases:
- `cli-alpha` needs to know if `cli-beta` is currently running
- `cli-beta` wants to trigger a task in `cli-alpha`
- `cli-gamma` needs exclusive access to a shared resource
- All CLIs should respond to system-wide events (e.g., config changes)

Challenges:
- CLIs are separate processes (can't share memory directly)
- Users may have different versions installed
- Must work on Linux, macOS, Windows
- Should be fast (minimal latency)
- Need to handle crashed processes (stale locks)

Alternative approaches:
- **Shared files**: Simple but prone to race conditions
- **HTTP server**: Requires running daemon, port conflicts
- **Named pipes**: Platform-specific, complex API
- **Message queue**: Too heavy for CLI use case
- **No communication**: CLIs remain completely independent

## Decision

We will implement **Inter-Process Communication (IPC)** in the `shared-ipc` package.

### Architecture

**Discovery Mechanism:** File-based process registry
- Location: `~/.local/share/cli-ops/processes/`
- Each running CLI writes PID file with metadata
- Stale PID files cleaned up automatically

**Locking:** File-based advisory locks
- Prevents concurrent execution when needed
- Uses `lockfile` package for cross-platform support
- Automatic timeout and stale lock detection

**Event Bus:** File-based event notification
- Publishers write events to `~/.local/share/cli-ops/events/`
- Subscribers poll for new events (or use filesystem watchers)
- Events are JSON files with timestamp and payload
- Automatic cleanup of old events

**Message Passing:** Simple file-based queues
- Each CLI has an inbox: `~/.local/share/cli-ops/messages/{cli-name}/`
- Messages are JSON files with unique IDs
- Polling-based delivery (lightweight, no daemon needed)

### Design Principles

1. **No daemon required**: Avoid long-running background processes
2. **Graceful degradation**: CLIs work fine if IPC unavailable
3. **Simple implementation**: File-based over complex IPC primitives
4. **Cross-platform**: Works on Linux, macOS, Windows
5. **Testable**: Easy to mock in tests

## Consequences

### Positive

- **Coordination**: CLIs can discover and communicate with each other
- **Safety**: Locks prevent data corruption from concurrent access
- **Event-driven**: CLIs can react to system-wide changes
- **No daemon**: Simpler deployment, no port conflicts
- **Cross-platform**: File operations work everywhere
- **Debuggable**: Can inspect IPC state by looking at files

### Negative

- **Polling overhead**: Checking for messages requires periodic file reads
- **Not real-time**: Latency is higher than native IPC (~100-500ms)
- **Disk I/O**: More file operations (minimal impact on modern SSDs)
- **Cleanup required**: Stale files must be periodically removed

### Neutral

- **Scalability**: Fine for 3 CLIs, wouldn't scale to 100s
- **Reliability**: Less reliable than dedicated message queue (acceptable for CLIs)

## Implementation

IPC system is implemented in:

### Core Package
- [packages/shared-ipc/src/discovery.ts](../../packages/shared-ipc/src/discovery.ts) - Process discovery
- [packages/shared-ipc/src/locks.ts](../../packages/shared-ipc/src/locks.ts) - File-based locking
- [packages/shared-ipc/src/events.ts](../../packages/shared-ipc/src/events.ts) - Event bus
- [packages/shared-ipc/src/messages.ts](../../packages/shared-ipc/src/messages.ts) - Message passing

### Process Discovery
```typescript
import { ProcessRegistry } from '@cli-ops/shared-ipc'

// Register current process
const registry = new ProcessRegistry('cli-alpha')
await registry.register({
  pid: process.pid,
  version: '1.0.0',
  startTime: Date.now()
})

// Discover other CLIs
const processes = await registry.discover()
console.log('Running CLIs:', processes)
// => [{ name: 'cli-beta', pid: 12345, version: '2.1.0' }]

// Check if specific CLI is running
const isBetaRunning = await registry.isRunning('cli-beta')

// Cleanup on exit
process.on('exit', () => registry.unregister())
```

### Locking
```typescript
import { LockManager } from '@cli-ops/shared-ipc'

const lock = new LockManager('shared-resource')

try {
  // Acquire lock with timeout
  await lock.acquire({ timeout: 5000 })
  
  // Do work with exclusive access
  await modifySharedResource()
  
} finally {
  // Always release lock
  await lock.release()
}

// Or use convenience method
await lock.withLock(async () => {
  await modifySharedResource()
})
```

### Event Bus
```typescript
import { EventBus } from '@cli-ops/shared-ipc'

const bus = new EventBus()

// Publish event
await bus.publish('config:changed', {
  key: 'theme',
  value: 'dark'
})

// Subscribe to events
bus.subscribe('config:changed', (event) => {
  console.log('Config changed:', event.data)
})

// Start listening (polls for new events)
await bus.listen({ pollInterval: 1000 })

// Cleanup
await bus.close()
```

### Message Passing
```typescript
import { MessageQueue } from '@cli-ops/shared-ipc'

// Send message to cli-beta
const queue = new MessageQueue('cli-beta')
await queue.send({
  from: 'cli-alpha',
  type: 'trigger:task',
  payload: { taskId: 42 }
})

// Receive messages in cli-beta
const inbox = new MessageQueue('cli-beta')
inbox.onMessage(async (message) => {
  if (message.type === 'trigger:task') {
    await runTask(message.payload.taskId)
  }
})

await inbox.listen()
```

## Use Cases

### Use Case 1: Prevent Concurrent Execution
```typescript
// cli-alpha and cli-beta both access shared database
import { LockManager } from '@cli-ops/shared-ipc'

export default class DatabaseCommand extends BaseCommand {
  async run() {
    const lock = new LockManager('database')
    
    try {
      await lock.acquire({ timeout: 5000 })
      await this.modifyDatabase()
    } catch (error) {
      if (error.code === 'LOCK_TIMEOUT') {
        this.error('Another CLI is accessing the database. Try again.')
      }
      throw error
    } finally {
      await lock.release()
    }
  }
}
```

### Use Case 2: Trigger Action in Another CLI
```typescript
// cli-alpha triggers task in cli-beta
import { MessageQueue } from '@cli-ops/shared-ipc'

export default class TriggerTask extends BaseCommand {
  async run() {
    const queue = new MessageQueue('cli-beta')
    
    await queue.send({
      type: 'run:task',
      payload: { taskName: 'backup', args: ['--full'] }
    })
    
    this.log('✓ Triggered backup task in cli-beta')
  }
}
```

### Use Case 3: React to System Events
```typescript
// All CLIs reload config when changed
import { EventBus } from '@cli-ops/shared-ipc'

export default class DaemonCommand extends BaseCommand {
  async run() {
    const bus = new EventBus()
    
    bus.subscribe('config:changed', async (event) => {
      this.log('Config changed, reloading...')
      await this.config.reload()
    })
    
    await bus.listen()
  }
}
```

## Limitations and Constraints

### Not Real-Time
File-based IPC has latency (100-500ms typical). Not suitable for:
- High-frequency events (>10/second)
- Time-critical coordination (<100ms latency required)

For these cases, consider direct IPC primitives (named pipes, domain sockets).

### Cleanup Required
Stale files accumulate over time. Mitigations:
- Background cleanup on CLI startup
- TTL on events and messages (auto-delete after 5 minutes)
- Users can manually clean: `rm -rf ~/.local/share/cli-ops/{events,messages}`

### Security
Files are readable by user only (Unix permissions: 0600):
```typescript
await fs.writeFile(path, data, { mode: 0o600 })
```

But not suitable for sensitive data transmission (no encryption).

### Windows Compatibility
File locking behavior differs on Windows:
- Use `lockfile` package for cross-platform locking
- Test on Windows in CI to catch issues

## References

- [shared-ipc Package](../../packages/shared-ipc/)
- [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html)
- Related ADRs:
  - [ADR-007 (Command History)](007-command-history-and-undo-system.md) - Similar file-based storage

### External Resources
- [Node.js IPC Documentation](https://nodejs.org/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback)
- [File-based IPC patterns](https://en.wikipedia.org/wiki/Inter-process_communication)

<!-- TODO: Expand with performance benchmarks -->
<!-- TODO: Add examples of complex coordination patterns -->
<!-- TODO: Document testing strategies for IPC -->
