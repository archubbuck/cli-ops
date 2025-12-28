---
sidebar_position: 5
---

# Fetch Plugin

The `@cli-ops/clio-plugin-fetch` provides a powerful HTTP client with authentication, caching, and retry logic.

## Installation

```bash
clio plugins:install @cli-ops/clio-plugin-fetch
```

## Features

- 🌐 HTTP/HTTPS requests (GET, POST, PUT, DELETE)
- 🔐 Authentication support
- 💾 Response caching
- 🔄 Automatic retry with exponential backoff
- 📊 Multiple output formats (JSON, table)
- 📝 Request history tracking
- ⚡ Fast and reliable

## Commands

### fetch:get

Make HTTP GET requests.

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

**Flags:**

- `--header, -H` - Custom header (can be used multiple times)
- `--cache, -c` - Use cache
- `--cache-ttl` - Cache TTL in seconds (default: 3600)
- `--format, -f` - Output format (json, table)
- `--verbose, -v` - Show response headers

### fetch:post

Make HTTP POST requests.

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

**Flags:**

- `--data, -d` - Request body data (required)
- `--header, -H` - Custom header (can be used multiple times)
- `--format, -f` - Output format (json, table)
- `--verbose, -v` - Show response headers

### fetch:cache:clear

Clear the response cache.

```bash
# Clear all cache
clio fetch:cache:clear

# Clear specific URL
clio fetch:cache:clear --url https://api.example.com/data
```

**Flags:**

- `--url, -u` - Clear cache for specific URL only

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
```

### Caching Expensive Requests

```bash
# First request (hits API)
clio fetch:get https://api.example.com/expensive --cache

# Subsequent requests (from cache, within TTL)
clio fetch:get https://api.example.com/expensive --cache

# Custom cache duration (2 hours)
clio fetch:get https://api.example.com/expensive --cache --cache-ttl 7200
```

### Authenticated Requests

```bash
# Bearer token
clio fetch:get https://api.example.com/protected \
  --header "Authorization: Bearer your-token"

# API key
clio fetch:get https://api.example.com/protected \
  --header "X-API-Key: your-key"

# Basic auth (use base64 encoded credentials)
clio fetch:get https://api.example.com/protected \
  --header "Authorization: Basic base64-encoded-credentials"
```

## Configuration

Cache is stored in:

```
~/.cache/clio/http-cache/
```

## Features

### Automatic Retries

The plugin automatically retries failed requests with exponential backoff:

- Max retries: 3
- Initial delay: 1000ms
- Backoff multiplier: 2x

Failed requests are retried for:

- Network errors
- 5xx server errors
- Timeout errors

### Response Caching

GET requests can be cached to improve performance:

- Cache duration configurable (default: 1 hour)
- Per-URL caching
- Automatic cache expiration
- Manual cache clearing

### Request History

All requests are logged to command history:

```bash
clio history:list
```

## Extensions

### @cli-ops/clio-plugin-fetch-oauth

Extends fetch plugin with OAuth 2.0 authentication.

See [plugins/clio-plugin-fetch/src/extensions/clio-plugin-fetch-oauth](https://github.com/archubbuck/cli-ops/tree/main/plugins/clio-plugin-fetch/src/extensions/clio-plugin-fetch-oauth) for implementation example.

## Related

- [Plugin Development Guide](./development)
- [Tasks Plugin](./tasks)
- [Repo Plugin](./repo)
