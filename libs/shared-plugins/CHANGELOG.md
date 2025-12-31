# @cli-ops/shared-plugins

## 4.0.0

### Major Changes

- 156f244: **BREAKING CHANGE**: Extension plugins refactored to top-level architecture (v3.0.0)

  ## Major Changes

  ### Extension Plugin Architecture
  - **Extensions moved to top-level**: All extension plugins relocated from nested `plugins/*/src/extensions/*` to top-level `plugins/*` directories
  - **New BaseExtensionPlugin class**: Extensions now extend `BaseExtensionPlugin` with explicit parent registration
  - **Hook system introduced**: Type-safe, sequential hook execution for extension points
  - **Metadata-based discovery**: Extensions declare parent and hooks in `package.json` under `clio.extension`
  - **Runtime validation**: Parent plugin dependencies validated at load time

  ### For Extension Plugin Developers

  **Required Changes:**
  1. **Move extension to top-level**: Extension plugins must be installed at the same level as their parent
  2. **Update imports**: Change from `BasePlugin` to `BaseExtensionPlugin`
  3. **Register extension**: Call `await this.registerExtension(parentName)` in `init()`
  4. **Use hooks**: Replace event listeners with `this.registerHook()` for type safety
  5. **Add metadata**: Include `clio.extension.parent` and `clio.extension.hooks` in `package.json`

  **Example Migration:**

  ```typescript
  // Before (v2.x)
  import { BasePlugin } from '@cli-ops/shared-plugins'

  export class JiraPlugin extends BasePlugin {
    async init() {
      this.on('task:created', this.handleTaskCreated)
    }
  }

  // After (v3.0.0)
  import { BaseExtensionPlugin } from '@cli-ops/shared-plugins'

  export class JiraPlugin extends BaseExtensionPlugin {
    async init() {
      await this.registerExtension('@cli-ops/clio-plugin-tasks')
      this.registerHook('task:afterCreate', this.syncToJira)
      // Events still work for backward compatibility
      this.on('task:created', this.handleTaskCreated)
    }
  }
  ```

  ### For Base Plugin Developers

  **New Capabilities:**
  1. **Define hooks**: Call `this.defineExtensionHook(name)` to declare extension points
  2. **Call hooks**: Use `await this.callExtensionHook(name, data)` to execute extension handlers
  3. **Document hooks**: Add Extension API section to README

  **Example:**

  ```typescript
  export class TasksPlugin extends BasePlugin {
    async init() {
      this.defineExtensionHook('task:beforeCreate')
      this.defineExtensionHook('task:afterCreate')
    }

    async createTask(data: TaskData) {
      await this.callExtensionHook('task:beforeCreate', data)
      const task = await this.storage.create(data)
      await this.callExtensionHook('task:afterCreate', task)
      return task
    }
  }
  ```

  ### New Features
  - **Extension discovery command**: `clio plugins:extensions [PLUGIN]` lists available extensions
  - **Validation script**: `pnpm validate:extensions` validates extension metadata and dependencies
  - **Extension API documentation**: All base plugins now document their extension hooks

  ### Benefits
  - ✅ **Type safety**: Hooks provide TypeScript types for data payloads
  - ✅ **Sequential execution**: Hooks execute in order, awaited for async operations
  - ✅ **Explicit dependencies**: Extensions declare parent in both metadata and peerDependencies
  - ✅ **Better discovery**: Extensions can be found via `clio plugins:extensions`
  - ✅ **Validation**: Automatic validation of extension metadata and hook compatibility

  ### Migration Path
  1. Uninstall existing extension plugins
  2. Update to v3.0.0 of base plugins and `@cli-ops/shared-plugins`
  3. Reinstall extension plugins (now from top-level npm packages)
  4. Extension plugins will automatically use new architecture

  ### Backward Compatibility
  - Event-based communication still works (kept for compatibility)
  - Existing extensions will receive deprecation warnings
  - Full removal of legacy event system planned for v4.0.0

- 0ec5ca1: # 🎉 Initial Release - Plugin-First Architecture

  This is the initial stable release of Clio, a plugin-first CLI framework designed for building extensible command-line tools with exceptional user experience.

  ## 🚀 New Features

  ### Core CLI (`@cli-ops/clio`)
  - **Plugin Manager**: Built on oclif's plugin system for modular functionality
  - **Command History**: Track all commands with undo/redo support
  - **Configuration Management**: Unified config system across all plugins
  - **Diagnostic Tools**: `clio doctor` command for troubleshooting
  - **Built-in Task Management**: Task commands bundled by default

  ### Official Plugins
  - **`@cli-ops/clio-plugin-tasks`**: Task and todo management (bundled with clio)
  - **`@cli-ops/clio-plugin-fetch`**: HTTP client for API testing
  - **`@cli-ops/clio-plugin-repo`**: Git and GitHub integration tools

  ### Shared Packages

  Complete set of 15 shared packages providing:
  - Structured logging with multiple transports
  - Type-safe configuration management
  - Command history and undo system
  - Cross-plugin communication (IPC)
  - Exit code standardization
  - Interactive prompts and UI components
  - Plugin system abstractions
  - Testing utilities

  ### Meta Packages
  - **`@cli-ops/clio-meta-developer`**: Curated bundle for developers (tasks + fetch + repo)
  - **`@cli-ops/clio-meta-complete`**: Complete bundle with all plugins

  ## ✨ Key Highlights

  ### Plugin Architecture

  ```bash
  # Install only what you need
  npm install -g @cli-ops/clio

  # Add plugins on demand
  clio plugins:install @cli-ops/clio-plugin-fetch
  clio plugins:install @cli-ops/clio-plugin-repo
  ```

  ### Command History & Undo

  ```bash
  clio tasks:create "Important task"
  clio history:undo  # Oops, undo that!
  clio history:list  # View command history
  ```

  ### ADHD/OCD-Friendly UX
  - Clear visual hierarchy with consistent formatting
  - Undo capabilities for reversible operations
  - Helpful error messages with suggestions
  - Performance budgets: <200ms for common commands

  ### Developer Experience
  - **TypeScript-first** with strict mode enabled
  - **Monorepo structure** with Turborepo and pnpm workspaces
  - **Automated versioning** via Changesets
  - **CI/CD ready** with GitHub Actions
  - **Comprehensive testing** with Vitest

  ## 📦 Installation

  ```bash
  # Install clio globally
  npm install -g @cli-ops/clio

  # Or install with plugins
  npm install -g @cli-ops/clio-meta-developer

  # Verify installation
  clio --version
  clio --help
  ```

  ## 🏗️ Architecture

  Built as a monorepo with:
  - Core CLI manager (`@cli-ops/clio`)
  - 3 official plugins (tasks, fetch, repo)
  - 15 shared utility packages
  - 2 meta packages for different personas
  - Comprehensive documentation site

  All packages are scoped under `@cli-ops` on npm.

  ## 📚 Documentation
  - [Getting Started Guide](https://cli-ops.dev/docs/intro)
  - [Plugin Development](https://cli-ops.dev/docs/plugins/getting-started)
  - [Architecture Overview](https://cli-ops.dev/docs/architecture/overview)
  - [Contributing Guide](https://cli-ops.dev/docs/contributing/getting-started)

  ## 🎯 Performance

  Strict performance budgets enforced:
  - `--help`: <200ms
  - `--version`: <100ms
  - Simple commands: <500ms
  - Complex commands: <1000ms

  ## 🤝 Contributing

  We welcome contributions! See [CONTRIBUTING.md](https://github.com/archubbuck/cli-ops/blob/main/docs/CONTRIBUTING.md) for guidelines.

  ## 📄 License

  MIT License - See LICENSE file for details

### Patch Changes

- Updated dependencies [0ec5ca1]
  - @cli-ops/shared-core@2.0.0
  - @cli-ops/shared-ipc@2.0.0
  - @cli-ops/shared-logger@2.0.0
  - @cli-ops/shared-types@2.0.0
