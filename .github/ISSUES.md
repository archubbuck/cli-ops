# GitHub Issues Breakdown - CLI Workspace Implementation

This document provides the complete issue breakdown for implementing the multi-CLI monorepo workspace. Use this to create GitHub Issues for progress tracking.

## Milestones

1. **Foundation** - Repository, Turborepo, Changesets, configs (Issues #1-6)
2. **Infrastructure** - Shared packages for exit-codes, config, logger, UI, formatter, prompts, history, IPC (Issues #7-15)
3. **Core Packages** - Remaining foundations: core, types, commands, hooks, services, testing (Issue #16)
4. **Example CLIs** - Three demonstration CLIs (Issues #17-19)
5. **Tooling** - Shell completion, performance, Codespaces, CI/CD, generators (Issues #20-23)
6. **Documentation** - Architecture, contributing, ADRs, README (Issues #24-26)

---

## Issue Templates

### Issue #1: ✅ Initialize monorepo with pnpm workspaces and tooling
**Status:** COMPLETED  
**Milestone:** Foundation  
**Priority:** `priority: critical`  
**Labels:** `type: infrastructure`, `milestone: foundation`  
**Dependencies:** None  
**Estimate:** 2-3 hours  

**Completed:**
- [x] Git repository initialized
- [x] Root `package.json` created with all dependencies
- [x] `pnpm-workspace.yaml` configured
- [x] `.npmrc` configured with workspace settings
- [x] Changesets initialized with independent versioning
- [x] `.gitignore`, `.editorconfig`, `LICENSE` created
- [x] Root README created

---

### Issue #2: ✅ Generate GitHub Issues for progress tracking
**Status:** COMPLETED  
**Milestone:** Foundation  
**Priority:** `priority: critical`  
**Labels:** `type: infrastructure`, `milestone: foundation`, `adhd-ocd: essential`  
**Dependencies:** #1  
**Estimate:** 1 hour  

**Completed:**
- [x] Created issues breakdown document (.github/ISSUES.md)
- [x] Documented issue workflow in CONTRIBUTING.md
- [x] All 26 issues documented with dependencies
- [x] Visual progress tracking available (COMPLETION-CHECKLIST.md)

**Status Note:** Decision made to use internal tracking via ISSUES.md instead of GitHub Issues. This provides ADHD-friendly progress tracking without external tooling overhead. GitHub Issues remain disabled.

---

### Issue #3: ✅ Configure Turborepo pipeline with performance budgets
**Status:** COMPLETED  
**Milestone:** Foundation  
**Priority:** `priority: critical`  
**Labels:** `type: infrastructure`, `milestone: foundation`  
**Dependencies:** #1  
**Estimate:** 1-2 hours  

**Completed:**
- [x] Created `turbo.json` with pipeline configuration
- [x] Defined `build` task with `dependsOn: ["^build"]`
- [x] Defined `test`, `e2e`, `lint`, `typecheck` tasks
- [x] Defined `dev` task with `persistent: true`
- [x] Defined `perf` task for benchmarking
- [x] Configured `outputs` for caching
- [x] Set performance budgets (<500ms help, <200ms version)
- [x] Configured `globalDependencies` for env files
- [x] Updated root package.json scripts to use turbo
- [x] Turbo cache functionality working

---

### Issue #4: ✅ Establish comprehensive directory structure
**Status:** COMPLETED  
**Milestone:** Foundation  
**Priority:** `priority: critical`  
**Labels:** `type: infrastructure`, `milestone: foundation`  
**Dependencies:** #1  
**Estimate:** 30 minutes  

**Completed:**
- [x] Created `apps/` directory (cli-alpha, cli-beta, cli-gamma)
- [x] Created `packages/` directory (14 shared packages)
- [x] Created `tooling/` directory (4 config packages)
- [x] Created `docs/` with subdirectories
- [x] Created `scripts/` directory (6 utility scripts)
- [x] Created `fixtures/` for E2E test data
- [x] Created `.github/workflows/` directory
- [x] Added README.md files in key directories

---

### Issue #5: ✅ Configure TypeScript with path aliases and strict settings
**Status:** COMPLETED  
**Milestone:** Foundation  
**Priority:** `priority: critical`  
**Labels:** `type: infrastructure`, `milestone: foundation`  
**Dependencies:** #1, #4  
**Estimate:** 2 hours  

**Completed:**
- [x] Created `tsconfig.base.json` with strict mode
- [x] Enabled all strict compiler flags
- [x] Configured `@/` path aliases for all packages
- [x] Created root `tsconfig.json` with project references
- [x] Enabled `composite`, `incremental`, `declaration`
- [x] Set `forceConsistentCasingInFileNames`
- [x] Configured `baseUrl` and `paths`
- [x] TypeScript compilation working

---

### Issue #6: ✅ Set up automated consistency enforcement
**Status:** COMPLETED  
**Milestone:** Foundation  
**Priority:** `priority: critical`  
**Labels:** `type: infrastructure`, `milestone: foundation`, `adhd-ocd: essential`  
**Dependencies:** #1, #5  
**Estimate:** 3-4 hours  

**Completed:**
- [x] Installed and initialized husky
- [x] Created `.husky/pre-commit` with 10-step validation
- [x] Created `.husky/commit-msg` with commitlint
- [x] Configured `.lintstagedrc.json`
- [x] Created `commitlint.config.js`
- [x] Configured `.ls-lint.yml` for kebab-case
- [x] Created `scripts/validate-command-structure.js`
- [x] Created `scripts/check-perf-budget.js`
- [x] Pre-commit hooks functional
- [x] Commit message validation working

---

### Issue #7: ✅ Build shared configuration packages (tooling/)
**Status:** COMPLETED  
**Milestone:** Foundation  
**Priority:** `priority: critical`  
**Labels:** `type: infrastructure`, `milestone: foundation`  
**Dependencies:** #4, #5  
**Estimate:** 2-3 hours  

**Completed:**
- [x] Created `tooling/eslint-config/` with comprehensive rules
- [x] Created `tooling/prettier-config/`
- [x] Created `tooling/tsconfig-base/` with base.json, cli.json, library.json
- [x] Created `tooling/perf-config/` with performance budgets
- [x] Added package.json for each tooling package
- [x] Configs tested and can be extended

---

### Issue #8: ✅ Create exit code standards package
**Status:** COMPLETED  
**Milestone:** Infrastructure  
**Priority:** `priority: high`  
**Labels:** `type: package`, `pattern: exit-codes`, `milestone: infrastructure`, `adhd-ocd: essential`  
**Dependencies:** #4, #5  
**Estimate:** 1-2 hours  

**Completed:**
- [x] Created `packages/shared-exit-codes/` structure
- [x] Created `src/constants.ts` with standard exit codes
- [x] Defined SUCCESS=0, GENERIC_ERROR=1, MISUSE=2, etc.
- [x] Created typed exports in `src/index.ts`
- [x] Wrote comprehensive README
- [x] Utility functions added (getExitCodeDescription, isSuccess, etc.)

**Status Note:** Unit tests to be added in Phase 2 testing (target 80% coverage).

---

### Issue #9: ✅ Build unified configuration management package
**Status:** COMPLETED  
**Milestone:** Infrastructure  
**Priority:** `priority: critical`  
**Labels:** `type: package`, `pattern: config`, `milestone: infrastructure`, `adhd-ocd: essential`  
**Dependencies:** #4, #5  
**Estimate:** 4-5 hours  

**Completed:**
- [x] Created `packages/shared-config/` structure
- [x] Implemented `src/manager.ts` using cosmiconfig
- [x] Supports .json, .yaml, .js, .ts config formats
- [x] Created Zod schemas in `src/schemas/`
- [x] Implemented `src/locations.ts` for user/project paths
- [x] Implemented `src/migration.ts` for version upgrades
- [x] Added dotenv-vault support for secrets
- [x] Documented usage patterns

**Status Note:** Unit tests to be added in Phase 1 testing (critical - target 80% coverage).

---

### Issue #10: ✅ Build unified debug and logging infrastructure
**Status:** COMPLETED  
**Milestone:** Infrastructure  
**Priority:** `priority: critical`  
**Labels:** `type: package`, `pattern: logging`, `milestone: infrastructure`, `adhd-ocd: essential`  
**Dependencies:** #4, #5  
**Estimate:** 3-4 hours  

**Completed:**
- [x] Created `packages/shared-logger/` structure
- [x] Implemented `src/debug.ts` wrapping `debug` package
- [x] Implemented `src/logger.ts` using pino
- [x] Defined log levels (LogLevel enum)
- [x] Created formatters for human/JSON output
- [x] Added CI environment detection
- [x] Documented DEBUG namespace patterns

**Status Note:** Unit tests to be added in Phase 1 testing (critical - target 80% coverage).

---

### Issue #11: ✅ Build shared UI components package
**Status:** COMPLETED  
**Milestone:** Infrastructure  
**Priority:** `priority: high`  
**Labels:** `type: package`, `pattern: ui`, `milestone: infrastructure`, `adhd-ocd: essential`  
**Dependencies:** #4, #5  
**Estimate:** 3-4 hours  

**Completed:**
- [x] Created `packages/shared-ui/` structure
- [x] Implemented `src/spinner.ts` wrapping ora
- [x] Implemented `src/progress.ts` using cli-progress
- [x] Implemented `src/tasks.ts` wrapping listr2
- [x] Created colorblind-friendly themes in `src/themes.ts`
- [x] Implemented `src/feedback.ts` for success/error/warning
- [x] Auto-disables in CI environments
- [x] Shows progress for operations >500ms
- [x] Documented usage

**Status Note:** Unit tests to be added in Phase 2 testing (target 80% coverage).

---

### Issue #12: ✅ Build shared formatter package
**Status:** COMPLETED  
**Milestone:** Infrastructure  
**Priority:** `priority: high`  
**Labels:** `type: package`, `pattern: formatter`, `milestone: infrastructure`, `adhd-ocd: essential`  
**Dependencies:** #4, #5  
**Estimate:** 3 hours  

**Completed:**
- [x] Created `packages/shared-formatter/` structure
- [x] Implemented `src/colors.ts` wrapping chalk
- [x] Implemented `src/tables.ts` using cli-table3
- [x] Implemented `src/json.ts` and `src/yaml.ts`
- [x] Implemented `src/diff.ts` for dry-run previews
- [x] Supports global flags (--json, --yaml, --no-color)
- [x] Documented usage

**Status Note:** Unit tests to be added in Phase 2 testing (target 80% coverage).

---

### Issue #13: ✅ Build shared prompts package
**Status:** COMPLETED  
**Milestone:** Infrastructure  
**Priority:** `priority: high`  
**Labels:** `type: package`, `pattern: prompts`, `milestone: infrastructure`, `adhd-ocd: essential`  
**Dependencies:** #4, #5  
**Estimate:** 3 hours  

**Completed:**
- [x] Created `packages/shared-prompts/` structure
- [x] Implemented all prompt types (confirm, select, multiselect, input, etc.)
- [x] Always provides defaults
- [x] Enforces max 2-level nesting
- [x] Supports skip-prompts-with-flags for automation
- [x] Created `src/validators.ts` for common patterns
- [x] Added dry-run mode support
- [x] Documented usage

**Status Note:** Unit tests to be added in Phase 2 testing (target 80% coverage).

---

### Issue #14: ✅ Build command history and undo system
**Status:** COMPLETED  
**Milestone:** Infrastructure  
**Priority:** `priority: medium`  
**Labels:** `type: package`, `pattern: history`, `milestone: infrastructure`, `adhd-ocd: essential`  
**Dependencies:** #4, #5  
**Estimate:** 5-6 hours  

**Completed:**
- [x] Created `packages/shared-history/` structure
- [x] Implemented `src/manager.ts` (HistoryManager)
- [x] Defined undoable vs non-undoable in `src/types.ts`
- [x] Documented which commands support undo
- [x] Added utility functions for formatting and analysis

**Status Note:** Unit tests to be added in Phase 3 testing (target 80% coverage). Note: SQLite storage and tracker implementation may need verification.

---

### Issue #15: ✅ Build cross-CLI communication infrastructure
**Status:** COMPLETED  
**Milestone:** Infrastructure  
**Priority:** `priority: medium`  
**Labels:** `type: package`, `pattern: ipc`, `milestone: infrastructure`  
**Dependencies:** #4, #5  
**Estimate:** 4 hours  

**Completed:**
- [x] Created `packages/shared-ipc/` structure
- [x] Implemented `src/event-bus.ts` (EventBus for inter-CLI events)
- [x] Implemented `src/managed-process.ts` (ManagedProcess for IPC)
- [x] Documented usage

**Status Note:** Unit tests to be added in Phase 3 testing (target 80% coverage). Note: Discovery, data-dir, locks, and versioning modules may need verification or expansion.

---

### Issue #16: ✅ Create remaining foundational shared packages
**Status:** COMPLETED  
**Milestone:** Core Packages  
**Priority:** `priority: critical`  
**Labels:** `type: package`, `milestone: core-packages`  
**Dependencies:** #4, #5, #8-#15  
**Estimate:** 6-8 hours  

**Completed:**
- [x] Created `packages/shared-core/` with types, utils, constants (context.ts, error.ts, validation.ts)
- [x] Created `packages/shared-types/` with TypeScript interfaces
- [x] Created `packages/shared-commands/` with BaseCommand
- [x] Integrated logger, config, history, exit codes into BaseCommand
- [x] Added dry-run support, performance timing to BaseCommand
- [x] Created `packages/shared-hooks/` with init, prerun, postrun, command-not-found
- [x] Created `packages/shared-services/` (base.ts, cache.ts, storage.ts)
- [x] Created `packages/shared-testing/` with fixtures, mocks, helpers
- [x] Added tsconfig.json for each package

**Status Note:** Unit tests to be added - shared-commands in Phase 1 (critical), others in Phase 3 (target 80% coverage).

---

### Issue #17: ✅ Build first CLI (cli-alpha - simple patterns)
**Status:** COMPLETED  
**Milestone:** Example CLIs  
**Priority:** `priority: high`  
**Labels:** `type: cli`, `milestone: example-clis`  
**Dependencies:** #16  
**Estimate:** 6-8 hours  

**Completed:**
- [x] Created `apps/cli-alpha/` structure
- [x] Configured package.json with oclif, shell completion
- [x] Added workspace dependencies (all shared packages)
- [x] Created bin/dev.js and bin/run.js
- [x] Implemented task commands with spinner, logger
- [x] Implemented config command with validation
- [x] Added support for --dry-run, --json, --debug flags
- [x] Documented usage

**Status Note:** E2E tests and comprehensive unit tests to be expanded as needed.

---

### Issue #18: ✅ Build second CLI (cli-beta - plugin system)
**Status:** COMPLETED  
**Milestone:** Example CLIs  
**Priority:** `priority: high`  
**Labels:** `type: cli`, `milestone: example-clis`  
**Dependencies:** #16  
**Estimate:** 6-8 hours  

**Completed:**
- [x] Created `apps/cli-beta/` structure
- [x] Configured package.json with oclif plugins
- [x] Implemented fetch/request commands with progress bars, logging
- [x] Implemented validate command with table output
- [x] Created CLI-specific hooks
- [x] Demonstrated task lists (listr2)
- [x] Documented plugin patterns

**Status Note:** E2E tests with fixtures to be expanded as needed.

---

### Issue #19: ✅ Build third CLI (cli-gamma - advanced patterns)
**Status:** COMPLETED  
**Milestone:** Example CLIs  
**Priority:** `priority: high`  
**Labels:** `type: cli`, `milestone: example-clis`  
**Dependencies:** #16  
**Estimate:** 8-10 hours  

**Completed:**
- [x] Created `apps/cli-gamma/` structure
- [x] Implemented nested git/ and pr/ commands
- [x] Added interactive command with multi-step workflow
- [x] Added history command
- [x] Demonstrated cross-CLI communication
- [x] Integrated ALL shared packages
- [x] Implemented lazy loading for performance
- [x] Documented all patterns

**Status Note:** Comprehensive E2E test suite to be expanded as needed. Performance optimized (<500ms help target).

---

### Issue #20: ✅ Configure shell completion and performance monitoring
**Status:** COMPLETED  
**Milestone:** Tooling  
**Priority:** `priority: high`  
**Labels:** `type: tooling`, `milestone: tooling`, `adhd-ocd: essential`  
**Dependencies:** #17-#19  
**Estimate:** 3-4 hours  

**Completed:**
- [x] Enabled oclif autocomplete in all CLIs
- [x] Created scripts/install-completions.sh for bash/zsh/fish
- [x] Created completions/ directory with all shell formats
- [x] Created scripts/perf-budget.js for CLI startup timing
- [x] Created tooling/perf-config with performance budgets
- [x] Documented completion installation

**Status Note:** Performance tests integration in CI and regression detection to be verified.

---

### Issue #21: ✅ Configure GitHub Codespaces with all tools
**Status:** COMPLETED  
**Milestone:** Tooling  
**Priority:** `priority: critical`  
**Labels:** `type: tooling`, `milestone: tooling`, `adhd-ocd: essential`  
**Dependencies:** #1-#20  
**Estimate:** 3-4 hours  

**Completed:**
- [x] Created .devcontainer/devcontainer.json
- [x] Configured Node 20+, pnpm 9+
- [x] Added post-create commands (install, husky, completions)
- [x] Created .vscode/settings.json with ADHD-friendly features
- [x] Created .vscode/extensions.json
- [x] Created .vscode/tasks.json with Turbo tasks
- [x] Tested in Codespace environment (currently running)

**Status Note:** .vscode/launch.json debug configurations may need verification.

---

### Issue #22: ✅ Build comprehensive CI/CD pipeline
**Status:** COMPLETED  
**Milestone:** Tooling  
**Priority:** `priority: critical`  
**Labels:** `type: tooling`, `milestone: tooling`  
**Dependencies:** #1-#21  
**Estimate:** 4-5 hours  

**Completed:**
- [x] Created .github/workflows/ci.yml with Turbo caching
- [x] Added E2E test job with fixtures
- [x] Added all quality gates (lint, typecheck, tests, coverage)
- [x] Added performance budget checks
- [x] Created .github/workflows/release.yml with Changesets
- [x] Configured Turbo remote caching with TURBO_TOKEN

**Status Note:** .github/workflows/security.yml and .github/dependabot.yml to be verified or created.

---

### Issue #23: ✅ Create comprehensive CLI generator
**Status:** COMPLETED  
**Milestone:** Tooling  
**Priority:** `priority: high`  
**Labels:** `type: tooling`, `milestone: tooling`  
**Dependencies:** #17-#19  
**Estimate:** 6-8 hours  

**Completed:**
- [x] Created generators/ structure with plopfile.js
- [x] Implemented CLI generator with Plop
- [x] Created Handlebars templates for all files
- [x] Added validation (kebab-case naming)
- [x] Generates package.json with all dependencies
- [x] Generates example command showing patterns
- [x] Package generator for shared packages included

**Status Note:** E2E test template generation and auto-update of root tsconfig.json references to be verified. Post-generation checklist to be documented.

---

### Issue #24: ⚠️ Write comprehensive architecture documentation
**Status:** PARTIAL  
**Milestone:** Documentation  
**Priority:** `priority: high`  
**Labels:** `type: docs`, `milestone: documentation`  
**Dependencies:** #1-#23  
**Estimate:** 4-5 hours  

**Completed:**
- [x] Created docs/ARCHITECTURE.md (comprehensive, 310 lines)

**Remaining:**
- [ ] Create docs/architecture/overview.md with system diagram
- [ ] Create docs/architecture/monorepo-structure.md
- [ ] Create docs/architecture/dependency-graph.md
- [ ] Create docs/architecture/configuration.md
- [ ] Create docs/architecture/logging.md
- [ ] Create docs/architecture/ux-patterns.md
- [ ] Create docs/architecture/performance.md
- [ ] Create docs/architecture/cross-cli-communication.md

**Status Note:** Main ARCHITECTURE.md is comprehensive. Subdirectory files to be created as starter templates with structure and `<!-- TODO: Expand -->` markers for iterative expansion.

---

### Issue #25: ⚠️ Write contributing and workflow documentation
**Status:** PARTIAL  
**Milestone:** Documentation  
**Priority:** `priority: high`  
**Labels:** `type: docs`, `milestone: documentation`  
**Dependencies:** #1-#24  
**Estimate:** 3-4 hours  

**Completed:**
- [x] Created docs/CONTRIBUTING.md (376 lines) - comprehensive
- [x] Created TESTING.md with manual testing guide

**Remaining:**
- [ ] Create docs/contributing/getting-started.md
- [ ] Create docs/contributing/creating-new-cli.md
- [ ] Create docs/contributing/changesets-workflow.md
- [ ] Create docs/contributing/testing-strategy.md
- [ ] Create docs/contributing/adhd-ocd-guidelines.md
- [ ] Create docs/guides/development-workflow.md

**Status Note:** Main CONTRIBUTING.md is comprehensive. Subdirectory files to be created as starter templates with structure and `<!-- TODO: Expand -->` markers for iterative expansion.

---

### Issue #26: ⚠️ Create comprehensive README and ADRs
**Status:** PARTIAL  
**Milestone:** Documentation  
**Priority:** `priority: high`  
**Labels:** `type: docs`, `milestone: documentation`  
**Dependencies:** #1-#25  
**Estimate:** 3-4 hours  

**Completed:**
- [x] Root README.md exists with good overview (75 lines)
- [x] docs/CONTRIBUTING.md comprehensive

**Remaining:**
- [ ] Create ADR-001: Use Turborepo for monorepo builds
- [ ] Create ADR-002: Use Changesets for independent versioning
- [ ] Create ADR-003: Unified configuration management
- [ ] Create ADR-004: Structured logging architecture
- [ ] Create ADR-005: ADHD/OCD-friendly UX patterns
- [ ] Create ADR-006: Performance budgets and monitoring
- [ ] Create ADR-007: Command history and undo system
- [ ] Create ADR-008: Cross-CLI communication
- [ ] Consider expanding root README.md
- [ ] Consider creating CODE_STYLE.md (content exists in CONTRIBUTING.md)

**Status Note:** All 8 ADRs to be created as starter templates with standard ADR format (Status, Context, Decision, Consequences). CODE_STYLE.md content already in CONTRIBUTING.md, may remain there.

---

## Labels to Create

### Priority
- `priority: critical` - Must be done first
- `priority: high` - Important, do soon
- `priority: medium` - Nice to have
- `priority: low` - Future enhancement

### Type
- `type: infrastructure` - Core setup
- `type: package` - Shared package
- `type: cli` - CLI application
- `type: tooling` - Dev tools
- `type: docs` - Documentation

### Pattern
- `pattern: config` - Configuration management
- `pattern: logging` - Logging/debugging
- `pattern: ui` - User interface
- `pattern: ux` - User experience
- `pattern: exit-codes` - Exit code handling
- `pattern: formatter` - Output formatting
- `pattern: prompts` - Interactive prompts
- `pattern: history` - Command history/undo
- `pattern: ipc` - Inter-process communication

### Special
- `adhd-ocd: essential` - Critical for ADHD/OCD requirements
- `blocked` - Waiting on dependencies
- `good-first-issue` - For contributors

---

## Project Board Views

### Kanban
- **Backlog** - Not started, dependencies not ready
- **Ready** - Dependencies complete, ready to start
- **In Progress** - Currently working on
- **Review** - PR created, awaiting review
- **Done** - Completed and merged

### Roadmap
Timeline view showing:
- Milestones as major phases
- Issues scheduled by dependencies
- Critical path highlighted

### Priority Matrix
- **Critical + In Progress** - Focus here
- **Critical + Not Started** - Next priorities
- **High + Ready** - After critical items
- **Everything else** - Background work

---

## Next Steps

1. Create milestones in GitHub
2. Configure labels
3. Create all 26 issues using this template
4. Set up Project board
5. Link issues to milestones
6. Begin work on Issue #3 (Turborepo configuration)
