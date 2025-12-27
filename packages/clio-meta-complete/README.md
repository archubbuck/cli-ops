# @cli-ops/clio-meta-complete

Meta-package for complete installation with all clio plugins.

## Installation

```bash
npm install -g @cli-ops/clio-meta-complete
```

This will install:
- **@cli-ops/clio** - Core CLI with task management
- **@cli-ops/clio-plugin-fetch** - HTTP API client
- **@cli-ops/clio-plugin-repo** - Git/GitHub developer tools

## All Available Commands

### Tasks (bundled)
```bash
clio tasks:create
clio tasks:list
clio tasks:update
clio tasks:delete
```

### Fetch
```bash
clio fetch:get URL
clio fetch:post URL
clio auth:login
```

### Repo
```bash
clio repo:status
clio repo:clone
clio repo:pr
```

### Core
```bash
clio config:get
clio config:set
clio history:list
clio doctor
clio plugins
```

## Documentation

See the [main documentation](../../README.md) for more information.
