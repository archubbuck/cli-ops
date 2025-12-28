/**
 * YAML formatting utilities
 * 
 * Note: This is a basic implementation. For production use,
 * consider adding 'yaml' package as dependency.
 */

export interface YAMLFormatOptions {
  /**
   * Indentation spaces
   * @default 2
   */
  indent?: number

  /**
   * Include document separator (---)
   * @default false
   */
  documentSeparator?: boolean
}

/**
 * Format data as YAML (basic implementation)
 */
export function formatYAML(
  data: unknown,
  options: YAMLFormatOptions = {}
): string {
  const { indent = 2, documentSeparator = false } = options

  const yaml = toYAML(data, 0, indent)
  
  if (documentSeparator) {
    return `---\n${yaml}`
  }

  return yaml
}

/**
 * Convert value to YAML string
 */
function toYAML(data: unknown, depth: number, indent: number): string {
  const indentStr = ' '.repeat(depth * indent)

  if (data === null || data === undefined) {
    return 'null'
  }

  if (typeof data === 'string') {
    // Quote strings with special characters
    if (
      data.includes(':') ||
      data.includes('#') ||
      data.includes('\n') ||
      data.startsWith(' ') ||
      data.endsWith(' ')
    ) {
      return `"${data.replace(/"/g, '\\"')}"`
    }
    return data
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return String(data)
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return '[]'
    }

    return data
      .map(item => {
        const value = toYAML(item, depth + 1, indent)
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          // Complex object in array
          const itemYaml = toYAML(item, depth + 1, indent)
          return `${indentStr}- ${itemYaml.trimStart()}`
        }
        return `${indentStr}- ${value}`
      })
      .join('\n')
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>)
    
    if (entries.length === 0) {
      return '{}'
    }

    return entries
      .map(([key, value]) => {
        const yamlValue = toYAML(value, depth + 1, indent)
        
        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return `${indentStr}${key}: []`
            }
            return `${indentStr}${key}:\n${yamlValue}`
          }
          // Nested object
          if (Object.keys(value).length === 0) {
            return `${indentStr}${key}: {}`
          }
          return `${indentStr}${key}:\n${yamlValue}`
        }

        return `${indentStr}${key}: ${yamlValue}`
      })
      .join('\n')
  }

  return String(data)
}

/**
 * Basic YAML parser (for simple structures)
 */
export function parseYAML<T = unknown>(yaml: string): T {
  // This is a very basic implementation
  // For production, use 'yaml' package
  
  // Remove document separator
  let content = yaml.replace(/^---\n/, '')
  
  // Remove comments
  content = content.replace(/#.*$/gm, '')
  
  // Very basic parsing - just convert to JSON-like structure
  // This won't handle all YAML features
  
  throw new Error(
    'Basic YAML parser not implemented. ' +
    'Please add "yaml" package for full YAML support.'
  )
}
