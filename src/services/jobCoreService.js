import propertyPubClient from "./propertyPubClient";

// Generic job operations - can work with any job type

/**
 * Fetch jobs by type and advertiser
 * @param {string} type - Job type (e.g., 'street_post', 'property_description')
 * @param {string} advertiserId - Advertiser ID
 * @param {Object} filters - Optional filters { limit, offset, status }
 */
export const fetchJobsByType = async (type, advertiserId, filters = {}) => {
  const { data } = await propertyPubClient.get(`/api/bullmq/jobs`, {
    params: {
      advertiser_id: advertiserId,
      type,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      status: filters.status
    }
  });
  return data;
};

/**
 * Create a job of any type
 * @param {string} type - Job type
 * @param {Object} params - { createdBy, inputData }
 */
export const createJob = async (type, { createdBy, inputData }) => {
  const { data } = await propertyPubClient.post(`/api/bullmq/jobs`, {
    type,
    created_by: createdBy,
    data: inputData
  });
  return data;
};

/**
 * Create a remix job for any job type
 * @param {string} remixType - Remix job type (e.g., 'street_post_remix')
 * @param {Object} params - { originalJobId, fieldName, userFeedback, revisionId, createdBy }
 */
export const createRemixJobByType = async (remixType, { originalJobId, fieldName, userFeedback, revisionId, createdBy }) => {
  const { data } = await propertyPubClient.post(`/api/bullmq/jobs`, {
    type: remixType,
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

/**
 * Fetch in-progress remix jobs for a specific original job
 * @param {string} remixType - Remix job type
 * @param {string} originalJobId - Original job ID
 */
export const fetchRemixJobsInProgressByType = async (remixType, originalJobId) => {
  const { data } = await propertyPubClient.get(`/api/bullmq/jobs`, {
    params: {
      type: remixType,
      original_job_id: originalJobId,
      status: "pending,running"
    }
  });
  return data;
};

/**
 * Fetch related jobs by type and custom filter key
 * @param {string} type - Job type
 * @param {string} advertiserId - Advertiser ID
 * @param {Object} filterKey - Custom filter key (e.g., { postcode, street })
 */
export const fetchRelatedJobsByType = async (type, advertiserId, filterKey = {}) => {
  const { data } = await propertyPubClient.get(`/api/bullmq/jobs`, {
    params: {
      ...filterKey,
      advertiser_id: advertiserId,
      type,
      status: "completed"
    }
  });
  return data;
};

// Generic operations that don't need job type

export const cancelJob = async (jobId) => {
  const { data } = await propertyPubClient.delete(`/api/bullmq/jobs/${jobId}`);
  return data;
};

export const fetchJobOutput = async (jobId) => {
  const { data } = await propertyPubClient.get(`/api/bullmq/jobs/${jobId}/output`);
  return data;
};

export const fetchRevisionHistory = async (jobId, fieldName) => {
  const { data } = await propertyPubClient.get(`/api/bullmq/jobs/${jobId}/revisions`, {
    params: { field_name: fieldName }
  });
  return data;
};

export const updateRevisionContent = async (revisionId, content) => {
  const { data } = await propertyPubClient.patch(`/api/bullmq/revisions/${revisionId}`, { content });
  return data;
};

export const updateJobResultField = async (jobId, fieldName, content) => {
  const { data } = await propertyPubClient.patch(`/api/bullmq/jobs/${jobId}/result/${fieldName}`, { content });
  return data;
};

export const updateSelectedVersion = async (jobId, fieldName, version) => {
  const { data } = await propertyPubClient.patch(`/api/bullmq/jobs/${jobId}/selected-version/${fieldName}`, { version });
  return data;
};

export const publishJob = async (jobId, { unpublish = false } = {}) => {
  const { data } = await propertyPubClient.post(`/api/bullmq/jobs/${jobId}/publish`, { unpublish });
  return data;
};
