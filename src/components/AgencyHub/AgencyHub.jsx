import React from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AgentSelectionTable from '@/components/Magazine/AgentSelectionTable/AgentSelectionTable';
import AgencySelectionTable from '@/components/AgencySelectionTable';

// Default values for search params
const DEFAULTS = {
  tab: 'agents',
  page: 1,
  limit: 20,
  search: '',
  sortBy: {
    agents: 'surname',
    bookings: 'name',
    stats: 'name',
  },
  order: 'asc',
};

/**
 * Remove default values from search params to keep URLs clean
 */
export const cleanSearchParams = (params, tab) => {
  const cleaned = {};

  // Only add tab if it's not the default
  if (params.tab && params.tab !== DEFAULTS.tab) {
    cleaned.tab = params.tab;
  }

  // Only add page if it's not the default
  if (params.page && params.page !== DEFAULTS.page) {
    cleaned.page = params.page;
  }

  // Only add limit if it's not the default
  if (params.limit && params.limit !== DEFAULTS.limit) {
    cleaned.limit = params.limit;
  }

  // Only add search if it's not empty
  if (params.search && params.search !== DEFAULTS.search) {
    cleaned.search = params.search;
  }

  // Only add sortBy if it's not the default for the current tab
  const defaultSortBy = DEFAULTS.sortBy[tab || params.tab || DEFAULTS.tab];
  if (params.sortBy && params.sortBy !== defaultSortBy) {
    cleaned.sortBy = params.sortBy;
  }

  // Only add order if it's not the default
  if (params.order && params.order !== DEFAULTS.order) {
    cleaned.order = params.order;
  }

  return cleaned;
};

// Export DEFAULTS for use in child components
export { DEFAULTS };

/**
 * AgencyHub Component
 *
 * Admin hub page for all agency-related functionality.
 * Features three tabs with URL-synced state:
 * - Agent Properties: Search and view agent properties
 * - Booking History: Browse and select agencies to view bookings
 * - Statistics: Browse and select agencies to view stats
 *
 * All state (tab, page, search, sorting) is synced with URL search parameters.
 */
const AgencyHub = () => {
  const navigate = useNavigate({ from: '/agency' });
  const urlSearch = useSearch({ from: '/_auth/_dashboard/agency/' });

  // Apply defaults to URL search params
  const search = {
    tab: urlSearch.tab || DEFAULTS.tab,
    page: urlSearch.page || DEFAULTS.page,
    limit: urlSearch.limit || DEFAULTS.limit,
    search: urlSearch.search || DEFAULTS.search,
    sortBy: urlSearch.sortBy || DEFAULTS.sortBy[urlSearch.tab || DEFAULTS.tab],
    order: urlSearch.order || DEFAULTS.order,
  };

  // Handle tab change - update URL and reset pagination
  const handleTabChange = (newTab) => {
    const params = cleanSearchParams({
      tab: newTab,
      page: 1, // Reset to first page on tab change
      limit: search.limit,
      search: '', // Reset search on tab change
      sortBy: DEFAULTS.sortBy[newTab], // Default sort for each tab
      order: 'asc',
    }, newTab);

    navigate({
      search: params,
      replace: true,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agency</h1>
          <p className="text-gray-600 mt-1">View agent properties, booking history, and agency statistics</p>
        </div>

        {/* Tabs */}
        <Tabs value={search.tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="agents">Agent Properties</TabsTrigger>
            <TabsTrigger value="bookings">Booking History</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="mt-6">
            <AgentSelectionTable
              basePath="/agency"
              cleanSearchParams={cleanSearchParams}
              DEFAULTS={DEFAULTS}
              navigationPrefix="/agency/agent"
              embedded
            />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <AgencySelectionTable
              variant="booking-history"
              basePath="/agency"
              cleanSearchParams={cleanSearchParams}
              DEFAULTS={DEFAULTS}
              navigationPrefix="/agency"
            />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <AgencySelectionTable
              variant="stats"
              basePath="/agency"
              cleanSearchParams={cleanSearchParams}
              DEFAULTS={DEFAULTS}
              navigationPrefix="/agency"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgencyHub;
