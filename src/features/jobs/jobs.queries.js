import { queryOptions } from "@tanstack/react-query";
import { fetchJobsByType, fetchJobOutput } from "@/services/jobCoreService";
import { fetchStreetPostEstimate, fetchRelatedJobs } from "@/services/jobsService";

export const streetPostJobsQuery = (advertiserId, filters = {}) => queryOptions({
  queryKey: ["streetPostJobs", advertiserId, filters],
  queryFn: () => fetchJobsByType("street_post", advertiserId, filters),
  refetchInterval: 5000,
});

export const jobOutputQuery = (jobId) => queryOptions({
  queryKey: ["jobOutput", jobId],
  queryFn: () => fetchJobOutput(jobId),
  enabled: !!jobId,
});

export const streetPostEstimateQuery = ({ postcode, street }) => queryOptions({
  queryKey: ["streetPostEstimate", postcode, street],
  queryFn: () => fetchStreetPostEstimate({ postcode, street }),
  staleTime: 1000 * 60 * 5, // Cache for 5 minutes (estimates don't change often)
});

export const relatedJobsQuery = ({ postcode, street, advertiserId }) => queryOptions({
  queryKey: ["relatedJobs", postcode, street, advertiserId],
  queryFn: () => fetchRelatedJobs({ postcode, street, advertiserId }),
  enabled: !!postcode && !!street && !!advertiserId,
  staleTime: 1000 * 60 * 2, // Cache for 2 minutes
});
