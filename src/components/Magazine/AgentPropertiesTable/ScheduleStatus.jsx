import React from 'react';
import { isAfter, parseISO } from 'date-fns';

// Schedule Status Component
const ScheduleStatus = ({ schedule }) => {
  const getScheduleStatus = (schedule) => {
    // If schedule already has status from API, use it
    if (schedule.status) {
      return schedule.status.toLowerCase();
    }

    // Fallback calculation for older data
    if (schedule.start_date && schedule.end_date && 
        typeof schedule.start_date === 'string' && typeof schedule.end_date === 'string') {
      const today = new Date();
      const startDate = parseISO(schedule.start_date);
      const endDate = parseISO(schedule.end_date);

      if (isAfter(today, endDate)) return 'expired';
      if (isAfter(startDate, today)) return 'upcoming';
      return 'active';
    }
    
    // Default status if dates are not available
    return 'unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'unknown':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const status = getScheduleStatus(schedule);
  
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default ScheduleStatus;