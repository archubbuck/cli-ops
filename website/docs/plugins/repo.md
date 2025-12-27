---
sidebar_position: 6
---

# Repo Plugin

The `@cli-ops/clio-plugin-repo` provides Git and GitHub integration for repository management.

## Installation

```bash
clio plugins:install @cli-ops/clio-plugin-repo
```

## Features

- 📊 Git status and log
- 🔀 Pull request management
- 🐙 GitHub API integration
- 💾 Response caching
- 🎨 Beautiful formatting
- 📝 Command history
- ⚡ Fast and reliable

## Commands

### repo:status

Show repository status.

```bash
clio repo:status
```

Shows:

- Current branch
- Commits ahead/behind
- Staged files
- Modified files
- Untracked files

### repo:log

Show commit history.

```bash
# Last 10 commits
clio repo:log

# Last 50 commits
clio repo:log -n 50

# JSON format
clio repo:log --format json
```

**Flags:**

- `--limit, -n` - Number of commits (default: 10)
- `--format, -f` - Output format (table, json)

### repo:sync

Sync with remote repository.

```bash
# Pull changes
clio repo:sync

# Push changes
clio repo:sync --push

# Force sync
clio repo:sync --force
```

**Flags:**

- `--push, -p` - Push instead of pull
- `--force, -f` - Force operation

### repo:pr:list

List pull requests.

```bash
# Open PRs
clio repo:pr:list

# All PRs
clio repo:pr:list --state all

# With GitHub token
clio repo:pr:list --token YOUR_TOKEN
export GITHUB_TOKEN=your_token
clio repo:pr:list
```

**Flags:**

- `--state, -s` - Filter by state (open, closed, all)
- `--token, -t` - GitHub token (or use GITHUB_TOKEN env var)

### repo:pr:create

Create a pull request.

```bash
# Interactive mode
clio repo:pr:create

# CLI mode
clio repo:pr:create \
  --title "Add feature" \
  --body "Description" \
  --base main \
  --head feature-branch
```

**Flags:**

- `--title, -t` - PR title
- `--body, -b` - PR description
- `--base` - Base branch (default: main)
- `--head` - Head branch (default: current branch)
- `--draft, -d` - Create as draft
- `--token` - GitHub token

## Examples

### Check Repository Status

```bash
clio repo:status
```

Example output:

```
On branch feature-branch
Your branch is ahead of 'origin/main' by 3 commits.

Changes to be committed:
  modified:   src/index.ts
  new file:    src/utils.ts

Changes not staged for commit:
  modified:   README.md

Untracked files:
  test.txt
```

### View Commit History

```bash
# Last 10 commits
clio repo:log

# Last 50 commits with JSON output
clio repo:log -n 50 --format json
```

### List Pull Requests

```bash
# Open PRs
clio repo:pr:list

# All PRs
clio repo:pr:list --state all

# Closed PRs
clio repo:pr:list --state closed
```

### Create Pull Request

```bash
# Interactive mode (recommended)
clio repo:pr:create

# CLI mode
clio repo:pr:create \
  --title "Fix authentication bug" \
  --body "Fixes #123\n\nChanges:\n- Fixed token validation\n- Added tests" \
  --base main
```

### Sync with Remote

```bash
# Pull latest changes
clio repo:sync

# Push local changes
clio repo:sync --push

# Force push (use with caution)
clio repo:sync --push --force
```

## Configuration

### GitHub Token

Set GitHub token for API access:

```bash
# Environment variable
export GITHUB_TOKEN=your_token

# Or pass with each command
clio repo:pr:list --token your_token
```

### Git Configuration

The plugin uses your local Git configuration:

- User name and email from `~/.gitconfig`
- Remote URLs from repository `.git/config`

## Features

### Automatic Repository Detection

The plugin automatically detects:

- Current Git repository
- GitHub remote URLs
- Owner and repository name

### Error Handling

Clear error messages for common issues:

- Not in a Git repository
- No GitHub remote configured
- Invalid GitHub token
- Network errors

### Caching

GitHub API responses are cached to improve performance and reduce API calls.

## Extensions

### @cli-ops/clio-plugin-repo-hooks

Extends repo plugin with Git hooks automation.

See [extensions/clio-plugin-repo-hooks](https://github.com/archubbuck/cli-ops/tree/main/extensions/clio-plugin-repo-hooks) for implementation example.

## Related

- [Plugin Development Guide](./development)
- [Tasks Plugin](./tasks)
- [Fetch Plugin](./fetch)
