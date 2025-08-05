import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { LayoutGrid, Table2 } from 'lucide-react';
import { fetchPropertySchedules } from '../api';
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

  const schedules = schedulesData?.data || [];

  // Calculate total revenue for this property using week-based system
  const totalRevenue = schedules.reduce((total, schedule) => {
    // Use total_revenue from API if available, otherwise calculate from week-based data
    if (schedule.total_revenue) {
      return total + schedule.total_revenue;
    }
    // Fallback calculation for older data
    if (schedule.fixed_week_rate && schedule.week_no) {
      return total + (schedule.fixed_week_rate * schedule.week_no);
    }
    // Legacy day-based calculation for old data
    if (schedule.end_date && schedule.start_date && 
        typeof schedule.end_date === 'string' && typeof schedule.start_date === 'string') {
      const days = Math.ceil((parseISO(schedule.end_date) - parseISO(schedule.start_date)) / (1000 * 60 * 60 * 24));
      return total + (schedule.fixed_day_rate * days);
    }
    return total;
  }, 0);

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
        <h5 className="font-medium text-gray-900">Current Schedules ({schedules.length})</h5>
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
            Total spent: £{totalRevenue.toFixed(2)}
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