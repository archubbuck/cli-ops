import { fork, type ChildProcess, type ForkOptions } from 'node:child_process'
import { EventEmitter } from 'node:events'

/**
 * Message types for IPC
 */
export interface IPCMessage<T = unknown> {
  id: string
  type: string
  payload: T
  timestamp: number
}

/**
 * Process manager options
 */
export interface ProcessManagerOptions extends ForkOptions {
  /**
   * Timeout for process responses (ms)
   * @default 30000
   */
  timeout?: number

  /**
   * Auto-restart on crash
   * @default false
   */
  autoRestart?: boolean

  /**
   * Maximum restart attempts
   * @default 3
   */
  maxRestarts?: number
}

/**
 * Managed child process
 */
export class ManagedProcess extends EventEmitter {
  private process: ChildProcess | null = null
  private readonly modulePath: string
  private readonly options: ProcessManagerOptions
  private restartCount = 0
  private messageHandlers = new Map<string, Set<(payload: unknown) => void>>()
  private pendingRequests = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (error: Error) => void; timer: NodeJS.Timeout }
  >()

  constructor(modulePath: string, options: ProcessManagerOptions = {}) {
    super()
    this.modulePath = modulePath
    this.options = {
      timeout: 30000,
      autoRestart: false,
      maxRestarts: 3,
      ...options,
    }
  }

  /**
   * Start the child process
   */
  start(): void {
    if (this.process) {
      throw new Error('Process already started')
    }

    this.process = fork(this.modulePath, [], this.options)

    // Handle messages from child
    this.process.on('message', (message: IPCMessage) => {
      this.handleMessage(message)
    })

    // Handle process exit
    this.process.on('exit', (code, signal) => {
      this.emit('exit', { code, signal })

      if (this.options.autoRestart && this.restartCount < (this.options.maxRestarts || 3)) {
        this.restartCount++
        this.emit('restart', this.restartCount)
        this.process = null
        this.start()
      }
    })

    // Handle errors
    this.process.on('error', error => {
      this.emit('error', error)
    })

    this.emit('start')
  }

  /**
   * Stop the child process
   */
  stop(signal: NodeJS.Signals = 'SIGTERM'): void {
    if (!this.process) {
      return
    }

    this.process.kill(signal)
    this.process = null
  }

  /**
   * Send a message to child process
   */
  send<T = unknown>(type: string, payload: T): void {
    if (!this.process) {
      throw new Error('Process not started')
    }

    const message: IPCMessage<T> = {
      id: Math.random().toString(36).slice(2),
      type,
      payload,
      timestamp: Date.now(),
    }

    this.process.send(message)
  }

  /**
   * Send a request and wait for response
   */
  request<TReq = unknown, TRes = unknown>(
    type: string,
    payload: TReq
  ): Promise<TRes> {
    if (!this.process) {
      throw new Error('Process not started')
    }

    const message: IPCMessage<TReq> = {
      id: Math.random().toString(36).slice(2),
      type,
      payload,
      timestamp: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(message.id)
        reject(new Error(`Request timeout: ${type}`))
      }, this.options.timeout)

      this.pendingRequests.set(message.id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timer,
      })

      this.process!.send(message)
    })
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: IPCMessage): void {
    // Handle response to pending request
    if (message.type === 'response') {
      const pending = this.pendingRequests.get(message.id)
      if (pending) {
        clearTimeout(pending.timer)
        this.pendingRequests.delete(message.id)
        pending.resolve(message.payload)
        return
      }
    }

    // Handle regular messages
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach(handler => handler(message.payload))
    }

    this.emit('message', message)
  }

  /**
   * Listen for specific message type
   */
  onMessage<T = unknown>(type: string, handler: (payload: T) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set())
    }

    this.messageHandlers.get(type)!.add(handler as (payload: unknown) => void)

    return () => {
      this.messageHandlers.get(type)?.delete(handler as (payload: unknown) => void)
    }
  }

  /**
   * Check if process is running
   */
  isRunning(): boolean {
    return this.process !== null && !this.process.killed
  }

  /**
   * Get process ID
   */
  getPid(): number | undefined {
    return this.process?.pid
  }
}

/**
 * Create a managed child process
 */
export function createProcess(
  modulePath: string,
  options?: ProcessManagerOptions
): ManagedProcess {
  return new ManagedProcess(modulePath, options)
}
