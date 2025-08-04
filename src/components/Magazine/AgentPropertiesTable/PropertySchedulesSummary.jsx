import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { isAfter, isBefore, parseISO } from 'date-fns';
import { fetchPropertySchedules } from '../api';

// Property Schedules Summary Component (for table row) - Updated for week-based system
const PropertySchedulesSummary = ({ propertyId }) => {
  const {
    data: schedulesData,
    isLoading
  } = useQuery({
    queryKey: ['property-schedules', propertyId],
    queryFn: () => fetchPropertySchedules(propertyId),
    enabled: !!propertyId,
  });

  if (isLoading) {
    return <div className="text-xs text-gray-500">Loading...</div>;
  }

  const schedules = schedulesData?.data || [];
  
  if (schedules.length === 0) {
    return <div className="text-xs text-gray-500">No schedules</div>;
  }

  // Calculate total revenue using week-based system with fallback for legacy data
  const totalRevenue = schedules.reduce((total, schedule) => {
    // Use total_revenue from API if available (new week-based data)
    if (schedule.total_revenue) {
      return total + schedule.total_revenue;
    }
    // Calculate from week-based data
    if (schedule.fixed_week_rate && schedule.week_no) {
      return total + (schedule.fixed_week_rate * schedule.week_no);
    }
    // Fallback for legacy day-based data
    if (schedule.end_date && schedule.start_date && schedule.fixed_day_rate && 
        typeof schedule.end_date === 'string' && typeof schedule.start_date === 'string') {
      const days = Math.ceil((parseISO(schedule.end_date) - parseISO(schedule.start_date)) / (1000 * 60 * 60 * 24));
      return total + (schedule.fixed_day_rate * days);
    }
    return total;
  }, 0);

  // Count active schedules
  const activeSchedules = schedules.filter(schedule => {
    // Use status from API if available
    if (schedule.status) {
      return schedule.status === 'Active';
    }
    // Fallback calculation for legacy data
    if (schedule.start_date && schedule.end_date && 
        typeof schedule.start_date === 'string' && typeof schedule.end_date === 'string') {
      const today = new Date();
      const startDate = parseISO(schedule.start_date);
      const endDate = parseISO(schedule.end_date);
      return !isAfter(today, endDate) && !isBefore(today, startDate);
    }
    return false;
  }).length;

  return (
    <div className="text-xs">
      <div className="font-medium">{schedules.length} total</div>
      <div className="text-green-600">{activeSchedules} active</div>
      <div className="text-green-600 font-semibold">£{totalRevenue.toFixed(0)}</div>
    </div>
  );
};

export default PropertySchedulesSummary;