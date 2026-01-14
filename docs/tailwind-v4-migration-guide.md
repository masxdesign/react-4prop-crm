# Tailwind CSS v4 Migration Guide

This guide documents the migration from Tailwind CSS v3 to v4 and serves as a reference for the key changes.

## Overview

Tailwind CSS v4 is a major rewrite with significant performance improvements and a new CSS-first configuration approach.

### Key Benefits
- ~3.5x faster builds
- Smaller CSS bundle size
- Better HMR (Hot Module Replacement) performance
- CSS-first configuration (no JavaScript config required)
- Native CSS cascade layers

## Browser Requirements

**Important**: Tailwind v4 requires modern browsers:

| Browser | Minimum Version | Release Date |
|---------|-----------------|--------------|
| Safari | 16.4+ | September 2022 |
| Chrome | 111+ | March 2023 |
| Firefox | 128+ | July 2024 |

Check your analytics before deploying to production.

## Migration Steps

### 1. Update Dependencies

```bash
# Remove old packages
npm uninstall tailwindcss autoprefixer postcss tailwindcss-animate

# Install v4
npm install tailwindcss@next @tailwindcss/vite@next
```

### 2. Update Vite Config

```javascript
// vite.config.js
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    // ... other plugins
  ],
})
```

### 3. Update CSS Entry Point

```css
/* Before (v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* After (v4) */
@import "tailwindcss";
```

### 4. Run Automated Upgrade

```bash
npx @tailwindcss/upgrade
```

This tool automatically fixes most breaking changes in your codebase.

## Breaking Changes

### Utility Renames

| v3 | v4 |
|----|-----|
| `rounded-sm` | `rounded-xs` |
| `rounded` | `rounded-sm` |
| `shadow-sm` | `shadow-xs` |
| `shadow` | `shadow-sm` |
| `blur-sm` | `blur-xs` |
| `blur` | `blur-sm` |

### Important Modifier Position

```html
<!-- Before (v3) -->
<div class="!text-white !bg-black">

<!-- After (v4) -->
<div class="text-white! bg-black!">
```

### Opacity Syntax

```html
<!-- Before (v3) - DEPRECATED -->
<div class="bg-black bg-opacity-50">

<!-- After (v4) - Use slash notation -->
<div class="bg-black/50">
```

This applies to all color utilities:
- `bg-red-500/75` instead of `bg-red-500 bg-opacity-75`
- `text-blue-600/50` instead of `text-blue-600 text-opacity-50`
- `border-gray-300/25` instead of `border-gray-300 border-opacity-25`

### Border Color Defaults

v4 doesn't include a default border color. Add explicit colors:

```html
<!-- May need explicit color -->
<div class="border border-gray-200">
```

## CSS-First Configuration

### Theme Configuration

Move theme settings from `tailwind.config.js` to CSS:

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-brand: #3b82f6;
  --color-brand-dark: #1d4ed8;

  /* Fonts */
  --font-sans: "Inter", system-ui, sans-serif;

  /* Spacing */
  --spacing-128: 32rem;
}
```

### Custom Utilities

```css
@utility shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Custom Animations

```css
@theme {
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
}

@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
```

## Plugin Migration

### tailwindcss-animate

This plugin is not compatible with v4. Migrate animations manually:

```css
/* Before: tailwindcss-animate plugin */

/* After: Manual CSS */
@theme {
  --animate-fade-in: fade-in 0.2s ease-out;
  --animate-fade-out: fade-out 0.2s ease-out;
  --animate-slide-in: slide-in 0.2s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slide-in {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

### Custom JavaScript Plugins

v4 uses CSS instead of JavaScript for configuration. Rewrite plugins using `@theme` and `@utility` directives.

## Testing Checklist

### Visual Regression
- [ ] Dark mode toggle works correctly
- [ ] All animations work (accordions, gradients, shimmer effects)
- [ ] Border colors display correctly
- [ ] Rounded corners look correct (buttons, cards, inputs)
- [ ] Hover states work properly
- [ ] Focus rings display correctly

### Component Testing
- [ ] Forms render correctly
- [ ] Tables and data grids display properly
- [ ] Modals and dialogs display properly
- [ ] Navigation components work
- [ ] Selection components (with disabled states)

### Responsive Testing
- [ ] Mobile layouts work
- [ ] Tablet layouts work
- [ ] Desktop layouts work
- [ ] Container queries work correctly

### Build Testing
- [ ] Build completes without errors
- [ ] CSS bundle size is smaller than v3
- [ ] No console errors in preview

## Side-by-Side Comparison

To compare v3 and v4 side-by-side:

```bash
# Terminal 1 - v4 branch
PORT=5174 npm run dev

# Terminal 2 - v3 branch (develop)
cd /path/to/main-repo
PORT=5173 npm run dev
```

Visit:
- v3: https://localhost:5173/crm
- v4: https://localhost:5174/crm

## Rollback Instructions

If you need to rollback:

```bash
git checkout develop
npm install
```

## Troubleshooting

### Styles Not Applying

1. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

### Build Errors

1. Check for deprecated syntax in components
2. Run upgrade tool again:
   ```bash
   npx @tailwindcss/upgrade
   ```

### Missing Animations

Check that animations are defined in `src/index.css` using `@theme` and `@keyframes`.

## Resources

- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Breaking Changes Reference](https://tailwindcss.com/docs/upgrade-guide#breaking-changes)
- [CSS-First Configuration](https://tailwindcss.com/docs/configuration)
