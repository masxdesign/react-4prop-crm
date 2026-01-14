import React, { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { useBookingExpand } from './BookingExpandContext';
import { format } from 'date-fns';

/**
 * Generic expandable booking history table component
 * Used by both BookingHistoryByAgencyTable and BookingHistoryByAdvertiserTable
 */
const ExpandableBookingHistoryTable = ({
  queryKey,
  fetchFn,
  status,
  entityName, // 'Agency' or 'Advertiser'
  getEntityId, // (item) => item.agent_company_id or item.advertiser_id
  getEntityName, // (item) => item.agent_company_name or item.advertiser_company
  ExpandableRowComponent,
  expandableRowProps = {}, // Additional props to pass to expandable row
}) => {
  const { toggleAgency, isAgencyExpanded } = useBookingExpand();
  const parentRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchFn({
        status,
        cursor: pageParam,
        pageSize: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  // Flatten all pages
  const allItems = data?.pages.flatMap((page) => page.data) ?? [];

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRowClick = (item) => {
    toggleAgency(getEntityId(item));
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
        Error loading {entityName.toLowerCase()}s
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No {entityName.toLowerCase()}s found
      </div>
    );
  }

  return (
    <div ref={parentRef} className="border rounded-lg overflow-auto max-h-[calc(100vh-300px)]">
      {/* Header row */}
      <div className="flex items-center border-b bg-muted/50 sticky top-0 z-10">
        <div className="w-[40px] shrink-0 p-4"></div>
        <div className="flex-1 font-medium text-sm text-muted-foreground p-4">{entityName} Name</div>
        <div className="w-[100px] text-center shrink-0 font-medium text-sm text-muted-foreground p-4">Bookings</div>
        <div className="w-[80px] text-center shrink-0 font-medium text-sm text-muted-foreground p-4">Active</div>
        <div className="w-[100px] text-center shrink-0 font-medium text-sm text-muted-foreground p-4">Upcoming</div>
        <div className="w-[80px] text-center shrink-0 font-medium text-sm text-muted-foreground p-4">Past</div>
        <div className="flex-1 font-medium text-sm text-muted-foreground p-4">Date Range</div>
      </div>

      {/* Data rows */}
      {allItems.map((item) => {
        const entityId = getEntityId(item);
        const isExpanded = isAgencyExpanded(entityId);

        return (
          <React.Fragment key={entityId}>
            <div
              className="flex items-center border-b hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleRowClick(item)}
            >
              <div className="w-[40px] shrink-0 p-4">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 font-medium p-4">
                {getEntityName(item) || 'N/A'}
              </div>
              <div className="w-[100px] text-center shrink-0 p-4">
                {item.booking_count}
              </div>
              <div className="w-[80px] text-center shrink-0 p-4">
                {item.active_bookings}
              </div>
              <div className="w-[100px] text-center shrink-0 p-4">
                {item.upcoming_bookings}
              </div>
              <div className="w-[80px] text-center shrink-0 p-4">
                {item.past_bookings}
              </div>
              <div className="flex-1 p-4">
                {item.earliest_booking_date && item.latest_booking_date ? (
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(item.earliest_booking_date), 'dd MMM yyyy')} -{' '}
                    {format(new Date(item.latest_booking_date), 'dd MMM yyyy')}
                  </span>
                ) : (
                  'N/A'
                )}
              </div>
            </div>
            {isExpanded && (
              <ExpandableRowComponent
                item={item}
                status={status}
                {...expandableRowProps}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-4">
          {isFetchingNextPage && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
};

export default ExpandableBookingHistoryTable;
