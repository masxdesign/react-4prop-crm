import React from 'react';
import { format, parseISO } from 'date-fns';

// Schedule Card Component - Updated for week-based system
const ScheduleCard = ({ schedule, onViewDetails, onCancel }) => {
  // Use status from API if available, otherwise calculate
  const getScheduleStatus = (schedule) => {
    if (schedule.status) {
      return schedule.status.toLowerCase();
    }
    
    // Fallback calculation for legacy data
    const today = new Date();
    const startDate = parseISO(schedule.start_date);
    const endDate = parseISO(schedule.end_date);

    if (today > endDate) return 'expired';
    if (today < startDate) return 'upcoming';
    return 'active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const status = getScheduleStatus(schedule);

  // Calculate display values based on available data
  let duration, rate, totalRevenue;
  
  if (schedule.week_no && schedule.fixed_week_rate) {
    // Week-based data
    duration = `${schedule.week_no} week${schedule.week_no !== 1 ? 's' : ''}`;
    rate = `£${schedule.fixed_week_rate}/week`;
    totalRevenue = schedule.total_cost || (schedule.fixed_week_rate * schedule.week_no);
  } else {
    // Legacy day-based data
    const days = Math.ceil((parseISO(schedule.end_date) - parseISO(schedule.start_date)) / (1000 * 60 * 60 * 24));
    duration = `${days} days`;
    rate = `£${schedule.fixed_day_rate}/day`;
    totalRevenue = schedule.fixed_day_rate * days;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Property #{schedule.property_id}</h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">
            {rate}
          </div>
        </div>
      </div>

      {/* Schedule Details */}
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-500">Schedule Period:</span>
          <div className="text-sm">
            {format(parseISO(schedule.start_date), 'MMM dd, yyyy')} - {format(parseISO(schedule.end_date), 'MMM dd, yyyy')}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-500">Duration:</span>
          <div className="text-sm">{duration}</div>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-500">Property Subtypes:</span>
          <div className="text-sm">
            {schedule.property_subtypes?.replace(/^,|,$/g, '').split(',').filter(id => id.trim()).join(', ') || 'N/A'}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-500">Dealing Agents:</span>
          <div className="text-sm">
            {schedule.dealing_agents?.replace(/^,|,$/g, '').split(',').filter(id => id.trim()).join(', ') || 'N/A'}
          </div>
        </div>

        {/* Revenue Calculation */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Rate:</span>
            <span>{rate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Duration:</span>
            <span>{duration}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-500">Total Cost:</span>
            <span className="text-green-600">£{totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          <button 
            onClick={() => onViewDetails(schedule)}
            className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View Details
          </button>
          {status === 'upcoming' && (
            <button 
              onClick={() => onCancel(schedule)}
              className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;