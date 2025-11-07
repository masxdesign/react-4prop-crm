import React from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AdvertiserSelectionTable from '../AdvertiserSelectionTable/AdvertiserSelectionTable';
import AgencySelectionTable from '../AgencySelectionTable/AgencySelectionTable';

/**
 * StatsSelectionPage Component
 *
 * Admin-only page for selecting which advertiser or agency statistics to view.
 * Features two tabs with URL-synced state:
 * - Advertiser Statistics: Browse and select advertisers
 * - Agency Statistics: Browse and select agencies
 *
 * All state (tab, page, search, sorting) is synced with URL search parameters.
 */
const StatsSelectionPage = () => {
  const navigate = useNavigate({ from: '/crm/stats/select' });
  const search = useSearch({ from: '/_auth/_dashboard/stats/select' });

  // Handle tab change - update URL and reset pagination
  const handleTabChange = (newTab) => {
    navigate({
      search: {
        tab: newTab,
        page: 1, // Reset to first page on tab change
        limit: search.limit,
        search: '', // Reset search on tab change
        sortBy: newTab === 'agencies' ? 'name' : 'company', // Default sort for each tab
        order: 'asc',
      },
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
                <AdvertiserSelectionTable />
              </TabsContent>

              <TabsContent value="agencies" className="mt-6">
                <AgencySelectionTable />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsSelectionPage;
