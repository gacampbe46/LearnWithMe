#!/usr/bin/env bash
# Creates GitHub PRs with the description file as the body (so the field is not blank).
# Run from repo root after: gh auth login
# Only runs for description files that exist in this working tree (so either branch can carry the script).
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

create_if_missing() {
  local head="$1"
  local title="$2"
  local bodyfile="$3"
  local existing
  existing="$(gh pr list --repo "$REPO" --head "$head" --json number --jq '.[0].number // empty')"
  if [[ -n "$existing" ]]; then
    echo "PR #$existing already open for $head — updating body only."
    gh pr edit "$existing" --repo "$REPO" --body-file "$bodyfile"
    return 0
  fi
  gh pr create --repo "$REPO" --base main --head "$head" --title "$title" --body-file "$bodyfile"
  echo "Created PR for $head"
}

WEEKLY_MD="$ROOT/docs/pull-request-weekly-sync-2026-04-07.md"
DARK_MD="$ROOT/docs/pull-request-dark-mode-ui.md"

if [[ -f "$WEEKLY_MD" ]]; then
  create_if_missing "weekly-sync-2026-04-07" \
    "Weekly sync (Apr 7, 2026): docs, content, and markdown" \
    "$WEEKLY_MD"
else
  echo "Skip weekly-sync PR (no $WEEKLY_MD in this checkout)"
fi

if [[ -f "$DARK_MD" ]]; then
  create_if_missing "dark-mode-ui" \
    "Dark mode and UI foundation" \
    "$DARK_MD"
else
  echo "Skip dark-mode PR (no $DARK_MD in this checkout)"
fi

echo "All set."
