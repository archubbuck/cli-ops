# @cli-ops/clio-plugin-{{name}}

{{description}}

## Installation

```bash
clio plugins:install @cli-ops/clio-plugin-{{name}}
```

## Usage

```bash
# View available commands
clio {{name}} --help

# Example command
clio {{name}}:example
```

## Commands

<!-- commands -->

- [`clio {{name}}:example`](#clio-{{name}}example)

### `clio {{name}}:example`

Example command description

```
USAGE
  $ clio {{name}}:example

DESCRIPTION
  Example command description

EXAMPLES
  $ clio {{name}}:example
```

<!-- commandsstop -->

## Development

```bash
# Install dependencies
pnpm install

# Build the plugin
pnpm build

# Run tests
pnpm test

# Run in development mode
pnpm dev {{name}}:example
```

## Contributing

See [CONTRIBUTING.md](../../docs/CONTRIBUTING.md) for guidelines.

## License

MIT
