import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { streetPostJobsQuery, jobOutputQuery, streetPostEstimateQuery } from "./jobs.queries";
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
