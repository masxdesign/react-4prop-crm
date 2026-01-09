import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TableRow, TableCell } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import BookingStatusBadge from './BookingStatusBadge';
import { pluralizeWeeks } from '../util/pluralize';
import propertyParse from '@/utils/propertyParse';
import { fetchAdvertiserBookingsForCompany } from '../api';
import { useBookingExpand } from './BookingExpandContext';

const ExpandableAdvertiserBookingRow = ({ advertiser, companyId, status, colSpan }) => {
  const { isAgencyExpanded } = useBookingExpand();
  const isExpanded = isAgencyExpanded(advertiser.advertiser_id);

  const parentRef = useRef(null);

  // Infinite query for bookings
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['advertiser-bookings', companyId, advertiser.advertiser_id, status],
    queryFn: ({ pageParam }) =>
      fetchAdvertiserBookingsForCompany(companyId, advertiser.advertiser_id, {
        status,
        cursor: pageParam,
        pageSize: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isExpanded, // Only fetch when expanded
  });

  // Flatten all pages of bookings
  const allBookings = data?.pages.flatMap((page) => page.data) ?? [];

  // Virtualizer for bookings
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allBookings.length + 1 : allBookings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  // Fetch next page when scrolled to bottom
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allBookings.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allBookings.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  if (!isExpanded) {
    return null;
  }

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="p-0 bg-muted/30">
        <div className="px-4 py-2">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center py-8 text-sm text-destructive">
              Error loading bookings
            </div>
          )}

          {!isLoading && !isError && allBookings.length === 0 && (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              No bookings found
            </div>
          )}

          {!isLoading && !isError && allBookings.length > 0 && (
            <div
              ref={parentRef}
              className="max-h-[400px] overflow-auto border rounded-md bg-background"
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const isLoaderRow = virtualRow.index > allBookings.length - 1;
                  const booking = allBookings[virtualRow.index];

                  return (
                    <div
                      key={virtualRow.index}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className="border-b"
                    >
                      {isLoaderRow ? (
                        <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 px-4 h-full">
                          <div className="flex-1 min-w-[120px]">
                            <span className="text-sm">
                              {booking.start_date
                                ? format(new Date(booking.start_date), 'dd MMM yyyy')
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex-[2] min-w-[200px]">
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
                          </div>
                          <div className="flex-1 min-w-[80px]">
                            <span className="text-sm">
                              {booking.week_no ? pluralizeWeeks(booking.week_no) : 'N/A'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-[100px]">
                            <BookingStatusBadge status={booking.status} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ExpandableAdvertiserBookingRow;
