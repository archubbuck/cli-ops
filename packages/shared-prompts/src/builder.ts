import inquirer from 'inquirer'

/**
 * Prompt builder for chaining multiple prompts
 */

export interface PromptDefinition {
  name: string
  type: string
  message: string
  [key: string]: unknown
}

export class PromptBuilder<T extends Record<string, unknown> = Record<string, unknown>> {
  private prompts: PromptDefinition[] = []

  /**
   * Add text input prompt
   */
  text(
    name: keyof T,
    message: string,
    options: {
      default?: string
      validate?: (value: string) => boolean | string | Promise<boolean | string>
      when?: (answers: Partial<T>) => boolean | Promise<boolean>
    } = {}
  ): this {
    this.prompts.push({
      type: 'input',
      name: name as string,
      message,
      ...options,
    })
    return this
  }

  /**
   * Add confirm prompt
   */
  confirm(
    name: keyof T,
    message: string,
    options: {
      default?: boolean
      when?: (answers: Partial<T>) => boolean | Promise<boolean>
    } = {}
  ): this {
    this.prompts.push({
      type: 'confirm',
      name: name as string,
      message,
      ...options,
    })
    return this
  }

  /**
   * Add list selection prompt
   */
  list<V = string>(
    name: keyof T,
    message: string,
    choices: Array<V | { name: string; value: V }>,
    options: {
      default?: V
      when?: (answers: Partial<T>) => boolean | Promise<boolean>
    } = {}
  ): this {
    this.prompts.push({
      type: 'list',
      name: name as string,
      message,
      choices,
      ...options,
    })
    return this
  }

  /**
   * Add checkbox (multi-select) prompt
   */
  checkbox<V = string>(
    name: keyof T,
    message: string,
    choices: Array<V | { name: string; value: V; checked?: boolean }>,
    options: {
      validate?: (value: V[]) => boolean | string | Promise<boolean | string>
      when?: (answers: Partial<T>) => boolean | Promise<boolean>
    } = {}
  ): this {
    this.prompts.push({
      type: 'checkbox',
      name: name as string,
      message,
      choices,
      ...options,
    })
    return this
  }

  /**
   * Add number input prompt
   */
  number(
    name: keyof T,
    message: string,
    options: {
      default?: number
      validate?: (value: number) => boolean | string | Promise<boolean | string>
      when?: (answers: Partial<T>) => boolean | Promise<boolean>
    } = {}
  ): this {
    this.prompts.push({
      type: 'number',
      name: name as string,
      message,
      ...options,
    })
    return this
  }

  /**
   * Add password input prompt
   */
  password(
    name: keyof T,
    message: string,
    options: {
      mask?: string
      validate?: (value: string) => boolean | string | Promise<boolean | string>
      when?: (answers: Partial<T>) => boolean | Promise<boolean>
    } = {}
  ): this {
    this.prompts.push({
      type: 'password',
      name: name as string,
      message,
      ...options,
    })
    return this
  }

  /**
   * Add editor (multi-line) prompt
   */
  editor(
    name: keyof T,
    message: string,
    options: {
      default?: string
      validate?: (value: string) => boolean | string | Promise<boolean | string>
      when?: (answers: Partial<T>) => boolean | Promise<boolean>
    } = {}
  ): this {
    this.prompts.push({
      type: 'editor',
      name: name as string,
      message,
      ...options,
    })
    return this
  }

  /**
   * Execute all prompts and return answers
   */
  async run(): Promise<T> {
    return await inquirer.prompt(this.prompts) as T
  }
}

/**
 * Create a new prompt builder
 */
export function createPromptBuilder<T extends Record<string, unknown> = Record<string, unknown>>(): PromptBuilder<T> {
  return new PromptBuilder<T>()
}
