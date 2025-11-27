import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '@/components/Auth/Auth-context';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsExpandProvider } from '../context/StatsExpandContext';
import DateRangePicker from '../DateRangePicker/DateRangePicker';
import DailySummaryTable from '../DailySummaryTable/DailySummaryTable';
import AgencyBreakdownTable from '../AgencyBreakdownTable/AgencyBreakdownTable';
import { fetchAdvertiserStats } from '../api';

/**
 * AdvertiserStatsPage Component
 *
 * Main page component for advertiser statistics.
 * Displays daily summary and agency breakdown with lazy-loaded property details.
 *
 * Route: /stats/advertiser/:advertiserId
 */
const AdvertiserStatsPage = () => {
  const auth = useAuth();
  const { advertiserId } = useParams({ from: '/_auth/_dashboard/stats/advertiser/$advertiserId' });
  const search = useSearch({ from: '/_auth/_dashboard/stats/advertiser/$advertiserId' });
  const navigate = useNavigate({ from: '/stats/advertiser/$advertiserId' });

  // Get query options from route context
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['advertiser-stats', advertiserId, search.startDate, search.endDate],
    queryFn: () => fetchAdvertiserStats(advertiserId, search.startDate, search.endDate),
    enabled: !!advertiserId,
  });

  // Date range state for picker
  const [dateRange, setDateRange] = useState({
    from: new Date(search.startDate),
    to: new Date(search.endDate),
  });

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange({
      from: new Date(newRange.from),
      to: new Date(newRange.to),
    });

    // Update URL search params
    navigate({
      search: {
        startDate: newRange.from,
        endDate: newRange.to,
      },
      replace: true,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading advertiser statistics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-red-500 mb-4 text-center">
          <h3 className="text-lg font-semibold mb-2">Error loading statistics</h3>
          <p className="text-sm">{error.message || 'An unexpected error occurred'}</p>
        </div>
        <Button onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <StatsExpandProvider>
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advertiser Statistics</h1>
              {auth.user?.is_admin && (
                <p className="text-gray-600 mt-1">
                  {data.advertiser_name} • {data.totalProperties} Properties
                </p>
              )}
            </div>
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              className="w-80"
              maxDate={new Date()}
            />
          </div>

          {/* Daily Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <DailySummaryTable
                dailySummary={data.dailySummary}
              />
            </CardContent>
          </Card>

          {/* Agency Breakdown Section */}
          <Card>
            <CardHeader>
              <CardTitle>Agency Breakdown</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Click on an agency row to view properties
              </p>
            </CardHeader>
            <CardContent>
              <AgencyBreakdownTable
                agencyBreakdown={data.agencyBreakdown}
                advertiserId={advertiserId}
                startDate={search.startDate}
                endDate={search.endDate}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </StatsExpandProvider>
  );
};

export default AdvertiserStatsPage;
