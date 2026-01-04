import propertyPubClient from "./propertyPubClient";

export const fetchJobsByAdvertiserId = async (advertiserId, filters = {}) => {
  const { data } = await propertyPubClient.get(`/api/jobs`, {
    params: {
      advertiser_id: advertiserId,
      type: "street_post",
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      status: filters.status
    }
  });
  return data;
};

export const createStreetPostJob = async ({ postcode, street, advertiserId, createdBy }) => {
  const { data } = await propertyPubClient.post(`/api/jobs`, {
    type: "street_post",
    created_by: createdBy,
    data: {
      postcode,
      street,
      advertiser_id: advertiserId
    }
  });
  return data;
};

export const cancelJob = async (jobId) => {
  const { data } = await propertyPubClient.delete(`/api/jobs/${jobId}`);
  return data;
};

export const fetchJobOutput = async (jobId) => {
  const { data } = await propertyPubClient.get(`/api/jobs/${jobId}/output`);
  return data;
};

export const fetchStreetPostEstimate = async ({ postcode, street }) => {
  const { data } = await propertyPubClient.get(`/api/ai/street-post/estimate`, {
    params: { postcode, street }
  });
  return data;
};
