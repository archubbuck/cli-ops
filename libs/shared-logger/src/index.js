'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.LogLevel =
  exports.logger =
  exports.createStructuredLoggerFactory =
  exports.createStructuredLogger =
  exports.createDebugLoggerFactory =
  exports.disableDebug =
  exports.enableDebug =
  exports.isDebugEnabled =
  exports.createDebugLogger =
    void 0
var debug_logger_js_1 = require('./debug-logger.js')
Object.defineProperty(exports, 'createDebugLogger', {
  enumerable: true,
  get: function () {
    return debug_logger_js_1.createDebugLogger
  },
})
Object.defineProperty(exports, 'isDebugEnabled', {
  enumerable: true,
  get: function () {
    return debug_logger_js_1.isDebugEnabled
  },
})
Object.defineProperty(exports, 'enableDebug', {
  enumerable: true,
  get: function () {
    return debug_logger_js_1.enableDebug
  },
})
Object.defineProperty(exports, 'disableDebug', {
  enumerable: true,
  get: function () {
    return debug_logger_js_1.disableDebug
  },
})
Object.defineProperty(exports, 'createDebugLoggerFactory', {
  enumerable: true,
  get: function () {
    return debug_logger_js_1.createLoggerFactory
  },
})
var structured_logger_js_1 = require('./structured-logger.js')
Object.defineProperty(exports, 'createStructuredLogger', {
  enumerable: true,
  get: function () {
    return structured_logger_js_1.createStructuredLogger
  },
})
Object.defineProperty(exports, 'createStructuredLoggerFactory', {
  enumerable: true,
  get: function () {
    return structured_logger_js_1.createLoggerFactory
  },
})
Object.defineProperty(exports, 'logger', {
  enumerable: true,
  get: function () {
    return structured_logger_js_1.logger
  },
})
Object.defineProperty(exports, 'LogLevel', {
  enumerable: true,
  get: function () {
    return structured_logger_js_1.LogLevel
  },
})
//# sourceMappingURL=index.js.map
