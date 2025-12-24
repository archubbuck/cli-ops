/**
 * JSON formatting utilities
 */

export interface JSONFormatOptions {
  /**
   * Pretty print with indentation
   * @default true
   */
  pretty?: boolean

  /**
   * Indentation spaces (only if pretty = true)
   * @default 2
   */
  indent?: number

  /**
   * Sort object keys alphabetically
   * @default false
   */
  sortKeys?: boolean

  /**
   * Include null values in output
   * @default true
   */
  includeNulls?: boolean
}

/**
 * Format data as JSON
 */
export function formatJSON(
  data: unknown,
  options: JSONFormatOptions = {}
): string {
  const {
    pretty = true,
    indent = 2,
    sortKeys = false,
    includeNulls = true,
  } = options

  let processedData = data

  // Remove nulls if requested
  if (!includeNulls) {
    processedData = removeNulls(data)
  }

  // Sort keys if requested
  if (sortKeys) {
    processedData = sortObjectKeys(processedData)
  }

  if (pretty) {
    return JSON.stringify(processedData, null, indent)
  }

  return JSON.stringify(processedData)
}

/**
 * Parse JSON with helpful error messages
 */
export function parseJSON<T = unknown>(
  json: string,
  options: { throwOnError?: boolean } = {}
): T | null {
  const { throwOnError = true } = options

  try {
    return JSON.parse(json) as T
  } catch (error) {
    if (throwOnError) {
      if (error instanceof SyntaxError) {
        throw new Error(
          `Invalid JSON: ${error.message}\n` +
          `Near: ${json.slice(0, 100)}...`
        )
      }
      throw error
    }
    return null
  }
}

/**
 * Remove null values from object/array recursively
 */
function removeNulls(data: unknown): unknown {
  if (data === null || data === undefined) {
    return undefined
  }

  if (Array.isArray(data)) {
    return data
      .map(item => removeNulls(item))
      .filter(item => item !== undefined)
  }

  if (typeof data === 'object') {
    return Object.entries(data as Record<string, unknown>)
      .reduce((acc, [key, value]) => {
        const cleaned = removeNulls(value)
        if (cleaned !== undefined) {
          acc[key] = cleaned
        }
        return acc
      }, {} as Record<string, unknown>)
  }

  return data
}

/**
 * Sort object keys recursively
 */
function sortObjectKeys(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(item => sortObjectKeys(item))
  }

  if (typeof data === 'object' && data !== null) {
    return Object.keys(data as Record<string, unknown>)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObjectKeys((data as Record<string, unknown>)[key])
        return acc
      }, {} as Record<string, unknown>)
  }

  return data
}

/**
 * Format JSON for streaming/JSONL
 */
export function formatJSONLines(data: unknown[]): string {
  return data.map(item => JSON.stringify(item)).join('\n')
}

/**
 * Parse JSONL (JSON Lines) format
 */
export function parseJSONLines<T = unknown>(jsonl: string): T[] {
  return jsonl
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line) as T)
}
