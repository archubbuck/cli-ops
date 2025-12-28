# Troubleshooting Guide

Common issues, solutions, and debugging strategies for CLI Ops.

## Quick Diagnostics

Run these commands to diagnose common issues:

```bash
# Check CLI version and installation
clio --version

# Verify all plugins are loaded correctly
clio plugins

# Show current configuration
clio config:get

# Check command history
clio history:list --limit 10

# Show debug logs
clio doctor --debug
```

## Installation Issues

### Command Not Found

**Problem**: `clio: command not found` after installation

**Solutions**:

1. Verify installation:

   ```bash
   npm list -g @cli-ops/clio
   ```

2. Check PATH includes npm global bin:

   ```bash
   npm config get prefix
   # Should be in your PATH
   ```

3. Add npm global bin to PATH:

   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export PATH="$PATH:$(npm config get prefix)/bin"
   ```

4. Reinstall globally:
   ```bash
   npm install -g @cli-ops/clio
   ```

### Version Conflicts

**Problem**: Different versions of shared packages causing errors

**Solutions**:

1. Clear npm cache:

   ```bash
   npm cache clean --force
   ```

2. Reinstall CLI:

   ```bash
   npm uninstall -g @cli-ops/clio
   npm install -g @cli-ops/clio
   ```

3. Check for duplicate installations:
   ```bash
   which -a clio
   ```

## Plugin Issues

### Plugin Not Loading

**Problem**: Installed plugin not appearing in `clio plugins` list

**Solutions**:

1. Verify plugin installation:

   ```bash
   clio plugins --core
   ```

2. Check plugin is installed:

   ```bash
   npm list -g | grep @cli-ops/clio-plugin
   ```

3. Reinstall plugin:

   ```bash
   clio plugins:uninstall @cli-ops/clio-plugin-{name}
   clio plugins:install @cli-ops/clio-plugin-{name}
   ```

4. Check for errors:
   ```bash
   clio doctor --debug
   ```

### Plugin Command Conflicts

**Problem**: Command name conflicts between plugins

**Solutions**:

1. Check which plugin provides the command:

   ```bash
   clio which {command}
   ```

2. Use plugin-specific namespace:

   ```bash
   # Instead of ambiguous command
   clio status

   # Use explicit plugin command
   clio repo:status
   ```

3. Review installed plugins:
   ```bash
   clio plugins
   ```

### Extension Plugin Not Working

**Problem**: Extension plugin not extending parent plugin correctly

**Solutions**:

1. Verify parent plugin is installed:

   ```bash
   # For tasks-jira, need tasks plugin
   clio plugins | grep tasks
   ```

2. Check extension is registered:

   ```bash
   clio tasks:extensions
   ```

3. Enable extension if disabled:
   ```bash
   clio tasks:extensions:enable jira
   ```

## Configuration Issues

### Configuration Not Persisting

**Problem**: Changes to configuration are not saved

**Solutions**:

1. Check config file permissions:

   ```bash
   ls -la ~/.config/clio/config.json
   ```

2. Verify config directory is writable:

   ```bash
   test -w ~/.config/clio && echo "Writable" || echo "Not writable"
   ```

3. Create config directory if missing:

   ```bash
   mkdir -p ~/.config/clio
   chmod 755 ~/.config/clio
   ```

4. Reset configuration:
   ```bash
   clio config:reset --backup
   ```

### Invalid Configuration

**Problem**: Configuration validation errors on startup

**Solutions**:

1. Check configuration syntax:

   ```bash
   cat ~/.config/clio/config.json | jq .
   ```

2. Validate configuration:

   ```bash
   clio config:validate
   ```

3. View configuration errors:

   ```bash
   clio config:get --debug
   ```

4. Reset to defaults:
   ```bash
   clio config:reset
   ```

## Performance Issues

### Slow Command Execution

**Problem**: Commands take unusually long to complete

**Solutions**:

1. Check concurrent operations limit:

   ```bash
   clio config:get performance.maxConcurrentOperations
   ```

2. Increase concurrency (with caution):

   ```bash
   clio config:set performance.maxConcurrentOperations 10
   ```

3. Clear cache:

   ```bash
   rm -rf ~/.cache/clio/*
   ```

4. Profile command execution:
   ```bash
   clio tasks:list --profile
   ```

### High Memory Usage

**Problem**: CLI consuming excessive memory

**Solutions**:

1. Reduce history entries:

   ```bash
   clio config:set history.maxEntries 100
   ```

2. Disable history:

   ```bash
   clio config:set history.enabled false
   ```

3. Check for memory leaks:
   ```bash
   clio doctor --memory
   ```

## Network Issues

### Fetch Plugin Timeouts

**Problem**: HTTP requests timing out

**Solutions**:

1. Increase timeout:

   ```bash
   clio config:set plugins.fetch.timeout 30000
   ```

2. Check network connectivity:

   ```bash
   curl -I https://api.example.com
   ```

3. Test with retry:

   ```bash
   clio fetch:get https://api.example.com --retries 5
   ```

4. Disable SSL verification (development only):
   ```bash
   clio fetch:get https://api.example.com --insecure
   ```

### Proxy Configuration

**Problem**: Requests failing behind corporate proxy

**Solutions**:

1. Set HTTP proxy:

   ```bash
   export HTTP_PROXY=http://proxy.example.com:8080
   export HTTPS_PROXY=http://proxy.example.com:8080
   ```

2. Configure npm proxy:

   ```bash
   npm config set proxy http://proxy.example.com:8080
   npm config set https-proxy http://proxy.example.com:8080
   ```

3. Test proxy connection:
   ```bash
   curl -x http://proxy.example.com:8080 https://api.example.com
   ```

## Repository Plugin Issues

### Git Authentication Failures

**Problem**: Repository operations failing with authentication errors

**Solutions**:

1. Verify Git credentials:

   ```bash
   git config --list | grep credential
   ```

2. Configure Git credential helper:

   ```bash
   git config --global credential.helper store
   ```

3. Use SSH instead of HTTPS:

   ```bash
   clio repo:config set protocol ssh
   ```

4. Generate and add SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   cat ~/.ssh/id_ed25519.pub
   # Add to GitHub/GitLab settings
   ```

### Repository Not Found

**Problem**: Commands fail with "repository not found"

**Solutions**:

1. Verify you're in a Git repository:

   ```bash
   git rev-parse --git-dir
   ```

2. Check remote configuration:

   ```bash
   git remote -v
   ```

3. Initialize repository if needed:
   ```bash
   git init
   clio repo:init
   ```

## Tasks Plugin Issues

### Tasks Not Syncing

**Problem**: Local tasks not syncing with remote provider

**Solutions**:

1. Check sync configuration:

   ```bash
   clio config:get plugins.tasks
   ```

2. Manually trigger sync:

   ```bash
   clio tasks:sync
   ```

3. Re-authenticate with provider:

   ```bash
   clio tasks:auth:login jira
   ```

4. Check provider status:
   ```bash
   clio tasks:providers
   ```

### Task Provider Authentication

**Problem**: Cannot authenticate with Jira/GitHub

**Solutions**:

1. Clear stored credentials:

   ```bash
   clio tasks:auth:logout jira
   clio tasks:auth:login jira
   ```

2. Verify API token/PAT:

   ```bash
   # Test Jira authentication
   curl -u user@example.com:API_TOKEN https://your-domain.atlassian.net/rest/api/3/myself
   ```

3. Check token permissions:
   - Jira: Requires read/write access to issues
   - GitHub: Requires `repo` scope for private repos

## History Issues

### History Not Saving

**Problem**: Command history not being recorded

**Solutions**:

1. Verify history is enabled:

   ```bash
   clio config:get history.enabled
   ```

2. Enable history:

   ```bash
   clio config:set history.enabled true
   clio config:set history.save true
   ```

3. Check history file permissions:

   ```bash
   ls -la ~/.local/share/clio/history.json
   ```

4. Reset history:
   ```bash
   clio history:clear --reset
   ```

## IPC (Inter-Process Communication) Issues

### IPC Server Not Starting

**Problem**: Cross-CLI communication not working

**Solutions**:

1. Check IPC is enabled:

   ```bash
   clio config:get ipc.enabled
   ```

2. Verify port is not in use:

   ```bash
   lsof -i :$(clio config:get ipc.port)
   ```

3. Use different port:

   ```bash
   clio config:set ipc.port 9876
   ```

4. Restart IPC server:
   ```bash
   clio ipc:restart
   ```

## Debug Mode

Enable detailed logging for all operations:

```bash
# Global debug flag
clio --debug {command}

# Set log level in config
clio config:set logging.level debug

# Enable trace logging (very verbose)
clio config:set logging.level trace

# Log to file
clio config:set logging.file ~/clio-debug.log
```

## Getting Help

### Built-in Diagnostics

```bash
# Run comprehensive diagnostics
clio doctor

# Check specific subsystem
clio doctor --plugins
clio doctor --config
clio doctor --history
```

### Useful Information for Bug Reports

When reporting issues, include:

```bash
# System information
clio --version
node --version
npm --version
uname -a

# Plugin list
clio plugins

# Configuration (remove sensitive data)
clio config:get

# Recent history
clio history:list --limit 20

# Debug output
clio {command} --debug 2>&1 | tee debug-output.log
```

### Community Support

- **GitHub Issues**: [archubbuck/cli-ops/issues](https://github.com/archubbuck/cli-ops/issues)
- **Discussions**: [archubbuck/cli-ops/discussions](https://github.com/archubbuck/cli-ops/discussions)
- **Documentation**: [CLI Ops Docs](/)

## Common Error Messages

### `ENOENT: no such file or directory`

**Cause**: Configuration or data directory missing

**Solution**:

```bash
mkdir -p ~/.config/clio ~/.local/share/clio ~/.cache/clio
```

### `EACCES: permission denied`

**Cause**: Insufficient file permissions

**Solution**:

```bash
chmod 755 ~/.config/clio
chmod 644 ~/.config/clio/config.json
```

### `Module not found`

**Cause**: Missing dependency or plugin

**Solution**:

```bash
npm install -g @cli-ops/clio
clio plugins:install @cli-ops/clio-plugin-{name}
```

### `Command not found`

**Cause**: Plugin not loaded or command name incorrect

**Solution**:

```bash
clio commands --tree
clio plugins
```

### `Validation error`

**Cause**: Invalid configuration value

**Solution**:

```bash
clio config:validate
clio config:reset {section}
```

## Advanced Debugging

### Enable Node.js Inspector

```bash
node --inspect $(which clio) {command}
# Open chrome://inspect in Chrome
```

### Trace System Calls

```bash
strace -e trace=file clio {command}
```

### Profile Performance

```bash
node --prof $(which clio) {command}
node --prof-process isolate-*.log > profile.txt
```

## See Also

- [Configuration Reference](/docs/guides/configuration) - Complete configuration options
- [Contributing Guide](/docs/contributing/getting-started) - Development setup
- [Architecture Documentation](/docs/architecture/overview) - System internals
