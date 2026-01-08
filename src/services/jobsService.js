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

export const fetchRelatedJobs = async ({ postcode, street, advertiserId }) => {
  const { data } = await propertyPubClient.get(`/api/jobs`, {
    params: {
      postcode,
      street,
      advertiser_id: advertiserId,
      type: "street_post",
      status: "completed"
    }
  });
  return data;
};

// Create remix job (AI regeneration with feedback)
export const createRemixJob = async ({ originalJobId, fieldName, userFeedback, revisionId, createdBy }) => {
  const { data } = await propertyPubClient.post(`/api/jobs`, {
    type: "street_post_remix",
    created_by: createdBy,
    data: {
      original_job_id: originalJobId,
      field_name: fieldName,
      user_feedback: userFeedback,
      ...(revisionId && { revision_id: revisionId })
    }
  });
  return data;
};

// Get revision history for a field
export const fetchRevisionHistory = async (jobId, fieldName) => {
  const { data } = await propertyPubClient.get(`/api/revisions/${jobId}/history`, {
    params: { field_name: fieldName }
  });
  return data;
};

// Manual update: revision content (when viewing a revision)
export const updateRevisionContent = async (revisionId, content) => {
  const { data } = await propertyPubClient.patch(`/api/revisions/${revisionId}`, { content });
  return data;
};

// Manual update: original job result field (when viewing original)
export const updateJobResultField = async (jobId, fieldName, content) => {
  const { data } = await propertyPubClient.patch(`/api/jobs/${jobId}/result/${fieldName}`, { content });
  return data;
};

// Fetch in-progress remix jobs for a specific original job
export const fetchRemixJobsInProgress = async (originalJobId) => {
  const { data } = await propertyPubClient.get(`/api/jobs`, {
    params: {
      type: "street_post_remix",
      original_job_id: originalJobId,
      status: "pending,running"
    }
  });
  return data;
};
