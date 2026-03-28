#!/bin/bash
# ============================================================
# SoundFind — Git Hook Installer
# ============================================================
# Run this once after cloning (or when hooks are updated) to
# install the project's git hooks into your local .git folder.
#
# Usage (from repo root):
#   bash scripts/install-hooks.sh
# ============================================================

HOOKS_SRC="scripts/hooks"
HOOKS_DEST=".git/hooks"

if [ ! -d "$HOOKS_DEST" ]; then
  echo "❌ Not a git repository (no .git/hooks directory found)."
  echo "   Run this script from the repo root."
  exit 1
fi

echo "Installing SoundFind git hooks..."

for hook in "$HOOKS_SRC"/*; do
  name=$(basename "$hook")
  dest="$HOOKS_DEST/$name"
  cp "$hook" "$dest"
  chmod +x "$dest"
  echo "  ✅ Installed: $name → .git/hooks/$name"
done

echo ""
echo "Done. Hooks will run automatically on every commit."
echo "Reference: docs/Traceability.md"
