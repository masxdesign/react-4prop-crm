# Worktree Quick Reference Card

## 📋 Common Commands

### Create New Worktree
```bash
./scripts/create-worktree.sh feature/my-feature ../4prop-crm-react-myfeature
```

### List All Worktrees
```bash
git worktree list
```

### Remove Worktree Safely
```bash
./scripts/safe-remove-worktree.sh ../4prop-crm-react-myfeature
```

### Recover Deleted Worktree
```bash
./scripts/recover-worktree.sh
```

---

## 🎯 Three Helper Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `scripts/create-worktree.sh` | Create new worktree | Starting new feature/fix |
| `scripts/safe-remove-worktree.sh` | Delete worktree safely | Feature complete/merged |
| `scripts/recover-worktree.sh` | Recover deleted worktree | Accidental deletion |

---

## 🚀 Workflow Examples

### Start New Feature
```bash
# 1. Create worktree
./scripts/create-worktree.sh feature/user-auth ../4prop-crm-react-auth

# 2. Start developing
cd ../4prop-crm-react-auth
PORT=5176 npm run dev:crm

# 3. Make changes & commit
git add .
git commit -m "✨ feat: add user authentication"
```

### Work on Existing Feature
```bash
# Just cd to the worktree
cd /Users/salgadom/EACH/each-monorepo/apps/frontend/4prop-crm-react-mobile
npm run dev:crm
```

### Finish Feature
```bash
# 1. Push your branch
git push origin feature/my-feature

# 2. Create PR (optional)
gh pr create

# 3. Merge to develop
cd ../4prop-crm-react
git checkout develop
git merge feature/my-feature

# 4. Remove worktree
./scripts/safe-remove-worktree.sh ../4prop-crm-react-myfeature
```

---

## 🔍 Checking Worktree Status

### See All Worktrees
```bash
git worktree list
```

Output:
```
/path/to/4prop-crm-react          6d1a5e0 [develop]
/path/to/4prop-crm-react-tw4      174e63f [feature/tailwind-v4-migration]
/path/to/4prop-crm-react-mobile   6b25578 [feature/mobile-responsive-improvements]
```

### See Which Files Git is Ignoring
```bash
cd /path/to/worktree
git ls-files -v | grep '^h'
```

Should show: `h package.json`

### Check Uncommitted Changes
```bash
cd /path/to/worktree
git status
```

---

## ⚠️ Important Rules

### ✅ DO:
- Use `scripts/create-worktree.sh` to create new worktrees
- Use `scripts/safe-remove-worktree.sh` to remove worktrees
- Commit normally with `git add .` and `git commit`
- Each worktree can run on a different port

### ❌ DON'T:
- Manually edit package.json name (script does it)
- Commit package.json changes (git ignores it)
- Use `rm -rf` to delete worktrees (use script)
- Checkout the same branch in multiple worktrees

---

## 🆘 Troubleshooting

### "Branch already checked out"
```bash
# A branch can only be checked out in ONE worktree
git worktree list  # See where it's checked out
```

### "npm workspace conflict"
```bash
# Worktree missing package.json workaround
cd /path/to/worktree
./scripts/create-worktree.sh  # Use the script!
```

### "Port already in use"
```bash
lsof -ti:5175 | xargs kill -9
# Or use different port
PORT=5177 npm run dev:crm
```

### Accidentally deleted worktree
```bash
./scripts/recover-worktree.sh
# Follow interactive prompts
```

---

## 📦 Package Name Workaround

Each worktree needs a unique package name for npm workspaces:

| Worktree | Package Name |
|----------|--------------|
| 4prop-crm-react | react-4prop-crm |
| 4prop-crm-react-tw4 | react-4prop-crm-tw4 |
| 4prop-crm-react-mobile | react-4prop-crm-mobile |
| 4prop-crm-react-myfeature | react-4prop-crm-myfeature |

**Git automatically ignores these changes** - they won't be committed!

---

## 🎓 Learn More

- Full documentation: `WORKTREE_SETUP.md`
- Each worktree has: `WORKTREE_INFO.md`
- Package.json details: `GIT_WORKTREE_NOTES.md` (in worktrees)

---

**Pro Tip:** Keep this file open in a terminal for quick reference!

```bash
less WORKTREE_QUICK_REFERENCE.md
```
