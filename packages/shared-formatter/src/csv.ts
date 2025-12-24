/**
 * CSV formatting utilities
 */

export interface CSVFormatOptions {
  /**
   * Field delimiter
   * @default ','
   */
  delimiter?: string

  /**
   * Quote character
   * @default '"'
   */
  quote?: string

  /**
   * Line ending
   * @default '\n'
   */
  lineEnding?: string

  /**
   * Include header row
   * @default true
   */
  header?: boolean

  /**
   * Columns to include (in order)
   */
  columns?: string[]

  /**
   * Escape quotes in values
   * @default true
   */
  escapeQuotes?: boolean
}

/**
 * Format data as CSV
 */
export function formatCSV<T extends Record<string, unknown>>(
  data: T[],
  options: CSVFormatOptions = {}
): string {
  const {
    delimiter = ',',
    quote = '"',
    lineEnding = '\n',
    header = true,
    columns,
    escapeQuotes = true,
  } = options

  if (data.length === 0) {
    return ''
  }

  // Determine columns
  const cols = columns || Object.keys(data[0])

  const rows: string[] = []

  // Add header
  if (header) {
    rows.push(formatCSVRow(cols, { delimiter, quote, escapeQuotes }))
  }

  // Add data rows
  data.forEach(row => {
    const values = cols.map(col => row[col])
    rows.push(formatCSVRow(values, { delimiter, quote, escapeQuotes }))
  })

  return rows.join(lineEnding)
}

/**
 * Format a single CSV row
 */
function formatCSVRow(
  values: unknown[],
  options: Pick<CSVFormatOptions, 'delimiter' | 'quote' | 'escapeQuotes'>
): string {
  const { delimiter = ',', quote = '"', escapeQuotes = true } = options

  return values
    .map(value => formatCSVCell(value, { quote, escapeQuotes }))
    .join(delimiter)
}

/**
 * Format a single CSV cell
 */
function formatCSVCell(
  value: unknown,
  options: Pick<CSVFormatOptions, 'quote' | 'escapeQuotes'>
): string {
  const { quote = '"', escapeQuotes = true } = options

  if (value === null || value === undefined) {
    return ''
  }

  let strValue = String(value)

  // Check if quoting is needed
  const needsQuotes =
    strValue.includes(',') ||
    strValue.includes(quote) ||
    strValue.includes('\n') ||
    strValue.includes('\r')

  if (needsQuotes) {
    // Escape quotes
    if (escapeQuotes) {
      strValue = strValue.replace(new RegExp(quote, 'g'), quote + quote)
    }
    return `${quote}${strValue}${quote}`
  }

  return strValue
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV<T extends Record<string, unknown>>(
  csv: string,
  options: CSVFormatOptions = {}
): T[] {
  const {
    delimiter = ',',
    quote = '"',
    lineEnding = '\n',
    header = true,
  } = options

  const lines = csv.split(lineEnding).filter(line => line.trim())

  if (lines.length === 0) {
    return []
  }

  // Parse header
  let headers: string[]
  let dataLines: string[]

  if (header) {
    headers = parseCSVRow(lines[0], { delimiter, quote })
    dataLines = lines.slice(1)
  } else {
    // Generate column names
    const firstRow = parseCSVRow(lines[0], { delimiter, quote })
    headers = firstRow.map((_, i) => `column${i}`)
    dataLines = lines
  }

  // Parse data rows
  return dataLines.map(line => {
    const values = parseCSVRow(line, { delimiter, quote })
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] || ''
      return obj
    }, {} as Record<string, unknown>) as T
  })
}

/**
 * Parse a single CSV row
 */
function parseCSVRow(
  row: string,
  options: Pick<CSVFormatOptions, 'delimiter' | 'quote'>
): string[] {
  const { delimiter = ',', quote = '"' } = options

  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const char = row[i]
    const nextChar = row[i + 1]

    if (char === quote) {
      if (inQuotes && nextChar === quote) {
        // Escaped quote
        current += quote
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      // End of field
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }

  // Add last field
  values.push(current)

  return values
}

/**
 * Convert array of arrays to CSV
 */
export function arrayToCSV(
  data: unknown[][],
  options: CSVFormatOptions = {}
): string {
  const {
    delimiter = ',',
    quote = '"',
    lineEnding = '\n',
    escapeQuotes = true,
  } = options

  return data
    .map(row => formatCSVRow(row, { delimiter, quote, escapeQuotes }))
    .join(lineEnding)
}
