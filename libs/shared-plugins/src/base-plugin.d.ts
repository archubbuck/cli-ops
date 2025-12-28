/**
 * Base plugin class for CLI plugins
 *
 * Extend this class to create custom plugins that integrate with the CLI ecosystem
 */
import { Command } from '@oclif/core';
import type { PluginMetadata } from '@cli-ops/shared-types';
/**
 * Base plugin class that provides common functionality
 */
export declare abstract class BasePlugin {
    /**
     * Plugin metadata
     */
    abstract readonly metadata: PluginMetadata;
    /**
     * Initialize the plugin
     * Called when the plugin is loaded
     */
    init(): Promise<void>;
    /**
     * Cleanup resources
     * Called when the plugin is unloaded
     */
    destroy(): Promise<void>;
    /**
     * Get the plugin event bus for inter-plugin communication
     */
    protected getEventBus(): import("@cli-ops/shared-ipc").EventBus;
    /**
     * Emit a plugin event
     */
    protected emit(event: string, data?: unknown): void;
    /**
     * Listen to a plugin event
     */
    protected on(event: string, handler: (data: unknown) => void): void;
    /**
     * Listen to a plugin event once
     */
    protected once(event: string, handler: (data: unknown) => void): void;
    /**
     * Remove event listener
     */
    protected off(event: string, handler: (data: unknown) => void): void;
}
/**
 * Base command class for plugin commands
 *
 * Plugin commands should extend this class to inherit common functionality
 * and ensure compatibility with the CLI framework
 */
export declare abstract class BasePluginCommand extends Command {
    /**
     * Plugin name this command belongs to
     */
    static pluginName?: string;
    /**
     * Plugin version
     */
    static pluginVersion?: string;
    /**
     * Get the plugin event bus
     */
    protected getPluginEventBus(): import("@cli-ops/shared-ipc").EventBus;
    /**
     * Emit a plugin event
     */
    protected emitPluginEvent(event: string, data?: unknown): void;
}
//# sourceMappingURL=base-plugin.d.ts.map