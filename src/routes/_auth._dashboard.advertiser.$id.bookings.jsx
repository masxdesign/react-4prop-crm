import { createFileRoute, redirect } from '@tanstack/react-router';
import { fetchAdvertiserBookings } from '@/components/Magazine/api';
import AdvertiserBookingHistoryPage from '@/components/Magazine/BookingHistory/AdvertiserBookingHistoryPage/AdvertiserBookingHistoryPage';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/_auth/_dashboard/advertiser/$id/bookings')({
  validateSearch: (search) => ({
    status: search.status || 'all',
    page: search.page || 1,
    pageSize: search.pageSize || 10,
    returnPage: search.returnPage ? Number(search.returnPage) : undefined,
    returnSearch: search.returnSearch || '',
  }),
  beforeLoad: ({ context, params, search }) => {
    const { id: advertiserId } = params;
    const { status = 'all', page = 1, pageSize = 10 } = search;
    const auth = context.auth;

    // Permission check: admin or owns this advertiser_id
    const canView =
      auth.user?.is_admin ||
      (auth.isAdvertiser && `${auth.user?.advertiser_id}` === `${advertiserId}`);

    if (!canView) {
      throw redirect({ to: '/advertiser' });
    }

    const queryOptions = {
      queryKey: ['bookings', 'advertiser', advertiserId, status, page, pageSize],
      queryFn: () => fetchAdvertiserBookings(advertiserId, { status, page, pageSize }),
      enabled: !!advertiserId,
      staleTime: 1000 * 30,
    };

    return {
      ...context,
      bookingsQueryOptions: queryOptions,
      isAdvertiser: true,
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
  component: function AdvertiserBookingsRoute() {
    const { id: advertiserId } = Route.useParams();
    const search = Route.useSearch();
    const { bookingsQueryOptions } = Route.useRouteContext();
    return <AdvertiserBookingHistoryPage search={search} advertiserId={advertiserId} bookingsQueryOptions={bookingsQueryOptions} />;
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
