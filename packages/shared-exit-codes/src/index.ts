export {
  // Success
  SUCCESS,
  
  // Generic errors
  GENERIC_ERROR,
  MISUSE,
  
  // BSD sysexits.h compatible (64-78)
  CONFIG_ERROR,
  DATA_ERROR,
  NO_INPUT,
  NO_USER,
  NO_HOST,
  UNAVAILABLE,
  SOFTWARE_ERROR,
  OS_ERROR,
  OS_FILE_ERROR,
  CANT_CREATE,
  IO_ERROR,
  TEMP_FAIL,
  PROTOCOL_ERROR,
  NO_PERMISSION,
  SYSTEM_CONFIG_ERROR,
  
  // Custom CLI codes (100+)
  AUTH_ERROR,
  AUTHZ_ERROR,
  NETWORK_ERROR,
  API_ERROR,
  VALIDATION_ERROR,
  NOT_FOUND,
  ALREADY_EXISTS,
  CANCELLED,
  
  // Utilities
  EXIT_CODE_DESCRIPTIONS,
  getExitCodeDescription,
  isSuccess,
  isError,
  isRetryable,
} from './constants.js'
