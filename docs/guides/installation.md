---
sidebar_position: 2
---

# Installation

Install Clio globally via npm, yarn, or pnpm.

## Prerequisites

- **Node.js**: >=20.0.0
- **npm/yarn/pnpm**: Latest version recommended

## Global Installation

### npm

```bash
npm install -g @cli-ops/clio
```

### yarn

```bash
yarn global add @cli-ops/clio
```

### pnpm

```bash
pnpm add -g @cli-ops/clio
```

## Verify Installation

```bash
clio --version
# @cli-ops/clio/1.0.0

clio --help
# Displays help text with available commands
```

## Persona-Based Meta Packages

Install curated plugin bundles for different use cases:

### Developer Toolkit

Includes `clio-plugin-tasks`, `clio-plugin-fetch`, and `clio-plugin-repo`:

```bash
npm install -g @cli-ops/clio-meta-developer
```

### Complete Bundle

Includes all official plugins:

```bash
npm install -g @cli-ops/clio-meta-complete
```

## Installing Individual Plugins

After installing clio, add plugins as needed:

```bash
# HTTP client plugin
clio plugins:install @cli-ops/clio-plugin-fetch

# Git/GitHub tools plugin
clio plugins:install @cli-ops/clio-plugin-repo

# List installed plugins
clio plugins:list
```

## Shell Completions

Clio includes automatic tab completion powered by [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete).

### Interactive Setup

Run the interactive setup command to configure shell completions:

```bash
clio setup
```

This will guide you through selecting your shell and setting up completions.

### Manual Setup

Or manually configure completions for your specific shell:

#### Bash

```bash
clio autocomplete bash
# Follow the instructions to add to ~/.bashrc
```

#### Zsh

```bash
clio autocomplete zsh
# Follow the instructions to add to ~/.zshrc
```

#### Fish

```bash
clio autocomplete fish
# Follow the instructions for Fish shell setup
```

#### PowerShell (Windows)

```powershell
clio autocomplete powershell
# Follow the instructions for PowerShell profile
```

### Automatic Updates

Completions automatically refresh when plugins are installed or uninstalled, ensuring you always have access to all available commands!

## Updating

Update clio and all installed plugins:

```bash
# Update clio
npm update -g @cli-ops/clio

# Update all plugins
clio plugins:update
```

## Uninstallation

```bash
# Uninstall clio
npm uninstall -g @cli-ops/clio

# Or remove with all config data
npm uninstall -g @cli-ops/clio
rm -rf ~/.config/clio ~/.local/share/clio
```

## Troubleshooting

### Command not found

Ensure npm global bin directory is in your PATH:

```bash
npm config get prefix
# Add the prefix/bin directory to your PATH
```

### Permission errors

On Linux/macOS, you may need to use `sudo` or configure npm to install globally without sudo:

```bash
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Plugin installation fails

Check network connectivity and npm registry access:

```bash
npm config get registry
# Should be https://registry.npmjs.org/
```

## Next Steps

- [Quick Start Guide](./quick-start)
- [Core Concepts](./concepts)
- [Available Plugins](/docs/plugins)
