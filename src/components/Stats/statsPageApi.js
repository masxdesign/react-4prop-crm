import propertyPubClient from '@/services/propertyPubClient';

/** Agency / advertiser dashboard stats (split from api.js for clearer bundling). */

export const fetchAdvertiserStats = async (advertiserId, startDate, endDate) => {
  const response = await propertyPubClient.get(`/api/stats/advertiser/${advertiserId}`, {
    params: { startDate, endDate },
  });
  return response.data;
};

export const fetchAgencyStats = async (agencyId, startDate, endDate) => {
  const response = await propertyPubClient.get(`/api/stats/agency/${agencyId}`, {
    params: { startDate, endDate },
  });
  return response.data;
};
