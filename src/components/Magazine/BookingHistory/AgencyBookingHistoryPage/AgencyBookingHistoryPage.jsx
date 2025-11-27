import React from 'react';
import { useParams, useSearch, useNavigate, useRouteContext } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchAgencyById } from '@/components/Stats/api';
import { useAuth } from '@/components/Auth/Auth-context';
import BookingHistoryTable from '../BookingHistoryTable';
import BookingStatusFilter from '../BookingStatusFilter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

/**
 * AgencyBookingHistoryPage Component
 *
 * Displays booking history for a specific agency.
 * Shows status filter tabs and paginated booking history table.
 * All state (status, page) is synced with URL search parameters.
 */
const AgencyBookingHistoryPage = () => {
  const auth = useAuth();
  const { agencyId } = useParams({ from: '/_auth/_dashboard/booking-history/agency/$agencyId' });
  const search = useSearch({ from: '/_auth/_dashboard/booking-history/agency/$agencyId' });
  const navigate = useNavigate({ from: '/booking-history/agency/$agencyId' });

  // Get query options from route context
  const { bookingsQueryOptions } = useRouteContext({
    from: '/_auth/_dashboard/booking-history/agency/$agencyId'
  });

  // Fetch bookings using preloaded query options from route
  const { data, isLoading } = useQuery(bookingsQueryOptions);

  // Fetch agency details for super admin to display name
  const { data: agencyData } = useQuery({
    queryKey: ['agency', agencyId],
    queryFn: () => fetchAgencyById(agencyId),
    enabled: !!agencyId && auth.user?.is_admin,
  });

  const bookings = data?.data || [];
  const pagination = data ? {
    page: data.page,
    pageSize: data.pageSize,
    total: data.total,
    totalPages: data.totalPages
  } : null;

  // Get agency name from API response (structure: {data: {...}, success: true})
  const agencyName = agencyData?.data?.name;

  // Handle status change
  const handleStatusChange = (newStatus) => {
    navigate({ search: { status: newStatus, page: 1, pageSize: search.pageSize } });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    navigate({ search: { ...search, page: newPage } });
  };

  if (!agencyId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Agency</h2>
          <p className="text-gray-600">Agency ID is required to view booking history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        {auth.user?.is_admin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/booking-history/select' })}
            className="self-start -ml-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Selection
          </Button>
        )}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900">Booking History</h1>
          {auth.user?.is_admin && agencyName && (
            <p className="text-sm text-gray-600 mt-1">{agencyName}</p>
          )}
          {!auth.user?.is_admin && (
            <p className="text-sm text-gray-600 mt-1">
              View all property bookings from advertisers with active subscriptions
            </p>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <BookingStatusFilter
        currentStatus={search.status}
        onStatusChange={handleStatusChange}
        currentTotal={pagination?.total}
      />

      {/* Bookings Table */}
      <BookingHistoryTable
        bookings={bookings}
        isAdvertiser={false}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default AgencyBookingHistoryPage;
