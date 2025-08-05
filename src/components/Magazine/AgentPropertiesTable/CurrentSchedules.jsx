import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { fetchPropertySchedules } from '../api';
import ScheduleItem from './ScheduleItem';

// Current Schedules Component - Updated for week-based system
const CurrentSchedules = ({ propertyId }) => {
  const {
    data: schedulesData,
    isLoading: schedulesLoading,
    error: schedulesError
  } = useQuery({
    queryKey: ['property-schedules', propertyId],
    queryFn: () => fetchPropertySchedules(propertyId),
    enabled: !!propertyId,
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
        <div className="text-sm font-semibold text-green-600">
          Total spent: £{totalRevenue.toFixed(2)}
        </div>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {schedules.map((schedule) => (
          <ScheduleItem key={schedule.id} schedule={schedule} />
        ))}
      </div>
    </div>
  );
};

export default CurrentSchedules;