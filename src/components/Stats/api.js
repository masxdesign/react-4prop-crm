import propertyPubClient from '@/services/propertyPubClient';

/**
 * Fetch advertiser statistics summary with agency breakdown
 * @param {string} advertiserId - The advertiser ID
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise} Response data containing daily summary and agency breakdown
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
 * Fetch properties for a specific agency under an advertiser (lazy loaded)
 * @param {string} advertiserId - The advertiser ID
 * @param {string} agencyId - The agency ID
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise} Array of properties with enquirers
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
 * Fetch agency statistics summary with advertiser breakdown
 * @param {string} agencyId - The agency ID
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise} Response data containing daily summary and advertiser breakdown
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
 * Fetch properties for a specific advertiser under an agency (lazy loaded)
 * @param {string} agencyId - The agency ID
 * @param {string} advertiserId - The advertiser ID
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise} Array of properties with enquirers
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
