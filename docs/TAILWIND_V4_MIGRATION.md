# Tailwind CSS v4 Migration

This branch contains the Tailwind CSS v4 migration. Below are the key changes and testing instructions.

## What Changed

### 1. Dependencies
- **Removed**: `tailwindcss@3.4.1`, `autoprefixer`, `postcss`, `tailwindcss-animate`
- **Added**: `tailwindcss@next`, `@tailwindcss/vite@next`

### 2. Configuration Files
- **Modified**: `vite.config.js` - Added `@tailwindcss/vite` plugin
- **Modified**: `src/index.css` - Migrated to v4 syntax with `@import "tailwindcss"`
- **Kept for reference**: `tailwind.config.js`, `postcss.config.js` (not auto-loaded)

### 3. CSS Changes

#### Import Syntax
```css
/* Before (v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* After (v4) */
@import "tailwindcss";
```

#### Theme Configuration
Custom animations and theme settings moved to CSS using `@theme` and `@utility` directives.

### 4. Breaking Changes Fixed

The automated upgrade tool (`npx @tailwindcss/upgrade`) fixed:

- **Utility renames**: `rounded-sm` → `rounded-xs`, `shadow-sm` → `shadow-xs`, etc.
- **Important modifier position**: `!text-white` → `text-white!`
- **Opacity syntax**: `bg-opacity-40` → component-level opacity handling
- **Border defaults**: Added explicit border color fallback

**Files affected**: 43 files modified across the codebase

### 5. Custom Animations Migrated

All custom animations from `tailwind.config.js` have been migrated to `src/index.css`:
- `animate-accordion-down`
- `animate-accordion-up`
- `animate-gradient-shift`
- `animate-shimmer`
- `animate-confetti-explode`

## Browser Requirements

⚠️ **Important**: Tailwind v4 requires modern browsers:
- Safari 16.4+ (September 2022)
- Chrome 111+ (March 2023)
- Firefox 128+ (July 2024)

Check your analytics before deploying to production!

## Testing Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev:crm
```

The dev server will start at `https://localhost:5173/crm`

### 3. Test Key Features

#### Visual Regression Testing
- [ ] Dark mode toggle works correctly
- [ ] All animations work (accordions, gradients, shimmer effects)
- [ ] Border colors display correctly
- [ ] Rounded corners look correct (check buttons, cards, inputs)
- [ ] Hover states work properly
- [ ] Focus rings display correctly

#### Component Testing
- [ ] Magazine components render correctly
- [ ] Tables and data grids display properly
- [ ] Forms work correctly
- [ ] Modals and dialogs display properly
- [ ] Navigation components work
- [ ] Selection components (with disabled states)

#### Responsive Testing
- [ ] Mobile layouts work
- [ ] Tablet layouts work
- [ ] Desktop layouts work
- [ ] Container queries work correctly

### 4. Build Testing
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Check that:
- [ ] Build completes without errors
- [ ] CSS bundle size is smaller than v3
- [ ] No console errors in preview

### 5. Compare with v3

To compare side-by-side:

```bash
# In this branch (v4)
PORT=5174 npm run dev:crm

# In develop branch (v3)
cd /Users/salgadom/EACH/each-monorepo/apps/frontend/4prop-crm-react
PORT=5173 npm run dev:crm
```

Visit:
- v3: https://localhost:5173/crm
- v4: https://localhost:5174/crm

## Performance Improvements

Expected improvements with v4:
- ~3.5x faster builds
- Smaller CSS bundle size
- Better HMR (Hot Module Replacement) performance

## Known Issues

### tailwindcss-animate Plugin
The `tailwindcss-animate` plugin was removed. All animations have been manually migrated to CSS. If you need to add new animations, use the `@utility` directive in `src/index.css`.

### Custom Plugins
If you had custom Tailwind plugins, they need to be rewritten for v4 using CSS instead of JavaScript.

## Rollback Instructions

If you need to rollback:

```bash
git checkout develop
npm install
```

## Next Steps

1. **Test thoroughly** - Use the checklist above
2. **Check browser analytics** - Ensure users are on supported browsers
3. **Deploy to staging** - Test in production-like environment
4. **Monitor for issues** - Watch for console errors or visual bugs
5. **Merge to main** - Once confident all is working

## Resources

- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Breaking Changes Reference](https://tailwindcss.com/docs/upgrade-guide#breaking-changes)

## Questions?

If you encounter issues:
1. Check the browser console for errors
2. Verify all dependencies installed correctly
3. Clear Vite cache: `rm -rf node_modules/.vite`
4. Review the official upgrade guide linked above
