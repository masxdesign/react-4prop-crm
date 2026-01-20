import { fetchSchedulerQueries } from '@/services/propertySchedulerService'

export const schedulerQueriesQueryOptions = () => ({
  queryKey: ['property-scheduler', 'queries'],
  queryFn: fetchSchedulerQueries,
})
