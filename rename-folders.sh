#!/bin/bash
set -e

echo "==================================="
echo "Folder Rename Script"
echo "==================================="
echo ""

cd /workspaces/cli-ops

# Rename examples to extensions (if not already done)
if [ -d "examples" ]; then
  echo "Step 1: Renaming examples/ to extensions/..."
  mv examples extensions
  echo "✓ Renamed examples/ to extensions/"
else
  echo "✓ examples/ already renamed to extensions/"
fi

echo ""
echo "Step 2: Renaming extension plugin folders to match new naming convention..."
cd extensions

if [ -d "cli-alpha-plugin-jira" ]; then
  mv cli-alpha-plugin-jira clio-plugin-tasks-jira
  echo "✓ Renamed cli-alpha-plugin-jira/ to clio-plugin-tasks-jira/"
else
  echo "✓ cli-alpha-plugin-jira/ already renamed"
fi

if [ -d "cli-beta-plugin-auth-oauth" ]; then
  mv cli-beta-plugin-auth-oauth clio-plugin-fetch-oauth
  echo "✓ Renamed cli-beta-plugin-auth-oauth/ to clio-plugin-fetch-oauth/"
else
  echo "✓ cli-beta-plugin-auth-oauth/ already renamed"
fi

if [ -d "cli-gamma-plugin-git-hooks" ]; then
  mv cli-gamma-plugin-git-hooks clio-plugin-repo-hooks
  echo "✓ Renamed cli-gamma-plugin-git-hooks/ to clio-plugin-repo-hooks/"
else
  echo "✓ cli-gamma-plugin-git-hooks/ already renamed"
fi

cd ..

echo ""
echo "Step 3: Clearing .turbo/ cache directories..."
# Clear turbo caches
find plugins extensions -type d -name ".turbo" -exec rm -rf {} + 2>/dev/null || true
echo "✓ Cleared .turbo/ caches"

echo ""
echo "==================================="
echo "All folder renames complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Run: pnpm install"
echo "2. Run: pnpm build"
echo "3. Review changes and commit"
echo ""
