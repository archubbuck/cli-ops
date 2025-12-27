---
sidebar_position: 3
---

# Quick Start

Get up and running with Clio in 5 minutes.

## 1. Install Clio

```bash
npm install -g @cli-ops/clio
```

## 2. Explore Built-in Commands

Clio comes with task management built-in:

```bash
# Create your first task
clio tasks:create "Set up development environment"

# List all tasks
clio tasks:list

# View task details
clio tasks:show 1

# Complete a task
clio tasks:update 1 --status done

# Delete a task
clio tasks:delete 1
```

## 3. Install Additional Plugins

Extend Clio with more functionality:

```bash
# Install the HTTP client plugin
clio plugins:install @cli-ops/clio-plugin-fetch

# Make an API request
clio fetch:get https://api.github.com/users/octocat

# Install Git/GitHub tools
clio plugins:install @cli-ops/clio-plugin-repo

# Check repository status
clio repo:status
```

## 4. Use Command History

Clio tracks all your commands and supports undo:

```bash
# View command history
clio history:list

# Undo the last reversible command
clio history:undo

# Redo an undone command
clio history:redo
```

## 5. Configure Settings

Customize Clio to your preferences:

```bash
# Set a configuration value
clio config:set log.level debug

# View a configuration value
clio config:get log.level

# List all configuration
clio config:list
```

## 6. Get Help Anytime

Every command has built-in help:

```bash
# Global help
clio --help

# Command-specific help
clio tasks:create --help

# Topic help
clio tasks --help
```

## Common Workflows

### Task Management Workflow

```bash
# Morning routine
clio tasks:list --status pending

# Create tasks for the day
clio tasks:create "Review pull requests"
clio tasks:create "Write unit tests"
clio tasks:create "Update documentation"

# Work on tasks
clio tasks:update 1 --status in-progress

# Complete tasks
clio tasks:update 1 --status done

# End of day review
clio tasks:list --status done
```

### API Development Workflow

```bash
# Install fetch plugin
clio plugins:install @cli-ops/clio-plugin-fetch

# Test endpoints
clio fetch:get https://api.example.com/health
clio fetch:post https://api.example.com/users \
  --body '{"name":"Alice","email":"alice@example.com"}'

# Save common requests
clio config:set api.baseUrl https://api.example.com
clio fetch:get /health
```

### Repository Management Workflow

```bash
# Install repo plugin
clio plugins:install @cli-ops/clio-plugin-repo

# Check status
clio repo:status

# Clone repositories
clio repo:clone https://github.com/user/repo.git

# Create pull requests
clio repo:pr create --title "Add feature" --body "Description"
```

## Keyboard Shortcuts

When using interactive prompts:

- `↑/↓` - Navigate options
- `Space` - Select/deselect (multi-select)
- `Enter` - Confirm selection
- `Esc` or `Ctrl+C` - Cancel

## Performance Tips

Clio is designed for speed, but you can optimize further:

1. **Use specific commands** instead of interactive prompts when scripting
2. **Enable shell completions** for faster command entry
3. **Set aliases** for frequently used commands in your shell

```bash
# Add to ~/.bashrc or ~/.zshrc
alias t='clio tasks'
alias tl='clio tasks:list'
alias tc='clio tasks:create'
```

## Troubleshooting

### Command not responding

Try with debug flag to see what's happening:

```bash
clio tasks:list --debug
```

### Plugin issues

Check installed plugins and their versions:

```bash
clio plugins:list
clio doctor  # Diagnostic check
```

### Reset to defaults

If something goes wrong, reset configuration:

```bash
rm ~/.config/clio/config.json
clio config:list  # Will recreate with defaults
```

## Next Steps

<div className="row">
  <div className="col col--4">
    <div className="card">
      <div className="card__header">
        <h3>📖 Concepts</h3>
      </div>
      <div className="card__body">
        <p>Learn about plugins, commands, and configuration</p>
      </div>
      <div className="card__footer">
        <a href="/docs/concepts/overview">Read More</a>
      </div>
    </div>
  </div>
  
  <div className="col col--4">
    <div className="card">
      <div className="card__header">
        <h3>🔌 Build Plugins</h3>
      </div>
      <div className="card__body">
        <p>Create your own clio plugins</p>
      </div>
      <div className="card__footer">
        <a href="/docs/plugins/getting-started">Plugin Guide</a>
      </div>
    </div>
  </div>
  
  <div className="col col--4">
    <div className="card">
      <div className="card__header">
        <h3>🏗️ Architecture</h3>
      </div>
      <div className="card__body">
        <p>Understand how Clio works internally</p>
      </div>
      <div className="card__footer">
        <a href="/docs/architecture/overview">Architecture Docs</a>
      </div>
    </div>
  </div>
</div>
