'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.ManagedProcess = void 0
exports.createProcess = createProcess
const node_child_process_1 = require('node:child_process')
const node_events_1 = require('node:events')
/**
 * Managed child process
 */
class ManagedProcess extends node_events_1.EventEmitter {
  process = null
  modulePath
  options
  restartCount = 0
  messageHandlers = new Map()
  pendingRequests = new Map()
  constructor(modulePath, options = {}) {
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
  start() {
    if (this.process) {
      throw new Error('Process already started')
    }
    this.process = (0, node_child_process_1.fork)(this.modulePath, [], this.options)
    // Handle messages from child
    this.process.on('message', (message) => {
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
    this.process.on('error', (error) => {
      this.emit('error', error)
    })
    this.emit('start')
  }
  /**
   * Stop the child process
   */
  stop(signal = 'SIGTERM') {
    if (!this.process) {
      return
    }
    this.process.kill(signal)
    this.process = null
  }
  /**
   * Send a message to child process
   */
  send(type, payload) {
    if (!this.process) {
      throw new Error('Process not started')
    }
    const message = {
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
  request(type, payload) {
    if (!this.process) {
      throw new Error('Process not started')
    }
    const message = {
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
        resolve: resolve,
        reject,
        timer,
      })
      this.process.send(message)
    })
  }
  /**
   * Handle incoming message
   */
  handleMessage(message) {
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
      handlers.forEach((handler) => handler(message.payload))
    }
    this.emit('message', message)
  }
  /**
   * Listen for specific message type
   */
  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set())
    }
    this.messageHandlers.get(type).add(handler)
    return () => {
      this.messageHandlers.get(type)?.delete(handler)
    }
  }
  /**
   * Check if process is running
   */
  isRunning() {
    return this.process !== null && !this.process.killed
  }
  /**
   * Get process ID
   */
  getPid() {
    return this.process?.pid
  }
}
exports.ManagedProcess = ManagedProcess
/**
 * Create a managed child process
 */
function createProcess(modulePath, options) {
  return new ManagedProcess(modulePath, options)
}
//# sourceMappingURL=process.js.map
