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
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h5 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-base">📅</span>
            Current Schedules ({schedules.length})
          </h5>
          <div className="text-sm font-semibold text-green-600">
            Total spent: £{summaryData?.data?.total_spent?.toFixed(2) || '0.00'}
          </div>
        </div>
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
              <span className="text-base">📅</span>
              Calendar View
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="rounded-l-none"
              aria-pressed={viewMode === 'card'}
              role="radio"
            >
              <span className="text-base">📊</span>
              Grid View
            </Button>
          </div>
        </div>
      </div>
      
      {summaryData?.data && (
        <div className="flex gap-2 mb-4">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {summaryData.data.active_count || 0} Active
          </span>
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {summaryData.data.upcoming_count || 0} Upcoming
          </span>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            {summaryData.data.waiting_for_approval_count || 0} Pending Approval
          </span>
        </div>
      )}
      
      {viewMode === 'card' ? (
        <ScheduleCardView schedules={schedules} />
      ) : (
        <ScheduleTableView schedules={schedules} propertyId={propertyId} />
      )}
    </div>
  );
};

export default CurrentSchedules;