# Creating a New CLI

## Overview

This guide walks you through creating a new CLI in the monorepo, following the patterns established by `cli-alpha`, `cli-beta`, and `cli-gamma`.

## When to Create a New CLI

Consider creating a new CLI when:

- ✅ The functionality is distinct from existing CLIs
- ✅ It has its own domain and commands
- ✅ Users would benefit from a focused tool
- ❌ Don't create separate CLI for one or two commands (add to existing CLI)

## Step-by-Step Guide

### 1. Create CLI Directory

```bash
mkdir -p apps/cli-delta
cd apps/cli-delta
```

### 2. Create package.json

```json
{
  "name": "@cli-ops/cli-delta",
  "version": "0.0.0",
  "description": "Delta management CLI",
  "bin": {
    "delta": "./bin/run.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@cli-ops/shared-commands": "workspace:*",
    "@cli-ops/shared-config": "workspace:*",
    "@cli-ops/shared-logger": "workspace:*",
    "@cli-ops/shared-ui": "workspace:*",
    "@oclif/core": "^3.0.0"
  },
  "devDependencies": {
    "@cli-ops/eslint-config": "workspace:*",
    "@cli-ops/prettier-config": "workspace:*",
    "@cli-ops/tsconfig-base": "workspace:*",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 3. Create tsconfig.json

```json
{
  "extends": "@cli-ops/tsconfig-base/cli.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### 4. Create Entry Points

#### bin/run.js (Development)

```javascript
#!/usr/bin/env node

// Development entry point (runs TypeScript directly)
const oclif = require('@oclif/core')

const path = require('path')
const project = path.join(__dirname, '..', 'tsconfig.json')

// Register TypeScript support
require('ts-node').register({ project })

// Run CLI
oclif.run(process.argv.slice(2), import.meta.url)
  .then(require('@oclif/core/flush'))
  .catch(require('@oclif/core/handle'))
```

#### bin/dev.js (Convenience)

```javascript
#!/usr/bin/env node

// Shortcut for development
require('./run')
```

### 5. Create Source Structure

```bash
mkdir -p src/commands/items
mkdir -p src/storage
mkdir -p test/commands
```

### 6. Create Base Configuration

#### src/storage.ts

```typescript
import { join } from 'path'
import { homedir } from 'os'
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'

const DATA_DIR = join(homedir(), '.config', 'cli-delta')
const DATA_FILE = join(DATA_DIR, 'data.json')

export interface Item {
  id: string
  name: string
  createdAt: number
}

export class Storage {
  private data: { items: Item[] }

  constructor() {
    this.ensureDataDir()
    this.load()
  }

  private ensureDataDir() {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true })
    }
  }

  private load() {
    if (existsSync(DATA_FILE)) {
      const content = readFileSync(DATA_FILE, 'utf-8')
      this.data = JSON.parse(content)
    } else {
      this.data = { items: [] }
    }
  }

  private save() {
    writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2))
  }

  getItems(): Item[] {
    return this.data.items
  }

  addItem(item: Omit<Item, 'id' | 'createdAt'>): Item {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      ...item,
      createdAt: Date.now()
    }
    this.data.items.push(newItem)
    this.save()
    return newItem
  }

  deleteItem(id: string): boolean {
    const index = this.data.items.findIndex(i => i.id === id)
    if (index === -1) return false
    
    this.data.items.splice(index, 1)
    this.save()
    return true
  }
}

export const storage = new Storage()
```

### 7. Create First Command

#### src/commands/items/list.ts

```typescript
import { BaseCommand } from '@cli-ops/shared-commands'
import { storage } from '../../storage'
import { table } from '@cli-ops/shared-ui'

export default class ItemsList extends BaseCommand {
  static description = 'List all items'

  static examples = [
    '<%= config.bin %> <%= command.id %>'
  ]

  async run(): Promise<void> {
    const items = storage.getItems()

    if (items.length === 0) {
      this.log('No items found. Add one with: delta items add')
      return
    }

    // Display as table
    const rows = items.map(item => [
      item.id,
      item.name,
      new Date(item.createdAt).toLocaleString()
    ])

    console.log(table({
      head: ['ID', 'Name', 'Created'],
      rows
    }))

    this.log(`\nTotal: ${items.length} items`)
  }
}
```

#### src/commands/items/add.ts

```typescript
import { Args } from '@oclif/core'
import { BaseCommand } from '@cli-ops/shared-commands'
import { storage } from '../../storage'

export default class ItemsAdd extends BaseCommand {
  static description = 'Add a new item'

  static examples = [
    '<%= config.bin %> <%= command.id %> "New item"'
  ]

  static args = {
    name: Args.string({
      description: 'Item name',
      required: true
    })
  }

  async run(): Promise<void> {
    const { args } = await this.parse(ItemsAdd)

    const item = storage.addItem({ name: args.name })

    this.log(`✓ Created item: ${item.name}`)
    this.log(`  ID: ${item.id}`)
  }
}
```

### 8. Create Tests

#### test/commands/items/list.test.ts

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { runCommand } from '@cli-ops/shared-testing'
import { storage } from '../../../src/storage'

describe('items:list', () => {
  beforeEach(() => {
    // Add test items
    storage.addItem({ name: 'Test Item 1' })
    storage.addItem({ name: 'Test Item 2' })
  })

  afterEach(() => {
    // Clean up test data
    // (implement cleanup method in storage)
  })

  it('lists all items', async () => {
    const { stdout } = await runCommand('items:list')
    
    expect(stdout).toContain('Test Item 1')
    expect(stdout).toContain('Test Item 2')
    expect(stdout).toContain('Total: 2 items')
  })

  it('shows message when no items', async () => {
    // Clear items
    storage.getItems().forEach(item => storage.deleteItem(item.id))
    
    const { stdout } = await runCommand('items:list')
    
    expect(stdout).toContain('No items found')
  })
})
```

### 9. Add CLI to Workspace

Update root [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml):

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tooling/*'
  - 'generators'
  # cli-delta is already included in apps/*
```

### 10. Install Dependencies

```bash
cd ../..  # Back to root
pnpm install
```

### 11. Build and Test

```bash
# Build
pnpm --filter @cli-ops/cli-delta build

# Run CLI
./apps/cli-delta/bin/run.js items add "First item"
./apps/cli-delta/bin/run.js items list

# Run tests
pnpm --filter @cli-ops/cli-delta test
```

### 12. Add Shell Completions

Create completion scripts in [`completions/`](../../completions/):

#### completions/delta.bash

```bash
# Bash completion for delta CLI
_delta_completion() {
  local cur="${COMP_WORDS[COMP_CWORD]}"
  local commands="items help version"
  
  COMPREPLY=( $(compgen -W "${commands}" -- ${cur}) )
}

complete -F _delta_completion delta
```

#### completions/_delta (Zsh)

```zsh
#compdef delta

_delta() {
  local -a commands
  commands=(
    'items:Manage items'
    'help:Display help'
    'version:Display version'
  )
  
  _describe 'command' commands
}

_delta
```

### 13. Add to Documentation

Update [`README.md`](../../README.md):

```markdown
## CLIs

This monorepo contains four command-line tools:

- **cli-alpha** - Task management
- **cli-beta** - Item management  
- **cli-gamma** - Project management
- **cli-delta** - Delta management (NEW!)
```

Update [CLI Inventory System](../../INVENTORY-SYSTEM.md) to include cli-delta.

### 14. Create Changeset

```bash
pnpm changeset
```

Select:
- `@cli-ops/cli-delta` (major - new package)
- Write: "Initial release of cli-delta"

## Advanced Features

### Add Configuration Support

```typescript
import { ConfigManager } from '@cli-ops/shared-config'

const config = new ConfigManager('cli-delta', {
  defaults: {
    theme: 'auto',
    defaultPriority: 'medium'
  }
})

// In command
const theme = config.get('theme')
```

### Add Logging

```typescript
import { createLogger } from '@cli-ops/shared-logger'

const logger = createLogger({ name: 'cli-delta' })

// In command
logger.info('Item created successfully')
logger.debug('Processing item', { itemId })
```

### Add UI Components

```typescript
import { spinner, progressBar } from '@cli-ops/shared-ui'

const spin = spinner('Loading items...')
await fetchItems()
spin.succeed('Items loaded')
```

### Add Command History

```typescript
import { history } from '@cli-ops/shared-history'

await history.record({
  command: 'items delete',
  args: { id },
  metadata: { item },
  undo: async ({ item }) => {
    await storage.addItem(item)
  }
})
```

## Checklist

Before considering your CLI complete:

- [ ] All commands have help text
- [ ] All commands have tests (80%+ coverage)
- [ ] README.md with examples
- [ ] Shell completions (bash, zsh, fish)
- [ ] Integration with shared packages
- [ ] Error handling with helpful messages
- [ ] CI pipeline passes
- [ ] Documentation updated

## Related Documentation

- [Testing Strategy](./testing-strategy.md)
- [Changesets Workflow](./changesets-workflow.md)
- [Architecture Overview](../architecture/overview.md)

<!-- TODO: Expand with plugin system integration -->
<!-- TODO: Add examples of cross-CLI communication setup -->
<!-- TODO: Document distribution and release process -->
