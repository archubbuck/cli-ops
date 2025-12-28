#!/bin/bash
# Install dependencies to update lockfile with new plugins
echo "Installing dependencies to update lockfile..."
pnpm install

# Add the updated lockfile
echo "Staging lockfile..."
git add pnpm-lock.yaml

# Try commit again
echo "Attempting commit..."
git commit -m "feat: refactor extension plugins to top-level packages with formalized hook system

- Move extension plugins from nested structure to top-level packages
- Add BaseExtensionPlugin class for formalized extension architecture
- Implement declarative hook registration system
- Add plugin metadata validation
- Update all plugins to use new architecture
- Fix ESLint and TypeScript configuration for plugin files
- Add comprehensive ADR and documentation"

echo "Done!"
