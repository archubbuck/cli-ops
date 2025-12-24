# Shared ESLint Configuration

Consistent ESLint rules for all packages and CLIs in the workspace.

## Features

- **TypeScript** - Full type safety enforcement
- **Naming Conventions** - Interfaces with `I` prefix, Types with `T` prefix
- **Import Organization** - Automatic import sorting and grouping
- **Code Quality** - Best practices enforcement
- **Security** - Security vulnerability detection

## Usage

In your package's `.eslintrc.js`:

```javascript
module.exports = {
  extends: ['../../tooling/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
  },
}
```

## Key Rules

- Interfaces must start with `I`: `IUser`, `IConfig`
- Type aliases must start with `T`: `TResult`, `TOptions`
- Files must be kebab-case: `user-service.ts`
- No `console.log` (use shared-logger instead)
- No `any` types
- Explicit function return types required
- Import sorting enforced
