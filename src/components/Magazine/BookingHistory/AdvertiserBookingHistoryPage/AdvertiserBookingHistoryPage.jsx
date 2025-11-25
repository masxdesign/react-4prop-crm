import React from 'react';
import { useParams, useSearch, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchAdvertiserBookings, fetchAdvertiserById } from '@/components/Magazine/api';
import { useAuth } from '@/components/Auth/Auth-context';
import BookingHistoryTable from '../BookingHistoryTable';
import BookingStatusFilter from '../BookingStatusFilter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

/**
 * AdvertiserBookingHistoryPage Component
 *
 * Displays booking history for a specific advertiser.
 * Shows status filter tabs and paginated booking history table.
 * All state (status, page) is synced with URL search parameters.
 */
const AdvertiserBookingHistoryPage = () => {
  const auth = useAuth();
  const { advertiserId } = useParams({ from: '/_auth/_dashboard/booking-history/advertiser/$advertiserId' });
  const search = useSearch({ from: '/_auth/_dashboard/booking-history/advertiser/$advertiserId' });
  const navigate = useNavigate({ from: '/booking-history/advertiser/$advertiserId' });

  // Fetch bookings using the same query key from beforeLoad
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'advertiser', advertiserId, search.status, search.page, search.pageSize],
    queryFn: () => fetchAdvertiserBookings(advertiserId, {
      status: search.status,
      page: search.page,
      pageSize: search.pageSize
    }),
    enabled: !!advertiserId,
  });

  // Fetch advertiser details for super admin to display name
  const { data: advertiserData } = useQuery({
    queryKey: ['advertiser', advertiserId],
    queryFn: () => fetchAdvertiserById(advertiserId),
    enabled: !!advertiserId && auth.user?.is_admin,
  });

  const bookings = data?.data || [];
  const pagination = data ? {
    page: data.page,
    pageSize: data.pageSize,
    total: data.total,
    totalPages: data.totalPages
  } : null;

  // Get advertiser name from API response (structure: {data: {...}, success: true})
  const advertiserName = advertiserData?.data?.company;

  // Handle status change
  const handleStatusChange = (newStatus) => {
    navigate({ search: { status: newStatus, page: 1, pageSize: search.pageSize } });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    navigate({ search: { ...search, page: newPage } });
  };

  if (!advertiserId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Advertiser</h2>
          <p className="text-gray-600">Advertiser ID is required to view booking history.</p>
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
          {auth.user?.is_admin && advertiserName && (
            <p className="text-sm text-gray-600 mt-1">{advertiserName}</p>
          )}
          {!auth.user?.is_admin && (
            <p className="text-sm text-gray-600 mt-1">
              View all your property bookings with active subscriptions
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
        isAdvertiser={true}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default AdvertiserBookingHistoryPage;
