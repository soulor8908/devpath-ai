#!/usr/bin/env bash
# Install a pre-push git hook that runs lint + typecheck locally before pushing.
# Run this once after cloning: bash scripts/install-git-hooks.sh
# CI does NOT depend on this hook — the workflow quality-gate job is the source of truth.
set -euo pipefail

HOOK_FILE=".git/hooks/pre-push"

cat > "$HOOK_FILE" <<'EOF'
#!/usr/bin/env bash
# pre-push: run quality gate (lint + typecheck) before pushing.
# Tests are skipped here for speed; CI runs the full suite.
set -e
echo "▶ Running pre-push quality gate (lint + typecheck)..."
npm run lint
npm run typecheck
echo "✓ Pre-push checks passed."
EOF

chmod +x "$HOOK_FILE"
echo "✓ pre-push hook installed at $HOOK_FILE (runs: npm run lint && npm run typecheck)"
echo "  To bypass temporarily: git push --no-verify"
