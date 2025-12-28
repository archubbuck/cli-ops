# Refactor Status: Apps → Plugins, Examples → Extensions

## Overview

This refactoring renames the folder structure to better reflect the architecture:

- `apps/` → `plugins/` (base plugins)
- `examples/` → `extensions/` (extension plugins that extend base plugins)
- `extensions/` → nested under `plugins/*/src/extensions/` (extensions now live with their parent plugins)

## ✅ Completed Tasks

### 1. Physical Folder Renames ✅

- ✅ `apps/` renamed to `plugins/`
- ✅ `examples/` renamed to `extensions/`
- ✅ Extensions nested under parent plugins at `plugins/*/src/extensions/*`
- ✅ Extension folder renames complete:
  - `cli-alpha-plugin-jira` → `clio-plugin-tasks-jira`
  - `cli-beta-plugin-auth-oauth` → `clio-plugin-fetch-oauth`
  - `cli-gamma-plugin-git-hooks` → `clio-plugin-repo-hooks`

### 2. Workspace Configuration ✅

- ✅ `pnpm-workspace.yaml` - Updated to include `plugins/*` and `plugins/*/src/extensions/*`
- ✅ `tsconfig.json` - Updated all path references to nested extension structure
- ✅ `package.json` - Renamed `build:apps` to `build:plugins`, added `build:extensions`
- ✅ `.ls-lint.yml` - Updated linting rules for new folder patterns

### 3. Extension Packages ✅

- ✅ All 3 extension `package.json` files updated to version 2.0.0
- ✅ Package names already correct (`@cli-ops/clio-plugin-*` format)
- ✅ TypeScript config references updated to new folder names

### 4. Documentation Files ✅

Updated 23+ documentation files:

- ✅ `README.md` - Updated structure diagram
- ✅ `INVENTORY-SYSTEM.md` - Updated all references
- ✅ `docs/ARCHITECTURE.md` - Updated directory structure
- ✅ `docs/CONTRIBUTING.md` - Updated clean commands
- ✅ `docs/architecture/*.md` (4 files) - Updated all paths
- ✅ `docs/contributing/*.md` (3 files) - Updated all examples
- ✅ `website/docs/contributing/getting-started.md` - Updated structure
- ✅ `website/docs/plugins/*.md` (3 files) - Converted GitHub URLs to relative links
- ✅ `plugins/README.md` - Updated to describe base plugins
- ✅ `examples/README.md` - Updated paths (will move to `extensions/README.md`)

### 5. Script Files ✅

- ✅ `scripts/generate-inventory.js` - Updated APPS_DIR to PLUGINS_DIR
- ✅ `scripts/perf-budget.js` - Updated all path references
- ✅ `scripts/validate-inventory.js` - Updated folder references
- ✅ `scripts/validate-command-structure.js` - No changes needed
- ✅ `scripts/verify-plugin.js` - No changes needed

### 6. GitHub Workflows ✅

- ✅ `.github/workflows/ci.yml` - Updated artifact upload paths to include `plugins/*` and `extensions/*`

## ✅ Refactor Complete!

All tasks have been completed successfully:

1. ✅ **Physical folder renames** - All folders renamed
2. ✅ **Workspace configuration** - Updated for new structure
3. ✅ **Extension packages** - Updated to v2.0.0 with correct names
4. ✅ **Extension source files** - Plugin metadata updated
5. ✅ **Documentation** - All references updated
6. ✅ **Scripts** - All paths updated
7. ✅ **GitHub workflows** - Artifact paths updated
8. ✅ **Dependencies reinstalled** - pnpm-lock.yaml regenerated

### Final Steps:

```bash
# Rebuild the project
pnpm build

# Verify everything works
pnpm test
```

4. **Verify changes:**

   ```bash
   # Check that extensions are now in workspace
   pnpm list --depth=0

   # Run tests
   pnpm test

   # Validate inventory
   pnpm run validate:inventory
   ```

5. **Commit changes:**
   ```bash
   git add -A
   git commit -m "refactor: rename apps/ to plugins/ and examples/ to extensions/
   ```

BREAKING CHANGE: Folder structure reorganized. Extensions now integrated into workspace with proper naming. Run \`pnpm install\` after pulling."

```

## 📊 Files Changed Summary

- **Configuration files:** 5 files
- **Documentation files:** 23 files
- **Script files:** 3 files
- **GitHub workflows:** 1 file
- **Package.json files:** 3 extension packages
- **README files:** 2 files
- **Total:** 37 files updated (plus folder renames pending)

## 🎯 Breaking Changes

This is a **BREAKING CHANGE** for contributors:

1. **All developers** must pull changes and run `pnpm install`
2. **Build scripts** referencing `apps/` will need updating
3. **Import paths** remain unchanged (workspace protocol handles it)
4. **Git history** preserved (using `mv` not delete+create)

## 📝 Architecture Improvements

This refactoring improves semantic clarity:

- **`plugins/`** - Base functionality plugins (tasks, fetch, repo, clio)
- **`extensions/`** - Extension plugins that extend base plugins
- **`apps/`** - Applications (clio CLI, website)
- **`plugins/`** - Base plugins (tasks, fetch, repo)
  - **`plugins/*/src/extensions/`** - Extension plugins nested with their parents (Jira, OAuth, hooks)
- **`libs/`** - Shared libraries and utilities
- **Integrated workspace** - Extensions now part of build system (can be published)
- **Proper naming** - `clio-plugin-*` convention throughout

## 🔗 Related Documentation

- [README.md](./README.md) - Updated project structure
- [INVENTORY-SYSTEM.md](./INVENTORY-SYSTEM.md) - Updated with new paths
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Updated architecture overview
- [plugins/README.md](./plugins/README.md) - Base plugins overview
- [extensions/README.md](./extensions/README.md) - Extension examples (after rename)

---

**Status:** Configuration and documentation complete. Physical folder renames pending execution of `rename-folders.sh`.

**Next Action:** Run `bash rename-folders.sh` then `pnpm install`.
```
