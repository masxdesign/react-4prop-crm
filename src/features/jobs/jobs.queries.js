import { queryOptions } from "@tanstack/react-query";
import { fetchJobsByAdvertiserId, fetchJobOutput, fetchStreetPostEstimate } from "@/services/jobsService";

export const streetPostJobsQuery = (advertiserId, filters = {}) => queryOptions({
  queryKey: ["streetPostJobs", advertiserId, filters],
  queryFn: () => fetchJobsByAdvertiserId(advertiserId, filters),
  refetchInterval: 5000,  // Auto-refresh every 5 seconds
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
