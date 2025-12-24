/**
 * Common types used across the workspace
 */

/**
 * Make all properties in T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Make all properties in T required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

/**
 * Extract keys of T where value type matches U
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

/**
 * Make specific properties K of T optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Make specific properties K of T required
 */
export type Required<T, K extends keyof T> = T & {
  [P in K]-?: T[P]
}

/**
 * Ensure object has at least one property
 */
export type AtLeastOne<T> = {
  [K in keyof T]: Pick<T, K> & Partial<Omit<T, K>>
}[keyof T]

/**
 * JSON primitive types
 */
export type JSONPrimitive = string | number | boolean | null

/**
 * JSON value types
 */
export type JSONValue =
  | JSONPrimitive
  | JSONValue[]
  | { [key: string]: JSONValue }

/**
 * JSON object type
 */
export type JSONObject = { [key: string]: JSONValue }

/**
 * Async or sync value
 */
export type MaybePromise<T> = T | Promise<T>

/**
 * Nullable value
 */
export type Nullable<T> = T | null

/**
 * Optional value
 */
export type Maybe<T> = T | undefined

/**
 * Function that may throw
 */
export type Fallible<T> = () => T | never

/**
 * Result type for operations
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

/**
 * Constructor type
 */
export type Constructor<T = unknown> = new (...args: unknown[]) => T

/**
 * Abstract constructor type
 */
export type AbstractConstructor<T = unknown> = abstract new (
  ...args: unknown[]
) => T

/**
 * Mixin type
 */
export type Mixin<T = object> = Constructor<T> | AbstractConstructor<T>

/**
 * Class decorator
 */
export type ClassDecorator<T = unknown> = (target: Constructor<T>) => void

/**
 * Method decorator
 */
export type MethodDecorator<T = unknown> = (
  target: T,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) => void

/**
 * Property decorator
 */
export type PropertyDecorator<T = unknown> = (
  target: T,
  propertyKey: string | symbol
) => void
