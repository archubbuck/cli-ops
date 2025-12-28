# @cli-ops/clio-plugin-repo

A powerful Git and GitHub integration plugin for Clio.

> **Documentation**: See [Repo Plugin Documentation](https://github.com/archubbuck/cli-ops/tree/main/docs/plugins/repo.md) for complete reference.

## Features

- 📊 Git status and log
- 🔀 Pull request management
- 🐙 GitHub API integration
- 💾 Response caching
- 🎨 Beautiful formatting
- 📝 Command history
- ⚡ Fast and reliable

## Installation

Install via Clio:

```bash
clio plugins:install @cli-ops/clio-plugin-repo
```

Or for development:

```bash
pnpm install
pnpm build
```

## Usage

### Git Commands

```bash
# Show repository status
clio repo:status

# Show commit history
clio repo:log
clio repo:log --limit 20

# JSON output
clio repo:log --format json
```

### Pull Request Commands

```bash
# List open PRs
clio repo:pr:list

# List all PRs
clio repo:pr:list --state all

# With GitHub token
clio repo:pr:list --token YOUR_TOKEN
export GITHUB_TOKEN=your_token
clio repo:pr:list
```

## Global Flags

- `--format` - Output format (json, table, text)
- `--verbose, -v` - Verbose output
- `--quiet, -q` - Suppress output
- `--no-color` - Disable colors

## Command Flags

### git:log

- `--limit, -n` - Number of commits (default: 10)

### pr:list

- `--state, -s` - Filter by state (open, closed, all)
- `--token, -t` - GitHub token (or use GITHUB_TOKEN env var)

## Examples

### Git Status

```bash
clio repo:status
```

Shows:

- Current branch
- Commits ahead/behind
- Staged files
- Modified files
- Untracked files

### Git Log

```bash
# Last 10 commits
clio repo:log

# Last 50 commits
clio repo:log -n 50

# JSON format
clio repo:log --format json
```

### Pull Requests

```bash
# Open PRs
clio repo:pr:list

# All PRs
clio repo:pr:list --state all

# Closed PRs
clio repo:pr:list --state closed

# With authentication
export GITHUB_TOKEN=ghp_yourtoken
clio repo:pr:list
```

## GitHub Token

For GitHub API access, provide a token:

1. Via environment variable:

   ```bash
   export GITHUB_TOKEN=ghp_yourtoken
   ```

2. Via flag:

   ```bash
   clio repo:pr:list --token ghp_yourtoken
   ```

3. Create token at: https://github.com/settings/tokens

Required scopes: `repo` (for private repos) or `public_repo` (for public)

## Features

### Git Integration

- Status checking
- Commit history
- Branch information
- Remote URL parsing

### GitHub API

- Pull request listing
- Repository info
- Caching for performance
- Rate limit handling

### Caching

GitHub API responses are cached:

- 5-minute TTL
- Reduces API calls
- Faster responses

## Architecture

This CLI demonstrates:

- **GitClient** - Git command wrapper
- **GitHubClient** - GitHub API wrapper with caching
- **Error Handling** - Helpful error messages
- **Formatters** - Table and JSON output
- **Cache Service** - Response caching

## Storage

- **Cache**: `~/.cache/clio/`
- **Config**: `~/.config/clio/`
- **History**: `~/.local/share/clio/`

## Development

```bash
# Run in dev mode
pnpm dev repo:status

# Build
pnpm build

# Typecheck
pnpm typecheck
```

## Extension API

> **New in v3.0.0**: Extension plugins can hook into Git operations

This plugin provides extension points for Git hooks automation, pre-flight checks, and repository workflows.

### Available Hooks

#### `repo:beforeCommit`

**When**: Before making a Git commit  
**Data**: Commit data (message, files, etc.)  
**Use case**: Run linters, tests, validate commit messages

```typescript
this.registerHook('repo:beforeCommit', async (commitData: CommitData) => {
  // Run pre-commit hooks, linting, etc.
  await this.runLinter(commitData.files)
})
```

#### `repo:afterCommit`

**When**: After a successful Git commit  
**Data**: Commit result (hash, message, timestamp)  
**Use case**: Trigger CI, update issue trackers, notifications

```typescript
this.registerHook('repo:afterCommit', async (result: CommitResult) => {
  // Update linked issues, trigger builds, etc.
})
```

#### `repo:beforePush`

**When**: Before pushing to remote  
**Data**: Push data (branch, commits, remote)  
**Use case**: Run tests, validate branch protection, check secrets

```typescript
this.registerHook('repo:beforePush', async (pushData: PushData) => {
  // Run full test suite, scan for secrets, etc.
  await this.runTests()
})
```

#### Other Hooks

- `repo:afterPush` - After successful push
- `repo:beforePull` - Before pulling from remote
- `repo:afterPull` - After successful pull

### Legacy Event Bus

For backward compatibility, the following events are still emitted:

- `git:commit:before` - Before commit (legacy)
- `git:commit:after` - After commit (legacy)
- `git:push:before` - Before push (legacy)
- `git:push:after` - After push (legacy)

**Note**: New extensions should use hooks for type safety and sequential execution.

### Example Extension

See [@cli-ops/clio-plugin-repo-hooks](../clio-plugin-repo-hooks) for a complete Git hooks automation example.

## ADHD/OCD Benefits

- **Quick overview** - See status at a glance
- **Organized output** - Clean tables
- **Caching** - Fast responses
- **History** - Track what you've done
- **Clear commands** - Easy to remember
