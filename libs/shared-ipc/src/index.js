'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.createProcess =
  exports.ManagedProcess =
  exports.getGlobalEventBus =
  exports.createEventBus =
  exports.EventBus =
    void 0
var event_bus_js_1 = require('./event-bus.js')
Object.defineProperty(exports, 'EventBus', {
  enumerable: true,
  get: function () {
    return event_bus_js_1.EventBus
  },
})
Object.defineProperty(exports, 'createEventBus', {
  enumerable: true,
  get: function () {
    return event_bus_js_1.createEventBus
  },
})
Object.defineProperty(exports, 'getGlobalEventBus', {
  enumerable: true,
  get: function () {
    return event_bus_js_1.getGlobalEventBus
  },
})
var process_js_1 = require('./process.js')
Object.defineProperty(exports, 'ManagedProcess', {
  enumerable: true,
  get: function () {
    return process_js_1.ManagedProcess
  },
})
Object.defineProperty(exports, 'createProcess', {
  enumerable: true,
  get: function () {
    return process_js_1.createProcess
  },
})
//# sourceMappingURL=index.js.map
