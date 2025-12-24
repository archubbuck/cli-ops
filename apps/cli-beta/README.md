# CLI Beta - API Client

A powerful HTTP API client CLI with authentication, caching, and retry logic.

## Features

- 🌐 HTTP/HTTPS requests (GET, POST, PUT, DELETE)
- 🔐 Authentication support
- 💾 Response caching
- 🔄 Automatic retry with exponential backoff
- 📊 Multiple output formats (JSON, table)
- 📝 Request history tracking
- ⚡ Fast and reliable
- 🎨 Colorful output

## Installation

```bash
pnpm install
pnpm build
```

## Usage

### GET Requests

```bash
# Simple GET
beta request:get https://api.github.com/users/octocat

# With custom headers
beta request:get https://api.example.com/data \
  --header "Authorization: Bearer TOKEN" \
  --header "Accept: application/json"

# With caching
beta request:get https://api.example.com/data --cache
beta request:get https://api.example.com/data --cache --cache-ttl 7200

# JSON output
beta request:get https://api.example.com/data --format json

# Verbose (show headers)
beta request:get https://api.example.com/data --verbose
```

### POST Requests

```bash
# POST with JSON data
beta request:post https://api.example.com/users \
  --data '{"name":"John","email":"john@example.com"}'

# With custom headers
beta request:post https://api.example.com/data \
  --data '{"key":"value"}' \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer TOKEN"
```

## Global Flags

- `--format` - Output format (json, table, text)
- `--verbose, -v` - Verbose output (show headers)
- `--quiet, -q` - Suppress output
- `--no-color` - Disable colors

## Request Flags

- `--header, -H` - Custom header (can be used multiple times)
- `--cache, -c` - Use cache (GET only)
- `--cache-ttl` - Cache TTL in seconds (default: 3600)
- `--data, -d` - Request body data (POST)

## Examples

### GitHub API

```bash
# Get user info
beta request:get https://api.github.com/users/octocat

# Get repositories
beta request:get https://api.github.com/users/octocat/repos

# With authentication
beta request:get https://api.github.com/user \
  --header "Authorization: token YOUR_TOKEN"
```

### REST API Testing

```bash
# GET
beta request:get https://jsonplaceholder.typicode.com/posts/1

# POST
beta request:post https://jsonplaceholder.typicode.com/posts \
  --data '{"title":"Test","body":"Content","userId":1}'

# Cached requests
beta request:get https://api.example.com/data --cache
beta request:get https://api.example.com/data --cache  # Returns cached
```

## Features

### Automatic Retry

Failed requests are automatically retried with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 seconds delay
- Attempt 4: 4 seconds delay

### Response Caching

GET requests can be cached to improve performance:
- File-based cache in `~/.cache/beta/`
- Configurable TTL (default: 1 hour)
- Automatic cache invalidation
- Memory + file caching for speed

### Error Handling

Comprehensive error handling with helpful suggestions:
- Network errors
- HTTP errors (4xx, 5xx)
- Timeout errors
- JSON parsing errors

## Architecture

This CLI demonstrates:
- **HttpClient** - Wrapper around fetch with retry/cache
- **CacheService** - File-based caching from shared-services
- **Error Handling** - NetworkError with suggestions
- **Spinners** - Visual feedback during requests
- **Formatters** - JSON and table output
- **History** - Track all API requests

## Storage

- **Cache**: `~/.cache/beta/`
- **Config**: `~/.config/beta/`
- **History**: `~/.local/share/beta/`

## Development

```bash
# Run in dev mode
pnpm dev request:get https://api.github.com/users/octocat

# Build
pnpm build

# Typecheck
pnpm typecheck
```

## ADHD/OCD Benefits

- **Simple commands** - Easy to remember patterns
- **Visual feedback** - Spinners show progress
- **Retry logic** - Don't worry about transient failures
- **Caching** - Faster responses, less waiting
- **Clear errors** - Helpful suggestions when things fail
