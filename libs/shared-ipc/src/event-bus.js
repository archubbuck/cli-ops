"use strict";
/**
 * Event bus for loosely coupled communication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
exports.createEventBus = createEventBus;
exports.getGlobalEventBus = getGlobalEventBus;
/**
 * Simple event bus for pub/sub pattern
 */
class EventBus {
    listeners = new Map();
    onceListeners = new Map();
    maxListeners;
    warnOnMaxListeners;
    constructor(options = {}) {
        this.maxListeners = options.maxListeners ?? 10;
        this.warnOnMaxListeners = options.warnOnMaxListeners ?? true;
    }
    /**
     * Subscribe to an event
     */
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        const handlers = this.listeners.get(event);
        handlers.add(handler);
        // Warn if too many listeners
        if (this.warnOnMaxListeners &&
            this.maxListeners > 0 &&
            handlers.size > this.maxListeners) {
            console.warn(`Warning: Possible memory leak. Event "${event}" has ${handlers.size} listeners.`);
        }
        // Return unsubscribe function
        return () => this.off(event, handler);
    }
    /**
     * Subscribe to an event once
     */
    once(event, handler) {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, new Set());
        }
        this.onceListeners.get(event).add(handler);
        return () => {
            this.onceListeners.get(event)?.delete(handler);
        };
    }
    /**
     * Unsubscribe from an event
     */
    off(event, handler) {
        this.listeners.get(event)?.delete(handler);
        this.onceListeners.get(event)?.delete(handler);
    }
    /**
     * Emit an event
     */
    async emit(event, payload) {
        // Regular listeners
        const handlers = this.listeners.get(event);
        if (handlers) {
            await Promise.all(Array.from(handlers).map(handler => handler(payload)));
        }
        // Once listeners
        const onceHandlers = this.onceListeners.get(event);
        if (onceHandlers) {
            await Promise.all(Array.from(onceHandlers).map(handler => handler(payload)));
            // Clear once listeners after execution
            this.onceListeners.delete(event);
        }
    }
    /**
     * Emit event synchronously
     */
    emitSync(event, payload) {
        // Regular listeners
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(payload));
        }
        // Once listeners
        const onceHandlers = this.onceListeners.get(event);
        if (onceHandlers) {
            onceHandlers.forEach(handler => handler(payload));
            this.onceListeners.delete(event);
        }
    }
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
        }
        else {
            this.listeners.clear();
            this.onceListeners.clear();
        }
    }
    /**
     * Get listener count for an event
     */
    listenerCount(event) {
        const regular = this.listeners.get(event)?.size || 0;
        const once = this.onceListeners.get(event)?.size || 0;
        return regular + once;
    }
    /**
     * Get all event names
     */
    eventNames() {
        const names = new Set();
        this.listeners.forEach((_, event) => names.add(event));
        this.onceListeners.forEach((_, event) => names.add(event));
        return Array.from(names);
    }
}
exports.EventBus = EventBus;
/**
 * Create a new event bus
 */
function createEventBus(options) {
    return new EventBus(options);
}
/**
 * Global event bus instance (singleton)
 */
let globalBus = null;
/**
 * Get or create global event bus
 */
function getGlobalEventBus() {
    if (!globalBus) {
        globalBus = new EventBus();
    }
    return globalBus;
}
//# sourceMappingURL=event-bus.js.map