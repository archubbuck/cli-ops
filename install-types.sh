#!/bin/bash
cd /workspaces/cli-ops
pnpm add -D --filter @cli-ops/shared-ui @types/cli-progress
pnpm build
