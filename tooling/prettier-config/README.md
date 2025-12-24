# Shared Prettier Configuration

Opinionated code formatting for consistent style across the workspace.

## Style Choices

- **No semicolons** - Cleaner, modern syntax
- **Single quotes** - Consistent string formatting
- **Trailing commas** - Easier git diffs
- **100 char width** - Balance readability and screen space
- **2 space indentation** - Standard JavaScript convention
- **LF line endings** - Unix-style for consistency

## Usage

In your package's `package.json`:

```json
{
  "prettier": "../../tooling/prettier-config"
}
```

Or in `.prettierrc.js`:

```javascript
module.exports = require('../../tooling/prettier-config')
```

## Integration

Auto-formats on save in VS Code (configured in workspace settings).
Auto-formats on commit via lint-staged.

## Example Output

**Before:**
```typescript
const obj={a:1,b:2};function test(x,y){return x+y}
```

**After:**
```typescript
const obj = { a: 1, b: 2 }
function test(x, y) {
  return x + y
}
```
