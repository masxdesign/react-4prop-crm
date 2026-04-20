import { createFileRoute, redirect } from '@tanstack/react-router';
import { subDays, format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { fetchAgencyStats } from '@/components/Stats/statsPageApi';
import AgencyStatsPage from '@/components/Stats/AgencyStatsPage/AgencyStatsPage';

export const Route = createFileRoute('/_auth/_dashboard/agency/$id/stats')({
  validateSearch: (search) => ({
    startDate: search.startDate || format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: search.endDate || format(new Date(), 'yyyy-MM-dd'),
    returnPage: search.returnPage ? Number(search.returnPage) : undefined,
    returnSearch: search.returnSearch || '',
  }),
  beforeLoad: ({ context, params, search }) => {
    const { id: agencyId } = params;
    const { startDate, endDate } = search;
    const auth = context.auth;

    // Permission check: admin or owns this cid
    const canView =
      auth.user?.is_admin ||
      (auth.isAgent && `${auth.user?.cid}` === `${agencyId}`);

    if (!canView) {
      throw redirect({ to: '/agency' });
    }

    const queryOptions = {
      queryKey: ['agency-stats', agencyId, startDate, endDate],
      queryFn: () => fetchAgencyStats(agencyId, startDate, endDate),
      enabled: !!agencyId,
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
  component: function AgencyStatsRoute() {
    const { id: agencyId } = Route.useParams();
    const search = Route.useSearch();
    return <AgencyStatsPage search={search} agencyId={agencyId} />;
  },
});
