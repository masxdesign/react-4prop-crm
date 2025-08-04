import React from 'react';
import { isAfter, parseISO } from 'date-fns';

// Schedule Filter Buttons Component
const ScheduleFilterButtons = ({ schedules, filter, onFilterChange }) => {
  // Helper function to get schedule status
  const getScheduleStatus = (schedule) => {
    if (schedule.status) {
      return schedule.status.toLowerCase();
    }
    
    // Fallback calculation for legacy data
    const today = new Date();
    const startDate = parseISO(schedule.start_date);
    const endDate = parseISO(schedule.end_date);

    if (isAfter(today, endDate)) return 'expired';
    if (isAfter(startDate, today)) return 'upcoming';
    return 'active';
  };

  // Count schedules by status
  const counts = schedules.reduce((acc, schedule) => {
    const status = getScheduleStatus(schedule);
    acc[status] = (acc[status] || 0) + 1;
    acc.total++;
    return acc;
  }, { total: 0, active: 0, upcoming: 0, expired: 0 });

  const filterButtons = [
    {
      id: 'all',
      label: `All (${counts.total})`,
      color: 'bg-blue-500',
      hoverColor: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    },
    {
      id: 'active',
      label: `Active (${counts.active})`,
      color: 'bg-green-500',
      hoverColor: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    },
    {
      id: 'upcoming',
      label: `Upcoming (${counts.upcoming})`,
      color: 'bg-blue-500',
      hoverColor: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    },
    {
      id: 'expired',
      label: `Expired (${counts.expired})`,
      color: 'bg-gray-500',
      hoverColor: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {filterButtons.map((button) => (
        <button
          key={button.id}
          onClick={() => onFilterChange(button.id)}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            filter === button.id
              ? `${button.color} text-white`
              : button.hoverColor
          }`}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default ScheduleFilterButtons;