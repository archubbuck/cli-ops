# cli-alpha-plugin-jira

> Jira integration plugin for cli-alpha task manager

## Installation

```bash
alpha plugins install cli-alpha-plugin-jira
```

## Usage

### Sync tasks with Jira

```bash
# One-way sync (Alpha → Jira)
alpha jira sync --project MYPROJECT

# Two-way sync
alpha jira sync --project MYPROJECT --bidirectional

# Dry run to preview changes
alpha jira sync --project MYPROJECT --dry-run
```

### Link tasks to Jira issues

```bash
# Link a local task to a Jira issue
alpha jira link 123 PROJ-456

# Link and sync task data
alpha jira link 123 PROJ-456 --sync
```

## Configuration

Add Jira credentials to your config file (`~/.alpha/config.json` or `.alpharc.json`):

```json
{
  "plugins": {
    "jira": {
      "host": "https://your-domain.atlassian.net",
      "email": "your-email@example.com",
      "apiToken": "your-api-token"
    }
  }
}
```

## Features

- ✅ One-way and two-way task synchronization
- ✅ Link local tasks to Jira issues
- ✅ Automatic status updates
- ✅ Dry-run mode for previewing changes
- ✅ Event-based integration with task lifecycle

## Events

This plugin emits the following events:

- `jira:sync:complete` - Fired after successful sync
- `jira:link:created` - Fired when a task is linked to an issue
- `jira:plugin:ready` - Fired when plugin initializes

Listen to these events in other plugins:

```typescript
getPluginEventBus().on('jira:sync:complete', (data) => {
  console.log('Jira sync completed:', data)
})
```

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
