import { createFileRoute, redirect } from '@tanstack/react-router';
import { fetchAgentBookings } from '@/components/Magazine/api';
import AgencyBookingHistoryPage from '@/components/Magazine/BookingHistory/AgencyBookingHistoryPage/AgencyBookingHistoryPage';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/_auth/_dashboard/agency/$id/bookings')({
  validateSearch: (search) => ({
    status: search.status || 'all',
    page: search.page || 1,
    pageSize: search.pageSize || 10,
  }),
  beforeLoad: ({ context, params, search }) => {
    const { id: agencyId } = params;
    const { status = 'all', page = 1, pageSize = 10 } = search;
    const auth = context.auth;

    // Permission check: admin or owns this cid
    const canView =
      auth.user?.is_admin ||
      (auth.isAgent && `${auth.user?.cid}` === `${agencyId}`);

    if (!canView) {
      throw redirect({ to: '/agency' });
    }

    const queryOptions = {
      queryKey: ['bookings', 'agency', agencyId, status, page, pageSize],
      queryFn: () => fetchAgentBookings(agencyId, { status, page, pageSize }),
      enabled: !!agencyId,
    };

    return {
      ...context,
      bookingsQueryOptions: queryOptions,
      isAdvertiser: false,
    };
  },
  loader: async ({ context }) => {
    if (context.bookingsQueryOptions?.enabled) {
      return context.queryClient.ensureQueryData(context.bookingsQueryOptions);
    }
    return null;
  },
  pendingComponent: () => (
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-gray-700 font-medium">Loading bookings...</span>
      </div>
    </div>
  ),
  component: function AgencyBookingsRoute() {
    const { id: agencyId } = Route.useParams();
    const search = Route.useSearch();
    return <AgencyBookingHistoryPage search={search} agencyId={agencyId} />;
  },
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Bookings</h2>
        <p className="text-gray-600">{error.message || 'Failed to load booking history'}</p>
      </div>
    </div>
  ),
});
