import { useQueries } from "@tanstack/react-query";
import { streetPostEstimateQuery } from "./jobs.queries";
import {
  useJobsQuery,
  useJobsInfiniteQuery,
  useJobOutput,
  useCreateJobMutation,
  useCancelJobMutation as useCancelJobMutationCore,
  useRelatedJobsQuery,
  useFieldRevisionHistory,
  useCreateRemixJobMutation as useCreateRemixJobMutationCore,
  useUpdateRevisionMutation,
  useUpdateJobResultMutation,
  useRemixJobsInProgress,
  useUpdateSelectedVersionMutation
} from "@/features/jobCore";

// ============================================
// STREET-POST SPECIFIC HOOKS
// These wrap the generic hooks with street-post defaults
// ============================================

const STREET_POST_TYPE = 'street_post';
const STREET_POST_REMIX_TYPE = 'street_post_remix';

/**
 * Fetch street post jobs for an advertiser
 */
export function useStreetPostJobs(advertiserId, filters = {}) {
  return useJobsQuery(STREET_POST_TYPE, advertiserId, filters);
}

/**
 * Fetch street post jobs with infinite scroll pagination
 */
export function useStreetPostJobsInfinite(advertiserId, filters = {}) {
  return useJobsInfiniteQuery(STREET_POST_TYPE, advertiserId, filters);
}

/**
 * Create a new street post job
 */
export function useCreateStreetPostJobMutation() {
  return useCreateJobMutation(STREET_POST_TYPE);
}

/**
 * Cancel a job (backward compatible - invalidates street post jobs)
 */
export function useCancelJobMutation() {
  return useCancelJobMutationCore(STREET_POST_TYPE);
}

/**
 * Get related jobs (same postcode-street) from cache or backend
 */
export function useRelatedJobs(postcode, street, advertiserId) {
  return useRelatedJobsQuery(
    STREET_POST_TYPE,
    advertiserId,
    { postcode, street },
    'streetPostJobs'
  );
}

/**
 * Create a street post remix job
 */
export function useCreateRemixJobMutation() {
  return useCreateRemixJobMutationCore(STREET_POST_REMIX_TYPE, STREET_POST_TYPE);
}

/**
 * Track in-progress street post remix jobs
 */
export function useStreetPostRemixJobsInProgress(originalJobId) {
  return useRemixJobsInProgress(STREET_POST_REMIX_TYPE, originalJobId);
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

// ============================================
// RE-EXPORT GENERIC HOOKS
// These work with any job type and are re-exported for convenience
// ============================================

export {
  useJobOutput,
  useFieldRevisionHistory,
  useUpdateRevisionMutation,
  useUpdateJobResultMutation,
  useUpdateSelectedVersionMutation
};
