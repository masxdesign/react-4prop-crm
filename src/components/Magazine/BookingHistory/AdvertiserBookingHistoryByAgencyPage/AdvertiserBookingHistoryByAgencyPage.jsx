import React from 'react';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchAdvertiserById } from '@/components/Magazine/api';
import { useAuth } from '@/components/Auth/Auth-context';
import BookingHistoryByAgencyTable from '../BookingHistoryByAgencyTable';
import BookingStatusFilter from '../BookingStatusFilter';
import { BookingExpandProvider } from '../BookingExpandContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, List } from 'lucide-react';

/**
 * AdvertiserBookingHistoryByAgencyPage Component
 *
 * Displays booking history for a specific advertiser grouped by agency.
 * Shows status filter tabs and virtualized agency list with expandable bookings.
 * Uses infinite scrolling for both agencies and bookings.
 *
 * Props passed from route file:
 * - search: URL search params (status)
 * - advertiserId: The advertiser ID from route params
 */
const AdvertiserBookingHistoryByAgencyPage = ({ search: propSearch, advertiserId: propAdvertiserId }) => {
  const auth = useAuth();
  // Use prop if provided, otherwise fall back to useParams for backwards compatibility
  const params = useParams({ strict: false });
  const advertiserId = propAdvertiserId || params.id || params.advertiserId;
  const navigate = useNavigate();

  // Use prop search if provided, otherwise use useSearch as fallback
  const routeSearch = useSearch({ strict: false });
  const search = propSearch || routeSearch || {};

  // Default values for search params
  const status = search.status || 'all';

  // Fetch advertiser details for super admin to display name
  const { data: advertiserData } = useQuery({
    queryKey: ['advertiser', advertiserId],
    queryFn: () => fetchAdvertiserById(advertiserId),
    enabled: !!advertiserId && auth.user?.is_admin,
  });

  // Get advertiser name from API response (structure: {data: {...}, success: true})
  const advertiserName = advertiserData?.data?.company;

  // Handle status change
  const handleStatusChange = (newStatus) => {
    navigate({ search: { status: newStatus } });
  };

  // Navigate to chronological view
  const handleViewAllBookings = () => {
    navigate({
      to: '/advertiser/$id/bookings',
      params: { id: advertiserId },
      search: { status }
    });
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
    <BookingExpandProvider>
      <div className="flex flex-col gap-6 p-6 w-full mx-auto min-w-0">
        {/* Header */}
        <div className="flex flex-col gap-2">
          {auth.user?.is_admin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({
                to: '/advertiser',
                search: {
                  ...(search.returnPage ? { page: search.returnPage } : {}),
                  ...(search.returnSearch ? { search: search.returnSearch } : {})
                }
              })}
              className="self-start -ml-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Advertisers
            </Button>
          )}
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900">Booking History by Agency</h1>
              {auth.user?.is_admin && advertiserName && (
                <p className="text-sm text-gray-600 mt-1">{advertiserName}</p>
              )}
              {!auth.user?.is_admin && (
                <p className="text-sm text-gray-600 mt-1">
                  View your bookings grouped by agency
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAllBookings}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              View All Bookings
            </Button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <BookingStatusFilter
          currentStatus={status}
          onStatusChange={handleStatusChange}
        />

        {/* Agencies Table with Expandable Bookings */}
        <BookingHistoryByAgencyTable
          advertiserId={advertiserId}
          status={status}
        />
      </div>
    </BookingExpandProvider>
  );
};

export default AdvertiserBookingHistoryByAgencyPage;
