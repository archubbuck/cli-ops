# Release Workflow Examples

This directory contains example GitHub Actions workflow files for different release process approaches that handle GitHub Actions PR creation restrictions.

## Available Examples

### 1. [release-with-pat.yml](workflows/release-with-pat.yml) - **Recommended**

Uses a Personal Access Token (PAT) to create release PRs.

**Use when:**
- You want full automation
- Single repository or small project
- Quick setup needed

**Setup required:**
- Create fine-grained PAT
- Add as `RELEASE_TOKEN` secret

### 2. [release-manual.yml](workflows/release-manual.yml)

Manual version PR creation with automated publishing.

**Use when:**
- No tokens available
- Manual oversight preferred
- Testing release process

**Setup required:**
- None (uses default `GITHUB_TOKEN`)

### 3. [release-github-app.yml](workflows/release-github-app.yml)

Uses GitHub App for authentication.

**Use when:**
- Multiple repositories
- Organization-wide solution
- Long-term maintenance

**Setup required:**
- Create GitHub App
- Install app on repository
- Add `APP_ID` and `APP_PRIVATE_KEY` secrets

## How to Use

1. Choose the approach that fits your needs
2. Follow the setup instructions in the file comments
3. Review the [Release Process documentation](../../RELEASE-PROCESS.md)
4. Copy the example to `.github/workflows/release.yml` (or update existing file)
5. Test with a changeset commit

## Quick Comparison

| Approach | Automation | Setup Complexity | Maintenance | Security |
|----------|-----------|------------------|-------------|----------|
| PAT | Full | Low | Token rotation | Good |
| Manual | Partial | None | None | Excellent |
| GitHub App | Full | High | None | Excellent |

## Additional Resources

- [Full Release Process Documentation](../../RELEASE-PROCESS.md)
- [Contributing Guide](../../CONTRIBUTING.md)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)

## Need Help?

See the [Troubleshooting section](../../RELEASE-PROCESS.md#troubleshooting) in the Release Process documentation.
