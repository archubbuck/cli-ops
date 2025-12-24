# Shared Formatter

Output formatting for CLI applications - JSON, YAML, tables, Markdown, CSV.

## Features

- 📊 **Tables** - Beautiful CLI tables with multiple styles
- 📝 **JSON** - Pretty printing and parsing with validation
- 📄 **YAML** - Basic YAML formatting
- 📋 **Markdown** - Tables, lists, code blocks, and more
- 📑 **CSV** - Export and parse CSV data
- 🎨 **Colorized** - Optional color output for better readability

## Installation

```bash
pnpm add @/shared-formatter
```

## Usage

### JSON Formatting

```typescript
import { formatJSON, parseJSON } from '@/shared-formatter'

const data = { name: 'John', age: 30, active: true }

// Pretty print
console.log(formatJSON(data))
// {
//   "name": "John",
//   "age": 30,
//   "active": true
// }

// Compact
console.log(formatJSON(data, { pretty: false }))
// {"name":"John","age":30,"active":true}

// Sort keys
console.log(formatJSON(data, { sortKeys: true }))

// Remove nulls
console.log(formatJSON({ a: 1, b: null }, { includeNulls: false }))
// { "a": 1 }

// Parse with error handling
const parsed = parseJSON<User>('{"name":"John"}')
```

### Table Formatting

```typescript
import { formatTable, formatKeyValueTable } from '@/shared-formatter'

const users = [
  { name: 'Alice', age: 30, role: 'Admin' },
  { name: 'Bob', age: 25, role: 'User' },
]

// Auto-detect columns
console.log(formatTable(users))

// Custom columns
console.log(formatTable(users, {
  columns: [
    { key: 'name', label: 'Name', width: 20 },
    { key: 'age', label: 'Age', width: 5, align: 'right' },
    { key: 'role', label: 'Role', width: 15 },
  ],
  style: 'grid',
  showRowNumbers: true,
  sortBy: 'age',
}))

// Key-value table
const config = { host: 'localhost', port: 3000, debug: true }
console.log(formatKeyValueTable(config))
```

### Table Styles

```typescript
// Simple (default) - clean box drawing
formatTable(data, { style: 'simple' })

// Compact - no borders
formatTable(data, { style: 'compact' })

// Markdown - for documentation
formatTable(data, { style: 'markdown' })

// Grid - full borders
formatTable(data, { style: 'grid' })
```

### Markdown Formatting

```typescript
import {
  formatMarkdownTable,
  formatMarkdownList,
  formatMarkdownCode,
  formatMarkdownHeading,
  formatMarkdownDocument,
} from '@/shared-formatter'

// Table
const users = [
  { name: 'Alice', role: 'Admin' },
  { name: 'Bob', role: 'User' },
]
console.log(formatMarkdownTable(users))
// | name | role |
// | --- | --- |
// | Alice | Admin |
// | Bob | User |

// List
const items = ['First item', 'Second item', 'Third item']
console.log(formatMarkdownList(items, { ordered: true }))

// Code block
console.log(formatMarkdownCode('const x = 1', 'typescript'))

// Heading
console.log(formatMarkdownHeading('My Title', 2)) // ## My Title

// Full document with frontmatter
const doc = formatMarkdownDocument(content, {
  frontmatter: { title: 'My Doc', date: '2024-01-01' },
  toc: true,
})
```

### CSV Formatting

```typescript
import { formatCSV, parseCSV } from '@/shared-formatter'

const data = [
  { name: 'Alice', age: 30, city: 'NYC' },
  { name: 'Bob', age: 25, city: 'LA' },
]

// Export to CSV
const csv = formatCSV(data)
console.log(csv)
// name,age,city
// Alice,30,NYC
// Bob,25,LA

// Custom options
const csv = formatCSV(data, {
  delimiter: ';',
  columns: ['name', 'age'], // Only these columns
  header: true,
})

// Parse CSV
const parsed = parseCSV<User>(csvString)
```

### YAML Formatting

```typescript
import { formatYAML } from '@/shared-formatter'

const data = {
  name: 'my-app',
  version: '1.0.0',
  scripts: {
    build: 'tsc',
    test: 'vitest',
  },
}

console.log(formatYAML(data))
// name: my-app
// version: 1.0.0
// scripts:
//   build: tsc
//   test: vitest

// With document separator
console.log(formatYAML(data, { documentSeparator: true }))
```

## Advanced Examples

### Format Command Output

```typescript
import { formatTable, formatJSON } from '@/shared-formatter'

class ListCommand {
  async run() {
    const items = await fetchItems()

    // Let user choose format
    const format = this.flags.format || 'table'

    switch (format) {
      case 'json':
        console.log(formatJSON(items, { pretty: true }))
        break
      case 'csv':
        console.log(formatCSV(items))
        break
      case 'table':
      default:
        console.log(formatTable(items, {
          columns: [
            { key: 'id', label: 'ID', width: 10 },
            { key: 'name', label: 'Name', width: 30 },
            { key: 'status', label: 'Status', width: 15 },
          ],
          sortBy: 'name',
        }))
    }
  }
}
```

### Generate Documentation

```typescript
import {
  formatMarkdownDocument,
  formatMarkdownHeading,
  formatMarkdownTable,
  formatMarkdownCode,
} from '@/shared-formatter'

function generateCommandDocs(command: Command): string {
  const sections = [
    formatMarkdownHeading(command.name, 1),
    command.description,
    formatMarkdownHeading('Usage', 2),
    formatMarkdownCode(command.usage, 'bash'),
    formatMarkdownHeading('Options', 2),
    formatMarkdownTable(command.options),
    formatMarkdownHeading('Examples', 2),
    ...command.examples.map(ex => formatMarkdownCode(ex, 'bash')),
  ]

  return formatMarkdownDocument(sections.join('\n\n'), {
    frontmatter: {
      title: command.name,
      category: 'commands',
    },
  })
}
```

### Export Data with Format Selection

```typescript
import { formatJSON, formatCSV, formatTable } from '@/shared-formatter'

async function exportData(data: any[], format: string, file?: string) {
  let output: string

  switch (format) {
    case 'json':
      output = formatJSON(data, { pretty: true })
      break
    case 'csv':
      output = formatCSV(data)
      break
    case 'yaml':
      output = formatYAML(data)
      break
    default:
      // Print to console as table
      console.log(formatTable(data))
      return
  }

  if (file) {
    await fs.writeFile(file, output)
    console.log(`Exported ${data.length} items to ${file}`)
  } else {
    console.log(output)
  }
}
```

## Output Format Best Practices

### For Humans
- Use **tables** for list views
- Use **colors** for better readability
- Use **progress indicators** for operations
- Keep tables under 100 characters wide

### For Machines
- Use **JSON** for structured data
- Use **CSV** for spreadsheet compatibility
- Use **JSONL** for streaming/logging
- Disable colors with `--no-color` flag

### For Documentation
- Use **Markdown** for README files
- Use **Markdown tables** for reference docs
- Use **code blocks** for examples
- Include frontmatter for metadata

## ADHD/OCD Benefits

- **Consistent** - Same format options across all commands
- **Scannable** - Tables make data easy to scan
- **Predictable** - Known formats (JSON, CSV, etc.)
- **Flexible** - Choose format based on task
- **Clear** - Colorized output highlights important info

## API Reference

### JSON
- `formatJSON(data, options?)` - Format as JSON
- `parseJSON<T>(json, options?)` - Parse JSON safely
- `formatJSONLines(data[])` - Format as JSONL
- `parseJSONLines<T>(jsonl)` - Parse JSONL

### Tables
- `formatTable(data, options?)` - Format as table
- `formatKeyValueTable(data, options?)` - Key-value pairs

### Markdown
- `formatMarkdownTable(data, options?)` - Markdown table
- `formatMarkdownList(items, options?)` - List
- `formatMarkdownCode(code, lang?)` - Code block
- `formatMarkdownHeading(text, level?)` - Heading
- `formatMarkdownDocument(content, options?)` - Full document

### CSV
- `formatCSV(data, options?)` - Format as CSV
- `parseCSV<T>(csv, options?)` - Parse CSV
- `arrayToCSV(data[][], options?)` - 2D array to CSV

### YAML
- `formatYAML(data, options?)` - Format as YAML
- `parseYAML<T>(yaml)` - Parse YAML (basic)

## Best Practices

1. **Default to tables** for CLI output
2. **Support multiple formats** via `--format` flag
3. **Use colors** but allow `--no-color` override
4. **Pretty print JSON** by default
5. **Include headers** in CSV exports
6. **Sort tables** by meaningful columns
7. **Truncate wide cells** to fit terminal width
