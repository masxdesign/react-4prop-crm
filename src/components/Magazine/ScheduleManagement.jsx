import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import bizchatClient from '@/services/bizchatClient';

// API function to fetch advertiser's scheduled properties
const fetchAdvertiserProperties = async (advertiserId) => {
  const response = await bizchatClient.get(`/api/crm/mag/advertiser/${advertiserId}`);
  return response.data;
};

// Schedule Management Component for Advertisers
export const ScheduleManagement = ({ advertiserId }) => {
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

  // Filter schedules based on status
  const filteredSchedules = schedules.filter(schedule => {
    const today = new Date();
    const startDate = parseISO(schedule.start_date);
    const endDate = parseISO(schedule.end_date);

    switch (filter) {
      case 'active':
        return !isAfter(today, endDate) && !isBefore(today, startDate);
      case 'upcoming':
        return isAfter(startDate, today);
      case 'expired':
        return isAfter(today, endDate);
      default:
        return true;
    }
  });

  const getScheduleStatus = (schedule) => {
    const today = new Date();
    const startDate = parseISO(schedule.start_date);
    const endDate = parseISO(schedule.end_date);

    if (isAfter(today, endDate)) return 'expired';
    if (isAfter(startDate, today)) return 'upcoming';
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
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            filter === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({schedules.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            filter === 'active' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Active ({schedules.filter(s => getScheduleStatus(s) === 'active').length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            filter === 'upcoming' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Upcoming ({schedules.filter(s => getScheduleStatus(s) === 'upcoming').length})
        </button>
        <button
          onClick={() => setFilter('expired')}
          className={`px-4 py-2 rounded text-sm font-medium ${
            filter === 'expired' 
              ? 'bg-gray-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Expired ({schedules.filter(s => getScheduleStatus(s) === 'expired').length})
        </button>
      </div>

      {/* Schedules Grid */}
      {filteredSchedules.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No scheduled properties found.' 
              : `No ${filter} schedules found.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.map((schedule) => {
            const status = getScheduleStatus(schedule);
            return (
              <div key={schedule.schedule_id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
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
                      ${schedule.fixed_day_rate}/day
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

                  {/* Duration & Revenue Calculation */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span>
                        {Math.ceil((parseISO(schedule.end_date) - parseISO(schedule.start_date)) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-500">Total Revenue:</span>
                      <span className="text-green-600">
                        ${(schedule.fixed_day_rate * Math.ceil((parseISO(schedule.end_date) - parseISO(schedule.start_date)) / (1000 * 60 * 60 * 24))).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                      View Details
                    </button>
                    {status === 'upcoming' && (
                      <button className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Summary Component for Dashboard
export const ScheduleSummary = ({ advertiserId }) => {
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['advertiser-properties', advertiserId],
    queryFn: () => fetchAdvertiserProperties(advertiserId),
    enabled: !!advertiserId,
  });

  if (isLoading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="text-sm text-red-500">Error loading data</div>;

  const schedules = data?.data || [];
  const today = new Date();

  const stats = schedules.reduce((acc, schedule) => {
    const startDate = parseISO(schedule.start_date);
    const endDate = parseISO(schedule.end_date);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const revenue = schedule.fixed_day_rate * days;

    if (isAfter(today, endDate)) {
      acc.expired.count++;
      acc.expired.revenue += revenue;
    } else if (isAfter(startDate, today)) {
      acc.upcoming.count++;
      acc.upcoming.revenue += revenue;
    } else {
      acc.active.count++;
      acc.active.revenue += revenue;
    }

    acc.total.count++;
    acc.total.revenue += revenue;

    return acc;
  }, {
    total: { count: 0, revenue: 0 },
    active: { count: 0, revenue: 0 },
    upcoming: { count: 0, revenue: 0 },
    expired: { count: 0, revenue: 0 }
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-2xl font-bold text-gray-900">{stats.total.count}</div>
        <div className="text-sm text-gray-500">Total Schedules</div>
        <div className="text-sm font-medium text-green-600">${stats.total.revenue.toFixed(2)}</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-2xl font-bold text-green-600">{stats.active.count}</div>
        <div className="text-sm text-gray-500">Active</div>
        <div className="text-sm font-medium text-green-600">${stats.active.revenue.toFixed(2)}</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-2xl font-bold text-blue-600">{stats.upcoming.count}</div>
        <div className="text-sm text-gray-500">Upcoming</div>
        <div className="text-sm font-medium text-green-600">${stats.upcoming.revenue.toFixed(2)}</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-2xl font-bold text-gray-600">{stats.expired.count}</div>
        <div className="text-sm text-gray-500">Expired</div>
        <div className="text-sm font-medium text-gray-600">${stats.expired.revenue.toFixed(2)}</div>
      </div>
    </div>
  );
};