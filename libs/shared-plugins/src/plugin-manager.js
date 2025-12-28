"use strict";
/**
 * Plugin management utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
exports.getPluginManager = getPluginManager;
exports.createPluginManager = createPluginManager;
const shared_ipc_1 = require("@cli-ops/shared-ipc");
const shared_logger_1 = require("@cli-ops/shared-logger");
const shared_core_1 = require("@cli-ops/shared-core");
/**
 * Plugin manager for discovering, loading, and managing plugins
 */
class PluginManager {
    eventBus;
    logger = (0, shared_logger_1.createDebugLogger)('plugin-manager');
    loadedPlugins = new Map();
    constructor() {
        this.eventBus = (0, shared_ipc_1.createEventBus)();
    }
    /**
     * Get event bus for plugin communication
     */
    getEventBus() {
        return this.eventBus;
    }
    /**
     * Validate a plugin's metadata
     */
    validatePlugin(metadata) {
        const errors = [];
        if (!metadata.name || typeof metadata.name !== 'string') {
            errors.push('Plugin name is required and must be a string');
        }
        if (!metadata.version || typeof metadata.version !== 'string') {
            errors.push('Plugin version is required and must be a string');
        }
        // Validate name format for scoped packages
        // Supports: @cli-ops/clio-plugin-{name} or {name}-plugin-{feature}
        if (metadata.name) {
            const isScopedPlugin = metadata.name.match(/^@cli-ops\/clio-plugin-[\w-]+$/);
            const isExtensionPlugin = metadata.name.match(/^@cli-ops\/[\w-]+-plugin-[\w-]+$/);
            const isLegacyPlugin = metadata.name.match(/^cli-\w+-plugin-[\w-]+$/);
            if (!isScopedPlugin && !isExtensionPlugin && !isLegacyPlugin) {
                errors.push('Plugin name must follow format: @cli-ops/clio-plugin-{name} or @cli-ops/{base}-plugin-{feature}');
            }
        }
        // Validate version format (semver)
        if (metadata.version && !metadata.version.match(/^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/)) {
            errors.push('Plugin version must follow semantic versioning');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Register a loaded plugin
     */
    registerPlugin(plugin, metadata) {
        const name = plugin.name;
        if (this.loadedPlugins.has(name)) {
            throw new shared_core_1.CLIError(`Plugin "${name}" is already registered`, { exitCode: 1 });
        }
        // Validate metadata if provided
        if (metadata) {
            const validation = this.validatePlugin(metadata);
            if (!validation.valid) {
                throw new shared_core_1.CLIError(`Plugin validation failed: ${validation.errors.join(', ')}`, {
                    exitCode: 1,
                });
            }
        }
        this.loadedPlugins.set(name, plugin);
        this.logger(`Registered plugin: ${name}`);
        // Emit plugin loaded event
        this.eventBus.emit('plugin:loaded', {
            name,
            version: plugin.version,
            metadata,
        });
    }
    /**
     * Unregister a plugin
     */
    unregisterPlugin(name) {
        if (!this.loadedPlugins.has(name)) {
            throw new shared_core_1.CLIError(`Plugin "${name}" is not registered`, { exitCode: 1 });
        }
        this.loadedPlugins.delete(name);
        this.logger(`Unregistered plugin: ${name}`);
        // Emit plugin unloaded event
        this.eventBus.emit('plugin:unloaded', { name });
    }
    /**
     * Get a loaded plugin by name
     */
    getPlugin(name) {
        return this.loadedPlugins.get(name);
    }
    /**
     * Get all loaded plugins
     */
    getLoadedPlugins() {
        return new Map(this.loadedPlugins);
    }
    /**
     * Check if a plugin is loaded
     */
    isPluginLoaded(name) {
        return this.loadedPlugins.has(name);
    }
    /**
     * Get plugin count
     */
    getPluginCount() {
        return this.loadedPlugins.size;
    }
    /**
     * Clear all loaded plugins
     */
    clear() {
        const names = Array.from(this.loadedPlugins.keys());
        for (const name of names) {
            this.unregisterPlugin(name);
        }
    }
    /**
     * Destroy plugin manager
     */
    destroy() {
        this.clear();
        this.eventBus.removeAllListeners();
    }
}
exports.PluginManager = PluginManager;
/**
 * Global plugin manager instance
 */
let globalPluginManager;
/**
 * Get or create global plugin manager
 */
function getPluginManager() {
    if (!globalPluginManager) {
        globalPluginManager = new PluginManager();
    }
    return globalPluginManager;
}
/**
 * Create a new plugin manager instance
 */
function createPluginManager() {
    return new PluginManager();
}
//# sourceMappingURL=plugin-manager.js.map