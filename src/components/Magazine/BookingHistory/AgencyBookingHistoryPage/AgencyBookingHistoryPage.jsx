import React, { useState } from 'react';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchAgencyById } from '@/components/Stats/api';
import { fetchAgencyBookings } from '@/components/Magazine/api';
import { useAuth } from '@/components/Auth/Auth-context';
import BookingHistoryTable from '../BookingHistoryTable';
import BookingStatusFilter from '../BookingStatusFilter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Users } from 'lucide-react';

const AgencyBookingHistoryPage = ({ search: propSearch, agencyId: propAgencyId }) => {
  const auth = useAuth();
  const params = useParams({ strict: false });
  const agencyId = propAgencyId || params.id || params.agencyId;
  const navigate = useNavigate();
  const [totalBookings, setTotalBookings] = useState();

  const routeSearch = useSearch({ strict: false });
  const search = propSearch || routeSearch || {};
  const status = search.status || 'all';

  // Fetch agency details for super admin to display name
  const { data: agencyData } = useQuery({
    queryKey: ['agency', agencyId],
    queryFn: () => fetchAgencyById(agencyId),
    enabled: !!agencyId && auth.user?.is_admin,
  });

  const agencyName = agencyData?.data?.name;

  const handleStatusChange = (newStatus) => {
    navigate({ search: { ...search, status: newStatus } });
  };

  const handleViewByAdvertiser = () => {
    navigate({
      to: '/agency/$id/bookings/by-advertiser',
      params: { id: agencyId },
      search: { status }
    });
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
            onClick={() => navigate({
              to: '/agency',
              search: {
                tab: 'agencies',
                ...(search.returnPage ? { page: search.returnPage } : {}),
                ...(search.returnSearch ? { search: search.returnSearch } : {})
              }
            })}
            className="self-start -ml-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Agencies
          </Button>
        )}
        <div className="flex items-start justify-between">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewByAdvertiser}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            View by Advertiser
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
        queryKey={['bookings', 'company', agencyId, status]}
        queryFn={({ pageParam, pageSize }) =>
          fetchAgencyBookings(agencyId, {
            status,
            cursor: pageParam,
            pageSize,
          })
        }
        isAdvertiser={false}
        onTotalChange={setTotalBookings}
      />
    </div>
  );
};

export default AgencyBookingHistoryPage;
