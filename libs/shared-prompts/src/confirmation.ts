import { promptConfirm } from './prompts.js'

/**
 * Common confirmation patterns
 */

/**
 * Confirm before destructive action
 */
export async function confirmDestruction(
  resourceName: string,
  options: { force?: boolean } = {}
): Promise<boolean> {
  if (options.force) {
    return true
  }

  return promptConfirm({
    message: `Are you sure you want to delete ${resourceName}? This cannot be undone.`,
    default: false,
  })
}

/**
 * Confirm overwrite of existing file
 */
export async function confirmOverwrite(
  filepath: string,
  options: { force?: boolean } = {}
): Promise<boolean> {
  if (options.force) {
    return true
  }

  return promptConfirm({
    message: `File ${filepath} already exists. Overwrite?`,
    default: false,
  })
}

/**
 * Confirm continuation after warning
 */
export async function confirmWarning(
  warning: string,
  options: { defaultYes?: boolean } = {}
): Promise<boolean> {
  return promptConfirm({
    message: `${warning} Continue?`,
    default: options.defaultYes ?? false,
  })
}

/**
 * Confirm exit/cancel operation
 */
export async function confirmExit(
  message: string = 'Are you sure you want to exit?'
): Promise<boolean> {
  return promptConfirm({
    message,
    default: false,
  })
}

/**
 * Confirm production deployment
 */
export async function confirmProduction(
  environment: string = 'production'
): Promise<boolean> {
  return promptConfirm({
    message: `You are about to deploy to ${environment}. Continue?`,
    default: false,
  })
}

/**
 * Retry prompt after failure
 */
export async function confirmRetry(
  action: string,
  error: string
): Promise<boolean> {
  return promptConfirm({
    message: `${action} failed: ${error}. Retry?`,
    default: true,
  })
}
