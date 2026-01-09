import { createFileRoute, redirect } from '@tanstack/react-router';
import AgencyBookingHistoryByAdvertiserPage from '@/components/Magazine/BookingHistory/AgencyBookingHistoryByAdvertiserPage/AgencyBookingHistoryByAdvertiserPage';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/_auth/_dashboard/agency/$id/bookings/by-advertiser')({
  validateSearch: (search) => ({
    status: search.status || 'all',
    returnPage: search.returnPage ? Number(search.returnPage) : undefined,
    returnSearch: search.returnSearch || '',
  }),
  beforeLoad: ({ context, params }) => {
    const { id: agencyId } = params;
    const auth = context.auth;

    // Permission check: admin or owns this cid
    const canView =
      auth.user?.is_admin ||
      (auth.isAgent && `${auth.user?.cid}` === `${agencyId}`);

    if (!canView) {
      throw redirect({ to: '/agency' });
    }

    return {
      ...context,
      isAdvertiser: false,
    };
  },
  pendingComponent: () => (
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-gray-700 font-medium">Loading advertisers...</span>
      </div>
    </div>
  ),
  component: function AgencyBookingsByAdvertiserRoute() {
    const { id: companyId } = Route.useParams();
    const search = Route.useSearch();
    return <AgencyBookingHistoryByAdvertiserPage search={search} companyId={companyId} />;
  },
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Advertisers</h2>
        <p className="text-gray-600">{error.message || 'Failed to load advertiser booking history'}</p>
      </div>
    </div>
  ),
});
