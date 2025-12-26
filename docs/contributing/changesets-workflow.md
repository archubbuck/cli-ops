# Changesets Workflow

## Overview

This project uses [Changesets](https://github.com/changesets/changesets) for version management and changelog generation. Changesets enable independent versioning of packages while maintaining clear documentation of changes.

## What is a Changeset?

A changeset is a file that describes:
1. Which packages changed
2. What type of change (major/minor/patch)
3. A summary of the change

Changesets are created during development and consumed during release.

## When to Create a Changeset

Create a changeset when you:

- ✅ Add a new feature
- ✅ Fix a bug
- ✅ Make a breaking change
- ✅ Update documentation significantly
- ✅ Change public APIs
- ❌ Update internal code without user impact
- ❌ Fix typos in comments
- ❌ Update dev dependencies only

## Creating a Changeset

### 1. Make Your Changes

Edit code, add tests, update documentation.

### 2. Run Changeset Command

```bash
pnpm changeset
```

### 3. Select Affected Packages

The CLI prompts you to select packages:

```
🦋  Which packages would you like to include?
◯ @cli-ops/cli-alpha
◯ @cli-ops/cli-beta
◯ @cli-ops/cli-gamma
◉ @cli-ops/shared-logger
◯ @cli-ops/shared-ui
```

Use space to select, enter to continue.

### 4. Choose Version Bump

For each package, choose bump type:

```
🦋  What kind of change is this for shared-logger?
  major (breaking change)
❯ minor (new feature)
  patch (bug fix)
```

#### Version Bump Guidelines

**Major (Breaking Change)**
- Changed public API
- Removed functionality
- Changed behavior in incompatible way
- Example: Renamed function, removed parameter

**Minor (New Feature)**
- Added new functionality
- Enhanced existing features
- New commands or options
- Example: New command, new configuration option

**Patch (Bug Fix)**
- Fixed bugs
- Updated documentation
- Internal improvements
- Example: Fixed crash, corrected help text

### 5. Write Summary

Enter a description of your changes:

```
🦋  Please enter a summary for this change (this will be in the changelogs)
❯ Add JSON output format support
```

Tips for good summaries:
- Start with imperative verb (Add, Fix, Update)
- Be concise but descriptive
- Focus on user impact
- Reference issue numbers if applicable

### 6. Commit Changeset

The changeset is saved to `.changeset/` directory:

```bash
git add .changeset/
git commit -m "feat: add JSON output format"
```

## Changeset File Format

Changesets are markdown files:

```markdown
---
'@cli-ops/shared-logger': minor
'@cli-ops/cli-alpha': patch
---

Add JSON output format support

This allows users to specify `--json` flag to get machine-readable output.

Example:
  alpha tasks list --json
```

## Semantic Versioning

This project follows [SemVer](https://semver.org/):

- **Major**: `1.0.0` → `2.0.0` (breaking changes)
- **Minor**: `1.0.0` → `1.1.0` (new features)
- **Patch**: `1.0.0` → `1.0.1` (bug fixes)

### Pre-1.0 Versions

For `0.x.y` versions:
- **Minor** bump can include breaking changes
- **Patch** for all other changes
- Move to `1.0.0` when API is stable

## Versioning Packages

### Update Versions

```bash
pnpm changeset version
```

This:
1. Reads all changesets
2. Updates `package.json` versions
3. Generates `CHANGELOG.md` entries
4. Deletes consumed changesets

### Review Changes

Check the updated files:

```bash
git diff packages/shared-logger/package.json
git diff packages/shared-logger/CHANGELOG.md
```

### Commit Versions

```bash
git add .
git commit -m "chore: version packages"
```

## Publishing Packages

### 1. Build Packages

```bash
pnpm build
```

### 2. Publish to Registry

```bash
pnpm changeset publish
```

This publishes all packages with updated versions.

### 3. Push Tags

```bash
git push --follow-tags
```

## Workflow Example

### Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/json-output

# 2. Make changes
# ... edit files ...

# 3. Create changeset
pnpm changeset
# Select: shared-logger (minor)
# Summary: "Add JSON output format"

# 4. Commit
git add .
git commit -m "feat: add JSON output format"

# 5. Push and create PR
git push origin feature/json-output
```

### Release Process

```bash
# 1. Update versions
pnpm changeset version

# 2. Review changes
git diff

# 3. Commit versions
git add .
git commit -m "chore: version packages"

# 4. Build
pnpm build

# 5. Publish
pnpm changeset publish

# 6. Push with tags
git push --follow-tags
```

## Multiple Changes in One PR

You can create multiple changesets:

```bash
# First change
pnpm changeset
# Summary: "Add JSON output"

# Second change  
pnpm changeset
# Summary: "Fix logging color scheme"
```

Both will be included in the next release.

## Dependent Package Updates

Changesets automatically updates dependent packages:

```
If you update:
  shared-logger: 1.0.0 → 1.1.0 (minor)

Then dependent packages also bump:
  cli-alpha: 1.0.0 → 1.0.1 (patch)
  cli-beta: 1.0.0 → 1.0.1 (patch)
```

This ensures compatibility.

## Pre-Release Versions

### Enter Pre-Release Mode

```bash
pnpm changeset pre enter beta
```

Now all version bumps create beta versions:
- `1.0.0` → `1.1.0-beta.0`
- `1.1.0-beta.0` → `1.1.0-beta.1`

### Exit Pre-Release Mode

```bash
pnpm changeset pre exit
```

Next version bump creates stable release:
- `1.1.0-beta.1` → `1.1.0`

## Changeset Configuration

Configuration in [`.changeset/config.json`](.changeset/config.json):

```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### Key Options

- **changelog**: Changelog generation method
- **commit**: Auto-commit changesets (we use false)
- **access**: NPM package access (restricted = private)
- **baseBranch**: Main branch name
- **updateInternalDependencies**: How to bump dependents

## Best Practices

### 1. One Changeset Per Feature

```bash
# ✓ Good - focused changeset
feat: add JSON output
pnpm changeset
# Summary: "Add JSON output format support"

# ✗ Avoid - multiple unrelated changes
feat: add JSON output and fix bugs and update docs
pnpm changeset
# Summary: "Various updates"
```

### 2. Descriptive Summaries

```bash
# ✓ Good
"Add --json flag for machine-readable output"

# ✗ Avoid
"Updates"
"Changes"
"Fix stuff"
```

### 3. Include Context

```markdown
---
'@cli-ops/shared-logger': minor
---

Add JSON output format support

This allows users to specify `--json` flag to get machine-readable output.
Useful for scripting and automation.

Example:
  alpha tasks list --json | jq '.tasks[] | .title'
```

### 4. Reference Issues

```markdown
---
'@cli-ops/cli-alpha': patch
---

Fix task deletion error (Issue #42)

Previously, deleting non-existent tasks would crash the CLI.
Now shows helpful error message.
```

## CI Integration

### Automated Checks

CI validates changesets on PRs:

```yaml
# .github/workflows/ci.yml
- name: Check for changeset
  run: pnpm changeset status --since=origin/main
```

### Automated Releases

CI can automate releases:

```yaml
# .github/workflows/release.yml
- name: Create Release PR
  uses: changesets/action@v1
  with:
    version: pnpm changeset version
    publish: pnpm changeset publish
```

## Troubleshooting

### Forgot to Add Changeset

```bash
# After PR merged, create changeset on main
git checkout main
git pull
pnpm changeset
git add .changeset/
git commit -m "chore: add missing changeset"
git push
```

### Wrong Version Bump

```bash
# Delete changeset file
rm .changeset/[changeset-id].md

# Create new one
pnpm changeset
```

### Conflicting Changesets

If two PRs create changesets:

```bash
# Both changesets are kept
.changeset/
  feature-a.md
  feature-b.md

# Both applied during version
```

No conflict resolution needed!

## Related Documentation

- [ADR-002: Changesets for Versioning](../adr/002-changesets-for-versioning.md)
- [Getting Started](./getting-started.md)
- [Changesets Documentation](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)

<!-- TODO: Expand with GitHub Actions automation examples -->
<!-- TODO: Add examples of complex version bump scenarios -->
<!-- TODO: Document monorepo snapshot releases -->
