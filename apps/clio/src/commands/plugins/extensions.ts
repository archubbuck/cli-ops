import { BaseCommand } from '@cli-ops/shared-commands'
import { SUCCESS } from '@cli-ops/shared-exit-codes'
import { formatTable } from '@cli-ops/shared-formatter'
import { getPluginManager } from '@cli-ops/shared-plugins'
import { Args } from '@oclif/core'

interface IExtensionInfo {
  name: string
  version: string
  parent: string
  hooks: string[]
  installed: boolean
  description?: string
}

export default class PluginsExtensions extends BaseCommand {
  static override description = 'List available extensions for a plugin'

  static override examples = [
    '<%= config.bin %> <%= command.id %> @cli-ops/clio-plugin-tasks',
    '<%= config.bin %> <%= command.id %>',
  ]

  static override args = {
    plugin: Args.string({
      description: 'Plugin name to list extensions for',
      required: false,
    }),
  }

  protected async execute(): Promise<void> {
    const { args } = await this.parse(PluginsExtensions)

    if (args.plugin) {
      // List extensions for specific plugin
      await this.listExtensionsForPlugin(args.plugin)
    } else {
      // List all extensions grouped by parent
      await this.listAllExtensions()
    }

    return this.exit(SUCCESS)
  }

  private async listExtensionsForPlugin(pluginName: string): Promise<void> {
    const pluginManager = getPluginManager()
    // Check if plugin is loaded
    if (!pluginManager.isPluginLoaded(pluginName)) {
      this.warn(`Plugin '${pluginName}' is not currently loaded`)
      this.log(`\nTo install: clio plugins:install ${pluginName}`)
      return
    }

    // Get extensions for this plugin
    const extensions = pluginManager.getExtensions(pluginName)

    if (extensions.length === 0) {
      this.log(`\nNo extensions found for '${pluginName}'`)
      this.log(`\nAvailable extensions can be discovered by searching npm:`)
      this.log(`  npm search ${pluginName.split('/')[1]}-`)
      return
    }

    // Get detailed info for each extension
    const extensionInfos = await this.getExtensionInfos(extensions)

    this.log(`\nExtensions for ${pluginName}:\n`)

    const tableData = extensionInfos.map((ext) => ({
      name: ext.name,
      version: ext.version,
      installed: ext.installed ? '✓' : '✗',
      hooks: ext.hooks.length.toString(),
      description: ext.description || '',
    }))

    this.log(formatTable(tableData))

    // Show installation instructions for uninstalled extensions
    const uninstalled = extensionInfos.filter((ext) => !ext.installed)
    if (uninstalled.length > 0) {
      this.log(`\nTo install an extension:`)
      for (const ext of uninstalled) {
        this.log(`  clio plugins:install ${ext.name}`)
      }
    }

    // Show hook details
    this.log(`\n💡 Extension Hooks:`)
    for (const ext of extensionInfos) {
      if (ext.hooks.length > 0) {
        this.log(`\n${ext.name}:`)
        for (const hook of ext.hooks) {
          this.log(`  • ${hook}`)
        }
      }
    }
  }

  private async listAllExtensions(): Promise<void> {
    const pluginManager = getPluginManager()
    const loadedPlugins = pluginManager.getLoadedPlugins()

    // Find all base plugins (non-extensions)
    const basePlugins = Array.from(loadedPlugins.keys()).filter(
      (name) => !this.isExtensionPlugin(name),
    )

    if (basePlugins.length === 0) {
      this.log('No base plugins loaded')
      return
    }

    this.log('\n📦 Plugin Extensions Overview:\n')

    for (const pluginName of basePlugins) {
      const extensions = pluginManager.getExtensions(pluginName)
      const extensionInfos = await this.getExtensionInfos(extensions)

      this.log(`${pluginName}`)
      if (extensionInfos.length === 0) {
        this.log(`  No extensions`)
      } else {
        for (const ext of extensionInfos) {
          const status = ext.installed ? '✓' : '✗'
          this.log(`  ${status} ${ext.name} (${ext.version})`)
        }
      }
      this.log('')
    }

    this.log(`\nTo see details for a specific plugin:`)
    this.log(`  clio plugins:extensions <plugin-name>`)
  }

  private isExtensionPlugin(pluginName: string): boolean {
    // Extension plugins follow pattern: @cli-ops/clio-plugin-{parent}-{feature}
    const match = pluginName.match(/^@cli-ops\/(clio-plugin-[\w-]+)-([\w-]+)$/)
    return match !== null
  }

  private getExtensionInfos(extensionNames: string[]): IExtensionInfo[] {
    const pluginManager = getPluginManager()
    const infos: IExtensionInfo[] = []

    for (const extensionName of extensionNames) {
      const plugin = pluginManager.getPlugin(extensionName)
      const pjson = plugin?.pjson as Record<string, unknown>

      infos.push({
        name: extensionName,
        version: (pjson?.['version'] as string) || 'unknown',
        parent:
          ((
            (pjson?.['clio'] as Record<string, unknown>)?.['extension'] as Record<string, unknown>
          )?.['parent'] as string) || 'unknown',
        hooks:
          ((
            (pjson?.['clio'] as Record<string, unknown>)?.['extension'] as Record<string, unknown>
          )?.['hooks'] as string[]) || [],
        installed: pluginManager.isPluginLoaded(extensionName),
        description: pjson?.['description'] as string | undefined,
      })
    }

    return infos
  }
}
