import { useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDraftByJobId,
  fetchDraft,
  fetchDraftRevisionHistory,
  updateDraftField,
  selectDraftRevision,
  publishDraft
} from "@/services/draftService";
import { fetchRemixJobsInProgressByType } from "@/services/jobCoreService";

/**
 * Fetch draft by source job ID
 * @param {string} jobId - Source job UUID
 */
export function useDraftByJobId(jobId) {
  return useQuery({
    queryKey: ["draft", "byJob", jobId],
    queryFn: () => fetchDraftByJobId(jobId),
    enabled: !!jobId,
  });
}

/**
 * Fetch draft by ID
 * @param {string} draftId - Draft UUID
 */
export function useDraft(draftId) {
  return useQuery({
    queryKey: ["draft", draftId],
    queryFn: () => fetchDraft(draftId),
    enabled: !!draftId,
  });
}

/**
 * Fetch revision history for a draft field
 * Polls every 3s when there's a pending remix
 * @param {string} draftId - Draft UUID
 * @param {string} fieldName - Field name
 */
export function useDraftRevisionHistory(draftId, fieldName) {
  return useQuery({
    queryKey: ["draft", draftId, "revisions", fieldName],
    queryFn: () => fetchDraftRevisionHistory(draftId, fieldName),
    enabled: !!draftId && !!fieldName,
    refetchInterval: (query) => {
      const hasPending = query.state.data?.revisions?.some(r => r.is_pending) ?? false;
      return hasPending ? 3000 : false;
    }
  });
}

/**
 * Helper to update jobs list cache with new draft_sync_status
 */
function updateJobsListSyncStatus(queryClient, jobType, sourceJobId, newSyncStatus) {
  if (!jobType || !sourceJobId) return;

  queryClient.setQueriesData(
    { queryKey: [`${jobType}Jobs`] },
    (old) => {
      if (!old) return old;

      const updateJob = (job) =>
        job.id === sourceJobId
          ? { ...job, draft_sync_status: newSyncStatus }
          : job;

      // Handle infinite query structure (pages array)
      if (old.pages) {
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            jobs: page.jobs.map(updateJob)
          }))
        };
      }

      // Handle regular query structure
      if (old.jobs) {
        return {
          ...old,
          jobs: old.jobs.map(updateJob)
        };
      }

      return old;
    }
  );
}

/**
 * Update draft field mutation (creates new revision)
 * @param {string} jobType - Original job type for cache invalidation
 */
export function useUpdateDraftFieldMutation(jobType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draftId, fieldName, content, createdBy }) =>
      updateDraftField(draftId, fieldName, content, createdBy),
    onSuccess: (data, { draftId, sourceJobId }) => {
      const now = new Date().toISOString();
      // Invalidate draft and revision queries
      queryClient.invalidateQueries({ queryKey: ["draft", draftId] });
      queryClient.invalidateQueries({ queryKey: ["draft", "byJob"] });
      queryClient.invalidateQueries({ queryKey: ["draft", draftId, "revisions"] });

      // Update draft cache with new content_hash and recalculate sync_status
      // Use synced_content_hash from server response if available, otherwise use cached value
      let newSyncStatus = null;
      const updateWithSyncStatus = (old) => {
        if (!old) return old;
        const newHash = data.content_hash;
        const syncedHash = data.synced_content_hash ?? old.synced_content_hash;
        let syncStatus = old.sync_status;

        // Recalculate sync_status if draft has been published before
        if (old.blog_post_id && syncedHash) {
          syncStatus = newHash === syncedHash ? 'published' : 'modified';
        }
        newSyncStatus = syncStatus;

        return { ...old, updated_at: now, content_hash: newHash, synced_content_hash: syncedHash, sync_status: syncStatus };
      };

      queryClient.setQueryData(["draft", draftId], updateWithSyncStatus);
      queryClient.setQueriesData(
        { queryKey: ["draft", "byJob"], exact: false },
        (old) => old?.id === draftId ? updateWithSyncStatus(old) : old
      );

      // Update jobs list cache with new sync status
      if (newSyncStatus) {
        updateJobsListSyncStatus(queryClient, jobType, sourceJobId, newSyncStatus);
      }
    }
  });
}

/**
 * Select revision mutation (switch which revision is active)
 * @param {string} jobType - Job type for updating jobs list cache
 */
export function useSelectDraftRevisionMutation(jobType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draftId, fieldName, revisionId }) =>
      selectDraftRevision(draftId, fieldName, revisionId),
    onMutate: async ({ draftId, fieldName, revisionId }) => {
      const queryKey = ["draft", draftId, "revisions", fieldName];
      const now = new Date().toISOString();

      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update selected_version
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        const revision = old.revisions?.find(r => r.id === revisionId);
        return {
          ...old,
          current_revision_id: revisionId,
          selected_version: revision?.version ?? old.selected_version
        };
      });

      // Update draft updated_at in both caches
      const updateTimestamp = (old) =>
        old ? { ...old, updated_at: now } : old;

      queryClient.setQueryData(["draft", draftId], updateTimestamp);
      queryClient.setQueriesData(
        { queryKey: ["draft", "byJob"], exact: false },
        (old) => old?.id === draftId ? updateTimestamp(old) : old
      );

      return { previousData, queryKey };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    onSuccess: (data, { draftId, sourceJobId }) => {
      // Update content hash and recalculate sync_status based on hash comparison
      // Use synced_content_hash from server response if available, otherwise use cached value
      let newSyncStatus = null;
      const updateWithSyncStatus = (old) => {
        if (!old) return old;
        const newHash = data.content_hash;
        const syncedHash = data.synced_content_hash ?? old.synced_content_hash;
        let syncStatus = old.sync_status;

        // Recalculate sync_status if draft has been published before
        if (old.blog_post_id && syncedHash) {
          syncStatus = newHash === syncedHash ? 'published' : 'modified';
        }
        newSyncStatus = syncStatus;

        return { ...old, content_hash: newHash, synced_content_hash: syncedHash, sync_status: syncStatus };
      };

      queryClient.setQueryData(["draft", draftId], updateWithSyncStatus);
      queryClient.setQueriesData(
        { queryKey: ["draft", "byJob"], exact: false },
        (old) => old?.id === draftId ? updateWithSyncStatus(old) : old
      );

      // Update jobs list cache with new sync status
      if (newSyncStatus) {
        updateJobsListSyncStatus(queryClient, jobType, sourceJobId, newSyncStatus);
      }
    }
  });
}

/**
 * Publish draft mutation
 * @param {string} jobType - Job type for updating jobs list cache (e.g., 'street_post')
 */
export function usePublishDraftMutation(jobType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draftId, unpublish }) => publishDraft(draftId, { unpublish }),
    onSuccess: (response, { draftId, sourceJobId }) => {
      const { blog_post_id, is_published } = response;
      const now = new Date().toISOString();
      const newSyncStatus = is_published ? 'published' : 'unpublished';

      const updateDraftData = (old) => {
        if (!old) return old;
        return {
          ...old,
          blog_post_id,
          blog_synced_at: is_published ? now : null,
          // On publish: snapshot current hash as synced_content_hash
          // On unpublish: clear synced_content_hash
          synced_content_hash: is_published ? old.content_hash : null,
          sync_status: newSyncStatus
        };
      };

      // Update draft cache by ID
      queryClient.setQueryData(["draft", draftId], updateDraftData);

      // Also update all byJob caches that match this draft
      queryClient.setQueriesData(
        { queryKey: ["draft", "byJob"], exact: false },
        (old) => old?.id === draftId ? updateDraftData(old) : old
      );

      // Update jobs list cache with new draft_sync_status
      if (jobType && sourceJobId) {
        queryClient.setQueriesData(
          { queryKey: [`${jobType}Jobs`] },
          (old) => {
            if (!old) return old;

            const updateJob = (job) =>
              job.id === sourceJobId
                ? {
                    ...job,
                    draft_sync_status: newSyncStatus,
                    blog_post_id,
                    is_published,
                    blog_synced_at: is_published ? now : job.blog_synced_at,
                  }
                : job;

            // Handle infinite query structure (pages array)
            if (old.pages) {
              return {
                ...old,
                pages: old.pages.map(page => ({
                  ...page,
                  jobs: page.jobs.map(updateJob)
                }))
              };
            }

            // Handle regular query structure
            if (old.jobs) {
              return {
                ...old,
                jobs: old.jobs.map(updateJob)
              };
            }

            return old;
          }
        );
      }
    }
  });
}

/**
 * Track in-progress remix jobs for a draft's original job
 * @param {string} remixType - Remix job type
 * @param {string} originalJobId - Original job ID
 * @param {string} draftId - Draft ID for cache invalidation
 */
export function useDraftRemixJobsInProgress(remixType, originalJobId, draftId) {
  const queryClient = useQueryClient();
  const prevHadJobsRef = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ["remixJobsInProgress", remixType, originalJobId],
    queryFn: () => fetchRemixJobsInProgressByType(remixType, originalJobId),
    enabled: !!originalJobId,
    refetchInterval: 3000,
  });

  const jobs = data?.jobs || [];

  const fieldStatus = {};
  for (const job of jobs) {
    const fieldName = job.input_data?.field_name;
    if (fieldName) {
      fieldStatus[fieldName] = job.status;
    }
  }

  const hasInProgress = jobs.length > 0;

  useEffect(() => {
    if (prevHadJobsRef.current && !hasInProgress && draftId) {
      // Remix completed - invalidate revision queries
      queryClient.invalidateQueries({ queryKey: ["draft", draftId, "revisions"] });
      queryClient.invalidateQueries({ queryKey: ["draft", draftId] });
      queryClient.invalidateQueries({ queryKey: ["draft", "byJob"] });
    }
    prevHadJobsRef.current = hasInProgress;
  }, [hasInProgress, draftId, queryClient]);

  return {
    jobs,
    fieldStatus,
    isLoading,
    hasInProgress
  };
}
