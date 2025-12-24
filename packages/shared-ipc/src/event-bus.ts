/**
 * Event bus for loosely coupled communication
 */

export type EventHandler<T = unknown> = (payload: T) => void | Promise<void>

export interface EventBusOptions {
  /**
   * Maximum listeners per event (0 = unlimited)
   * @default 10
   */
  maxListeners?: number

  /**
   * Warn when max listeners exceeded
   * @default true
   */
  warnOnMaxListeners?: boolean
}

/**
 * Simple event bus for pub/sub pattern
 */
export class EventBus {
  private listeners = new Map<string, Set<EventHandler>>()
  private onceListeners = new Map<string, Set<EventHandler>>()
  private readonly maxListeners: number
  private readonly warnOnMaxListeners: boolean

  constructor(options: EventBusOptions = {}) {
    this.maxListeners = options.maxListeners ?? 10
    this.warnOnMaxListeners = options.warnOnMaxListeners ?? true
  }

  /**
   * Subscribe to an event
   */
  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const handlers = this.listeners.get(event)!
    handlers.add(handler as EventHandler)

    // Warn if too many listeners
    if (
      this.warnOnMaxListeners &&
      this.maxListeners > 0 &&
      handlers.size > this.maxListeners
    ) {
      console.warn(
        `Warning: Possible memory leak. Event "${event}" has ${handlers.size} listeners.`
      )
    }

    // Return unsubscribe function
    return () => this.off(event, handler)
  }

  /**
   * Subscribe to an event once
   */
  once<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set())
    }

    this.onceListeners.get(event)!.add(handler as EventHandler)

    return () => {
      this.onceListeners.get(event)?.delete(handler as EventHandler)
    }
  }

  /**
   * Unsubscribe from an event
   */
  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    this.listeners.get(event)?.delete(handler as EventHandler)
    this.onceListeners.get(event)?.delete(handler as EventHandler)
  }

  /**
   * Emit an event
   */
  async emit<T = unknown>(event: string, payload: T): Promise<void> {
    // Regular listeners
    const handlers = this.listeners.get(event)
    if (handlers) {
      await Promise.all(
        Array.from(handlers).map(handler => handler(payload))
      )
    }

    // Once listeners
    const onceHandlers = this.onceListeners.get(event)
    if (onceHandlers) {
      await Promise.all(
        Array.from(onceHandlers).map(handler => handler(payload))
      )
      // Clear once listeners after execution
      this.onceListeners.delete(event)
    }
  }

  /**
   * Emit event synchronously
   */
  emitSync<T = unknown>(event: string, payload: T): void {
    // Regular listeners
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(payload))
    }

    // Once listeners
    const onceHandlers = this.onceListeners.get(event)
    if (onceHandlers) {
      onceHandlers.forEach(handler => handler(payload))
      this.onceListeners.delete(event)
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
      this.onceListeners.delete(event)
    } else {
      this.listeners.clear()
      this.onceListeners.clear()
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    const regular = this.listeners.get(event)?.size || 0
    const once = this.onceListeners.get(event)?.size || 0
    return regular + once
  }

  /**
   * Get all event names
   */
  eventNames(): string[] {
    const names = new Set<string>()
    this.listeners.forEach((_, event) => names.add(event))
    this.onceListeners.forEach((_, event) => names.add(event))
    return Array.from(names)
  }
}

/**
 * Create a new event bus
 */
export function createEventBus(options?: EventBusOptions): EventBus {
  return new EventBus(options)
}

/**
 * Global event bus instance (singleton)
 */
let globalBus: EventBus | null = null

/**
 * Get or create global event bus
 */
export function getGlobalEventBus(): EventBus {
  if (!globalBus) {
    globalBus = new EventBus()
  }
  return globalBus
}
