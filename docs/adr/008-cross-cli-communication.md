---
sidebar_position: 8
sidebar_label: 'ADR-008: Cross-CLI Communication'
title: 'ADR-008: Cross-CLI Communication and IPC'
description: 'Decision to implement IPC mechanisms for plugin coordination, state sharing, and event notification'
---

# ADR-008: Cross-CLI Communication and IPC

**Status:** Accepted (Updated for plugin architecture)  
**Date:** 2025-12-26 (Updated: 2025-01)  
**Deciders:** Team

## Context

The CLI Ops workspace uses a unified plugin-first architecture where `clio` manages multiple plugins. Plugins sometimes need to:

- **Coordinate actions**: One plugin triggering functionality in another
- **Share state**: Access to common data or configuration
- **Prevent conflicts**: Avoid simultaneous execution that could corrupt data
- **Discover each other**: Know which plugins are installed and active
- **Event notification**: Plugins notifying each other of state changes

Use cases:

- `clio-plugin-tasks` needs to know if background processes are running
- `clio-plugin-fetch` wants to trigger caching in another plugin
- `clio-plugin-repo` needs exclusive access to Git operations
- All plugins should respond to system-wide events (e.g., config changes)

Challenges:

- Plugins run in the same clio process but may spawn child processes
- Users may have different plugin versions installed
- Must work on Linux, macOS, Windows
- Should be fast (minimal latency)
- Need to handle crashed processes (stale locks)

Alternative approaches:

- **Shared files**: Simple but prone to race conditions
- **HTTP server**: Requires running daemon, port conflicts
- **Named pipes**: Platform-specific, complex API
- **Message queue**: Too heavy for CLI use case
- **No communication**: Plugins remain completely independent

## Decision

We implement **Inter-Process Communication (IPC)** in the `@cli-ops/shared-ipc` package for plugin coordination.

### Architecture

**Discovery Mechanism:** File-based process registry

- Location: `~/.local/share/clio/processes/`
- Each running plugin writes PID file with metadata
- Stale PID files cleaned up automatically

**Locking:** File-based advisory locks

- Prevents concurrent execution when needed
- Uses `lockfile` package for cross-platform support
- Automatic timeout and stale lock detection

**Event Bus:** File-based event notification

- Publishers write events to `~/.local/share/clio/events/`
- Subscribers poll for new events (or use filesystem watchers)
- Events are JSON files with timestamp and payload
- Automatic cleanup of old events

**Message Passing:** Simple file-based queues

- Plugin message queue: `~/.local/share/clio/messages/{plugin-name}/`
- Messages are JSON files with unique IDs
- Polling-based delivery (lightweight, no daemon needed)

### Design Principles

1. **No daemon required**: Avoid long-running background processes
2. **Graceful degradation**: Plugins work fine if IPC unavailable
3. **Simple implementation**: File-based over complex IPC primitives
4. **Cross-platform**: Works on Linux, macOS, Windows
5. **Testable**: Easy to mock in tests

## Consequences

### Positive

- **Coordination**: Plugins can discover and communicate with each other
- **Safety**: Locks prevent data corruption from concurrent access
- **Event-driven**: Plugins can react to system-wide changes
- **No daemon**: Simpler deployment, no port conflicts
- **Cross-platform**: File operations work everywhere
- **Debuggable**: Can inspect IPC state by looking at files

### Negative

- **Polling overhead**: Checking for messages requires periodic file reads
- **Not real-time**: Latency is higher than native IPC (~100-500ms)
- **Disk I/O**: More file operations (minimal impact on modern SSDs)
- **Cleanup required**: Stale files must be periodically removed

### Neutral

- **Scalability**: Fine for typical plugin ecosystem, wouldn't scale to 100s
- **Reliability**: Less reliable than dedicated message queue (acceptable for plugins)

## Implementation

IPC system is implemented in:

### Core Package

- [libs/shared-ipc/src/discovery.ts](../../libs/shared-ipc/src/discovery.ts) - Process discovery
- [libs/shared-ipc/src/locks.ts](../../libs/shared-ipc/src/locks.ts) - File-based locking
- [libs/shared-ipc/src/events.ts](../../libs/shared-ipc/src/events.ts) - Event bus
- [libs/shared-ipc/src/messages.ts](../../libs/shared-ipc/src/messages.ts) - Message passing

All imported from `@cli-ops/shared-ipc` scoped package.

### Process Discovery

```typescript
import { ProcessRegistry } from '@cli-ops/shared-ipc'

// Register current plugin process
const registry = new ProcessRegistry('clio-plugin-tasks')
await registry.register({
  pid: process.pid,
  version: '2.0.0',
  startTime: Date.now(),
})

// Discover other plugin processes
const processes = await registry.discover()
console.log('Running plugins:', processes)
// => [{ name: 'clio-plugin-fetch', pid: 12345, version: '2.0.0' }]

// Check if specific plugin process is running
const isFetchRunning = await registry.isRunning('clio-plugin-fetch')

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
  value: 'dark',
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

// Send message to fetch plugin
const queue = new MessageQueue('clio-plugin-fetch')
await queue.send({
  from: 'clio-plugin-tasks',
  type: 'cache:invalidate',
  payload: { resource: 'api-data' },
})

// Receive messages in fetch plugin
const inbox = new MessageQueue('clio-plugin-fetch')
inbox.onMessage(async (message) => {
  if (message.type === 'cache:invalidate') {
    await invalidateCache(message.payload.resource)
  }
})

await inbox.listen()
```

## Use Cases

### Use Case 1: Prevent Concurrent Execution

```typescript
// Multiple plugins accessing shared Git repository
import { LockManager } from '@cli-ops/shared-ipc'

export default class RepoCommand extends BaseCommand {
  async run() {
    const lock = new LockManager('git-operations')

    try {
      await lock.acquire({ timeout: 5000 })
      await this.modifyRepository()
    } catch (error) {
      if (error.code === 'LOCK_TIMEOUT') {
        this.error('Another plugin is performing Git operations. Try again.')
      }
      throw error
    } finally {
      await lock.release()
    }
  }
}
```

### Use Case 2: Trigger Action in Another Plugin

```typescript
// Tasks plugin triggers cache refresh in fetch plugin
import { MessageQueue } from '@cli-ops/shared-ipc'

export default class TasksSync extends BaseCommand {
  async run() {
    const queue = new MessageQueue('clio-plugin-fetch')

    await queue.send({
      type: 'cache:refresh',
      payload: { endpoint: '/api/tasks', force: true },
    })

    this.log('✓ Triggered cache refresh in fetch plugin')
  }
}
```

### Use Case 3: React to System Events

```typescript
// All plugins reload config when changed
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

- [shared-ipc Package](../../libs/shared-ipc/)
- [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html)
- Related ADRs:
  - [ADR-007 (Command History)](007-command-history-and-undo-system.md) - Similar file-based storage

### External Resources

- [Node.js IPC Documentation](https://nodejs.org/api/child_process.html#child_process_subprocess_send_message_sendhandle_options_callback)
- [File-based IPC patterns](https://en.wikipedia.org/wiki/Inter-process_communication)

<!-- TODO: Expand with performance benchmarks -->
<!-- TODO: Add examples of complex coordination patterns -->
<!-- TODO: Document testing strategies for IPC -->
