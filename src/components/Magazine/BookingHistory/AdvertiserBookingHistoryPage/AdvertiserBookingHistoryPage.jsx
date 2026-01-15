import React, { useState } from 'react';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchAdvertiserBookings, fetchAdvertiserById } from '@/components/Magazine/api';
import { useAuth } from '@/components/Auth/Auth-context';
import BookingHistoryTable from '../BookingHistoryTable';
import BookingStatusFilter from '../BookingStatusFilter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Building2 } from 'lucide-react';

const AdvertiserBookingHistoryPage = ({ search: propSearch, advertiserId: propAdvertiserId }) => {
  const auth = useAuth();
  const params = useParams({ strict: false });
  const advertiserId = propAdvertiserId || params.id || params.advertiserId;
  const navigate = useNavigate();
  const [totalBookings, setTotalBookings] = useState();

  const routeSearch = useSearch({ strict: false });
  const search = propSearch || routeSearch || {};
  const status = search.status || 'all';

  // Fetch advertiser details for super admin to display name
  const { data: advertiserData } = useQuery({
    queryKey: ['advertiser', advertiserId],
    queryFn: () => fetchAdvertiserById(advertiserId),
    enabled: !!advertiserId && auth.user?.is_admin,
  });

  const advertiserName = advertiserData?.data?.company;

  const handleStatusChange = (newStatus) => {
    navigate({ search: { ...search, status: newStatus } });
  };

  const handleViewByAgency = () => {
    navigate({
      to: '/advertiser/$id/bookings/by-agency',
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
    <div className="flex flex-col gap-6 p-6 w-full mx-auto">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewByAgency}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            View by Agency
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <BookingStatusFilter
        currentStatus={status}
        onStatusChange={handleStatusChange}
        currentTotal={totalBookings}
      />

      {/* Bookings Table */}
      <BookingHistoryTable
        queryKey={['bookings', 'advertiser', advertiserId, status]}
        queryFn={({ pageParam, pageSize }) =>
          fetchAdvertiserBookings(advertiserId, {
            status,
            cursor: pageParam,
            pageSize,
          })
        }
        isAdvertiser={true}
        onTotalChange={setTotalBookings}
      />
    </div>
  );
};

export default AdvertiserBookingHistoryPage;
