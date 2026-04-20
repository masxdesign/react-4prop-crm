import propertyPubClient from "./propertyPubClient";

/**
 * Fetch draft by source job ID
 * @param {string} jobId - Source job UUID
 */
export const fetchDraftByJobId = async (jobId) => {
  const { data } = await propertyPubClient.get(`/api/bullmq/drafts/by-job/${jobId}`);
  return data;
};

/**
 * Fetch draft by ID
 * @param {string} draftId - Draft UUID
 */
export const fetchDraft = async (draftId) => {
  const { data } = await propertyPubClient.get(`/api/bullmq/drafts/${draftId}`);
  return data;
};

/**
 * Fetch revision history for a draft field
 * @param {string} draftId - Draft UUID
 * @param {string} fieldName - Field name
 */
export const fetchDraftRevisionHistory = async (draftId, fieldName) => {
  const { data } = await propertyPubClient.get(`/api/bullmq/drafts/${draftId}/revisions`, {
    params: { field_name: fieldName }
  });
  return data;
};

/**
 * Update a draft field (creates new revision)
 * @param {string} draftId - Draft UUID
 * @param {string} fieldName - Field name
 * @param {string} content - New content
 * @param {string} createdBy - User ID
 */
export const updateDraftField = async (draftId, fieldName, content, createdBy) => {
  const { data } = await propertyPubClient.patch(
    `/api/bullmq/drafts/${draftId}/fields/${fieldName}`,
    { content, created_by: createdBy }
  );
  return data;
};

/**
 * Select a specific revision for a field
 * @param {string} draftId - Draft UUID
 * @param {string} fieldName - Field name
 * @param {string} revisionId - Revision UUID to select
 */
export const selectDraftRevision = async (draftId, fieldName, revisionId) => {
  const { data } = await propertyPubClient.patch(
    `/api/bullmq/drafts/${draftId}/fields/${fieldName}/select-revision`,
    { revision_id: revisionId }
  );
  return data;
};

/**
 * Publish draft to blog
 * @param {string} draftId - Draft UUID
 * @param {object} options - { unpublish?: boolean }
 */
export const publishDraft = async (draftId, { unpublish = false } = {}) => {
  const { data } = await propertyPubClient.post(
    `/api/bullmq/drafts/${draftId}/publish`,
    { unpublish }
  );
  return data;
};

/**
 * Fetch draft sync status
 * @param {string} draftId - Draft UUID
 */
export const fetchDraftSyncStatus = async (draftId) => {
  const { data } = await propertyPubClient.get(`/api/bullmq/drafts/${draftId}/sync-status`);
  return data;
};
