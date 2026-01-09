import { queryOptions } from "@tanstack/react-query";
import { fetchJobsByType, fetchJobOutput, fetchRelatedJobsByType } from "@/services/jobCoreService";

/**
 * Generic jobs query factory
 * @param {string} jobType - Job type (e.g., 'street_post')
 * @param {string} advertiserId - Advertiser ID
 * @param {Object} filters - Optional filters
 */
export const jobsQuery = (jobType, advertiserId, filters = {}) => queryOptions({
  queryKey: [`${jobType}Jobs`, advertiserId, filters],
  queryFn: () => fetchJobsByType(jobType, advertiserId, filters),
  refetchInterval: 5000, // Auto-refresh every 5 seconds
});

/**
 * Job output query (generic - works with any job type)
 */
export const jobOutputQuery = (jobId) => queryOptions({
  queryKey: ["jobOutput", jobId],
  queryFn: () => fetchJobOutput(jobId),
  enabled: !!jobId,
});

/**
 * Generic related jobs query factory
 * @param {string} jobType - Job type
 * @param {string} advertiserId - Advertiser ID
 * @param {Object} filterKey - Custom filter key (e.g., { postcode, street })
 */
export const relatedJobsQuery = (jobType, advertiserId, filterKey) => queryOptions({
  queryKey: ["relatedJobs", jobType, advertiserId, filterKey],
  queryFn: () => fetchRelatedJobsByType(jobType, advertiserId, filterKey),
  enabled: !!advertiserId && Object.values(filterKey).every(v => !!v),
  staleTime: 1000 * 60 * 2, // Cache for 2 minutes
});
