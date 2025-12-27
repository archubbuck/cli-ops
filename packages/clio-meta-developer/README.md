# @cli-ops/clio-meta-developer

Meta-package for developers that installs clio with fetch and repo plugins.

## Installation

```bash
npm install -g @cli-ops/clio-meta-developer
```

This will install:
- **@cli-ops/clio** - Core CLI with task management
- **@cli-ops/clio-plugin-fetch** - HTTP API client
- **@cli-ops/clio-plugin-repo** - Git/GitHub developer tools

## Included Plugins

### Tasks (bundled with clio)
```bash
clio tasks:create "My task"
clio tasks:list
```

### Fetch
```bash
clio fetch:get https://api.github.com/users/octocat
clio fetch:post https://api.example.com/data --data '{"key":"value"}'
clio auth:login
```

### Repo
```bash
clio repo:status
clio repo:clone owner/repo
clio repo:pr --list
```

## Documentation

See the [main documentation](../../README.md) for more information.
