#!/bin/bash

# Worktree Recovery Script
# Helps recover accidentally deleted worktrees

echo "🔧 Worktree Recovery Tool"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show current worktrees
echo "📁 Current worktrees:"
git worktree list
echo ""

# Show all feature branches
echo "🌿 Available branches:"
git branch --list "feature/*"
echo ""

# Check for orphaned worktree references
echo "🔍 Checking for missing worktrees..."
MISSING=$(git worktree list | grep "worktree missing")
if [ ! -z "$MISSING" ]; then
    echo "⚠️  Found missing worktrees:"
    echo "$MISSING"
    echo ""
    read -p "Clean up missing worktree references? (yes/no): " CLEANUP
    if [ "$CLEANUP" == "yes" ]; then
        git worktree prune
        echo "✅ Cleaned up"
    fi
    echo ""
fi

# Show reflog for recovery
echo "📜 Recent branch activity (for recovery):"
git reflog | grep -E "(worktree|branch|mobile|tw4)" | head -20
echo ""

# Interactive recovery
read -p "Do you want to recreate a worktree? (yes/no): " RECREATE

if [ "$RECREATE" != "yes" ]; then
    echo "Exiting..."
    exit 0
fi

echo ""
echo "Which worktree do you want to recreate?"
echo "  1. Tailwind v4 (4prop-crm-react-tw4)"
echo "  2. Mobile improvements (4prop-crm-react-mobile)"
echo "  3. Custom..."
echo ""
read -p "Choice (1/2/3): " CHOICE

case $CHOICE in
    1)
        WORKTREE_PATH="../4prop-crm-react-tw4"
        BRANCH="feature/tailwind-v4-migration"
        PACKAGE_NAME="react-4prop-crm-tw4"
        ;;
    2)
        WORKTREE_PATH="../4prop-crm-react-mobile"
        BRANCH="feature/mobile-responsive-improvements"
        PACKAGE_NAME="react-4prop-crm-mobile"
        ;;
    3)
        read -p "Worktree path (e.g., ../4prop-crm-react-custom): " WORKTREE_PATH
        read -p "Branch name: " BRANCH
        read -p "Package name: " PACKAGE_NAME
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Creating worktree:"
echo "  Path: $WORKTREE_PATH"
echo "  Branch: $BRANCH"
echo ""

# Check if branch exists
if ! git show-ref --verify --quiet refs/heads/$BRANCH; then
    echo "❌ Branch '$BRANCH' not found!"
    echo ""
    echo "Available branches:"
    git branch -a
    echo ""
    read -p "Try to recover from reflog? (yes/no): " RECOVER

    if [ "$RECOVER" == "yes" ]; then
        echo "Searching reflog for '$BRANCH'..."
        COMMIT=$(git reflog | grep "$BRANCH" | head -1 | awk '{print $1}')

        if [ ! -z "$COMMIT" ]; then
            echo "Found commit: $COMMIT"
            git branch "$BRANCH" "$COMMIT"
            echo "✅ Branch restored from reflog"
        else
            echo "❌ Could not find branch in reflog"
            exit 1
        fi
    else
        exit 1
    fi
fi

# Create the worktree
git worktree add "$WORKTREE_PATH" "$BRANCH"

echo ""
echo "✅ Worktree created!"
echo ""

# Apply workarounds
echo "Applying npm workspace workaround..."
cd "$WORKTREE_PATH"

# Update package.json name
sed -i '' "s/\"name\": \"react-4prop-crm\"/\"name\": \"$PACKAGE_NAME\"/" package.json

# Ignore package.json changes
git update-index --assume-unchanged package.json

echo "✅ Package.json configured: $PACKAGE_NAME"
echo ""

# Install dependencies
echo "Installing dependencies..."
cd /Users/salgadom/EACH/each-monorepo
npm install

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Recovery complete!"
echo ""
echo "Worktree ready at: $WORKTREE_PATH"
echo "Branch: $BRANCH"
echo ""
echo "To start development:"
echo "  cd $WORKTREE_PATH"
echo "  npm run dev:crm"
echo ""
