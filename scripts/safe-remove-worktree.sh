#!/bin/bash

# Safe Worktree Removal Script
# Usage: ./safe-remove-worktree.sh <worktree-path>

if [ -z "$1" ]; then
    echo "❌ Error: Please specify worktree path"
    echo "Usage: ./safe-remove-worktree.sh <worktree-path>"
    echo ""
    echo "Examples:"
    echo "  ./safe-remove-worktree.sh ../4prop-crm-react-mobile"
    echo "  ./safe-remove-worktree.sh ../4prop-crm-react-tw4"
    exit 1
fi

WORKTREE_PATH=$1
WORKTREE_NAME=$(basename "$WORKTREE_PATH")

echo "🔍 Checking worktree: $WORKTREE_PATH"
echo ""

# Check if worktree exists
if [ ! -d "$WORKTREE_PATH" ]; then
    echo "❌ Worktree directory not found: $WORKTREE_PATH"
    echo ""
    echo "Cleaning up git tracking..."
    git worktree prune
    exit 1
fi

# Check for uncommitted changes
cd "$WORKTREE_PATH"
BRANCH=$(git branch --show-current)

if ! git diff-index --quiet HEAD --; then
    echo "⚠️  WARNING: Uncommitted changes detected!"
    echo ""
    echo "Branch: $BRANCH"
    echo ""
    git status --short
    echo ""
    echo "Options:"
    echo "  1. Commit your changes first"
    echo "  2. Force remove (WILL LOSE CHANGES)"
    echo ""
    read -p "Do you want to force remove? (yes/no): " CONFIRM

    if [ "$CONFIRM" != "yes" ]; then
        echo "❌ Removal cancelled"
        exit 0
    fi

    echo "⚠️  Forcing removal..."
    cd - > /dev/null
    git worktree remove "$WORKTREE_PATH" --force
else
    echo "✅ No uncommitted changes detected"
    echo "Branch: $BRANCH"
    echo ""
    read -p "Remove worktree '$WORKTREE_NAME'? (yes/no): " CONFIRM

    if [ "$CONFIRM" != "yes" ]; then
        echo "❌ Removal cancelled"
        exit 0
    fi

    cd - > /dev/null
    git worktree remove "$WORKTREE_PATH"
fi

echo ""
echo "✅ Worktree removed: $WORKTREE_PATH"
echo ""
echo "The branch '$BRANCH' still exists:"
git log --oneline -3 "$BRANCH"
echo ""
echo "To recreate: git worktree add $WORKTREE_PATH $BRANCH"
echo ""
echo "Updating npm workspace..."
cd /Users/salgadom/EACH/each-monorepo
npm install --silent
echo ""
echo "✅ Done!"
