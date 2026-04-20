# Git Worktree Guide

Git worktree allows you to have multiple working directories attached to a single repository. This is useful for working on multiple features simultaneously without stashing changes or switching branches.

## What is Git Worktree?

A worktree is an additional working directory linked to your repository. Each worktree:
- Has its own working directory and index (staging area)
- Can have a different branch checked out
- Shares the same `.git` directory (saves disk space)
- Allows parallel development without branch switching

## Quick Reference

### Common Commands

| Command | Description |
|---------|-------------|
| `git worktree list` | List all worktrees |
| `git worktree add <path> <branch>` | Create new worktree |
| `git worktree remove <path>` | Remove worktree |
| `git worktree prune` | Clean up stale worktree references |

### Create New Worktree

```bash
# Create worktree with existing branch
git worktree add ../my-feature-worktree feature/my-feature

# Create worktree with new branch
git worktree add -b feature/new-feature ../new-feature-worktree

# Create worktree from specific commit
git worktree add ../hotfix-worktree HEAD~5
```

### List All Worktrees

```bash
git worktree list
```

Output example:
```
/path/to/main-repo          abc1234 [main]
/path/to/feature-worktree   def5678 [feature/my-feature]
/path/to/hotfix-worktree    ghi9012 [hotfix/urgent-fix]
```

### Remove Worktree

```bash
# Safe removal (checks for uncommitted changes)
git worktree remove ../my-feature-worktree

# Force removal (ignores uncommitted changes)
git worktree remove --force ../my-feature-worktree
```

### Clean Up Stale References

```bash
git worktree prune
```

## Workflow Examples

### Starting a New Feature

```bash
# 1. Create worktree for the feature
git worktree add -b feature/user-auth ../project-auth

# 2. Navigate to worktree
cd ../project-auth

# 3. Install dependencies (if needed)
npm install

# 4. Start development
npm run dev
```

### Working on Multiple Features

```bash
# Terminal 1 - Main development
cd /path/to/main-repo
npm run dev  # Port 5173

# Terminal 2 - Feature A
cd /path/to/feature-a-worktree
PORT=5174 npm run dev

# Terminal 3 - Feature B
cd /path/to/feature-b-worktree
PORT=5175 npm run dev
```

### Finishing a Feature

```bash
# 1. Commit and push changes in worktree
cd ../feature-worktree
git add .
git commit -m "feat: implement feature"
git push origin feature/my-feature

# 2. Create PR or merge
gh pr create  # or merge locally

# 3. Return to main repo and remove worktree
cd ../main-repo
git worktree remove ../feature-worktree

# 4. Delete branch if merged
git branch -d feature/my-feature
```

## Important Rules

### DO:
- Use separate ports for each worktree's dev server
- Commit changes before removing worktrees
- Use `git worktree remove` instead of `rm -rf`
- Run `npm install` in each worktree

### DON'T:
- Checkout the same branch in multiple worktrees (not allowed)
- Delete worktree directories manually without `git worktree remove`
- Forget to push changes before removing worktrees

## npm Workspace Conflicts

When using git worktrees in a monorepo with npm workspaces, each worktree needs a unique package name to avoid conflicts.

### The Problem

Multiple worktrees with the same `package.json` name causes npm workspace conflicts.

### The Solution

1. Modify `package.json` name in each worktree:
   ```json
   // Main repo
   { "name": "my-project" }

   // Worktree
   { "name": "my-project-feature" }
   ```

2. Tell git to ignore this change:
   ```bash
   git update-index --assume-unchanged package.json
   ```

3. Verify it's working:
   ```bash
   git ls-files -v | grep '^h'
   # Should show: h package.json
   ```

### Re-enable Tracking

If you need to make real changes to package.json:

```bash
# 1. Re-enable tracking
git update-index --no-assume-unchanged package.json

# 2. Make and commit changes
git add package.json
git commit -m "chore: update dependencies"

# 3. Re-apply workaround
# (restore worktree-specific name, then)
git update-index --assume-unchanged package.json
```

## Troubleshooting

### "Branch already checked out"

A branch can only be checked out in one worktree at a time.

```bash
# Find where branch is checked out
git worktree list

# Solution: use a different branch or remove existing worktree
```

### "Port already in use"

```bash
# Kill process on port
lsof -ti:5173 | xargs kill -9

# Or use different port
PORT=5174 npm run dev
```

### Accidentally Deleted Worktree Directory

```bash
# If you used rm -rf instead of git worktree remove:
git worktree prune  # Clean up stale references

# Then recreate if needed
git worktree add ../new-path branch-name
```

### Worktree Shows Modified Files Incorrectly

```bash
# Check which files are being ignored
git ls-files -v | grep '^h'

# Reset assume-unchanged if needed
git update-index --no-assume-unchanged <file>
```

## Best Practices

1. **Naming Convention**: Use descriptive directory names
   ```
   project/           # main
   project-auth/      # feature/auth
   project-hotfix/    # hotfix/urgent-fix
   ```

2. **Port Management**: Assign consistent ports
   ```
   Main:     5173
   Feature1: 5174
   Feature2: 5175
   Hotfix:   5180
   ```

3. **Clean Up Regularly**: Remove worktrees after merging
   ```bash
   git worktree list  # Review
   git worktree remove ../old-worktree
   git worktree prune
   ```

4. **Document Active Worktrees**: Keep a note of what each worktree is for

## Resources

- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [Git Book - Worktrees](https://git-scm.com/book/en/v2/Git-Tools-Multiple-Working-Trees)
