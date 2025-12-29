import { type ForkOptions } from 'node:child_process'
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
export declare class ManagedProcess extends EventEmitter {
  private process
  private readonly modulePath
  private readonly options
  private restartCount
  private messageHandlers
  private pendingRequests
  constructor(modulePath: string, options?: ProcessManagerOptions)
  /**
   * Start the child process
   */
  start(): void
  /**
   * Stop the child process
   */
  stop(signal?: NodeJS.Signals): void
  /**
   * Send a message to child process
   */
  send<T = unknown>(type: string, payload: T): void
  /**
   * Send a request and wait for response
   */
  request<TReq = unknown, TRes = unknown>(type: string, payload: TReq): Promise<TRes>
  /**
   * Handle incoming message
   */
  private handleMessage
  /**
   * Listen for specific message type
   */
  onMessage<T = unknown>(type: string, handler: (payload: T) => void): () => void
  /**
   * Check if process is running
   */
  isRunning(): boolean
  /**
   * Get process ID
   */
  getPid(): number | undefined
}
/**
 * Create a managed child process
 */
export declare function createProcess(
  modulePath: string,
  options?: ProcessManagerOptions,
): ManagedProcess
//# sourceMappingURL=process.d.ts.map
