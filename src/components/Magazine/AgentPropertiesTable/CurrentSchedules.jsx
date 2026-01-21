import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Grid2X2Icon, Table2Icon, CalendarPlus, Sparkles } from 'lucide-react';
import { fetchPropertySchedules, fetchPropertySchedulesSummary } from '../api';
import { Button } from '@/components/ui/button';
import ScheduleCardView from './ScheduleCardView';
import ScheduleTableView from './ScheduleTableView';

// Current Schedules Component - Updated for week-based system
const CurrentSchedules = ({ propertyId, isAdminViewing, viewingAgentNid, onScheduleNewAdvertiser }) => {
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
      <div className="flex flex-col items-center justify-center py-12 px-6 bg-gradient-to-b from-slate-50 to-white rounded-lg border border-dashed border-gray-300">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CalendarPlus className="w-8 h-8 text-green-600" strokeWidth={1.5} />
        </div>
        <h5 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h5>
        <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
          Get your property noticed by scheduling your first advertiser booking.
          Reach more potential buyers and tenants today.
        </p>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onScheduleNewAdvertiser?.();
          }}
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Schedule New Advertiser
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col gap-1">
          <h5 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className='size-5 shrink-0' strokeWidth={1} />
            Current Schedules ({schedules.length})
          </h5>
          <div className="text-sm text-muted-foreground">
            Total spent: £{summaryData?.data?.total_spent?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="flex items-center gap-8">
          {summaryData?.data && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>
                  {summaryData.data.active_count || 0} Active
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>
                  {summaryData.data.upcoming_count || 0} Upcoming
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>
                  {summaryData.data.waiting_for_approval_count || 0} Pending
                  Approval
                </span>
              </div>
            </div>
          )}
          <div className="flex rounded-md border" role="radiogroup" aria-label="View options">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-r-none border-r-0 flex items-center gap-1 text-xs"
              aria-pressed={viewMode === 'table'}
              role="radio"
            >
              <Table2Icon className='size-4 shrink-0' strokeWidth={1} />
              Table
            </Button>
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="rounded-l-none flex items-center gap-1 text-xs"
              aria-pressed={viewMode === 'card'}
              role="radio"
            >
              <Grid2X2Icon className='size-4 shrink-0' strokeWidth={1} />
              Grid
            </Button>
          </div>
        </div>
      </div>
      
      {viewMode === 'card' ? (
        <ScheduleCardView
          schedules={schedules}
          isAdminViewing={isAdminViewing}
          viewingAgentNid={viewingAgentNid}
        />
      ) : (
        <ScheduleTableView
          schedules={schedules}
          propertyId={propertyId}
          isAdminViewing={isAdminViewing}
          viewingAgentNid={viewingAgentNid}
        />
      )}
    </div>
  );
};

export default CurrentSchedules;