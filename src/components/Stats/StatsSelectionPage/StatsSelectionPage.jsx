import React from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AdvertiserSelectionTable from '@/components/AdvertiserSelectionTable';
import AgencySelectionTable from '@/components/AgencySelectionTable';

// Default values for search params
const DEFAULTS = {
  tab: 'advertisers',
  page: 1,
  limit: 20,
  search: '',
  sortBy: {
    advertisers: 'company',
    agencies: 'name',
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
 * StatsSelectionPage Component
 *
 * Admin-only page for selecting which advertiser or agency statistics to view.
 * Features two tabs with URL-synced state:
 * - Advertiser Statistics: Browse and select advertisers
 * - Agency Statistics: Browse and select agencies
 *
 * All state (tab, page, search, sorting) is synced with URL search parameters.
 * Only non-default values are included in the URL to keep it clean.
 */
const StatsSelectionPage = () => {
  const navigate = useNavigate({ from: '/crm/stats/select' });
  const urlSearch = useSearch({ from: '/_auth/_dashboard/stats/select' });

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
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-600 mt-1">Select an advertiser or agency to view their statistics</p>
        </div>

        {/* Selection Card with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Select Statistics to View</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={search.tab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="advertisers">Advertiser Statistics</TabsTrigger>
                <TabsTrigger value="agencies">Agency Statistics</TabsTrigger>
              </TabsList>

              <TabsContent value="advertisers" className="mt-6">
                <AdvertiserSelectionTable
                  variant="stats"
                  basePath="/crm/stats/select"
                  cleanSearchParams={cleanSearchParams}
                  DEFAULTS={DEFAULTS}
                />
              </TabsContent>

              <TabsContent value="agencies" className="mt-6">
                <AgencySelectionTable
                  variant="stats"
                  basePath="/crm/stats/select"
                  cleanSearchParams={cleanSearchParams}
                  DEFAULTS={DEFAULTS}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsSelectionPage;
