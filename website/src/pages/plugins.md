---
title: Plugin Registry
description: Discover and install community plugins for Clio
---

# Plugin Registry

Browse official and community-contributed plugins for Clio.

## Official Plugins

### @cli-ops/clio-plugin-tasks
**Task Management** - Built-in with clio core

Manage tasks and todos from the command line.

```bash
# Already available in clio
clio tasks:create "Write documentation"
clio tasks:list
clio tasks:update 1 --status done
```

**Features:**
- ✅ Create, list, update, and delete tasks
- 🏷️ Tags and categories
- 📊 Status tracking (pending, in-progress, done)
- 🔍 Search and filter

**Links:**
- [npm](https://www.npmjs.com/package/@cli-ops/clio-plugin-tasks)
- [GitHub](https://github.com/archubbuck/cli-ops/tree/main/packages/clio-plugin-tasks)
- [Documentation](/docs/plugins/tasks)

---

### @cli-ops/clio-plugin-fetch
**HTTP Client** - Install separately

Make HTTP requests from the command line with a simple, intuitive API.

```bash
# Install
clio plugins:install @cli-ops/clio-plugin-fetch

# Use
clio fetch:get https://api.github.com/users/octocat
clio fetch:post https://api.example.com/users \
  --body '{"name":"Alice"}'
```

**Features:**
- 🌐 GET, POST, PUT, DELETE requests
- 📝 Custom headers and body
- 🎨 JSON response formatting
- ⚙️ Configuration for base URLs and auth

**Links:**
- [npm](https://www.npmjs.com/package/@cli-ops/clio-plugin-fetch)
- [GitHub](https://github.com/archubbuck/cli-ops/tree/main/packages/clio-plugin-fetch)
- [Documentation](/docs/plugins/fetch)

---

### @cli-ops/clio-plugin-repo
**Repository Tools** - Install separately

Git and GitHub integration for developers.

```bash
# Install
clio plugins:install @cli-ops/clio-plugin-repo

# Use
clio repo:status
clio repo:clone https://github.com/user/repo.git
clio repo:pr create --title "Add feature"
```

**Features:**
- 📂 Repository status and cloning
- 🔀 Pull request creation and management
- 🏷️ Release management
- ⚙️ GitHub API integration

**Links:**
- [npm](https://www.npmjs.com/package/@cli-ops/clio-plugin-repo)
- [GitHub](https://github.com/archubbuck/cli-ops/tree/main/packages/clio-plugin-repo)
- [Documentation](/docs/plugins/repo)

---

## Community Plugins

### @cli-ops/clio-plugin-jira
**Jira Integration** - Community contributed

Manage Jira issues from the command line.

```bash
clio plugins:install @cli-ops/clio-plugin-jira
clio jira:list --project PROJ
clio jira:create --title "Bug report"
```

**Maintainer:** Community  
**Status:** Example plugin

---

### @cli-ops/clio-plugin-auth-oauth
**OAuth Authentication** - Community contributed

OAuth 2.0 authentication flows for APIs.

```bash
clio plugins:install @cli-ops/clio-plugin-auth-oauth
clio auth:login --provider github
clio auth:token
```

**Maintainer:** Community  
**Status:** Example plugin

---

### @cli-ops/clio-plugin-git-hooks
**Git Hooks Management** - Community contributed

Manage Git hooks for your repositories.

```bash
clio plugins:install @cli-ops/clio-plugin-git-hooks
clio hooks:install --type pre-commit
clio hooks:list
```

**Maintainer:** Community  
**Status:** Example plugin

---

## Submit Your Plugin

Have you built a plugin for Clio? Share it with the community!

### Requirements
- Published to npm with `clio-plugin-` in the name
- Includes README with installation and usage instructions
- Follows [plugin development best practices](/docs/plugins/best-practices)
- Includes tests and CI/CD

### Submission Process

1. **Create a PR** to add your plugin to this registry:
   ```markdown
   ### @your-org/clio-plugin-name
   **Description** - Brief tagline

   What your plugin does...

   **Maintainer:** Your Name
   **Links:** [npm](url) | [GitHub](url) | [Docs](url)
   ```

2. **Plugin Verification** - Our automated workflow will verify:
   - ✅ Package exists on npm
   - ✅ Includes oclif configuration
   - ✅ Has README and LICENSE
   - ✅ Passes basic quality checks

3. **Review** - Maintainers will review your submission

4. **Published** - Your plugin appears in the registry!

[Submit a Plugin →](https://github.com/archubbuck/cli-ops/issues/new?template=plugin-submission.md)

---

## Plugin Development

Want to build your own plugin?

<div className="row">
  <div className="col col--6">
    <div className="card">
      <div className="card__header">
        <h3>📖 Plugin Guide</h3>
      </div>
      <div className="card__body">
        <p>Learn how to create clio plugins from scratch</p>
      </div>
      <div className="card__footer">
        <a href="/docs/plugins/getting-started" className="button button--primary button--block">
          Start Building
        </a>
      </div>
    </div>
  </div>
  
  <div className="col col--6">
    <div className="card">
      <div className="card__header">
        <h3>📦 Example Plugins</h3>
      </div>
      <div className="card__body">
        <p>Browse example plugin implementations</p>
      </div>
      <div className="card__footer">
        <a href="https://github.com/archubbuck/cli-ops/tree/main/examples" className="button button--primary button--block">
          View Examples
        </a>
      </div>
    </div>
  </div>
</div>
