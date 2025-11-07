import { createFileRoute } from '@tanstack/react-router';
import { subDays, format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { fetchAdvertiserStats } from '@/components/Stats/api';
import AdvertiserStatsPage from '@/components/Stats/AdvertiserStatsPage/AdvertiserStatsPage';

export const Route = createFileRoute('/_auth/_dashboard/stats/advertiser/$advertiserId')({
  validateSearch: (search) => ({
    startDate: search.startDate || format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: search.endDate || format(new Date(), 'yyyy-MM-dd'),
  }),
  beforeLoad: ({ context, params, search }) => {
    const { advertiserId } = params;
    const { startDate, endDate } = search;

    const queryOptions = {
      queryKey: ['advertiser-stats', advertiserId, startDate, endDate],
      queryFn: () => fetchAdvertiserStats(advertiserId, startDate, endDate),
      enabled: !!advertiserId,
    };

    return {
      ...context,
      statsQueryOptions: queryOptions,
    };
  },
  loader: async ({ context }) => {
    if (context.statsQueryOptions?.enabled) {
      return context.queryClient.ensureQueryData(context.statsQueryOptions);
    }
    return null;
  },
  pendingComponent: () => (
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-gray-700 font-medium">Loading statistics...</span>
      </div>
    </div>
  ),
  component: AdvertiserStatsPage,
});
