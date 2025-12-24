import inquirer from 'inquirer'
import type { ZodSchema } from 'zod'

/**
 * Base prompt options
 */
export interface BasePromptOptions {
  /**
   * The question to ask
   */
  message: string

  /**
   * Default value
   */
  default?: unknown

  /**
   * Zod schema for validation
   */
  schema?: ZodSchema

  /**
   * Custom validation function
   */
  validate?: (value: unknown) => boolean | string | Promise<boolean | string>

  /**
   * Transform value before returning
   */
  transform?: (value: unknown) => unknown

  /**
   * When to prompt (false = skip)
   */
  when?: boolean | ((answers: Record<string, unknown>) => boolean | Promise<boolean>)
}

/**
 * Text input prompt
 */
export interface TextPromptOptions extends BasePromptOptions {
  /**
   * Placeholder text
   */
  placeholder?: string
}

/**
 * Confirm (yes/no) prompt options
 */
export interface ConfirmPromptOptions extends BasePromptOptions {
  default?: boolean
}

/**
 * List selection prompt options
 */
export interface ListPromptOptions<T = string> extends BasePromptOptions {
  /**
   * Choices to select from
   */
  choices: Array<T | { name: string; value: T; disabled?: boolean | string }>

  /**
   * Enable search/filter
   * @default false
   */
  searchable?: boolean
}

/**
 * Multi-select prompt options
 */
export interface MultiSelectPromptOptions<T = string> extends BasePromptOptions {
  /**
   * Choices to select from
   */
  choices: Array<T | { name: string; value: T; checked?: boolean; disabled?: boolean | string }>

  /**
   * Minimum selections required
   */
  min?: number

  /**
   * Maximum selections allowed
   */
  max?: number
}

/**
 * Number input prompt options
 */
export interface NumberPromptOptions extends BasePromptOptions {
  /**
   * Minimum value
   */
  min?: number

  /**
   * Maximum value
   */
  max?: number

  /**
   * Step increment
   */
  step?: number
}

/**
 * Password input prompt options
 */
export interface PasswordPromptOptions extends BasePromptOptions {
  /**
   * Mask character
   * @default '*'
   */
  mask?: string
}

/**
 * Prompt for text input
 */
export async function promptText(
  options: TextPromptOptions
): Promise<string> {
  const { message, default: defaultValue, schema, validate, transform, when } = options

  const answer = await inquirer.prompt<{ value: string }>([
    {
      type: 'input',
      name: 'value',
      message,
      default: defaultValue,
      validate: async (input: string) => {
        // Schema validation
        if (schema) {
          const result = schema.safeParse(input)
          if (!result.success) {
            return result.error.errors[0]?.message || 'Invalid input'
          }
        }

        // Custom validation
        if (validate) {
          return await validate(input)
        }

        return true
      },
      when,
    },
  ])

  let result = answer.value

  if (transform) {
    result = transform(result) as string
  }

  return result
}

/**
 * Prompt for confirmation
 */
export async function promptConfirm(
  options: ConfirmPromptOptions
): Promise<boolean> {
  const { message, default: defaultValue = false, when } = options

  const answer = await inquirer.prompt<{ value: boolean }>([
    {
      type: 'confirm',
      name: 'value',
      message,
      default: defaultValue,
      when,
    },
  ])

  return answer.value
}

/**
 * Prompt for list selection
 */
export async function promptList<T = string>(
  options: ListPromptOptions<T>
): Promise<T> {
  const { message, choices, default: defaultValue, when, searchable = false } = options

  const answer = await inquirer.prompt<{ value: T }>([
    {
      type: searchable ? 'search-list' : 'list',
      name: 'value',
      message,
      choices: choices as any,
      default: defaultValue,
      when,
    },
  ])

  return answer.value
}

/**
 * Prompt for multiple selections
 */
export async function promptMultiSelect<T = string>(
  options: MultiSelectPromptOptions<T>
): Promise<T[]> {
  const { message, choices, min, max, when, validate } = options

  const answer = await inquirer.prompt<{ value: T[] }>([
    {
      type: 'checkbox',
      name: 'value',
      message,
      choices: choices as any,
      validate: async (input: T[]) => {
        if (min !== undefined && input.length < min) {
          return `Select at least ${min} options`
        }

        if (max !== undefined && input.length > max) {
          return `Select at most ${max} options`
        }

        if (validate) {
          return await validate(input)
        }

        return true
      },
      when,
    },
  ])

  return answer.value
}

/**
 * Prompt for number input
 */
export async function promptNumber(
  options: NumberPromptOptions
): Promise<number> {
  const { message, default: defaultValue, min, max, step, when } = options

  const answer = await inquirer.prompt<{ value: number }>([
    {
      type: 'number',
      name: 'value',
      message,
      default: defaultValue,
      validate: (input: number) => {
        if (isNaN(input)) {
          return 'Please enter a valid number'
        }

        if (min !== undefined && input < min) {
          return `Number must be at least ${min}`
        }

        if (max !== undefined && input > max) {
          return `Number must be at most ${max}`
        }

        return true
      },
      when,
    },
  ])

  return answer.value
}

/**
 * Prompt for password input
 */
export async function promptPassword(
  options: PasswordPromptOptions
): Promise<string> {
  const { message, mask = '*', validate, schema, when } = options

  const answer = await inquirer.prompt<{ value: string }>([
    {
      type: 'password',
      name: 'value',
      message,
      mask,
      validate: async (input: string) => {
        if (schema) {
          const result = schema.safeParse(input)
          if (!result.success) {
            return result.error.errors[0]?.message || 'Invalid password'
          }
        }

        if (validate) {
          return await validate(input)
        }

        return true
      },
      when,
    },
  ])

  return answer.value
}

/**
 * Prompt for editor input (multi-line)
 */
export async function promptEditor(
  options: TextPromptOptions
): Promise<string> {
  const { message, default: defaultValue, validate, when } = options

  const answer = await inquirer.prompt<{ value: string }>([
    {
      type: 'editor',
      name: 'value',
      message,
      default: defaultValue,
      validate,
      when,
    },
  ])

  return answer.value
}
