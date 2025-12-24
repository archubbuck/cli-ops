import { EventBus, createEventBus } from '@/shared-ipc'

/**
 * Base service class
 */
export abstract class BaseService {
  protected bus: EventBus

  constructor(bus?: EventBus) {
    this.bus = bus || createEventBus()
  }

  /**
   * Initialize service
   */
  async init(): Promise<void> {
    // Override in subclasses
  }

  /**
   * Destroy service
   */
  async destroy(): Promise<void> {
    // Override in subclasses
  }
}

/**
 * Service container for dependency injection
 */
export class ServiceContainer {
  private services = new Map<string, BaseService>()

  /**
   * Register a service
   */
  register<T extends BaseService>(name: string, service: T): void {
    if (this.services.has(name)) {
      throw new Error(`Service ${name} already registered`)
    }
    this.services.set(name, service)
  }

  /**
   * Get a service
   */
  get<T extends BaseService>(name: string): T {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Service ${name} not found`)
    }
    return service as T
  }

  /**
   * Check if service exists
   */
  has(name: string): boolean {
    return this.services.has(name)
  }

  /**
   * Initialize all services
   */
  async initAll(): Promise<void> {
    await Promise.all(
      Array.from(this.services.values()).map(service => service.init())
    )
  }

  /**
   * Destroy all services
   */
  async destroyAll(): Promise<void> {
    await Promise.all(
      Array.from(this.services.values()).map(service => service.destroy())
    )
  }
}
