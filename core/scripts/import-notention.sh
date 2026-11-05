#!/usr/bin/env bash
# One-shot / updater: copy notention9 core/src into core/vendor/notention.
# Does not touch core/src (MB modifications).
# Usage: ./core/scripts/import-notention.sh [commit-or-branch]
set -euo pipefail

REF="${1:-main}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEST="$ROOT/core/vendor/notention"
TMP="$(mktemp -d)"

cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

echo "Cloning autonull/notention9 @ $REF …"
git clone --depth 1 --branch "$REF" https://github.com/autonull/notention9.git "$TMP/notention9" 2>/dev/null \
  || git clone --depth 1 https://github.com/autonull/notention9.git "$TMP/notention9"

if [ "$REF" != "main" ]; then
  git -C "$TMP/notention9" fetch --depth 1 origin "$REF" || true
  git -C "$TMP/notention9" checkout "$REF" || true
fi

COMMIT="$(git -C "$TMP/notention9" rev-parse HEAD)"
mkdir -p "$DEST"
rsync -a --delete "$TMP/notention9/core/src/" "$DEST/"

cat > "$ROOT/core/vendor/IMPORTED.md" <<EOF
# Imported Notention core source

- Upstream: https://github.com/autonull/notention9
- Commit: $COMMIT
- Ref requested: $REF
- Imported into: core/vendor/notention/
- Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)

This is owned source. Runtime does not call Notention.
Re-run core/scripts/import-notention.sh to absorb a later commit.
EOF

echo "Imported $COMMIT into $DEST"
