# Shared Prompts

Interactive CLI prompts with validation, built on inquirer.

## Features

- 📝 **Multiple Input Types** - Text, confirm, list, multi-select, number, password
- ✅ **Zod Validation** - Type-safe validation with Zod schemas
- 🎯 **Common Patterns** - Pre-built confirmation patterns
- 🔧 **Fluent Builder** - Chain prompts together
- ⚡ **Type-Safe** - Full TypeScript support

## Installation

```bash
pnpm add @/shared-prompts
```

## Usage

### Text Input

```typescript
import { promptText } from '@/shared-prompts'
import { z } from 'zod'

// Basic text input
const name = await promptText({
  message: 'What is your name?',
  default: 'John Doe',
})

// With Zod validation
const email = await promptText({
  message: 'Enter your email:',
  schema: z.string().email(),
})

// Custom validation
const username = await promptText({
  message: 'Choose a username:',
  validate: async value => {
    if (value.length < 3) {
      return 'Username must be at least 3 characters'
    }
    if (await usernameExists(value)) {
      return 'Username already taken'
    }
    return true
  },
})
```

### Confirmation

```typescript
import { promptConfirm } from '@/shared-prompts'

const confirmed = await promptConfirm({
  message: 'Deploy to production?',
  default: false,
})

if (confirmed) {
  await deploy()
}
```

### List Selection

```typescript
import { promptList } from '@/shared-prompts'

// Simple list
const color = await promptList({
  message: 'Choose a color:',
  choices: ['red', 'green', 'blue'],
})

// With labels and values
const framework = await promptList({
  message: 'Select framework:',
  choices: [
    { name: 'React', value: 'react' },
    { name: 'Vue', value: 'vue' },
    { name: 'Angular', value: 'angular' },
  ],
})

// Searchable (large lists)
const country = await promptList({
  message: 'Select country:',
  choices: countries,
  searchable: true,
})
```

### Multi-Select

```typescript
import { promptMultiSelect } from '@/shared-prompts'

const features = await promptMultiSelect({
  message: 'Select features to enable:',
  choices: [
    { name: 'Authentication', value: 'auth', checked: true },
    { name: 'Database', value: 'db' },
    { name: 'Caching', value: 'cache' },
    { name: 'Email', value: 'email', disabled: 'Coming soon' },
  ],
  min: 1, // Require at least one selection
})

console.log(`Selected: ${features.join(', ')}`)
```

### Number Input

```typescript
import { promptNumber } from '@/shared-prompts'

const port = await promptNumber({
  message: 'Enter port number:',
  default: 3000,
  min: 1024,
  max: 65535,
})

const workers = await promptNumber({
  message: 'Number of workers:',
  default: 4,
  min: 1,
  step: 1,
})
```

### Password Input

```typescript
import { promptPassword } from '@/shared-prompts'
import { z } from 'zod'

const password = await promptPassword({
  message: 'Enter password:',
  mask: '*',
  schema: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
})
```

### Common Confirmation Patterns

```typescript
import {
  confirmDestruction,
  confirmOverwrite,
  confirmWarning,
  confirmProduction,
  confirmRetry,
} from '@/shared-prompts'

// Delete confirmation
if (await confirmDestruction('database')) {
  await deleteDatabase()
}

// Overwrite file
if (await confirmOverwrite('./config.json')) {
  await writeFile('./config.json', data)
}

// Warning before risky operation
if (await confirmWarning('This will modify production data')) {
  await modifyData()
}

// Production deployment
if (await confirmProduction()) {
  await deployToProduction()
}

// Retry after failure
try {
  await riskyOperation()
} catch (error) {
  if (await confirmRetry('Operation', error.message)) {
    await riskyOperation()
  }
}
```

### Prompt Builder (Chaining)

```typescript
import { createPromptBuilder } from '@/shared-prompts'

interface ProjectConfig {
  name: string
  language: 'typescript' | 'javascript'
  testing: boolean
  features: string[]
}

const answers = await createPromptBuilder<ProjectConfig>()
  .text('name', 'Project name:', {
    validate: value => value.length > 0 || 'Name is required',
  })
  .list('language', 'Programming language:', [
    { name: 'TypeScript', value: 'typescript' },
    { name: 'JavaScript', value: 'javascript' },
  ])
  .confirm('testing', 'Include testing?', {
    default: true,
  })
  .checkbox('features', 'Select features:', [
    { name: 'Linting', value: 'lint' },
    { name: 'Formatting', value: 'format' },
    { name: 'Git hooks', value: 'hooks' },
  ], {
    when: answers => answers.testing === true,
  })
  .run()

console.log(answers.name) // Type-safe!
```

## Advanced Examples

### Conditional Prompts

```typescript
const answers = await createPromptBuilder()
  .confirm('useDatabase', 'Use database?')
  .list('dbType', 'Database type:', ['postgresql', 'mysql', 'sqlite'], {
    when: answers => answers.useDatabase,
  })
  .text('dbHost', 'Database host:', {
    when: answers => answers.useDatabase && answers.dbType !== 'sqlite',
    default: 'localhost',
  })
  .run()
```

### Interactive Wizard

```typescript
async function setupProject() {
  console.log('📦 Project Setup Wizard\n')

  // Step 1: Basic info
  const name = await promptText({
    message: 'Project name:',
    validate: value => value.length > 0 || 'Required',
  })

  const description = await promptText({
    message: 'Description:',
  })

  // Step 2: Technology selection
  const framework = await promptList({
    message: 'Select framework:',
    choices: [
      { name: 'React', value: 'react' },
      { name: 'Vue', value: 'vue' },
      { name: 'Angular', value: 'angular' },
    ],
  })

  // Step 3: Features
  const features = await promptMultiSelect({
    message: 'Select features:',
    choices: [
      { name: 'TypeScript', value: 'ts', checked: true },
      { name: 'ESLint', value: 'eslint', checked: true },
      { name: 'Prettier', value: 'prettier', checked: true },
      { name: 'Testing', value: 'test' },
      { name: 'CI/CD', value: 'ci' },
    ],
  })

  // Step 4: Confirmation
  console.log('\nConfiguration:')
  console.log(`  Name: ${name}`)
  console.log(`  Framework: ${framework}`)
  console.log(`  Features: ${features.join(', ')}`)

  const confirmed = await promptConfirm({
    message: 'Create project?',
    default: true,
  })

  if (confirmed) {
    await createProject({ name, description, framework, features })
  }
}
```

### Validation with Retry

```typescript
async function promptWithRetry<T>(
  promptFn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await promptFn()
    } catch (error) {
      if (attempt < maxAttempts) {
        const retry = await confirmRetry(
          'Input',
          `Attempt ${attempt} of ${maxAttempts}`
        )
        if (!retry) {
          return null
        }
      } else {
        console.error('Max attempts reached')
        return null
      }
    }
  }
  return null
}

const apiKey = await promptWithRetry(() =>
  promptPassword({
    message: 'Enter API key:',
    validate: async key => {
      const valid = await validateApiKey(key)
      return valid || 'Invalid API key'
    },
  })
)
```

## Best Practices

1. **Always validate** - Use Zod schemas or custom validation
2. **Provide defaults** - Make prompts optional when possible
3. **Clear messages** - Be specific about what you're asking
4. **Confirm destructive actions** - Always confirm before delete/overwrite
5. **Use appropriate types** - Number prompts for numbers, not text
6. **Handle errors** - Catch validation errors gracefully
7. **Conditional prompts** - Skip irrelevant prompts with `when`

## ADHD/OCD Benefits

- **Predictable** - Consistent prompt patterns
- **Validated** - Catch errors before proceeding
- **Clear** - Explicit confirmation for risky actions
- **Flexible** - Skip irrelevant questions
- **Safe** - No accidental destructive operations

## API Reference

### Prompt Functions
- `promptText(options)` - Text input
- `promptConfirm(options)` - Yes/no confirmation
- `promptList(options)` - Single selection from list
- `promptMultiSelect(options)` - Multiple selections
- `promptNumber(options)` - Numeric input
- `promptPassword(options)` - Masked password input
- `promptEditor(options)` - Multi-line text editor

### Confirmation Helpers
- `confirmDestruction(name, options?)` - Delete confirmation
- `confirmOverwrite(filepath, options?)` - File overwrite
- `confirmWarning(message, options?)` - Warning confirmation
- `confirmExit(message?)` - Exit confirmation
- `confirmProduction(env?)` - Production deployment
- `confirmRetry(action, error)` - Retry after failure

### Builder
- `createPromptBuilder<T>()` - Create fluent builder
- `.text(name, message, options?)` - Add text prompt
- `.confirm(name, message, options?)` - Add confirmation
- `.list(name, message, choices, options?)` - Add list
- `.checkbox(name, message, choices, options?)` - Add multi-select
- `.number(name, message, options?)` - Add number input
- `.password(name, message, options?)` - Add password input
- `.editor(name, message, options?)` - Add editor
- `.run()` - Execute prompts

All prompts support:
- `message` - Question to display
- `default` - Default value
- `validate` - Validation function
- `when` - Conditional display
- `schema` - Zod schema validation (where applicable)
