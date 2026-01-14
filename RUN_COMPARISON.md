# Running Tailwind v3 vs v4 Side-by-Side

You now have two worktrees set up:

## Worktree Setup

1. **Main worktree (v3)**: `/Users/salgadom/EACH/each-monorepo/apps/frontend/4prop-crm-react`
   - Branch: `develop`
   - Tailwind CSS: v3.4.1

2. **Test worktree (v4)**: `/Users/salgadom/EACH/each-monorepo/apps/frontend/4prop-crm-react-tw4`
   - Branch: `feature/tailwind-v4-migration`
   - Tailwind CSS: v4.1.18

## Running Both Simultaneously

### Terminal 1 - Tailwind v3 (develop)
```bash
cd /Users/salgadom/EACH/each-monorepo/apps/frontend/4prop-crm-react
npm run dev:crm
```
Access at: **https://localhost:5173/crm**

### Terminal 2 - Tailwind v4 (migration)
```bash
cd /Users/salgadom/EACH/each-monorepo/apps/frontend/4prop-crm-react-tw4
PORT=5174 npm run dev:crm
```
Access at: **https://localhost:5174/crm**

## Visual Comparison

Open both URLs in different browser tabs or side-by-side windows:
- **v3**: https://localhost:5173/crm
- **v4**: https://localhost:5174/crm

## What to Compare

1. **Visual appearance** - Should be identical
2. **Animations** - Accordions, gradients, shimmer effects
3. **Dark mode** - Toggle and check colors
4. **Responsive layouts** - Resize browser window
5. **Performance** - Notice faster HMR in v4?

## Cleanup When Done

### Remove the Tailwind v4 worktree
```bash
cd /Users/salgadom/EACH/each-monorepo/apps/frontend/4prop-crm-react
git worktree remove ../4prop-crm-react-tw4

# Or force remove if files changed
git worktree remove ../4prop-crm-react-tw4 --force
```

### Remove from npm workspace (from monorepo root)
```bash
cd /Users/salgadom/EACH/each-monorepo
npm install
```

## Notes

- The worktree package name was temporarily renamed to `react-4prop-crm-tw4` to avoid npm workspace conflicts
- Both worktrees share the root monorepo `node_modules` for common dependencies
- Each has its own Tailwind CSS version installed locally
- Changes in one worktree don't affect the other

## If You Decide to Keep v4

Once you're satisfied with testing:

```bash
# Switch main worktree to the migration branch
cd /Users/salgadom/EACH/each-monorepo/apps/frontend/4prop-crm-react
git checkout feature/tailwind-v4-migration

# Remove the test worktree
git worktree remove ../4prop-crm-react-tw4

# Merge to develop
git checkout develop
git merge feature/tailwind-v4-migration

# Push to remote
git push origin develop
```
