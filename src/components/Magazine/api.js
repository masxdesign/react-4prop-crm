import bizchatClient from '@/services/bizchatClient';

// Agent Properties API functions
export const fetchAgentProperties = async (agentId) => {
  const response = await bizchatClient.get(`/api/crm/mag/agent/${agentId}`);
  return response.data;
};

// Advertiser Management API functions
export const fetchAllAdvertisers = async () => {
  const response = await bizchatClient.get('/api/crm/mag/advertisers');
  return response.data;
};

export const createAdvertiser = async (advertiserData) => {
  const response = await bizchatClient.post('/api/crm/mag/advertisers', advertiserData);
  return response.data;
};

export const updateAdvertiser = async ({ id, ...advertiserData }) => {
  const response = await bizchatClient.put(`/api/crm/mag/advertisers/${id}`, advertiserData);
  return response.data;
};

export const deleteAdvertiser = async (id) => {
  const response = await bizchatClient.delete(`/api/crm/mag/advertisers/${id}`);
  return response.data;
};

// Property Details API functions
export const fetchAdvertisersByPstids = async (pstids) => {
  const response = await bizchatClient.get(`/api/crm/mag/advertisers_by_pstids?pstids=${pstids}`);
  return response.data;
};

export const createSchedule = async (agentId, scheduleData) => {
  const response = await bizchatClient.post(`/api/crm/mag/agent/${agentId}/schedule`, scheduleData);
  return response.data;
};

// Property Schedules API functions
export const fetchPropertySchedules = async (propertyId) => {
  const response = await bizchatClient.get(`/api/crm/mag/property/${propertyId}/schedules`);
  return response.data;
};

// Advertiser Properties API functions
export const fetchAdvertiserProperties = async (advertiserId) => {
  const response = await bizchatClient.get(`/api/crm/mag/advertiser/${advertiserId}`);
  return response.data;
};

// Magazine Listing API function (using native fetch)
export const fetchMagazineListingData = async (advertiserId) => {
  const response = await fetch(`/api/crm/mag/advertiser/${advertiserId}`);
  return response.json();
};

// Data normalization utilities
export const normalizeScheduleData = (scheduleData, advertisers = []) => {
  // Handle the case where scheduleData might be nested in a response object
  const schedule = scheduleData.data || scheduleData;
  
  // Find the advertiser company name
  const advertiser = advertisers.find(adv => adv.id === parseInt(schedule.advertiser_id));
  const advertiser_company = advertiser?.company || `Advertiser ${schedule.advertiser_id}`;
  
  // Normalize end_date - handle both array and string formats
  let end_date = schedule.end_date;
  if (Array.isArray(end_date) && end_date.length > 0) {
    // Take the first element if it's an array
    end_date = end_date[0];
  }
  
  // Return normalized schedule data
  return {
    ...schedule,
    advertiser_company,
    end_date
  };
};