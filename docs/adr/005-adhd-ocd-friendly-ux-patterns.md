# ADR-005: ADHD/OCD-Friendly UX Patterns

**Status:** Accepted  
**Date:** 2025-12-26  
**Deciders:** Team  

## Context

Command-line interfaces can be overwhelming and frustrating for users with ADHD (Attention Deficit Hyperactivity Disorder) or OCD (Obsessive-Compulsive Disorder). Common pain points include:

**ADHD challenges:**
- Information overload from verbose output
- Difficulty tracking long-running operations
- Losing context during multi-step workflows
- Forgetting which commands were run
- Struggling with decision paralysis

**OCD challenges:**
- Uncertainty about command completion state
- Anxiety about destructive operations
- Need for verification before committing changes
- Desire for consistency and predictability
- Difficulty handling ambiguous states

This project aims to be an **exemplar of inclusive CLI design**, demonstrating patterns that help all users but especially benefit neurodivergent users.

## Decision

We will implement **ADHD/OCD-friendly UX patterns** throughout all CLI packages.

### Core Principles

1. **Predictability**: Commands behave consistently with clear expectations
2. **Feedback**: Always confirm what happened, especially for destructive operations
3. **Simplicity**: Minimize cognitive load in default workflows
4. **Organization**: Clear structure helps manage complexity
5. **Safety**: Prevent accidental damage with confirmations and undo

### Specific Patterns

#### For ADHD Users

**Visual Hierarchy:**
- Clear section headers with visual separators
- Use colors/icons to categorize information
- Bullet points and lists over walls of text
- Progress indicators for long operations

**Context Preservation:**
- Command history with undo capability ([shared-history](../../packages/shared-history/))
- Show relevant past commands in context
- Breadcrumb navigation for multi-step flows
- Persist state between command invocations

**Reduced Cognitive Load:**
- Sensible defaults (minimize required flags)
- Interactive prompts over memorizing syntax
- Autocomplete for common arguments
- Helpful error messages with suggestions

#### For OCD Users

**Certainty:**
- Always show completion messages ("✓ Task completed")
- Explicit confirmation of state changes
- Preview destructive operations before execution
- Detailed logs available on demand (`--debug`)

**Safety:**
- Confirmation prompts for destructive operations
- Undo/rollback capabilities where possible
- Dry-run mode (`--dry-run`) to preview changes
- Clear indication of irreversible operations

**Consistency:**
- Uniform command structure across all CLIs
- Standardized flag names (`--debug`, `--quiet`, `--yes`)
- Predictable error codes ([shared-exit-codes](../../packages/shared-exit-codes/))
- Consistent output formatting

## Consequences

### Positive

- **Inclusive by default**: Benefits all users, not just neurodivergent users
- **Reduced errors**: Confirmations prevent accidental destructive operations
- **Better debugging**: Context and history aid troubleshooting
- **Higher confidence**: Users trust the CLI won't break things
- **Improved learnability**: Consistent patterns reduce learning curve
- **Lower support burden**: Clear feedback reduces support requests

### Negative

- **More verbose output**: Extra confirmation messages take screen space
- **Implementation complexity**: Undo/history systems add architectural overhead
- **Performance overhead**: Tracking history and state has small cost
- **Development time**: Thoughtful UX patterns take longer to implement

### Neutral

- **Opinionated defaults**: Some users may prefer terser output (can use `--quiet`)
- **Confirmation prompts**: Some users may prefer `--yes` to skip prompts

## Implementation

ADHD/OCD patterns are implemented across multiple packages:

### Visual Feedback
- [packages/shared-ui/src/](../../packages/shared-ui/src/) - Spinners, progress bars, colors, icons
  - `Spinner` class for long operations
  - `ProgressBar` for multi-step processes
  - Color-coded messages (success=green, error=red, warning=yellow)
  - Icons for visual scanning (✓ ✗ ⚠ ℹ)

### Confirmation & Safety
- [packages/shared-prompts/src/](../../packages/shared-prompts/src/) - Interactive confirmations
  ```typescript
  const confirmed = await confirm('Delete 5 tasks?', { default: false })
  if (!confirmed) return
  ```
- Destructive operations always prompt unless `--yes` flag is provided
- Dry-run mode (`--dry-run`) previews without executing

### Command History & Undo
- [packages/shared-history/src/](../../packages/shared-history/src/) - Command tracking and undo
  ```bash
  cli-alpha tasks add "New task"    # Recorded in history
  cli-alpha history                 # Show recent commands
  cli-alpha undo                    # Undo last command
  ```
- SQLite-based storage for reliability
- Tracks command, timestamp, status, and undo metadata

### Consistent Structure
- [packages/shared-commands/src/base-command.ts](../../packages/shared-commands/src/base-command.ts) - Uniform command lifecycle
  - Standard hooks (preRun, postRun, onError)
  - Consistent flag parsing and validation
  - Uniform error handling

### Clear Error Messages
```typescript
// Bad: "Error: Invalid input"
// Good: 
this.error(`Task ID must be a number, received: "${input}"
  
Try: cli-alpha tasks show 42`)
```

### Colorblind-Friendly Themes
- Not just red/green for success/error
- Icons supplement colors (✓ success, ✗ error)
- High contrast mode available

## References

- [UX Patterns Documentation](../architecture/ux-patterns.md)
- [Contributing: ADHD/OCD Guidelines](../contributing/adhd-ocd-guidelines.md)
- [shared-ui Package](../../packages/shared-ui/)
- [shared-history Package](../../packages/shared-history/)
- [shared-prompts Package](../../packages/shared-prompts/)

### External Resources
- [Microsoft Inclusive Design](https://www.microsoft.com/design/inclusive/)
- [ADHD-Friendly Software Design](https://adhd-alien.com)
- [Accessible Color Palettes](https://www.a11yproject.com/posts/what-is-color-contrast/)

<!-- TODO: Expand with user testing feedback -->
<!-- TODO: Add case studies of specific pattern effectiveness -->
<!-- TODO: Document analytics on feature usage (prompts, undo, etc.) -->
