"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDebugLogger = createDebugLogger;
exports.isDebugEnabled = isDebugEnabled;
exports.enableDebug = enableDebug;
exports.disableDebug = disableDebug;
exports.createLoggerFactory = createLoggerFactory;
const debug_1 = __importDefault(require("debug"));
/**
 * Create a debug logger with namespace
 */
function createDebugLogger(options) {
    const namespace = typeof options === 'string' ? options : options.namespace;
    const logger = (0, debug_1.default)(namespace);
    if (typeof options === 'object' && options.enabled !== undefined) {
        logger.enabled = options.enabled;
    }
    return logger;
}
/**
 * Check if debug logging is enabled for a namespace
 */
function isDebugEnabled(namespace) {
    return (0, debug_1.default)(namespace).enabled;
}
/**
 * Enable debug logging for namespace(s)
 */
function enableDebug(namespaces) {
    debug_1.default.enable(namespaces);
}
/**
 * Disable debug logging for namespace(s)
 */
function disableDebug(namespaces) {
    debug_1.default.disable();
    if (namespaces !== '*') {
        const current = process.env['DEBUG'] || '';
        const patterns = current.split(',').filter((p) => p !== namespaces);
        if (patterns.length > 0) {
            debug_1.default.enable(patterns.join(','));
        }
    }
}
/**
 * Create a logger factory for a base namespace
 */
function createLoggerFactory(baseNamespace) {
    return {
        /**
         * Create logger for a sub-namespace
         */
        create(subNamespace) {
            return createDebugLogger(`${baseNamespace}:${subNamespace}`);
        },
        /**
         * Create logger with full namespace
         */
        createRaw(namespace) {
            return createDebugLogger(namespace);
        },
        /**
         * Check if any loggers in this namespace are enabled
         */
        isEnabled() {
            return isDebugEnabled(baseNamespace);
        },
    };
}
//# sourceMappingURL=debug-logger.js.map