# Git Worktree - package.json Workaround

## What Was Done

The `package.json` file in this worktree has been modified to avoid npm workspace conflicts:
- Original: `"name": "react-4prop-crm"`
- Modified: `"name": "react-4prop-crm-tw4"`

## Git Configuration

Git has been configured to **ignore** changes to `package.json` in this worktree using:

```bash
git update-index --assume-unchanged package.json
```

This means:
- ✅ You can commit other files normally with `git add .`
- ✅ The package.json name change will NOT be included in commits
- ✅ Git status will NOT show package.json as modified
- ✅ You don't need to worry about accidentally committing the workaround

## Verification

You can verify this is working:

```bash
# This will NOT show package.json as modified
git status

# Even though the file IS different
cat package.json | grep "name"
# Shows: "name": "react-4prop-crm-tw4"
```

## If You Need to Update package.json

If you need to make **real** changes to package.json (not the name):

1. **Temporarily re-enable tracking:**
   ```bash
   git update-index --no-assume-unchanged package.json
   ```

2. **Make your changes to package.json**

3. **Commit the changes:**
   ```bash
   git add package.json
   git commit -m "Update package.json dependencies"
   ```

4. **Re-apply the workaround:**
   ```bash
   # Change name back to worktree-specific name
   # (edit package.json manually or use sed)

   # Re-ignore the file
   git update-index --assume-unchanged package.json
   ```

## When Merging to develop

When you merge this branch to `develop`, the package.json will have the **original** name `"react-4prop-crm"` because:
- The name change was never committed
- Git is ignoring it in this worktree
- The original package.json from the branch will be used

## Cleanup

When you remove this worktree:

```bash
cd /Users/salgadom/EACH/each-monorepo/apps/frontend/4prop-crm-react
git worktree remove ../4prop-crm-react-tw4
```

The `--assume-unchanged` flag is automatically removed (it's worktree-specific).

## Check Which Files Are Being Ignored

To see if any files are being ignored:

```bash
git ls-files -v | grep '^h'
```

Files marked with 'h' (instead of 'H') are being ignored via `--assume-unchanged`.

## Summary

- 📦 package.json name: `react-4prop-crm-tw4` (local only)
- 🚫 Git ignoring: `package.json` changes
- ✅ Safe to commit: Everything except package.json
- 🔄 On merge: Original package.json name will be used
