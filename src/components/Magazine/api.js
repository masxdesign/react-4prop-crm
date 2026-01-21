import bizchatClient from '@/services/bizchatClient';
import propertyPubClient from '@/services/propertyPubClient';

// Agent Properties API functions
export const fetchAgentProperties = async (nid) => {
  const response = await bizchatClient.get(`/api/crm/mag/agent/properties/${nid}`);
  return response.data;
};

// Agent Properties with Pagination API functions
export const fetchAgentPaginatedProperties = async (nid, options = {}) => {
  const { page = 1, pageSize = 10 } = options;
  const response = await bizchatClient.get(`/api/crm/mag/agent/paginated/${nid}?page=${page}&pageSize=${pageSize}`);
  return response.data;
};

/** Agent Properties with cursor-based infinite scroll (hybrid API) */
export const fetchAgentPropertiesCursor = async (nid, options = {}) => {
  const { cursor, pageSize = 20, search } = options;
  const params = { pageSize };
  if (cursor !== undefined && cursor !== null) {
    params.cursor = cursor;
  }
  if (search?.trim()) {
    params.search = search.trim();
  }
  const response = await bizchatClient.get(`/api/crm/mag/agent/paginated/${nid}`, { params });
  return response.data;
};

// Advertiser Management API functions
export const fetchAllAdvertisers = async () => {
  const response = await bizchatClient.get('/api/crm/mag/advertisers');
  return response.data;
};

export const fetchAdvertiserById = async (advertiserId) => {
  const response = await bizchatClient.get(`/api/crm/mag/advertisers/${advertiserId}`);
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
  const response = await bizchatClient.get(`/api/crm/mag/advertisers/by_pstids?pstids=${pstids}`);
  return response.data;
};

export const createSchedule = async (nid, scheduleData) => {
  const response = await bizchatClient.post(`/api/crm/mag/schedules/${nid}`, scheduleData);
  return response.data;
};

// Property Schedules API functions
export const fetchPropertySchedules = async (propertyId) => {
  const response = await bizchatClient.get(`/api/crm/mag/schedules/${propertyId}`);
  return response.data;
};

// Advertiser Properties API functions
export const fetchAdvertiserProperties = async (advertiserId) => {
  const response = await bizchatClient.get(`/api/crm/mag/advertisers/${advertiserId}/properties`);
  return response.data;
};

// Magazine Listing API function (using native fetch)
export const fetchMagazineListingData = async (advertiserId) => {
  const response = await fetch(`/api/crm/mag/advertiser/${advertiserId}`);
  return response.json();
};

// Agent Search API functions
export const searchAgents = async (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const response = await propertyPubClient.get('/api/agents', {
    params: {
      search: searchTerm,
      page: 1,
      limit: 100,
      sortBy: 'surname',
      order: 'asc'
    }
  });

  return response.data?.data || [];
};

/**
 * Fetch single agent details by NID
 * @param {string} nid - Agent NID
 * @returns {Promise} Agent object with nid, email, firstname, surname, picture, company, position
 */
export const fetchAgentDetails = async (nid) => {
  const response = await propertyPubClient.get(`/api/agents/${nid}`);
  return response.data;
};

/**
 * Fetch agents for admin selection with search filtering
 * @param {Object} options - Query options
 * @param {string} options.search - Search query for firstname, surname, email, or company
 * @param {number} options.limit - Max results (default: 20)
 * @param {number} options.page - Page number (default: 1)
 * @param {string} options.sortBy - Field to sort by: 'firstname', 'surname', 'company' (default: 'surname')
 * @param {string} options.order - Sort order: 'asc' or 'desc' (default: 'asc')
 * @returns {Promise} Response data with agents array and pagination metadata
 */
export const fetchAgentsForSelection = async ({
  search = '',
  limit = 100,
  page = 1,
  sortBy = 'surname',
  order = 'asc'
}) => {
  if (!search || search.length < 2) {
    return { data: [], pagination: null };
  }

  const response = await propertyPubClient.get('/api/agents', {
    params: {
      search,
      limit,
      page,
      sortBy,
      order
    }
  });

  return {
    data: response.data?.data || [],
    pagination: response.data?.pagination || null
  };
};

// Schedule Status API functions
export const fetchScheduleStatusOptions = async () => {
  const response = await bizchatClient.get('/data/mag_schedule_status.json');
  return response.data;
};

// Property Schedules Summary API functions
export const fetchPropertySchedulesSummary = async (propertyId) => {
  const response = await bizchatClient.get(`/api/crm/mag/schedules/${propertyId}/summary`);
  return response.data;
};

// Schedule Update API functions
export const updateSchedule = async (scheduleId, updateData) => {
  const response = await bizchatClient.put(`/api/crm/mag/schedules/update/${scheduleId}`, updateData);
  return response.data;
};

// Schedule Approval API functions
export const approveSchedule = async (scheduleId, approvalData) => {
  const response = await bizchatClient.post(`/api/crm/mag/schedules/${scheduleId}/approve`, approvalData);
  return response.data;
};

// Schedule Subscription Activation API functions
export const activateSubscription = async (scheduleId) => {
  const response = await bizchatClient.post(`/api/crm/mag/schedules/${scheduleId}/activate-subscription`);
  return response.data;
};

// Platform MoR Subscription Activation (NEW)
export const activateSubscriptionPlatformMor = async (scheduleId) => {
  const response = await bizchatClient.post(`/api/crm/mag/schedules/${scheduleId}/activate-subscription-platform-mor`);
  return response.data;
};

// Self-Billing Agreement API functions (NEW)
export const acceptSelfBillingAgreement = async (advertiserId) => {
  const response = await bizchatClient.post(`/api/crm/mag/advertisers/${advertiserId}/accept-self-billing`);
  return response.data;
};

// Schedule Assign Approver API functions
export const assignApprover = async (scheduleId, assignData) => {
  const response = await bizchatClient.put(`/api/crm/mag/schedules/${scheduleId}/assign-approver`, assignData);
  return response.data;
};

// User Information API functions
export const fetchUsersByNids = async (nids) => {
  const filteredNids = nids.filter(Boolean);
  if (filteredNids.length === 0) return [];

  const response = await bizchatClient.post('/api/users', {
    ids: filteredNids.join(',')
  });
  return response.data;
};

// Agent Payment Setup API functions
export const setupAgentPayment = async (nid, agentData) => {
  const response = await bizchatClient.post(`/api/crm/mag/stripe/agents/${nid}/setup-payment`, agentData);
  return response.data;
};

export const getAgentPaymentMethods = async (nid) => {
  const response = await bizchatClient.get(`/api/crm/mag/stripe/agents/${nid}/payment-methods`);
  return response.data;
};

export const setDefaultPaymentMethod = async (nid, paymentMethodData) => {
  const response = await bizchatClient.put(`/api/crm/mag/stripe/agents/${nid}/default-payment-method`, paymentMethodData);
  return response.data;
};

// Advertiser Stripe Onboarding API functions
export const onboardAdvertiser = async (advertiserId, onboardingData) => {
  const response = await bizchatClient.post(`/api/crm/mag/stripe/advertisers/${advertiserId}/onboard`, onboardingData);
  return response.data;
};

export const getAdvertiserStripeStatus = async (advertiserId) => {
  const response = await bizchatClient.get(`/api/crm/mag/stripe/advertisers/${advertiserId}/status`);
  return response.data;
};

export const createPlatformCustomer = async (advertiserId) => {
  const response = await bizchatClient.post(`/api/crm/mag/advertisers/${advertiserId}/create-platform-customer`);
  return response.data;
};

// Change Advertiser Password API function
export const changeAdvertiserPassword = async (advertiserId, passwordData) => {
  const response = await bizchatClient.post(`/api/crm/mag/advertisers/${advertiserId}/change-password`, passwordData);
  return response.data;
};

// Transfer Settlement API functions
export const fetchTransferStats = async () => {
  const response = await bizchatClient.get('/api/crm/mag/transfers/stats');
  return response.data;
};

export const fetchPendingTransfers = async () => {
  const response = await bizchatClient.get('/api/crm/mag/transfers/admin/pending');
  return response.data;
};

export const fetchFailedTransfers = async () => {
  const response = await bizchatClient.get('/api/crm/mag/transfers/admin/failed');
  return response.data;
};

export const forceSettleTransfer = async (bookingItemId) => {
  const response = await bizchatClient.post(`/api/crm/mag/transfers/admin/force-settle/${bookingItemId}`);
  return response.data;
};

export const processAllSettlements = async () => {
  const response = await bizchatClient.post('/api/crm/mag/transfers/cron/process-settlements');
  return response.data;
};

// Booking History API functions (schedules with active subscriptions)
export const fetchAdvertiserBookings = async (advertiserId, options = {}) => {
  const { status = 'all', pageSize = 20, cursor } = options;
  const params = { status, pageSize };
  if (cursor !== undefined && cursor !== null) {
    params.cursor = cursor;
  }
  const response = await bizchatClient.get(
    `/api/crm/mag/schedules/history/advertiser/${advertiserId}`,
    { params }
  );
  return response.data;
};

export const fetchAgentBookings = async (agentNid, options = {}) => {
  const { status = 'all', pageSize = 20, cursor } = options;
  const params = { status, pageSize };
  if (cursor !== undefined && cursor !== null) {
    params.cursor = cursor;
  }
  const response = await bizchatClient.get(
    `/api/crm/mag/schedules/history/agent/${agentNid}`,
    { params }
  );
  return response.data;
};

export const fetchAgencyBookings = async (companyId, options = {}) => {
  const { status = 'all', pageSize = 20, cursor } = options;
  const params = { status, pageSize };
  if (cursor !== undefined && cursor !== null) {
    params.cursor = cursor;
  }
  const response = await bizchatClient.get(
    `/api/crm/mag/schedules/history/company/${companyId}`,
    { params }
  );
  return response.data;
};

// Grouped Agency View API functions
export const fetchAdvertiserAgencies = async (advertiserId, options = {}) => {
  const { status = 'all', pageSize = 20, cursor } = options;
  const params = { status, pageSize };
  if (cursor !== undefined && cursor !== null) {
    params.cursor = cursor;
  }
  const response = await bizchatClient.get(
    `/api/crm/mag/schedules/history/advertiser/${advertiserId}/agencies`,
    { params }
  );
  return response.data;
};

export const fetchAgencyBookingsForAdvertiser = async (advertiserId, agencyId, options = {}) => {
  const { status = 'all', pageSize = 20, cursor } = options;
  const params = { status, pageSize };
  if (cursor !== undefined && cursor !== null) {
    params.cursor = cursor;
  }
  const response = await bizchatClient.get(
    `/api/crm/mag/schedules/history/advertiser/${advertiserId}/agencies/${agencyId}/bookings`,
    { params }
  );
  return response.data;
};

// Company Grouped by Advertiser View API functions
export const fetchCompanyAdvertisers = async (companyId, options = {}) => {
  const { status = 'all', pageSize = 20, cursor } = options;
  const params = { status, pageSize };
  if (cursor !== undefined && cursor !== null) {
    params.cursor = cursor;
  }
  const response = await bizchatClient.get(
    `/api/crm/mag/schedules/history/company/${companyId}/advertisers`,
    { params }
  );
  return response.data;
};

export const fetchAdvertiserBookingsForCompany = async (companyId, advertiserId, options = {}) => {
  const { status = 'all', pageSize = 20, cursor } = options;
  const params = { status, pageSize };
  if (cursor !== undefined && cursor !== null) {
    params.cursor = cursor;
  }
  const response = await bizchatClient.get(
    `/api/crm/mag/schedules/history/company/${companyId}/advertisers/${advertiserId}/bookings`,
    { params }
  );
  return response.data;
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

// AI Postcodes API - returns districts grouped by prefix: [{ prefix, districts }]
export const fetchPostcodesTree = async (list) => {
  const params = list ? { list } : {};
  const response = await propertyPubClient.get('/api/ai/postcodes/tree', { params });
  return response.data;
};

// AI Postcodes API - returns 4-level tree: prefix → district → source → streets
export const fetchPostcodesTreeFull = async (list) => {
  const params = list ? { list } : {};
  const response = await propertyPubClient.get('/api/ai/postcodes/tree-full', { params });
  return response.data;
};