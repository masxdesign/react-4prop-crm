import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/components/Auth/Auth';
import { fetchAdvertiserBookings, fetchAgentBookings } from '@/components/Magazine/api';
import BookingHistoryTable from '@/components/Magazine/BookingHistory/BookingHistoryTable';
import BookingStatusFilter from '@/components/Magazine/BookingHistory/BookingStatusFilter';
import { CalendarCheck } from 'lucide-react';

export const Route = createFileRoute('/_auth/_dashboard/mag/bookings')({
  validateSearch: (search) => ({
    status: search.status || 'all',
  }),
  beforeLoad: ({ context, search }) => {
    const { status = 'all' } = search;
    const auth = context.auth;

    // Determine which endpoint to use based on user role
    const isAdvertiser = auth?.isAdvertiser;
    const userId = isAdvertiser ? auth.user?.advertiser_id : auth.user?.neg_id;

    // Create query options
    const queryOptions = {
      queryKey: ['bookings', isAdvertiser ? 'advertiser' : 'agent', userId, status],
      queryFn: () => {
        if (isAdvertiser) {
          return fetchAdvertiserBookings(userId, status);
        } else {
          return fetchAgentBookings(userId, status);
        }
      },
      enabled: !!userId,
    };

    return {
      ...context,
      bookingsQueryOptions: queryOptions,
      isAdvertiser,
    };
  },
  loader: async ({ context }) => {
    // Preload data using the query options from context
    if (context.bookingsQueryOptions && context.bookingsQueryOptions.enabled) {
      return context.queryClient.ensureQueryData(context.bookingsQueryOptions);
    }

    return null;
  },
  pendingComponent: () => (
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-gray-700 font-medium">Loading bookings...</span>
      </div>
    </div>
  ),
  component: BookingHistoryPage,
});

function BookingHistoryPage() {
  const auth = useAuth();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { isAdvertiser } = Route.useRouteContext();

  // Fetch bookings using the same query key from beforeLoad
  const userId = isAdvertiser ? auth.user?.advertiser_id : auth.user?.neg_id;
  const { data, isLoading, error } = Route.useLoaderData();

  const bookings = data?.data || [];

  // Handle status change
  const handleStatusChange = (newStatus) => {
    navigate({ search: { status: newStatus } });
  };

  // Calculate counts for filter tabs (optional)
  const counts = {
    all: bookings.length,
    active: bookings.filter((b) => b.status === 'active').length,
    upcoming: bookings.filter((b) => b.status === 'upcoming').length,
    past: bookings.filter((b) => b.status === 'past').length,
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Bookings</h2>
          <p className="text-gray-600">{error.message || 'Failed to load booking history'}</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid User</h2>
          <p className="text-gray-600">User ID is required to view booking history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <CalendarCheck className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
          <p className="text-sm text-gray-600 mt-1">
            {isAdvertiser
              ? 'View all your property bookings with active subscriptions'
              : 'View all property bookings from advertisers with active subscriptions'}
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <BookingStatusFilter
        currentStatus={search.status}
        onStatusChange={handleStatusChange}
        counts={counts}
      />

      {/* Bookings Table */}
      <BookingHistoryTable bookings={bookings} isAdvertiser={isAdvertiser} />

      {/* Summary */}
      {bookings.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Showing {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
          {search.status !== 'all' && ` with status: ${search.status}`}
        </div>
      )}
    </div>
  );
}
