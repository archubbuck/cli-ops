# CLI Gamma - Developer Tools

A powerful developer tools CLI with Git and GitHub integration.

## Features

- 📊 Git status and log
- 🔀 Pull request management
- 🐙 GitHub API integration
- 💾 Response caching
- 🎨 Beautiful formatting
- 📝 Command history
- ⚡ Fast and reliable

## Installation

```bash
pnpm install
pnpm build
```

## Usage

### Git Commands

```bash
# Show repository status
gamma git:status

# Show commit history
gamma git:log
gamma git:log --limit 20

# JSON output
gamma git:log --format json
```

### Pull Request Commands

```bash
# List open PRs
gamma pr:list

# List all PRs
gamma pr:list --state all

# With GitHub token
gamma pr:list --token YOUR_TOKEN
export GITHUB_TOKEN=your_token
gamma pr:list
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
gamma git:status
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
gamma git:log

# Last 50 commits
gamma git:log -n 50

# JSON format
gamma git:log --format json
```

### Pull Requests

```bash
# Open PRs
gamma pr:list

# All PRs
gamma pr:list --state all

# Closed PRs
gamma pr:list --state closed

# With authentication
export GITHUB_TOKEN=ghp_yourtoken
gamma pr:list
```

## GitHub Token

For GitHub API access, provide a token:

1. Via environment variable:
   ```bash
   export GITHUB_TOKEN=ghp_yourtoken
   ```

2. Via flag:
   ```bash
   gamma pr:list --token ghp_yourtoken
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

- **Cache**: `~/.cache/gamma/`
- **Config**: `~/.config/gamma/`
- **History**: `~/.local/share/gamma/`

## Development

```bash
# Run in dev mode
pnpm dev git:status

# Build
pnpm build

# Typecheck
pnpm typecheck
```

## ADHD/OCD Benefits

- **Quick overview** - See status at a glance
- **Organized output** - Clean tables
- **Caching** - Fast responses
- **History** - Track what you've done
- **Clear commands** - Easy to remember
