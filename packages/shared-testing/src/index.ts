export {
  createTempDir,
  removeTempDir,
  createFixture,
  FixtureManager,
  createFixtureManager,
} from './fixtures.js'

export {
  mockConsole,
  mockEnv,
  mockExit,
  captureOutput,
} from './mocks.js'

// Re-export @oclif/test utilities
export { expect, test } from '@oclif/test'
