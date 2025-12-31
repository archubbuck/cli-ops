# @cli-ops/shared-types

## 2.0.0

### Major Changes

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
