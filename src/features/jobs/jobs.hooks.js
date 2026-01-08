import { useRef, useEffect } from "react";
import { useQuery, useQueries, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { streetPostJobsQuery, jobOutputQuery, streetPostEstimateQuery, relatedJobsQuery } from "./jobs.queries";
import {
  createStreetPostJob,
  cancelJob,
  fetchJobsByAdvertiserId,
  createRemixJob,
  fetchRevisionHistory,
  updateRevisionContent,
  updateJobResultField,
  fetchRemixJobsInProgress
} from "@/services/jobsService";

export function useStreetPostJobs(advertiserId, filters = {}) {
  return useQuery(streetPostJobsQuery(advertiserId, filters));
}

const PAGE_SIZE = 20;

export function useStreetPostJobsInfinite(advertiserId, filters = {}) {
  return useInfiniteQuery({
    queryKey: ["streetPostJobs", advertiserId, filters],
    queryFn: ({ pageParam = 0 }) => fetchJobsByAdvertiserId(advertiserId, {
      ...filters,
      limit: PAGE_SIZE,
      offset: pageParam
    }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.offset + lastPage.limit : undefined,
    initialPageParam: 0,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
}

export function useJobOutput(jobId) {
  return useQuery(jobOutputQuery(jobId));
}

export function useCreateStreetPostJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStreetPostJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streetPostJobs"] });
    }
  });
}

export function useCancelJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId) => cancelJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streetPostJobs"] });
    }
  });
}

/**
 * Fetch estimates for multiple street post items
 * @param {Array} items - Array of { id, postcode, street }
 * @returns {Object} { estimates: Map<id, costUSD>, totalEstimate, isLoading }
 */
export function useStreetPostEstimates(items = []) {
  const queries = useQueries({
    queries: items.map((item) => ({
      ...streetPostEstimateQuery({ postcode: item.postcode, street: item.street }),
      select: (data) => ({
        id: item.id,
        costUSD: data?.estimate?.cost?.typicalTotalCostUSD ?? null
      })
    }))
  });

  const isLoading = queries.some((q) => q.isLoading);

  // Build map of id -> costUSD
  const estimates = new Map();
  let totalEstimate = 0;

  for (const query of queries) {
    if (query.data) {
      estimates.set(query.data.id, query.data.costUSD);
      if (query.data.costUSD != null) {
        totalEstimate += query.data.costUSD;
      }
    }
  }

  return { estimates, totalEstimate, isLoading };
}

// Get related jobs (same postcode-street) from cache or backend
export function useRelatedJobs(postcode, street, advertiserId) {
  const queryClient = useQueryClient();

  // Try to get jobs from cache first
  const cachedData = queryClient.getQueryData(["streetPostJobs", advertiserId, {}]);

  // If cache has jobs, filter locally
  const cachedJobs = cachedData?.jobs?.filter(
    (j) =>
      j.input_data?.postcode === postcode &&
      j.input_data?.street === street &&
      j.status === "completed"
  ) || [];

  // Use backend query as fallback when cache is empty
  const { data: fetchedData, isLoading } = useQuery({
    ...relatedJobsQuery({ postcode, street, advertiserId }),
    enabled: cachedJobs.length === 0 && !!postcode && !!street && !!advertiserId,
  });

  const jobs = cachedJobs.length > 0 ? cachedJobs : (fetchedData?.jobs || []);

  return { jobs, isLoading: cachedJobs.length === 0 && isLoading };
}

// Revision history for a specific field
export function useFieldRevisionHistory(jobId, fieldName) {
  return useQuery({
    queryKey: ["revisions", jobId, "history", fieldName],
    queryFn: () => fetchRevisionHistory(jobId, fieldName),
    enabled: !!jobId && !!fieldName,
  });
}

// Create remix job mutation
export function useCreateRemixJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRemixJob,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["streetPostJobs"] });
      queryClient.invalidateQueries({ queryKey: ["revisions", variables.originalJobId] });
    }
  });
}

// Update revision content mutation
export function useUpdateRevisionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ revisionId, content }) => updateRevisionContent(revisionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revisions"] });
    }
  });
}

// Update original job result field mutation
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

// Track in-progress remix jobs for a specific original job
export function useRemixJobsInProgress(originalJobId) {
  const queryClient = useQueryClient();
  const prevHadJobsRef = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ["remixJobsInProgress", originalJobId],
    queryFn: () => fetchRemixJobsInProgress(originalJobId),
    enabled: !!originalJobId,
    refetchInterval: 3000, // Poll every 3 seconds for faster feedback
  });

  const jobs = data?.jobs || [];

  // Map of fieldName -> job status for easy lookup
  const fieldStatus = {};
  for (const job of jobs) {
    const fieldName = job.input_data?.field_name;
    if (fieldName) {
      fieldStatus[fieldName] = job.status;
    }
  }

  const hasInProgress = jobs.length > 0;

  // When remix jobs complete (had jobs -> no jobs), invalidate revision history
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
