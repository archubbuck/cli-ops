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
export declare class EventBus {
  private listeners
  private onceListeners
  private readonly maxListeners
  private readonly warnOnMaxListeners
  constructor(options?: EventBusOptions)
  /**
   * Subscribe to an event
   */
  on<T = unknown>(event: string, handler: EventHandler<T>): () => void
  /**
   * Subscribe to an event once
   */
  once<T = unknown>(event: string, handler: EventHandler<T>): () => void
  /**
   * Unsubscribe from an event
   */
  off<T = unknown>(event: string, handler: EventHandler<T>): void
  /**
   * Emit an event
   */
  emit<T = unknown>(event: string, payload: T): Promise<void>
  /**
   * Emit event synchronously
   */
  emitSync<T = unknown>(event: string, payload: T): void
  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void
  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number
  /**
   * Get all event names
   */
  eventNames(): string[]
}
/**
 * Create a new event bus
 */
export declare function createEventBus(options?: EventBusOptions): EventBus
/**
 * Get or create global event bus
 */
export declare function getGlobalEventBus(): EventBus
//# sourceMappingURL=event-bus.d.ts.map
