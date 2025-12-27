#!/bin/bash
cd /workspaces/cli-ops && pnpm build 2>&1 | tee build-output.log
