# Street Signal - React Implementation Guide

London Retail & Property Street Intelligence Tool for finding and ranking streets by POI density within postcode districts.

## Overview

Street Signal queries OpenStreetMap to analyze which streets have the highest concentration of shops, amenities, and commercial properties. The tool processes one district at a time (to respect API rate limits) and returns the top 3 streets per district.

## API Endpoints

All endpoints are proxied through the property-pub backend at `/api/street-signal/*`.

### POST `/api/street-signal/start`

Initialize a new processing job.

**Request:**
```javascript
{
  districts: "E1,SW1,W1" | ["E1", "SW1", "W1"],  // string or array
  preset: "shop" | "industrial" | "office" | "custom",
  radius_m: 900,        // default: 900
  max_assign_m: 200,    // default: 200
  // Only if preset === "custom":
  include_all_shops: false,
  shop_types: [],
  amenities: [],
  property_selectors: []
}
```

**Response:**
```javascript
{
  job_id: "uuid-string",
  total_districts: 5,
  message: "Job created successfully"
}
```

### POST `/api/street-signal/step`

Process the next district. Call repeatedly until `completed: true`.

**Request:** Empty body (uses server-side job state)

**Response:**
```javascript
{
  completed: false,
  total: 5,
  processed: 2,
  result: {
    district: "E1",
    success: true,
    error: null,
    total_pois: 156,
    total_streets_found: 42,
    street_1: "Commercial Street",
    count_1: 28,
    street_2: "Brick Lane",
    count_2: 24,
    street_3: "Whitechapel Road",
    count_3: 18,
    all_streets: [{ name: "Commercial Street", poi_count: 28 }, ...]
  }
}
```

### POST `/api/street-signal/reset`

Clear the current job.

**Response:**
```javascript
{ message: "Job reset successfully" }
```

### GET `/api/street-signal/download`

Download results as CSV file.

### GET `/api/street-signal/health`

Health check for the Street Signal service.

**Response:**
```javascript
{
  status: "ok" | "error",
  streetSignal: {
    baseUrl: "http://127.0.0.1:5001",
    reachable: true,
    error: null  // or error message string
  }
}
```

## Presets Configuration

```javascript
const PRESETS = {
  shop: {
    name: 'Shop',
    include_all_shops: true,
    amenities: ['restaurant', 'cafe', 'fast_food', 'pub', 'bar', 'pharmacy',
                'post_office', 'bank', 'atm', 'hairdresser', 'beauty', 'marketplace']
  },
  industrial: {
    name: 'Industrial',
    property_selectors: ['landuse=industrial', 'building=industrial',
                         'building=warehouse', 'industrial=*']
  },
  office: {
    name: 'Office',
    property_selectors: ['office=*']
  },
  custom: {
    name: 'Custom'
    // User selects filters manually
  }
};
```

## Filter Options (for custom preset)

```javascript
const AMENITY_TYPES = [
  'restaurant', 'cafe', 'fast_food', 'bar', 'pub', 'bank', 'atm', 'pharmacy',
  'clinic', 'dentist', 'doctors', 'hairdresser', 'beauty', 'post_office',
  'marketplace', 'place_of_worship'
];

const PROPERTY_SELECTORS = [
  'building=church', 'building=cathedral',
  'landuse=industrial', 'building=industrial', 'building=warehouse', 'industrial=*',
  'office=*',
  'building=commercial', 'building=retail', 'landuse=commercial', 'landuse=retail'
];
```

---

## React Implementation

### 1. API Service (`src/services/streetSignal.js`)

```javascript
import propertyPubClient from './propertyPubClient';

const BASE_PATH = '/api/street-signal';

export const streetSignalApi = {
  /**
   * Start a new processing job
   */
  start: async (params) => {
    const response = await propertyPubClient.post(`${BASE_PATH}/start`, params);
    return response.data;
  },

  /**
   * Process the next district in the queue
   */
  step: async () => {
    const response = await propertyPubClient.post(`${BASE_PATH}/step`);
    return response.data;
  },

  /**
   * Reset/clear the current job
   */
  reset: async () => {
    const response = await propertyPubClient.post(`${BASE_PATH}/reset`);
    return response.data;
  },

  /**
   * Check service health
   */
  health: async () => {
    const response = await propertyPubClient.get(`${BASE_PATH}/health`);
    return response.data;
  },

  /**
   * Get download URL for CSV
   */
  getDownloadUrl: () => {
    const baseUrl = propertyPubClient.defaults.baseURL;
    return `${baseUrl}${BASE_PATH}/download`;
  }
};
```

---

## Zustand Store Implementation

Zustand is a lightweight state management library. For Street Signal, it's ideal because:
- **Global state**: Job progress is accessible from any component
- **No providers**: Unlike Context, no wrapping required
- **Async actions**: Built-in support for async operations
- **Subscriptions**: Components auto-re-render on state changes

### Store Definition (`src/store/streetSignalStore.js`)

```javascript
import { create } from 'zustand';
import { streetSignalApi } from '@/services/streetSignal';

export const useStreetSignalStore = create((set, get) => ({
  // ============================================
  // STATE
  // ============================================
  jobId: null,
  isProcessing: false,
  results: [],
  total: 0,
  processed: 0,
  error: null,
  completed: false,

  // ============================================
  // COMPUTED VALUES (via selectors)
  // ============================================
  // Note: Zustand doesn't have built-in computed properties.
  // Use selectors when consuming the store (see examples below)

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Start a new job with given parameters
   * Automatically begins processing steps
   */
  start: async (params) => {
    // Reset state and mark as processing
    set({
      isProcessing: true,
      results: [],
      error: null,
      completed: false,
      processed: 0,
      total: 0
    });

    try {
      // Call the start endpoint
      const { job_id, total_districts } = await streetSignalApi.start(params);

      // Update state with job info
      set({ jobId: job_id, total: total_districts });

      // Automatically start processing steps
      get().processSteps();
    } catch (error) {
      set({ isProcessing: false, error: error.message });
    }
  },

  /**
   * Process steps recursively until complete
   * Called automatically by start(), can also be called manually to resume
   */
  processSteps: async () => {
    const { isProcessing } = get();

    // Guard: Don't process if stopped
    if (!isProcessing) return;

    try {
      // Process one step
      const stepResult = await streetSignalApi.step();

      // Update state with results
      set(state => ({
        processed: stepResult.processed,
        results: stepResult.result
          ? [...state.results, stepResult.result]
          : state.results,
        completed: stepResult.completed,
        isProcessing: !stepResult.completed
      }));

      // Continue if not completed
      if (!stepResult.completed) {
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
        get().processSteps();  // Recursive call
      }
    } catch (error) {
      set({ isProcessing: false, error: error.message });
    }
  },

  /**
   * Reset the job and clear all state
   */
  reset: async () => {
    try {
      await streetSignalApi.reset();
    } catch (error) {
      // Ignore reset errors, still clear local state
    }

    set({
      jobId: null,
      isProcessing: false,
      results: [],
      total: 0,
      processed: 0,
      error: null,
      completed: false
    });
  },

  /**
   * Stop processing without resetting results
   * Useful if user wants to pause and review
   */
  stop: () => {
    set({ isProcessing: false });
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  }
}));

// ============================================
// SELECTORS (for computed values)
// ============================================

/**
 * Get progress as percentage (0-100)
 */
export const selectProgress = (state) => {
  return state.total > 0
    ? Math.round((state.processed / state.total) * 100)
    : 0;
};

/**
 * Check if job has results to download
 */
export const selectCanDownload = (state) => {
  return state.completed && state.results.length > 0;
};

/**
 * Get successful results only
 */
export const selectSuccessfulResults = (state) => {
  return state.results.filter(r => r.success);
};

/**
 * Get failed results only
 */
export const selectFailedResults = (state) => {
  return state.results.filter(r => !r.success);
};
```

### Using the Store in Components

**Basic Usage - Reading State:**

```jsx
import { useStreetSignalStore, selectProgress } from '@/store/streetSignalStore';

function ProgressDisplay() {
  // Subscribe to specific state slices
  const processed = useStreetSignalStore(state => state.processed);
  const total = useStreetSignalStore(state => state.total);
  const isProcessing = useStreetSignalStore(state => state.isProcessing);

  // Use selector for computed values
  const progress = useStreetSignalStore(selectProgress);

  if (!isProcessing && total === 0) return null;

  return (
    <div>
      <div className="progress-bar" style={{ width: `${progress}%` }} />
      <span>{processed} / {total} ({progress}%)</span>
    </div>
  );
}
```

**Calling Actions:**

```jsx
import { useStreetSignalStore } from '@/store/streetSignalStore';

function ControlButtons() {
  // Get actions from store
  const start = useStreetSignalStore(state => state.start);
  const reset = useStreetSignalStore(state => state.reset);
  const stop = useStreetSignalStore(state => state.stop);
  const isProcessing = useStreetSignalStore(state => state.isProcessing);

  const handleStart = () => {
    start({
      districts: 'E1,SW1,W1',
      preset: 'shop',
      radius_m: 900,
      max_assign_m: 200
    });
  };

  return (
    <div>
      <button onClick={handleStart} disabled={isProcessing}>
        Start
      </button>
      <button onClick={stop} disabled={!isProcessing}>
        Pause
      </button>
      <button onClick={reset}>
        Reset
      </button>
    </div>
  );
}
```

**Results Table:**

```jsx
import { useStreetSignalStore, selectSuccessfulResults } from '@/store/streetSignalStore';

function ResultsTable() {
  // Subscribe to results array
  const results = useStreetSignalStore(state => state.results);

  // Or use selector for filtered results
  // const results = useStreetSignalStore(selectSuccessfulResults);

  return (
    <table>
      <thead>
        <tr>
          <th>District</th>
          <th>Street 1</th>
          <th>Count</th>
          <th>Street 2</th>
          <th>Count</th>
          <th>Street 3</th>
          <th>Count</th>
          <th>Total POIs</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result, idx) => (
          <tr key={idx}>
            <td>{result.district}</td>
            <td>{result.street_1 || '-'}</td>
            <td>{result.count_1 || 0}</td>
            <td>{result.street_2 || '-'}</td>
            <td>{result.count_2 || 0}</td>
            <td>{result.street_3 || '-'}</td>
            <td>{result.count_3 || 0}</td>
            <td>{result.total_pois || 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Complete Component Example:**

```jsx
import { useState } from 'react';
import { useStreetSignalStore, selectProgress, selectCanDownload } from '@/store/streetSignalStore';
import { streetSignalApi } from '@/services/streetSignal';

function StreetSignal() {
  // Form state (local)
  const [preset, setPreset] = useState('shop');
  const [districts, setDistricts] = useState('');
  const [radiusM, setRadiusM] = useState(900);
  const [maxAssignM, setMaxAssignM] = useState(200);

  // Global state from store
  const {
    isProcessing,
    results,
    error,
    completed,
    processed,
    total,
    start,
    reset,
    stop,
    clearError
  } = useStreetSignalStore();

  // Computed values via selectors
  const progress = useStreetSignalStore(selectProgress);
  const canDownload = useStreetSignalStore(selectCanDownload);

  const handleStart = async () => {
    if (!districts.trim()) {
      alert('Please enter at least one district');
      return;
    }

    await start({
      districts: districts.trim(),
      preset,
      radius_m: radiusM,
      max_assign_m: maxAssignM
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="bg-slate-800 text-white p-6 rounded-t-lg">
        <h1 className="text-2xl font-semibold">Street Signal</h1>
        <p className="text-slate-400 mt-1">
          London Retail & Property Street Intelligence Tool
        </p>
      </div>

      <div className="grid grid-cols-[350px_1fr] border border-t-0 rounded-b-lg">
        {/* Controls Panel */}
        <div className="bg-slate-50 border-r p-5 space-y-6">
          {/* Preset */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preset</label>
            <select
              value={preset}
              onChange={e => setPreset(e.target.value)}
              disabled={isProcessing}
              className="w-full p-2 border rounded"
            >
              <option value="shop">Shop</option>
              <option value="industrial">Industrial</option>
              <option value="office">Office</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">Radius (m)</label>
              <input
                type="number"
                value={radiusM}
                onChange={e => setRadiusM(Number(e.target.value))}
                disabled={isProcessing}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Max Assign (m)</label>
              <input
                type="number"
                value={maxAssignM}
                onChange={e => setMaxAssignM(Number(e.target.value))}
                disabled={isProcessing}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Districts */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Districts</label>
            <textarea
              value={districts}
              onChange={e => setDistricts(e.target.value)}
              placeholder="E1&#10;SW1&#10;W1"
              className="w-full p-2 border rounded font-mono min-h-[100px]"
              disabled={isProcessing}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleStart}
              disabled={isProcessing}
              className="flex-1 bg-blue-500 text-white p-3 rounded disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Run'}
            </button>
            {isProcessing && (
              <button
                onClick={stop}
                className="bg-yellow-500 text-white p-3 rounded"
              >
                Pause
              </button>
            )}
            <button
              onClick={reset}
              className="bg-gray-500 text-white p-3 rounded"
            >
              Reset
            </button>
          </div>

          {canDownload && (
            <button
              onClick={() => window.open(streetSignalApi.getDownloadUrl(), '_blank')}
              className="w-full bg-green-500 text-white p-3 rounded"
            >
              Download CSV
            </button>
          )}
        </div>

        {/* Results Panel */}
        <div className="p-5 space-y-4">
          {/* Error display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded flex justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="font-bold">×</button>
            </div>
          )}

          {/* Progress bar */}
          {(isProcessing || completed) && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded h-6">
                <div
                  className="bg-blue-500 h-6 rounded transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-slate-500 text-center">
                {processed} / {total} ({progress}%)
              </p>
            </div>
          )}

          {/* Results table */}
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-white sticky top-0">
                <tr>
                  <th className="p-3 text-left">District</th>
                  <th className="p-3 text-left">Street 1</th>
                  <th className="p-3 text-right">Count</th>
                  <th className="p-3 text-left">Street 2</th>
                  <th className="p-3 text-right">Count</th>
                  <th className="p-3 text-left">Street 3</th>
                  <th className="p-3 text-right">Count</th>
                  <th className="p-3 text-right">Total POIs</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-medium">{result.district}</td>
                    <td className="p-3">{result.street_1 || '-'}</td>
                    <td className="p-3 text-right">{result.count_1 || 0}</td>
                    <td className="p-3">{result.street_2 || '-'}</td>
                    <td className="p-3 text-right">{result.count_2 || 0}</td>
                    <td className="p-3">{result.street_3 || '-'}</td>
                    <td className="p-3 text-right">{result.count_3 || 0}</td>
                    <td className="p-3 text-right">{result.total_pois || 0}</td>
                    <td className="p-3 text-center">
                      {result.success ? (
                        <span className="text-green-500">OK</span>
                      ) : (
                        <span className="text-red-500" title={result.error}>Error</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreetSignal;
```

### Why Zustand Over TanStack Query?

| Aspect | Zustand | TanStack Query |
|--------|---------|----------------|
| **Use Case** | Client-side state, complex workflows | Server state caching |
| **Caching** | Manual | Automatic |
| **Best For** | Long-running jobs with UI state | Simple fetch/cache scenarios |
| **Complexity** | Lower for this use case | Higher (need useState + mutations) |

For Street Signal, Zustand is better because:
1. **Progressive updates**: Results accumulate over time
2. **Processing loop**: Recursive step processing with pause/resume
3. **Single job**: Only one job runs at a time (no cache invalidation needed)

---

## TanStack Query Alternative

If you prefer TanStack Query for consistency with other parts of the app:

### Hooks (`src/hooks/useStreetSignal.js`)

```javascript
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { streetSignalApi } from '@/services/streetSignal';

/**
 * Query key factory for Street Signal
 */
export const streetSignalKeys = {
  all: ['street-signal'],
  health: () => [...streetSignalKeys.all, 'health']
};

/**
 * Hook to check service health
 */
export const useStreetSignalHealth = (options = {}) => {
  return useQuery({
    queryKey: streetSignalKeys.health(),
    queryFn: streetSignalApi.health,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    ...options
  });
};

/**
 * Main hook for Street Signal job processing
 */
export const useStreetSignalJob = () => {
  const [jobState, setJobState] = useState({
    jobId: null,
    isProcessing: false,
    results: [],
    total: 0,
    processed: 0,
    error: null,
    completed: false
  });

  const startMutation = useMutation({ mutationFn: streetSignalApi.start });
  const stepMutation = useMutation({ mutationFn: streetSignalApi.step });
  const resetMutation = useMutation({ mutationFn: streetSignalApi.reset });

  const processNextStep = useCallback(async () => {
    try {
      const stepResult = await stepMutation.mutateAsync();

      setJobState(prev => ({
        ...prev,
        processed: stepResult.processed,
        total: stepResult.total,
        results: stepResult.result
          ? [...prev.results, stepResult.result]
          : prev.results,
        completed: stepResult.completed
      }));

      if (!stepResult.completed) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return processNextStep();
      }

      setJobState(prev => ({ ...prev, isProcessing: false }));
    } catch (error) {
      setJobState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message
      }));
    }
  }, [stepMutation]);

  const start = useCallback(async (params) => {
    setJobState({
      jobId: null,
      isProcessing: true,
      results: [],
      total: 0,
      processed: 0,
      error: null,
      completed: false
    });

    try {
      const startResult = await startMutation.mutateAsync(params);
      setJobState(prev => ({
        ...prev,
        jobId: startResult.job_id,
        total: startResult.total_districts
      }));
      return processNextStep();
    } catch (error) {
      setJobState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message
      }));
    }
  }, [startMutation, processNextStep]);

  const reset = useCallback(async () => {
    await resetMutation.mutateAsync();
    setJobState({
      jobId: null,
      isProcessing: false,
      results: [],
      total: 0,
      processed: 0,
      error: null,
      completed: false
    });
  }, [resetMutation]);

  const progress = jobState.total > 0
    ? Math.round((jobState.processed / jobState.total) * 100)
    : 0;

  return {
    ...jobState,
    progress,
    start,
    reset,
    downloadUrl: streetSignalApi.getDownloadUrl()
  };
};
```

---

## File Structure

```
src/
├── services/
│   └── streetSignal.js         # API client functions
├── store/
│   └── streetSignalStore.js    # Zustand store (recommended)
├── hooks/
│   └── useStreetSignal.js      # TanStack Query hooks (alternative)
├── components/
│   └── StreetSignal/
│       ├── StreetSignal.jsx    # Main component
│       ├── ResultsTable.jsx    # Results table component
│       ├── ControlsPanel.jsx   # Controls sidebar
│       └── index.js            # Barrel export
└── routes/
    └── street-signal.jsx       # Route page
```

---

## Usage Notes

1. **Rate Limiting**: The Flask backend queries OpenStreetMap APIs with rate limiting (0.5-1 req/sec). Processing is intentionally slow.

2. **Server-Side State**: Job state is maintained server-side. Only one job can run at a time per server instance.

3. **Polling vs WebSocket**: The current implementation uses polling (`/step` endpoint). For better UX, consider WebSocket for real-time updates.

4. **Error Handling**: Districts may fail individually (e.g., invalid postcode, API timeout). The job continues processing remaining districts.

5. **CSV Download**: Results can be downloaded as CSV after job completion via direct link.

## Environment Variables

Ensure the property-pub client is configured with the correct base URL:

```
VITE_PROPERTYPUB_BASEURL=https://localhost:8083
```

Or set via `window.propertyPubURL` at runtime.
