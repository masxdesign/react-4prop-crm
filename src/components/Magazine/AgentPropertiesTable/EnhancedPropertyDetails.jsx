import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdvertisersByPstids, createSchedule, normalizeScheduleData } from '../api';
import CurrentSchedules from './CurrentSchedules';
import ScheduleWizardModal from './ScheduleWizardModal';
import useUsersByNids from '@/hooks/useUsersByNids';
import { getAgentInitials, getAgentAvatar, getAgentFullName } from '../util/agentHelpers';

// Enhanced Property Details Component - Uses display-ready property data
const EnhancedPropertyDetails = ({ property, agentId }) => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const queryClient = useQueryClient();

  // Extract property subtype IDs for fetching advertisers
  const subtypeIds = property.subtypes?.map(subtype => subtype.id).join(',') || '';
  
  // Extract agent NIDs for fetching agent data
  const agentNids = useMemo(() => {
    if (!property.agents || !Array.isArray(property.agents)) return [];
    return property.agents.filter(Boolean);
  }, [property.agents]);

  // Fetch agent data using the same pattern as schedule workflow
  const { getUserByNid, isLoading: agentsLoading } = useUsersByNids(agentNids);
  
  // Fetch advertisers based on property subtypes
  const {
    data: advertisersData,
    isLoading: advertisersLoading,
    error: advertisersError
  } = useQuery({
    queryKey: ['advertisers', subtypeIds],
    queryFn: () => fetchAdvertisersByPstids(subtypeIds),
    enabled: !!subtypeIds,
  });

  const advertisers = advertisersData?.data || [];

  // Schedule mutation
  const scheduleMutation = useMutation({
    mutationFn: (scheduleData) => createSchedule(agentId, scheduleData),
    onSuccess: (newScheduleData) => {
      // Normalize the schedule data before adding to cache
      const normalizedSchedule = normalizeScheduleData(newScheduleData, advertisers);
      
      // Update the property schedules cache with the normalized schedule
      queryClient.setQueryData(['property-schedules', property.pid], (oldData) => {
        if (!oldData) return { data: [normalizedSchedule] };
        return {
          ...oldData,
          data: [...oldData.data, normalizedSchedule]
        };
      });
      
      // Also invalidate the query to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ['property-schedules', property.pid] });
      
      // Update the agent properties cache to reflect the new schedule
      queryClient.setQueryData(['agent-properties', agentId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map(prop => 
            prop.id === property.pid 
              ? { ...prop, schedulesCount: (prop.schedulesCount || 0) + 1 }
              : prop
          )
        };
      });
      
      setIsScheduleModalOpen(false);
    },
  });

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-100 p-6 border-t">
      {/* Enhanced Property Overview */}
      <div className="grid grid-cols-[20%_1fr] gap-6 mb-6">
        {/* Property Information - Using Enhanced Data */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="text-base">📄</span>
            Property Information
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${property.statusColor || 'gray'}-100 text-${property.statusColor || 'gray'}-800`}>
              {property.statusText}
            </span>
          </h4>
          
          {/* Property Fields - Consistent Badge Style */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-xs text-gray-600">Property Subtypes:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {property.subtypesText || 'No subtypes'}
              </span>
            </div>
            
            <div className="flex justify-between items-start border-b border-gray-100 pb-2">
              <span className="text-xs text-gray-600">Dealing Agents:</span>
              <div className="flex flex-wrap gap-1">
                {agentsLoading ? (
                  <div className="text-xs text-gray-500">Loading...</div>
                ) : agentNids.length > 0 ? (
                  agentNids.map((agentNid, index) => {
                    const agent = getUserByNid(agentNid);
                    const hasImageError = imageErrors.has(agentNid);
                    
                    const handleImageError = () => {
                      setImageErrors(prev => new Set([...prev, agentNid]));
                    };
                    
                    return (
                      <div key={index} className="flex items-center gap-1 bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                        <div className="flex-shrink-0 w-3 h-3 rounded-full overflow-hidden">
                          {getAgentAvatar(agent) && !hasImageError ? (
                            <img
                              src={getAgentAvatar(agent)}
                              alt={getAgentFullName(agent)}
                              className="w-full h-full object-cover"
                              onError={handleImageError}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                              {agent ? getAgentInitials(agent.firstname, agent.surname) : agentNid.toString().slice(-1)}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-medium">
                          {agent ? getAgentFullName(agent) : `Agent ${agentNid}`}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">-</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-xs text-gray-600">Title:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium truncate" title={property.title}>
                {property.title}
              </span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-xs text-gray-600">Address:</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium truncate" title={property.addressText}>
                {property.addressText}
              </span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-xs text-gray-600">Tenure:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                {property.tenureText}
              </span>
            </div>
            
            {property.sizeText && (
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-600">Size:</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                  {property.sizeText}
                </span>
              </div>
            )}
            
            {property.typesText && (
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-600">Types:</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium truncate" title={property.typesText}>
                  {property.typesText}
                </span>
              </div>
            )}
            
            {property.landText && (
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-600">Land:</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                  {property.landText}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Current Schedules */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <CurrentSchedules propertyId={property.pid} />
        </div>
      </div>

      {/* Available Advertisers Section */}
      <div className="pt-6 border-t border-gray-200">
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

export default EnhancedPropertyDetails;