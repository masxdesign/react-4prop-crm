import { createFileRoute, redirect } from '@tanstack/react-router';
import AdvertiserBookingHistoryByAgencyPage from '@/components/Magazine/BookingHistory/AdvertiserBookingHistoryByAgencyPage/AdvertiserBookingHistoryByAgencyPage';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/_auth/_dashboard/advertiser/$id/bookings_/by-agency')({
  validateSearch: (search) => ({
    status: search.status || 'all',
    returnPage: search.returnPage ? Number(search.returnPage) : undefined,
    returnSearch: search.returnSearch || '',
  }),
  beforeLoad: ({ context, params }) => {
    const { id: advertiserId } = params;
    const auth = context.auth;

    // Permission check: admin or owns this advertiser_id
    const canView =
      auth.user?.is_admin ||
      (auth.isAdvertiser && `${auth.user?.advertiser_id}` === `${advertiserId}`);

    if (!canView) {
      throw redirect({ to: '/advertiser' });
    }

    return {
      ...context,
      isAdvertiser: true,
    };
  },
  pendingComponent: () => (
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-gray-700 font-medium">Loading agencies...</span>
      </div>
    </div>
  ),
  component: function AdvertiserBookingsByAgencyRoute() {
    const { id: advertiserId } = Route.useParams();
    const search = Route.useSearch();
    return <AdvertiserBookingHistoryByAgencyPage search={search} advertiserId={advertiserId} />;
  },
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Agencies</h2>
        <p className="text-gray-600">{error.message || 'Failed to load agency booking history'}</p>
      </div>
    </div>
  ),
});
