import { useRef, useEffect } from "react";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsQuery, jobOutputQuery, relatedJobsQuery } from "./jobCore.queries";
import {
  fetchJobsByType,
  createJob,
  cancelJob,
  createRemixJobByType,
  fetchRevisionHistory,
  updateRevisionContent,
  updateJobResultField,
  fetchRemixJobsInProgressByType,
  updateSelectedVersion,
  publishJob
} from "@/services/jobCoreService";

const PAGE_SIZE = 20;

/** Helper to update job list cache updated_at for needsSync badge */
function updateJobListUpdatedAt(queryClient, jobType, jobId, timestamp) {
  queryClient.setQueriesData(
    { queryKey: [`${jobType}Jobs`] },
    (old) => {
      if (!old) return old;
      if (old.pages) {
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            jobs: page.jobs.map(job =>
              job.id === jobId ? { ...job, updated_at: timestamp } : job
            )
          }))
        };
      }
      if (old.jobs) {
        return {
          ...old,
          jobs: old.jobs.map(job =>
            job.id === jobId ? { ...job, updated_at: timestamp } : job
          )
        };
      }
      return old;
    }
  );
}

// ============================================
// GENERIC HOOKS - Work with any job type
// ============================================

/**
 * Generic jobs query hook
 * @param {string} jobType - Job type (e.g., 'street_post')
 * @param {string} advertiserId - Advertiser ID
 * @param {Object} filters - Optional filters
 */
export function useJobsQuery(jobType, advertiserId, filters = {}) {
  return useQuery(jobsQuery(jobType, advertiserId, filters));
}

/**
 * Generic infinite jobs query hook with pagination
 * @param {string} jobType - Job type
 * @param {string} advertiserId - Advertiser ID
 * @param {Object} filters - Optional filters
 */
export function useJobsInfiniteQuery(jobType, advertiserId, filters = {}) {
  return useInfiniteQuery({
    queryKey: [`${jobType}Jobs`, advertiserId, filters],
    queryFn: ({ pageParam = 0 }) => fetchJobsByType(jobType, advertiserId, {
      ...filters,
      limit: PAGE_SIZE,
      offset: pageParam
    }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.offset + lastPage.limit : undefined,
    initialPageParam: 0,
    refetchInterval: 5000,
  });
}

/**
 * Job output query (works with any job type)
 */
export function useJobOutput(jobId) {
  return useQuery(jobOutputQuery(jobId));
}

/**
 * Generic create job mutation
 * @param {string} jobType - Job type
 */
export function useCreateJobMutation(jobType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ createdBy, inputData }) => createJob(jobType, { createdBy, inputData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${jobType}Jobs`] });
    }
  });
}

/**
 * Cancel job mutation (works with any job type)
 * @param {string} jobType - Job type (for cache invalidation)
 */
export function useCancelJobMutation(jobType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId) => cancelJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${jobType}Jobs`] });
    }
  });
}

/**
 * Generic related jobs query
 * @param {string} jobType - Job type
 * @param {string} advertiserId - Advertiser ID
 * @param {Object} filterKey - Custom filter key (e.g., { postcode, street })
 * @param {string} cacheQueryKey - Query key for cache lookup (e.g., 'streetPostJobs')
 */
export function useRelatedJobsQuery(jobType, advertiserId, filterKey, cacheQueryKey) {
  const queryClient = useQueryClient();

  // Try to get jobs from cache first
  const cachedData = queryClient.getQueryData([cacheQueryKey || `${jobType}Jobs`, advertiserId, {}]);

  // Filter cached jobs that match the filterKey
  const cachedJobs = cachedData?.jobs?.filter((j) => {
    return Object.entries(filterKey).every(
      ([key, value]) => j.input_data?.[key] === value
    ) && j.status === "completed";
  }) || [];

  // Use backend query as fallback when cache is empty
  const allKeysValid = Object.values(filterKey).every(v => !!v);
  const { data: fetchedData, isLoading } = useQuery({
    ...relatedJobsQuery(jobType, advertiserId, filterKey),
    enabled: cachedJobs.length === 0 && allKeysValid && !!advertiserId,
  });

  const jobs = cachedJobs.length > 0 ? cachedJobs : (fetchedData?.jobs || []);

  return { jobs, isLoading: cachedJobs.length === 0 && isLoading };
}

/**
 * Revision history for a specific field
 * Polls every 3s when there's a pending remix
 */
export function useFieldRevisionHistory(jobId, fieldName) {
  return useQuery({
    queryKey: ["revisions", jobId, "history", fieldName],
    queryFn: () => fetchRevisionHistory(jobId, fieldName),
    enabled: !!jobId && !!fieldName,
    refetchInterval: (data) => {
      const hasPending = data.state.data?.revisions?.some(r => r.is_pending) ?? false;
      return hasPending ? 3000 : false;
    }
  });
}

/**
 * Create remix job mutation
 * @param {string} remixType - Remix job type (e.g., 'street_post_remix')
 * @param {string} jobType - Original job type (for cache invalidation)
 */
export function useCreateRemixJobMutation(remixType, jobType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => createRemixJobByType(remixType, params),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`${jobType}Jobs`] });
      queryClient.invalidateQueries({ queryKey: ["revisions", variables.originalJobId] });
    }
  });
}

/**
 * Update revision content mutation
 * @param {string} jobType - Job type (for cache update, e.g., 'street_post')
 */
export function useUpdateRevisionMutation(jobType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ revisionId, content }) => updateRevisionContent(revisionId, content),
    onSuccess: (_, { jobId }) => {
      const now = new Date().toISOString();
      queryClient.invalidateQueries({ queryKey: ["revisions"] });
      if (jobId) {
        queryClient.setQueryData(["jobOutput", jobId], (old) =>
          old ? { ...old, updated_at: now } : old
        );
        // Update job list cache
        if (jobType) {
          updateJobListUpdatedAt(queryClient, jobType, jobId, now);
        }
      }
    }
  });
}

/**
 * Update original job result field mutation
 * @param {string} jobType - Job type (for cache update, e.g., 'street_post')
 */
export function useUpdateJobResultMutation(jobType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, fieldName, content }) => updateJobResultField(jobId, fieldName, content),
    onSuccess: (_, { jobId }) => {
      const now = new Date().toISOString();
      queryClient.invalidateQueries({ queryKey: ["jobOutput", jobId] });
      queryClient.invalidateQueries({ queryKey: ["revisions", jobId] });
      queryClient.setQueryData(["jobOutput", jobId], (old) =>
        old ? { ...old, updated_at: now } : old
      );
      // Update job list cache
      if (jobType) {
        updateJobListUpdatedAt(queryClient, jobType, jobId, now);
      }
    }
  });
}

/**
 * Track in-progress remix jobs for a specific original job
 * @param {string} remixType - Remix job type
 * @param {string} originalJobId - Original job ID
 */
export function useRemixJobsInProgress(remixType, originalJobId) {
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
    if (prevHadJobsRef.current && !hasInProgress) {
      queryClient.invalidateQueries({ queryKey: ["revisions", originalJobId] });
      // Bump updated_at for needsSync detection when remix completes
      queryClient.setQueryData(["jobOutput", originalJobId], (old) =>
        old ? { ...old, updated_at: new Date().toISOString() } : old
      );
    }
    prevHadJobsRef.current = hasInProgress;
  }, [hasInProgress, originalJobId, queryClient]);

  return {
    jobs,
    fieldStatus,
    isLoading,
    hasInProgress
  };
}

/**
 * Update selected revision version for a field
 * @param {string} jobType - Job type (for cache update, e.g., 'street_post')
 */
export function useUpdateSelectedVersionMutation(jobType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, fieldName, version }) => updateSelectedVersion(jobId, fieldName, version),
    onMutate: async (variables) => {
      const { jobId, fieldName, version } = variables;
      const queryKey = ["revisions", jobId, "history", fieldName];
      const now = new Date().toISOString();

      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        selected_version: version
      }));

      // Optimistically update jobOutput.updated_at for needsSync detection
      queryClient.setQueryData(["jobOutput", jobId], (old) =>
        old ? { ...old, updated_at: now } : old
      );

      // Also update job list cache updated_at for needsSync badge
      if (jobType) {
        updateJobListUpdatedAt(queryClient, jobType, jobId, now);
      }

      return { previousData, queryKey, jobId };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    }
  });
}

/**
 * Publish job content to blog post (create, update, or unpublish)
 * @param {string} jobType - Job type (for cache update, e.g., 'street_post')
 */
export function usePublishJobMutation(jobType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, unpublish }) => publishJob(jobId, { unpublish }),
    onSuccess: (response, { jobId }) => {
      const { blog_post_id, is_published } = response;
      const now = new Date().toISOString();

      // Update job output cache
      queryClient.setQueryData(["jobOutput", jobId], (old) =>
        old ? {
          ...old,
          output_data: {
            ...old.output_data,
            result: {
              ...old.output_data?.result,
              blog_post_id: String(blog_post_id),
              is_published: String(is_published),
              blog_synced_at: is_published ? now : old.output_data?.result?.blog_synced_at,
            }
          }
        } : old
      );

      // Update job list cache if jobType is provided
      if (jobType) {
        queryClient.setQueriesData(
          { queryKey: [`${jobType}Jobs`] },
          (old) => {
            if (!old) return old;

            // Handle infinite query structure (pages array)
            if (old.pages) {
              return {
                ...old,
                pages: old.pages.map(page => ({
                  ...page,
                  jobs: page.jobs.map(job =>
                    job.id === jobId
                      ? {
                          ...job,
                          blog_post_id: String(blog_post_id),
                          is_published,
                          blog_synced_at: is_published ? now : job.blog_synced_at,
                        }
                      : job
                  )
                }))
              };
            }

            // Handle regular query structure
            if (old.jobs) {
              return {
                ...old,
                jobs: old.jobs.map(job =>
                  job.id === jobId
                    ? {
                        ...job,
                        blog_post_id: String(blog_post_id),
                        is_published,
                        blog_synced_at: is_published ? now : job.blog_synced_at,
                      }
                    : job
                )
              };
            }

            return old;
          }
        );
      }
    }
  });
}
