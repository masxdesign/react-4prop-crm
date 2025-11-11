# Transfer Settlement Dashboard Components

## Component Hierarchy

```
TransferSettlementDashboard (route component)
├── TransferStats
│   └── Statistics cards with auto-refresh
├── ActionsBar
│   ├── Refresh button
│   └── Process All Settlements button (opens ProcessSettlementsDialog)
├── FailedTransfersTable (conditionally rendered)
│   ├── Alert banner
│   └── Table with Stripe links
└── PendingTransfersTable
    └── TransferRow × N
        └── Force Settle button (opens ForceSettleDialog)
```

## Component Documentation

### TransferStats
**Purpose**: Display high-level statistics
**Features**:
- Three cards: Pending, Settled, Failed
- Auto-refresh every 60s
- Critical alerts for >10 pending or any failed

### PendingTransfersTable
**Purpose**: Show all pending transfers
**Columns**: Advertiser, Week, Amount, Days Pending, Last Checked, Attempts, Actions
**Features**:
- Color-coded rows (green/yellow/red)
- Empty state when no pending transfers
- Auto-refresh every 60s

### FailedTransfersTable
**Purpose**: Alert admins to failed transfers
**Features**:
- Only shows when failed transfers exist
- Red alert styling
- Direct links to Stripe dashboard

### TransferRow
**Purpose**: Individual transfer in pending table
**Features**:
- Color coding based on days pending
- Force settle button
- Visual indicators (🟢⚠️🔴)

### ForceSettleDialog
**Purpose**: Confirm force settle action
**Features**:
- Transfer details summary
- Stripe link
- Warning if >3 attempts

### ProcessSettlementsDialog
**Purpose**: Bulk process confirmation and results
**Features**:
- Confirmation screen
- Processing animation
- Results display (processed/settled/failed)

### ActionsBar
**Purpose**: Global actions for the dashboard
**Features**:
- Manual refresh button
- Process all settlements button
- Auto-refresh indicator

## Data Flow

```
Route beforeLoad → Creates query options
         ↓
Route loader → Preloads data (parallel)
         ↓
Components → useQuery with same keys (instant from cache)
         ↓
User action → useMutation
         ↓
Success → Invalidate queries → Refetch → Update UI
```

## API Integration

All API calls use `bizchatClient` (axios instance):

```javascript
import { fetchTransferStats, fetchPendingTransfers, ... } from '../api';

// In component:
const { data, isLoading } = useQuery({
  queryKey: ['transfer-stats'],
  queryFn: fetchTransferStats,
  refetchInterval: 60000, // Auto-refresh
});
```

## Styling Patterns

### Color System
- **Green** (`bg-green-50`, `text-green-700`): Normal status
- **Yellow** (`bg-yellow-50`, `text-yellow-700`): Warning
- **Red** (`bg-red-50`, `text-red-700`): Critical
- **Blue** (`bg-blue-50`, `text-blue-800`): Info

### Responsive
- Cards: `grid-cols-1 md:grid-cols-3`
- Tables: Horizontal scroll on mobile
- Buttons: Stack on mobile

### Loading States
- Skeleton loaders for initial load
- Inline spinners for actions
- Route-level overlay for navigation

## Usage Example

```javascript
import { TransferStats, PendingTransfersTable, ActionsBar } from '@/components/Magazine/TransferManagement';

function MyDashboard() {
  return (
    <div className="space-y-6">
      <TransferStats />
      <ActionsBar />
      <PendingTransfersTable />
    </div>
  );
}
```

## Testing

### Mock Data Structure

```javascript
// Stats
{
  success: true,
  data: {
    pending: { count: 5, total_pounds: "300.00", avg_days: 3 },
    settled: { count: 150, total_pounds: "9000.00", avg_days: 5 },
    failed: { count: 2, total_pounds: "120.00", avg_days: 0 }
  }
}

// Pending Transfers
{
  success: true,
  count: 5,
  data: [
    {
      booking_item_id: 123,
      week_number: 1,
      transfer_amount_pounds: "60.00",
      days_pending: 4,
      settlement_attempts: 2,
      needs_attention: false,
      advertiser_name: "Property Magazine Ltd",
      settlement_checked_at: "2025-10-05T02:00:00Z",
      stripe_transfer_id: "tr_xxx"
    }
  ]
}
```

## Accessibility

- Semantic HTML (`<table>`, `<thead>`, `<tbody>`)
- ARIA roles (`role="alert"` for critical sections)
- Keyboard navigation (all buttons focusable)
- Screen reader friendly (descriptive labels)

## Performance Considerations

- Query caching prevents duplicate requests
- Auto-refresh only when tab is active (TanStack Query default)
- Optimistic updates for better perceived performance
- Parallel data loading on route entry

## Browser Support

Supports all modern browsers (Chrome, Firefox, Safari, Edge)
- ES Modules required
- CSS Grid and Flexbox
- Fetch API
