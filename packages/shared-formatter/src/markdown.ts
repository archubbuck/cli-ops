/**
 * Markdown formatting utilities
 */

export interface MarkdownFormatOptions {
  /**
   * Include table of contents
   * @default false
   */
  toc?: boolean

  /**
   * Maximum heading level for TOC
   * @default 3
   */
  tocDepth?: number
}

/**
 * Format data as Markdown table
 */
export function formatMarkdownTable<T extends Record<string, unknown>>(
  data: T[],
  options: { columns?: string[] } = {}
): string {
  if (data.length === 0) {
    return '_No data_'
  }

  const columns = options.columns || Object.keys(data[0])

  // Header
  const header = `| ${columns.join(' | ')} |`
  const separator = `| ${columns.map(() => '---').join(' | ')} |`

  // Rows
  const rows = data.map(row => {
    const cells = columns.map(col => {
      const value = row[col]
      return formatMarkdownCell(value)
    })
    return `| ${cells.join(' | ')} |`
  })

  return [header, separator, ...rows].join('\n')
}

/**
 * Format a cell value for Markdown
 */
function formatMarkdownCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '_null_'
  }

  if (typeof value === 'boolean') {
    return value ? '✓' : '✗'
  }

  if (typeof value === 'number') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return `_[${value.length} items]_`
  }

  if (typeof value === 'object') {
    return '_[object]_'
  }

  // Escape pipe characters
  return String(value).replace(/\|/g, '\\|')
}

/**
 * Create Markdown list
 */
export function formatMarkdownList(
  items: string[],
  options: { ordered?: boolean; indent?: number } = {}
): string {
  const { ordered = false, indent = 0 } = options
  const indentStr = '  '.repeat(indent)

  return items
    .map((item, index) => {
      const marker = ordered ? `${index + 1}.` : '-'
      return `${indentStr}${marker} ${item}`
    })
    .join('\n')
}

/**
 * Create Markdown heading
 */
export function formatMarkdownHeading(
  text: string,
  level: number = 1
): string {
  const hashes = '#'.repeat(Math.max(1, Math.min(6, level)))
  return `${hashes} ${text}`
}

/**
 * Create Markdown code block
 */
export function formatMarkdownCode(
  code: string,
  language: string = ''
): string {
  return `\`\`\`${language}\n${code}\n\`\`\``
}

/**
 * Create Markdown link
 */
export function formatMarkdownLink(text: string, url: string): string {
  return `[${text}](${url})`
}

/**
 * Create Markdown image
 */
export function formatMarkdownImage(
  alt: string,
  url: string,
  title?: string
): string {
  if (title) {
    return `![${alt}](${url} "${title}")`
  }
  return `![${alt}](${url})`
}

/**
 * Create Markdown quote
 */
export function formatMarkdownQuote(text: string): string {
  return text
    .split('\n')
    .map(line => `> ${line}`)
    .join('\n')
}

/**
 * Create horizontal rule
 */
export function formatMarkdownHR(): string {
  return '---'
}

/**
 * Create Markdown document with frontmatter
 */
export function formatMarkdownDocument(
  content: string,
  options: {
    frontmatter?: Record<string, unknown>
    toc?: boolean
  } = {}
): string {
  const parts: string[] = []

  // Add frontmatter if provided
  if (options.frontmatter) {
    const yaml = Object.entries(options.frontmatter)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n')
    parts.push(`---\n${yaml}\n---\n`)
  }

  // Add TOC if requested
  if (options.toc) {
    parts.push('## Table of Contents\n')
    parts.push(generateTOC(content))
    parts.push('\n')
  }

  // Add content
  parts.push(content)

  return parts.join('\n')
}

/**
 * Generate table of contents from Markdown content
 */
function generateTOC(markdown: string, maxDepth: number = 3): string {
  const headings = markdown.match(/^#{1,6} .+$/gm) || []

  return headings
    .map(heading => {
      const level = heading.match(/^#+/)?.[0].length || 1
      if (level > maxDepth) return null

      const text = heading.replace(/^#+\s+/, '')
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')

      const indent = '  '.repeat(level - 1)
      return `${indent}- [${text}](#${slug})`
    })
    .filter(Boolean)
    .join('\n')
}
