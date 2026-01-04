import { queryOptions } from "@tanstack/react-query";
import { fetchJobsByAdvertiserId, fetchJobOutput } from "@/services/jobsService";

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
