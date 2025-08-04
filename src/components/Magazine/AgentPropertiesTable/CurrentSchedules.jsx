import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import bizchatClient from '@/services/bizchatClient';
import ScheduleStatus from './ScheduleStatus';

// API function
const fetchPropertySchedules = async (propertyId) => {
  const response = await bizchatClient.get(`/api/crm/mag/property/${propertyId}/schedules`);
  return response.data;
};

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
    const days = Math.ceil((parseISO(schedule.end_date) - parseISO(schedule.start_date)) / (1000 * 60 * 60 * 24));
    return total + (schedule.fixed_day_rate * days);
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
          Total Revenue: £{totalRevenue.toFixed(2)}
        </div>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {schedules.map((schedule) => {
          // Calculate display values based on available data
          let duration, rate, totalPrice;
          
          if (schedule.week_no && schedule.fixed_week_rate) {
            // Week-based data
            duration = `${schedule.week_no} week${schedule.week_no !== 1 ? 's' : ''}`;
            rate = `£${schedule.fixed_week_rate}/week`;
            totalPrice = schedule.total_revenue || (schedule.fixed_week_rate * schedule.week_no);
          } else {
            // Legacy day-based data
            const days = Math.ceil((parseISO(schedule.end_date) - parseISO(schedule.start_date)) / (1000 * 60 * 60 * 24));
            duration = `${days} days`;
            rate = `£${schedule.fixed_day_rate}/day`;
            totalPrice = schedule.fixed_day_rate * days;
          }
          
          return (
            <div key={schedule.id} className="bg-white p-4 rounded border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-gray-900">{schedule.advertiser_company}</div>
                  <div className="text-xs text-gray-500">Advertiser ID: {schedule.advertiser_id}</div>
                </div>
                <ScheduleStatus schedule={schedule} />
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Period:</span>
                  <div className="font-medium">
                    {format(parseISO(schedule.start_date), 'MMM dd, yyyy')} - {format(parseISO(schedule.end_date), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <div className="font-medium">{duration}</div>
                </div>
                <div>
                  <span className="text-gray-500">Rate:</span>
                  <div className="font-medium">{rate}</div>
                </div>
                <div>
                  <span className="text-gray-500">Total Price:</span>
                  <div className="font-semibold text-green-600">£{totalPrice.toFixed(2)}</div>
                </div>
              </div>
              
              {schedule.notes && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">Notes:</span>
                  <div className="text-gray-700">{schedule.notes}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CurrentSchedules;