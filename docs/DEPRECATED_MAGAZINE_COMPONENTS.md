# Deprecated Magazine Components

**Deprecated on:** 2026-01-06
**Location:** `src/components/Magazine/deprecated/`

## Summary

Five Magazine components have been deprecated and moved to the `deprecated/` folder. These components were using older patterns and have been fully replaced by enhanced versions that provide better UX with readable property labels, proper formatting utilities, and advanced features.

## Why Deprecated?

These components were using older patterns:
- Raw property subtype ID counts instead of readable labels
- No integration with `usePropertyTypeLabels` hook
- Missing `propertyParse` utilities for consistent formatting
- Basic UI without carousel, payment flow, or admin features
- Replaced by Enhanced versions with better UX

## Deprecated Components

### 1. `PropertyDetails.jsx`
**Replaced by:** `EnhancedPropertyDetails.jsx`

**Issues:**
- Shows raw subtype count: `{property.pstids?.replace(/^,|,$/g, '').split(',').filter(id => id.trim()).length || 0}`
- No readable subtype labels using `usePropertyTypeLabels`
- Basic advertiser display without carousel
- No payment flow integration
- Missing admin viewing mode

**Used by (deprecated):**
- `PropertiesDataTable.jsx`

---

### 2. `PropertiesDataTable.jsx`
**Replaced by:** `EnhancedPropertiesDataTable.jsx`

**Issues:**
- Uses deprecated `PropertyDetails.jsx` component
- No enhanced property data support (addressText, typesText, subtypesText, etc.)
- Basic expand/collapse without optimistic UI updates

**Used by (deprecated):**
- `AgentPaginatedTable.jsx`
- `AgentPropertiesTable.jsx`

---

### 3. `AgentPaginatedTable.jsx`
**Replaced by:** `AgentPaginatedEnhancedTable.jsx`

**Issues:**
- Uses deprecated `PropertiesDataTable.jsx`
- Imported in `/_auth/_dashboard/mag/index.jsx` (line 4) but **never rendered**
- Line 84 uses `AgentPaginatedEnhancedTable` instead

**Status:** Orphaned - imported but never used

---

### 4. `AgentPropertiesTable.jsx`
**Replaced by:** `AgentPaginatedEnhancedTable.jsx`

**Issues:**
- Uses deprecated `PropertiesDataTable.jsx`
- Part of non-paginated workflow (older pattern)
- No TanStack Query integration

**Used by (deprecated):**
- `MagazineDashboard.jsx`

---

### 5. `MagazineDashboard.jsx`
**Replaced by:** Route-based approach with `AgentPaginatedEnhancedTable`

**Issues:**
- Uses deprecated `AgentPropertiesTable.jsx`
- Not imported anywhere in the codebase
- Old dashboard pattern replaced by route-based navigation

**Status:** Orphaned - no imports found

---

## Migration Status

✅ **All active routes fully migrated to Enhanced versions**

### Active Routes Using Enhanced Components:

1. **Magazine Dashboard Route**
   `/_auth/_dashboard/mag/` → Uses `AgentPaginatedEnhancedTable` (line 84)
   - File: `src/routes/_auth._dashboard.mag.index.jsx`
   - Features: Pagination, enhanced property details, carousel, payment flow

2. **Agent Properties Route**
   `/_auth/_dashboard/agency/agent/$nid` → Uses `AgentPaginatedEnhancedTable` (line 131)
   - File: `src/routes/_auth._dashboard.agency.agent.$nid.jsx`
   - Features: Admin viewing mode, agent-specific properties

### Enhanced Component Stack (Active):

```
AgentPaginatedEnhancedTable
  ├── EnhancedPropertiesDataTable
  │     └── EnhancedPropertyDetails ✅
  │           ├── usePropertyTypeLabels (readable labels)
  │           ├── propertyParse utilities (address, size, tenure)
  │           ├── CSSCarousel (advertiser cards)
  │           ├── CurrentSchedules
  │           └── ScheduleWizardModal (with payment flow)
```

### Deprecated Component Stack (Unused):

```
AgentPaginatedTable ❌ (imported but not used)
  └── PropertiesDataTable ❌
        └── PropertyDetails ❌
              ├── Raw subtype counts
              ├── Basic advertiser grid
              └── CurrentSchedules

AgentPropertiesTable ❌ (orphaned)
  └── PropertiesDataTable ❌

MagazineDashboard ❌ (orphaned)
  └── AgentPropertiesTable ❌
```

## Key Improvements in Enhanced Versions

### 1. Readable Property Labels
**Before:** `{property.pstids?.split(',').length}` → Shows "3"
**After:** `{getSubtypeLabels(property.pstids)}` → Shows ["Office", "Retail", "Industrial"]

### 2. Consistent Property Formatting
**Before:** Manual property field access
**After:** Uses `propertyParse` utilities:
- `propertyParse.addressText()` - Formatted address with privacy masking
- `propertyParse.size()` - Parsed size data
- `propertyParse.tenure()` - Parsed tenure with price/rent

### 3. Enhanced UX Features
- **Carousel navigation** for advertiser cards (CSS-based, no JS dependencies)
- **Payment flow integration** for self-assign bookings
- **Admin viewing mode** for cross-agent management
- **Optimistic UI updates** with TanStack Query cache management
- **Expand/collapse with show more** for subtypes/types

### 4. Better Code Patterns
- **TanStack Query** for server state management
- **React Hook Form** integration in modals
- **Proper loading states** and error handling
- **Memoized computations** for performance

## Files Moved

```bash
src/components/Magazine/AgentPropertiesTable/PropertyDetails.jsx
  → src/components/Magazine/deprecated/PropertyDetails.jsx

src/components/Magazine/AgentPropertiesTable/PropertiesDataTable.jsx
  → src/components/Magazine/deprecated/PropertiesDataTable.jsx

src/components/Magazine/AgentPropertiesTable/AgentPaginatedTable.jsx
  → src/components/Magazine/deprecated/AgentPaginatedTable.jsx

src/components/Magazine/AgentPropertiesTable/AgentPropertiesTable.jsx
  → src/components/Magazine/deprecated/AgentPropertiesTable.jsx

src/components/Magazine/MagazineDashboard/MagazineDashboard.jsx
  → src/components/Magazine/deprecated/MagazineDashboard.jsx
```

## If You Need to Restore

These files are kept for reference. If you need to restore them:

```bash
# From the Magazine directory
cd src/components/Magazine
git mv deprecated/PropertyDetails.jsx AgentPropertiesTable/
git mv deprecated/PropertiesDataTable.jsx AgentPropertiesTable/
git mv deprecated/AgentPaginatedTable.jsx AgentPropertiesTable/
git mv deprecated/AgentPropertiesTable.jsx AgentPropertiesTable/
git mv deprecated/MagazineDashboard.jsx MagazineDashboard/
```

## Related Stats Component Refactoring

The Stats module was also refactored to use the same patterns:

**Component:** `src/components/Stats/PropertyRow/PropertyRow.jsx`

**Improvements:**
- Added `usePropertyTypeLabels` for readable subtype badges
- Integrated `propertyParse.addressText()` for consistent address formatting
- Integrated `propertyParse.size()` and `propertyParse.tenure()`
- Uses `displaySize` and `displayTenure` utilities
- Interactive expand/collapse for subtype badges
- Backend updated with all required property fields

**Backend Changes:**
- `/api/stats/advertiser/:advertiserId/agency/:agencyId/properties` - Added 20+ property fields
- `/api/stats/agency/:agencyId/advertiser/:advertiserId/properties` - Added 20+ property fields

## Safe to Delete After

**Review Date:** 2026-02-06 (30 days from deprecation)

After confirming no production issues with the Enhanced versions for 30 days, these files can be permanently deleted.

## Verification Checklist

Before permanent deletion, verify:
- [ ] No imports found for deprecated components in codebase
- [ ] All Magazine routes use Enhanced versions
- [ ] No production errors related to missing components
- [ ] User acceptance testing completed on Enhanced features
- [ ] Analytics confirm users are not encountering broken features

## Questions?

If you have questions about this deprecation or need to understand the Enhanced component patterns, refer to:
- `src/components/Magazine/AgentPropertiesTable/EnhancedPropertyDetails.jsx`
- `src/hooks/usePropertyTypeLabels.js`
- `src/utils/propertyParse.js`
