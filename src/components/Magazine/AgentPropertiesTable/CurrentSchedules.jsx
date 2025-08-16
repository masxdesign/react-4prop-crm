import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { LayoutGrid, Table2 } from 'lucide-react';
import { fetchPropertySchedules, fetchPropertySchedulesSummary } from '../api';
import { Button } from '@/components/ui/button';
import ScheduleCardView from './ScheduleCardView';
import ScheduleTableView from './ScheduleTableView';

// Current Schedules Component - Updated for week-based system
const CurrentSchedules = ({ propertyId }) => {
  const [viewMode, setViewMode] = useState('table');
  const {
    data: schedulesData,
    isLoading: schedulesLoading,
    error: schedulesError
  } = useQuery({
    queryKey: ['property-schedules', propertyId],
    queryFn: () => fetchPropertySchedules(propertyId),
    enabled: !!propertyId,
    refetchOnMount: false,
  });

  // Fetch summary data for enhanced metrics
  const {
    data: summaryData
  } = useQuery({
    queryKey: ['property-schedules-summary', propertyId],
    queryFn: () => fetchPropertySchedulesSummary(propertyId),
    enabled: !!propertyId,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const schedules = schedulesData?.data || [];

  if (schedulesLoading) {
    return (
      <div className="text-sm text-gray-500">Loading current schedules...</div>
    );
  }

  if (schedulesError) {
    return (
      <div className="text-sm text-red-500">Error loading schedules</div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded border">
        No schedules booked for this property yet.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h5 className="font-medium text-gray-900">
          Current Schedules ({schedules.length})
          {summaryData?.data && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              • {summaryData.data.active_count || 0} Active
              • {summaryData.data.upcoming_count || 0} Upcoming
              • {summaryData.data.waiting_for_approval_count || 0} Pending Approval
            </span>
          )}
        </h5>
        <div className="flex items-center gap-3">
          <div className="flex rounded-md border" role="radiogroup" aria-label="View options">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-r-none border-r-0"
              aria-pressed={viewMode === 'table'}
              role="radio"
            >
              <Table2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="rounded-l-none"
              aria-pressed={viewMode === 'card'}
              role="radio"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm font-semibold text-green-600">
            Total spent: £{summaryData?.data?.total_spent.toFixed(2)}
            {summaryData?.data?.current_revenue && (
              <span className="text-xs text-gray-500 ml-1">
                (£{summaryData.data.current_revenue.toFixed(2)} active)
              </span>
            )}
          </div>
        </div>
      </div>
      
      {viewMode === 'card' ? (
        <ScheduleCardView schedules={schedules} />
      ) : (
        <ScheduleTableView schedules={schedules} />
      )}
    </div>
  );
};

export default CurrentSchedules;