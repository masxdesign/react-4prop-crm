import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '@/components/Auth/Auth-context';
import { subDays, format } from 'date-fns';
import { Loader2, Building2, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsExpandProvider } from '../context/StatsExpandContext';
import DateRangePicker from '../DateRangePicker/DateRangePicker';
import DailySummaryTable from '../DailySummaryTable/DailySummaryTable';
import AdvertiserBreakdownTable from '../AdvertiserBreakdownTable/AdvertiserBreakdownTable';
import { fetchAgencyStats } from '../statsPageApi';

/**
 * AgencyStatsPage Component
 *
 * Main page component for agency statistics.
 * Displays number of advertisers, daily summary, and advertiser breakdown with lazy-loaded property details.
 *
 * Route: /agency/:id/stats
 *
 * Props passed from route file:
 * - search: URL search params (startDate, endDate)
 * - agencyId: The agency ID from route params
 */
const AgencyStatsPage = ({ search: propSearch, agencyId: propAgencyId }) => {
  const auth = useAuth();
  // Use prop if provided, otherwise fall back to useParams for backwards compatibility
  const params = useParams({ strict: false });
  const agencyId = propAgencyId || params.id || params.agencyId;
  const navigate = useNavigate();

  // Use prop search if provided, otherwise use useSearch as fallback
  const routeSearch = useSearch({ strict: false });
  const search = propSearch || routeSearch || {};

  // Default date values
  const startDate = search.startDate || format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const endDate = search.endDate || format(new Date(), 'yyyy-MM-dd');

  // Get query options from route context
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['agency-stats', agencyId, startDate, endDate],
    queryFn: () => fetchAgencyStats(agencyId, startDate, endDate),
    enabled: !!agencyId,
  });

  // Date range state for picker
  const [dateRange, setDateRange] = useState({
    from: new Date(startDate),
    to: new Date(endDate),
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
          <p className="text-gray-600">Loading agency statistics...</p>
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
      <div className="flex flex-col gap-6 p-6 w-full mx-auto min-w-0">
        {/* Header */}
        <div className="flex flex-col gap-2">
          {auth.user?.is_admin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({
                to: '/agency',
                search: {
                  tab: 'agencies',
                  ...(search.returnPage ? { page: search.returnPage } : {}),
                  ...(search.returnSearch ? { search: search.returnSearch } : {})
                }
              })}
              className="self-start -ml-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Agencies
            </Button>
          )}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900">Agency Statistics</h1>
              {auth.user?.is_admin && data.agency_name && (
                <p className="text-sm text-gray-600 mt-1">{data.agency_name}</p>
              )}
            </div>
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              className="w-80"
              maxDate={new Date()}
            />
          </div>
        </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Number of Advertisers</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.numberOfAdvertisers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active advertisers in this period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Date Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {format(new Date(data.dateRange.start), 'MMM dd, yyyy')} -{' '}
                  {format(new Date(data.dateRange.end), 'MMM dd, yyyy')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Selected reporting period</p>
              </CardContent>
            </Card>
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

          {/* Advertiser Breakdown Section */}
          <Card>
            <CardHeader>
              <CardTitle>Advertiser Breakdown</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Click on an advertiser row to view properties
              </p>
            </CardHeader>
            <CardContent>
              <AdvertiserBreakdownTable
                advertiserBreakdown={data.advertiserBreakdown}
                agencyId={agencyId}
                startDate={startDate}
                endDate={endDate}
              />
            </CardContent>
          </Card>
      </div>
    </StatsExpandProvider>
  );
};

export default AgencyStatsPage;
