import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { isAfter, parseISO } from 'date-fns';
import bizchatClient from '@/services/bizchatClient';

// API function to fetch advertiser's scheduled properties
const fetchAdvertiserProperties = async (advertiserId) => {
  const response = await bizchatClient.get(`/api/crm/mag/advertiser/${advertiserId}`);
  return response.data;
};

// Summary Component for Dashboard - Updated for week-based system
const ScheduleSummary = ({ advertiserId }) => {
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

  const stats = schedules.reduce((acc, schedule) => {
    // Use total_cost from API if available (new week-based data), otherwise calculate
    let revenue;
    if (schedule.total_cost) {
      revenue = schedule.total_cost;
    } else if (schedule.fixed_week_rate && schedule.week_no) {
      revenue = schedule.fixed_week_rate * schedule.week_no;
    } else {
      // Fallback for legacy day-based data
      const days = Math.ceil((parseISO(schedule.end_date) - parseISO(schedule.start_date)) / (1000 * 60 * 60 * 24));
      revenue = schedule.fixed_day_rate * days;
    }

    // Use status from API if available, otherwise calculate
    let status;
    if (schedule.status) {
      status = schedule.status.toLowerCase();
    } else {
      const today = new Date();
      const startDate = parseISO(schedule.start_date);
      const endDate = parseISO(schedule.end_date);
      
      if (isAfter(today, endDate)) {
        status = 'expired';
      } else if (isAfter(startDate, today)) {
        status = 'upcoming';
      } else {
        status = 'active';
      }
    }

    // Update stats based on status
    switch (status) {
      case 'expired':
        acc.expired.count++;
        acc.expired.revenue += revenue;
        break;
      case 'upcoming':
        acc.upcoming.count++;
        acc.upcoming.revenue += revenue;
        break;
      case 'active':
        acc.active.count++;
        acc.active.revenue += revenue;
        break;
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
        <div className="text-sm font-medium text-green-600">£{stats.total.revenue.toFixed(2)}</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-2xl font-bold text-green-600">{stats.active.count}</div>
        <div className="text-sm text-gray-500">Active</div>
        <div className="text-sm font-medium text-green-600">£{stats.active.revenue.toFixed(2)}</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-2xl font-bold text-blue-600">{stats.upcoming.count}</div>
        <div className="text-sm text-gray-500">Upcoming</div>
        <div className="text-sm font-medium text-green-600">£{stats.upcoming.revenue.toFixed(2)}</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-2xl font-bold text-gray-600">{stats.expired.count}</div>
        <div className="text-sm text-gray-500">Expired</div>
        <div className="text-sm font-medium text-gray-600">£{stats.expired.revenue.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default ScheduleSummary;