#!/usr/bin/env bash

# Shell completion installation script for all CLIs

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Installing shell completions..."

# Detect shell
detect_shell() {
  if [ -n "$BASH_VERSION" ]; then
    echo "bash"
  elif [ -n "$ZSH_VERSION" ]; then
    echo "zsh"
  else
    # Try to detect from SHELL env var
    case "$SHELL" in
      */bash)
        echo "bash"
        ;;
      */zsh)
        echo "zsh"
        ;;
      */fish)
        echo "fish"
        ;;
      *)
        echo "unknown"
        ;;
    esac
  fi
}

SHELL_TYPE=$(detect_shell)

if [ "$SHELL_TYPE" = "unknown" ]; then
  echo -e "${RED}✗ Could not detect shell type${NC}"
  echo "Supported shells: bash, zsh, fish"
  exit 1
fi

echo -e "${GREEN}✓ Detected shell: $SHELL_TYPE${NC}"

# Install based on shell type
case "$SHELL_TYPE" in
  bash)
    COMPLETION_DIR="$HOME/.local/share/bash-completion/completions"
    mkdir -p "$COMPLETION_DIR"
    
    for cli in alpha beta gamma; do
      if [ -f "$ROOT_DIR/completions/${cli}.bash" ]; then
        cp "$ROOT_DIR/completions/${cli}.bash" "$COMPLETION_DIR/$cli"
        echo -e "${GREEN}✓ Installed $cli completion${NC}"
      fi
    done
    
    echo ""
    echo "Add this to your ~/.bashrc:"
    echo ""
    echo "  # Enable bash completion"
    echo "  if [ -f /usr/share/bash-completion/bash_completion ]; then"
    echo "    . /usr/share/bash-completion/bash_completion"
    echo "  fi"
    ;;
    
  zsh)
    COMPLETION_DIR="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/completions"
    if [ ! -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}" ]; then
      # Fallback to standard location
      COMPLETION_DIR="$HOME/.zsh/completions"
    fi
    mkdir -p "$COMPLETION_DIR"
    
    for cli in alpha beta gamma; do
      if [ -f "$ROOT_DIR/completions/_${cli}" ]; then
        cp "$ROOT_DIR/completions/_${cli}" "$COMPLETION_DIR/_${cli}"
        echo -e "${GREEN}✓ Installed $cli completion${NC}"
      fi
    done
    
    echo ""
    echo "Add this to your ~/.zshrc:"
    echo ""
    echo "  # Enable completions"
    echo "  fpath=($COMPLETION_DIR \$fpath)"
    echo "  autoload -Uz compinit && compinit"
    ;;
    
  fish)
    COMPLETION_DIR="$HOME/.config/fish/completions"
    mkdir -p "$COMPLETION_DIR"
    
    for cli in alpha beta gamma; do
      if [ -f "$ROOT_DIR/completions/${cli}.fish" ]; then
        cp "$ROOT_DIR/completions/${cli}.fish" "$COMPLETION_DIR/${cli}.fish"
        echo -e "${GREEN}✓ Installed $cli completion${NC}"
      fi
    done
    
    echo ""
    echo "Fish completions are automatically loaded."
    ;;
esac

echo ""
echo -e "${GREEN}✓ Installation complete!${NC}"
echo ""
echo "Restart your shell or run:"
case "$SHELL_TYPE" in
  bash)
    echo "  source ~/.bashrc"
    ;;
  zsh)
    echo "  source ~/.zshrc"
    ;;
  fish)
    echo "  # Completions are automatically available"
    ;;
esac
