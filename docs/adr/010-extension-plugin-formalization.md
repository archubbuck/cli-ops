---
sidebar_position: 10
sidebar_label: 'ADR-010: Extension Formalization'
title: 'ADR-010: Extension Plugin Formalization'
description: 'Decision to formalize extension plugins with type-safe hooks, validation, and explicit parent-child relationships'
---

# ADR-010: Extension Plugin Formalization

**Status**: Accepted  
**Date**: 2025-12-28  
**Supersedes**: Partial aspects of ADR-009

## Context

In ADR-009, we established a plugin-first architecture using oclif's plugin system. Extensions were implemented as plugins that depend on "parent" plugins, using a naming convention (`@cli-ops/clio-plugin-{parent}-{feature}`) and nested directory structure (`plugins/{parent}/src/extensions/{extension}/`).

While functional, this approach had several limitations:

1. **Implicit relationships**: Parent-extension relationships were only documented in naming and directory structure, not enforced
2. **Weak type safety**: Event-based communication lacked TypeScript type safety for payloads
3. **No execution guarantees**: Events fire asynchronously without order guarantees
4. **Hidden extension points**: Parent plugins didn't formally declare what extension points were available
5. **Build complexity**: Nested extensions required special build configuration
6. **Discovery challenges**: Finding extensions for a plugin required manual npm searches

## Decision

We formalize the extension plugin architecture with the following changes:

### 1. Top-Level Extension Plugins

**Change**: Move extensions from `plugins/{parent}/src/extensions/{extension}/` to `plugins/{extension}/`

**Rationale**:

- Treats extensions as first-class workspace packages
- Simplifies monorepo build configuration (no special-casing needed)
- Makes dependency relationships explicit in workspace structure
- Aligns with standard monorepo patterns

### 2. BaseExtensionPlugin Class

**Change**: Create `BaseExtensionPlugin` extending `BasePlugin` with:

- `registerExtension(parentName: string)` - Explicit parent registration with validation
- `getParentPlugin<T>()` - Type-safe parent plugin access
- `registerHook<T>(hookName, handler)` - Type-safe hook registration

**Rationale**:

- Makes parent-extension relationship explicit in code
- Provides type-safe API for extension development
- Validates parent plugin is loaded before registration
- Enables compile-time type checking for parent APIs

### 3. Hook System

**Change**: Add formal hook system to BasePlugin:

- `defineExtensionHook(name)` - Declares available extension points
- `callExtensionHook<T>(name, data)` - Invokes registered hooks sequentially
- Internal registry tracking handlers per hook

**Rationale**:

- **Type safety**: Hooks can have TypeScript type parameters for data
- **Sequential execution**: Hooks execute in registration order, fully awaited
- **Formal contracts**: Parent plugins explicitly declare extension points
- **Validation**: System can verify declared hooks exist on parent
- **Better DX**: IDE autocomplete works for hook names and data shapes

### 4. Extension Metadata

**Change**: Require `clio.extension` field in extension package.json:

```json
{
  "clio": {
    "extension": {
      "parent": "@cli-ops/clio-plugin-tasks",
      "hooks": ["task:beforeCreate", "task:afterCreate"]
    }
  }
}
```

**Rationale**:

- Enables runtime discovery without installing all plugins
- Documents what hooks the extension uses
- Allows validation that declared hooks exist on parent
- Makes metadata queryable via npm registry

### 5. Runtime Validation

**Change**: Enhance PluginManager to:

- Detect extension plugins via naming pattern
- Read `clio.extension.parent` metadata
- Validate parent plugin is loaded
- Track extensions per parent for discovery
- Warn if declared hooks don't exist

**Rationale**:

- Prevents cryptic runtime errors ("parent not found")
- Provides actionable error messages (how to fix)
- Enables `clio plugins:extensions` discovery command
- Catches configuration errors early

### 6. Backward Compatibility

**Change**: Keep event-based communication alongside hooks

**Rationale**:

- Doesn't break existing extensions immediately
- Allows gradual migration to hooks
- Events useful for fire-and-forget notifications
- Hooks required for sequential, validated operations

**Deprecation Plan**:

- v3.0: Introduce hooks, keep events (recommended: use hooks)
- v4.0: Deprecate events (warnings emitted)
- v5.0: Remove event-based extension communication

## Consequences

### Positive

✅ **Type Safety**: Extensions get TypeScript types for hook data payloads  
✅ **Explicit Contracts**: Parent plugins document available hooks in code and READMEs  
✅ **Sequential Execution**: Hook handlers execute in order, with await support  
✅ **Better Discovery**: `clio plugins:extensions` shows what's available  
✅ **Validation**: Automatic checks for parent dependencies and hook compatibility  
✅ **Simpler Builds**: No special-casing for nested extensions  
✅ **Better Tooling**: IDE autocomplete works for hooks and parent APIs

### Negative

⚠️ **Breaking Change**: Existing extensions must migrate (but we have v3.0 for this)  
⚠️ **Migration Required**: Users must reinstall extensions after upgrade  
⚠️ **More Boilerplate**: Extensions must call `registerExtension()` explicitly  
⚠️ **Learning Curve**: Developers must understand hooks vs events

### Neutral

- Event system maintained for backward compatibility (added complexity)
- Extensions still follow naming convention (unchanged)
- Extensions still declare parent in peerDependencies (unchanged)

## Implementation

### Core Infrastructure

1. **BaseExtensionPlugin** ([libs/shared-plugins/src/base-extension-plugin.ts](../../libs/shared-plugins/src/base-extension-plugin.ts))
   - Extends BasePlugin
   - Provides `registerExtension()`, `getParentPlugin()`, `registerHook()`
   - Validates parent plugin loaded

2. **BasePlugin Enhancements** ([libs/shared-plugins/src/base-plugin.ts](../../libs/shared-plugins/src/base-plugin.ts))
   - Adds `defineExtensionHook()`, `callExtensionHook()`
   - Maintains hook registry with sequential execution
   - Validates hooks are defined before registration

3. **PluginManager Enhancements** ([libs/shared-plugins/src/plugin-manager.ts](../../libs/shared-plugins/src/plugin-manager.ts))
   - Reads `clio.extension.parent` from package.json
   - Validates parent plugin loaded
   - Tracks extensions per parent
   - Validates declared hooks exist

### Tooling

1. **Extension Discovery Command** ([apps/clio/src/commands/plugins/extensions.ts](../../apps/clio/src/commands/plugins/extensions.ts))
   - Lists extensions for a plugin
   - Shows installation status
   - Displays declared hooks

2. **Validation Script** ([scripts/validate-extensions.js](../../scripts/validate-extensions.js))
   - Validates extension metadata
   - Checks naming conventions
   - Ensures no extension-to-extension dependencies
   - Verifies hooks exist on parent

### Extension Examples

- **[@cli-ops/clio-plugin-tasks-jira](../../plugins/clio-plugin-tasks-jira)** - Jira integration via hooks
- **[@cli-ops/clio-plugin-fetch-oauth](../../plugins/clio-plugin-fetch-oauth)** - OAuth 2.0 via hooks
- **[@cli-ops/clio-plugin-repo-hooks](../../plugins/clio-plugin-repo-hooks)** - Git hooks automation

## Comparison: Hooks vs Events

| Aspect              | Hooks (v3.0+)                | Events (v2.x, legacy)   |
| ------------------- | ---------------------------- | ----------------------- |
| **Type Safety**     | ✅ TypeScript generics       | ❌ `unknown` payload    |
| **Execution Order** | ✅ Sequential, awaited       | ❌ Unordered, async     |
| **Validation**      | ✅ Hooks must be defined     | ❌ Any event name works |
| **Use Case**        | Modify data, validate, chain | Notify, fire-and-forget |
| **Documentation**   | ✅ Formal API contract       | ❌ Implicit convention  |

**When to Use Each:**

- **Hooks**: When extension needs to modify data, validate, or ensure order
- **Events**: When extension only needs to be notified (logging, metrics)

**Recommendation**: New extensions should use hooks. Events maintained for backward compatibility only.

## Migration Guide

### For Extension Developers

1. **Move to top-level** (if nested):

   ```bash
   mv plugins/clio-plugin-tasks/src/extensions/clio-plugin-tasks-jira \
      plugins/clio-plugin-tasks-jira
   ```

2. **Update package.json**:

   ```json
   {
     "clio": {
       "extension": {
         "parent": "@cli-ops/clio-plugin-tasks",
         "hooks": ["task:beforeCreate", "task:afterCreate"]
       }
     }
   }
   ```

3. **Update plugin class**:

   ```typescript
   // Change import
   import { BaseExtensionPlugin } from '@cli-ops/shared-plugins'

   // Extend BaseExtensionPlugin
   export class JiraPlugin extends BaseExtensionPlugin {
     async init() {
       // Register with parent
       await this.registerExtension('@cli-ops/clio-plugin-tasks')

       // Use hooks (new primary API)
       this.registerHook('task:afterCreate', this.syncToJira.bind(this))

       // Events still work (legacy)
       this.on('task:created', this.handleTaskCreated.bind(this))
     }
   }
   ```

### For Parent Plugin Developers

1. **Define hooks** in plugin class:

   ```typescript
   export class TasksPlugin extends BasePlugin {
     async init() {
       this.defineExtensionHook('task:beforeCreate')
       this.defineExtensionHook('task:afterCreate')
     }
   }
   ```

2. **Call hooks** at extension points:

   ```typescript
   async createTask(data: TaskData) {
     await this.callExtensionHook('task:beforeCreate', data)
     const task = await this.storage.create(data)
     await this.callExtensionHook('task:afterCreate', task)
     // Keep events for backward compatibility
     this.emit('task:created', task)
     return task
   }
   ```

3. **Document hooks** in README:
   - List all available hooks
   - Document when each hook fires
   - Show TypeScript types for data
   - Provide example usage

### For End Users

1. **Upgrade plugins**:

   ```bash
   clio plugins:update
   ```

2. **Reinstall extensions**:

   ```bash
   # Extensions moved to top-level npm packages
   clio plugins:install @cli-ops/clio-plugin-tasks-jira
   ```

3. **Discover extensions**:
   ```bash
   clio plugins:extensions @cli-ops/clio-plugin-tasks
   ```

## References

- ADR-009: Plugin System Architecture
- [BaseExtensionPlugin Implementation](../../libs/shared-plugins/src/base-extension-plugin.ts)
- [Hook System Design](../../libs/shared-plugins/src/base-plugin.ts)
- [Extension Validation](../../scripts/validate-extensions.js)
- [Changesets: v3.0.0 Breaking Changes](../../.changeset/extension-plugin-refactor-v3.md)
