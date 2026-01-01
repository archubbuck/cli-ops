---
sidebar_position: 5
sidebar_label: Release Process
title: Release Process
description: Release process and GitHub Actions workflow guidelines for CLI Ops
---

# Release Process

This document describes the release process for the CLI Ops monorepo, including mitigation strategies for GitHub Actions restrictions on PR creation and approval.

## Table of Contents

- [Overview](#overview)
- [NPM Publishing Methods](#npm-publishing-methods)
- [GitHub Actions Restrictions](#github-actions-restrictions)
- [Release Process Options](#release-process-options)
- [Recommended Approach](#recommended-approach)
- [Workflow Examples](#workflow-examples)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

CLI Ops uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing packages to npm. The release process involves:

1. **Development**: Contributors create changesets describing their changes
2. **Version PR**: Automated PR that bumps package versions and updates changelogs
3. **Publishing**: Automated publish to npm when version PR is merged
4. **Provenance**: Supply chain security attestations for published packages

## NPM Publishing Methods

The CLI Ops release workflow supports two npm authentication methods:

### 1. Trusted Publishing with OIDC (Recommended)

**Modern, secure approach using OpenID Connect:**

- ✅ No long-lived npm tokens to manage
- ✅ Automatic provenance attestation for all packages
- ✅ No token expiration or rotation concerns
- ✅ Enhanced supply chain security
- ✅ Industry standard approach (2024+)

**Setup**: Configure trusted publishers on npmjs.com for each package. See [NPM Trusted Publishing Guide](./NPM-TRUSTED-PUBLISHING.md) for detailed instructions.

**Requirements**:
- npm CLI v9.5.0+ (in workflow)
- Public GitHub repository
- `id-token: write` permission (already configured)
- Trusted publisher configured on npmjs.com

### 2. Token-Based Publishing (Traditional)

**Classic approach using npm access tokens:**

- ⚠️ Requires managing `NPM_TOKEN` secret
- ⚠️ Token must be rotated periodically
- ⚠️ Risk of token leakage or theft
- ⚠️ Manual `--provenance` flag needed for attestation
- ✅ Simpler initial setup
- ✅ Works with private repositories

**Setup**: Create npm access token and add as `NPM_TOKEN` repository secret.

### Migration Path

The workflow automatically detects which method to use:
- If `NPM_TOKEN` secret exists → uses token-based authentication
- If `NPM_TOKEN` secret absent → uses OIDC trusted publishing

This allows safe migration from token-based to trusted publishing. See [NPM Trusted Publishing Guide](./NPM-TRUSTED-PUBLISHING.md) for migration instructions.

## GitHub Actions Restrictions

### The Problem

GitHub has implemented restrictions to prevent GitHub Actions from creating or approving pull requests using the default `GITHUB_TOKEN`. This affects workflows that:

- Create release PRs automatically (like Changesets version PRs)
- Auto-approve PRs
- Trigger other workflows via PR events

**Error Message:**

```
GitHub Actions is not permitted to create or approve pull requests
```

### Why This Restriction Exists

This is a security measure to prevent:

- Workflow loops where PRs trigger workflows that create more PRs
- Bypassing required reviews and branch protection rules
- Potential security vulnerabilities in automated approval chains

### Impact on CLI Ops

The current release workflow uses `changesets/action@v1` which creates a "Version Packages" PR. With the default `GITHUB_TOKEN`, this may fail in repositories with strict PR creation policies.

## Release Process Options

### Option 1: Personal Access Token (PAT) - Recommended

Use a Personal Access Token with appropriate permissions to create PRs.

**Pros:**

- Full automation maintained
- Works with branch protection rules
- Can trigger subsequent workflows
- Clear audit trail

**Cons:**

- Requires token management
- Token expires (use fine-grained tokens for longer expiry)
- Associated with a specific user account

**Implementation:**

1. Create a machine user account or use a maintainer account
2. Generate a fine-grained PAT with `contents: write` and `pull_requests: write`
3. Add token as `RELEASE_TOKEN` repository secret
4. Update workflow to use this token

### Option 2: GitHub App - Enterprise/Organization Scale

Use a GitHub App for authentication.

**Pros:**

- Not tied to individual user
- More granular permissions
- Better audit logging
- No expiration concerns with proper setup

**Cons:**

- Requires GitHub App creation and installation
- More complex initial setup
- Overkill for smaller projects

**Implementation:**

1. Create GitHub App with appropriate permissions
2. Install app on repository
3. Use actions like `tibdex/github-app-token@v1` to generate tokens
4. Use generated token in workflow

### Option 3: Manual Version PR Creation

Remove automation for PR creation, keep automation for publishing.

**Pros:**

- No special tokens required
- Works in any repository configuration
- Manual review ensures intentional releases

**Cons:**

- Requires manual intervention
- Slower release cycle
- Human error potential

**Implementation:**

1. Developer runs `pnpm changeset:version` locally
2. Developer creates PR with version changes
3. After PR approval and merge, automated publishing runs

### Option 4: Two-Step Automation (Hybrid)

Separate version bumping from PR creation.

**Pros:**

- Keeps most automation
- Uses default tokens
- Clear separation of concerns

**Cons:**

- More complex workflow
- Requires workflow dispatch or other triggers
- Less seamless than full automation

## Recommended Approach

For the CLI Ops project, we recommend **Option 1 (PAT)** initially, with migration to **Option 2 (GitHub App)** if the project grows to multiple repositories or organizations.

### Implementation Steps

#### Step 1: Create a Personal Access Token

1. Create a machine user account (e.g., `cli-ops-release-bot`) or use a maintainer account
2. Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
3. Click "Generate new token"
4. Configure:
   - **Name**: `release-token` (or any descriptive name)
   - **Expiration**: 90 days or 1 year (set calendar reminder)
   - **Repository access**: Only select repositories → Select your repository
   - **Permissions**:
     - Repository permissions:
       - Contents: Read and write
       - Pull requests: Read and write
       - Metadata: Read-only (automatically selected)

#### Step 2: Add Token as Secret

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `RELEASE_TOKEN`
4. Value: Paste the generated token
5. Click "Add secret"

**Important**: The secret must either be set with a valid token value or not set at all. An empty secret will cause the fallback mechanism to use an empty value instead of falling back to `GITHUB_TOKEN`.

#### Step 2.1: Optional Environment Variables

The example workflows include optional environment variables for Turborepo remote caching:

- `TURBO_TOKEN`: Token for Turborepo remote caching
- `TURBO_TEAM`: Team identifier for Turborepo

If you're not using Turborepo, you can safely remove these environment variables from the workflow or leave them unset.

#### Step 3: Update Workflow

Update `.github/workflows/release.yml` to use the new token (see Workflow Examples below).

#### Step 4: Test

1. Create a test changeset: `pnpm changeset`
2. Commit and push to main
3. Verify the workflow creates a version PR successfully

#### Step 5: Set Up Token Rotation Reminder

- Add calendar event for token expiration date
- Document token rotation process
- Consider using longer expiration for fine-grained tokens (up to 1 year)

## Workflow Examples

### Current Workflow (May Fail with Restrictions)

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }} # ⚠️ May fail to create PRs

      - uses: ./.github/actions/setup-workspace
        with:
          registry-url: 'https://registry.npmjs.org'

      - name: Build
        run: pnpm build

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: pnpm changeset:publish
          version: pnpm changeset:version
          commit: 'chore: Version packages'
          title: 'chore: Version packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Updated Workflow (Using PAT)

```yaml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          # Use PAT for PR creation
          token: ${{ secrets.RELEASE_TOKEN }}

      - uses: ./.github/actions/setup-workspace
        with:
          registry-url: 'https://registry.npmjs.org'

      - name: Build
        run: pnpm build

      - name: Create Release Pull Request or Publish
        id: changesets
        # Security Note: For production, consider pinning to specific commit SHA
        # e.g., uses: changesets/action@aba318e9165b45b7948c60273e0b72fce0a64eb9 # v1.4.7
        uses: changesets/action@v1
        with:
          publish: pnpm changeset:publish
          version: pnpm changeset:version
          commit: 'chore: Version packages'
          title: 'chore: Version packages'
        env:
          # Use PAT for PR creation
          GITHUB_TOKEN: ${{ secrets.RELEASE_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish provenance
        if: steps.changesets.outputs.published == 'true'
        run: |
          echo "Packages published with provenance:"
          echo "${{ steps.changesets.outputs.publishedPackages }}"
```

### Manual Release Workflow (No PR Creation)

```yaml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  release:
    name: Publish
    runs-on: ubuntu-latest
    # Only publish if version PR has been merged
    if: |
      github.event.head_commit.message == 'chore: Version packages' ||
      contains(github.event.head_commit.message, '[release]')
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: ./.github/actions/setup-workspace
        with:
          registry-url: 'https://registry.npmjs.org'

      - name: Build
        run: pnpm build

      - name: Publish to npm
        run: pnpm changeset:publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish provenance
        run: |
          echo "Packages published with provenance"
```

**Manual Steps for this approach:**

```bash
# 1. Developer creates changeset
pnpm changeset

# 2. Commit changeset
git add .changeset
git commit -m "chore: add changeset for feature X"
git push

# 3. When ready to release, create version PR manually
git checkout -b release/version-packages
pnpm changeset:version
git add .
git commit -m "chore: Version packages"
git push origin release/version-packages

# 4. Create PR, get approval, merge
# 5. Automated workflow publishes to npm
```

### GitHub App Workflow (Enterprise Scale)

```yaml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      # Generate token from GitHub App
      - name: Generate token
        id: generate-token
        # Security Note: For production, consider pinning to specific commit SHA
        # e.g., uses: tibdex/github-app-token@3beb63f4bd073e61482598c45c71c1019b59b73a # v2.1.0
        uses: tibdex/github-app-token@v2
        with:
          app_id: ${{ secrets.APP_ID }}
          private_key: ${{ secrets.APP_PRIVATE_KEY }}

      # Checkout with app token
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ steps.generate-token.outputs.token }}

      - uses: ./.github/actions/setup-workspace
        with:
          registry-url: 'https://registry.npmjs.org'

      - name: Build
        run: pnpm build

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: pnpm changeset:publish
          version: pnpm changeset:version
          commit: 'chore: Version packages'
          title: 'chore: Version packages'
        env:
          GITHUB_TOKEN: ${{ steps.generate-token.outputs.token }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish provenance
        if: steps.changesets.outputs.published == 'true'
        run: |
          echo "Packages published with provenance:"
          echo "${{ steps.changesets.outputs.publishedPackages }}"
```

## Security Best Practices

### Token Management

1. **Use Fine-Grained Tokens**: Limit scope to specific repositories and permissions
2. **Rotate Regularly**: Set up expiration and rotation schedule
3. **Audit Access**: Review token usage in Actions logs
4. **Limit Permissions**: Only grant necessary permissions (contents, pull_requests)
5. **Use Secrets**: Never hardcode tokens in workflows

### Branch Protection

Maintain branch protection rules even with automation:

1. **Require Reviews**: At least one approval for version PRs
2. **Require Status Checks**: CI must pass before merge
3. **Restrict Push**: Only allow merge via PRs
4. **Code Owners**: Assign release responsibility

### Publishing Security

1. **Use Trusted Publishing (Recommended)**: Eliminate long-lived tokens with OIDC
   - See [NPM Trusted Publishing Guide](./NPM-TRUSTED-PUBLISHING.md)
   - Automatic provenance attestation
   - No token management required
   - Enhanced supply chain security

2. **If Using Token-Based Publishing**:
   - Enable 2FA on npm account
   - Use granular npm tokens (publish-only scope)
   - Rotate tokens regularly (set expiration)
   - Monitor npm audit logs

3. **Provenance Attestation**:
   - Automatic with trusted publishing (OIDC)
   - Manual with `--provenance` flag for token-based
   - Verifies package authenticity and build environment
   - Required npm CLI v9.5.0+

### Workflow Security

1. **Pin Actions** (Strongly Recommended for Production): Use commit SHAs instead of tags for maximum security

   ```yaml
   # Most secure (pinned to specific commit)
   - uses: actions/checkout@8e5e7e5ab8b370d6c329ec480221332ada57f0ab # v4.1.1

   # Good (pinned to major version)
   - uses: actions/checkout@v4

   # Avoid (unpinned)
   - uses: actions/checkout@latest
   ```

   **Critical for Third-Party Actions**: Actions like `changesets/action` and `tibdex/github-app-token` handle sensitive credentials (PATs, GitHub App tokens, NPM tokens). Pinning these to specific commit SHAs prevents supply-chain attacks where compromised actions could exfiltrate secrets or publish malicious packages. Use Dependabot or similar tools to keep pinned versions updated.

   **Note**: The example workflows in this repository use version tags (e.g., `@v1`, `@v2`) for readability and ease of maintenance. For production environments with strict security requirements, **always pin to specific commit SHAs**, especially for actions that handle tokens and publishing.

2. **Limit Permissions**: Use minimum required permissions

   ```yaml
   permissions:
     contents: write
     pull-requests: write
     id-token: write # For provenance only
   ```

3. **Environment Secrets**: Use environment-specific secrets for production

   ```yaml
   environment:
     name: production
     url: https://npmjs.com/package/@cli-ops/clio
   ```

4. **Dependabot**: Keep actions and dependencies updated

## Troubleshooting

### Error: "GitHub Actions is not permitted to create or approve pull requests"

**Solution**: Implement one of the approaches above (PAT, GitHub App, or Manual).

**Quick Fix**: Use manual release process temporarily while setting up proper authentication.

### Version PR Not Created

**Check:**

1. Token has `pull_requests: write` permission
2. Token is not expired
3. Changesets exist in `.changeset/` directory
4. Branch protection allows PR creation

**Debug:**

```bash
# Check for changesets
ls -la .changeset/*.md

# Test locally
pnpm changeset:version
```

### Publishing Fails

**Check:**

1. NPM_TOKEN is valid and not expired
2. User has publish access to @cli-ops scope
3. Package names don't conflict with existing packages
4. 2FA is configured correctly for automation

**Debug:**

```bash
# Test publish locally
npm login
pnpm build
pnpm changeset:publish --dry-run
```

### Workflow Doesn't Trigger

**Check:**

1. Workflow is on main branch
2. `.changeset/` files are committed
3. Workflow file syntax is valid
4. Repository actions are enabled

**Debug:**

```bash
# Validate workflow
gh workflow view release

# Check workflow runs
gh run list --workflow=release.yml
```

### Token Expired

**Solution:**

1. Generate new token following Step 1 above
2. Update `RELEASE_TOKEN` secret
3. Trigger workflow manually or push new commit

**Prevention:**

- Use longer expiration period
- Set calendar reminders
- Consider GitHub App for no-expiration solution

### Provenance Attestation Fails

**Check:**

1. `id-token: write` permission is set
2. Publishing to public registry
3. npm version supports provenance (>= v9.5.0)

**Debug:**

```bash
# Check npm version
npm --version

# Verify provenance after publish
npm view @cli-ops/clio --json | jq .dist
```

## Release Checklist

### Before Release

- [ ] All PRs merged to main
- [ ] CI passing on main
- [ ] Changesets created for all changes
- [ ] Breaking changes documented
- [ ] Migration guides written (if needed)
- [ ] Dependencies updated
- [ ] Security audit passed (`pnpm audit`)

### During Release

- [ ] Version PR created automatically (or manually)
- [ ] Version PR reviewed and approved
- [ ] CHANGELOG.md updated correctly
- [ ] Package versions bumped correctly
- [ ] Version PR merged to main

### After Release

- [ ] Packages published to npm
- [ ] GitHub release created (if applicable)
- [ ] Documentation updated
- [ ] Announcement made (if major release)
- [ ] Monitor for issues

## Future Improvements

### Potential Enhancements

1. **Automated Changelog Generation**: Enhance changesets with custom formatting
2. **GitHub Releases**: Auto-create GitHub releases from changesets
3. **Release Notes**: Generate release notes from conventional commits
4. **Canary Releases**: Implement pre-release channels for testing
5. **Release Dashboard**: Create visibility into release pipeline
6. **Rollback Process**: Document and automate rollback procedures

### Migration Path

As the project grows, consider:

1. **GitHub App**: For multi-repo support
2. **Release Environments**: Use GitHub Environments for gated releases
3. **Approval Gates**: Add manual approval steps for production
4. **Release Branches**: Implement git-flow or trunk-based development
5. **Feature Flags**: Decouple deployment from release

## Additional Resources

### Documentation

- [NPM Trusted Publishing Guide](./NPM-TRUSTED-PUBLISHING.md) - Secure OIDC-based publishing setup
- [Changesets Documentation](https://github.com/changesets/changesets)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)
- [npm Trusted Publishers](https://docs.npmjs.com/trusted-publishers)
- [Fine-grained PATs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-fine-grained-personal-access-token)

### Related Files

- [Release Workflow](../../.github/workflows/release.yml)
- [Contributing Guide](../CONTRIBUTING.md)
- [Changeset Config](../../.changeset/config.json)
- [Package.json Scripts](../../package.json)

### Support

For questions or issues with the release process:

1. Check this documentation
2. Review [CONTRIBUTING.md](./CONTRIBUTING.md)
3. Check existing workflow runs for patterns
4. Open a discussion or contact maintainers

---

**Last Updated**: 2025-12-30
**Version**: 1.0.0
**Maintainer**: CLI Ops Team
