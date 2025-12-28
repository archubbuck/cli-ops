# @cli-ops/clio-plugin-fetch

A powerful HTTP API client plugin for Clio with authentication, caching, and retry logic.

> **Documentation**: See [Fetch Plugin Documentation](https://github.com/archubbuck/cli-ops/tree/main/docs/plugins/fetch.md) for complete reference.

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

Install via Clio:

```bash
clio plugins:install @cli-ops/clio-plugin-fetch
```

Or for development:

```bash
pnpm install
pnpm build
```

## Usage

### GET Requests

```bash
# Simple GET
clio fetch:get https://api.github.com/users/octocat

# With custom headers
clio fetch:get https://api.example.com/data \
  --header "Authorization: Bearer TOKEN" \
  --header "Accept: application/json"

# With caching
clio fetch:get https://api.example.com/data --cache
clio fetch:get https://api.example.com/data --cache --cache-ttl 7200

# JSON output
clio fetch:get https://api.example.com/data --format json

# Verbose (show headers)
clio fetch:get https://api.example.com/data --verbose
```

### POST Requests

```bash
# POST with JSON data
clio fetch:post https://api.example.com/users \
  --data '{"name":"John","email":"john@example.com"}'

# With custom headers
clio fetch:post https://api.example.com/data \
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
clio fetch:get https://api.github.com/users/octocat

# Get repositories
clio fetch:get https://api.github.com/users/octocat/repos

# With authentication
clio fetch:get https://api.github.com/user \
  --header "Authorization: token YOUR_TOKEN"
```

### REST API Testing

```bash
# GET
clio fetch:get https://jsonplaceholder.typicode.com/posts/1

# POST
clio fetch:post https://jsonplaceholder.typicode.com/posts \
  --data '{"title":"Test","body":"Content","userId":1}'

# Cached requests
clio fetch:get https://api.example.com/data --cache
clio fetch:get https://api.example.com/data --cache  # Returns cached
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

- File-based cache in `~/.cache/clio/`
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

- **Cache**: `~/.cache/clio/`
- **Config**: `~/.config/clio/`
- **History**: `~/.local/share/clio/`

## Development

```bash
# Run in dev mode
pnpm dev fetch:get https://api.github.com/users/octocat

# Build
pnpm build

# Typecheck
pnpm typecheck
```

## Extension API

> **New in v3.0.0**: Extension plugins can hook into HTTP request/response lifecycle

This plugin provides extension points for authentication, request modification, and response handling.

### Available Hooks

#### `fetch:beforeRequest`

**When**: Before an HTTP request is sent  
**Data**: Request configuration (url, method, headers, body, etc.)  
**Use case**: Add authentication, modify headers, log requests

```typescript
this.registerHook('fetch:beforeRequest', async (requestData: RequestConfig) => {
  // Add OAuth token, API keys, custom headers, etc.
  requestData.headers['Authorization'] = `Bearer ${token}`
})
```

#### `fetch:afterResponse`

**When**: After receiving an HTTP response  
**Data**: Response object (statusCode, headers, body, etc.)  
**Use case**: Handle auth errors, transform responses, log results

```typescript
this.registerHook('fetch:afterResponse', async (responseData: Response) => {
  // Refresh tokens on 401, log metrics, etc.
  if (responseData.statusCode === 401) {
    await this.refreshAuthToken()
  }
})
```

#### `fetch:onError`

**When**: When a request fails  
**Data**: Error object with request details  
**Use case**: Custom error handling, retry logic, notifications

```typescript
this.registerHook('fetch:onError', async (error: RequestError) => {
  // Log to monitoring service, trigger alerts, etc.
})
```

### Legacy Event Bus

For backward compatibility, the following events are still emitted:

- `request:before` - Before request (legacy)
- `request:after` - After response (legacy)
- `request:error` - On error (legacy)

**Note**: New extensions should use hooks for type safety and sequential execution.

### Example Extension

See [@cli-ops/clio-plugin-fetch-oauth](../clio-plugin-fetch-oauth) for a complete OAuth 2.0 extension example.

## ADHD/OCD Benefits

- **Simple commands** - Easy to remember patterns
- **Visual feedback** - Spinners show progress
- **Retry logic** - Don't worry about transient failures
- **Caching** - Faster responses, less waiting
- **Clear errors** - Helpful suggestions when things fail
