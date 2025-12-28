````markdown
# cli-gamma-plugin-git-hooks

> Git hooks automation plugin for cli-gamma developer tools

## Installation

```bash
gamma plugins install cli-gamma-plugin-git-hooks
```

## Usage

### Install Git hooks

```bash
# Interactive hook selection
gamma hooks install

# Install specific hooks
gamma hooks install --hooks pre-commit,pre-push

# Use strict template
gamma hooks install --template=strict

# Force overwrite existing hooks
gamma hooks install --force
```

## Hook Templates

### Basic Template

- Lint staged files
- Run tests on changed files

### Strict Template

- All basic checks
- Type checking
- Security scanning
- Commit message validation

### Custom Template

- User-defined hook scripts

## Configuration

Customize hook behavior in your config file:

```json
{
  "plugins": {
    "hooks": {
      "preCommit": {
        "lint": true,
        "test": true,
        "typeCheck": false
      },
      "prePush": {
        "fullTest": true,
        "buildCheck": true
      },
      "commitMsg": {
        "format": "conventional",
        "maxLength": 72
      }
    }
  }
}
```

## Features

- ✅ Multiple hook templates (basic, strict, custom)
- ✅ Interactive hook selection
- ✅ Automatic validation on Git operations
- ✅ Customizable check configurations
- ✅ Event-driven hook execution

## Events

This plugin emits and listens to:

**Emits:**

- `hooks:installed` - After hooks are installed
- `hooks:plugin:ready` - When plugin initializes

**Listens:**

- `git:commit:before` - To run pre-commit checks
- `git:push:before` - To run pre-push checks

## Available Hooks

- **pre-commit**: Lint, format, and test before committing
- **pre-push**: Full test suite and build verification
- **commit-msg**: Validate commit message format
- **prepare-commit-msg**: Auto-generate commit message templates
- **post-commit**: Post-commit notifications

## Development

```bash
# Build the plugin
pnpm build

# Type check
pnpm typecheck

# Clean build artifacts
pnpm clean
```

## License

MIT
````
