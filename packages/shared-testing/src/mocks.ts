/**
 * Mock console methods
 */
export function mockConsole(): {
  log: jest.Mock | typeof console.log
  error: jest.Mock | typeof console.error
  warn: jest.Mock | typeof console.warn
  restore: () => void
} {
  const original = {
    log: console.log,
    error: console.error,
    warn: console.warn,
  }

  const mocks = {
    log: jest.fn ? jest.fn() : (() => {}) as typeof console.log,
    error: jest.fn ? jest.fn() : (() => {}) as typeof console.error,
    warn: jest.fn ? jest.fn() : (() => {}) as typeof console.warn,
  }

  console.log = mocks.log
  console.error = mocks.error
  console.warn = mocks.warn

  return {
    ...mocks,
    restore: () => {
      console.log = original.log
      console.error = original.error
      console.warn = original.warn
    },
  }
}

/**
 * Mock environment variables
 */
export function mockEnv(vars: Record<string, string | undefined>): {
  restore: () => void
} {
  const original = { ...process.env }

  Object.entries(vars).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  })

  return {
    restore: () => {
      process.env = original
    },
  }
}

/**
 * Mock process.exit
 */
export function mockExit(): {
  exit: jest.Mock | typeof process.exit
  restore: () => void
} {
  const original = process.exit

  const mock = jest.fn
    ? jest.fn((code?: number) => {
        throw new Error(`process.exit(${code})`)
      })
    : ((code?: number) => {
        throw new Error(`process.exit(${code})`)
      }) as typeof process.exit

  process.exit = mock

  return {
    exit: mock,
    restore: () => {
      process.exit = original
    },
  }
}

/**
 * Capture stdout/stderr
 */
export function captureOutput(): {
  stdout: string[]
  stderr: string[]
  restore: () => void
} {
  const stdout: string[] = []
  const stderr: string[] = []

  const originalStdoutWrite = process.stdout.write.bind(process.stdout)
  const originalStderrWrite = process.stderr.write.bind(process.stderr)

  process.stdout.write = ((chunk: string): boolean => {
    stdout.push(chunk.toString())
    return true
  }) as typeof process.stdout.write

  process.stderr.write = ((chunk: string): boolean => {
    stderr.push(chunk.toString())
    return true
  }) as typeof process.stderr.write

  return {
    stdout,
    stderr,
    restore: () => {
      process.stdout.write = originalStdoutWrite
      process.stderr.write = originalStderrWrite
    },
  }
}
