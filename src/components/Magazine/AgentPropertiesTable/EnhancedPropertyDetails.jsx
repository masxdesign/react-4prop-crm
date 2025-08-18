import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdvertisersByPstids, createSchedule, normalizeScheduleData } from '../api';
import CurrentSchedules from './CurrentSchedules';
import ScheduleWizardModal from './ScheduleWizardModal';

// Enhanced Property Details Component - Uses display-ready property data
const EnhancedPropertyDetails = ({ property, agentId, isContentLoading }) => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Extract property subtype IDs for fetching advertisers
  const subtypeIds = property.subtypes?.map(subtype => subtype.id).join(',') || '';
  
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Property Information - Using Enhanced Data */}
        <div>
          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
            Property Information
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${property.statusColor || 'gray'}-100 text-${property.statusColor || 'gray'}-800`}>
              {property.statusText}
            </span>
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Property ID:</span> {property.pid}
            </div>
            <div>
              <span className="font-medium">Title:</span> 
              <div className="text-blue-600 font-medium mt-1">{property.title}</div>
            </div>
            <div>
              <span className="font-medium">Address:</span> 
              <div className="mt-1">{property.addressText}</div>
            </div>
            <div>
              <span className="font-medium">Property Types:</span> 
              <div className="mt-1">{property.typesText || 'No types specified'}</div>
            </div>
            <div>
              <span className="font-medium">Subtypes:</span> 
              <div className="mt-1">{property.subtypesText || 'No subtypes specified'}</div>
            </div>
            <div>
              <span className="font-medium">Tenure:</span> 
              <div className="mt-1 text-green-600 font-medium">{property.tenureText}</div>
            </div>
            {property.sizeText && (
              <div>
                <span className="font-medium">Size:</span> 
                <div className="mt-1">{property.sizeText}</div>
              </div>
            )}
            {property.landText && (
              <div>
                <span className="font-medium">Land:</span> 
                <div className="mt-1">{property.landText}</div>
              </div>
            )}
            <div>
              <span className="font-medium">Dealing Agents:</span> 
              <div className="mt-1">{property.agents?.join(', ') || 'None'}</div>
            </div>
          </div>
        </div>

        {/* Property Content - Enhanced Content Display */}
        <div>
          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
            Property Content
            {isContentLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </h4>
          {isContentLoading ? (
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
              Loading property content...
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              {property.content?.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <div className="mt-1 text-gray-700 max-h-24 overflow-y-auto" 
                       dangerouslySetInnerHTML={{ __html: property.content.description }} />
                </div>
              )}
              {property.content?.location && (
                <div>
                  <span className="font-medium">Location:</span>
                  <div className="mt-1 text-gray-700 max-h-16 overflow-y-auto"
                       dangerouslySetInnerHTML={{ __html: property.content.location }} />
                </div>
              )}
              {property.content?.amenities && (
                <div>
                  <span className="font-medium">Amenities:</span>
                  <div className="mt-1 text-gray-700 max-h-16 overflow-y-auto"
                       dangerouslySetInnerHTML={{ __html: property.content.amenities }} />
                </div>
              )}
              {property.content?.teaser && (
                <div>
                  <span className="font-medium">Teaser:</span>
                  <div className="mt-1 text-gray-600 italic">{property.content.teaser}</div>
                </div>
              )}
              {!property.content?.description && !property.content?.location && !property.content?.amenities && !isContentLoading && (
                <div className="text-gray-500 bg-gray-50 p-3 rounded">
                  No content available for this property
                </div>
              )}
            </div>
          )}
        </div>

        {/* Property Images - Enhanced Image Display */}
        <div>
          <h4 className="font-semibold text-lg mb-3">
            Property Images ({property.pictures?.count || 0})
          </h4>
          {property.pictures?.count > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {property.pictures.thumbs.slice(0, 4).map((thumb, index) => (
                  <img 
                    key={index}
                    src={thumb} 
                    alt={`Property ${property.pid} - ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                ))}
              </div>
              {property.pictures.count > 4 && (
                <div className="text-sm text-gray-500 text-center">
                  +{property.pictures.count - 4} more images
                </div>
              )}
              {property.pictures.captions?.length > 0 && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">First caption:</span> {property.pictures.captions[0]}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 bg-gray-50 p-3 rounded text-center">
              No images available
            </div>
          )}
        </div>
      </div>

      {/* Current Schedules */}
      <div className="mb-6">
        <CurrentSchedules propertyId={property.pid} />
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