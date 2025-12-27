#!/bin/bash

# Quick Fix Script for Build Errors
# Run this to install missing type definitions and build

set -e

echo "🔧 Installing missing type definitions..."
pnpm install

echo "🏗️  Building all packages..."
pnpm build

echo "✅ Build completed successfully!"
echo ""
echo "Next steps:"
echo "  • Run tests: pnpm test"
echo "  • Check performance: pnpm perf"
echo "  • Try clio: pnpm dev:clio help"
