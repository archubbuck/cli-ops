# Cross-CLI Communication

## Overview

The `@cli-ops/shared-ipc` package provides Inter-Process Communication (IPC) mechanisms for coordination between the three independent CLIs (`cli-alpha`, `cli-beta`, `cli-gamma`).

## Architecture

### Core Components

```
@cli-ops/shared-ipc
├── LockManager - File-based locks for resource synchronization
├── EventBus - Publish/subscribe for CLI coordination
├── ServiceRegistry - Discovery of running CLI instances
└── IPC Server/Client - Unix domain sockets for data exchange
```

## Use Cases

### 1. Shared Resource Protection

Prevent data corruption when multiple CLIs access shared resources:

```typescript
import { LockManager } from '@cli-ops/shared-ipc'

const lockManager = new LockManager('config-file')

await lockManager.acquire(async () => {
  // Only one CLI can modify config at a time
  const config = await readConfig()
  config.theme = 'dark'
  await writeConfig(config)
})
```

Lock files stored in:
```
~/.local/share/cli-ops/locks/
  config-file.lock
  task-database.lock
  shared-state.lock
```

### 2. Event Coordination

Notify other CLIs when important events occur:

```typescript
import { EventBus } from '@cli-ops/shared-ipc'

const bus = new EventBus()

// cli-alpha: Emit event when task created
await tasks.create(newTask)
await bus.emit('task:created', {
  id: newTask.id,
  title: newTask.title,
  cli: 'alpha'
})

// cli-beta: React to task creation
bus.on('task:created', (task) => {
  console.log(`📌 New task: ${task.title}`)
})
```

### 3. Service Discovery

Detect running CLI instances:

```typescript
import { ServiceRegistry } from '@cli-ops/shared-ipc'

const registry = new ServiceRegistry()

// Register this CLI
await registry.register('cli-alpha', {
  pid: process.pid,
  version: '1.0.0',
  startedAt: Date.now()
})

// Find other running CLIs
const instances = await registry.discover()
// Returns: [
//   { name: 'cli-beta', pid: 12345, version: '1.0.0' },
//   { name: 'cli-gamma', pid: 67890, version: '2.0.0' }
// ]
```

### 4. Direct Communication

Send requests between CLIs:

```typescript
import { IPCServer, IPCClient } from '@cli-ops/shared-ipc'

// cli-alpha: Server for receiving requests
const server = new IPCServer('cli-alpha')
server.on('request', async (data) => {
  if (data.action === 'get-tasks') {
    return { tasks: await loadTasks() }
  }
})

// cli-beta: Client for sending requests
const client = new IPCClient('cli-alpha')
const response = await client.request({ action: 'get-tasks' })
console.log(response.tasks)
```

## Implementation Details

### File-Based Locks

Lock files prevent concurrent access:

```typescript
export class LockManager {
  private lockDir = '~/.local/share/cli-ops/locks'
  
  async acquire(resource: string, callback: () => Promise<void>) {
    const lockFile = path.join(this.lockDir, `${resource}.lock`)
    
    // Wait for lock availability
    await this.waitForLock(lockFile)
    
    try {
      // Create lock file with PID
      await fs.writeFile(lockFile, String(process.pid))
      
      // Execute critical section
      await callback()
    } finally {
      // Release lock
      await fs.unlink(lockFile)
    }
  }
  
  async isLocked(resource: string): Promise<boolean> {
    const lockFile = path.join(this.lockDir, `${resource}.lock`)
    return fs.pathExists(lockFile)
  }
}
```

### Event Bus

Publish/subscribe using file system watching:

```typescript
export class EventBus {
  private eventDir = '~/.local/share/cli-ops/events'
  
  async emit(event: string, data: any) {
    const eventFile = path.join(
      this.eventDir,
      `${event}-${Date.now()}.json`
    )
    await fs.writeJSON(eventFile, {
      event,
      data,
      timestamp: Date.now(),
      source: process.pid
    })
  }
  
  on(event: string, handler: (data: any) => void) {
    const watcher = chokidar.watch(
      path.join(this.eventDir, `${event}-*.json`)
    )
    
    watcher.on('add', async (filePath) => {
      const data = await fs.readJSON(filePath)
      handler(data.data)
      await fs.unlink(filePath) // Cleanup
    })
  }
}
```

### Service Registry

Track running CLI instances:

```typescript
export class ServiceRegistry {
  private registryFile = '~/.local/share/cli-ops/registry.json'
  
  async register(name: string, metadata: any) {
    const registry = await this.load()
    registry[name] = {
      ...metadata,
      pid: process.pid,
      lastSeen: Date.now()
    }
    await this.save(registry)
    
    // Unregister on exit
    process.on('exit', () => this.unregister(name))
  }
  
  async discover(): Promise<ServiceInfo[]> {
    const registry = await this.load()
    
    // Filter out dead processes
    const alive = []
    for (const [name, info] of Object.entries(registry)) {
      if (await this.isProcessAlive(info.pid)) {
        alive.push({ name, ...info })
      }
    }
    
    return alive
  }
}
```

### Unix Domain Sockets

Fast IPC for complex data exchange:

```typescript
export class IPCServer {
  private socketPath: string
  private server: net.Server
  
  constructor(name: string) {
    this.socketPath = `/tmp/cli-ops/${name}.sock`
    this.server = net.createServer(this.handleConnection)
    this.server.listen(this.socketPath)
  }
  
  on(event: 'request', handler: (data: any) => Promise<any>) {
    this.requestHandler = handler
  }
  
  private async handleConnection(socket: net.Socket) {
    socket.on('data', async (buffer) => {
      const request = JSON.parse(buffer.toString())
      const response = await this.requestHandler(request)
      socket.write(JSON.stringify(response))
      socket.end()
    })
  }
}

export class IPCClient {
  constructor(private targetName: string) {}
  
  async request(data: any): Promise<any> {
    const socketPath = `/tmp/cli-ops/${this.targetName}.sock`
    
    return new Promise((resolve, reject) => {
      const socket = net.connect(socketPath)
      
      socket.on('connect', () => {
        socket.write(JSON.stringify(data))
      })
      
      socket.on('data', (buffer) => {
        resolve(JSON.parse(buffer.toString()))
        socket.end()
      })
      
      socket.on('error', reject)
    })
  }
}
```

## Event Types

### Standard Events

```typescript
// Configuration changes
'config:changed' - { key: string, value: any }

// Task operations (cli-alpha)
'task:created' - { id: string, title: string }
'task:updated' - { id: string, changes: object }
'task:deleted' - { id: string }

// Item operations (cli-beta)
'item:created' - { id: string, name: string }
'item:updated' - { id: string, changes: object }

// Project operations (cli-gamma)
'project:created' - { id: string, name: string }
'project:archived' - { id: string }
```

## Platform Considerations

### Unix/Linux/macOS

- Use Unix domain sockets for IPC
- File locks work reliably
- File system watching via `chokidar`

### Windows

- Use named pipes instead of domain sockets
- File locks may behave differently
- Alternative: Memory-mapped files

```typescript
// Platform-specific socket path
const socketPath = process.platform === 'win32'
  ? `\\\\.\\pipe\\cli-ops-${name}`
  : `/tmp/cli-ops/${name}.sock`
```

## Cleanup & Maintenance

### Stale Lock Detection

Remove locks from dead processes:

```typescript
async function cleanStaleLocks() {
  const locks = await fs.readdir(lockDir)
  
  for (const lockFile of locks) {
    const pid = await fs.readFile(
      path.join(lockDir, lockFile),
      'utf-8'
    )
    
    if (!isProcessAlive(Number(pid))) {
      await fs.unlink(path.join(lockDir, lockFile))
    }
  }
}
```

### Event Cleanup

Remove old event files:

```typescript
async function cleanOldEvents() {
  const events = await fs.readdir(eventDir)
  const now = Date.now()
  
  for (const eventFile of events) {
    const stat = await fs.stat(path.join(eventDir, eventFile))
    const age = now - stat.mtimeMs
    
    if (age > 60000) { // 1 minute old
      await fs.unlink(path.join(eventDir, eventFile))
    }
  }
}
```

### Automatic Cleanup

Run cleanup on CLI initialization:

```typescript
export class CLI {
  async init() {
    // Clean up stale resources
    await cleanStaleLocks()
    await cleanOldEvents()
    await registry.cleanDeadProcesses()
  }
}
```

## Testing

### Mock IPC

Disable IPC during tests:

```typescript
import { LockManager } from '@cli-ops/shared-ipc'

const mockLockManager = new LockManager({
  disabled: process.env.NODE_ENV === 'test'
})
```

### Simulate Events

Test event handlers:

```typescript
test('handles task creation event', async () => {
  const bus = new EventBus({ inMemory: true })
  
  const handler = vi.fn()
  bus.on('task:created', handler)
  
  await bus.emit('task:created', { id: 'task-123' })
  
  expect(handler).toHaveBeenCalledWith({ id: 'task-123' })
})
```

## Security Considerations

### File Permissions

Ensure IPC directories are user-only:

```typescript
await fs.mkdir(lockDir, { mode: 0o700 }) // rwx------
```

### Input Validation

Validate all IPC messages:

```typescript
server.on('request', async (data) => {
  if (!isValidRequest(data)) {
    throw new Error('Invalid request')
  }
  return handleRequest(data)
})
```

### Rate Limiting

Prevent event flooding:

```typescript
const rateLimiter = new Map<string, number>()

async function emit(event: string, data: any) {
  const key = `${event}-${process.pid}`
  const lastEmit = rateLimiter.get(key) || 0
  const now = Date.now()
  
  if (now - lastEmit < 100) { // Max 10/sec
    throw new Error('Rate limit exceeded')
  }
  
  rateLimiter.set(key, now)
  await bus.emit(event, data)
}
```

## Related Documentation

- [ADR-008: Cross-CLI Communication](../adr/008-cross-cli-communication.md)
- [shared-ipc package](../../packages/shared-ipc/README.md)

<!-- TODO: Expand with WebSocket implementation for remote CLI coordination -->
<!-- TODO: Add examples of distributed locking for multi-machine scenarios -->
<!-- TODO: Document message queue integration (Redis pub/sub, RabbitMQ) -->
