# Quick Setup: NPM Trusted Publishing

This is a quick reference guide for setting up npm trusted publishing for the CLI Ops monorepo. For detailed information, see [NPM-TRUSTED-PUBLISHING.md](./NPM-TRUSTED-PUBLISHING.md).

## Prerequisites Checklist

- [ ] npm CLI v9.5.0 or higher
- [ ] npm account with maintainer/owner access
- [ ] Public GitHub repository
- [ ] Workflow has `id-token: write` permission ✅ (already configured)

## Quick Setup Steps

### 1. Verify npm Version

```bash
npm --version
# Should be 9.5.0 or higher
```

### 2. Configure Each Package on npmjs.com

For **each package** in the monorepo:

1. Go to `https://www.npmjs.com/package/<package-name>`
2. Click **Settings** (must be logged in as maintainer)
3. Scroll to **Publishing access** → **Add trusted publisher**
4. Select **GitHub Actions**
5. Fill in:
   - **Repository owner**: `archubbuck`
   - **Repository name**: `cli-ops`
   - **Workflow filename**: `release.yml`
   - **Environment**: (leave blank)
6. Click **Add trusted publisher**

### 3. Packages to Configure

**Core:**

- `@cli-ops/clio`

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

**Meta Packages (if publishing):**

- `@cli-ops/clio-meta-developer`
- `@cli-ops/clio-meta-complete`

### 4. Test Publishing

1. Create a test changeset:

   ```bash
   pnpm changeset
   ```

2. Commit and push to trigger workflow:

   ```bash
   git add .changeset
   git commit -m "chore: test trusted publishing"
   git push origin main
   ```

3. Monitor workflow in GitHub Actions

4. After version PR is merged, check npm package pages for:
   - **"Built and signed on GitHub Actions"** badge
   - **View Provenance** link with attestation details

### 5. Remove NPM_TOKEN (Optional)

After verifying trusted publishing works:

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Delete `NPM_TOKEN` secret
3. Future publishes will use OIDC automatically

## Verification

After publishing, verify on each package page:

```
https://www.npmjs.com/package/@cli-ops/<package-name>
```

Look for:

- ✅ "Built and signed on GitHub Actions" badge
- ✅ "View Provenance" link
- ✅ Source repository and commit information

## Troubleshooting

### Common Issues

**401 Unauthorized Error:**

- Double-check trusted publisher configuration
- Verify repository owner/name spelling
- Ensure workflow filename is exactly `release.yml`

**No Provenance Badge:**

- Wait 5-10 minutes for npm cache update
- Verify npm CLI version in workflow is 9.5.0+
- Check that OIDC was used (not NPM_TOKEN)

**Some Packages Fail:**

- Each package needs individual trusted publisher configuration
- Cannot bulk configure or use wildcards

## Resources

- [Full Documentation](./NPM-TRUSTED-PUBLISHING.md)
- [Release Process](./RELEASE-PROCESS.md)
- [npm Trusted Publishers Docs](https://docs.npmjs.com/trusted-publishers)

## Summary

✅ More secure than tokens  
✅ Automatic provenance  
✅ No token management  
✅ Industry standard

**Time to complete**: ~15-30 minutes for all packages

---

**Questions?** See [NPM-TRUSTED-PUBLISHING.md](./NPM-TRUSTED-PUBLISHING.md) for detailed troubleshooting and FAQ.
