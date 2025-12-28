export {
  HistoryManager,
  createHistoryManager,
  type HistoryEntry,
  type HistorySearchOptions,
  type HistoryManagerOptions,
} from './manager.js'

export {
  buildCommandString,
  formatHistoryEntry,
  groupByCommand,
  groupByDate,
  findSimilar,
  getCommandFrequency,
  getSuccessRate,
  type ReplayOptions,
} from './utils.js'
