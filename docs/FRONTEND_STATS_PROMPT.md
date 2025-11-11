# Frontend Statistics Pages Implementation

## Task Overview

Implement two statistics dashboard pages in the React frontend to display property performance metrics for Advertisers and Agencies with **lazy-loaded** hierarchical drill-down functionality for optimal performance.

## Tech Stack

This project uses:
- **TanStack Router** - File-based routing with type-safe navigation and data loaders
- **TanStack Query** - Server state management with caching and mutations
- **TanStack Table** - Headless table library for flexible data grids
- **Tailwind CSS 3** - Utility-first CSS framework (use `/opacity` syntax for colors, e.g., `bg-black/50`)
- **shadcn/ui** - Copy-paste component library built on Radix UI and Tailwind
- **date-fns** - Modern date utility library for formatting and manipulation

## Library Implementation Guidance

### TanStack Router
- Use file-based routing: `src/routes/stats/advertiser/$advertiserId.jsx`
- Leverage `loader` functions for data prefetching before route renders
- Access params with `useParams({ from: '/route/path' })`
- Use `loaderDeps` to declare dependencies for cache invalidation
- Preload routes on hover with `<Link preload="intent">`
- Control data staleness with `staleTime` option in route config

### TanStack Query
- Use `useQuery` for fetching with `queryKey` and `queryFn`
- Cache responses automatically by `queryKey` structure
- Handle loading states: `isLoading`, `isFetching`, `isPending`
- Use `useMutation` for data modifications with `onSuccess`/`onError` callbacks
- Invalidate queries with `queryClient.invalidateQueries()`
- Control cache behavior with `staleTime` and `gcTime` options
- Use `enabled` option for conditional query execution

### TanStack Table
- Headless: bring your own UI (shadcn Table components)
- Define columns with `createColumnHelper()` for type safety
- Use `getCoreRowModel()` for basic table functionality
- Add `getSortedRowModel()` for client-side sorting
- Control state externally with `state` and `on[State]Change` props
- Custom cells with `cell` render functions in column definitions
- Expandable rows using `display` column type for expand buttons

### Tailwind CSS 3
- Use `/opacity` syntax for colors: `bg-black/50` instead of `bg-black bg-opacity-50`
- Apply at breakpoints: `md:`, `lg:` prefixes
- Responsive utilities: `md:w-32 lg:w-48`
- Combine with hover states: `hover:bg-red-500/60`
- Use `@layer utilities` for custom classes
- Leverage `@apply` to compose utilities into reusable classes
- Common patterns: `rounded-md border`, `text-muted-foreground`, `hover:bg-muted/50`

### shadcn/ui
- Components are copy-pasted into your project, not npm installed
- Install via CLI: `npx shadcn@latest add button`
- Customize components directly in `components/ui/` folder
- Built on Radix UI primitives + Tailwind styling
- Use theme variables from `components.json` config
- Common components: Button, Card, Table, Calendar, Avatar, Popover
- Accessible by default with ARIA attributes

### date-fns
- Use `format(date, 'yyyy-MM-dd')` for formatting
- Parse dates with `parse(dateString, formatString, referenceDate)`
- Date arithmetic: `subDays(date, 30)`, `addMonths(date, 1)`
- Use Unicode tokens: `yyyy` for year, `MM` for month, `dd` for day
- Format relative time with locale support
- Immutable: all functions return new Date objects

## API Endpoints

### Advertiser Statistics (Summary)
**Endpoint:** `GET /api/stats/advertiser/:advertiserId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Response Structure:**
```javascript
{
  advertiser_id: "123",
  dateRange: { start: "2025-10-01", end: "2025-11-05" },
  totalProperties: 25,
  dailySummary: [
    {
      date: "2025-11-05",
      totalProperties: 25,
      phone_reveals: 12,
      pdf_requests: 34,
      viewing_requests: 8,
      search_clicks: 156,
      enquiry_submissions: 5
    }
  ],
  agencyBreakdown: [
    {
      agency_id: "A001",
      agency_name: "Premier Properties Ltd",
      totalProperties: 15,
      phone_reveals: 45,
      pdf_requests: 120,
      viewing_requests: 28,
      search_clicks: 567,
      enquiry_submissions: 18
      // NOTE: No 'properties' array - lazy loaded separately
    }
  ]
}
```

### Advertiser Agency Properties (Lazy Load)
**Endpoint:** `GET /api/stats/advertiser/:advertiserId/agency/:agencyId/properties?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**When to call:** User expands an agency row

**Response Structure:**
```javascript
[
  {
    pid: 1001,
    agent_id: 501,
    agent_name: "John Smith",
    street: "123 Main Street",
    building: "Tower B",
    towncity: "London",
    suburblocality: "Westminster",
    postcode: "SW1A 1AA",
    types: "Flat",
    price: 500000,
    rent: 2500,
    description: "Beautiful property...",
    phone_reveals: 5,
    pdf_requests: 12,
    viewing_requests: 3,
    search_clicks: 45,
    enquiry_submissions: 2,
    enquirers: [
      {
        user_id: "usr_123",
        first: "Jane",
        last: "Doe",
        avatar: "https://...",
        occurred_at: "2025-11-05T14:30:00Z"
      }
    ]
  }
]
```

### Agency Statistics (Summary)
**Endpoint:** `GET /api/stats/agency/:agencyId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Response Structure:**
```javascript
{
  agency_id: "A001",
  numberOfAdvertisers: 8,
  dateRange: { start: "2025-10-01", end: "2025-11-05" },
  dailySummary: [ /* same as advertiser */ ],
  advertiserBreakdown: [
    {
      advertiser_id: "123",
      advertiser_name: "ABC Properties Ltd",  // NEW: Advertiser company name
      totalProperties: 15,
      phone_reveals: 45,
      pdf_requests: 120,
      viewing_requests: 28,
      search_clicks: 234,
      enquiry_submissions: 12
      // NOTE: No 'properties' array - lazy loaded separately
    }
  ]
}
```

### Agency Advertiser Properties (Lazy Load)
**Endpoint:** `GET /api/stats/agency/:agencyId/advertiser/:advertiserId/properties?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**When to call:** User expands an advertiser row

**Response Structure:** Same as advertiser agency properties above

## Requirements

### Page 1: Advertiser Statistics (`/stats/advertiser/:advertiserId`)

**Visual Hierarchy (4 levels with expand/collapse):**

1. **Level 1: Daily Summary Table** (always visible)
   - Columns: Date | Total Properties | Phone Reveals | View PDF | Viewing Requests
   - Sorted by date descending
   - Show totals row at top

2. **Level 2: Agency Breakdown** (expandable section below daily summary)
   - Button/link: "View by Agency"
   - Table columns: Agency Name | Total Properties | Phone Reveals | View PDF | Viewing Requests
   - Each row expandable to show Level 3

3. **Level 3: Properties per Agency** (expand individual agency row - **LAZY LOADED**)
   - **Trigger:** User clicks expand icon on agency row
   - **API Call:** `GET /api/stats/advertiser/:advertiserId/agency/:agencyId/properties`
   - Table columns: Property Address | Agent Name | Phone Reveals | View PDF | Viewing Requests | Search Clicks | Enquiries
   - Show loading spinner while fetching
   - Each row expandable to show Level 4

4. **Level 4: Enquirer Details** (expand individual property row - **ALREADY LOADED**)
   - **No API call needed** - enquirers array already included in Level 3 response
   - Table columns: Avatar | Name | Date Submitted
   - Display: Avatar image, "First Last" (from first + last fields), formatted date
   - Show "No enquiries yet" if empty array

**Additional Features:**
- Date range picker (default: last 30 days)
- Export to CSV button (optional)
- Loading states while fetching data
- Empty states with helpful messages

### Page 2: Agency Statistics (`/stats/agency/:agencyId`)

**Visual Hierarchy (similar to Advertiser but different breakdown):**

1. **Level 1: Summary Cards + Daily Summary**
   - Summary card: "Number of Advertisers: 8"
   - Daily summary table (same as advertiser page)

2. **Level 2: Advertiser Breakdown** (expandable section)
   - Button/link: "View by Advertiser"
   - Table columns: Advertiser Name | Total Properties | Phone Reveals | View PDF | Viewing Requests | Search Clicks | Enquiries
   - Each row expandable to show Level 3

3. **Level 3: Properties per Advertiser** (expand individual advertiser row - **LAZY LOADED**)
   - **Trigger:** User clicks expand icon on advertiser row
   - **API Call:** `GET /api/stats/agency/:agencyId/advertiser/:advertiserId/properties`
   - Table columns: Property Address | Agent Name | Phone Reveals | View PDF | Viewing Requests | Search Clicks | Enquiries
   - Show loading spinner while fetching
   - Each row expandable to show Level 4

4. **Level 4: Enquirer Details** (expand individual property row - **ALREADY LOADED**)
   - **No API call needed** - enquirers array already included in Level 3 response
   - Table columns: Avatar | Name | Date Submitted
   - Display: Avatar image, "First Last" (from first + last fields), formatted date
   - Show "No enquiries yet" if empty array

## Implementation Steps

### Step 1: Create Route Files (TanStack Router)

Define file-based routes for advertiser and agency stats pages.

**Pattern:**
- File: `src/routes/stats/advertiser/$advertiserId.jsx`
- Import and attach component to route
- Use `createFileRoute` for type-safe routing
- Access route params via `useParams({ from: '/route' })`

### Step 2: Build State Management Context

Create a React context to manage expand/collapse state for hierarchical data.

**Requirements:**
- Track expanded agencies/advertisers with properties array and loading state
- Track expanded property IDs
- Provide toggle functions for each level
- Provide loading state setters for async operations
- Export provider component and custom hook

**Implementation hints:**
- Use object to map IDs to `{ properties: [], isLoading: boolean }`
- Use Set for property IDs (efficient toggle)
- Toggle logic: if exists, set to null; otherwise, set to object
- Loading setters: merge loading boolean into existing object

### Step 3: Create Page Components with TanStack Query

Build main page components for advertiser and agency statistics.

**Structure:**
1. Extract route params (`useParams`)
2. Manage date range state (default: last 30 days with `subDays`)
3. Fetch summary data with `useQuery` (include ID + dateRange in `queryKey`)
4. Handle loading and error states
5. Render layout with StatsExpandProvider wrapper
6. Display header with metadata and DateRangePicker
7. Show DailySummaryTable in Card
8. Show breakdown table (agencies/advertisers) in Card

**Key patterns:**
- Use `URLSearchParams` to build API query strings
- Include all dependencies in `queryKey` for proper caching
- Wrap in provider so child components access expand state
- Use shadcn Card for section containers
- Center loading spinner with Loader2 icon

### Step 4: Create Reusable Components

**Component breakdown:**
- `<DateRangePicker>` - Date range selection with shadcn Calendar
- `<DailySummaryTable>` - TanStack Table displaying daily metrics
- `<AgencyBreakdownTable>` - Expandable table with lazy-loaded properties
- `<AdvertiserBreakdownTable>` - Similar to agency breakdown
- `<PropertyRow>` - Property details with expandable enquirers

### Step 5: Create Date Range Picker Component

Build a date range selector using shadcn Calendar and Popover.

**Features:**
- Button trigger showing current range
- Popover with Calendar in `mode="range"`
- Display two months (`numberOfMonths={2}`)
- Temporary state for selection before applying
- Apply/Cancel buttons
- Format dates with `date-fns` format function

**Implementation hints:**
- Store temp range as `{ from: Date, to: Date }`
- On apply, format to `yyyy-MM-dd` and call `onChange`
- Use `cn` utility for conditional className
- CalendarIcon from lucide-react

### Step 6: Create Daily Summary Table

Build a basic TanStack Table displaying daily metrics.

**Column setup:**
- Use `createColumnHelper()` for type safety
- Define columns with `accessor` for data fields
- Use `cell` function to format values (dates, numbers)
- Format dates with `date-fns` format
- Format numbers with `.toLocaleString()`

**Table rendering:**
- Initialize with `useReactTable({ data, columns, getCoreRowModel })`
- Render with shadcn Table components
- Map through `table.getHeaderGroups()` for headers
- Map through `table.getRowModel().rows` for body
- Use `flexRender` to render cells
- Show empty state when no data

### Step 7: Create Agency/Advertiser Breakdown Table with Lazy Loading

Build expandable breakdown tables that lazy-load property details.

**Column structure:**
- Add `display` column for expand button (ChevronRight/ChevronDown)
- Include all metric columns (name, totals, metrics)
- Show loading spinner in expand button when fetching

**Expand logic:**
1. Check if already expanded in context
2. If expanded, just toggle closed
3. If not expanded, set loading state
4. Fetch properties from API with dateRange params
5. Store properties in context via toggle function
6. Clear loading state

**Rendering expanded rows:**
- After main TableRow, conditionally render nested TableRow
- Use `colSpan={columns.length}` for full-width cell
- Apply `bg-muted/30` background for visual hierarchy
- Map through properties array and render PropertyRow components
- Wrap properties in container with padding and spacing

**Key patterns:**
- Use `row.original.agency_id` to access row data
- Handle click on entire row for UX
- Disable expand button during loading
- Access context functions with `useStatsExpand` hook

### Step 8: Create Property Row Component with Enquirers

Build property detail card with expandable enquirer list.

**Address formatting:**
- Concatenate building, street, suburb, town, postcode
- Filter out falsy values, join with commas
- Display property type as badge

**Metrics display:**
- Show metrics in grid layout
- Display number above label for each metric
- Use `text-center` alignment

**Enquirer expansion:**
- Local state for show/hide
- Button showing count with chevron icon
- Map through enquirers array when expanded
- Display Avatar with AvatarFallback (initials)
- Show "First Last" name format
- Format timestamp with `date-fns`

### Step 9: Styling Guidelines with Tailwind CSS 3

**Component Patterns:**
- Expandable rows: `hover:bg-muted/50 cursor-pointer`
- Nested content: `bg-muted/30` with padding
- Stat numbers: `font-semibold` with labels using `text-xs text-muted-foreground`
- Loading states: `animate-spin` with Loader2 icon
- Cards: `border-l-4 border-l-primary/20` for hierarchy visual cues
- Color with opacity: `bg-black/50` (not `bg-black bg-opacity-50`)
- Responsive: `md:w-32 lg:w-48` for breakpoint-specific styles
- Spacing: `space-y-6` for vertical rhythm, `gap-4` for flex/grid

## Column Definitions

**Consistent naming across both pages:**
- "Phone Reveals" = `phone_reveals`
- "View PDF" = `pdf_requests`
- "Viewing Requests" = `viewing_requests`
- "Search Clicks" = `search_clicks`
- "Enquiries" = `enquiry_submissions`

**Property Details Available (Level 3):**
- `pid` - Property ID
- `agent_id` - Agent/Negotiator ID
- `agent_name` - Agent/Negotiator name
- `street`, `building`, `towncity`, `suburblocality`, `postcode` - Address components
- `types` - Property type (e.g., "Flat", "House")
- `price` - Sale price (if for sale)
- `rent` - Rental price (if for rent)
- `description` - Property description text

**Enquirer Details (Level 4):**
- `user_id` - User identifier
- `first` - First name
- `last` - Last name
- `avatar` - Avatar image URL
- `occurred_at` - Timestamp of enquiry submission

## Date Handling

**Default date range:** Last 30 days using `date-fns`
- Use `subDays(new Date(), 30)` for start date
- Use `format(date, 'yyyy-MM-dd')` for API format
- Display dates with `format(date, 'MMM dd, yyyy')`
- Parse user dates with `parse(string, format, referenceDate)`

## Error Handling

Handle these cases:
- API errors (show error message)
- No data found (show "No properties found" message)
- Invalid advertiser/agency ID (redirect or show 404)
- Network timeout (retry button)

## Testing Checklist

- [ ] Data loads correctly for advertiser page
- [ ] Data loads correctly for agency page
- [ ] Date range picker updates data
- [ ] All 4 levels of hierarchy expand/collapse properly
- [ ] Empty states display correctly
- [ ] Loading states show while fetching
- [ ] Tables are responsive on mobile
- [ ] Enquirer emails/names display correctly
- [ ] No console errors
- [ ] Back button works correctly

## Performance Considerations

- **Lazy loading:** Properties only fetched when agency/advertiser expanded (~10x faster initial load)
- **TanStack Query caching:** Automatic caching by queryKey prevents redundant fetches
- **Virtual scrolling:** Consider for tables with 100+ rows
- **Debounce:** Date range changes (500ms) to reduce API calls
- **Pagination:** For very large datasets, implement server-side pagination

## Accessibility

- Use semantic HTML (`<table>`, `<th>`, `<td>`)
- Add ARIA labels for expand/collapse buttons
- Ensure keyboard navigation works
- Sufficient color contrast for stats

## Required shadcn/ui Components

Install these shadcn components (if not already present):

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add avatar
```

## Required Dependencies

```bash
npm install @tanstack/react-router @tanstack/react-query @tanstack/react-table
npm install date-fns lucide-react
```

## Additional Notes

- **No Authentication:** Pages are accessible via direct URL (e.g., `/stats/advertiser/123`)
- **Bookmark-friendly:** URL contains all state (ID + date range as query params)
- **Client Requirements:**
  - "View phone#" = phone reveals metric
  - "View PDF" = PDF requests metric
  - "Viewing request" = viewing requests metric
  - "Search Clicks" = search clicks metric
  - "Enquiries" = enquiry submissions metric
  - Enquirer display: Show avatar image + "First Last" name + submission date
  - Property address: Construct from `building`, `street`, `towncity`, `suburblocality`, `postcode`

## Implementation Checklist

- [ ] Install (if not already present) required dependencies (TanStack Router, Query, Table, date-fns, lucide-react)
- [ ] Install (if not already present) shadcn/ui components (button, card, table, calendar, popover, avatar)
- [ ] Create route files in `src/routes/stats/` (.jsx files)
- [ ] Build StatsExpandContext for managing hierarchical state
- [ ] Implement AdvertiserStatsPage with TanStack Query
- [ ] Implement AgencyStatsPage with TanStack Query
- [ ] Create DateRangePicker with shadcn Calendar and Popover
- [ ] Create DailySummaryTable with TanStack Table
- [ ] Create AgencyBreakdownTable with lazy loading
- [ ] Create AdvertiserBreakdownTable (similar to agency)
- [ ] Create PropertyRow component with enquirer expansion
- [ ] Ask me to Test expand/collapse functionality before next task
- [ ] Ask me to Test lazy loading performance before next task
- [ ] Add loading states and error handling
- [ ] Ensure responsive design with Tailwind breakpoints

**Implementation Priority:**
1. Basic page structure + API integration
2. Daily summary table (Level 1)
3. Agency/Advertiser breakdown (Level 2)
4. Property drill-down (Level 3)
5. Enquirer details (Level 4)
6. Polish: date range picker, loading states, styling
