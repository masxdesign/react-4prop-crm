import React, { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchCompanyAdvertisers } from '../api';
import { useBookingExpand } from './BookingExpandContext';
import ExpandableAdvertiserBookingRow from './ExpandableAdvertiserBookingRow';
import { format } from 'date-fns';

const BookingHistoryByAdvertiserTable = ({ companyId, status }) => {
  const { toggleAgency, isAgencyExpanded } = useBookingExpand();
  const parentRef = useRef(null);

  // Infinite query for advertisers
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['company-advertisers', companyId, status],
    queryFn: ({ pageParam }) =>
      fetchCompanyAdvertisers(companyId, {
        status,
        cursor: pageParam,
        pageSize: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  // Flatten all pages of advertisers
  const allAdvertisers = data?.pages.flatMap((page) => page.data) ?? [];

  // Virtualizer for advertisers
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allAdvertisers.length + 1 : allAdvertisers.length,
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
      lastItem.index >= allAdvertisers.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allAdvertisers.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  const handleRowClick = (advertiser) => {
    toggleAgency(advertiser.advertiser_id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12 text-destructive">
        Error loading advertisers
      </div>
    );
  }

  if (allAdvertisers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No advertisers found
      </div>
    );
  }

  return (
    <div ref={parentRef} className="border rounded-lg overflow-auto max-h-[calc(100vh-300px)]">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Advertiser Name</TableHead>
            <TableHead className="text-center">Total Bookings</TableHead>
            <TableHead className="text-center">Active</TableHead>
            <TableHead className="text-center">Upcoming</TableHead>
            <TableHead className="text-center">Past</TableHead>
            <TableHead>Date Range</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <tr>
            <td colSpan={7} style={{ padding: 0, border: 0 }}>
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const isLoaderRow = virtualRow.index > allAdvertisers.length - 1;
                  const advertiser = allAdvertisers[virtualRow.index];
                  const isExpanded = advertiser && isAgencyExpanded(advertiser.advertiser_id);

                  return (
                    <React.Fragment key={virtualRow.index}>
                      <TableRow
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        className={
                          isLoaderRow
                            ? ''
                            : 'hover:bg-muted/50 cursor-pointer transition-colors'
                        }
                        onClick={() => !isLoaderRow && handleRowClick(advertiser)}
                      >
                        {isLoaderRow ? (
                          <TableCell colSpan={7} className="text-center flex-1">
                            <Loader2 className="h-4 w-4 animate-spin inline-block text-muted-foreground" />
                          </TableCell>
                        ) : (
                          <>
                            <TableCell className="w-[40px] flex-shrink-0">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </TableCell>
                            <TableCell className="flex-1 font-medium">
                              {advertiser.advertiser_company || 'N/A'}
                            </TableCell>
                            <TableCell className="w-[120px] text-center flex-shrink-0">
                              {advertiser.booking_count}
                            </TableCell>
                            <TableCell className="w-[80px] text-center flex-shrink-0">
                              {advertiser.active_bookings}
                            </TableCell>
                            <TableCell className="w-[100px] text-center flex-shrink-0">
                              {advertiser.upcoming_bookings}
                            </TableCell>
                            <TableCell className="w-[80px] text-center flex-shrink-0">
                              {advertiser.past_bookings}
                            </TableCell>
                            <TableCell className="flex-1">
                              {advertiser.earliest_booking_date && advertiser.latest_booking_date ? (
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(advertiser.earliest_booking_date), 'dd MMM yyyy')} -{' '}
                                  {format(new Date(advertiser.latest_booking_date), 'dd MMM yyyy')}
                                </span>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                      {!isLoaderRow && isExpanded && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start + virtualRow.size}px)`,
                          }}
                        >
                          <ExpandableAdvertiserBookingRow
                            advertiser={advertiser}
                            companyId={companyId}
                            status={status}
                            colSpan={7}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </td>
          </tr>
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingHistoryByAdvertiserTable;
