# Shared IPC

Inter-process communication with event bus and child process management.

## Features

- 📡 **Event Bus** - Pub/sub pattern for loosely coupled communication
- 🔄 **Process Management** - Fork and manage child processes
- 💬 **Request/Response** - Async message passing with timeouts
- 🔌 **Plugin System** - Communication between plugins
- 🛡️ **Auto-restart** - Resilient process management
- ⚡ **Type-Safe** - Full TypeScript support

## Installation

```bash
pnpm add @/shared-ipc
```

## Usage

### Event Bus (In-Process)

```typescript
import { createEventBus } from '@/shared-ipc'

const bus = createEventBus()

// Subscribe to event
const unsubscribe = bus.on('user:login', (payload: { userId: string }) => {
  console.log(`User logged in: ${payload.userId}`)
})

// Subscribe once
bus.once('app:ready', () => {
  console.log('App is ready!')
})

// Emit event
await bus.emit('user:login', { userId: '123' })

// Unsubscribe
unsubscribe()
```

### Child Process Management

```typescript
import { createProcess } from '@/shared-ipc'

// Start a worker process
const worker = createProcess('./worker.js', {
  timeout: 30000,
  autoRestart: true,
  maxRestarts: 3,
})

worker.start()

// Listen for messages
worker.onMessage('progress', (payload: { percent: number }) => {
  console.log(`Progress: ${payload.percent}%`)
})

// Send message
worker.send('task', { action: 'process', data: [...] })

// Request/response pattern
const result = await worker.request('calculate', { values: [1, 2, 3] })
console.log('Result:', result)

// Stop worker
worker.stop()
```

### Worker Process (worker.js)

```typescript
// In worker process
process.on('message', async (message: IPCMessage) => {
  if (message.type === 'task') {
    // Handle task
    const result = await processTask(message.payload)
    
    // Send progress updates
    process.send!({
      id: Math.random().toString(36).slice(2),
      type: 'progress',
      payload: { percent: 50 },
      timestamp: Date.now(),
    })
  }

  if (message.type === 'calculate') {
    // Handle request
    const result = message.payload.values.reduce((a, b) => a + b, 0)
    
    // Send response
    process.send!({
      id: message.id, // Same ID for response
      type: 'response',
      payload: result,
      timestamp: Date.now(),
    })
  }
})
```

## Advanced Examples

### Plugin System

```typescript
import { createEventBus } from '@/shared-ipc'

// Plugin interface
interface Plugin {
  name: string
  init(bus: EventBus): void
  destroy(): void
}

// Plugin manager
class PluginManager {
  private bus = createEventBus()
  private plugins = new Map<string, Plugin>()

  register(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin)
    plugin.init(this.bus)
    this.bus.emit('plugin:registered', { name: plugin.name })
  }

  unregister(name: string): void {
    const plugin = this.plugins.get(name)
    if (plugin) {
      plugin.destroy()
      this.plugins.delete(name)
      this.bus.emit('plugin:unregistered', { name })
    }
  }

  getBus(): EventBus {
    return this.bus
  }
}

// Example plugin
class LoggerPlugin implements Plugin {
  name = 'logger'
  private unsubscribers: Array<() => void> = []

  init(bus: EventBus): void {
    this.unsubscribers.push(
      bus.on('*', (payload) => {
        console.log('Event:', payload)
      })
    )
  }

  destroy(): void {
    this.unsubscribers.forEach(unsub => unsub())
  }
}
```

### Background Worker Pool

```typescript
import { createProcess, type ManagedProcess } from '@/shared-ipc'

class WorkerPool {
  private workers: ManagedProcess[] = []
  private taskQueue: Array<{ task: unknown; resolve: (result: unknown) => void }> = []
  private availableWorkers: Set<ManagedProcess> = new Set()

  constructor(workerPath: string, size: number = 4) {
    for (let i = 0; i < size; i++) {
      const worker = createProcess(workerPath, {
        autoRestart: true,
      })

      worker.on('start', () => {
        this.availableWorkers.add(worker)
        this.processQueue()
      })

      worker.start()
      this.workers.push(worker)
    }
  }

  async execute(task: unknown): Promise<unknown> {
    return new Promise((resolve) => {
      this.taskQueue.push({ task, resolve })
      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    while (this.taskQueue.length > 0 && this.availableWorkers.size > 0) {
      const { task, resolve } = this.taskQueue.shift()!
      const worker = Array.from(this.availableWorkers)[0]
      this.availableWorkers.delete(worker)

      try {
        const result = await worker.request('execute', task)
        resolve(result)
      } finally {
        this.availableWorkers.add(worker)
        this.processQueue()
      }
    }
  }

  shutdown(): void {
    this.workers.forEach(worker => worker.stop())
  }
}

// Usage
const pool = new WorkerPool('./worker.js', 4)

const results = await Promise.all([
  pool.execute({ type: 'heavy-computation', data: 1 }),
  pool.execute({ type: 'heavy-computation', data: 2 }),
  pool.execute({ type: 'heavy-computation', data: 3 }),
])

pool.shutdown()
```

### Event-Driven Architecture

```typescript
import { getGlobalEventBus } from '@/shared-ipc'

const bus = getGlobalEventBus()

// User service
class UserService {
  constructor() {
    bus.on('user:register', async (user) => {
      await this.sendWelcomeEmail(user)
    })
  }

  async registerUser(data: unknown) {
    const user = await this.createUser(data)
    await bus.emit('user:registered', user)
    return user
  }

  private async sendWelcomeEmail(user: unknown) {
    // Send email
  }

  private async createUser(data: unknown) {
    // Create user
    return data
  }
}

// Analytics service
class AnalyticsService {
  constructor() {
    bus.on('user:registered', (user) => {
      this.trackEvent('user_registered', user)
    })

    bus.on('user:login', (user) => {
      this.trackEvent('user_login', user)
    })
  }

  private trackEvent(event: string, data: unknown) {
    console.log(`Track: ${event}`, data)
  }
}

// Services are decoupled but communicate via events
const userService = new UserService()
const analyticsService = new AnalyticsService()
```

### Resilient Worker

```typescript
import { createProcess } from '@/shared-ipc'

const worker = createProcess('./long-running-task.js', {
  autoRestart: true,
  maxRestarts: 5,
})

worker.on('start', () => {
  console.log('Worker started')
})

worker.on('restart', (count) => {
  console.log(`Worker restarted (attempt ${count})`)
})

worker.on('exit', ({ code, signal }) => {
  console.log(`Worker exited: code=${code}, signal=${signal}`)
})

worker.on('error', (error) => {
  console.error('Worker error:', error)
})

worker.start()
```

## Best Practices

1. **Namespaced events** - Use colons (e.g., `user:login`)
2. **Type-safe payloads** - Define interfaces for event data
3. **Unsubscribe** - Clean up listeners to prevent memory leaks
4. **Error handling** - Always handle errors in async handlers
5. **Timeouts** - Set reasonable timeouts for requests
6. **Process cleanup** - Always stop child processes on exit

## ADHD/OCD Benefits

- **Decoupled** - Services don't need to know about each other
- **Organized** - Events are namespaced and typed
- **Predictable** - Clear communication patterns
- **Resilient** - Auto-restart keeps processes running
- **Traceable** - Event flow is explicit

## API Reference

### EventBus
- `on<T>(event, handler)` - Subscribe to event
- `once<T>(event, handler)` - Subscribe once
- `off<T>(event, handler)` - Unsubscribe
- `emit<T>(event, payload)` - Emit event (async)
- `emitSync<T>(event, payload)` - Emit event (sync)
- `removeAllListeners(event?)` - Clear listeners
- `listenerCount(event)` - Get listener count
- `eventNames()` - Get all event names

### ManagedProcess
- `start()` - Start child process
- `stop(signal?)` - Stop child process
- `send<T>(type, payload)` - Send message
- `request<TReq, TRes>(type, payload)` - Send request, wait for response
- `onMessage<T>(type, handler)` - Listen for message type
- `isRunning()` - Check if running
- `getPid()` - Get process ID

### Events (ManagedProcess)
- `start` - Process started
- `restart` - Process restarted
- `exit` - Process exited
- `error` - Process error
- `message` - Message received

## Options

### EventBusOptions
- `maxListeners` - Max listeners per event (default: 10)
- `warnOnMaxListeners` - Warn on exceeded (default: true)

### ProcessManagerOptions
- `timeout` - Request timeout in ms (default: 30000)
- `autoRestart` - Auto-restart on crash (default: false)
- `maxRestarts` - Max restart attempts (default: 3)
- Plus all Node.js `ForkOptions`
