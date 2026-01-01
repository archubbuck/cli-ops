---
sidebar_position: 6
sidebar_label: NPM Trusted Publishing
title: NPM Trusted Publishing with OIDC
description: Configure secure, token-less npm package publishing using OpenID Connect (OIDC)
---

# NPM Trusted Publishing with OIDC

This guide explains how to configure npm trusted publishing with OpenID Connect (OIDC) for the CLI Ops monorepo. Trusted publishing eliminates the need for long-lived npm tokens, providing enhanced security and automatic provenance attestation.

## Table of Contents

- [Overview](#overview)
- [Benefits](#benefits)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Verification](#verification)
- [Migration from Token-Based Publishing](#migration-from-token-based-publishing)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Overview

**npm Trusted Publishing** is a secure authentication method that uses OpenID Connect (OIDC) to verify the identity of your GitHub Actions workflow and automatically publish packages to npm without requiring long-lived access tokens.

### How It Works

1. **OIDC Authentication**: GitHub Actions generates a short-lived token that proves your workflow's identity
2. **npm Verification**: npm validates the token and matches it against your configured trusted publisher settings
3. **Automatic Publishing**: If validation succeeds, your package is published with automatic provenance attestation
4. **Provenance Badge**: Your npm package page displays a badge showing it was built and signed on GitHub Actions

### Key Differences from Token-Based Publishing

| Aspect                | Token-Based (Traditional)     | Trusted Publishing (OIDC)         |
| --------------------- | ----------------------------- | --------------------------------- |
| Authentication        | Long-lived `NPM_TOKEN` secret | Short-lived OIDC token            |
| Security Risk         | Token can be leaked/stolen    | Token expires after workflow      |
| Setup Location        | GitHub Secrets                | npm package settings              |
| Provenance            | Manual `--provenance` flag    | Automatic                         |
| Token Management      | Manual rotation required      | No management needed              |
| Supply Chain Security | Limited                       | Enhanced with cryptographic proof |

## Benefits

### Security Benefits

- **No Long-Lived Tokens**: Eliminates the risk of token leakage or theft
- **Automatic Rotation**: OIDC tokens are short-lived and automatically rotated
- **Cryptographic Provenance**: Automatic attestation of where and how packages were built
- **Reduced Attack Surface**: No secrets to manage in GitHub repository settings

### Operational Benefits

- **Simplified Setup**: One-time configuration on npm, no token management
- **Automatic Provenance**: No need to remember `--provenance` flags
- **Better Visibility**: npm package page shows "Built and signed on GitHub Actions" badge
- **Supply Chain Transparency**: Consumers can verify package authenticity

### Developer Benefits

- **No Token Expiration Worries**: No calendar reminders for token rotation
- **Easier Onboarding**: New maintainers don't need token access
- **Audit Trail**: Clear record of which workflow published each version
- **Industry Standard**: Aligns with modern security best practices

## Prerequisites

Before setting up trusted publishing, ensure you have:

- [ ] **npm CLI v9.5.0 or higher** (for automatic provenance support)
  - Check version: `npm --version`
  - Update if needed: `npm install -g npm@latest`

- [ ] **npm Account Access**: You must be a maintainer/owner of the npm packages
  - Required permission: Ability to configure package settings on npmjs.com

- [ ] **Public GitHub Repository**: Trusted publishing requires public source repositories
  - Private repositories cannot generate provenance attestations

- [ ] **GitHub Actions Workflow**: A release workflow that publishes to npm
  - Already configured: `.github/workflows/release.yml`
  - Must include `id-token: write` permission (already set)

- [ ] **Changesets Configuration**: Using changesets for versioning and publishing
  - Already configured: `.changeset/config.json`

## Setup Instructions

### Step 1: Verify npm CLI Version

First, ensure you have npm v9.5.0 or higher installed in your development environment:

```bash
npm --version
# Should output 9.5.0 or higher
```

If you need to update:

```bash
npm install -g npm@latest
```

**Note**: The GitHub Actions workflow uses the Node.js version specified in `.github/actions/setup-workspace/action.yml` (currently Node 20), which includes a compatible npm version.

### Step 2: Configure Trusted Publishers on npm

For **each package** you want to publish, configure a trusted publisher on npmjs.com:

#### For @cli-ops/clio (Main CLI)

1. Go to https://www.npmjs.com/package/@cli-ops/clio
2. Click **Settings** (you must be logged in as a maintainer)
3. Scroll to **Publishing access** section
4. Click **Add trusted publisher**
5. Select **GitHub Actions** as the provider
6. Fill in the configuration:
   - **GitHub repository owner**: `archubbuck` (or your org/username)
   - **Repository name**: `cli-ops`
   - **Workflow filename**: `release.yml`
   - **Environment name**: Leave blank (unless using GitHub Environments)
7. Click **Add trusted publisher**

#### For Other Packages

Repeat the process for each package in the monorepo:

**Plugins:**

- `@cli-ops/clio-plugin-tasks`
- `@cli-ops/clio-plugin-fetch`
- `@cli-ops/clio-plugin-repo`
- `@cli-ops/clio-plugin-tasks-jira`
- `@cli-ops/clio-plugin-fetch-oauth`
- `@cli-ops/clio-plugin-repo-hooks`

**Shared Libraries:**

- `@cli-ops/shared-commands`
- `@cli-ops/shared-config`
- `@cli-ops/shared-core`
- `@cli-ops/shared-exit-codes`
- `@cli-ops/shared-formatter`
- `@cli-ops/shared-history`
- `@cli-ops/shared-hooks`
- `@cli-ops/shared-logger`
- `@cli-ops/shared-plugins`
- `@cli-ops/shared-prompts`
- `@cli-ops/shared-types`
- `@cli-ops/shared-ui`

**Meta Packages (if applicable):**

- `@cli-ops/clio-meta-developer`
- `@cli-ops/clio-meta-complete`

**Configuration for all packages:**

- GitHub repository owner: `archubbuck`
- Repository name: `cli-ops`
- Workflow filename: `release.yml`
- Environment name: (leave blank)

### Step 3: Remove NPM_TOKEN Secret (Optional)

Once all packages are configured with trusted publishers, you can optionally remove the `NPM_TOKEN` secret from GitHub:

**Important**: Only remove the token after verifying that trusted publishing works correctly for all packages.

1. Go to your repository: https://github.com/archubbuck/cli-ops
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Find `NPM_TOKEN` in the repository secrets
4. Click the **Delete** button (after successful verification)

**Note**: The release workflow supports both authentication methods. If `NPM_TOKEN` is present, it will be used (token-based). If absent, OIDC will be used (trusted publishing). This allows for gradual migration.

### Step 4: Verify Workflow Configuration

The release workflow (`.github/workflows/release.yml`) is already configured with the necessary permissions:

```yaml
permissions:
  contents: write
  pull-requests: write
  id-token: write # Required for OIDC authentication
```

The `id-token: write` permission allows GitHub Actions to generate OIDC tokens for authentication with npm.

### Step 5: Test the Setup

To test the trusted publishing configuration:

1. **Create a test changeset**:

   ```bash
   pnpm changeset
   # Select a minor change for a low-impact package (e.g., update README)
   ```

2. **Commit and push to main**:

   ```bash
   git add .changeset
   git commit -m "chore: test trusted publishing setup"
   git push origin main
   ```

3. **Monitor the release workflow**:
   - Go to **Actions** tab in GitHub
   - Watch the **Release** workflow run
   - Check for successful version PR creation

4. **Review and merge the version PR**:
   - Once created, review the version PR
   - Approve and merge it
   - The workflow will automatically publish using OIDC

5. **Verify provenance on npm**:
   - Go to the published package on npmjs.com
   - Look for the **"Built and signed on GitHub Actions"** badge
   - Click **View Provenance** to see attestation details

## Verification

### Verify Trusted Publisher Configuration

For each package, verify the configuration on npmjs.com:

1. Go to package settings: `https://www.npmjs.com/package/<package-name>/settings`
2. Scroll to **Publishing access**
3. Confirm you see:
   - **Trusted publishers**: GitHub Actions
   - **Repository**: `archubbuck/cli-ops`
   - **Workflow**: `release.yml`

### Verify Provenance Badge

After publishing, check each package page:

1. Go to: `https://www.npmjs.com/package/<package-name>`
2. Look for **"Built and signed on GitHub Actions"** badge
3. Click **View Provenance** to see:
   - Source repository
   - Commit SHA
   - Workflow run URL
   - Build environment details

Example: https://www.npmjs.com/package/@cli-ops/clio

### Verify OIDC Authentication in Logs

In the GitHub Actions workflow logs, look for:

```
Publishing to npm using OIDC authentication...
Successfully published with provenance
```

You should NOT see any references to `NPM_TOKEN` if using trusted publishing.

## Migration from Token-Based Publishing

### Gradual Migration Approach

The release workflow supports both authentication methods simultaneously, allowing for safe migration:

#### Phase 1: Parallel Operation (Recommended)

1. Keep existing `NPM_TOKEN` secret in place
2. Configure trusted publishers on npm for all packages
3. Test publishing with both methods available
4. Verify provenance is generated correctly

**Current State**: Workflow will use `NPM_TOKEN` if present

#### Phase 2: Validation

1. Monitor several release cycles
2. Verify all packages publish successfully
3. Check provenance badges on npm package pages
4. Confirm no publishing errors in workflow logs

#### Phase 3: Complete Migration

1. Remove `NPM_TOKEN` from GitHub Secrets
2. All future publishes will use OIDC authentication
3. Verify next release uses trusted publishing

**New State**: Workflow will use OIDC authentication

### Rollback Plan

If you encounter issues with trusted publishing:

1. **Immediate Rollback**: Re-add `NPM_TOKEN` secret in GitHub Settings
2. **Next Publish**: Workflow will automatically use token-based authentication
3. **Debug**: Investigate trusted publisher configuration on npm
4. **Retry**: Fix issues and attempt trusted publishing again

### Migration Checklist

- [ ] Verify npm CLI version (v9.5.0+)
- [ ] Configure trusted publishers for all packages on npmjs.com
- [ ] Test publishing with both authentication methods available
- [ ] Verify provenance badges appear on npm
- [ ] Monitor multiple release cycles for stability
- [ ] Document any package-specific configuration
- [ ] Remove `NPM_TOKEN` secret after successful validation
- [ ] Update team documentation about new publishing process

## Troubleshooting

### Publishing Fails with "Unauthorized" Error

**Symptoms**:

```
npm ERR! code E401
npm ERR! 401 Unauthorized - PUT https://registry.npmjs.org/@cli-ops/clio
```

**Solutions**:

1. **Check Trusted Publisher Configuration**:
   - Verify repository owner name matches exactly
   - Verify repository name matches exactly
   - Verify workflow filename is `release.yml` (not `release.yaml`)
   - Ensure no typos in configuration

2. **Verify Package Permissions**:
   - Confirm you're a maintainer/owner of the package
   - Check that package hasn't been transferred to different organization

3. **Check Workflow Permissions**:
   - Ensure `id-token: write` permission is set
   - Verify workflow is running from main branch
   - Confirm repository is public

### Provenance Badge Not Showing

**Symptoms**: Package publishes successfully but no provenance badge on npm

**Solutions**:

1. **Check npm CLI Version**:

   ```bash
   npm --version  # Should be 9.5.0 or higher
   ```

2. **Verify OIDC Authentication Was Used**:
   - Check workflow logs for OIDC-related messages
   - Confirm `NPM_TOKEN` secret was not used

3. **Repository Visibility**:
   - Provenance only works with public repositories
   - Private repositories cannot generate provenance attestations

4. **Wait for npm Cache Update**:
   - Provenance data may take a few minutes to appear
   - Refresh the package page after 5-10 minutes

### Multiple Packages, Some Fail

**Symptoms**: Some packages publish successfully, others fail with authentication errors

**Solutions**:

1. **Verify Each Package Configuration**:
   - Each package needs its own trusted publisher configuration
   - Cannot use wildcard or bulk configuration

2. **Check Package Naming**:
   - Ensure scope (`@cli-ops/`) matches exactly
   - Verify package exists on npm before publishing

3. **Monorepo Considerations**:
   - All packages must use the same workflow file
   - Cannot use different workflows for different packages with same trusted publisher

### Workflow Permission Denied

**Symptoms**:

```
Error: Resource not accessible by integration
```

**Solutions**:

1. **Check Workflow Permissions**:

   ```yaml
   permissions:
     contents: write
     pull-requests: write
     id-token: write # Must be present
   ```

2. **Repository Settings**:
   - Settings → Actions → General → Workflow permissions
   - Ensure "Read and write permissions" is enabled
   - Ensure "Allow GitHub Actions to create pull requests" is enabled

### OIDC Token Generation Fails

**Symptoms**:

```
Error: Unable to get OIDC token
```

**Solutions**:

1. **Check GitHub Actions Configuration**:
   - Verify repository has Actions enabled
   - Check if organization policies block OIDC

2. **Workflow File Location**:
   - Ensure workflow is in `.github/workflows/` directory
   - Verify file name matches trusted publisher configuration

3. **Branch Protection**:
   - Ensure workflow can run on main branch
   - Check if branch protection rules interfere

## Additional Resources

### Official Documentation

- [npm Trusted Publishing Documentation](https://docs.npmjs.com/trusted-publishers)
- [GitHub OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [npm Provenance Documentation](https://docs.npmjs.com/generating-provenance-statements)

### Blog Posts and Guides

- [npm Trusted Publishing with OIDC Announcement](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)
- [Nearform: NPM Provenance - Simple and Secure Release Pipeline](https://nearform.com/insights/npm-provenance-how-to-get-a-simple-and-secure-release-pipeline/)
- [Publishing to NPM from GitHub Actions using OIDC](https://ankush.one/blogs/npm-oidc-publishing/)

### Related Documentation in This Repository

- [Release Process](./RELEASE-PROCESS.md) - Overall release workflow and process
- [Contributing Guide](./CONTRIBUTING.md) - Development and contribution guidelines
- [CI Workflow](./.github/workflows/ci.yml) - Continuous integration setup

### Community Resources

- [Changesets Documentation](https://github.com/changesets/changesets) - Versioning and publishing
- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

## Summary

npm Trusted Publishing with OIDC provides:

✅ **Enhanced Security**: No long-lived tokens to manage or leak  
✅ **Automatic Provenance**: Supply chain attestation for all packages  
✅ **Simplified Operations**: No token rotation or expiration management  
✅ **Industry Standard**: Modern, recommended approach for npm publishing  
✅ **Backward Compatible**: Can coexist with token-based publishing during migration

### Quick Reference: Configuration Checklist

For each package:

- [ ] npm version 9.5.0+
- [ ] Public GitHub repository
- [ ] `id-token: write` in workflow
- [ ] Trusted publisher configured on npm:
  - Repository owner: `archubbuck`
  - Repository name: `cli-ops`
  - Workflow: `release.yml`
  - Environment: (blank)
- [ ] Test publish and verify provenance badge

---

**Last Updated**: 2026-01-01  
**Version**: 1.0.0  
**Maintainer**: CLI Ops Team
