import { useMemo } from 'react';
import { format } from 'date-fns';
import BookingStatusBadge from './BookingStatusBadge';
import { pluralizeWeeks } from '../util/pluralize';
import propertyParse from '@/utils/propertyParse';
import VirtualizedInfiniteTable from '@/components/ui-custom/VirtualizedInfiniteTable';

const BookingHistoryTable = ({ queryKey, queryFn, isAdvertiser, onTotalChange }) => {
  const columns = useMemo(() => {
    const baseColumns = [
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
    ];

    // Add role-specific column
    if (isAdvertiser) {
      baseColumns.push({
        key: 'agency',
        header: 'Agency',
        flex: 1,
        minWidth: '150px',
        render: (booking) => (
          <span className="font-medium text-gray-900">
            {booking.agent_company_name || <span className="text-gray-400 italic">N/A</span>}
          </span>
        ),
      });
    } else {
      baseColumns.push({
        key: 'advertiser',
        header: 'Advertiser',
        flex: 1,
        minWidth: '150px',
        render: (booking) => (
          <span className="font-medium text-gray-900">
            {booking.advertiser_company || <span className="text-gray-400 italic">N/A</span>}
          </span>
        ),
      });
    }

    baseColumns.push(
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
      }
    );

    return baseColumns;
  }, [isAdvertiser]);

  return (
    <VirtualizedInfiniteTable
      queryKey={queryKey}
      queryFn={queryFn}
      columns={columns}
      getRowKey={(booking) => booking.id || `${booking.pid}-${booking.start_date}`}
      maxHeight="calc(100vh - 350px)"
      emptyMessage={
        isAdvertiser
          ? "You don't have any active subscriptions yet."
          : "No properties have been booked with active subscriptions yet."
      }
      errorMessage="Error loading bookings"
      onTotalChange={onTotalChange}
    />
  );
};

export default BookingHistoryTable;
