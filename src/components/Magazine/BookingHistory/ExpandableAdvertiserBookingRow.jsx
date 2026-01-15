import { format } from 'date-fns';
import BookingStatusBadge from './BookingStatusBadge';
import { pluralizeWeeks } from '../util/pluralize';
import propertyParse from '@/utils/propertyParse';
import { fetchAdvertiserBookingsForCompany } from '../api';
import VirtualizedInfiniteTable from '@/components/ui-custom/VirtualizedInfiniteTable';

const ExpandableAdvertiserBookingRow = ({ item, advertiser: advertiserProp, companyId, status }) => {
  const advertiser = item || advertiserProp;

  const columns = [
    {
      key: 'startDate',
      header: 'Start Date',
      flex: 1,
      minWidth: '120px',
      render: (booking) =>
        booking.start_date
          ? format(new Date(booking.start_date), 'dd MMM yyyy')
          : 'N/A',
    },
    {
      key: 'property',
      header: 'Property',
      flex: 2,
      minWidth: '200px',
      render: (booking) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900">
            {propertyParse.addressText({
              showMore: true,
              showBuilding: true,
              showPostcode: true,
            })(booking) || 'N/A'}
          </span>
          <span className="font-mono text-xs text-gray-500">
            ID: {booking.pid || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      flex: 1,
      minWidth: '80px',
      render: (booking) =>
        booking.week_no ? pluralizeWeeks(booking.week_no) : 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      flex: 1,
      minWidth: '100px',
      render: (booking) => <BookingStatusBadge status={booking.status} />,
    },
  ];

  return (
    <div className="bg-muted/30">
      <div className="px-4 py-2">
        <VirtualizedInfiniteTable
          queryKey={['advertiser-bookings', companyId, advertiser.advertiser_id, status]}
          queryFn={({ pageParam, pageSize }) =>
            fetchAdvertiserBookingsForCompany(companyId, advertiser.advertiser_id, {
              status,
              cursor: pageParam,
              pageSize,
            })
          }
          columns={columns}
          getRowKey={(booking) => booking.id || `${booking.pid}-${booking.start_date}`}
          emptyMessage="No bookings found"
          errorMessage="Error loading bookings"
        />
      </div>
    </div>
  );
};

export default ExpandableAdvertiserBookingRow;
