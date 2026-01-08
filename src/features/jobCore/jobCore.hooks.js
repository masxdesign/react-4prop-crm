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
  updateSelectedVersion
} from "@/services/jobCoreService";

const PAGE_SIZE = 20;

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
 */
export function useUpdateRevisionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ revisionId, content }) => updateRevisionContent(revisionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revisions"] });
    }
  });
}

/**
 * Update original job result field mutation
 */
export function useUpdateJobResultMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, fieldName, content }) => updateJobResultField(jobId, fieldName, content),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["jobOutput", variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ["revisions", variables.jobId] });
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
 */
export function useUpdateSelectedVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, fieldName, version }) => updateSelectedVersion(jobId, fieldName, version),
    onMutate: async (variables) => {
      const { jobId, fieldName, version } = variables;
      const queryKey = ["revisions", jobId, "history", fieldName];

      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        selected_version: version
      }));

      return { previousData, queryKey };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    }
  });
}
