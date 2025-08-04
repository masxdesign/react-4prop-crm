import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isAfter, isBefore, parseISO } from 'date-fns';
import bizchatClient from '@/services/bizchatClient';
import ScheduleCard from './ScheduleCard';
import ScheduleFilterButtons from './ScheduleFilterButtons';

// API function to fetch advertiser's scheduled properties
const fetchAdvertiserProperties = async (advertiserId) => {
  const response = await bizchatClient.get(`/api/crm/mag/advertiser/${advertiserId}`);
  return response.data;
};

// Schedule Management Component for Advertisers - Updated for week-based system
const ScheduleManagement = ({ advertiserId }) => {
  const [filter, setFilter] = useState('all'); // all, active, upcoming, expired

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['advertiser-properties', advertiserId],
    queryFn: () => fetchAdvertiserProperties(advertiserId),
    enabled: !!advertiserId,
  });

  const schedules = data?.data || [];

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

  // Filter schedules based on status
  const filteredSchedules = schedules.filter(schedule => {
    if (filter === 'all') return true;
    return getScheduleStatus(schedule) === filter;
  });

  // Action handlers
  const handleViewDetails = (schedule) => {
    console.log('View details for schedule:', schedule);
    // Implement view details logic
  };

  const handleCancelSchedule = (schedule) => {
    if (window.confirm(`Are you sure you want to cancel the schedule for Property #${schedule.property_id}?`)) {
      console.log('Cancel schedule:', schedule);
      // Implement cancel schedule logic
      // This would typically make an API call to cancel the schedule
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading scheduled properties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 mb-4">Error loading scheduled properties</div>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Scheduled Properties</h2>
          <p className="text-gray-600">
            {data?.data?.[0]?.advertiser_company || 'Advertiser'} | 
            Total Schedules: {schedules.length}
          </p>
        </div>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Filter Buttons */}
      <ScheduleFilterButtons 
        schedules={schedules}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Schedules Grid */}
      {filteredSchedules.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' 
              ? 'No scheduled properties found' 
              : `No ${filter} schedules found`
            }
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Your scheduled properties will appear here once you book advertising slots.' 
              : `You currently have no ${filter} schedules.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.map((schedule) => (
            <ScheduleCard
              key={schedule.schedule_id}
              schedule={schedule}
              onViewDetails={handleViewDetails}
              onCancel={handleCancelSchedule}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;