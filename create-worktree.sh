#!/bin/bash

# Create Worktree Helper Script
# Automates worktree creation with npm workspace workarounds

echo "🌿 Worktree Creation Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check arguments
if [ "$#" -lt 2 ]; then
    echo "Usage: ./create-worktree.sh <branch-name> <worktree-path> [base-branch]"
    echo ""
    echo "Examples:"
    echo "  ./create-worktree.sh feature/dark-mode ../4prop-crm-react-darkmode"
    echo "  ./create-worktree.sh feature/api-v2 ../4prop-crm-react-api develop"
    echo ""
    echo "Common worktree names:"
    echo "  - 4prop-crm-react-tw4 (Tailwind v4)"
    echo "  - 4prop-crm-react-mobile (Mobile improvements)"
    echo "  - 4prop-crm-react-<feature> (Your feature)"
    echo ""
    exit 1
fi

BRANCH_NAME=$1
WORKTREE_PATH=$2
BASE_BRANCH=${3:-develop}
WORKTREE_NAME=$(basename "$WORKTREE_PATH")

# Derive package name from worktree name
if [[ $WORKTREE_NAME == 4prop-crm-react-* ]]; then
    # Extract suffix: 4prop-crm-react-mobile -> react-4prop-crm-mobile
    SUFFIX=${WORKTREE_NAME#4prop-crm-react-}
    PACKAGE_NAME="react-4prop-crm-$SUFFIX"
else
    # If it doesn't follow pattern, just append
    PACKAGE_NAME="react-4prop-crm-${WORKTREE_NAME}"
fi

echo "Configuration:"
echo "  Branch: $BRANCH_NAME"
echo "  Worktree Path: $WORKTREE_PATH"
echo "  Package Name: $PACKAGE_NAME"
echo "  Base Branch: $BASE_BRANCH"
echo ""

# Check if branch exists
BRANCH_EXISTS=$(git show-ref --verify --quiet refs/heads/$BRANCH_NAME && echo "yes" || echo "no")

if [ "$BRANCH_EXISTS" == "no" ]; then
    echo "⚠️  Branch '$BRANCH_NAME' does not exist."
    echo ""
    read -p "Create new branch from '$BASE_BRANCH'? (yes/no): " CREATE_BRANCH

    if [ "$CREATE_BRANCH" == "yes" ]; then
        echo "Creating branch '$BRANCH_NAME' from '$BASE_BRANCH'..."
        git branch "$BRANCH_NAME" "$BASE_BRANCH"
        echo "✅ Branch created"
    else
        echo "❌ Cannot create worktree without a branch"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1/5: Creating worktree..."
echo ""

# Create the worktree
git worktree add "$WORKTREE_PATH" "$BRANCH_NAME"

if [ $? -ne 0 ]; then
    echo "❌ Failed to create worktree"
    exit 1
fi

echo "✅ Worktree created"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2/5: Applying npm workspace workaround..."
echo ""

cd "$WORKTREE_PATH"

# Update package.json name
echo "Updating package.json name to: $PACKAGE_NAME"
sed -i '' "s/\"name\": \"react-4prop-crm\"/\"name\": \"$PACKAGE_NAME\"/" package.json

if [ $? -ne 0 ]; then
    echo "⚠️  Failed to update package.json (might be using Linux sed syntax)"
    echo "Trying Linux sed syntax..."
    sed -i "s/\"name\": \"react-4prop-crm\"/\"name\": \"$PACKAGE_NAME\"/" package.json
fi

echo "✅ Package name updated"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3/5: Configuring git to ignore package.json..."
echo ""

git update-index --assume-unchanged package.json

echo "✅ Git will ignore package.json changes"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4/5: Installing dependencies..."
echo ""

cd /Users/salgadom/EACH/each-monorepo
npm install

echo "✅ Dependencies installed"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5/5: Creating helper documentation..."
echo ""

cd "$WORKTREE_PATH"

# Create a quick README for this worktree
cat > WORKTREE_INFO.md <<EOF
# Worktree Information

This is a git worktree for parallel development.

## Details

- **Worktree Path**: $WORKTREE_PATH
- **Branch**: $BRANCH_NAME
- **Package Name**: $PACKAGE_NAME (workaround for npm workspaces)
- **Base Branch**: $BASE_BRANCH

## Quick Start

\`\`\`bash
# Start dev server (auto-assigned port)
npm run dev:crm

# Or specify custom port
PORT=5176 npm run dev:crm
\`\`\`

## Important Notes

### package.json Workaround

The package name has been changed to \`$PACKAGE_NAME\` to avoid npm workspace conflicts.

**Git is configured to IGNORE this change** - it will NOT be committed.

To verify:
\`\`\`bash
git status  # Will NOT show package.json
cat package.json | grep "name"  # Shows: "$PACKAGE_NAME"
\`\`\`

### Making Commits

You can commit normally without worrying about package.json:

\`\`\`bash
# Make your changes...
git add .
git commit -m "✨ feat: add new feature"
# ✅ package.json name change will NOT be included
\`\`\`

### If You Need to Update package.json

If you need to make **real** changes to package.json (add dependencies, etc.):

1. Temporarily re-enable tracking:
   \`\`\`bash
   git update-index --no-assume-unchanged package.json
   \`\`\`

2. Make your changes and commit

3. Re-apply workaround:
   \`\`\`bash
   sed -i '' 's/"name": "react-4prop-crm"/"name": "$PACKAGE_NAME"/' package.json
   git update-index --assume-unchanged package.json
   \`\`\`

## Cleanup

When done with this worktree:

\`\`\`bash
cd /Users/salgadom/EACH/each-monorepo/apps/frontend/4prop-crm-react
./safe-remove-worktree.sh $WORKTREE_PATH
\`\`\`

## Recovery

If you accidentally remove this worktree:

\`\`\`bash
cd /Users/salgadom/EACH/each-monorepo/apps/frontend/4prop-crm-react
./recover-worktree.sh
# Or manually:
# git worktree add $WORKTREE_PATH $BRANCH_NAME
\`\`\`

## Related Documentation

- Main worktree setup: \`../4prop-crm-react/WORKTREE_SETUP.md\`
- Helper scripts: \`../4prop-crm-react/*.sh\`

---

**Created**: $(date)
**By**: create-worktree.sh
EOF

echo "✅ Created WORKTREE_INFO.md"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Worktree Setup Complete!"
echo ""
echo "📍 Location: $WORKTREE_PATH"
echo "🌿 Branch: $BRANCH_NAME"
echo "📦 Package: $PACKAGE_NAME"
echo ""
echo "Next steps:"
echo "  1. cd $WORKTREE_PATH"
echo "  2. npm run dev:crm"
echo "  3. Start developing!"
echo ""
echo "Documentation:"
echo "  - WORKTREE_INFO.md (in the worktree)"
echo "  - GIT_WORKTREE_NOTES.md (if applicable)"
echo ""
echo "Helpful commands:"
echo "  git worktree list                    # List all worktrees"
echo "  ./safe-remove-worktree.sh $WORKTREE_PATH  # Remove safely"
echo "  ./recover-worktree.sh                # Recover if needed"
echo ""
