import React from 'react';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '@/components/Auth/Auth-context';
import BookingHistoryByAdvertiserTable from '../BookingHistoryByAdvertiserTable';
import BookingStatusFilter from '../BookingStatusFilter';
import { BookingExpandProvider } from '../BookingExpandContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, List } from 'lucide-react';

/**
 * AgencyBookingHistoryByAdvertiserPage Component
 *
 * Displays booking history for a specific agency/company grouped by advertiser.
 * Shows status filter tabs and virtualized advertiser list with expandable bookings.
 * Uses infinite scrolling for both advertisers and bookings.
 *
 * Props passed from route file:
 * - search: URL search params (status)
 * - companyId: The company ID from route params
 */
const AgencyBookingHistoryByAdvertiserPage = ({ search: propSearch, companyId: propCompanyId }) => {
  const auth = useAuth();
  // Use prop if provided, otherwise fall back to useParams for backwards compatibility
  const params = useParams({ strict: false });
  const companyId = propCompanyId || params.id || params.companyId;
  const navigate = useNavigate();

  // Use prop search if provided, otherwise use useSearch as fallback
  const routeSearch = useSearch({ strict: false });
  const search = propSearch || routeSearch || {};

  // Default values for search params
  const status = search.status || 'all';
  const returnPage = search.returnPage;
  const returnSearch = search.returnSearch;

  // Build search params for back navigation
  const getBackSearchParams = () => {
    const params = { tab: 'agencies' };
    if (returnPage) params.page = returnPage;
    if (returnSearch) params.search = returnSearch;
    return params;
  };

  // Navigate to chronological view
  const handleViewAllBookings = () => {
    navigate({
      to: '/agency/$id/bookings',
      params: { id: companyId },
      search: { status }
    });
  };

  // Handle status change
  const handleStatusChange = (newStatus) => {
    navigate({ search: { status: newStatus } });
  };

  if (!companyId) {
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
    <BookingExpandProvider>
      <div className="flex flex-col gap-6 p-6 w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-2">
          {auth.user?.is_admin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/agency', search: getBackSearchParams() })}
              className="self-start -ml-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Agencies
            </Button>
          )}
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900">Booking History by Advertiser</h1>
              <p className="text-sm text-gray-600 mt-1">
                View your bookings grouped by advertiser
              </p>
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

        {/* Advertisers Table with Expandable Bookings */}
        <BookingHistoryByAdvertiserTable
          companyId={companyId}
          status={status}
        />
      </div>
    </BookingExpandProvider>
  );
};

export default AgencyBookingHistoryByAdvertiserPage;
