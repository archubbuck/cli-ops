# Changesets

This directory contains changeset files for version management.

## Usage

Create a changeset after making changes:

```bash
pnpm changeset
```

Select affected packages, choose version bump type (major/minor/patch), and write a description.

## Independent Versioning

Each CLI and shared package versions independently. When shared packages update, dependent CLIs receive automatic patch bumps.
