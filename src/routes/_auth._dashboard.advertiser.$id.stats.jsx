import { createFileRoute, redirect } from '@tanstack/react-router';
import { subDays, format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { fetchAdvertiserStats } from '@/components/Stats/api';
import AdvertiserStatsPage from '@/components/Stats/AdvertiserStatsPage/AdvertiserStatsPage';

export const Route = createFileRoute('/_auth/_dashboard/advertiser/$id/stats')({
  validateSearch: (search) => ({
    startDate: search.startDate || format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: search.endDate || format(new Date(), 'yyyy-MM-dd'),
  }),
  beforeLoad: ({ context, params, search }) => {
    const { id: advertiserId } = params;
    const { startDate, endDate } = search;
    const auth = context.auth;

    // Permission check: admin or owns this advertiser_id
    const canView =
      auth.user?.is_admin ||
      (auth.isAdvertiser && `${auth.user?.advertiser_id}` === `${advertiserId}`);

    if (!canView) {
      throw redirect({ to: '/advertiser' });
    }

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
  pendingComponent: () => (
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-gray-700 font-medium">Loading statistics...</span>
      </div>
    </div>
  ),
  component: function AdvertiserStatsRoute() {
    const { id: advertiserId } = Route.useParams();
    const search = Route.useSearch();
    return <AdvertiserStatsPage search={search} advertiserId={advertiserId} />;
  },
});
