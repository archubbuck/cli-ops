````markdown
# cli-beta-plugin-auth-oauth

> OAuth 2.0 authentication plugin for cli-beta API client

## Installation

```bash
beta plugins install cli-beta-plugin-auth-oauth
```

## Usage

### Authenticate with OAuth

```bash
# Default (GitHub)
beta oauth login

# Specify provider
beta oauth login --provider google

# Custom scopes
beta oauth login --provider github --scopes "read:user repo"

# Custom callback port
beta oauth login --port 3000
```

## Configuration

OAuth tokens are automatically stored in your config file (`~/.beta/config.json`).

Plugin settings can be customized:

```json
{
  "plugins": {
    "oauth": {
      "defaultProvider": "github",
      "autoRefresh": true,
      "tokenExpiry": 3600
    }
  }
}
```

## Features

- ✅ Multiple OAuth providers (GitHub, Google, GitLab)
- ✅ Automatic token injection into requests
- ✅ Customizable scopes
- ✅ Local callback server
- ✅ Token storage and management

## Events

This plugin emits and listens to:

**Emits:**

- `oauth:login:success` - After successful authentication
- `oauth:plugin:ready` - When plugin initializes

**Listens:**

- `request:before` - To inject auth headers

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
