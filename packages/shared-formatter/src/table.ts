import Table from 'cli-table3'
import type { TableConstructorOptions } from 'cli-table3'
import chalk from 'chalk'

export interface TableFormatOptions {
  /**
   * Table columns configuration
   */
  columns?: Array<{
    key: string
    label: string
    width?: number
    align?: 'left' | 'center' | 'right'
  }>

  /**
   * Table style
   * @default 'simple'
   */
  style?: 'simple' | 'compact' | 'markdown' | 'grid'

  /**
   * Include row numbers
   * @default false
   */
  showRowNumbers?: boolean

  /**
   * Colorize output
   * @default true
   */
  colors?: boolean

  /**
   * Truncate cell content to fit width
   * @default true
   */
  truncate?: boolean

  /**
   * Sort by column
   */
  sortBy?: string

  /**
   * Sort direction
   * @default 'asc'
   */
  sortDirection?: 'asc' | 'desc'
}

/**
 * Format data as table
 */
export function formatTable<T extends Record<string, unknown>>(
  data: T[],
  options: TableFormatOptions = {}
): string {
  const {
    columns,
    style = 'simple',
    showRowNumbers = false,
    colors = true,
    sortBy,
    sortDirection = 'asc',
  } = options

  if (data.length === 0) {
    return colors ? chalk.dim('(no data)') : '(no data)'
  }

  // Auto-detect columns if not provided
  const cols =
    columns ||
    Object.keys(data[0]).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
    }))

  // Sort data if requested
  let sortedData = [...data]
  if (sortBy) {
    sortedData.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      
      if (aVal === bVal) return 0
      
      const comparison = aVal < bVal ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }

  // Get table configuration based on style
  const tableConfig = getTableStyle(style)

  // Add row number column if requested
  const headers = showRowNumbers
    ? ['#', ...cols.map(c => c.label)]
    : cols.map(c => c.label)

  // Create table
  const table = new Table({
    ...tableConfig,
    head: colors ? headers.map(h => chalk.bold.cyan(h)) : headers,
    colWidths: showRowNumbers
      ? [5, ...cols.map(c => c.width)]
      : cols.map(c => c.width),
    colAligns: showRowNumbers
      ? ['right', ...cols.map(c => c.align || 'left')]
      : cols.map(c => c.align || 'left'),
  })

  // Add rows
  sortedData.forEach((row, index) => {
    const cells = cols.map(col => {
      const value = row[col.key]
      return formatCellValue(value, colors)
    })

    if (showRowNumbers) {
      const rowNum = colors ? chalk.dim(String(index + 1)) : String(index + 1)
      table.push([rowNum, ...cells])
    } else {
      table.push(cells)
    }
  })

  return table.toString()
}

/**
 * Format a value for table cell
 */
function formatCellValue(value: unknown, colors: boolean): string {
  if (value === null || value === undefined) {
    return colors ? chalk.dim('null') : 'null'
  }

  if (typeof value === 'boolean') {
    return colors
      ? value
        ? chalk.green('true')
        : chalk.red('false')
      : String(value)
  }

  if (typeof value === 'number') {
    return colors ? chalk.yellow(String(value)) : String(value)
  }

  if (Array.isArray(value)) {
    return colors ? chalk.dim(`[${value.length} items]`) : `[${value.length}]`
  }

  if (typeof value === 'object') {
    return colors ? chalk.dim('[object]') : '[object]'
  }

  return String(value)
}

/**
 * Get table style configuration
 */
function getTableStyle(style: string): Partial<TableConstructorOptions> {
  switch (style) {
    case 'compact':
      return {
        chars: {
          top: '',
          'top-mid': '',
          'top-left': '',
          'top-right': '',
          bottom: '',
          'bottom-mid': '',
          'bottom-left': '',
          'bottom-right': '',
          left: '',
          'left-mid': '',
          mid: '',
          'mid-mid': '',
          right: '',
          'right-mid': '',
          middle: ' ',
        },
        style: { 'padding-left': 0, 'padding-right': 1 },
      }

    case 'markdown':
      return {
        chars: {
          top: '',
          'top-mid': '',
          'top-left': '',
          'top-right': '',
          bottom: '',
          'bottom-mid': '',
          'bottom-left': '',
          'bottom-right': '',
          left: '|',
          'left-mid': '|',
          mid: '|',
          'mid-mid': '|',
          right: '|',
          'right-mid': '|',
          middle: '|',
        },
        style: { 'padding-left': 1, 'padding-right': 1 },
      }

    case 'grid':
      return {
        chars: {
          top: '─',
          'top-mid': '┬',
          'top-left': '┌',
          'top-right': '┐',
          bottom: '─',
          'bottom-mid': '┴',
          'bottom-left': '└',
          'bottom-right': '┘',
          left: '│',
          'left-mid': '├',
          mid: '─',
          'mid-mid': '┼',
          right: '│',
          'right-mid': '┤',
          middle: '│',
        },
      }

    case 'simple':
    default:
      return {
        chars: {
          top: '─',
          'top-mid': '┬',
          'top-left': '┌',
          'top-right': '┐',
          bottom: '─',
          'bottom-mid': '┴',
          'bottom-left': '└',
          'bottom-right': '┘',
          left: '│',
          'left-mid': '├',
          mid: '─',
          'mid-mid': '┼',
          right: '│',
          'right-mid': '┤',
          middle: '│',
        },
      }
  }
}

/**
 * Create a simple key-value table
 */
export function formatKeyValueTable(
  data: Record<string, unknown>,
  options: Pick<TableFormatOptions, 'style' | 'colors'> = {}
): string {
  const { style = 'simple', colors = true } = options

  const tableConfig = getTableStyle(style)

  const table = new Table({
    ...tableConfig,
    colWidths: [30, 50],
  })

  Object.entries(data).forEach(([key, value]) => {
    const formattedKey = colors ? chalk.cyan(key) : key
    const formattedValue = formatCellValue(value, colors)
    table.push([formattedKey, formattedValue])
  })

  return table.toString()
}
