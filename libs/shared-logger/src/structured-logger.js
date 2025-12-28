"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
exports.createStructuredLogger = createStructuredLogger;
exports.createLoggerFactory = createLoggerFactory;
const pino_1 = __importDefault(require("pino"));
/**
 * Log levels (lower number = higher priority)
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["TRACE"] = 10] = "TRACE";
    LogLevel[LogLevel["DEBUG"] = 20] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 30] = "INFO";
    LogLevel[LogLevel["WARN"] = 40] = "WARN";
    LogLevel[LogLevel["ERROR"] = 50] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 60] = "FATAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Detect if running in CI environment
 */
function isCI() {
    return Boolean(process.env['CI'] ||
        process.env['CONTINUOUS_INTEGRATION'] ||
        process.env['GITHUB_ACTIONS'] ||
        process.env['GITLAB_CI'] ||
        process.env['CIRCLECI'] ||
        process.env['TRAVIS'] ||
        process.env['JENKINS_URL']);
}
/**
 * Detect if running in production
 */
function isProduction() {
    return process.env['NODE_ENV'] === 'production';
}
/**
 * Create a structured logger with pino
 */
function createStructuredLogger(options) {
    const { name, level = 'info', prettyPrint = !isProduction(), transport, context = {}, detectCI = true, } = options;
    // In CI, disable pretty printing and use JSON
    const shouldPrettyPrint = detectCI && isCI() ? false : prettyPrint;
    const pinoOptions = {
        name,
        level: typeof level === 'string' ? level : undefined,
        base: context,
    };
    // Add transport for pretty printing or custom output
    if (shouldPrettyPrint && !transport) {
        pinoOptions.transport = {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        };
    }
    else if (transport) {
        pinoOptions.transport = transport;
    }
    const logger = (0, pino_1.default)(pinoOptions);
    // Set numeric level if provided
    if (typeof level === 'number') {
        logger.level =
            Object.entries(LogLevel)
                .find(([, value]) => value === level)?.[0]
                ?.toLowerCase() ?? 'info';
    }
    return logger;
}
/**
 * Create a logger factory for consistent logger creation
 */
function createLoggerFactory(baseOptions) {
    return {
        /**
         * Create a logger with a specific name
         */
        create(name, additionalContext) {
            return createStructuredLogger({
                ...baseOptions,
                name,
                context: {
                    ...baseOptions.context,
                    ...additionalContext,
                },
            });
        },
    };
}
/**
 * Default logger instance
 */
exports.logger = createStructuredLogger({
    name: 'app',
});
//# sourceMappingURL=structured-logger.js.map