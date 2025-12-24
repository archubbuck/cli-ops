# Shared TypeScript Configurations

Base TypeScript configurations for different use cases.

## Configurations

### `base.json`
Shared foundation with all strict settings enabled.

**Features:**
- All strict type checking enabled
- No unused variables/parameters allowed
- Implicit returns forbidden
- Case-sensitive file names enforced
- Maximum type safety

### `cli.json`
For CLI applications (oclif).

**Extends:** `base.json`

**Additional:**
- Composite builds enabled
- Incremental compilation
- Output to `dist/`
- Source from `src/`

### `library.json`
For shared packages/libraries.

**Extends:** `base.json`

**Additional:**
- Declaration files generated
- Declaration maps for IDE support
- Composite builds for project references
- Optimized for library consumption

## Usage

### In CLI Applications

```json
{
  "extends": "../../tooling/tsconfig-base/cli.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../../packages/shared-core" },
    { "path": "../../packages/shared-commands" }
  ]
}
```

### In Shared Packages

```json
{
  "extends": "../../tooling/tsconfig-base/library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

## Strict Mode Benefits

Our strict configuration catches:
- Null/undefined errors at compile time
- Unused code
- Implicit any types
- Type inconsistencies
- Missing return statements
- Case sensitivity issues

This prevents runtime errors and improves code quality significantly.
