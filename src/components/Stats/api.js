import propertyPubClient from '@/services/propertyPubClient';

/**
 * Fetch advertiser stats with agency breakdown
 */
export const fetchAdvertiserStats = async (advertiserId, startDate, endDate) => {
  const response = await propertyPubClient.get(
    `/api/stats/advertiser/${advertiserId}`,
    {
      params: { startDate, endDate }
    }
  );
  return response.data;
};

/**
 * Fetch properties for an agency under an advertiser
 */
export const fetchAdvertiserAgencyProperties = async (advertiserId, agencyId, startDate, endDate) => {
  const response = await propertyPubClient.get(
    `/api/stats/advertiser/${advertiserId}/agency/${agencyId}/properties`,
    {
      params: { startDate, endDate }
    }
  );
  return response.data;
};

/**
 * Fetch agency stats with advertiser breakdown
 */
export const fetchAgencyStats = async (agencyId, startDate, endDate) => {
  const response = await propertyPubClient.get(
    `/api/stats/agency/${agencyId}`,
    {
      params: { startDate, endDate }
    }
  );
  return response.data;
};

/**
 * Fetch properties for an advertiser under an agency
 */
export const fetchAgencyAdvertiserProperties = async (agencyId, advertiserId, startDate, endDate) => {
  const response = await propertyPubClient.get(
    `/api/stats/agency/${agencyId}/advertiser/${advertiserId}/properties`,
    {
      params: { startDate, endDate }
    }
  );
  return response.data;
};

/**
 * Fetch paginated advertisers
 */
export const fetchAdvertisers = async ({ page = 1, limit = 20, search = '' }) => {
  const response = await propertyPubClient.get('/api/advertisers', {
    params: {
      sortBy: 'company',
      order: 'asc',
      page,
      limit,
      ...(search && { search })
    }
  });
  return response.data;
};

/**
 * Fetch single agency by ID
 */
export const fetchAgencyById = async (agencyId) => {
  const response = await propertyPubClient.get(`/api/agencies/${agencyId}`);
  return response.data;
};

/**
 * Fetch paginated agencies
 */
export const fetchAgencies = async ({ page = 1, limit = 20, search = '' }) => {
  const response = await propertyPubClient.get('/api/agencies', {
    params: {
      sortBy: 'name',
      order: 'asc',
      page,
      limit,
      ...(search && { search })
    }
  });
  return response.data;
};
