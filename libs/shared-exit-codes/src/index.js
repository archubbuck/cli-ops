'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.isRetryable =
  exports.isError =
  exports.isSuccess =
  exports.getExitCodeDescription =
  exports.EXIT_CODE_DESCRIPTIONS =
  exports.CANCELLED =
  exports.ALREADY_EXISTS =
  exports.NOT_FOUND =
  exports.VALIDATION_ERROR =
  exports.API_ERROR =
  exports.NETWORK_ERROR =
  exports.AUTHZ_ERROR =
  exports.AUTH_ERROR =
  exports.SYSTEM_CONFIG_ERROR =
  exports.NO_PERMISSION =
  exports.PROTOCOL_ERROR =
  exports.TEMP_FAIL =
  exports.IO_ERROR =
  exports.CANT_CREATE =
  exports.OS_FILE_ERROR =
  exports.OS_ERROR =
  exports.SOFTWARE_ERROR =
  exports.UNAVAILABLE =
  exports.NO_HOST =
  exports.NO_USER =
  exports.NO_INPUT =
  exports.DATA_ERROR =
  exports.CONFIG_ERROR =
  exports.MISUSE =
  exports.GENERIC_ERROR =
  exports.SUCCESS =
    void 0
var constants_js_1 = require('./constants.js')
// Success
Object.defineProperty(exports, 'SUCCESS', {
  enumerable: true,
  get: function () {
    return constants_js_1.SUCCESS
  },
})
// Generic errors
Object.defineProperty(exports, 'GENERIC_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.GENERIC_ERROR
  },
})
Object.defineProperty(exports, 'MISUSE', {
  enumerable: true,
  get: function () {
    return constants_js_1.MISUSE
  },
})
// BSD sysexits.h compatible (64-78)
Object.defineProperty(exports, 'CONFIG_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.CONFIG_ERROR
  },
})
Object.defineProperty(exports, 'DATA_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.DATA_ERROR
  },
})
Object.defineProperty(exports, 'NO_INPUT', {
  enumerable: true,
  get: function () {
    return constants_js_1.NO_INPUT
  },
})
Object.defineProperty(exports, 'NO_USER', {
  enumerable: true,
  get: function () {
    return constants_js_1.NO_USER
  },
})
Object.defineProperty(exports, 'NO_HOST', {
  enumerable: true,
  get: function () {
    return constants_js_1.NO_HOST
  },
})
Object.defineProperty(exports, 'UNAVAILABLE', {
  enumerable: true,
  get: function () {
    return constants_js_1.UNAVAILABLE
  },
})
Object.defineProperty(exports, 'SOFTWARE_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.SOFTWARE_ERROR
  },
})
Object.defineProperty(exports, 'OS_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.OS_ERROR
  },
})
Object.defineProperty(exports, 'OS_FILE_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.OS_FILE_ERROR
  },
})
Object.defineProperty(exports, 'CANT_CREATE', {
  enumerable: true,
  get: function () {
    return constants_js_1.CANT_CREATE
  },
})
Object.defineProperty(exports, 'IO_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.IO_ERROR
  },
})
Object.defineProperty(exports, 'TEMP_FAIL', {
  enumerable: true,
  get: function () {
    return constants_js_1.TEMP_FAIL
  },
})
Object.defineProperty(exports, 'PROTOCOL_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.PROTOCOL_ERROR
  },
})
Object.defineProperty(exports, 'NO_PERMISSION', {
  enumerable: true,
  get: function () {
    return constants_js_1.NO_PERMISSION
  },
})
Object.defineProperty(exports, 'SYSTEM_CONFIG_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.SYSTEM_CONFIG_ERROR
  },
})
// Custom CLI codes (100+)
Object.defineProperty(exports, 'AUTH_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.AUTH_ERROR
  },
})
Object.defineProperty(exports, 'AUTHZ_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.AUTHZ_ERROR
  },
})
Object.defineProperty(exports, 'NETWORK_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.NETWORK_ERROR
  },
})
Object.defineProperty(exports, 'API_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.API_ERROR
  },
})
Object.defineProperty(exports, 'VALIDATION_ERROR', {
  enumerable: true,
  get: function () {
    return constants_js_1.VALIDATION_ERROR
  },
})
Object.defineProperty(exports, 'NOT_FOUND', {
  enumerable: true,
  get: function () {
    return constants_js_1.NOT_FOUND
  },
})
Object.defineProperty(exports, 'ALREADY_EXISTS', {
  enumerable: true,
  get: function () {
    return constants_js_1.ALREADY_EXISTS
  },
})
Object.defineProperty(exports, 'CANCELLED', {
  enumerable: true,
  get: function () {
    return constants_js_1.CANCELLED
  },
})
// Utilities
Object.defineProperty(exports, 'EXIT_CODE_DESCRIPTIONS', {
  enumerable: true,
  get: function () {
    return constants_js_1.EXIT_CODE_DESCRIPTIONS
  },
})
Object.defineProperty(exports, 'getExitCodeDescription', {
  enumerable: true,
  get: function () {
    return constants_js_1.getExitCodeDescription
  },
})
Object.defineProperty(exports, 'isSuccess', {
  enumerable: true,
  get: function () {
    return constants_js_1.isSuccess
  },
})
Object.defineProperty(exports, 'isError', {
  enumerable: true,
  get: function () {
    return constants_js_1.isError
  },
})
Object.defineProperty(exports, 'isRetryable', {
  enumerable: true,
  get: function () {
    return constants_js_1.isRetryable
  },
})
//# sourceMappingURL=index.js.map
