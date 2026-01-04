import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { streetPostJobsQuery, jobOutputQuery } from "./jobs.queries";
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
