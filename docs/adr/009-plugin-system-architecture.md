# ADR-009: Plugin System Architecture

**Status**: Accepted (Updated for clio architecture)  
**Date**: 2025-12-26 (Updated: 2025-01)  
**Decision Makers**: Architecture Team  
**Stakeholders**: CLI Users, Plugin Developers  

## Context

The CLI Ops workspace evolved from multi-CLI architecture to a unified plugin-first design with **clio** as the core plugin manager. Users need the ability to extend functionality through installable plugins without modifying the core, and plugins should be discoverable via npm under the `@cli-ops` organization.

### Requirements

1. **Plugin-First Design**: Core CLI + pluggable functionality
2. **Dynamic Loading**: Install/uninstall plugins at runtime via oclif
3. **Unified Binary**: Single `clio` command for all operations
4. **npm Distribution**: Scoped packages under `@cli-ops` organization
5. **Type Safety**: Full TypeScript support and shared type definitions
6. **Event Communication**: Plugins can communicate via shared event bus
7. **Simple Security Model**: Trust-based approach without complex sandboxing
8. **Developer Experience**: Easy to create, test, and publish plugins
9. **Workspace Integration**: Plugins can use all shared packages via path aliases
10. **Persona-Based Bundles**: Meta-packages for common user workflows

## Decision

We implement a plugin system with **clio** as the core plugin manager, built on **oclif v4** with **@oclif/plugin-plugins**, and custom enhancements via **@cli-ops/shared-plugins**.

### Architecture Components

#### 1. Core CLI (clio)

**Package**: `@cli-ops/clio`  
**Purpose**: Plugin manager and foundational CLI

**Responsibilities**:
- Plugin installation/management (`@oclif/plugin-plugins`)
- Configuration management (`config:get`, `config:set`, `config:list`)
- Command history (`history:list`)
- System diagnostics (`doctor`)
- Help and versioning (`@oclif/plugin-help`, `@oclif/plugin-version`)

**Bundled Plugin**: `@cli-ops/clio-plugin-tasks` (included by default)

#### 2. Plugin Infrastructure (Layer 6.5)

**Package**: `@cli-ops/shared-plugins`

**Components**:
- `PluginManager`: Discovery, validation, registration
- `BasePlugin`: Abstract base class for plugin implementations
- `BasePluginCommand`: Extended command class for plugin commands
- Plugin lifecycle hooks: `plugin:loaded`, `plugin:unloaded`

**Dependencies**:
```
@cli-ops/shared-plugins
  ├── @oclif/core (oclif framework)
  ├── @cli-ops/shared-types (type definitions)
  ├── @cli-ops/shared-ipc (event bus)
  ├── @cli-ops/shared-logger (logging)
  └── @cli-ops/shared-core (error classes)
```

#### 3. Plugin Directory Structure

**Unified Configuration**: `~/.config/clio/`  
**Plugin Storage**: Managed by oclif's plugin system

**Configuration Files**:
- `~/.config/clio/config.json` - Global configuration
- `~/.config/clio/plugins/*.json` - Plugin-specific settings
- `~/.local/share/clio/` - Data storage for plugins

**Rationale**: 
- Centralized configuration under clio
- Follows XDG Base Directory specification
- Simplifies plugin management and discovery

#### 4. Plugin Naming Convention

**Core Plugins**: `@cli-ops/clio-plugin-{name}`  
**Extension Plugins**: `@cli-ops/clio-plugin-{parent}-{feature}`

**Examples**:
- `@cli-ops/clio-plugin-tasks` - Task management (bundled)
- `@cli-ops/clio-plugin-fetch` - HTTP API client
- `@cli-ops/clio-plugin-repo` - Developer tools
- `@cli-ops/clio-plugin-tasks-jira` - Jira integration for tasks
- `@cli-ops/clio-plugin-fetch-oauth` - OAuth for fetch

**Rationale**:
- Scoped under `@cli-ops` organization
- Clear feature identification
- Easy discovery on npm
- Prevents naming conflicts with community packages
- Supports extensibility pattern (parent-feature)

#### 5. Plugin Management Commands

Via `@oclif/plugin-plugins`, clio automatically provides:
```bash
clio plugins                      # List installed plugins
clio plugins:install PKG          # Install plugin from npm
clio plugins:uninstall PKG        # Uninstall plugin
clio plugins:update               # Update all plugins
clio plugins:link PATH            # Link local plugin (development)
clio plugins:inspect PKG          # Show plugin details
```

#### 6. Event-Based Communication

Plugins use `@cli-ops/shared-ipc` event bus for communication:

```typescript
// Plugin A emits
this.emit('tasks:created', { id: 123 })

// Plugin B listens
this.on('tasks:created', (data) => {
  // React to task creation
})
```

**Standard Events**:
- `plugin:loaded` - Plugin initialized
- `plugin:unloaded` - Plugin destroyed
- Feature-specific events (tasks:*, fetch:*, repo:*, etc.)

#### 7. Configuration Integration

Plugins store settings in clio config under `plugins` namespace:

```json
{
  "version": "1.0.0",
  "clio": { /* global settings */ },
  "plugins": {
    "tasks": {
      "defaultFormat": "json"
    },
    "fetch": {
      "timeout": 30000
    },
    "repo": {
      "defaultBranch": "main"
    }
  }
}
```

#### 8. Meta-Packages for Persona-Based Installation

**Package Pattern**: `@cli-ops/clio-meta-{persona}`

**Purpose**: Bundles clio with curated plugin sets for specific user personas

**Examples**:
- `@cli-ops/clio-meta-developer` - clio + fetch + repo
- `@cli-ops/clio-meta-complete` - clio + all official plugins

**postinstall.js Pattern**:
```javascript
const { execSync } = require('child_process')

const plugins = [
  '@cli-ops/clio-plugin-fetch',
  '@cli-ops/clio-plugin-repo'
]

plugins.forEach(plugin => {
  try {
    execSync(`clio plugins:install ${plugin}`, { stdio: 'inherit' })
  } catch (error) {
    console.warn(`Failed to install ${plugin}`)
  }
})
```

**Installation Flow**:
```bash
npm install -g @cli-ops/clio-meta-developer
# → Installs clio
# → postinstall auto-installs fetch and repo plugins
# → User immediately has full developer toolkit
```

### Security Model

**Decision**: **npm Trust Model** (no sandboxing in v1)

**Rationale**:
1. **Simplicity**: No complex security infrastructure needed
2. **Standard Practice**: Same trust model as npm, VS Code, Homebrew
3. **Developer Velocity**: Enables rapid plugin development
4. **User Control**: Users explicitly install plugins they trust

**Trade-offs Accepted**:
- ❌ Plugins have full Node.js access
- ❌ No code signing or verification (yet)
- ❌ No resource limits or sandboxing

**Future Considerations**:
- Add plugin signature verification
- Implement permission system
- Add resource monitoring
- Community plugin registry/marketplace

### Plugin Development Workflow

1. **Create** plugin package following `@cli-ops/clio-plugin-{name}` convention
2. **Configure** package.json with `peerDependencies: { "@cli-ops/clio": "^1.0.0" }`
3. **Extend** `BasePlugin` and `BasePluginCommand` classes from `@cli-ops/shared-plugins`
4. **Use** shared packages (`@/shared-logger`, `@/shared-ui`, etc.) via path aliases
5. **Build** with TypeScript
6. **Test** locally via `clio plugins:link`
7. **Publish** to npm under `@cli-ops` scope
8. **Install** via `clio plugins:install @cli-ops/clio-plugin-{name}`

### Example Plugin Structure

```typescript
// src/index.ts
import { BasePlugin } from '@/shared-plugins'
import type { PluginMetadata } from '@/shared-types'

export class TasksJiraPlugin extends BasePlugin {
  readonly metadata: PluginMetadata = {
    name: '@cli-ops/clio-plugin-tasks-jira',
    version: '1.0.0',
    description: 'Jira integration for tasks',
  }

  async init(): Promise<void> {
    this.on('tasks:created', this.syncToJira.bind(this))
  }

  async destroy(): Promise<void> {
    this.off('tasks:created', this.syncToJira.bind(this))
  }

  private async syncToJira(data: unknown): Promise<void> {
    // Sync logic
  }
}
```

```typescript
// src/commands/tasks/jira/sync.ts
import { BasePluginCommand } from '@/shared-plugins'
import { Flags } from '@oclif/core'

export default class TasksJiraSync extends BasePluginCommand {
  static pluginName = '@cli-ops/clio-plugin-tasks-jira'
  static description = 'Sync tasks with Jira'
  
  static flags = {
    project: Flags.string({ required: true }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(TasksJiraSync)
    // Sync implementation
    this.emitPluginEvent('tasks:jira:sync:complete', { 
      project: flags.project 
    })
  }
}
```

## Consequences

### Positive

✅ **Unified Binary**: Single `clio` command for all operations  
✅ **Extensibility**: Users can add functionality without core changes  
✅ **Ecosystem**: Enables third-party plugin marketplace  
✅ **Modularity**: Keeps core CLI lean and focused  
✅ **Reusability**: Plugins can share workspace packages  
✅ **Type Safety**: Full TypeScript support throughout  
✅ **Developer Experience**: Clear patterns and examples  
✅ **Event-Driven**: Loose coupling via event bus  
✅ **Scoped Packages**: Official plugins under `@cli-ops` org  
✅ **Persona Bundles**: Easy installation for specific workflows  

### Negative

❌ **Security Risk**: Plugins have full system access  
❌ **Version Conflicts**: Plugin dependencies may conflict  
❌ **Discovery**: No centralized plugin registry (npm search only)  
❌ **Breaking Changes**: Plugin APIs may change between versions  
❌ **Testing Complexity**: Plugins must be tested with host CLI  
❌ **Migration Path**: Existing users need to adopt new structure  

### Neutral

⚖️ **Per-CLI Isolation**: Increases isolation but prevents sharing  
⚖️ **npm Distribution**: Standard but requires npm account  
⚖️ **Event Bus**: Powerful but can be overused  

## Alternatives Considered

### 1. Shared Plugin Directory

**Approach**: Single `~/.cli-ops/plugins/` for all CLIs

**Rejected Because**:
- Plugins would need to support multiple CLIs
- Version conflicts between CLI requirements
- Complicates plugin APIs and testing

### 2. Custom Plugin Protocol

**Approach**: Build custom plugin system from scratch

**Rejected Because**:
- Reinvents oclif's proven solution
- More maintenance burden
- Loses oclif ecosystem benefits

### 3. WebAssembly Sandboxing

**Approach**: Run plugins in WASM sandbox for security

**Rejected Because**:
- Significant complexity and limitations
- Poor Node.js/npm integration
- Limits plugin capabilities
- Premature optimization

### 4. Git-Only Distribution

**Approach**: Install plugins only from Git repositories

**Rejected Because**:
- Friction for users (no version management)
- No centralized discovery
- Complicates versioning and updates

## Implementation Plan

### Phase 1: Core Infrastructure ✅
- [x] Add `@oclif/plugin-plugins` to all CLIs
- [x] Create `shared-plugins` package
- [x] Implement `PluginManager` class
- [x] Create `BasePlugin` and `BasePluginCommand`
- [x] Add plugin lifecycle hooks
- [x] Wire plugin types from `shared-types`

### Phase 2: Example Plugins ✅
- [x] `cli-alpha-plugin-jira` - Task/Jira sync
- [x] `cli-beta-plugin-auth-oauth` - OAuth flow
- [x] `cli-gamma-plugin-git-hooks` - Git automation

### Phase 3: Documentation ✅
- [x] Plugin development guide
- [x] Update architecture docs
- [x] Create ADR-009
- [x] Example READMEs

### Phase 4: Testing & Validation (Next)
- [ ] Integration tests for plugin loading
- [ ] Example plugin test suites
- [ ] Plugin validation tests
- [ ] Performance benchmarks

### Phase 5: Polish & Release (Future)
- [ ] Plugin generator template
- [ ] CI/CD for example plugins
- [ ] Plugin best practices guide
- [ ] Community plugin directory

## Monitoring & Success Metrics

**Adoption Metrics**:
- Number of plugins published
- Plugin installation count
- Community contributions

**Quality Metrics**:
- Plugin load time (< 100ms)
- Event bus overhead (< 10ms)
- Memory usage per plugin (< 10MB)

**Developer Metrics**:
- Time to create first plugin (< 1 hour)
- Plugin documentation completeness
- Issue response time

## References

- [oclif Plugins Documentation](https://oclif.io/docs/plugins)
- [VS Code Extension API](https://code.visualstudio.com/api) (inspiration)
- [Webpack Plugin System](https://webpack.js.org/concepts/plugins/) (patterns)
- [ADR-008: Cross-CLI Communication](./008-cross-cli-communication.md)
- [Plugin Development Guide](../contributing/plugin-development.md)

## Review History

- **2025-12-26**: Initial proposal and implementation
- **Future**: Review after 3 months of usage

---

**Decision**: Accepted ✅  
**Implemented**: 2025-12-26  
**Next Review**: 2026-03-26
