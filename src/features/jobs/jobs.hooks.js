import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { streetPostJobsQuery, jobOutputQuery, streetPostEstimateQuery, relatedJobsQuery } from "./jobs.queries";
import { createStreetPostJob, cancelJob } from "@/services/jobsService";

export function useStreetPostJobs(advertiserId, filters = {}) {
  return useQuery(streetPostJobsQuery(advertiserId, filters));
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
