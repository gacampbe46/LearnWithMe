#!/usr/bin/env bash
# Fills GitHub PR descriptions from docs/pull-request-*.md
# Requires: gh CLI installed and logged in (`gh auth login`)
set -euo pipefail

REPO="gacampbe46/LearnWithMe"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/  (macOS: brew install gh)"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login"
  exit 1
fi

set_pr_body() {
  local branch="$1"
  local file="$2"
  local num
  num="$(gh pr list --repo "$REPO" --head "$branch" --json number --jq '.[0].number // empty')"
  if [[ -z "$num" ]]; then
    echo "No open PR found for branch: $branch (open one on GitHub or run: gh pr create --head $branch --base main)"
    return 1
  fi
  gh pr edit "$num" --repo "$REPO" --body-file "$file"
  echo "Updated PR #$num ($branch)"
}

set_pr_body "docs-and-product-alignment" "$ROOT/docs/pull-request-docs-and-product-alignment.md"
set_pr_body "dark-mode-ui" "$ROOT/docs/pull-request-dark-mode-ui.md"
echo "Done."
