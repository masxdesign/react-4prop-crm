import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Virtualized table with infinite scrolling. */
const VirtualizedInfiniteTable = ({
  queryKey,
  queryFn,
  columns,
  getRowKey,
  pageSize = 20,
  estimateRowSize = 60,
  overscan = 5,
  maxHeight = '400px',
  emptyMessage = 'No data found',
  errorMessage = 'Error loading data',
  className,
  queryOptions = {},
}) => {
  const parentRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn({ pageParam, pageSize }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    ...queryOptions,
  });

  const allItems = data?.pages.flatMap((page) => page.data) ?? [];

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allItems.length + 1 : allItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowSize,
    overscan,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;

    if (
      lastItem.index >= allItems.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allItems.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  const getColumnStyle = (col) => {
    const style = {};
    if (col.width) style.width = col.width;
    if (col.minWidth) style.minWidth = col.minWidth;
    if (col.flex) style.flex = col.flex;
    return style;
  };

  const getColumnClasses = (col) =>
    cn(
      col.align === 'center' && 'text-center',
      col.align === 'right' && 'text-right',
      col.className
    );

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('flex items-center justify-center py-8 text-sm text-destructive', className)}>
        {errorMessage}
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8 text-sm text-muted-foreground', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto border rounded-md bg-background', className)}
      style={{ maxHeight }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-muted sticky top-0 z-50">
        {columns.map((col) => (
          <div
            key={col.key}
            className={cn('text-xs font-medium text-muted-foreground', getColumnClasses(col))}
            style={getColumnStyle(col)}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Virtualized rows */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index > allItems.length - 1;
          const item = allItems[virtualRow.index];

          return (
            <div
              key={isLoaderRow ? 'loader' : getRowKey(item)}
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
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className={cn('text-sm', getColumnClasses(col))}
                      style={getColumnStyle(col)}
                    >
                      {col.render(item)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualizedInfiniteTable;
