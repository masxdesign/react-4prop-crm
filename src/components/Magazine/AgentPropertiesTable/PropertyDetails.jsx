import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdvertisersByPstids, createSchedule, normalizeScheduleData } from '../api';
import CurrentSchedules from './CurrentSchedules';
import ScheduleModal from './ScheduleModal';
import ScheduleWizardModal from './ScheduleWizardModal';

// Property Details Component - Updated for week-based system
const PropertyDetails = ({ property, agentId }) => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Extract property subtype IDs for fetching advertisers
  const pstidsString = property.propertySubtypeIds?.replace(/^,|,$/g, '') || '';
  
  // Fetch advertisers based on property subtypes
  const {
    data: advertisersData,
    isLoading: advertisersLoading,
    error: advertisersError
  } = useQuery({
    queryKey: ['advertisers', pstidsString],
    queryFn: () => fetchAdvertisersByPstids(pstidsString),
    enabled: !!pstidsString,
  });

  // Schedule mutation
  const scheduleMutation = useMutation({
    mutationFn: (scheduleData) => createSchedule(agentId, scheduleData),
    onSuccess: (newScheduleData) => {
      // Normalize the schedule data before adding to cache
      const normalizedSchedule = normalizeScheduleData(newScheduleData, advertisers);
      
      // Update the property schedules cache with the normalized schedule
      queryClient.setQueryData(['property-schedules', property.id], (oldData) => {
        if (!oldData) return { data: [normalizedSchedule] };
        return {
          ...oldData,
          data: [...oldData.data, normalizedSchedule]
        };
      });
      
      // Also invalidate the query to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['property-schedules', property.id] });
      
      // Update the agent properties cache to reflect the new schedule
      queryClient.setQueryData(['agent-properties', agentId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map(prop => 
            prop.id === property.id 
              ? { ...prop, schedulesCount: (prop.schedulesCount || 0) + 1 }
              : prop
          )
        };
      });
      
      setIsScheduleModalOpen(false);
    },
  });

  const advertisers = advertisersData?.data || [];

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-100 p-6 border-t">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Information */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Property Information</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Property ID:</span> {property.id}
            </div>
            <div>
              <span className="font-medium">Department:</span> {property.departmentName}
            </div>
            <div>
              <span className="font-medium">Property Subtypes:</span>{' '}
              {property.propertySubtypeIds?.replace(/^,|,$/g, '').split(',').filter(id => id.trim()).join(', ') || 'None'}
            </div>
            <div>
              <span className="font-medium">Dealing Agents:</span>{' '}
              {property.dealsWith?.replace(/^,|,$/g, '').split(',').filter(id => id.trim()).join(', ') || 'None'}
            </div>
          </div>
        </div>

        {/* Current Schedules */}
        <div className="lg:col-span-2">
          <CurrentSchedules propertyId={property.id} />
        </div>
      </div>

      {/* Available Advertisers Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-lg">Available Advertisers for New Booking</h4>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            disabled={advertisers.length === 0}
          >
            + Schedule New Advertiser
          </button>
        </div>
        
        {advertisersLoading && (
          <div className="text-sm text-gray-500">Loading advertisers...</div>
        )}
        
        {advertisersError && (
          <div className="text-sm text-red-500">Error loading advertisers</div>
        )}
        
        {advertisers.length === 0 && !advertisersLoading && (
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded border">
            No advertisers available for this property type
          </div>
        )}
        
        {advertisers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {advertisers.map((advertiser) => (
              <div key={advertiser.id} className="bg-white p-4 rounded border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900">{advertiser.company}</div>
                  <div className="text-lg font-semibold text-green-600">
                    £{advertiser.week_rate}/week
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  ID: {advertiser.id}
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Subtypes: {advertiser.pstids?.replace(/^,|,$/g, '').split(',').filter(id => id.trim()).join(', ')}
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Book This Advertiser
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      <ScheduleWizardModal
        open={isScheduleModalOpen}
        property={property}
        advertisers={advertisers}
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={(data) => scheduleMutation.mutate(data)}
        isLoading={scheduleMutation.isPending}
        error={scheduleMutation.error}
      />
    </div>
  );
};

export default PropertyDetails;