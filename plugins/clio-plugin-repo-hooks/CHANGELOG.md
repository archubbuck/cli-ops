# @cli-ops/clio-plugin-repo-hooks

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

### Patch Changes

- Updated dependencies [156f244]
- Updated dependencies [0ec5ca1]
  - @cli-ops/shared-plugins@4.0.0
  - @cli-ops/clio-plugin-repo@4.0.0
  - @cli-ops/clio@2.0.0
  - @cli-ops/shared-commands@2.0.0
  - @cli-ops/shared-logger@2.0.0
  - @cli-ops/shared-prompts@2.0.0
  - @cli-ops/shared-types@2.0.0
  - @cli-ops/shared-ui@2.0.0
